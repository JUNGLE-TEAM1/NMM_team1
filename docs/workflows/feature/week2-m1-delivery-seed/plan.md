# Week2 M1 delivery synthetic auxiliary seed 계획

## 브랜치

- Branch: `feature/week2-m1-delivery-seed`
- Workspace: `docs/workflows/feature/week2-m1-delivery-seed`
- Created: 2026-06-27

## 목표

- NYC TLC Yellow Taxi 2024-01 Parquet 원본을 기반으로 M5/M6 분석 보조용 delivery synthetic auxiliary seed를 생성한다.
- 이 데이터는 M3 main raw가 아니며, canonical output은 M3가 나중에 처리할 수 있도록 JSONL로 둔다.
- 가능하면 Spark/M5/M6 convenience copy로 Parquet도 함께 생성한다.
- 모든 manifest/summary 성격 metadata에는 synthetic lineage와 caveat를 명확히 남긴다.

## 범위

- 입력 파일 `data/external/nyc-taxi/yellow_tripdata_2024-01.parquet` 존재와 기본 형식을 확인한다.
- Taxi Parquet에서 최대 100,000행을 읽어 `delivery_trips_seed.jsonl`을 생성한다.
- 가능하면 `delivery_trips_seed.parquet` convenience copy를 생성한다.
- `source_manifest.json`과 `raw_demo_summary.json`에 delivery seed lineage/caveat를 반영한다.
- 생성 결과와 검증 증거를 workspace 문서에 기록한다.

## 범위 제외

- delivery seed를 M3 main raw path에 편입.
- 실제 배송 원천 데이터라고 표현.
- 원본 Taxi 파일 또는 generated `data/` 파일 commit.
- 대용량 dependency 임의 설치.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
AskLake Week2 M1 delivery synthetic auxiliary seed Phase를 진행한다.

목표:
- 이미 다운로드한 NYC TLC Yellow Taxi 2024-01 Parquet 원본을 기반으로 M5/M6 분석 보조용 synthetic delivery seed를 만든다.
- 이 데이터는 M3 main raw가 아니다.
- 기본 canonical output은 JSONL로 만들고, 가능하면 Parquet convenience copy도 만든다.
- 모든 산출물에는 synthetic/source lineage/caveat를 명확히 남긴다.

작업 위치:
- Branch: `feature/week2-m1-delivery-seed`
- Workspace: `docs/workflows/feature/week2-m1-delivery-seed`
- Worktree: `/Users/tail1/Documents/nmm-week2-m1-delivery-seed`

먼저 읽을 문서:
- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/15-context-budget-rule.md`
- `docs/workflows/feature/week2-m1-delivery-seed/plan.md`
- `docs/workflows/feature/week2-m1-delivery-seed/notes.md`
- `docs/workflows/feature/week2-m1-delivery-seed/decisions.md`
- `docs/workflows/feature/week2-m1-delivery-seed/quality.md`
- `docs/workflows/feature/week2-m1-delivery-seed/report.md`
- `docs/03-interface-reference.md`의 Week 2 Contract Package
- `contracts/workflow_definition.sample.json`
- `contracts/catalog_metadata.sample.json`
- `contracts/execution_result.sample.json`

입력 파일:
- `data/external/nyc-taxi/yellow_tripdata_2024-01.parquet`

출력 파일:
- `data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.jsonl`
- 가능하면 `data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.parquet`
- `data/week2/mvp_synthesis/metadata/source_manifest.json`
- `data/week2/mvp_synthesis/metadata/raw_demo_summary.json`

delivery row 최소 shape:

{
  "delivery_id": "...",
  "order_id": "...",
  "product_id": "...",
  "delivery_started_at": "2025-01-01T10:00:00Z",
  "delivered_at": "2025-01-01T10:42:00Z",
  "delivery_duration_minutes": 42,
  "delivery_distance_km": 8.4,
  "total_delivery_cost_amount": 17.25,
  "currency": "USD",
  "late_delivery_flag": false,
  "late_threshold_minutes": 60,
  "delivery_status": "delivered",
  "source_dataset_id": "nyc_taxi",
  "source_taxi_trip_id": "...",
  "source_taxi_row_hash": "...",
  "is_synthetic_source": true,
  "synthetic_generation_version": "v1",
  "synthetic_rule_id": "taxi_to_delivery_seed_v1",
  "event_date": "2025-01-01"
}

구현 요구:
1. Taxi Parquet에서 최대 100,000행을 읽는다.
2. `tpep_pickup_datetime`, `tpep_dropoff_datetime`, `trip_distance`, `total_amount` 등을 delivery 필드로 변환한다.
3. `product_id`는 기존 Amazon product seed가 있으면 그 목록에서 순환 배정하고, 없으면 deterministic fallback 값을 만든다.
4. `order_id`, `delivery_id`는 deterministic ID로 만든다.
5. `late_delivery_flag`는 `delivery_duration_minutes > late_threshold_minutes` 기준으로 만든다.
6. `source_taxi_row_hash`는 source row 주요 필드 기반 stable hash로 만든다.
7. 모든 row에 `is_synthetic_source=true`, `synthetic_generation_version=v1`, `synthetic_rule_id=taxi_to_delivery_seed_v1`을 넣는다.
8. summary/manifest에는 이 데이터가 "M5/M6 auxiliary synthetic dataset, not M3 main raw"임을 명시한다.
9. pyarrow/pandas가 없으면 먼저 사용 가능한 로컬 Python dependency를 확인하고, 필요한 경우 JSONL만 생성 가능한 fallback 경로를 제안한다. 임의로 대용량 dependency 설치는 하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.

필수 검증:
- 입력 Parquet 존재 확인
- 생성 JSONL parse 성공
- row_count 최대 100,000 확인
- 필수 필드 모두 존재 확인
- `is_synthetic_source=true` 전 row 확인
- `late_delivery_flag` boolean 확인
- `source_taxi_row_hash` 결측 없음 확인
- manifest/summary JSON validation
- 가능하면 Parquet copy read validation
- `scripts/validate-harness.sh --strict`
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

- [x] Taxi 2024-01 Parquet 다운로드 완료
- [x] 파일 크기 확인
- [x] SHA-256 기록
- [x] Parquet magic bytes 확인
- [x] 원본 파일이 `data/` ignored 상태임을 확인
- [x] 생성 Phase 프롬프트 반영
- [x] `delivery_trips_seed.jsonl` 생성 완료
- [x] 가능하면 `delivery_trips_seed.parquet` 생성 완료
- [x] source manifest와 summary에 synthetic lineage/caveat 기록
- [x] delivery seed 검증 완료
- [x] M5/M6 handoff notes 작성
- [x] quality/report/next-actions 업데이트
