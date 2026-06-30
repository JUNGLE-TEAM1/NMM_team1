# Runtime connection verification report 결정 기록

- Decision status: none

## 결정

- 새 runtime 구현을 하지 않고, 이미 기동/검수한 로컬 런타임과 AskLake API gap을 evidence로 고정한다.
- secret value는 기록하지 않고, local demo credential은 local-only evidence로만 표현한다.

## Deferred Decisions

| Decision | Reason | Revisit Trigger | Target |
| --- | --- | --- | --- |
| DB/S3/Kafka credential 저장 방식 | C-23은 문서화 Phase이며 runtime connector 구현 범위가 아니다 | C-25 시작 | `feature/external-connection-runtime-checks` |
| Spark distributed job API 실행 방식 | CLI cluster smoke와 AskLake API runner 연결은 별도 구현이 필요하다 | C-28 또는 C-30 시작 | `feature/silver-dataset-runtime-materialization` / `feature/jobs-runs-runtime-integration` |
