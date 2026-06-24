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
| 마일스톤 완료 요약 | [`milestone-completion-summary.md`](milestone-completion-summary.md) | M0~M5와 이후 보강 작업에서 무엇을 했는지 팀원이 빠르게 파악 |
| Product Rebaseline 리스크 분석 | [`asklake-product-rebaseline-risk-analysis.md`](asklake-product-rebaseline-risk-analysis.md) | 기획서 적용 전 현재 하네스와의 충돌, 결정 필요 항목, 첫 rebaseline Phase 후보 파악 |
| Product Context Coherence Audit | [`product-context-coherence-audit.md`](product-context-coherence-audit.md) | MVP v1/current baseline과 Target MVP 문맥 분리, CI-safe strict guard 적용 여부 확인 |
| Target MVP 병렬 Workstream 재정렬 분석 | [`target-mvp-parallel-workstream-realignment-analysis.md`](target-mvp-parallel-workstream-realignment-analysis.md) | R0.5 Modular Contract Baseline과 병렬 workstream 구조가 기존 하네스와 충돌하는지 확인 |
| Modular Contract Baseline | [`modular-contract-baseline.md`](modular-contract-baseline.md) | R0.5 shared contract, workstream pool, integration spine, target MVP manifest 적용 결과 확인 |
| Modular Contract Baseline 적용 점검 | [`modular-contract-baseline-application-audit.md`](modular-contract-baseline-application-audit.md) | R0.5 변경사항이 하네스, validation, 병렬 실행 계약과 충돌 없이 적용됐는지 사후 확인 |
| Thin Runtime Core | [`thin-runtime-core.md`](thin-runtime-core.md) | R0.5 shared contract가 backend/frontend thin runtime skeleton과 fake provider로 연결됐는지 확인 |
| Harness 변경사항 병합 후 점검 | [`harness-post-merge-change-audit.md`](harness-post-merge-change-audit.md) | PR #45~#47 병합 뒤 Pre-PR checkpoint, Product Rebaseline, validation/script 충돌 여부 확인 |
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
