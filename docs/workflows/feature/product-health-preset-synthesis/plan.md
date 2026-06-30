# Product Health Preset Synthesis 계획

## Phase

- ID: C-41
- Branch/work location: `feature/data-lake-runtime-stack`, `docs/workflows/feature/product-health-preset-synthesis`
- Goal: 사이트에서 Product Health preset 합성을 실행해 `seed_product_mapping`, Silver parquet, Gold parquet, Catalog/Evidence 준비 파일을 재생성한다.

## Scope

- 포함: 기존 `scripts/product_health_synthetic_smoke.py` 실행을 backend API로 감싸고 `/datasets/gold`에서 실행 버튼과 결과 evidence를 표시한다.
- 제외: 범용 raw source 조합 builder, 사용자 정의 transform/risk rule UI, Airflow/Spark production execution, 새 대용량 다운로드, 5GB evidence 재측정.

## Steps

1. Backend service/API를 추가한다.
2. Product Health preset synthesis 응답 schema와 테스트를 추가한다.
3. Gold Dataset 화면에 Product Health preset panel을 추가한다.
4. Interface/acceptance/regression/manual verification 문서를 갱신한다.
5. Local test/build와 diff 검증을 수행한다.

## Done Criteria

- `POST /api/product-health/preset-synthesis`가 기존 합성 스크립트를 실행하고 artifact path/row/status를 반환한다.
- Frontend에서 버튼으로 합성 실행과 결과 확인이 가능하다.
- Backend focused test와 frontend build가 통과한다.
