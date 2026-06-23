# AskLake 기획서 하네스 적용 리스크 분석

작성일: 2026-06-23

이 문서는 `reference/AskLake_프로젝트_기획서.md`를 현재 AskLake 협업 하네스에 적용하기 전에 작성한 사전 리스크 분석이다.
Source of Truth가 아니라, 이후 Product Rebaseline 또는 Decision Phase에서 참고할 evidence다.

## 1. 결론

- 전체 수용 판단: `부분 수용 권장`
- 이유: 기획서의 제품 비전은 현재 AskLake 방향과 맞지만, 현재 하네스의 MVP는 `CSV/local file -> 최소 pipeline -> catalog result`로 이미 완료된 작은 MVP이고, 기획서는 `Trust/권한/RAG/Trino/오케스트레이터/Kubernetes`까지 포함한 큰 플랫폼 MVP를 요구하므로 즉시 덮어쓰면 기존 Source of Truth와 회귀 기준을 깨뜨린다.

Context Budget mode는 `Audit Read`로 판단했다.
주요 비교 대상은 `AGENTS.md`, `README.md`, `docs/00~08`, `docs/12`, `docs/14~16`, `docs/18`, `docs/reports/README.md`, 최신 관련 report, `reference/AskLake_프로젝트_기획서.md`다.

## 2. 현재 하네스 기준 요약

- 현재 MVP 정의: XFlow를 참고하되 복제하지 않고, 팀 프로젝트 규모의 경량 데이터 파이프라인 MVP를 만든다. 핵심 경로는 source 등록, `select_fields` transform, pipeline run, catalog 결과 확인이다.
- 현재 아키텍처/인터페이스 전제: React/Vite + FastAPI, SQLite-backed `MetadataStore`, CSV/local source, local CSV `ResultStore`, container-first local 실행, Kubernetes/AWS는 foundation과 approval gate 수준이다.
- 현재 검증/완료 기준: M0~M5 MVP는 완료 evidence가 있고, `scripts/validate-harness.sh --strict`, backend pytest, frontend build, container smoke, manual verification이 완료 기준으로 쓰인다. `docs/06`은 Trino, Spark, Kafka, Airflow, Bedrock 같은 확장 기능이 첫 MVP 필수 조건으로 들어오는 것을 회귀로 본다.

## 3. 기획서가 요구하는 핵심 변화

| 영역 | 현재 하네스 | 기획서 요구 | 변화 크기 | 판단 |
| --- | --- | --- | --- | --- |
| 제품 정체성 | 경량 데이터 파이프라인 MVP | Lineage-backed Trusted Answers 데이터 플랫폼 | 큼 | 방향은 수용 가능, 즉시 MVP 교체는 위험 |
| MVP 범위 | CSV/local, 최소 transform/run/catalog | RDB/API/S3, DAG, 품질, PII, 권한, Trino, Ask/Evidence, Backfill | 매우 큼 | 재정의 Decision 필요 |
| 사용자 | 분석가/데이터 엔지니어 입문자/데모 발표자 | 엔지니어, 스튜어드, 분석가, AI 운영자, 관리자, 업무 사용자 | 큼 | 단계적 수용 |
| 권한/거버넌스 | MVP 보류 | RBAC, 컬럼 마스킹, 접근 요청, Audit | 매우 큼 | Data/Permission Decision 필요 |
| 아키텍처 | local/container-first, optional distributed | Control Plane, Object Storage, Query Engine, RAG/NL2SQL, Kubernetes/Helm | 매우 큼 | Architecture Decision 필요 |
| Interface | Source/Pipeline/Catalog 중심 | Source/Pipeline/Trust/Query/Dashboard/AI/Operation/Admin API | 매우 큼 | 단계적 contract 분리 필요 |
| Acceptance | source -> pipeline -> result 확인 | 신뢰 루프: 게시, 권한, 질문, Evidence, 복구 | 큼 | 별도 Rebaseline 필요 |
| Regression | MVP scope expansion 방지 | 확장 기능 일부를 MVP에 포함 | 충돌 | 현재 회귀 기준 개정 필요 |
| Quality | harness + app smoke 중심 | 보안, 권한, AI 평가, 통합/장애/배포 테스트 | 큼 | 단계적 수용 |
| Workflow | Phase 하나씩, M6 이후 확장 | 7단계 플랫폼 개발 순서 | 중간~큼 | Milestone 재매핑 필요 |

## 4. 계층별 영향 분석

| Source of Truth 계층 | 영향 | 필요한 작업 | 위험도 | 비고 |
| --- | --- | --- | --- | --- |
| Requirements `README.md` | 변경 필요 | 외부 요약을 경량 MVP에서 Trusted Data Platform 후보로 재정렬 | 높음 | 현재 “MVP demo path 동작”과 새 MVP 정의가 충돌 가능 |
| Product `docs/01` | 충돌 있음 | MVP/Milestone 전체 재기준화 | 매우 높음 | 가장 이른 실질 영향 계층 |
| Architecture `docs/02` | 변경 필요 | Control Plane, Trust, Query, AI, Object Storage, Orchestrator 경계 추가 | 매우 높음 | 현 구조는 후보/장기 확장으로만 둠 |
| Interface `docs/03` | 변경 필요 | Trust/Query/AI/Admin/Operation API domain을 contract family로 분리 | 매우 높음 | 한 번에 상세 endpoint 확정 금지 |
| Development Operations `docs/04` | 검토 필요 | 보안/데이터/AI/infra 변경 시 검증 명령과 migration 규칙 확장 | 중간 | 운영 복잡도 증가 |
| Acceptance `docs/05` | 변경 필요 | “신뢰 가능한 답변 경로” acceptance 추가 또는 기존 MVP와 분리 | 높음 | 기존 M3/M4 기준 보존 필요 |
| Regression `docs/06` | 충돌 있음 | “확장 기능이 첫 MVP에 들어오면 회귀” 기준을 새 결정에 맞게 조정 | 매우 높음 | 결정 없이 수정하면 하네스 자기모순 |
| Manual Verification `docs/07` | 변경 필요 | Trust/Permission/Ask/Evidence/Backfill 검증 playbook 추가 | 높음 | UI/보안/AI 수동 검증 필요 |
| Workflow `docs/08` | 변경 필요 | Product Rebaseline Phase 및 후속 milestone queue 정의 | 높음 | 한 요청 한 Phase 규칙 유지 |
| Quality Gates `docs/12` | 검토 필요 | security/privacy/AI eval/contract/integration checks 명시 | 중간~높음 | 구현 단계에서 강화 |
| Decision Brief `docs/14` | 변경 불필요 | 기존 형식으로 고영향 결정 처리 가능 | 낮음 | 사용 대상이 많음 |
| Existing Adoption `docs/16` | 검토 필요 | 현재 구현 완료 MVP를 baseline으로 보고 rebaseline 여부 판단 | 중간 | 기존 코드 폐기 금지 |
| Harness Regression `docs/18` | 검토 필요 | 하네스 규칙 변경 시 fixture test 필요 여부 판단 | 중간 | 제품 문서만 바꾸면 영향 적음 |
| Evidence `docs/reports` | 변경 불필요 | 과거 report는 증거로 유지, 새 report로 rebaseline 기록 | 중간 | 과거 report를 새 계획에 맞춰 고치면 안 됨 |

## 5. 수용 가능성 매트릭스

| 기획서 항목 | 분류 | 이유 | 선행 조건 |
| --- | --- | --- | --- |
| “신뢰 가능한 데이터 활용 경로” 제품 비전 | 즉시 수용 | 현재 장기 방향과 잘 맞음 | README/docs/01 rebaseline |
| Lineage-backed Trusted Answers 차별화 | 단계적 수용 | 제품 정체성으로 좋지만 구현 범위 큼 | MVP 재정의 |
| Build/Trust/Analyze/Ask/Operate/Admin IA | 단계적 수용 | 화면 구조가 큼 | UX milestone 분리 |
| Dataset `Draft/Verifying/Trusted/Degraded/Blocked` | 단계적 수용 | 현재 `ready` 중심 contract와 다름 | 상태 모델 Decision |
| Pipeline Version/Run/Task 상태 모델 | 단계적 수용 | 현재 동기 `PipelineService`보다 큼 | Orchestrator 범위 결정 |
| PII/RBAC/Masking/Access Request | Decision 필요 | privacy/security 핵심 판단 | Data/Permission Decision |
| Audit Event | 단계적 수용 | 신뢰 모델에 필요하지만 범위 큼 | 최소 audit schema 결정 |
| Trino Query Studio | Decision 필요 | 운영 복잡도와 비용 증가 | Query engine 도입 시점 결정 |
| RAG/NL2SQL/Hybrid Ask | Decision 필요 | hallucination/권한 우회 위험 큼 | LLM Gateway/평가셋/권한 정책 결정 |
| Vector Store 범위 | Decision 필요 | 비용, 최신성, 권한 필터 영향 | 기술 검증 과제 선행 |
| Kubernetes/Helm 필수 배포 | 단계적 수용 | foundation은 있으나 실제 cloud는 승인 gate 필요 | 비용/운영 승인 |
| Kafka/CDC/Flink | 보류 | 기획서도 후속으로 둠 | 실제 SLA 증거 |
| 완전한 BI/Dashboard authoring | 보류 | 핵심 신뢰 루프 지연 위험 | Query/Metric 안정화 후 |
| 현재 M0~M5를 새 기획서 MVP로 재라벨링 | 수용 불가/충돌 | 이미 완료된 작은 MVP evidence를 왜곡함 | 새 baseline report 필요 |

## 6. 주요 리스크

| 리스크 | 심각도 | 발생 원인 | 완화책 | 관련 문서 |
| --- | --- | --- | --- | --- |
| MVP scope explosion | 매우 높음 | 기획서 MVP가 기존 M6~M15 상당 범위를 포함 | Product Rebaseline Phase에서 MVP v2와 post-MVP 분리 | `docs/01`, `docs/06` |
| 기존 report와 drift | 높음 | M0~M5 완료 evidence가 작은 MVP 기준 | 과거 report는 보존, 새 rebaseline report 작성 | `docs/reports/README.md` |
| 구현 코드와 문서 불일치 | 높음 | 현재 코드는 CSV/local pipeline 중심 | “현재 구현 baseline”과 “목표 제품”을 명시 분리 | `README.md`, `docs/02`, `docs/03` |
| data/security/privacy 위험 | 매우 높음 | PII, 권한, masking, audit 도입 | Data/Permission Decision Brief 선행 | `docs/14`, `docs/03` |
| AI/RAG/NL2SQL 권한 우회 | 매우 높음 | 검색/프롬프트/SQL 경로마다 정책 적용 필요 | AI milestone 전 평가셋, trace, policy gate 정의 | `docs/12`, 기획서 D.8 |
| 운영 복잡도 증가 | 높음 | Trino, Object Storage, Vector/RAG, Orchestrator, Kubernetes | 로컬 대체 경로와 adapter boundary 유지 | `docs/02`, `docs/04` |
| 데모 안정성 저하 | 높음 | 외부 API/LLM/다중 엔진 의존 | seed/mock demo와 최소 신뢰 루프 우선 | `docs/07` |
| 테스트 비용 증가 | 중간~높음 | contract/security/AI/integration 테스트 필요 | Phase별 quality gate 확장 | `docs/12` |
| 하네스 규칙 변경 위험 | 중간 | MVP 재정의가 regression 기준을 바꿈 | 하네스 behavior 변경이면 `docs/18` gate 적용 | `docs/18` |
| 라이선스/secret/외부 서비스 위험 | 중간 | LLM/API/cloud/storage 도입 가능 | secret 미포함, license TBD 유지, approval gate | `AGENTS.md`, `docs/04` |

## 7. Decision Option Brief 필요 항목

| 결정 주제 | 결정 유형 | 후보 선택지 | 왜 지금 필요한가 | 보류 가능 여부 |
| --- | --- | --- | --- | --- |
| MVP 재정의 | Scope / MVP | A: 기존 MVP 유지 후 v2 roadmap, B: Trusted Data Platform MVP로 재기준화 | `docs/06` 회귀 기준과 직접 충돌 | 불가 |
| 첫 Product Rebaseline 범위 | Scope / MVP | A: 문서 rebaseline만, B: 문서+contract 초안, C: 구현 계획까지 | 첫 Phase 크기 결정 필요 | 불가 |
| Metadata Store | Architecture | A: SQLite 유지, B: PostgreSQL 전환, C: adapter만 유지 후 보류 | Trust/권한/Audit 모델 수용성에 영향 | 일부 가능 |
| Orchestrator 범위 | Architecture | A: 현재 `PipelineService` 확장, B: 경량 DAG 직접 구현, C: 외부 Orchestrator adapter | Retry/Backfill/상태 복구의 중심 | 가능, 단 MVP v2 전 필요 |
| 권한/PII 모델 | Data / Permission | A: 컬럼 RBAC+masking 최소, B: dataset/table/column 전체, C: 데모 mock 우선 | AI/Query/Trust 전부의 안전 조건 | 불가에 가까움 |
| Query Engine 도입 | Architecture | A: DuckDB/local 먼저, B: Trino MVP 포함, C: Trino PoC 분리 | Trino는 운영 부담이 큼 | 가능 |
| RAG/LLM Gateway | Data / Permission + Architecture | A: mock/rule 기반, B: 외부 LLM gateway, C: Ask 후순위 | hallucination/secret/권한 위험 | 가능 |
| Kubernetes/Helm 우선순위 | Quality / CI / CD | A: manifest 유지, B: Helm MVP 포함, C: cloud deploy 보류 | 현재 foundation과 기획서의 셀프호스팅 요구 조정 | 가능 |
| Vector Store 범위 | Architecture | A: metadata/document 중심, B: 전용 Vector DB, C: SQL-only until Ask | 비용/최신성/권한 필터에 영향 | 가능 |

## 8. 권장 적용 플랜

첫 번째 Phase는 `docs/product-rebaseline-trusted-platform` 같은 문서/결정 Phase로 시작하는 것을 권장한다.

- Phase 이름: `Product Rebaseline: Trusted Data Platform MVP 판단`
- 목표: 기획서의 큰 제품 비전을 현재 완료된 M0~M5 MVP와 충돌 없이 Source of Truth에 흡수할지 결정하고, `MVP v1 완료 상태`와 `MVP v2/Trusted Loop 목표`를 분리한다.
- 포함 범위: `README.md`, `docs/01`, `docs/02`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, `docs/08` 수정 후보 설계. Decision Option Brief 초안 작성. 기존 report와 현재 구현 baseline 명시.
- 제외 범위: 코드 구현, Trino/RAG/Kubernetes 실제 도입, AWS resource 생성, 과거 report 수정, 모든 API endpoint 상세 확정.
- 수정 후보 문서: `README.md`, `docs/01-product-planning.md`, `docs/02-architecture.md`, `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/08-development-workflow.md`, 새 `docs/reports/...` report.
- 검증 방법: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `rg` 기반 MVP/Non-MVP 충돌 검사, manual review로 “기존 MVP 완료”와 “새 목표”가 섞이지 않는지 확인.
- 완료 기준: 사람 결정이 필요한 항목이 `decisions.md` 또는 report에 남고, 첫 구현 Phase가 하나만 추천되며, 기존 M0~M5 완료 evidence가 훼손되지 않는다.

## 9. 작업 전 사람 확인 질문

1. 현재 완료된 M0~M5를 “MVP v1 완료”로 보존하고, 기획서는 “MVP v2/제품 재기준화”로 적용해도 되는가?
2. 새 MVP의 핵심 문장을 기획서처럼 “신뢰 가능한 답변 경로”로 바꿀 것인가, 아니면 기존 “경량 데이터 파이프라인”을 유지하고 장기 비전만 교체할 것인가?
3. Trino, RAG/NL2SQL, PII/RBAC, Kubernetes/Helm 중 MVP v2에 반드시 포함할 항목은 무엇인가?
4. 실제 팀 일정 기준으로 첫 구현 milestone은 Trust/Publish Gate가 맞는가, 아니면 Query/Ask를 먼저 보여주는 데모가 더 중요한가?
5. 기획서 내용을 Source of Truth에 반영할 때 기존 XFlow 기준 문구를 완전히 제거할 것인가, 아니면 “초기 참고 자료”로만 남길 것인가?
6. 다음 작업은 문서 rebaseline Phase로 시작할 것인가, 아니면 먼저 Decision Option Brief만 별도로 만들 것인가?

## 10. 활용 방법

- 이 문서는 Source of Truth가 아니라 다음 Phase의 입력 자료로 쓴다.
- `docs/01`, `docs/02`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, `docs/08`을 바로 수정하기 전에, 이 문서의 `Decision Option Brief 필요 항목` 중 최소 `MVP 재정의`와 `첫 Product Rebaseline 범위`를 먼저 결정한다.
- Product Rebaseline Phase가 시작되면 workspace `sources.md`에 이 문서를 읽은 근거로 기록한다.
- 실제 Source of Truth 변경 후에는 이 문서가 아니라 변경된 Source of Truth 문서를 기준으로 다음 구현 Phase를 시작한다.
