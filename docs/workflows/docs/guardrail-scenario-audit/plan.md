# Guardrail Scenario Audit 계획

## 브랜치

- Branch: `docs/guardrail-scenario-audit`
- Workspace: `docs/workflows/docs/guardrail-scenario-audit`
- Created: 2026-06-26

## 목표

- 시스템 레이어와 협업 하네스 레이어가 실제 운영 흐름에서도 잘 분리되어 있는지 검증한다.
- 새 hard rule을 늘리지 않고, 기존 CI/스크립트/문서가 이미 커버하는 범위와 시나리오 점검이 필요한 범위를 구분한다.
- PR / Issue / Project / branch workspace / Phase report 흐름에서 drift가 생길 수 있는 지점을 모의 테스트 계획으로 정리한다.

## 범위

- 현재 CI와 harness validation이 커버하는 기본 단위 테스트 정리.
- `docs/system-guardrails.md` guardrail inventory를 기준으로 CI/스크립트, GitHub admin setting, 하네스 기록 책임을 분리.
- linked issue 누락, PR risk warning, merged PR과 issue/project mismatch, stale workspace, report와 Source of Truth 충돌 시나리오 정의.
- 자동화 가능한 항목과 사람이 판단해야 하는 항목을 구분.
- 필요한 최소 Source of Truth 문서와 Phase evidence 업데이트.
- 사용자 지시에 따라 `main` ruleset, secret scanning/push protection, migration/schema/security hard detection을 적용한다.

## 범위 제외

- 새 hard gate 대량 추가.
- PR size warning을 실패 조건으로 변경.
- 제품 기능 구현.
- 배포/운영 인프라 확장.
- 사람 확인 없는 merge/finalize/cleanup 실행.

범위 변경 기록:

- 2026-06-26: 사용자가 `main` 직접 push 금지, PR required, force push/branch deletion 제한, secret scanning/push protection, branch protection required checks, migration/schema/security hard detection 적용을 명시 지시했다.
- 보류 유지: CODEOWNERS review, PR size/risk hard gate.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/system-guardrails.md`
- `docs/18-harness-regression-policy.md`
- `docs/reports/guardrail-protocol-split.md`
- `docs/reports/github-record-drift-audit.md`

## 구현 프롬프트

```text
@AGENTS.md
@docs/00-layer-map.md
@docs/08-development-workflow.md
@docs/12-quality-gates.md
@docs/system-guardrails.md

Guardrail Scenario Audit Phase를 시작한다.
시스템 레이어와 협업 하네스 레이어가 실제 운영 흐름에서도 잘 분리되어 있는지 검증한다.
새 hard rule을 늘리는 것이 아니라, 기존 CI/스크립트/문서가 어떤 범위를 이미 커버하고 어떤 범위는 시나리오 점검이 필요한지 정리한다.
PR / Issue / Project / branch workspace / Phase report 흐름에서 드리프트가 생길 수 있는 지점을 모의 테스트 계획으로 만든다.
문서 변경은 필요한 최소 범위로 제한한다.
```

## 검증 프롬프트

```text
@AGENTS.md
@docs/05-acceptance-scenarios-and-checklist.md
@docs/06-regression-and-failure-scenarios.md
@docs/07-manual-verification-playbook.md
@docs/12-quality-gates.md

Guardrail Scenario Audit 변경을 검증한다.
기존 CI 기본 단위 테스트가 통과하는지 확인하고, 새 시나리오 계획이 hard gate를 늘리지 않았는지 확인한다.
```

## 내부 단계별 프롬프트

1. Inventory: 현재 CI와 PR event check가 이미 커버하는 기본 단위를 정리한다.
2. Boundary: 시스템 강제, 읽기 전용 audit, 하네스 기록, 사람 판단 범위를 분리한다.
3. Scenario: 최소 5개의 모의 시나리오와 기대 결과를 문서화한다.
4. Verify: focused tests와 strict harness validation을 실행하고 evidence를 남긴다.

## 완료 기준

- [x] branch workspace가 생성되어 있다.
- [x] branch/workspace naming mismatch가 정리되어 있다.
- [x] GitHub `main` ruleset이 생성되어 direct push/PR required/non-fast-forward/deletion/required checks를 강제한다.
- [x] secret scanning과 push protection이 enabled다.
- [x] migration/schema/security hard detection workflow와 focused test가 추가되어 있다.
- [x] 시스템 레이어와 협업 레이어의 책임 경계가 테스트 계획에도 반영되어 있다.
- [x] CI가 이미 커버하는 단위와 시나리오 점검이 필요한 운영 흐름이 분리되어 있다.
- [x] 최소 5개의 모의 시나리오와 기대 결과가 문서화되어 있다.
- [x] 자동화 가능한 항목과 사람이 판단해야 하는 항목이 구분되어 있다.
- [x] 새 hard gate를 대량 추가하지 않았다.
- [x] TDD/skip 상태 기록.
- [x] Acceptance 확인.
- [x] Regression/failure scenario 확인.
- [x] Manual verification 기록.
- [x] CI/check 명령과 결과 기록.
- [x] Phase report가 생성되어 있다.
- [x] 다음 행동 선택지가 정리되어 있다.
