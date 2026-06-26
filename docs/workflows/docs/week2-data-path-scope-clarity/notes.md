# Week2 data path scope clarity 노트

## 진행 메모

- 사용자와 논의 결과, Week2는 세 데이터 경로를 모두 구현하되 M6 분석 대표 경로는 Amazon Reviews JSON으로 우선 고정한다.
- Taxi/Kafka는 optional이 아니라 필수 처리/evidence 경로다.
- 정형/반정형/이벤트를 함께 분석하려면 공통 entity key가 필요하므로 synthetic companion dataset은 후속 리서치로 분리한다.

## 결정

- `docs/03-interface-reference.md`와 `contracts/*.sample.json`은 이번 문서 보완에서 변경하지 않는다.

## 열린 질문

- synthetic companion dataset을 실제로 설계할지 여부는 Week2 기본 처리/evidence 경로 완료 후 결정한다.

## 링크 / 증거

- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
