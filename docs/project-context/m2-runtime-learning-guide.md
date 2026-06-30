# M2 Runtime 학습 가이드

이 문서는 M2가 한 일을 남에게 설명할 수 있게 만드는 학습용 문서다.
하네스 report처럼 증거를 나열하는 문서가 아니라, M2가 왜 필요했고 어떤 흐름으로 동작하는지 이해하기 위한 문서다.

## 먼저 한 줄로 말하기

M2는 AskLake에서 대용량 데이터를 Spark로 읽고, 처리하고, Parquet으로 저장한 뒤, 다른 모듈이 이어받을 수 있는 실행 결과를 남기는 실행 계층이다.

조금 더 발표식으로 말하면 이렇게 말하면 된다.

```text
M2는 데이터의 의미를 정하는 파트가 아니라,
정해진 데이터 처리 작업을 실제로 실행하는 runtime layer입니다.
입력 위치와 실행 설정을 RuntimeConfig로 받고,
SparkRunner가 데이터를 읽어 Parquet으로 저장한 뒤,
row count, bytes, duration, output path 같은 실행 증거를 Week2RunnerResult로 반환합니다.
이 결과를 M5가 ExecutionResult와 Catalog로 저장하고,
M6가 SQL이나 AI Query에서 사용합니다.
```

## M2가 왜 필요한가

처음에는 작은 샘플 파일을 Python으로 읽고 결과 파일을 만들면 충분해 보인다.

작은 데이터에서는 이 방식이 괜찮다. 파일도 작고, 실행도 빠르고, 실패해도 다시 돌리면 된다.

하지만 프로젝트 목표가 커지면 문제가 생긴다.

데이터가 수 GB 이상으로 커지면 단순 Python 처리만으로는 느려지거나 메모리가 부족해질 수 있다.
팀원이 각자 파일을 읽고 쓰는 방식을 만들면 output path, row count, bytes, 실패 처리 방식이 서로 달라진다.
M5는 workflow 실행 결과를 저장해야 하는데, M2가 어떤 결과 모양으로 돌려줄지 정해져 있지 않으면 Catalog로 이어받기 어렵다.
M6는 SQL로 결과를 읽어야 하는데, 결과 파일 위치와 table 이름이 안정적이지 않으면 질의 흐름이 흔들린다.

그래서 M2가 필요하다.

M2는 데이터 처리의 의미를 정하는 사람이 아니라, 데이터 처리가 실제로 돌아갈 수 있는 공통 실행 길을 만든다.

```text
입력 데이터가 어디 있는지 받음
↓
어떤 방식으로 읽고 쓸지 설정을 받음
↓
Spark 또는 SparkRunner 경로로 실행함
↓
Parquet 결과를 저장함
↓
실행 증거를 표준 모양으로 반환함
↓
M5, M6, M1이 이어받음
```

## 전체 파이프라인에서 M2 위치

M2는 사용자가 직접 보는 화면의 주인공은 아니다.
하지만 화면, workflow, SQL 질의가 실제 데이터 결과를 믿고 사용할 수 있게 만드는 중간 엔진이다.

```text
M1 UI
↓
M5 Workflow / Airflow
↓
M2 RuntimeConfig + SparkRunner
↓
Parquet output
↓
local / MinIO / S3-compatible storage
↓
M5 ExecutionResult / Catalog
↓
M6 SQL / AI Query
↓
M1 화면 표시
```

여기서 M2는 이 부분이다.

```text
M2 RuntimeConfig + SparkRunner
↓
Parquet output
↓
storage evidence
```

즉 M2는 "질문에 답하는 파트"도 아니고, "위험 점수를 정의하는 파트"도 아니다.
M2는 정해진 입력과 정해진 변환을 실제로 돌리고, 결과가 어디에 생겼는지 증거를 남기는 파트다.

## M2가 맡은 일과 맡지 않은 일

M2가 맡은 일은 실행이다.

- 대용량 입력을 읽는다.
- Spark 실행 경로를 준비한다.
- Parquet 결과를 만든다.
- local path, MinIO, S3-compatible path를 다룬다.
- row count, bytes, duration, output path를 남긴다.
- M5가 이어받을 수 있는 `Week2RunnerResult` 모양을 맞춘다.

M2가 맡지 않은 일은 데이터 의미 결정이다.

- `risk_score`를 어떻게 계산할지 정하지 않는다.
- `negative_review_rate`, `conversion_rate`, `late_delivery_rate`의 최종 의미를 정하지 않는다.
- 데이터 품질 규칙의 최종 기준을 정하지 않는다.
- Catalog 저장소/API를 소유하지 않는다.
- Airflow scheduler나 DAG 운영을 소유하지 않는다.
- M1 화면 흐름을 소유하지 않는다.

이 구분이 중요하다.

M2가 의미까지 정하면 M3 책임과 섞인다.
M2가 Catalog 저장까지 직접 하면 M5 책임과 섞인다.
M2가 SQL 답변까지 만들면 M6 책임과 섞인다.

딱 기억하면 된다.

```text
M3가 "무엇을 만들지" 정한다.
M2가 "그걸 어떻게 실행할지" 담당한다.
M5가 "실행 결과를 workflow와 catalog에 저장"한다.
M6가 "저장된 결과를 SQL/AI Query로 읽는다".
```

## 핵심 용어

### RuntimeConfig

`RuntimeConfig`는 M2에게 주는 실행 지시서다.

예를 들어 이런 내용을 담는다.

```text
어떤 파일을 읽을지
파일 형식이 jsonl인지 parquet인지
결과를 어디에 쓸지
저장소는 local인지 MinIO인지 S3인지
출력 파일 이름은 무엇인지
```

코드 이름으로는 `contracts/runtime_config.sample.json`과 `backend/app/domain/runtime_config.py`를 보면 된다.

쉽게 말하면:

```text
RuntimeConfig = M2에게 주는 작업 주문서
```

### SparkRunner

`SparkRunner`는 M2의 실행 담당자다.

`RuntimeConfig`를 받아서 실제로 데이터를 읽고 쓴다.
현재 구현은 작은 smoke와 preview 경로부터 시작했지만, 역할은 Spark 실행 경계를 잡는 것이다.

코드 이름으로는 `backend/app/services/week2_spark_runner.py`를 보면 된다.

쉽게 말하면:

```text
SparkRunner = 주문서를 보고 데이터를 처리하는 실행기
```

### Week2RunnerResult

`Week2RunnerResult`는 M2가 작업을 끝낸 뒤 돌려주는 결과 영수증이다.

여기에는 이런 정보가 들어간다.

```text
성공했는지
몇 행을 읽었는지
몇 bytes를 읽었는지
얼마나 걸렸는지
결과 파일이 어디 있는지
결과가 몇 행인지
결과 파일 크기가 얼마인지
각 task가 성공했는지 실패했는지
```

쉽게 말하면:

```text
Week2RunnerResult = M2 실행 결과 영수증
```

이 영수증이 있어야 M5가 `ExecutionResult`와 Catalog로 저장할 수 있다.

### Parquet

Parquet은 분석용 데이터 파일 형식이다.

CSV나 JSONL은 사람이 보기 쉽지만, 대용량 분석에는 비효율적일 수 있다.
Parquet은 column 단위로 저장해서 Spark나 DuckDB 같은 도구가 필요한 column만 효율적으로 읽을 수 있다.

쉽게 말하면:

```text
Parquet = 대용량 분석 도구가 빠르게 읽기 좋은 파일 형식
```

M2가 Parquet을 쓰는 이유는 M3, M5, M6가 같은 결과 파일을 안정적으로 이어받기 좋기 때문이다.

### MinIO와 S3-compatible storage

S3는 AWS의 object storage다.
MinIO는 로컬에서 S3와 비슷하게 쓸 수 있는 저장소다.

처음부터 AWS S3를 붙이면 계정, 권한, 비용, 네트워크 문제가 생긴다.
그래서 로컬에서는 MinIO로 S3와 비슷한 흐름을 먼저 검증한다.

쉽게 말하면:

```text
MinIO = 로컬에서 S3처럼 연습하는 저장소
S3-compatible = S3와 비슷한 방식으로 접근 가능한 저장소
```

M2는 결과를 local fallback path에 남기고, 필요하면 MinIO/S3-compatible object path로도 올릴 수 있게 했다.

### Airflow handoff

Airflow는 workflow를 실행하는 도구다.
M5가 Airflow 쪽을 맡는다.

하지만 Airflow가 M2를 호출하려면 "어떤 명령을 실행해야 하는지"와 "결과를 어디서 읽어야 하는지"가 필요하다.

그래서 M2는 Airflow에서 호출할 수 있는 CLI를 제공했다.

```text
Airflow DAG
↓
M2 CLI 실행
↓
SparkRunner 실행
↓
week2_result JSON 생성
↓
M5가 읽음
```

쉽게 말하면:

```text
Airflow handoff = M5가 M2를 부르고 결과를 받아갈 수 있게 만든 연결 플러그
```

## 실제로 Spark를 어떻게 실행했나

M2에서 Spark를 실행한 방식은 크게 두 단계로 나뉜다.

첫 번째는 개발 속도를 위해 로컬에서 바로 실행하는 방식이었다.
이 방식은 내 컴퓨터 안에서 PySpark를 띄우고, 작은 Taxi Parquet 파일을 읽어서 결과 Parquet을 만드는지 확인하는 용도였다.
여기서 중요한 것은 "Spark 코드가 실제로 데이터를 읽고, 집계하고, 저장할 수 있느냐"였다.

두 번째는 Docker 안에 Spark master, worker, driver를 띄우는 방식이었다.
이 방식은 실제 분산 처리 구조에 더 가깝다.
완전한 운영 환경은 아니지만, "노트북에서 Python만 실행한 것"과는 다르게 Spark cluster 형태로 실행했다는 증거가 된다.

Docker Spark 실행 구조는 이렇게 보면 된다.

```text
Spark master
  전체 작업을 조율하는 관리자

Spark worker 1, Spark worker 2
  실제 계산을 나눠서 수행하는 작업자

Spark driver
  우리가 작성한 Python 코드를 들고 Spark 작업을 제출하는 실행자
```

즉 driver가 "이 데이터를 읽어서 날짜별로 집계해 줘"라고 Spark에 요청하면,
master가 작업을 나누고,
worker들이 실제 계산을 수행한다.

코드와 스크립트 기준으로는 다음 흐름이다.

```text
docker compose로 Spark master와 worker를 먼저 띄운다.
↓
m2-spark-driver 컨테이너를 실행한다.
↓
driver 컨테이너 안에서 spark-submit 명령을 실행한다.
↓
week2_m2_taxi_spark_local_evidence.py가 실행된다.
↓
그 안에서 Week2TaxiSparkRunner가 실행된다.
↓
Week2TaxiSparkRunner가 SparkSession을 만든다.
↓
Spark가 Taxi Parquet을 읽고 날짜별 Gold metric을 만든다.
↓
결과를 Parquet으로 저장하고 summary JSON을 남긴다.
```

실제 스크립트의 핵심 명령은 이런 모양이다.

```text
/opt/spark/bin/spark-submit
  --master spark://m2-spark-master:7077
  --driver-memory 8g
  /app/scripts/week2_m2_taxi_spark_local_evidence.py
  --input /data/taxi
  --output-root /app/data/results/...
  --profile local-full-month
  --run-id ...
```

여기서 `spark://m2-spark-master:7077`은 Spark driver가 master에게 접속하는 주소다.
`/data/taxi`는 Docker 밖의 Taxi 데이터 폴더를 컨테이너 안에서 보이게 만든 경로다.
`/app/data/results/...`는 결과가 저장되는 경로다.

코드 안에서는 `build_spark_session()`이 Spark 실행 환경을 만든다.

```text
SparkSession.builder
  .master(...)
  .appName(...)
  .config(...)
  .getOrCreate()
```

이 코드는 Spark에게 "어디에서 실행할지, 앱 이름은 무엇인지, Parquet을 어떻게 읽을지"를 알려준다.
로컬 실행이면 `local[*]` 같은 master를 쓰고,
Docker cluster 실행이면 `spark://m2-spark-master:7077`을 쓴다.

따라서 M2가 Spark를 실행했다는 말은 단순히 라이브러리를 import했다는 뜻이 아니다.
Spark 실행 세션을 만들고,
Spark driver가 작업을 제출하고,
Spark가 Parquet을 읽고,
Spark DataFrame으로 집계하고,
Spark writer로 결과를 저장했다는 뜻이다.

## Parquet은 실제로 어떻게 저장했나

Parquet 저장도 두 종류가 있다.
이 둘을 구분해야 M2 작업이 덜 헷갈린다.

첫 번째는 범용 runner의 작은 smoke 경로다.
이 경로는 `backend/app/services/week2_spark_runner.py`에 있다.
여기서는 입력 row들을 Python list처럼 들고 있다가 `pyarrow`로 Parquet 파일을 만든다.

흐름은 이렇다.

```text
Python dict row 목록
↓
pyarrow Table로 변환
↓
parquet.write_table(...)
↓
Parquet 파일 생성
```

이 경로는 "계약 모양이 맞는지", "작은 샘플이 Parquet으로 저장되는지"를 빠르게 확인하기 좋다.
하지만 대용량 처리의 핵심 증거는 아니다.

두 번째가 Taxi Spark runner 경로다.
이 경로는 `backend/app/services/week2_taxi_spark_runner.py`에 있다.
여기서는 Spark가 직접 Parquet을 읽고,
Spark DataFrame을 만들고,
Spark writer로 결과를 쓴다.

흐름은 이렇다.

```text
Taxi Parquet 입력
↓
spark.read.parquet(...)
↓
Spark DataFrame
↓
날짜별 Gold metric 집계
↓
frame.write.mode("overwrite").option("compression", "snappy").parquet(...)
↓
결과 Parquet 생성
```

여기서 `snappy`는 Parquet에서 흔히 쓰는 압축 방식이다.
파일 크기를 줄이면서도 분석 도구가 빠르게 읽기 좋다.

로컬 파일로 쓸 때는 `write_single_parquet()`을 사용한다.
Spark는 원래 결과를 폴더 안의 `part-...parquet` 파일들로 쓴다.
그런데 M2 evidence에서는 "결과 파일 경로"를 명확히 넘기는 것이 편하다.
그래서 Spark가 만든 part file 하나를 최종 Parquet 파일 위치로 옮겨 단일 파일처럼 정리한다.

반대로 `s3a://...`로 직접 쓸 때는 `write_parquet_directory()`를 사용한다.
이 경우에는 Spark 방식 그대로 "Parquet directory"를 저장한다.
대용량 분산 처리에서는 결과가 파일 하나가 아니라 여러 part file로 나뉘는 것이 자연스럽기 때문이다.

쉽게 말하면 이렇다.

```text
로컬 evidence:
  사람이 확인하기 쉽게 결과를 단일 Parquet 파일처럼 정리한다.

S3A 직접 쓰기:
  Spark 방식 그대로 object storage 경로 아래에 Parquet directory를 쓴다.
```

## Taxi 데이터는 실제로 어떻게 처리됐나

Taxi runner는 단순히 파일을 복사하지 않는다.
입력 Taxi Parquet을 읽고, 날짜별 지표를 새로 만든다.

실행 순서는 다음과 같다.

```text
1. 입력 경로가 존재하는지 확인한다.
2. SparkSession을 만든다.
3. Taxi Parquet 파일들을 읽는다.
4. 월별 파일마다 조금씩 다를 수 있는 column 타입을 공통 모양으로 맞춘다.
5. 실행 profile에 따라 전체를 읽을지, 일부만 읽을지 정한다.
6. 날짜별 Gold metric을 만든다.
7. 입력 row 수와 출력 row 수를 센다.
8. 결과 Parquet을 저장한다.
9. 입력 bytes, 출력 bytes, 실행 시간, output path를 기록한다.
10. Week2RunnerResult로 반환한다.
```

여기서 4번이 중요하다.
NYC Taxi 데이터는 월별로 파일이 나뉘어 있고, 시점에 따라 column 타입이나 세부 schema가 조금 다를 수 있다.
그래서 `canonicalize_taxi_frame()`이 필요한 column을 공통 타입으로 맞춘다.

예를 들어 이런 값들을 공통 타입으로 맞춘다.

```text
pickup 시간
dropoff 시간
승객 수
이동 거리
요금
팁
통행료
총 결제 금액
```

그 다음 `build_daily_gold_frame()`이 날짜별 Gold metric을 만든다.
여기서 Gold는 최종 분석에 쓰기 좋은 형태로 정리된 결과라는 뜻이다.

대표적으로 이런 값들이 만들어진다.

```text
pickup_date
trip_count
valid_trip_count
invalid_trip_count
total_passenger_count
total_trip_distance
avg_trip_distance
total_fare_amount
total_tip_amount
total_amount
avg_total_amount
avg_duration_minutes
```

즉 원본 Taxi row가 "개별 승차 기록"이라면,
M2 결과는 "날짜별 요약 표"다.

```text
원본:
  2024-01-01 00:03에 탄 한 승객의 이동 기록
  2024-01-01 00:10에 탄 다른 승객의 이동 기록
  ...

M2 Gold 결과:
  2024-01-01 하루 동안 총 몇 건 탔는지
  평균 이동 거리는 얼마인지
  총 결제 금액은 얼마인지
  이상한 row는 몇 건인지
```

이렇게 해야 M6가 나중에 SQL로 "날짜별 매출이 어떻게 바뀌었나" 같은 질문을 던질 수 있다.

## 왜 Spark 실행 엔진을 따로 떼어냈나

처음에는 M5 Airflow 안에서 바로 Spark 코드를 호출하거나,
M3 변환 코드 안에 Spark 실행을 넣는 방식도 가능해 보인다.
하지만 그렇게 하면 책임이 금방 섞인다.

AskLake에서는 역할을 이렇게 나누는 편이 안전하다.

```text
M3:
  어떤 변환을 할지 정의한다.

M2:
  그 변환을 실제 데이터에 실행한다.

M5:
  언제 실행할지, 실행 결과를 어디에 기록할지 관리한다.

M6:
  결과를 SQL과 질의 흐름에서 읽는다.
```

Spark 실행 엔진을 M2에 따로 둔 이유는 이 경계를 지키기 위해서다.

만약 M5가 Spark 실행 세부 구현까지 들고 있으면,
Airflow 코드가 데이터 처리 코드까지 알아야 한다.
그러면 나중에 Spark 설정, S3 설정, Parquet 저장 방식이 바뀔 때 M5도 같이 흔들린다.

만약 M3가 Spark 실행 세부 구현까지 들고 있으면,
M3는 "변환 의미 정의"와 "실행 인프라"를 동시에 책임져야 한다.
그러면 변환 계약을 고치는 일과 실행 환경을 고치는 일이 뒤섞인다.

그래서 M2를 따로 둔 것이다.

```text
M3는 요리법을 쓴다.
M2는 주방 설비를 돌려 실제로 요리한다.
M5는 주문과 영수증을 관리한다.
M6는 완성된 음식을 보고 분석한다.
```

이 비유에서 M2는 주방 설비에 가깝다.
Spark, Parquet, S3, MinIO, 실행 시간, row count 같은 것들이 M2 책임이다.

이렇게 나누면 장점이 있다.

```text
실행 방식 교체가 쉬워진다.
  pyarrow smoke → PySpark local mode → Docker Spark cluster → S3A 직접 쓰기로 단계적으로 바꿀 수 있다.

M5와의 연결이 단순해진다.
  M5는 M2 내부 구현을 몰라도 CLI를 호출하고 결과 JSON만 읽으면 된다.

M6와의 연결이 안정된다.
  M6는 output path와 Parquet 결과만 알면 SQL 검증을 이어갈 수 있다.

테스트와 증거가 표준화된다.
  row count, bytes, duration, output path가 항상 같은 모양으로 남는다.
```

## 설계 의사결정 배경

M2는 처음부터 완성형 Spark 운영 시스템을 만들려고 한 것이 아니다.
시간이 제한되어 있었기 때문에, 위험한 부분부터 작은 단위로 증명하는 방향으로 갔다.

첫 번째 결정은 "작은 데이터로 먼저 Spark 경로를 증명한다"였다.
대용량 데이터를 먼저 붙이면 다운로드, 디스크, 메모리, 실행 시간 문제가 동시에 터진다.
그러면 Spark 코드가 문제인지, 데이터 크기가 문제인지, 저장소가 문제인지 구분하기 어렵다.
그래서 작은 Taxi Parquet으로 먼저 읽기, 집계, 쓰기를 확인했다.

두 번째 결정은 "그 다음 5GB Taxi로 같은 경로를 다시 돌린다"였다.
작은 데이터 성공만으로는 대용량 처리 증거가 약하다.
그래서 입력만 큰 Taxi 묶음으로 바꿔 같은 Spark runner가 버티는지 확인하는 방향을 잡았다.
중요한 점은 코드를 새로 짜는 것이 아니라, 같은 실행 경로에 input만 바꿔서 검증한다는 것이다.

세 번째 결정은 "Docker Spark cluster를 별도 단계로 붙인다"였다.
PySpark local mode는 빠르지만, 실제 Spark cluster 구조와는 거리가 있다.
그래서 Docker 안에 master, worker, driver를 띄워서 Spark cluster 실행 증거를 만들었다.
다만 이 단계도 운영용 Kubernetes나 클라우드 Spark는 아니다.
일주일짜리 MVP에서 필요한 것은 "분산 처리 구조로 넘어갈 수 있는 실행 경계"를 증명하는 것이다.

네 번째 결정은 "MinIO를 먼저 쓰고, AWS S3는 나중에 붙인다"였다.
AWS S3를 바로 쓰면 계정, 권한, 비용, 보안, 네트워크 문제가 같이 생긴다.
MinIO는 로컬에서 S3와 비슷한 방식으로 object storage 흐름을 검증할 수 있다.
그래서 M2는 local path, MinIO upload, `s3a://` 직접 쓰기 가능성을 순서대로 검토했다.

다섯 번째 결정은 "Airflow 안에 Spark 코드를 직접 박지 않는다"였다.
Airflow는 실행 순서와 스케줄을 담당하는 도구다.
Spark 처리 코드를 Airflow DAG 안에 강하게 넣으면, 나중에 테스트와 교체가 어려워진다.
그래서 M2는 CLI와 결과 JSON을 제공하고, M5가 그 CLI를 호출하는 식으로 경계를 잡았다.

정리하면 M2의 설계 방향은 이것이다.

```text
처음부터 큰 시스템을 한 번에 만들지 않는다.
대신 실행 계약을 고정한다.
작은 데이터로 먼저 확인한다.
같은 실행 경로로 큰 데이터에 올린다.
로컬 저장소에서 object storage로 확장한다.
Airflow와는 CLI/result JSON 경계로 연결한다.
```

## 남에게 설명할 때 쓰는 실행 흐름

짧게 설명해야 하면 이렇게 말하면 된다.

```text
M2는 Spark 실행기를 따로 만들었습니다.
먼저 RuntimeConfig나 CLI 인자로 입력 경로와 출력 경로를 받습니다.
그 다음 SparkSession을 만들고,
Taxi Parquet 파일을 Spark DataFrame으로 읽습니다.
월별 Taxi 파일의 schema 차이를 공통 column으로 맞춘 뒤,
날짜별 운행 수, 거리, 요금, 평균값 같은 Gold metric을 집계합니다.
결과는 Parquet으로 저장하고,
입력 row 수, 출력 row 수, bytes, 실행 시간, output path를 Week2RunnerResult 모양으로 남깁니다.
이 결과를 M5가 workflow 실행 결과와 catalog로 이어받고,
M6는 그 output path를 SQL 질의에 사용할 수 있습니다.
```

조금 더 기술적으로 말하면 이렇게 말하면 된다.

```text
Docker Spark evidence에서는 master 1개, worker 2개, driver 1개를 띄웠습니다.
driver 컨테이너 안에서 spark-submit을 실행했고,
--master spark://m2-spark-master:7077로 Spark cluster에 작업을 제출했습니다.
Python entrypoint는 Week2TaxiSparkRunner를 호출했고,
runner는 SparkSession을 만든 뒤 spark.read.parquet으로 입력을 읽고,
DataFrame groupBy/agg로 날짜별 Gold metric을 만든 다음,
Spark writer로 Parquet output을 저장했습니다.
마지막으로 summary JSON과 Week2RunnerResult shape에 row count, bytes, duration, output path를 기록했습니다.
```

## 여태까지 M2에서 한 작업들

### 1. RuntimeConfig와 SparkRunner 경계 만들기

처음 문제는 M2가 무엇을 입력으로 받고 무엇을 결과로 돌려줘야 하는지 애매했다는 점이다.

그래서 `RuntimeConfig`와 `Week2RunnerResult` 경계를 만들었다.

이 작업 덕분에 M5와 M6는 M2 결과를 표준 방식으로 이해할 수 있다.

```text
RuntimeConfig 입력
↓
SparkRunner 실행
↓
Week2RunnerResult 반환
```

### 2. Amazon Reviews JSONL을 Parquet으로 쓰는 runner evidence

Week2 대표 경로는 Amazon Reviews와 Product Health 쪽이다.
그래서 JSONL 입력을 읽고 Parquet으로 쓸 수 있는지 먼저 확인했다.

이 작업은 M2가 반정형 입력을 처리할 수 있다는 최소 증거다.

### 3. Product Health multi-source runtime smoke

Product Health는 source 하나로 끝나지 않는다.

```text
reviews_seed
behavior_events_seed
delivery_trips_seed
product_master_seed
```

이 여러 입력을 `source_inputs[]`로 받을 수 있게 했다.

여기서 중요한 점은 M2가 이 데이터를 의미 있게 합치는 것이 아니라는 점이다.
M2는 source별로 읽고 쓰는 실행 증거를 남긴다.
어떻게 합치고 어떤 지표를 만들지는 M3가 정한다.

### 4. M3 TransformSpec preview 실행

M3가 변환 계약을 만들면 M2가 그 계약을 일부 실행할 수 있어야 한다.

그래서 `select`, `cast`, `aggregate` 같은 preview operation을 지원했다.

이 작업은 M3와 M2를 연결하기 위한 것이다.

```text
M3 TransformSpec
↓
M2 SparkRunner
↓
preview Parquet output
```

### 5. Product Health L6 preview evidence

작은 Product Health 샘플로 `gold_product_health.parquet`를 만들어보고, SQL로 읽히는지 확인했다.

이 작업은 최종 Product Health 완성이 아니다.
다만 아래 흐름이 가능하다는 증거다.

```text
M3 spec
↓
M2 runner
↓
Gold Parquet
↓
DuckDB SQL read
```

### 6. Taxi 5GB local Spark evidence

Product Health 5GB 입력은 아직 준비되지 않았다.
그래서 정형 대용량 증거로 Taxi 데이터를 사용했다.

약 4.87GB Taxi Parquet directory를 PySpark local mode로 읽고 `gold_taxi_daily_metrics`를 만들었다.

이 작업은 "M2가 GB급 데이터를 Spark로 처리할 수 있다"는 증거다.
하지만 Product Health 대표 경로를 대체하지는 않는다.

### 7. Docker Spark evidence

local mode만 쓰면 "내 컴퓨터에서만 돌아간 것"처럼 보일 수 있다.

그래서 Docker 안에서 Spark master, worker, driver를 띄우고 같은 Taxi 처리를 실행했다.

이 작업은 Spark cluster 형태에 가까운 실행 경로를 검증한 것이다.

### 8. MinIO output smoke

처음에는 결과가 local path에만 있었다.
하지만 최종적으로는 S3 같은 object storage에 결과를 저장해야 한다.

그래서 로컬 S3 역할을 하는 MinIO에 결과 파일을 올리는 smoke를 만들었다.

현재 흐름은 이렇다.

```text
Spark 결과를 local path에 씀
↓
Week2StorageAdapter가 같은 파일을 MinIO에 업로드
↓
s3://asklake-demo/... URI 기록
```

아직 Spark가 직접 `s3a://...`에 쓰는 것은 아니다.
그건 후속 작업이다.

### 9. M5 workflow에서 spark_runner 직접 호출

M5는 workflow 실행의 입구다.
그래서 M5가 `executor=spark_runner`를 받으면 M2 `Week2SparkRunner`를 직접 호출할 수 있게 했다.

이 작업이 있어야 M1 화면이나 API에서 실행 요청이 들어왔을 때 M5가 M2 실행기로 연결할 수 있다.

### 10. M5 Airflow SparkRunner handoff

Airflow 안에서 M2를 호출하려면 CLI가 필요하다.

그래서 `scripts/week2_m2_airflow_sparkrunner_handoff.py`를 추가했다.

이 스크립트는 M2 runner를 실행하고, M5가 읽을 수 있는 `week2_result` JSON 파일을 만든다.

```text
Airflow DAG task
↓
scripts/week2_m2_airflow_sparkrunner_handoff.py
↓
Week2SparkRunner
↓
week2_result JSON
↓
Week2AirflowAdapter
```

이 작업은 Airflow 자체 구현이 아니라 M2와 M5 사이의 연결 플러그다.

## 지금 M2가 완료한 것과 남은 것

완료한 것은 실행기의 핵심 뼈대다.

```text
RuntimeConfig
SparkRunner
Week2RunnerResult
multi-source input
TransformSpec preview
Product Health small preview
Taxi 5GB Spark evidence
Docker Spark evidence
MinIO upload smoke
M5 direct spark_runner 연결
M5 Airflow handoff
```

남은 것은 최종 통합과 저장소 고도화다.

```text
PR #271 merge
Spark direct s3a:// write 검토
Product Health 5GB 입력 준비 후 scale evidence
M5 Airflow DAG에서 실제 CLI 호출 연결
M3 최종 TransformSpec 기반 실행
```

그래서 M2를 끝났다고 말하려면 조심해야 한다.

```text
M2의 runtime core는 거의 완료됐다.
하지만 최종 완료는 Product Health 5GB 대표 경로와 M5/M3 통합 증거까지 봐야 한다.
```

## 30초 설명 버전

M2는 AskLake에서 대용량 데이터 실행 계층을 맡았다.
입력 데이터와 실행 설정을 `RuntimeConfig`로 받고, `SparkRunner`가 데이터를 읽어 Parquet으로 저장한 뒤, row count, bytes, duration, output path 같은 실행 증거를 `Week2RunnerResult`로 반환한다.
이 결과를 M5가 `ExecutionResult`와 Catalog로 저장하고, M6가 SQL이나 AI Query에서 사용한다.
Taxi 5GB, Docker Spark, MinIO 업로드는 이 실행 계층이 실제 대용량과 저장소까지 갈 수 있다는 증거다.

## 2분 설명 버전

우리 프로젝트에서 M2는 데이터를 어떻게 분석할지 정하는 파트가 아니다.
그건 M3가 맡는다.

M2는 M3나 M5가 정한 실행 요청을 실제로 돌리는 runtime layer다.
예를 들어 입력 파일 위치, 파일 형식, 출력 위치, 저장소 설정이 `RuntimeConfig`로 들어오면, M2의 `SparkRunner`가 그 설정을 보고 데이터를 읽고 Parquet 결과를 만든다.
실행이 끝나면 성공 여부, 처리한 row 수, 읽은 bytes, 걸린 시간, output path, output file 크기를 `Week2RunnerResult`로 돌려준다.

이 결과가 중요한 이유는 M5가 workflow 실행 결과를 저장해야 하고, Catalog에 output path와 metric을 남겨야 하기 때문이다.
M6도 이 Catalog와 output file을 읽어서 SQL이나 AI Query를 해야 한다.
그래서 M2는 단순히 파일 하나 만드는 역할이 아니라, M5와 M6가 믿고 이어받을 수 있는 실행 증거를 만드는 역할이다.

현재 M2는 Amazon Reviews JSONL, Product Health source inputs, M3 TransformSpec preview, Taxi 5GB local Spark, Docker Spark, MinIO upload, M5 Airflow handoff까지 검증했다.
남은 것은 Spark가 직접 `s3a://...` 경로에 쓰는 방식과, Product Health 5GB 입력이 준비됐을 때 대표 경로 evidence를 남기는 것이다.

## 질문을 받았을 때 답하는 법

### M2가 정확히 뭐 했냐고 물으면

M2는 대용량 데이터 실행기를 만들었다고 답하면 된다.
Spark로 데이터를 읽고, Parquet으로 쓰고, 결과 위치와 실행 metric을 표준 결과로 남기게 했다.

### 왜 Taxi를 썼냐고 물으면

Product Health 5GB 입력이 아직 준비되지 않았기 때문에, 정형 대용량 데이터 처리 증거로 Taxi를 사용했다고 답하면 된다.
Taxi는 대표 분석 경로가 아니라 Spark 대용량 처리 evidence다.

### Product Health는 누가 하냐고 물으면

Product Health의 의미와 지표 정의는 M3가 맡고, M2는 그 작업을 실행할 runtime을 제공한다고 답하면 된다.
5GB 입력이 준비되면 M2가 같은 실행 경로로 scale evidence를 남긴다.

### MinIO는 왜 썼냐고 물으면

AWS S3를 바로 붙이면 권한과 비용과 네트워크 문제가 생기기 때문에, 로컬에서 S3와 비슷하게 검증하려고 MinIO를 썼다고 답하면 된다.

### Airflow handoff는 왜 필요하냐고 물으면

M5 Airflow가 M2를 호출하려면 실행 명령과 결과 파일 모양이 필요하기 때문이다.
M2 handoff CLI는 Airflow가 M2 runner를 실행하고 M5가 읽을 수 있는 `week2_result`를 만들게 해주는 연결 플러그다.

## 딱 하나만 기억하기

M2는 데이터 의미를 정하는 파트가 아니라, 정해진 데이터 처리 작업을 Spark와 저장소 위에서 실제로 실행하고 증거를 남기는 파트다.
