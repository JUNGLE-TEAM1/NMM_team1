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

assertPass(
  "explicit no issue exception",
  "- 연결된 Issue: 연결된 issue 없음",
);

assertFail(
  "template comment example only",
  "- 연결된 Issue: <!-- 예: Closes #123 / 연결된 issue 없음 -->",
);

assertFail("empty body", "");

console.log("pr-linked-issue-check tests passed");
