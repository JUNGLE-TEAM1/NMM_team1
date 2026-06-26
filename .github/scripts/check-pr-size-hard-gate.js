const { execFileSync } = require("child_process");
const fs = require("fs");

const DEFAULT_MAX_FILES = 10;
const DEFAULT_MAX_LINES = 600;
const OVERRIDE_RE = /Large PR Exception:\s*approved/i;
const EVIDENCE_PATH_PATTERNS = [
  /^docs\/workflows\//,
  /^docs\/reports\//,
];

function parseNumstat(output) {
  return String(output || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [additionsRaw, deletionsRaw, ...pathParts] = line.split("\t");
      return {
        additions: Number.parseInt(additionsRaw, 10) || 0,
        deletions: Number.parseInt(deletionsRaw, 10) || 0,
        path: pathParts.join("\t"),
      };
    });
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripHtmlComments(text) {
  return String(text || "").replace(/<!--[\s\S]*?-->/g, "");
}

function isEvidencePath(path) {
  return EVIDENCE_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function hasApprovedOverride(body) {
  return OVERRIDE_RE.test(stripHtmlComments(body));
}

function evaluatePrSizeHardGate(rows, body = "", options = {}) {
  const maxFiles = parsePositiveInteger(options.maxFiles, DEFAULT_MAX_FILES);
  const maxLines = parsePositiveInteger(options.maxLines, DEFAULT_MAX_LINES);
  const nonEvidenceRows = rows.filter((row) => !isEvidencePath(row.path));
  const nonEvidenceFiles = nonEvidenceRows.length;
  const nonEvidenceLines = nonEvidenceRows.reduce(
    (sum, row) => sum + row.additions + row.deletions,
    0,
  );
  const override = hasApprovedOverride(body);
  const failures = [];

  if (nonEvidenceFiles > maxFiles) {
    failures.push(`non-evidence file count ${nonEvidenceFiles} exceeds hard limit ${maxFiles}`);
  }

  if (nonEvidenceLines > maxLines) {
    failures.push(`non-evidence line count ${nonEvidenceLines} exceeds hard limit ${maxLines}`);
  }

  return {
    failures,
    maxFiles,
    maxLines,
    nonEvidenceFiles,
    nonEvidenceLines,
    ok: override || failures.length === 0,
    override,
    totalFiles: rows.length,
    totalLines: rows.reduce((sum, row) => sum + row.additions + row.deletions, 0),
  };
}

function buildSummary(result) {
  const lines = [
    "## PR Size Hard Gate",
    "",
    `- Total changed files: ${result.totalFiles}`,
    `- Total changed lines: ${result.totalLines}`,
    `- Non-evidence files: ${result.nonEvidenceFiles} / ${result.maxFiles}`,
    `- Non-evidence changed lines: ${result.nonEvidenceLines} / ${result.maxLines}`,
    `- Override: ${result.override ? "approved" : "none"}`,
    "",
  ];

  if (result.ok && result.override && result.failures.length > 0) {
    lines.push("Hard gate passed by explicit `Large PR Exception: approved` override.");
  } else if (result.ok) {
    lines.push("Hard gate passed.");
  } else {
    lines.push("Hard gate failed:");
    for (const failure of result.failures) {
      lines.push(`- ${failure}`);
    }
    lines.push("");
    lines.push("Split the PR or add `Large PR Exception: approved` with a reason in the PR body.");
  }

  return `${lines.join("\n")}\n`;
}

function readDiffRows(base, head) {
  if (!base || !head) {
    throw new Error("Both base and head SHAs are required.");
  }

  const mergeBase = execFileSync("git", ["merge-base", base, head], {
    encoding: "utf8",
  }).trim();
  const output = execFileSync("git", ["diff", "--numstat", mergeBase, head], {
    encoding: "utf8",
  });
  return parseNumstat(output);
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
  const base = process.env.BASE_SHA || process.argv[2];
  const head = process.env.HEAD_SHA || process.argv[3];
  const eventPath = process.env.GITHUB_EVENT_PATH || process.argv[4];
  const maxFiles = process.env.PR_SIZE_MAX_FILES || DEFAULT_MAX_FILES;
  const maxLines = process.env.PR_SIZE_MAX_LINES || DEFAULT_MAX_LINES;
  const rows = readDiffRows(base, head);
  const body = readPullRequestBody(eventPath);
  const result = evaluatePrSizeHardGate(rows, body, { maxFiles, maxLines });
  const summary = buildSummary(result);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  } else {
    process.stdout.write(summary);
  }

  if (!result.ok) {
    for (const failure of result.failures) {
      console.error(`::error title=PR size hard gate::${failure}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  buildSummary,
  evaluatePrSizeHardGate,
  hasApprovedOverride,
  isEvidencePath,
  parseNumstat,
  parsePositiveInteger,
  stripHtmlComments,
};
