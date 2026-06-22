# Demo polish 계획

## 브랜치

- Branch: `feature/demo-polish`
- Workspace: `docs/workflows/feature/demo-polish`
- Created: 2026-06-22

## 목표

- M5 완료 기준인 3분 golden path 데모가 끊기지 않게 UI와 실행 문서를 정리한다.
- source 등록 -> catalog 확인 -> pipeline 실행 -> result dataset 확인 흐름을 팀원이 재현할 수 있게 한다.

## 범위

- demo용 source/pipeline 기본 이름을 매번 새로 생성해 중복 이름 오류를 줄인다.
- source 등록 후 pipeline 패널이 최신 source를 따라가게 한다.
- pipeline 성공 후 catalog detail이 result dataset으로 이동하게 한다.
- Docker frontend가 같은 origin `/api` proxy를 사용해 데모 환경별 API base 흔들림을 줄인다.
- README와 manual verification에 3분 MVP demo script를 기록한다.

## 범위 제외

- 신규 transform, 신규 source connector, run history 고도화.
- 실제 AWS/EKS deploy, release publish.
- auth, multi-user, production result storage.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed. M5는 작은 demo polish branch로 처리한다.

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
