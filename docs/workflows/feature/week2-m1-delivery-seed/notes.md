# Week2 M1 delivery synthetic auxiliary seed 노트

## 진행 메모

- 2026-06-27: TLC Trip Record Data 페이지에서 2024-01 Yellow Taxi Parquet URL을 확인했다.
- 2026-06-27: `data/external/nyc-taxi/yellow_tripdata_2024-01.parquet`로 다운로드했다.
- 2026-06-27: 파일 크기 `49,961,641 bytes` / 표시 크기 약 `48M`.
- 2026-06-27: SHA-256 `c4d59da7bbc8abaeeeb1727947ee93d9891a71acb42854bd80db1571b2030510`.
- 2026-06-27: Python 환경에 `pyarrow`가 없어 row metadata는 읽지 못했지만, `file` command와 Parquet magic bytes `PAR1`/`PAR1`로 형식 확인을 완료했다.
- 2026-06-27: 후속 작업 프롬프트를 반영해 이 workspace의 목표를 delivery synthetic auxiliary seed 생성으로 확장했다.
- 2026-06-27: `scripts/week2_m1_delivery_seed.py`와 focused unittest를 추가했다.
- 2026-06-27: `backend/requirements.txt`에 `pyarrow==18.1.0`이 이미 있음을 확인했다. desktop 기본 Python에는 `pyarrow`가 없어 임시 runtime target `/tmp/asklake_pyarrow_runtime`에 `pyarrow`를 설치해 generated data만 생성했다.
- 2026-06-27: `delivery_trips_seed.jsonl` 100,000행과 `delivery_trips_seed.parquet` 100,000행을 생성했다.
- 2026-06-27: source month 이상 timestamp를 제외하기 위해 pickup 기준 `2024-01-01T00:00:00Z` 이상 `2024-02-01T00:00:00Z` 미만 필터를 추가했다.
- 2026-06-27: M5/M6 답변을 반영해 generator에서 `pandas`를 제거하고 `pyarrow`를 직접 사용하도록 변경했다. `late_minutes`와 `is_late_60`도 보존 필드로 추가했다.

## 결정

- 원본 다운로드는 완료 상태로 유지하고, 같은 workspace에서 delivery seed 생성 Phase를 이어서 진행한다.
- delivery seed는 M3 main raw가 아니라 M5/M6 분석 보조 synthetic dataset으로 다룬다.
- canonical 생성물은 `delivery_trips_seed.jsonl`로 두고, 가능하면 `delivery_trips_seed.parquet` convenience copy를 함께 만든다.
- generated `data/` 산출물은 commit하지 않는다.
- `pyarrow`는 기존 backend dependency를 유지하고, `duckdb`는 M6 SQL adapter Phase에서 판단한다.

## 열린 질문

- PR에 generated data를 포함하지 않는 대신, reviewer가 재생성할 수 있도록 스크립트와 검증 증거만 포함한다.

## 링크 / 증거

- TLC page: `https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page`
- Download URL: `https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet`
- Local path: `data/external/nyc-taxi/yellow_tripdata_2024-01.parquet`
- Generated JSONL: `data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.jsonl`
- Generated Parquet copy: `data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.parquet`
