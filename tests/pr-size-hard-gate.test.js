const assert = require("assert");

const {
  evaluatePrSizeHardGate,
  hasApprovedOverride,
  isEvidencePath,
  parseNumstat,
} = require("../.github/scripts/check-pr-size-hard-gate");

assert.strictEqual(isEvidencePath("docs/workflows/docs/example/report.md"), true);
assert.strictEqual(isEvidencePath("docs/reports/example.md"), true);
assert.strictEqual(isEvidencePath("docs/system-guardrails.md"), false);

const small = evaluatePrSizeHardGate(parseNumstat("10\t5\tdocs/system-guardrails.md"), "", {
  maxFiles: 10,
  maxLines: 600,
});
assert.strictEqual(small.ok, true);

const tooManyFiles = evaluatePrSizeHardGate(
  parseNumstat(
    Array.from({ length: 11 }, (_, index) => `1\t0\tsrc/file-${index}.js`).join("\n"),
  ),
  "",
  { maxFiles: 10, maxLines: 600 },
);
assert.strictEqual(tooManyFiles.ok, false);
assert.ok(tooManyFiles.failures.some((failure) => failure.includes("file count")));

const tooManyLines = evaluatePrSizeHardGate(parseNumstat("601\t0\tsrc/large.js"), "", {
  maxFiles: 10,
  maxLines: 600,
});
assert.strictEqual(tooManyLines.ok, false);
assert.ok(tooManyLines.failures.some((failure) => failure.includes("line count")));

const evidenceHeavy = evaluatePrSizeHardGate(
  parseNumstat(
    [
      "400\t400\tdocs/workflows/docs/example/report.md",
      "300\t300\tdocs/reports/example.md",
      "10\t0\tdocs/system-guardrails.md",
    ].join("\n"),
  ),
  "",
  { maxFiles: 10, maxLines: 600 },
);
assert.strictEqual(evidenceHeavy.ok, true);
assert.strictEqual(evidenceHeavy.nonEvidenceFiles, 1);
assert.strictEqual(evidenceHeavy.nonEvidenceLines, 10);

const approvedOverride = evaluatePrSizeHardGate(
  parseNumstat("1000\t0\tsrc/large.js"),
  "Large PR Exception: approved\nReason: one-time mechanical rewrite.",
  { maxFiles: 10, maxLines: 600 },
);
assert.strictEqual(approvedOverride.ok, true);
assert.strictEqual(approvedOverride.override, true);

assert.strictEqual(hasApprovedOverride("<!-- Large PR Exception: approved -->"), false);

console.log("pr-size-hard-gate tests passed");
