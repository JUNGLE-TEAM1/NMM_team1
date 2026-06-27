# M5 Airflow 연결 설계 선택지

## 문서 목적

이 문서는 M5가 실제 Airflow를 붙이기 전에 정해야 하는 선택지를 정리한다.

현재 상태는 다음과 같다.

- `localhost:8080`은 현재 접속되지 않는다. 즉 로컬 Airflow webserver가 떠 있지 않다.
- repository의 `docker-compose.yml`에는 `backend`, `frontend`만 있고 Airflow 서비스는 없다.
- M5에는 `Week2AirflowAdapter`가 있다. 이 코드는 Airflow에 DAG 실행 요청을 보낼 수 있는 backend 연결 부품이다.
- 아직 실제 Airflow 서버, scheduler, DAG 파일, 실제 결과 전달 방식은 구현되어 있지 않다.

한 줄로 말하면, 지금 필요한 다음 작업은 "Airflow를 실제로 띄우고, DAG를 넣고, backend가 그 DAG를 실행해서 결과를 Catalog까지 저장하는지 확인하는 일"이다.

## 추천 결론

이번 프로젝트 상황에서는 아래 조합을 추천한다.

| 결정 | 추천 |
| --- | --- |
| Airflow 실행 방식 | 별도 `docker-compose.airflow.yml` |
| DAG 위치 | repo 안의 `airflow/dags/asklake_week2_reviews.py` |
| 결과 전달 방식 | shared volume에 `airflow_result.json` 파일을 쓰고 backend adapter가 읽기 |
| 데이터/결과 저장 위치 | local shared volume `data/week2` |
| 실패 처리 | 일반 demo API는 local fallback 유지, Airflow smoke 검증은 fallback 숨김 없이 확인 |
| 실행 방식 | 처음에는 짧은 synchronous polling |
| 인증/설정 | local 기본 계정은 `.env.example` 수준으로 문서화, 실제 secret은 commit 금지 |

이 조합이 좋은 이유는 단순하다.

- 이번 주 목표는 "Airflow 운영 플랫폼 완성"이 아니라 "M5가 Airflow 실행 경로를 실제로 통과했다는 증거"를 만드는 것이다.
- Docker compose로 누구나 같은 방식으로 띄울 수 있어야 한다.
- Airflow가 만든 결과 파일을 backend가 실제로 읽을 수 있어야 Catalog 저장까지 검증된다.
- XCom이나 S3/MinIO부터 붙이면 설계가 커져서 오늘 끝내기 어렵다.

## 결정 1. Airflow를 어떻게 띄울 것인가

### 선택지 A. 별도 `docker-compose.airflow.yml`을 만든다

의미:

- 기존 `docker-compose.yml`은 backend/frontend용으로 둔다.
- Airflow용 compose 파일을 따로 만든다.
- 필요할 때만 Airflow webserver/scheduler/metadata DB를 띄운다.

장점:

- 기존 app compose를 무겁게 만들지 않는다.
- Airflow가 필요한 사람만 띄울 수 있다.
- Airflow 설정이 backend/frontend 설정과 섞이지 않는다.
- PR 검토자가 "이 변경은 Airflow smoke용이구나"라고 보기 쉽다.

단점:

- 실행 명령이 하나 더 생긴다.
- backend와 Airflow를 같이 띄울 때 환경변수 연결을 잘 문서화해야 한다.

보통 언제 선택하나:

- Airflow가 모든 개발자에게 항상 필요한 것은 아닐 때.
- 프로젝트가 아직 MVP이고, 통합 smoke가 목적일 때.
- 기존 compose를 안정적으로 유지하고 싶을 때.

이번 프로젝트 추천:

- 추천한다.
- 지금 repo의 기본 compose는 단순하다. 여기에 Airflow까지 바로 섞으면 backend/frontend 실행도 무거워진다.

### 선택지 B. 기존 `docker-compose.yml`에 Airflow를 바로 추가한다

의미:

- `docker compose up`만으로 backend/frontend/Airflow를 모두 띄운다.

장점:

- 실행 명령이 단순하다.
- "전체 서비스 한 번에 실행"은 보기 좋다.

단점:

- 기본 개발 환경이 갑자기 무거워진다.
- Docker daemon, Airflow image, metadata DB 준비 때문에 app만 확인하려는 사람도 오래 기다릴 수 있다.
- Airflow가 깨지면 backend/frontend 개발까지 불편해질 수 있다.

보통 언제 선택하나:

- Airflow가 제품의 기본 실행 조건일 때.
- 팀원 모두가 Airflow까지 항상 띄우는 단계일 때.

이번 프로젝트 추천:

- 지금은 추천하지 않는다.
- 아직 Airflow DAG와 결과 계약이 확정되지 않았기 때문에 기본 compose에 넣기에는 이르다.

### 선택지 C. 각자 로컬에 Airflow를 따로 설치해서 쓴다

의미:

- repo에는 Airflow 실행 설정을 거의 두지 않는다.
- 사람마다 로컬 Airflow 설치를 알아서 한다.

장점:

- repo 변경이 적다.
- 이미 Airflow를 잘 아는 사람은 빠르게 테스트할 수 있다.

단점:

- 팀원마다 환경이 달라진다.
- "내 컴퓨터에서는 됨" 문제가 생기기 쉽다.
- 발표 전 재현성이 약하다.

보통 언제 선택하나:

- 팀이 이미 Airflow 운영 환경을 갖고 있을 때.
- repo가 Airflow 실행 환경을 소유하지 않는 회사 프로젝트일 때.

이번 프로젝트 추천:

- 추천하지 않는다.
- 지금은 팀 발표와 재현 가능한 evidence가 더 중요하다.

## 결정 2. DAG 파일을 어디에 둘 것인가

### 선택지 A. repo 안에 `airflow/dags/asklake_week2_reviews.py`를 둔다

의미:

- Airflow 작업 순서표를 repository에서 관리한다.
- compose에서 이 폴더를 Airflow container의 DAG folder로 mount한다.

장점:

- 코드 리뷰가 가능하다.
- 어떤 DAG가 실행되는지 팀원이 바로 볼 수 있다.
- backend adapter의 `dag_id`와 DAG 파일이 같은 PR에서 맞춰진다.

단점:

- Airflow import 경로와 repo 내부 import 경로를 조심해야 한다.
- DAG 안에 너무 많은 backend 내부 코드를 직접 import하면 container 의존성이 커진다.

보통 언제 선택하나:

- DAG 자체가 프로젝트 산출물일 때.
- 발표나 CI smoke에서 DAG를 재현해야 할 때.

이번 프로젝트 추천:

- 추천한다.
- M5의 산출물은 workflow runtime이므로 DAG 파일도 repo 안에서 추적하는 것이 맞다.

### 선택지 B. Airflow UI에서 DAG나 Variable을 직접 만든다

의미:

- repo에는 DAG 파일을 두지 않고 Airflow 화면 또는 로컬 설정으로 만든다.

장점:

- 빠르게 실험할 수 있다.

단점:

- PR에 증거가 남지 않는다.
- 다른 팀원이 같은 상태를 재현하기 어렵다.
- 발표 직전에 환경이 날아가면 복구가 어렵다.

보통 언제 선택하나:

- 일회성 실험이나 throwaway spike일 때.

이번 프로젝트 추천:

- 추천하지 않는다.

### 선택지 C. Airflow image 안에 DAG를 bake한다

의미:

- Docker image build 시 DAG 파일을 image 안에 복사한다.

장점:

- image만 있으면 DAG가 항상 들어 있다.
- 운영 배포에는 더 안정적일 수 있다.

단점:

- DAG 수정 때마다 image rebuild가 필요하다.
- 로컬 개발 반복이 느려진다.

보통 언제 선택하나:

- 배포 환경에서 DAG 버전을 image tag로 고정해야 할 때.

이번 프로젝트 추천:

- 지금은 추천하지 않는다.
- Week2 smoke 단계에서는 volume mount가 더 빠르고 단순하다.

## 결정 3. Airflow 결과를 backend가 어떻게 받을 것인가

### 선택지 A. shared volume에 결과 JSON 파일을 쓴다

의미:

- DAG가 실행 끝에 이런 파일을 만든다.

```text
data/week2/_airflow_results/run_reviews_demo_001.json
```

파일 안에는 backend가 필요한 결과를 넣는다.

```json
{
  "status": "succeeded",
  "output_path": "data/week2/runs/run_reviews_demo_001/dataset_reviews_gold.jsonl",
  "output_row_count": 120,
  "output_bytes": 4567,
  "duration_ms": 1234,
  "task_results": [
    {
      "node_id": "airflow_dag_reviews",
      "status": "succeeded",
      "attempt": 1,
      "row_count": 120,
      "bytes": 4567,
      "error": null
    }
  ]
}
```

backend adapter는 Airflow DAG가 `success`가 된 뒤 이 파일을 읽어서 `Week2RunnerResult`로 바꾼다.

장점:

- 가장 단순하다.
- Airflow API의 XCom 상세 endpoint를 몰라도 된다.
- 사람이 직접 파일을 열어 결과를 확인할 수 있다.
- Catalog 저장에 필요한 `output_path`, row count, bytes를 명확하게 받을 수 있다.

단점:

- backend와 Airflow가 같은 volume을 봐야 한다.
- 나중에 S3/MinIO로 가면 result artifact 위치 규칙을 바꿔야 할 수 있다.

보통 언제 선택하나:

- local MVP smoke.
- 발표용 재현성.
- Airflow 연결 자체를 먼저 증명해야 할 때.

이번 프로젝트 추천:

- 추천한다.
- 지금은 "진짜 Airflow 경로가 Catalog까지 이어진다"를 작게 증명하는 것이 목표다.

### 선택지 B. Airflow XCom으로 결과를 넘긴다

의미:

- DAG task가 XCom에 `week2_result`를 push한다.
- backend adapter가 Airflow REST API로 XCom 값을 읽는다.

장점:

- Airflow답다.
- DAG run 내부 결과로 남는다.
- shared result JSON 파일 규칙이 없어도 된다.

단점:

- Airflow API endpoint가 더 복잡해진다.
- 인증과 권한 이슈가 늘어난다.
- 큰 결과를 XCom에 넣으면 안 된다. XCom은 큰 데이터 전달용이 아니다.

보통 언제 선택하나:

- Airflow API와 XCom 사용이 이미 익숙할 때.
- 결과 payload가 작고, Airflow metadata DB에 남겨도 되는 값일 때.

이번 프로젝트 추천:

- 지금은 후순위다.
- 추후에 shared file 방식이 안정화된 뒤 XCom에는 result file path만 넣는 방식으로 확장할 수 있다.

### 선택지 C. DAG run response 안에 `week2_result`가 있다고 가정한다

의미:

- backend adapter가 DAG run 조회 응답에서 바로 `week2_result`를 찾는다.

장점:

- fake test에서는 아주 쉽다.

단점:

- 실제 Airflow DAG run API는 task 결과를 자동으로 top-level response에 넣어주지 않는다.
- 지금 fake HTTP test와 실제 Airflow 동작이 다를 가능성이 높다.

보통 언제 선택하나:

- adapter 단위 테스트에서만 사용한다.

이번 프로젝트 추천:

- 실제 smoke에서는 이 가정에 의존하지 않는다.
- 다음 구현에서 shared result JSON 또는 XCom 읽기로 바꿔야 한다.

## 결정 4. Airflow와 backend가 같은 데이터를 어떻게 볼 것인가

### 선택지 A. local shared volume `data/week2`를 같이 mount한다

의미:

- host의 `data/week2`를 backend와 Airflow가 같이 본다.
- Airflow가 파일을 쓰면 backend도 같은 경로로 읽는다.

장점:

- local smoke가 쉽다.
- MinIO/S3 없이도 결과 파일 확인이 된다.
- 현재 M5 local runner의 output convention과 잘 맞는다.

단점:

- 운영형 storage는 아니다.
- container 내부 경로와 host 경로가 꼬일 수 있으므로 path convention을 조심해야 한다.

보통 언제 선택하나:

- 로컬 데모.
- Week2 발표 evidence.
- storage보다 실행 연결 검증이 우선일 때.

이번 프로젝트 추천:

- 추천한다.
- 지금은 Airflow 연결 smoke를 빠르게 끝내야 한다.

### 선택지 B. MinIO/S3-compatible storage를 쓴다

의미:

- Airflow가 결과를 MinIO/S3에 쓰고 backend는 그 URI를 Catalog에 저장한다.

장점:

- 실제 lakehouse 구조에 더 가깝다.
- M2 runtime 방향과 잘 맞는다.
- container 경로 문제를 줄일 수 있다.

단점:

- MinIO service, bucket, credentials, endpoint 설정이 추가된다.
- M5 Airflow smoke 하나가 M2 storage smoke까지 끌어안게 된다.

보통 언제 선택하나:

- M2 RuntimeConfig/SparkRunner가 준비된 뒤.
- S3-compatible path가 발표 핵심 증거일 때.

이번 프로젝트 추천:

- 지금은 후순위다.
- M2와 붙는 다음 단계에서 선택하는 것이 낫다.

### 선택지 C. Airflow container 내부 local path만 쓴다

의미:

- Airflow container 안에서만 결과 파일을 만든다.

장점:

- DAG 내부 구현은 간단할 수 있다.

단점:

- backend가 결과를 못 읽는다.
- Catalog에 저장할 실제 evidence가 약해진다.

보통 언제 선택하나:

- DAG 내부 단독 실험일 때.

이번 프로젝트 추천:

- 추천하지 않는다.

## 결정 5. Airflow 실패 시 local runner fallback을 어떻게 다룰 것인가

### 선택지 A. 항상 fallback을 켠다

의미:

- Airflow가 실패해도 backend가 local runner로 대신 실행한다.

장점:

- demo가 잘 깨지지 않는다.
- 사용자는 결과를 계속 받을 수 있다.

단점:

- Airflow 연결이 실제로 실패했는데도 성공처럼 보일 수 있다.
- "Airflow smoke 성공"을 검증하기 어렵다.

보통 언제 선택하나:

- 사용자 demo 안정성이 가장 중요할 때.

이번 프로젝트 추천:

- 일반 API demo에서는 유지한다.
- 단, Airflow 연결 검증에서는 이것만으로는 부족하다.

### 선택지 B. Airflow smoke에서는 fallback을 숨기지 않는다

의미:

- 일반 demo API는 fallback을 유지한다.
- 하지만 Airflow smoke 검증에서는 "진짜 Airflow 성공"인지 따로 확인한다.
- 예를 들어 run log 마지막이 `airflow adapter executed Week 2 workflow boundary`인지 확인한다.

장점:

- demo 안정성과 Airflow 검증을 둘 다 챙긴다.
- Airflow가 실패했는데 local runner가 성공한 상황을 구분할 수 있다.

단점:

- smoke 검증 조건을 문서화해야 한다.
- 필요하면 adapter나 API에 strict mode가 추가될 수 있다.

보통 언제 선택하나:

- fallback이 있는 시스템에서 실제 외부 연결을 검증해야 할 때.

이번 프로젝트 추천:

- 추천한다.
- 이번 프로젝트에 가장 맞다.

### 선택지 C. fallback을 제거한다

의미:

- Airflow 실패 시 그냥 실패한다.

장점:

- 실패가 숨겨지지 않는다.
- Airflow 운영 문제를 빨리 발견한다.

단점:

- 발표 demo가 쉽게 깨진다.
- Airflow가 아직 안정화되지 않은 지금은 위험하다.

보통 언제 선택하나:

- Airflow가 이미 안정적인 production dependency일 때.

이번 프로젝트 추천:

- 지금은 추천하지 않는다.

## 결정 6. backend가 Airflow 완료를 기다리는 방식

### 선택지 A. 짧은 synchronous polling

의미:

- backend가 Airflow DAG를 trigger한다.
- 몇 번 상태를 확인한다.
- 성공 또는 실패 결과를 바로 run response에 담는다.

장점:

- 현재 `Week2WorkflowService.trigger_run()` 구조와 잘 맞는다.
- UI에서 바로 성공/실패를 볼 수 있다.
- 구현이 작다.

단점:

- 오래 걸리는 DAG에는 맞지 않는다.
- polling 시간이 길어지면 API 응답이 느려진다.

보통 언제 선택하나:

- DAG가 짧게 끝나는 smoke/demo일 때.
- 먼저 연결을 증명해야 할 때.

이번 프로젝트 추천:

- 추천한다.
- Week2 smoke DAG는 작고 빨리 끝나야 한다.

### 선택지 B. async run 생성 후 UI가 status를 따로 조회한다

의미:

- backend는 run만 만들고 바로 반환한다.
- UI가 run status API를 계속 조회한다.

장점:

- 실제 workflow 제품에 더 가깝다.
- 긴 작업에 적합하다.

단점:

- UI 상태 처리와 run status update가 더 복잡해진다.
- 이번 Airflow 연결 smoke보다 범위가 커진다.

보통 언제 선택하나:

- 긴 batch, backfill, multi-task workflow를 다룰 때.

이번 프로젝트 추천:

- 지금은 후순위다.
- M1 run status UI가 안정화된 뒤 확장한다.

## 결정 7. 인증과 환경변수를 어떻게 둘 것인가

### 선택지 A. local 기본 계정과 `.env.example`만 문서화한다

의미:

- local Airflow는 `airflow` / `airflow` 같은 기본 계정을 쓴다.
- 실제 비밀번호나 token은 commit하지 않는다.
- 필요한 환경변수 이름만 문서화한다.

예시:

```bash
ASKLAKE_WEEK2_AIRFLOW_BASE_URL=http://localhost:8080
ASKLAKE_WEEK2_AIRFLOW_DAG_ID=asklake_week2_reviews
ASKLAKE_WEEK2_AIRFLOW_USERNAME=airflow
ASKLAKE_WEEK2_AIRFLOW_PASSWORD=airflow
ASKLAKE_WEEK2_AIRFLOW_MAX_POLLS=10
ASKLAKE_WEEK2_AIRFLOW_POLL_INTERVAL_SECONDS=1
```

장점:

- 팀원이 바로 따라 할 수 있다.
- secret 유출 위험이 낮다.

단점:

- 운영 수준 보안은 아니다.

보통 언제 선택하나:

- local demo와 MVP smoke.

이번 프로젝트 추천:

- 추천한다.

### 선택지 B. 인증 없이 Airflow API를 연다

의미:

- local Airflow API를 인증 없이 접근한다.

장점:

- 테스트가 단순하다.

단점:

- 보안 습관이 나쁘다.
- 나중에 인증을 붙일 때 adapter behavior가 바뀔 수 있다.

보통 언제 선택하나:

- 아주 짧은 throwaway spike.

이번 프로젝트 추천:

- 추천하지 않는다.

### 선택지 C. secret manager나 운영형 credential을 바로 붙인다

의미:

- Vault, cloud secret, GitHub secret 등을 바로 붙인다.

장점:

- 운영에 가깝다.

단점:

- 이번 Week2 local smoke에는 과하다.
- 팀원 로컬 재현성이 떨어진다.

보통 언제 선택하나:

- 배포 환경 연결 단계.

이번 프로젝트 추천:

- 지금은 제외한다.

## 다음 slice 권장 범위

다음 작업은 아래까지만 잡는 것을 추천한다.

1. `docker-compose.airflow.yml` 추가
2. `airflow/dags/asklake_week2_reviews.py` 추가
3. `data/week2` shared volume 연결
4. DAG가 Amazon Reviews sample을 읽고 작은 JSONL output을 만든다
5. DAG가 `data/week2/_airflow_results/<run_id>.json`을 만든다
6. `Week2AirflowAdapter`가 DAG success 후 result JSON을 읽는다
7. `executor=airflow` 실행이 local fallback 없이 Catalog까지 저장되는 smoke를 남긴다

## 이번 slice에서 하지 않는 것이 좋은 일

- MinIO/S3까지 동시에 붙이지 않는다.
- SparkRunner까지 동시에 붙이지 않는다.
- full async scheduler UI까지 동시에 만들지 않는다.
- Airflow production deployment나 secret manager를 붙이지 않는다.
- 모든 데이터 경로를 Airflow DAG 하나에 넣지 않는다.

## 최종 판단

지금 프로젝트에서 중요한 것은 "Airflow를 멋지게 운영하는 것"이 아니라 "M5 workflow runtime이 실제 Airflow 경로를 통과해 결과를 만들고, 그 결과가 Catalog에 저장되는 것"이다.

따라서 가장 좋은 선택은 다음이다.

```text
별도 Airflow compose
↓
repo DAG
↓
shared local volume
↓
result JSON artifact
↓
backend adapter가 읽기
↓
Catalog 저장 smoke
```

이렇게 하면 오늘 또는 다음 slice에서 끝낼 수 있는 크기로 실제 Airflow 연결을 증명할 수 있다.
