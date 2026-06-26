const assert = require("assert");

const {
  changedCategories,
  evaluateMigrationSchemaSecurity,
  isFilledImpact,
  sectionValue,
} = require("../.github/scripts/check-migration-schema-security");

const filledBody = [
  "## 4. 영향 범위",
  "",
  "- UI 영향: 없음",
  "- API/schema 영향: contracts 변경으로 ExecutionResult schema 검증 필요. `node tests/contracts.test.js` 통과.",
  "- data/migration 영향: 새 migration `001_init.sql` 적용과 rollback 확인.",
  "- security/privacy 영향: auth policy 변경. 권한 거부 smoke 확인.",
].join("\n");

assert.strictEqual(
  sectionValue(filledBody, "API/schema 영향").startsWith("contracts 변경"),
  true,
);
assert.strictEqual(isFilledImpact("없음"), false);
assert.strictEqual(isFilledImpact("schema 변경과 contract test 확인"), true);

const categories = changedCategories([
  "contracts/execution_result.sample.json",
  "backend/migrations/001_init.sql",
  "backend/auth/policy.py",
  "docs/README.md",
]);

assert.strictEqual(categories.has("schema"), true);
assert.strictEqual(categories.has("migration"), true);
assert.strictEqual(categories.has("security"), true);

const passing = evaluateMigrationSchemaSecurity({
  files: [
    "contracts/execution_result.sample.json",
    "backend/migrations/001_init.sql",
    "backend/auth/policy.py",
  ],
  body: filledBody,
});

assert.strictEqual(passing.ok, true, "filled impact fields should pass");

const failing = evaluateMigrationSchemaSecurity({
  files: [
    "contracts/execution_result.sample.json",
    "backend/migrations/001_init.sql",
    "backend/auth/policy.py",
  ],
  body: [
    "## 4. 영향 범위",
    "",
    "- API/schema 영향: 없음",
    "- data/migration 영향:",
    "- security/privacy 영향: <!-- TODO -->",
  ].join("\n"),
});

assert.strictEqual(failing.ok, false, "missing impact fields should fail");
assert.deepStrictEqual(
  failing.failures.map((failure) => failure.category).sort(),
  ["migration", "schema", "security"],
);

const unrelated = evaluateMigrationSchemaSecurity({
  files: ["docs/12-quality-gates.md"],
  body: "",
});

assert.strictEqual(unrelated.ok, true, "unrelated docs changes should pass");

console.log("migration-schema-security-check tests passed");
