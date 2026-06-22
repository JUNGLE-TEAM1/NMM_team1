#!/usr/bin/env bash
set -euo pipefail

required_env=(
  AWS_REGION
  AWS_ACCOUNT_ID
  ECR_REPOSITORY_PREFIX
  EKS_CLUSTER_NAME
  K8S_NAMESPACE
  GITHUB_REPOSITORY
)

failures=0

check_command() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    echo "ok: ${name} found"
  else
    echo "missing: ${name}"
    failures=$((failures + 1))
  fi
}

check_env() {
  local name="$1"
  if [[ -n "${!name:-}" ]]; then
    echo "ok: ${name}=${!name}"
  else
    echo "missing: ${name}"
    failures=$((failures + 1))
  fi
}

echo "AskLake AWS readiness check"
echo "==========================="

check_command aws
check_command docker
check_command kubectl
check_command eksctl

echo
echo "Environment"
for name in "${required_env[@]}"; do
  check_env "$name"
done

echo
echo "AWS identity"
if aws sts get-caller-identity >/tmp/asklake-aws-identity.json 2>/tmp/asklake-aws-identity.err; then
  cat /tmp/asklake-aws-identity.json
else
  cat /tmp/asklake-aws-identity.err
  failures=$((failures + 1))
fi

echo
if [[ "$failures" -eq 0 ]]; then
  echo "AWS readiness check passed."
else
  echo "AWS readiness check failed: ${failures} missing or invalid item(s)."
  exit 1
fi
