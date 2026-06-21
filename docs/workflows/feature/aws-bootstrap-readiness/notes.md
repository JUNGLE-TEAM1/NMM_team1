# AWS bootstrap readiness 노트

## 진행 메모

- AWS CLI is installed and the local `asklake` profile is configured.

## 결정

- EKS-ready bootstrap selected for this readiness Phase.

## 열린 질문

- Actual AWS account identity was verified through `AWS_PROFILE=asklake`; resource creation remains blocked until approval.

## 링크 / 증거

- Issue #16 was created by `scripts/start-workflow.sh` as the team default.
