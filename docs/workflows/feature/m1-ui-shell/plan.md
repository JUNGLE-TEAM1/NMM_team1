# M1 UI Shell 계획

## 브랜치

- Branch: `feature/m1-ui-shell`
- Workspace: `docs/workflows/feature/m1-ui-shell`
- Created: 2026-06-25

## 목표

- `demo3` 원격 branch의 데모 frontend 구성을 참고해 AskLake Week 2용 M1 UI Shell을 프로젝트 frontend에 적용한다.
- 데모 발표용 fake 동작은 제거하고, M2~M6가 실제 기능을 붙일 수 있는 route와 contract preview surface를 마련한다.

## 범위

- 기존 `frontend` 앱의 첫 화면을 Week 2 UI shell로 교체한다.
- `/sources`, `/schema-preview`, `/runs`, `/catalog`, `/ask` 경로를 frontend shell 안에서 제공한다.
- `docs/03-interface-reference.md`와 `contracts/*.sample.json`의 Week 2 contract 이름과 흐름을 화면에 반영한다.
- backend/API 미연결 상태는 loading/error/empty/connection pending 상태로 표시한다.
- M2~M6 연결 지점을 branch workspace 문서에 남긴다.
- demo3 주요 이어지는 route와 modal flow를 M1 static shell로 보강한다.
- 버튼/검색/탭/모달/back/close 등 프론트엔드 최소 interaction을 local UI state로 제공한다.

## 범위 제외

- `demo3`의 `XFlow` branding, storage key, fake backend, 발표용 자동 진행 연출 복사.
- `window.fetch` 전역 mock, `localStorage` fake auth/session, 자동 로그인, 자동 성공/완료 처리.
- 실제 source 등록, schema inference, workflow 실행, catalog 저장, AI query backend 구현.
- 공유 API/schema 계약 변경. 계약 변경이 필요하면 후속 Phase에서 별도 Source of Truth 변경으로 다룬다.
- 클릭만으로 `succeeded`, `trusted`, `complete`가 되는 fake business result.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/m1-ui-shell-plan.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md @docs/project-context/asklake-week2-module-plan/m1-ui-shell-plan.md @docs/03-interface-reference.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
M1 범위는 전체 UI shell 적용, demo fake 동작 제거, 후속 모듈 연결 지점 문서화까지다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
금지된 demo marker, XFlow branding, 전역 mock, 자동 성공/완료 연출이 남아 있지 않은지 확인한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
