# Local environment requirements 계획

## 브랜치

- Branch: `docs/local-environment-requirements`
- Workspace: `docs/workflows/docs/local-environment-requirements`
- Created: 2026-06-24

## 목표

- macOS/Windows 로컬 개발 지원 기준을 `docs/04-development-guide.md`에 Source of Truth로 정리한다.
- Docker Compose 권장 경로, host native 보조 경로, bash 기반 하네스 경로를 구분한다.
- Windows WSL2 지원 경로와 native PowerShell/CMD 미검증 범위를 명확히 한다.

## 범위

- `README.md` 로컬 실행 안내에 상세 기준 위치를 연결한다.
- `docs/04-development-guide.md`에 로컬 개발 환경 요구사항, 지원 등급, 최소 도구, OS별 주의사항을 추가한다.
- acceptance, regression, manual verification 문서에 OS/shell readiness 확인 기준을 최소 반영한다.
- `docs/08-development-workflow.md`에 cross-platform smoke audit과 tooling 개선 후속 Phase 후보를 기록한다.
- Phase report와 workspace evidence를 작성한다.

## 범위 제외

- 실제 Windows machine에서 smoke 검증 실행.
- native PowerShell/CMD wrapper 구현.
- `scripts/*.sh` cross-platform rewrite.
- 제품 기능, API, schema, data model 변경.
- host-level dependency installer 추가 또는 관리자 권한이 필요한 설정 변경.

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

- not needed

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step N - [STEP_NAME]

#### 목표

- [STEP_GOAL]

#### 범위

- [STEP_SCOPE]

#### 범위 제외

- [STEP_OUT_OF_SCOPE]

#### 구현 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
```

#### 검증 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
```

#### 완료 기준

- [ ] [STEP_COMPLETION_CRITERION]

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
