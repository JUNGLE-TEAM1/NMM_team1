# Taxi PostgreSQL Source Dataset 등록 다음 작업

1. 사용자가 `source_file`, `service_year_month` 추가 여부를 결정한다.
2. 1차 smoke가 충분하면 `yellow_tripdata_2026_partial` 전체 4개 파일 적재로 확장한다.
3. 이후 `yellow_tripdata_2019_2025` 또는 전체 88개 파일 적재를 별도 scale validation으로 진행한다.
4. Target Dataset run이 `source_dataset_id`의 PostgreSQL table을 실제 Taxi runner input으로 쓰는 Phase를 분리한다.
5. Catalog publish와 M6 AI Query dataset context 연결은 Target Run이 실제 Taxi output을 만든 뒤 진행한다.
