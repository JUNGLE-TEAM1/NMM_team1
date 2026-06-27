const assert = require("assert");

const {
  checkPrLinkedIssue,
  stripHtmlComments,
} = require("../.github/scripts/check-pr-linked-issue");

function assertPass(name, body) {
  const result = checkPrLinkedIssue(body);
  assert.strictEqual(result.ok, true, `${name}: expected pass, got ${result.reason}`);
}

function assertFail(name, body) {
  const result = checkPrLinkedIssue(body);
  assert.strictEqual(result.ok, false, `${name}: expected failure`);
}

assert.strictEqual(
  stripHtmlComments("before <!-- Closes #123 --> after"),
  "before  after",
  "HTML comments should be removed before matching closing keywords",
);

assertPass(
  "real closing keyword",
  [
    "# Pull Request",
    "",
    "- 연결된 Issue: Closes #135",
    "- Branch: docs/system-guardrail-application",
  ].join("\n"),
);

assertPass(
  "cross repository closing keyword",
  "This PR resolves JUNGLE-TEAM1/NMM_team1#135.",
);

assertFail(
  "unapproved no issue exception",
  "- 연결된 Issue: 연결된 issue 없음",
);

assertPass(
  "approved no issue exception",
  [
    "- 연결된 Issue: 연결된 issue 없음",
    "- No Linked Issue Exception: approved",
    "- Reason: post-merge evidence-only correction with no active implementation issue.",
  ].join("\n"),
);

assertPass(
  "approved Korean no issue exception",
  [
    "- 연결된 Issue: 없음",
    "- 연결된 Issue 예외: 승인",
    "- 사유: 이미 merge/finalize된 evidence 정리.",
  ].join("\n"),
);

assertFail(
  "template comment example only",
  "- 연결된 Issue: <!-- 예: Closes #123 / 연결된 issue 없음 -->",
);

assertFail("empty body", "");

console.log("pr-linked-issue-check tests passed");
