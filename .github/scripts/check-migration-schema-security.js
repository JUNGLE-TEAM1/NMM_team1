const { execFileSync } = require("child_process");
const fs = require("fs");

const CATEGORY_RULES = [
  {
    category: "schema",
    label: "API/schema 영향",
    patterns: [
      /^contracts\//,
      /^docs\/03-interface-reference\.md$/,
      /(^|\/)schema(s)?\//,
      /(^|\/)(openapi|graphql|proto|protobuf)\//,
      /\.(openapi|graphql|proto)$/i,
    ],
  },
  {
    category: "migration",
    label: "data/migration 영향",
    patterns: [
      /(^|\/)migrations?\//,
      /(^|\/)migration(s)?\//,
      /(^|\/)alembic\//,
      /\.(migration|sql)$/i,
    ],
  },
  {
    category: "security",
    label: "security/privacy 영향",
    patterns: [
      /(^|\/)(auth|security|permissions?|polic(y|ies)|privacy)\//,
      /(^|\/)(auth|security|permissions?|polic(y|ies)|privacy)[._-]/i,
      /^\.github\/workflows\/deploy-/,
    ],
  },
];

const EMPTY_OR_NONE_RE =
  /^(?:|[-* ]*|없음|none|n\/a|not applicable|해당 없음|변경 없음|no change)$/i;

function stripHtmlComments(text) {
  return String(text || "").replace(/<!--[\s\S]*?-->/g, "").trim();
}

function changedCategories(files) {
  const result = new Map();

  for (const file of files) {
    for (const rule of CATEGORY_RULES) {
      if (rule.patterns.some((pattern) => pattern.test(file))) {
        if (!result.has(rule.category)) {
          result.set(rule.category, { label: rule.label, files: [] });
        }
        result.get(rule.category).files.push(file);
      }
    }
  }

  return result;
}

function sectionValue(body, label) {
  const cleaned = stripHtmlComments(body);
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^-\\s*${escaped}[ \\t]*:[ \\t]*(.*)$`, "im");
  const match = cleaned.match(re);
  return match ? match[1].trim() : "";
}

function isFilledImpact(value) {
  return !EMPTY_OR_NONE_RE.test(stripHtmlComments(value));
}

function evaluateMigrationSchemaSecurity({ files, body }) {
  const categories = changedCategories(files);
  const failures = [];

  for (const [category, detail] of categories.entries()) {
    const value = sectionValue(body, detail.label);
    if (!isFilledImpact(value)) {
      failures.push({
        category,
        label: detail.label,
        files: detail.files,
        reason: `${detail.label} must describe impact and validation when related files change.`,
      });
    }
  }

  return {
    ok: failures.length === 0,
    categories,
    failures,
  };
}

function readEventBody(eventPath) {
  if (!eventPath) {
    throw new Error("GITHUB_EVENT_PATH or event path argument is required.");
  }

  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  return event.pull_request && typeof event.pull_request.body === "string"
    ? event.pull_request.body
    : "";
}

function readChangedFiles(base, head) {
  if (!base || !head) {
    throw new Error("Both base and head SHAs are required.");
  }

  const mergeBase = execFileSync("git", ["merge-base", base, head], {
    encoding: "utf8",
  }).trim();
  const output = execFileSync("git", ["diff", "--name-only", mergeBase, head], {
    encoding: "utf8",
  });
  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function buildSummary(result) {
  const lines = ["## Migration / Schema / Security Detection", ""];

  if (result.categories.size === 0) {
    lines.push("No migration, schema, or security-sensitive path changed.");
    return `${lines.join("\n")}\n`;
  }

  lines.push("Detected categories:");
  for (const [category, detail] of result.categories.entries()) {
    lines.push(`- ${category}: ${detail.files.join(", ")}`);
  }

  if (result.ok) {
    lines.push("");
    lines.push("Required PR impact fields are filled.");
  } else {
    lines.push("");
    lines.push("Missing or empty required PR impact fields:");
    for (const failure of result.failures) {
      lines.push(`- ${failure.label}: ${failure.files.join(", ")}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function runCli() {
  const base = process.env.BASE_SHA || process.argv[2];
  const head = process.env.HEAD_SHA || process.argv[3];
  const eventPath = process.env.GITHUB_EVENT_PATH || process.argv[4];
  const files = readChangedFiles(base, head);
  const body = readEventBody(eventPath);
  const result = evaluateMigrationSchemaSecurity({ files, body });
  const summary = buildSummary(result);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  } else {
    process.stdout.write(summary);
  }

  if (!result.ok) {
    for (const failure of result.failures) {
      console.error(`::error title=Missing ${failure.label}::${failure.reason}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  buildSummary,
  changedCategories,
  evaluateMigrationSchemaSecurity,
  isFilledImpact,
  sectionValue,
  stripHtmlComments,
};
