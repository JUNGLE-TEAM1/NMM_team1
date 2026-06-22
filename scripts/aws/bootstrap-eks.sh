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

required_env=(AWS_REGION EKS_CLUSTER_NAME K8S_NAMESPACE)
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

config_file="$(mktemp)"
trap 'rm -f "$config_file"' EXIT

cat > "$config_file" <<YAML
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: ${EKS_CLUSTER_NAME}
  region: ${AWS_REGION}

iam:
  withOIDC: true

managedNodeGroups:
  - name: ${EKS_CLUSTER_NAME}-ng
    instanceType: t3.small
    desiredCapacity: 1
    minSize: 1
    maxSize: 2
    volumeSize: 30
    labels:
      app: asklake
      env: dev
YAML

if [[ "$mode" == "execute" ]]; then
  eksctl create cluster -f "$config_file"
  aws eks --region "$AWS_REGION" update-kubeconfig --name "$EKS_CLUSTER_NAME"
  kubectl create namespace "$K8S_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
else
  echo "Mode: plan"
  echo "Generated eksctl config:"
  cat "$config_file"
  echo
  echo "+ eksctl create cluster -f <generated-config>"
  echo "+ aws eks --region ${AWS_REGION} update-kubeconfig --name ${EKS_CLUSTER_NAME}"
  echo "+ kubectl create namespace ${K8S_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -"
fi
