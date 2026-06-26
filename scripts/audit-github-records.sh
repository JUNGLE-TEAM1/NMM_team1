#!/usr/bin/env bash
set -euo pipefail

repo="${ASKLAKE_GITHUB_REPOSITORY:-JUNGLE-TEAM1/NMM_team1}"
limit=30
fixture_file=""
issue_numbers=()
pr_numbers=()

usage() {
  cat <<'USAGE'
Usage:
  scripts/audit-github-records.sh [--repo owner/name] [--limit N] [--issue N ...] [--pr N ...] [--fixture file]

Read-only audit for GitHub Issue/PR template drift.
It reports records that bypass the Korean Issue template or readable PR handoff body.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      repo="${2:-}"
      shift 2
      ;;
    --limit)
      limit="${2:-30}"
      shift 2
      ;;
    --issue)
      issue_numbers+=("${2:-}")
      shift 2
      ;;
    --pr)
      pr_numbers+=("${2:-}")
      shift 2
      ;;
    --fixture)
      fixture_file="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -n "$fixture_file" ]]; then
  input_file="$fixture_file"
else
  if ! command -v gh >/dev/null 2>&1; then
    echo "GitHub CLI is required for live audit. Use --fixture for local tests." >&2
    exit 2
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "GitHub CLI is not authenticated. Use --fixture for local tests." >&2
    exit 2
  fi

  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT
  issues_file="${tmp_dir}/issues.jsonl"
  prs_file="${tmp_dir}/prs.jsonl"
  : > "$issues_file"
  : > "$prs_file"

  if [[ "${#issue_numbers[@]}" -gt 0 ]]; then
    for issue_number in "${issue_numbers[@]}"; do
      gh issue view "$issue_number" --repo "$repo" --json number,title,state,labels,body,url >> "$issues_file"
    done
  elif [[ "${#pr_numbers[@]}" -eq 0 ]]; then
    gh issue list --repo "$repo" --state open --limit "$limit" --json number,title,state,labels,body,url \
      | node -e 'let data=""; process.stdin.on("data", d => data += d); process.stdin.on("end", () => JSON.parse(data).forEach(x => console.log(JSON.stringify(x))))' \
      > "$issues_file"
  fi

  if [[ "${#pr_numbers[@]}" -gt 0 ]]; then
    for pr_number in "${pr_numbers[@]}"; do
      gh pr view "$pr_number" --repo "$repo" --json number,title,state,body,url >> "$prs_file"
    done
  elif [[ "${#issue_numbers[@]}" -eq 0 ]]; then
    gh pr list --repo "$repo" --state open --limit "$limit" --json number,title,state,body,url \
      | node -e 'let data=""; process.stdin.on("data", d => data += d); process.stdin.on("end", () => JSON.parse(data).forEach(x => console.log(JSON.stringify(x))))' \
      > "$prs_file"
  fi

  input_file="${tmp_dir}/input.json"
  node - "$issues_file" "$prs_file" > "$input_file" <<'NODE'
const fs = require("fs");
const [issuesFile, prsFile] = process.argv.slice(2);
function readJsonl(file) {
  const text = fs.readFileSync(file, "utf8").trim();
  if (!text) return [];
  return text.split(/\n+/).map((line) => JSON.parse(line));
}
console.log(JSON.stringify({ issues: readJsonl(issuesFile), prs: readJsonl(prsFile) }));
NODE
fi

node - "$input_file" <<'NODE'
const fs = require("fs");
const input = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const issueTitleRe = /^\[(기능|버그|문서\/운영|긴급수정|검증|M[0-9][^\]]*)\]/;
const conventionalPrefixRe = /^(feat|fix|docs|test|chore|hotfix):/i;
const prKoreanPrefixRe = /^\[(기능|버그|문서\/운영|긴급수정|검증)\]/;
const koreanCharRe = /[가-힣]/;
const prSectionNames = [
  "## 1. PR 요약",
  "## 2. 변경 내용",
  "## 3. 검증",
  "## 4. 영향 범위",
  "## 5. 리뷰어에게 부탁할 부분",
  "## 6. 남은 일 / 제외한 일",
  "## 7. Merge 전 확인",
];

function labelsOf(record) {
  return (record.labels || []).map((label) => typeof label === "string" ? label : label.name).filter(Boolean);
}

function inferIssueLabel(title) {
  if (/^\[기능\]|^feat:/i.test(title)) return "feature";
  if (/^\[버그\]|^fix:/i.test(title)) return "bug";
  if (/^\[문서\/운영\]|^(docs|chore):/i.test(title)) return "documentation or ops";
  if (/^\[검증\]|^test:/i.test(title)) return "ops";
  if (/^\[긴급수정\]|^hotfix:/i.test(title)) return "hotfix";
  return "";
}

function issueDrift(issue) {
  const body = issue.body || "";
  const title = issue.title || "";
  const labels = labelsOf(issue);
  const reasons = [];
  const requiredBody = ["이슈 요약", "## 2. 목표", "## 3. 작업 범위", "Acceptance Criteria", "Manual Verification"];
  if (!issueTitleRe.test(title)) reasons.push("title-prefix-missing");
  if (!requiredBody.every((section) => body.includes(section))) reasons.push("body-template-missing");
  if (body.includes("\\n")) reasons.push("literal-newline-escape");
  if (body.includes("## AskLake branch workspace") || /(^|\n)## Scope(\n|$)/.test(body)) reasons.push("stale-script-body");
  const recommendedLabel = inferIssueLabel(title);
  if (recommendedLabel && recommendedLabel !== "documentation or ops" && !labels.includes(recommendedLabel)) reasons.push(`label-missing:${recommendedLabel}`);
  if (recommendedLabel === "documentation or ops" && !labels.includes("documentation") && !labels.includes("ops")) reasons.push("label-missing:documentation-or-ops");
  return { reasons, recommendedLabel };
}

function prTitleOk(title) {
  if (conventionalPrefixRe.test(title)) return false;
  return prKoreanPrefixRe.test(title) || koreanCharRe.test(title);
}

function suggestedPrTitle(title) {
  const cleaned = (title || "")
    .replace(/^feat:/i, "[기능]")
    .replace(/^fix:/i, "[버그]")
    .replace(/^docs:|^chore:/i, "[문서/운영]")
    .replace(/^test:/i, "[검증]")
    .replace(/^hotfix:/i, "[긴급수정]")
    .trim();
  if (prTitleOk(cleaned)) return cleaned;
  return `[문서/운영] ${cleaned} 작업`.trim();
}

function needsClosingKeyword(body) {
  if (/(Closes|Fixes|Resolves) #[0-9]+/i.test(body)) return false;
  if (/연결된 Issue:\s*(?!연결된 issue 없음|없음|n\/a|N\/A)(?!.*(Closes|Fixes|Resolves) #[0-9]+).*#[0-9]+/i.test(body)) return true;
  if (/(^|\n)## Issue\s*\n\s*#[0-9]+/i.test(body)) return true;
  if (/(^|\n)(Linked issue|Linked Issue):\s*#[0-9]+/i.test(body)) return true;
  return false;
}

function prDrift(pr) {
  const body = pr.body || "";
  const title = pr.title || "";
  const reasons = [];
  if (!prTitleOk(title)) reasons.push("title-prefix-or-korean-title-missing");
  if (!prSectionNames.every((section) => body.includes(section))) reasons.push("readable-pr-handoff-missing");
  if (/## Summary|## Issue|## Checklist/.test(body)) reasons.push("stale-pr-summary-checklist");
  if (needsClosingKeyword(body)) reasons.push("closing-keyword-missing");
  return { reasons };
}

const drifts = [];
for (const issue of input.issues || []) {
  const { reasons, recommendedLabel } = issueDrift(issue);
  if (reasons.length) {
    const suggestedTitle = issueTitleRe.test(issue.title || "")
      ? issue.title
      : (conventionalPrefixRe.test(issue.title || "")
          ? (issue.title || "").replace(/^feat:/i, "[기능]").replace(/^fix:/i, "[버그]").replace(/^docs:|^chore:/i, "[문서/운영]").replace(/^test:/i, "[검증]").replace(/^hotfix:/i, "[긴급수정]").trim()
          : `[기능] ${issue.title || ""}`.trim());
    drifts.push({
      kind: "issue",
      number: issue.number,
      url: issue.url,
      title: issue.title,
      reasons,
      suggestedTitle,
      suggestedLabel: recommendedLabel || "review-needed",
    });
  }
}

for (const pr of input.prs || []) {
  const { reasons } = prDrift(pr);
  if (reasons.length) {
    drifts.push({
      kind: "pr",
      number: pr.number,
      url: pr.url,
      title: pr.title,
      reasons,
      suggestedTitle: prTitleOk(pr.title || "") ? pr.title : suggestedPrTitle(pr.title || ""),
    });
  }
}

if (!drifts.length) {
  console.log("GitHub record drift audit passed.");
  process.exit(0);
}

console.log(`GitHub record drift audit found ${drifts.length} drift item(s).`);
for (const item of drifts) {
  console.log(`- ${item.kind} #${item.number}: ${item.reasons.join(", ")}`);
  console.log(`  url: ${item.url || "missing"}`);
  console.log(`  current title: ${item.title || "missing"}`);
  console.log(`  suggested title: ${item.suggestedTitle || "review-needed"}`);
  if (item.suggestedLabel) console.log(`  suggested label: ${item.suggestedLabel}`);
}
process.exit(1);
NODE
