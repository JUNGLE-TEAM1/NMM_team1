# C-28A 결정 기록

## Data Lake local root

- 결정: runtime artifact의 기본 local root는 `data/lake`로 둔다.
- 이유: 화면의 Data Lake 표현과 실제 저장 위치를 맞추고 Bronze/Silver/Gold 레이어를 명확히 보여준다.
- 세부:
  - Bronze: Source Snapshot
  - Silver: Silver materialization parquet
  - Gold: Job Run 단위 Gold parquet

## Prepared sample fallback

- 결정: 기존 `data/local_sources/product_health/...` prepared parquet는 이동하지 않고 read fallback으로 유지한다.
- 이유: 기존 데모 샘플과 테스트 fixture를 깨지 않으면서 새 runtime 결과만 lake 경로로 정렬하기 위해서다.
