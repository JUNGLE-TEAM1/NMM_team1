# M5 기술 깊이 학습 가이드

## 목적

M5 역할이 얕게 보일 때, 면접이나 기술 설명 자리에서 어떤 지점을 깊게 설명할 수 있는지 정리한다.

M5는 ETL 변환 로직 자체나 Spark 대용량 처리 자체를 직접 만드는 역할이 아니다.

대신 M5는 아래 역할을 맡는다.

```text
데이터 파이프라인이 성공/실패/재시도/기록/카탈로그 반영을
거짓말 없이 처리하게 만드는 runtime 신뢰성 파트
```

## 1. Workflow Orchestration

Airflow를 단순히 "실행 도구"로만 보면 얕다.

아래 개념을 중심으로 봐야 한다.

```text
DAG
Task
TaskInstance
retry
backfill
scheduler
executor
XCom
trigger
sensor
```

중요한 질문은 이렇다.

```text
작업이 실패하면 어디까지 재시도할까?
부분 성공이면 전체 run은 성공인가 실패인가?
Airflow는 성공했는데 output 파일이 없으면 어떻게 판단할까?
```

이 관점으로 보면 "Airflow를 붙였다"가 아니라, workflow runtime을 설계했다고 설명할 수 있다.

## 2. Idempotency

M5에서 깊게 팔 만한 핵심 주제다.

생각해볼 질문은 이렇다.

```text
같은 run 요청이 두 번 오면?
같은 run_id로 다시 실행하면?
output 파일을 덮어써도 되나?
Catalog를 두 번 업데이트하면?
```

면접에서는 이렇게 말할 수 있다.

```text
run_id를 execution, output path, catalog lineage에 같이 넣은 이유는
재실행과 추적을 안전하게 하기 위해서입니다.
나중에는 idempotency_key를 둬서 같은 요청이 중복 실행되지 않게 해야 합니다.
```

## 3. Catalog Consistency

M5의 핵심이다.

```text
run history
= 모든 실행 기록

Catalog latest
= 사용자가 실제로 믿고 보는 최신 dataset 정보
```

여기서 중요한 문제는 이렇다.

```text
run은 성공했는데 catalog 저장이 실패하면?
catalog는 업데이트됐는데 output 파일이 없으면?
실패한 run이 최신 catalog를 덮으면?
동시에 두 run이 끝나면 어떤 게 latest인가?
```

관련 키워드는 아래와 같다.

```text
transaction
atomic update
latest pointer
metadata store
reconciliation
eventual consistency
```

## 4. State Machine

M5는 상태 관리가 중요하다.

단순히 success / fail만 보는 것이 아니다.

```text
queued
running
succeeded
failed
fallback_succeeded
fallback_failed
catalog_published
catalog_publish_failed
```

좋은 설명은 이렇다.

```text
처음에는 runner result의 status만 저장했지만,
운영 관점에서는 execution 성공과 catalog publish 성공을 분리해야 한다고 봤습니다.
데이터 처리는 성공했는데 metadata publish가 실패할 수 있기 때문입니다.
```

## 5. Runner Adapter Architecture

M5에 딱 맞는 주제다.

```text
local_runner
airflow_adapter
future spark_runner
```

이 runner들은 내부 구현이 다르다.

하지만 M5는 같은 모양으로 받아야 한다.

```text
Week2RunnerResult
= runner들이 M5에게 제출하는 공통 결과지
```

공부할 키워드는 아래와 같다.

```text
adapter pattern
interface boundary
contract test
fake adapter
fallback behavior
```

면접에서는 이렇게 설명할 수 있다.

```text
M5는 Spark나 Airflow 내부 구현에 직접 의존하지 않고,
runner들이 같은 result contract를 반환하도록 경계를 만들었습니다.
그래서 실행 엔진이 바뀌어도 Catalog update 로직은 유지됩니다.
```

## 6. Observability / Evidence

M5는 "실행했다"가 아니라 "증거를 남겼다"가 중요하다.

중요한 evidence는 아래와 같다.

```text
row_count
bytes
duration_ms
output_path
logs
task_results
lineage
```

생각할 질문은 이렇다.

```text
이 실행이 진짜 성공했다는 걸 무엇으로 증명하지?
어떤 node에서 실패했는지 어떻게 알지?
M6 AI Query가 어떤 dataset을 근거로 답했는지 어떻게 추적하지?
```

M5는 AI 답변의 신뢰 근거를 만드는 앞단이다.

## 7. Spark는 어느 정도만

Spark를 아예 모르면 불안하니 기본은 봐야 한다.

하지만 목표는 Spark 전문가가 아니라 아래에 가깝다.

```text
SparkRunner가 M5에 어떤 결과를 돌려줘야 하는지 아는 사람
```

볼 것은 이 정도면 충분하다.

```text
SparkSession
DataFrame read/write
json/parquet
partition
job/stage/task
row count
output path
local mode
```

핵심은 이 구분이다.

```text
Spark가 데이터를 처리한다.
M5는 Spark가 만든 결과를 ExecutionResult와 CatalogMetadata로 바꾼다.
```

## 추천 공부 순서

1. Airflow 기본 구조
2. Workflow state machine
3. Idempotency
4. Catalog consistency
5. Adapter pattern
6. Observability/lineage
7. Spark local mode 기본

## 면접용 핵심 문장

```text
제가 맡은 M5는 ETL 변환 자체보다,
workflow 실행 결과가 Catalog와 AI Query까지 믿을 수 있게 전달되도록
run history, fallback, lineage, successful-only catalog update를 관리하는 역할이었습니다.
```

## 딱 기억할 것

```text
M5를 깊게 파려면 Spark 계산보다
"실행 신뢰성"을 파야 한다.

실패했을 때 거짓 성공을 만들지 않는 것,
성공했을 때 추적 가능한 증거를 남기는 것,
그게 M5의 기술 깊이다.
```
