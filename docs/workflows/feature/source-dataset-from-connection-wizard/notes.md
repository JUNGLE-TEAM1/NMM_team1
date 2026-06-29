# Source dataset from connection wizard 노트

## 진행 메모

- 2026-06-29: Source Dataset 생성 wizard를 `Connection 선택 -> Raw Dataset 설정 -> Review`로 보정함.
- 선택 대상은 `demoExternalConnections`이며, 이미 등록된 Source Dataset card를 다시 고르는 UX를 제거했다.
- Kafka connection smoke에서 `source_order_events_kafka_connection`과 `commerce.order.events` raw scope가 review에 표시됨.

## 결정

- Source Dataset 생성은 External Connection을 고르고 raw/source dataset draft를 만드는 흐름으로 표현한다.
- 실제 ingest job, raw table 생성, backend 저장은 이번 Phase에서 제외한다.

## 열린 질문

- R-4에서 Target Dataset review에 ETL job definition 요약을 더 명확히 분리해야 한다.

## 링크 / 증거

- `npm run build` in `frontend/`: pass
- `scripts/validate-harness.sh`: pass
- Browser smoke: `http://127.0.0.1:13000/dataset`
