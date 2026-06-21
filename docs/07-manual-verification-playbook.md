# 07. Manual Verification Playbook

이 문서는 수동 검증의 라우터다. 세부 절차는 `docs/manual-verification/` 아래 문서에 둔다.

## 목적

- 자동 테스트만으로 충분히 확인하기 어려운 demo, UX, integration, 사람-facing flow를 검증한다.
- 수동 검증 증거를 Phase report에 기록한다.
- 실패한 수동 검증을 `docs/06` failure scenario 또는 현재 Phase TODO와 연결한다.

## 사용 시점

- Phase 완료 전
- release/demo rehearsal 전
- UX, integration, external-provider 변경 후
- Hotfix 후
- 자동 테스트가 없거나 충분하지 않을 때

## 실행 규칙

1. Phase 완료 전 관련 manual verification 문서 하나 이상을 실행한다.
2. 결과는 `docs/reports/_template.md` 형식의 Phase report에 기록한다.
3. demo/UX 품질은 manual verification concern으로 다룬다.
4. 실패는 `docs/06` Failure Scenario와 report TODO에 연결한다.

## 세부 검증 문서

- [Environment Setup](manual-verification/00-environment-setup.md)
- [Golden Path](manual-verification/01-golden-path.md)
- [Core Feature](manual-verification/02-core-feature.md)
- [Auth or Access Control](manual-verification/03-auth-or-access-control.md)
- [Data Flow](manual-verification/04-data-flow.md)
- [Integration](manual-verification/05-integration.md)
- [Failure Scenarios](manual-verification/06-failure-scenarios.md)

## NMM_team1 최소 수동 점검

1. `README.md`가 NMM_team1 프로젝트 작업을 설명하는지 확인한다.
2. `AGENTS.md`의 Source of Truth, context loading, reporting rule이 이 저장소 기준인지 확인한다.
3. `docs/01-product-planning.md`에 현재 MVP 질문 또는 요구사항이 기록되어 있는지 확인한다.
4. `docs/08-development-workflow.md`의 다음 Phase가 project bootstrap 또는 실제 project feature인지 확인한다.
5. `docs/workflows/`에 실제 branch와 연결되지 않은 stale example workspace가 없는지 확인한다.
6. PR handoff 전에 linked GitHub issue가 workspace `sync.md`에 기록되어 있는지 확인한다.

## Phase Report 기록 형식

```text
Manual Verification:
- Document executed:
- Environment:
- Result:
- Failure/limitation:
- Evidence:
```
