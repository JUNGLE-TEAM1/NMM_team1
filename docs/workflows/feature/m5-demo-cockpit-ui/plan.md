# M5 demo cockpit UI 계획

## 브랜치

- Target branch: `feature/m5-demo-cockpit-ui`
- Actual worktree branch: `feature/m5-airflow-smoke-integration`
- Workspace: `docs/workflows/feature/m5-demo-cockpit-ui`
- Created: 2026-06-27
- Branch note: 기존 M5 Airflow smoke 변경이 dirty worktree에 남아 있어 branch 전환 없이 `--no-checkout --no-issue`로 workspace만 만들고 진행했다.

## 목표

- 기존 `/etl` 실행/모니터링 화면을 M5 독립 데모와 학습용 cockpit으로 승격한다.
- 사용자가 결과 숫자만 보는 것이 아니라 `WorkflowDefinition -> runner result -> output artifact -> CatalogMetadata` 흐름을 한 화면에서 이해하게 한다.

## 범위

- `/etl` 화면의 navigation label을 `M5 데모`로 정리한다.
- local runner / Airflow executor 선택 UI를 추가한다.
- run 실행 후 `ExecutionResult` KPI, task results, output URI, logs를 설명과 함께 보여준다.
- run 성공 후 `GET /api/week2/catalog/dataset_reviews_gold`를 호출해 schema, metrics, storage, lineage를 표시한다.
- `fallback_succeeded`가 local runner 경로와 Airflow fallback 경로에서 다르게 해석된다는 설명을 화면에 반영한다.
- raw `ExecutionResult`와 raw `CatalogMetadata`를 접을 수 있는 JSON evidence로 제공한다.
- AI 도우미 패널은 기본 닫힘으로 바꿔 데모 화면을 가리지 않게 한다.
- 데모 화면을 보며 실험할 수 있는 통합 학습 가이드를 `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md`로 추가한다.

## 범위 제외

- backend API/schema 변경
- M5 runner selection rule 변경
- Airflow production 배포
- MinIO/S3 storage 연결
- SparkRunner/M2 runtime 통합
- M6 AI Query 화면 고도화
- auth/RBAC 또는 실제 권한 처리

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- `docs/workflows/feature/m5-airflow-smoke-integration/report.md`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `frontend/src/api/week2Api.js`
- `docs/07-manual-verification-playbook.md`

## 구현 프롬프트

```text
기존 M5 API 계약은 유지한다.
`/etl` 화면을 M5 demo cockpit으로 개선하되, 성공/실패/fallback/Catalog lineage를 숨기지 않는다.
사용자가 화면을 보면서 top-down으로 M5 구조를 이해할 수 있도록 각 결과값의 의미와 출처를 표시한다.
```

## 검증 프롬프트

```text
frontend build, whitespace check, local browser smoke, backend local runner smoke를 확인하고 quality/report에 기록한다.
manual guide 추가 후 문서 링크와 harness validation을 다시 확인한다.
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
