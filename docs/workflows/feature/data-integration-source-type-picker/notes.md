# Data integration source type picker 노트

## 진행 메모

- `새 파이프라인 만들기` 모달을 source type picker + dataset card selector로 보정했다.
- `전체`, `CSV`, `Kafka`, `PostgreSQL`, `MongoDB`, `API`, `S3` type과 검색/정렬/type 메뉴를 추가했다.
- browser smoke에서 Kafka filter 후 `Order Events Topic` 선택이 Source 카드와 schema preview에 반영됨을 확인했다.

## 결정

- 이번 Phase는 실제 connector/API/backend/schema 없이 demo fixture만 사용한다.

## 열린 질문

- 다음 Phase를 Transform step으로 갈지, Source connector 연결 설계로 갈지 사람 확인이 필요하다.

## 링크 / 증거

- Local URL: `http://127.0.0.1:5173/dataset`
- Checks: `npm run build`, `scripts/validate-harness.sh`
