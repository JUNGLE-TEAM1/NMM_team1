# Taxi PostgreSQL Source Dataset 등록 확인 기록

- User requested: 인증/연결 테스트는 후순위로 미루고, 로컬 DB에 넣은 Taxi 데이터를 실제 서비스 Source Dataset으로 등록할 수 있게 진행.
- Side-chat update: 저장 전 `Test Connection` UI/API를 포함해도 되는 상태로 변경됨. 단, secret vault와 connection status persistence는 후속으로 유지.
- User selected DB: `taxi_postgre`
- User accepted: `airport_fee` lowercase 통합, `cbd_congestion_fee` drop.
- Pending human confirmation: `source_file`, `service_year_month` 컬럼 추가 여부.
- Scope boundary: Target Dataset run/Catalog/AI Query는 이번 slice 제외.
