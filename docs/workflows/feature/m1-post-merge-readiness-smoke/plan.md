# M1 post-merge readiness smoke 계획

## 브랜치

- Branch: `feature/m1-post-merge-readiness-smoke`
- Workspace: `docs/workflows/feature/m1-post-merge-readiness-smoke`
- Created: 2026-06-29

## 목표

- 최신 `main`에 merge된 M1/M2/M6 변경을 기준으로 M1 `/query` 화면의 Product Health readiness, CTA, route/retrieval trace 표시가 거짓 성공 없이 동작하는지 재검증한다.
- `dataset_product_health_gold` 최종 Catalog/Gold output이 아직 없는 경우, M1이 `not-ready`/`blocked`를 정상 표시하는지 증거로 남긴다.
- 이미 merge된 M1 report의 PR 상태 문구가 남아 있으면 이번 Phase에서 최소 범위로 정리한다.

## 범위

- 최신 `origin/main` 기준 `/query` M1 browser smoke 재실행
- Product Health CTA 클릭 시 M6 route/retrieval trace 또는 blocked 상태가 UI에 일관되게 표시되는지 확인
- M2 preview evidence와 최종 Product Health Gold evidence의 차이를 report에 명확히 기록
- `docs/reports/m1-demo-readiness-panel.md`, `docs/reports/m1-product-health-demo-cta.md`의 stale PR 상태 문구가 있으면 merge 완료 상태로 정리
- 검증 결과를 `quality.md`, `report.md`, 필요 시 `docs/reports/` 새 Phase report에 기록

## 범위 제외

- `dataset_product_health_gold` 최종 CatalogMetadata/Gold output을 새로 생성하지 않는다.
- M2/M3/M5/M6 backend contract, SQL planner, TransformSpec, Catalog lineage 생성 로직을 변경하지 않는다.
- M3 PR #245 또는 M6 PR #241의 미병합 코드를 이 branch에 가져오지 않는다.
- Product Health readiness를 실제 근거 없이 `ready`로 올리지 않는다.

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

- [ ] 최신 `origin/main` 기준 M1 `/query` browser smoke 결과가 기록되어 있다.
- [ ] Product Health Gold 최종 evidence 부재 시 `not-ready`/`blocked`가 정상 표시됨을 확인했다.
- [ ] Product Health CTA가 fake success로 보이지 않는지 확인했다.
- [ ] route/retrieval trace 영역이 M6 응답 또는 blocked 상태와 어긋나지 않는지 확인했다.
- [ ] 필요한 경우 M1 report stale PR 상태 문구를 정리했다.
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
