# M5 Local Runner Representative Path shared docs

## 읽은 주요 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`

## 직접 관련 기준

- `main-e2e-path.md`: M5 완료 기준은 run 결과와 Catalog entry가 같은 `run_id`/dataset context로 이어지는 것이다.
- `runner-boundary-decision.md`: `Week2RunnerResult`는 `ExecutionResult`와 Catalog update의 bridge다.
- `docs/05`: row count, bytes, duration, output path 같은 처리 증거가 기록되어야 한다.
- `docs/06`: 처리 증거 없이 dataset 조작이 완료된 것처럼 보이면 안 된다.
- `docs/07`: output path, row count, bytes, duration이 `ExecutionResult` 또는 `CatalogMetadata`에 남는지 확인한다.
