# Week2 responsibility ver2 노트

## 진행 메모

- 사용자는 팀원이 만든 새 분업안을 검토했고, M1 역할은 유지해도 된다고 판단했다.
- Iceberg는 이번 발표 범위에서 제외하기로 했다.
- `SourceConfig`는 M1 단독 소유가 아니라 M1 shell/demo tenant/source id/화면 입력 흐름과 M3/M4 source-specific options/validation provider 구조로 나누기로 했다.
- M2/M3 경계는 M2가 execution runtime, M3가 transformation spec/job logic을 맡는 것으로 정리했다.
- 기존 `docs/project-context/asklake-week2-module-plan/` 루트 문서는 초기 회의안/historical context로 보존하고, 현재 기준은 `ver2/` 아래에 새로 만든다.

## 현재 main 진척도 요약

| 모듈 | 현재 진척 | ver2 반영 |
| --- | --- | --- |
| M1 | UI shell 기반 완료. 실제 backend 연결은 일부 placeholder 성격. | UI/API Gateway 역할과 맞다. |
| M2 | Taxi dataset bootstrap은 설계/전략 중심이며 실제 batch 구현은 약하다. | Lakehouse Runtime Platform으로 전환할 여지가 있다. |
| M3 | 기존 source/catalog 기반은 있으나 Week2 JSON 핵심 구현은 미병합/재조정 필요. | Amazon Reviews JSON main path 우선으로 과부하를 줄여야 한다. |
| M4 | Kafka replay to local Parquet demo는 있으나 Spark/S3 운영 구현은 아니다. | Kafka Ingestion evidence로 흡수한다. |
| M5 | workflow/catalog 기반이 가장 많이 구현되어 있다. | Workflow Runtime + Catalog Store/API + Lineage 중심으로 유지한다. |
| M6 | AI query skeleton이며 real SQL/RAG는 후속 연결 필요. | CatalogMetadata와 runtime을 소비하는 방향과 맞다. |

## 결정

- ver2는 새 canonical working responsibility 문서로 만들되, Source of Truth 전체 rewrite는 하지 않는다.
- Spark는 M2가 제공하는 공통 runtime으로 두고, M3는 job logic/config, M5는 workflow 호출을 맡는다.
- Catalog는 M3 facts 생성과 M5 storage/API/lineage로 분리한다.

## 열린 질문

- `RuntimeConfig`와 `SparkRunner`의 실제 interface는 후속 구현 PR에서 확정한다.
- `docs/03-interface-reference.md`와 `contracts/*.sample.json`에 ver2 계약을 언제 반영할지는 후속 PR에서 판단한다.
- M3가 Taxi/Kafka까지 얼마나 처리할지는 발표 우선순위에 맞춰 Amazon Reviews JSON main path 이후 재조정한다.

## 링크 / 증거

- `/Users/tail1/Downloads/asklake-m1-m6-final-nonoverlap-responsibility.md`
- `/Users/tail1/Downloads/asklake-week2-original-vs-revised-m1-m6-flow.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/original-vs-revised-flow.md`
