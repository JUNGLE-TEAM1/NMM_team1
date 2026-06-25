# Phase 보고서

`docs/reports/`는 AskLake Phase 실행 증거를 남기는 공간이다. Source of Truth는 아니지만 Source of Truth를 따랐는지, 무엇을 검증했는지, 다음 작업자가 무엇을 알아야 하는지를 기록한다.

## 역할

- 무엇이 변경됐고 무엇을 검증했는지 기록한다.
- `docs/05` 수용 기준과 증거를 연결한다.
- `docs/06` Regression Guard / Failure Scenario 확인 결과를 기록한다.
- `docs/07` Manual Verification 결과를 기록한다.
- `docs/08` 완료 게이트 충족 여부를 보여준다.
- 사람이 모든 report를 직접 읽지 않아도 AI가 현재 상태, 남은 위험, 다음 문맥을 요약할 수 있게 한다.

## 사용 시점

- 모든 Phase 완료 후
- 모든 Hotfix 완료 후
- 다음 Phase 시작 전 문맥 확인 시
- release/demo 전 evidence review 시

## 규칙

1. 각 Phase/Hotfix마다 report를 만든다.
2. 새 report는 [`_template.md`](_template.md)를 따른다.
3. 짧고 명확하게 쓴다.
4. changed, verified, remaining, next context는 반드시 남긴다.
5. Source of Truth drift를 고치기 위해 과거 report만 수정하지 않는다.

## Latest Report Index

AskLake에 하네스를 적용한 뒤 생성된 최신 Phase report를 아래 index에 유지한다.

report가 늘어나면 영역별 최신 report index를 작게 유지한다. 이 index는 Source of Truth가 아니라 evidence 탐색용이다.

| 영역 | 최신 report | 읽는 이유 |
| --- | --- | --- |
| 전체 진행 요약 | [`asklake-phase-summary.md`](asklake-phase-summary.md) | 팀원이 지금까지 진행된 Phase와 현재 남은 선택지를 빠르게 파악 |
| 팀원 온보딩 요약 | [`project-onboarding-summary.md`](project-onboarding-summary.md) | 새 팀원이 AskLake의 출발점, 현재 준비 상태, 다음 개발 방식의 큰 흐름을 문단 중심으로 파악 |
| B2B SaaS 포지셔닝 | [`b2b-saas-positioning.md`](b2b-saas-positioning.md) | 제품 방향은 B2B SaaS이고 Target MVP는 local/container 단일 Demo Tenant 검증이라는 분리 확인 |
| 대용량 데이터셋 조작 맥락 | [`big-dataset-context.md`](big-dataset-context.md) | Target MVP가 대용량/복합 데이터셋을 신뢰 가능한 분석 자산으로 만들고 처리 증거를 남기는 흐름을 포함하는지 확인 |
| 마일스톤 완료 요약 | [`milestone-completion-summary.md`](milestone-completion-summary.md) | M0~M5와 이후 보강 작업에서 무엇을 했는지 팀원이 빠르게 파악 |
| Product Rebaseline 리스크 분석 | [`asklake-product-rebaseline-risk-analysis.md`](asklake-product-rebaseline-risk-analysis.md) | 기획서 적용 전 현재 하네스와의 충돌, 결정 필요 항목, 첫 rebaseline Phase 후보 파악 |
| Product Context Coherence Audit | [`product-context-coherence-audit.md`](product-context-coherence-audit.md) | MVP v1/current baseline과 Target MVP 문맥 분리, CI-safe strict guard 적용 여부 확인 |
| Target MVP 병렬 Workstream 재정렬 분석 | [`target-mvp-parallel-workstream-realignment-analysis.md`](target-mvp-parallel-workstream-realignment-analysis.md) | R0.5 Modular Contract Baseline과 병렬 workstream 구조가 기존 하네스와 충돌하는지 확인 |
| Modular Contract Baseline | [`modular-contract-baseline.md`](modular-contract-baseline.md) | R0.5 shared contract, workstream pool, integration spine, target MVP manifest 적용 결과 확인 |
| Modular Contract Baseline 적용 점검 | [`modular-contract-baseline-application-audit.md`](modular-contract-baseline-application-audit.md) | R0.5 변경사항이 하네스, validation, 병렬 실행 계약과 충돌 없이 적용됐는지 사후 확인 |
| Thin Runtime Core | [`thin-runtime-core.md`](thin-runtime-core.md) | R0.5 shared contract가 backend/frontend thin runtime skeleton과 fake provider로 연결됐는지 확인 |
| Local Tool Runtime Readiness | [`local-tool-runtime-readiness.md`](local-tool-runtime-readiness.md) | Docker 같은 local runtime이 설치되어 있으나 꺼져 있을 때 agent가 safe start/readiness/fallback을 먼저 시도하는 규칙 확인 |
| Local Environment Requirements | [`local-environment-requirements.md`](local-environment-requirements.md) | macOS/Windows 로컬 개발 지원 등급, Docker Compose 권장 경로, WSL2/native Windows 검증 경계 확인 |
| Cross-Platform Smoke Audit | [`cross-platform-smoke-audit.md`](cross-platform-smoke-audit.md) | macOS Docker Compose smoke evidence와 Windows WSL2/native Windows 남은 검증 범위 확인 |
| Windows WSL2 Smoke Audit | [`windows-wsl2-smoke-audit.md`](windows-wsl2-smoke-audit.md) | Windows WSL2 smoke 검증 handoff와 현재 macOS 환경의 not-executed evidence 확인 |
| Windows WSL2 Smoke Execution | [`windows-wsl2-smoke-execution.md`](windows-wsl2-smoke-execution.md) | 실제 WSL2 shell에서 smoke를 재실행하고 repo-local portability fix와 남은 host prerequisite를 확인 |
| WSL2 Known Gaps Guidance | [`wsl2-known-gaps-guidance.md`](wsl2-known-gaps-guidance.md) | WSL2 Tier 1 경로를 유지하면서 CRLF, Git metadata 혼용, native Windows 보류 기준을 확인 |
| Small Change PR Decision | [`small-change-pr-decision.md`](small-change-pr-decision.md) | 작은 변경 완료 후 PR 진행, 로컬 보류, 큰 branch 흡수, 개인 초안 유지, 포함/제외 파일 정리 기준 확인 |
| PR Checkpoint Hardening | [`pr-checkpoint-hardening.md`](pr-checkpoint-hardening.md) | 작은 변경의 PR 진행이 Pre-PR checkpoint를 우회하지 않는지, dirty checkpoint가 untracked 파일을 자동 추적하지 않는지 확인 |
| PR Finalization State Source | [`pr-finalization-state-source.md`](pr-finalization-state-source.md) | PR merge 뒤 stale `sync.md` final field가 남아도 GitHub PR/issue 상태로 완료 여부를 올바르게 해석하는지 확인 |
| PR Conflict Resolution Protocol | [`pr-conflict-resolution-protocol.md`](pr-conflict-resolution-protocol.md) | PR conflict 감지, 분류, 사람 확인, 해결 후 재검증과 evidence 기록 규칙 확인 |
| Harness 변경사항 병합 후 점검 | [`harness-post-merge-change-audit.md`](harness-post-merge-change-audit.md) | PR #45~#47 병합 뒤 Pre-PR checkpoint, Product Rebaseline, validation/script 충돌 여부 확인 |
| Mid-Phase Steering 하네스 보강 | [`mid-phase-steering-harness.md`](mid-phase-steering-harness.md) | 작업 중 사람의 잦은 조향을 현재 Phase detail, scope change, Hotfix, 다음 Phase 후보, 보류 아이디어, 고영향 결정으로 분류하는 규칙 확인 |
| 협업 하네스 설명 가이드 | [`collaboration-harness-beginner-guide-v2.md`](collaboration-harness-beginner-guide-v2.md) | v1 전체 내용을 유지하면서 최신 하네스 규칙을 보강한 초보자 설명과 AI agent 운영 프롬프트 확인 |
| AWS 비용 추정 | [`aws-cost-estimate.md`](aws-cost-estimate.md) | EKS-ready 구성의 기본 비용과 데이터셋/로그/전송량 증가 시 추가 비용 파악 |
| Infra / MVP / 장기 Roadmap | [`phase-1-mvp-roadmap.md`](phase-1-mvp-roadmap.md) | 인프라 선행 원칙, XFlow 참고 MVP 범위, M0~M5 MVP milestone, M6~M15 장기 milestone, 다음 구현 Phase |
| Infrastructure Foundation | [`phase-2-infrastructure-foundation.md`](phase-2-infrastructure-foundation.md) | CI/CD, Docker, Kubernetes, AWS approval gate foundation |

## 다음 Phase 문맥 로딩

기본적으로 아래만 읽는다.

- 이 README의 Latest Report Index
- 직전 Phase report
- 관련 영역의 최신 report
- 필요한 경우 관련 report 1개 추가

audit, retrospective, whole-project analysis가 아니면 많은 report를 한꺼번에 읽지 않는다.

## Source of Truth 충돌

- Source of Truth가 우선한다.
- report가 더 정확한 구현 상태를 보여준다면, report만 고치지 말고 Change Propagation Rule에 따라 가장 이른 Source of Truth layer를 업데이트한다.
