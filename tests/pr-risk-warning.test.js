const assert = require("assert");

const {
  evaluatePullRequestRisk,
  parseNumstat,
  parsePositiveInteger,
} = require("../.github/scripts/check-pr-risk");

const smallRows = parseNumstat(["10\t2\tdocs/README.md"].join("\n"));
const small = evaluatePullRequestRisk(smallRows, {
  maxFiles: 5,
  maxLines: 200,
});

assert.strictEqual(small.changedFiles, 1);
assert.strictEqual(small.totalLines, 12);
assert.deepStrictEqual(small.warnings, []);

const largeRows = parseNumstat([
  "300\t50\tdocs/01-product-planning.md",
  "200\t80\tdocs/02-architecture.md",
].join("\n"));
const large = evaluatePullRequestRisk(largeRows, {
  maxFiles: 5,
  maxLines: 400,
});

assert.strictEqual(large.changedFiles, 2);
assert.strictEqual(large.totalLines, 630);
assert.ok(
  large.warnings.some((warning) => warning.includes("line count")),
  "large line count should warn",
);

const riskyRows = parseNumstat([
  "2\t1\t.github/workflows/ci.yml",
  "3\t0\tscripts/prepare-pr.sh",
].join("\n"));
const risky = evaluatePullRequestRisk(riskyRows, {
  maxFiles: 5,
  maxLines: 400,
});

assert.strictEqual(risky.riskyFiles.length, 2);
assert.ok(
  risky.warnings.some((warning) => warning.includes("risky paths")),
  "risky paths should warn",
);

const binaryRows = parseNumstat("-\t-\tdocs/sample.png");
assert.strictEqual(binaryRows[0].additions, 0);
assert.strictEqual(binaryRows[0].deletions, 0);

const invalidThreshold = evaluatePullRequestRisk(
  parseNumstat("700\t0\tdocs/01-product-planning.md"),
  {
    maxFiles: "abc",
    maxLines: "abc",
  },
);
assert.ok(
  invalidThreshold.warnings.some((warning) => warning.includes("line count")),
  "invalid thresholds should fall back to defaults instead of disabling warnings",
);

assert.strictEqual(parsePositiveInteger("12", 20), 12);
assert.strictEqual(parsePositiveInteger("0", 20), 20);
assert.strictEqual(parsePositiveInteger("-1", 20), 20);
assert.strictEqual(parsePositiveInteger("abc", 20), 20);

console.log("pr-risk-warning tests passed");
