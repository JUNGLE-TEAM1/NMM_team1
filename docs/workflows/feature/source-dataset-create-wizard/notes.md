# Source dataset create wizard 노트

## 진행 메모

- 2026-06-29: Source Dataset 생성은 connector 등록과 metadata draft를 만드는 demo 흐름으로 정의함.
- 사용자가 말한 Kafka, CSV 같은 종류 선택은 이 Phase의 첫 단계에 포함한다.
- 2026-06-29: Source Dataset wizard를 `데이터 소스 선택` -> `Configure` -> `Review` 3단계로 구현함.
- 2026-06-29: 기존 source picker modal을 재사용해 CSV/Kafka/PostgreSQL/MongoDB/API/S3 필터와 card 목록을 제공함.
- 2026-06-29: Configure 단계는 dataset draft name, connection profile summary, schema preview까지만 표시함.
- 2026-06-29: 브라우저에서 Kafka card 선택, Configure, Review, Target wizard 복귀를 확인함.

## 결정

- 단계는 `데이터 소스 선택` -> `Configure` -> `Review` 3단계로 제한한다.
- 실제 credential 저장과 연결 테스트는 제외한다.

## 열린 질문

- 실제 저장 API와 connection test는 backend/interface 결정 후 별도 Phase로 다룬다.

## 링크 / 증거

- `docs/08-development-workflow.md`의 D-3 항목
- `npm run build` pass
- `scripts/validate-harness.sh` pass
