const { execFileSync } = require("child_process");
const fs = require("fs");

const DEFAULT_MAX_FILES = 20;
const DEFAULT_MAX_LINES = 600;
const RISKY_PATH_PATTERNS = [
  /^\.github\//,
  /^scripts\//,
  /^infra\//,
  /^contracts\//,
  /^docs\/03-interface-reference\.md$/,
  /^docs\/12-quality-gates\.md$/,
  /^docs\/system-guardrails\.md$/,
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

function isRiskyPath(path) {
  return RISKY_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function evaluatePullRequestRisk(rows, options = {}) {
  const maxFiles = parsePositiveInteger(options.maxFiles, DEFAULT_MAX_FILES);
  const maxLines = parsePositiveInteger(options.maxLines, DEFAULT_MAX_LINES);
  const changedFiles = rows.length;
  const additions = rows.reduce((sum, row) => sum + row.additions, 0);
  const deletions = rows.reduce((sum, row) => sum + row.deletions, 0);
  const totalLines = additions + deletions;
  const riskyFiles = rows.filter((row) => isRiskyPath(row.path)).map((row) => row.path);
  const warnings = [];

  if (changedFiles > maxFiles) {
    warnings.push(`changed file count ${changedFiles} exceeds warning threshold ${maxFiles}`);
  }

  if (totalLines > maxLines) {
    warnings.push(`line count ${totalLines} exceeds warning threshold ${maxLines}`);
  }

  if (riskyFiles.length > 0) {
    warnings.push(`risky paths changed: ${riskyFiles.join(", ")}`);
  }

  return {
    additions,
    changedFiles,
    deletions,
    riskyFiles,
    totalLines,
    warnings,
  };
}

function buildSummary(result) {
  const lines = [
    "## PR Risk Warning",
    "",
    `- Changed files: ${result.changedFiles}`,
    `- Additions: ${result.additions}`,
    `- Deletions: ${result.deletions}`,
    `- Total changed lines: ${result.totalLines}`,
    `- Risky files: ${result.riskyFiles.length === 0 ? "none" : result.riskyFiles.join(", ")}`,
    "",
  ];

  if (result.warnings.length === 0) {
    lines.push("No PR size or risky-path warning was triggered.");
  } else {
    lines.push("Warnings:");
    for (const warning of result.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push("");
  lines.push("This check is advisory and does not block merge by itself.");
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

function runCli() {
  const base = process.env.BASE_SHA || process.argv[2];
  const head = process.env.HEAD_SHA || process.argv[3];
  const maxFiles = process.env.PR_RISK_MAX_FILES || DEFAULT_MAX_FILES;
  const maxLines = process.env.PR_RISK_MAX_LINES || DEFAULT_MAX_LINES;
  const result = evaluatePullRequestRisk(readDiffRows(base, head), { maxFiles, maxLines });
  const summary = buildSummary(result);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  } else {
    process.stdout.write(summary);
  }

  for (const warning of result.warnings) {
    console.warn(`::warning title=PR risk warning::${warning}`);
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  buildSummary,
  evaluatePullRequestRisk,
  parseNumstat,
  parsePositiveInteger,
};
