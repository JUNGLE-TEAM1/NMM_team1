#!/usr/bin/env bash
set -euo pipefail

mode="plan"
if [[ "${1:-}" == "--execute" ]]; then
  mode="execute"
elif [[ "${1:-}" == "--plan" || $# -eq 0 ]]; then
  mode="plan"
else
  echo "Usage: $0 [--plan|--execute]" >&2
  exit 1
fi

required_env=(AWS_REGION ECR_REPOSITORY_PREFIX)
for name in "${required_env[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: ${name}" >&2
    exit 1
  fi
done

if [[ "$mode" == "execute" && "${ASKLAKE_AWS_APPROVED:-}" != "APPROVED" ]]; then
  echo "Refusing to create AWS resources. Set ASKLAKE_AWS_APPROVED=APPROVED after approval checklist is signed." >&2
  exit 1
fi

repos=(
  "${ECR_REPOSITORY_PREFIX}/backend"
  "${ECR_REPOSITORY_PREFIX}/frontend"
)

run_or_print() {
  if [[ "$mode" == "execute" ]]; then
    "$@"
  else
    printf '+'
    printf ' %q' "$@"
    printf '\n'
  fi
}

echo "Mode: ${mode}"
for repo in "${repos[@]}"; do
  run_or_print aws ecr create-repository \
    --repository-name "$repo" \
    --region "$AWS_REGION" \
    --image-tag-mutability IMMUTABLE \
    --image-scanning-configuration scanOnPush=true

  run_or_print aws ecr put-lifecycle-policy \
    --repository-name "$repo" \
    --region "$AWS_REGION" \
    --lifecycle-policy-text "file://infra/aws/ecr-lifecycle-policy.json"
done
