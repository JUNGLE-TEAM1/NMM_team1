# M2 RuntimeConfig SparkRunner smoke 노트

## 진행 메모

- GitHub issue #131과 branch `feature/m2-runtime-sparkrunner-smoke`가 생성되었다.
- 이 branch의 첫 PR은 M2 전체 구현이 아니라 `RuntimeConfig` + `SparkRunner` smoke에 한정한다.
- TLC NYC Taxi Dataset은 예전 M2 계획과 정형 빅데이터 ETL 가능성을 보여주는 evidence로 사용하되, 첫 PR에서 Taxi full ETL이나 Taxi 전용 runner를 만들지 않는다.

## 결정

- M2 구현은 데이터셋 독립 공통 실행기 방향으로 진행한다.
- 데이터셋별 차이는 `RuntimeConfig`의 input format/path/options로 처리한다.
- 첫 PR 이후 후속 PR 후보는 Taxi evidence, M5 runner integration, SQL smoke로 나눈다.

## 열린 질문

- 첫 smoke에서 실제 Spark를 사용할지, 테스트 환경 제약 때문에 local-equivalent fallback을 함께 둘지 확인이 필요하다.
- backend dependency에 Spark 관련 패키지를 바로 추가할지, adapter skeleton부터 만들지 확인이 필요하다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/131
