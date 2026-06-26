const fs = require("fs");

const CLOSING_KEYWORD_RE =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(?:[\w.-]+\/[\w.-]+)?#\d+\b/i;
const EXPLICIT_NO_ISSUE_RE =
  /(?:연결된\s*Issue\s*:\s*(?:연결된\s*issue\s*없음|없음|none|n\/a)|no\s+linked\s+issue)/i;

function stripHtmlComments(text) {
  return String(text || "").replace(/<!--[\s\S]*?-->/g, "");
}

function checkPrLinkedIssue(body) {
  const normalizedBody = stripHtmlComments(body).trim();

  if (!normalizedBody) {
    return {
      ok: false,
      reason: "PR body is empty after removing HTML comments.",
    };
  }

  if (CLOSING_KEYWORD_RE.test(normalizedBody)) {
    return { ok: true, reason: "closing keyword found" };
  }

  if (EXPLICIT_NO_ISSUE_RE.test(normalizedBody)) {
    return { ok: true, reason: "explicit no-issue exception found" };
  }

  return {
    ok: false,
    reason:
      'PR body must include a real closing keyword like "Closes #123" or explicit "연결된 Issue: 연결된 issue 없음".',
  };
}

function readPullRequestBody(eventPath) {
  if (!eventPath) {
    throw new Error("GITHUB_EVENT_PATH or event path argument is required.");
  }

  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  return event.pull_request && typeof event.pull_request.body === "string"
    ? event.pull_request.body
    : "";
}

function runCli() {
  const eventPath = process.argv[2] || process.env.GITHUB_EVENT_PATH;
  const body = readPullRequestBody(eventPath);
  const result = checkPrLinkedIssue(body);

  if (!result.ok) {
    console.error(`::error title=Missing linked issue::${result.reason}`);
    process.exit(1);
  }

  console.log(`PR linked issue check passed: ${result.reason}`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  checkPrLinkedIssue,
  stripHtmlComments,
};
