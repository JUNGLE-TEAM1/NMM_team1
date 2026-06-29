# 05. 수용 시나리오와 체크리스트

## 1) 대표 성공 시나리오

AskLake의 Target MVP 대표 성공 시나리오는 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 루프다.

1. 데이터 엔지니어가 source를 연결하고 schema/sample을 확인한다.
2. 시스템이 schema inference 또는 user override를 거쳐 transform/normalize/load 실행 계획을 만든다.
3. Data Plane이 output dataset을 만들고 output path, row count, bytes, duration, SQL 검산 evidence를 남긴다.
4. 시스템이 catalog draft와 pipeline/job 상태를 만든다.
5. 스튜어드가 quality, PII, owner, access policy, approval 조건을 검토한다.
6. 필수 gate를 통과한 dataset만 `Trusted`로 게시된다.
7. 분석가 또는 업무 사용자가 Query 또는 Ask를 실행한다.
8. 시스템은 권한 preflight와 masking/deny 정책을 적용한다.
9. 결과는 SQL, dataset, metric, document chunk, freshness, lineage, policy decision, retrieval trace evidence를 보여준다.
10. schema drift, freshness 지연, 품질 실패가 발생하면 영향을 받는 자산이 `Degraded` 또는 `Blocked`로 표시된다.
11. retry/rerun/backfill 후 중복/누락 없이 상태가 복구되고 audit event가 남는다.

## 2) Current Baseline Acceptance

기존 M0~M5 current implementation baseline은 historical evidence로 보존한다.
아래 기준은 baseline 회귀 확인용이며 Target MVP 전체 범위를 의미하지 않는다.

- [ ] 사용자가 샘플 CSV/local file source를 등록할 수 있다.
- [ ] Catalog detail에서 schema, row count, sample rows, status를 확인할 수 있다.
- [ ] 사용자가 `select_fields` 기반 최소 pipeline run을 실행할 수 있다.
- [ ] run status가 success 또는 failed로 명확히 표시된다.
- [ ] result dataset의 status, row count, 저장 위치를 확인할 수 있다.
- [ ] 실패한 output을 ready/success처럼 표시하지 않는다.

## 3) Target MVP Acceptance

### Product Rebaseline

- [ ] `README.md`가 AskLake를 Trusted Data & AI Platform 방향으로 설명한다.
- [ ] `docs/01`이 current baseline과 Target MVP를 구분한다.
- [ ] `docs/02`가 current baseline과 target architecture를 구분한다.
- [ ] `docs/03`이 baseline contract와 Target MVP interface family를 구분한다.
- [ ] 기존 M0~M5 report를 historical evidence로 유지하고 소급 수정하지 않는다.
- [ ] 다음 구현 Phase가 하나로 제안되어 있다.

### Modular Contract Baseline

- [ ] `docs/03`이 Target MVP workstream별 shared contract와 owner를 정의한다.
- [ ] 각 contract에 mock/fake adapter 허용 범위가 있다.
- [ ] `docs/08`이 R1~R7을 선형 queue가 아니라 workstream alias와 integration spine으로 해석한다.
- [ ] `.milestones/target-mvp/manifest.yaml` 또는 동등한 manifest가 workstream scope, contract, integration checkpoint를 기록한다.
- [ ] 첫 병렬 wave와 integration checkpoint가 하나 이상 제안되어 있다.
- [ ] Week 2 모듈 구현 전 `contracts/*.sample.json` fixture가 producer/consumer 경계, `TransformSpec`, `RuntimeConfig`, `KafkaTopicContract`, Airflow/local runner/spark runner 호환 결과, SQL engine adapter 경계를 제공한다.
- [ ] Week 2 모듈 구현 전 API/UI route, ID 규칙, storage path pattern, workflow/run status, `QueryResult`, guardrail failure shape, daily smoke evidence 형식이 공통 계약으로 확인된다.
- [ ] Week 2 상품 리스크 대표 경로는 `pipeline_product_health_e2e`가 5GB 이상 reviews/behavior/delivery fact input을 처리해 `dataset_product_health_gold` / `gold_product_health`를 생성하고, source별 row count, bytes, duration, output path, run id를 evidence로 남긴다.
- [ ] `gold_product_health` output은 M5 Catalog에 등록되고, M6는 Gold output file을 SQL로 조회해 위험 상품군과 근거 지표를 `AIQueryResult`로 반환한다.
- [ ] M6 `AIQueryResult`는 기존 `sql`, `query_result`, `rows`, `summary`, `evidence`를 유지하면서 `route`와 `retrieval_trace`로 어떤 경로와 CatalogMetadata 근거를 선택했는지 설명한다.
- [ ] M6 Catalog RAG-lite index는 CatalogMetadata의 안전한 metadata chunk만 사용하고, `retrieval_trace`에 schema/metric/lineage 근거를 evidence와 연결해 남긴다.
- [ ] M6 Hybrid Route는 SQL-only, RAG-only, Hybrid, Unsupported 질문을 구분하고, Hybrid는 SQL rows와 CatalogMetadata evidence를 함께 사용한다.
- [ ] Week 2 M5 Airflow smoke는 실제 DAG 실행 결과 artifact를 backend가 읽고, `executor=airflow` run이 fallback 없이 Catalog lineage와 metrics를 갱신한다.
- [ ] M2 Taxi local batch supporting evidence는 TLC Taxi Parquet 입력을 `gold_taxi_daily_metrics` Parquet output으로 만들고 row count, bytes, duration, output path를 기록한다. 이는 `gold_product_health` 대표 경로를 대체하지 않는다.
- [ ] M4 Kafka replay는 성공/실패 실행 증거를 `KAFKA_REPLAY_EVIDENCE_DIR`에 남기고, 실패 producer batch row를 `KAFKA_REPLAY_DEAD_LETTER_DIR`의 JSONL로 남긴다.
- [ ] M4 Kafka replay local evidence는 `KAFKA_REPLAY_EVIDENCE_RETENTION_DAYS`로 자동 삭제 기준을 조정할 수 있다.

### Trusted Dataset

- [ ] 입력 source 또는 dataset은 schema inference, user override, 또는 schema 확인을 거친다.
- [ ] transform/normalize/load 결과가 output dataset으로 남는다.
- [ ] row count, bytes, duration, output path 같은 처리 증거가 기록된다.
- [ ] SQL 또는 `QueryResult`로 output dataset 결과를 검산할 수 있다.
- [ ] dataset은 `Draft`, `Verifying`, `Trusted`, `Degraded`, `Blocked`, `Archived` 상태를 구분한다.
- [ ] 최초 실행 성공만으로 dataset이 `Trusted`가 되지 않는다.
- [ ] 품질, PII, owner, access policy, approval gate 중 남은 조건이 사용자에게 보인다.
- [ ] gate 실패 시 dataset은 일반 Query/Ask 후보로 노출되지 않는다.
- [ ] `Blocked` dataset은 신규 소비가 차단된다.

### Query / Ask

- [ ] Query 실행 전 policy preflight가 적용된다.
- [ ] 권한 없는 컬럼이나 dataset은 실행, retrieval, prompt 단계 전에 제거되거나 차단된다.
- [ ] Ask는 SQL, RAG, Hybrid, Unsupported 중 하나로 route된다.
- [ ] Ask route와 retrieval trace는 응답에 남아 UI나 report가 M6 scoring을 재계산하지 않아도 선택 근거를 표시할 수 있다.
- [ ] Catalog RAG-lite index는 source of truth가 아니라 derived cache이며, CatalogMetadata `dataset_id + run_id + updated_at` 변경 시 stale로 보고 재생성된다.
- [ ] RAG-only Ask는 SQL engine validate/execute를 호출하지 않고 CatalogMetadata evidence로만 답한다.
- [ ] 근거가 부족한 답변은 성공처럼 표시되지 않고 보류 또는 `Insufficient Evidence`로 표시된다.
- [ ] Query/Ask 결과는 evidence와 연결된다.

### Evidence

- [ ] Evidence는 최소한 사용 dataset, SQL 또는 query plan, freshness, policy decision을 포함한다.
- [ ] 문서 기반 답변은 document chunk 또는 retrieval trace와 연결된다.
- [ ] AI answer는 권한 결정과 audit event를 남긴다.
- [ ] 사용자는 결과에서 dataset detail, query, access request, feedback 흐름으로 이동할 수 있다.

### Recovery

- [ ] schema drift, quality failure, freshness delay가 dataset status에 반영된다.
- [ ] 영향 dataset, query, dashboard, AI index 또는 answer 후보를 확인할 수 있다.
- [ ] retry/rerun/backfill은 대상 구간과 idempotency 기준을 기록한다.
- [ ] 복구 후 quality/freshness를 재검증하고 상태를 갱신한다.
- [ ] 복구 과정과 결과는 audit/incident 기록으로 남는다.

## 4) 문서와 계약 일관성

- [ ] `docs/01` product scope가 `README.md` 외부 요약과 일치한다.
- [ ] `docs/02` architecture가 `docs/03` interface family와 일치한다.
- [ ] `docs/03` baseline contract가 현재 구현과 일치한다.
- [ ] `docs/05` acceptance가 `docs/06` regression guard와 연결된다.
- [ ] `docs/07` manual verification이 현재 workflow와 Target MVP를 구분한다.
- [ ] `docs/08` 다음 Phase queue가 `docs/01` milestone과 일치한다.
- [ ] 협업 질문/명령 처리 규칙은 일반론, 저장소 규칙, 비교 답변, 실행 승인, 정책 결정을 구분하고 필요한 경우 전제를 명시한다.

## 5) 배포와 운영 기준

- [ ] local/container health/smoke check가 통과한다.
- [ ] local development support tier와 미검증 OS/shell 범위가 `docs/04`에 기록되어 있다.
- [ ] 필요한 env 값이 실제 secret 없이 문서화되어 있다.
- [ ] Docker image build/run 경로가 기록되어 있다.
- [ ] Kubernetes manifest 또는 Helm 후보가 secret 없이 검증 가능하다.
- [ ] AWS resource 생성 전 비용/권한/rollback approval gate가 기록되어 있다.
- [ ] migration/data 변경이 있으면 검증되어 있다.
- [ ] log, status center, incident 또는 report가 조치 가능한 실패 원인을 보여준다.
- [ ] rollback 또는 recovery note가 있다.

## 6) 릴리스 / 제출 게이트

- [ ] 핵심 성공 경로를 최소 1회 완료했다.
- [ ] test/build/smoke/manual verification 결과를 기록했다.
- [ ] secret을 commit하지 않았다.
- [ ] 알려진 제한 사항을 문서화했다.
- [ ] 최신 report가 evidence와 acceptance criteria를 연결한다.

## 7) Target MVP Workstream / Integration 체크포인트

| Checkpoint | 수용 체크포인트 |
| --- | --- |
| R0. Product Rebaseline | current baseline과 Target MVP가 문서에서 분리되고 하네스 검증이 통과한다. |
| R0.5. Modular Contract Baseline | shared contract, owner, mock/fake boundary, integration spine이 문서와 manifest에 기록된다. |
| Week 2 Contract Setup | `contracts/*.sample.json`이 M1~M6 fixture contract, `TransformSpec`, `RuntimeConfig`, `KafkaTopicContract`, adapter/fallback 경계를 제공한다. |
| Week 2 Shared Contract Hardening | M1~M6 구현 전 route, ID, path, status, `QueryResult`, guardrail, smoke evidence 계약이 정렬된다. |
| Spine 1. Trusted Dataset Draft | source에서 dataset draft가 생성되고 trust gate reason을 가진다. |
| Spine 2. Governed Query | Trusted 또는 Blocked 상태와 policy decision으로 query 허용/차단을 검증한다. |
| Spine 3. Evidence & Recovery | Ask/Evidence와 Recovery가 같은 dataset/policy/audit contract를 공유한다. |
| Release Checkpoint | local/container 또는 dev-lite packaging smoke와 secret/config 검증이 통과한다. |

R1~R7은 아래 workstream alias로 유지한다.

| Alias | Workstream | 수용 체크포인트 |
| --- | --- | --- |
| R1 | Catalog / Trust | dataset trust status와 gate 결과가 API/UI에서 확인된다. |
| R2 | Job / Orchestrator | job/task 상태, event, audit 기초가 중복 없이 기록된다. |
| R3 | Source Connector | 선택한 source 1개가 연결 성공/실패와 schema discovery를 제공한다. |
| R4 | Query / Policy | 허용/마스킹/차단 query가 정책과 audit evidence를 남긴다. |
| R5 | Ask / Evidence | Ask 결과가 evidence 또는 보류 사유를 제공하고 권한 거부를 통과한다. |
| R6 | Recovery / Operate | schema drift 또는 quality failure 후 영향 분석과 복구 상태 전이가 검증된다. |
| R7 | Packaging | local/container 또는 dev-lite packaging smoke와 secret/config 검증이 통과한다. |
