# Phase 보고서

`docs/reports/`는 AskLake Phase 실행 증거를 남기는 공간이다. Source of Truth는 아니지만 Source of Truth를 따랐는지, 무엇을 검증했는지, 다음 작업자가 무엇을 알아야 하는지를 기록한다.

## 역할

- 무엇이 변경됐고 무엇을 검증했는지 기록한다.
- `docs/05` 수용 기준과 증거를 연결한다.
- `docs/06` Regression Guard / Failure Scenario 확인 결과를 기록한다.
- `docs/07` Manual Verification 결과를 기록한다.
- `docs/08` 완료 게이트 충족 여부를 보여준다.
- 사람이 모든 report를 직접 읽지 않아도 AI가 현재 상태, 남은 위험, 다음 문맥을 요약할 수 있게 한다.

## 사용 시점

- 모든 Phase 완료 후
- 모든 Hotfix 완료 후
- 다음 Phase 시작 전 문맥 확인 시
- release/demo 전 evidence review 시

## 규칙

1. 각 Phase/Hotfix마다 report를 만든다.
2. 새 report는 [`_template.md`](_template.md)를 따른다.
3. 짧고 명확하게 쓴다.
4. changed, verified, remaining, next context는 반드시 남긴다.
5. Source of Truth drift를 고치기 위해 과거 report만 수정하지 않는다.

## Latest Report Index

AskLake에 하네스를 적용한 뒤 생성된 최신 Phase report를 아래 index에 유지한다.

report가 늘어나면 영역별 최신 report index를 작게 유지한다. 이 index는 Source of Truth가 아니라 evidence 탐색용이다.

| 영역 | 최신 report | 읽는 이유 |
| --- | --- | --- |
| 전체 진행 요약 | [`asklake-phase-summary.md`](asklake-phase-summary.md) | 팀원이 지금까지 진행된 Phase와 현재 남은 선택지를 빠르게 파악 |
| 팀원 온보딩 요약 | [`project-onboarding-summary.md`](project-onboarding-summary.md) | 새 팀원이 AskLake의 출발점, 현재 준비 상태, 다음 개발 방식의 큰 흐름을 문단 중심으로 파악 |
| B2B SaaS 포지셔닝 | [`b2b-saas-positioning.md`](b2b-saas-positioning.md) | 제품 방향은 B2B SaaS이고 Target MVP는 local/container 단일 Demo Tenant 검증이라는 분리 확인 |
| 대용량 데이터셋 조작 맥락 | [`big-dataset-context.md`](big-dataset-context.md) | Target MVP가 대용량/복합 데이터셋을 신뢰 가능한 분석 자산으로 만들고 처리 증거를 남기는 흐름을 포함하는지 확인 |
| 마일스톤 완료 요약 | [`milestone-completion-summary.md`](milestone-completion-summary.md) | M0~M5와 이후 보강 작업에서 무엇을 했는지 팀원이 빠르게 파악 |
| Product Rebaseline 리스크 분석 | [`asklake-product-rebaseline-risk-analysis.md`](asklake-product-rebaseline-risk-analysis.md) | 기획서 적용 전 현재 하네스와의 충돌, 결정 필요 항목, 첫 rebaseline Phase 후보 파악 |
| Product Context Coherence Audit | [`product-context-coherence-audit.md`](product-context-coherence-audit.md) | MVP v1/current baseline과 Target MVP 문맥 분리, CI-safe strict guard 적용 여부 확인 |
| Target MVP 병렬 Workstream 재정렬 분석 | [`target-mvp-parallel-workstream-realignment-analysis.md`](target-mvp-parallel-workstream-realignment-analysis.md) | R0.5 Modular Contract Baseline과 병렬 workstream 구조가 기존 하네스와 충돌하는지 확인 |
| Modular Contract Baseline | [`modular-contract-baseline.md`](modular-contract-baseline.md) | R0.5 shared contract, workstream pool, integration spine, target MVP manifest 적용 결과 확인 |
| Modular Contract Baseline 적용 점검 | [`modular-contract-baseline-application-audit.md`](modular-contract-baseline-application-audit.md) | R0.5 변경사항이 하네스, validation, 병렬 실행 계약과 충돌 없이 적용됐는지 사후 확인 |
| Thin Runtime Core | [`thin-runtime-core.md`](thin-runtime-core.md) | R0.5 shared contract가 backend/frontend thin runtime skeleton과 fake provider로 연결됐는지 확인 |
| M5 Day 3 Catalog Persistence Handoff | [`m5-day3-catalog-persistence-handoff.md`](m5-day3-catalog-persistence-handoff.md) | Week 2 M5 run/catalog metadata가 service restart 이후에도 조회되는 local JSON handoff persistence 확인 |
| M5 Day 2 Smoke Evidence | [`m5-day2-smoke-evidence.md`](m5-day2-smoke-evidence.md) | Week 2 M5 Workflow/Catalog local runner 실행 증거와 `ExecutionResult`/`CatalogMetadata` metric 의미 확인 |
| Local Tool Runtime Readiness | [`local-tool-runtime-readiness.md`](local-tool-runtime-readiness.md) | Docker 같은 local runtime이 설치되어 있으나 꺼져 있을 때 agent가 safe start/readiness/fallback을 먼저 시도하는 규칙 확인 |
| Local Environment Requirements | [`local-environment-requirements.md`](local-environment-requirements.md) | macOS/Windows 로컬 개발 지원 등급, Docker Compose 권장 경로, WSL2/native Windows 검증 경계 확인 |
| Cross-Platform Smoke Audit | [`cross-platform-smoke-audit.md`](cross-platform-smoke-audit.md) | macOS Docker Compose smoke evidence와 Windows WSL2/native Windows 남은 검증 범위 확인 |
| Windows WSL2 Smoke Audit | [`windows-wsl2-smoke-audit.md`](windows-wsl2-smoke-audit.md) | Windows WSL2 smoke 검증 handoff와 현재 macOS 환경의 not-executed evidence 확인 |
| Windows WSL2 Smoke Execution | [`windows-wsl2-smoke-execution.md`](windows-wsl2-smoke-execution.md) | 실제 WSL2 shell에서 smoke를 재실행하고 repo-local portability fix와 남은 host prerequisite를 확인 |
| WSL2 Known Gaps Guidance | [`wsl2-known-gaps-guidance.md`](wsl2-known-gaps-guidance.md) | WSL2 Tier 1 경로를 유지하면서 CRLF, Git metadata 혼용, native Windows 보류 기준을 확인 |
| Small Change PR Decision | [`small-change-pr-decision.md`](small-change-pr-decision.md) | 작은 변경 완료 후 PR 진행, 로컬 보류, 큰 branch 흡수, 개인 초안 유지, 포함/제외 파일 정리 기준 확인 |
| PR Checkpoint Hardening | [`pr-checkpoint-hardening.md`](pr-checkpoint-hardening.md) | 작은 변경의 PR 진행이 Pre-PR checkpoint를 우회하지 않는지, dirty checkpoint가 untracked 파일을 자동 추적하지 않는지 확인 |
| Auto PR Creation Policy | [`auto-pr-creation-policy.md`](auto-pr-creation-policy.md) | PR-ready branch의 feature branch push/PR 생성을 자동화하고 merge/finalize/cleanup은 사람 확인 gate로 유지한 최신 정책 확인 |
| PR Finalization State Source | [`pr-finalization-state-source.md`](pr-finalization-state-source.md) | PR merge 뒤 stale `sync.md` final field가 남아도 GitHub PR/issue 상태로 완료 여부를 올바르게 해석하는지 확인 |
| Project Status mismatch guard | [`project-status-mismatch-guard.md`](project-status-mismatch-guard.md) | merged PR + closed issue인데 GitHub Project Status가 `Done`이 아닌 stale/mismatch 상태를 자동보정 없이 감지하는지 확인 |
| PR 템플릿 자동 body 정렬 | [`pr-template-auto-body-alignment.md`](pr-template-auto-body-alignment.md) | 자동 PR 생성 body가 한국어 PR 템플릿, linked issue closing keyword, quality/sync/human checkpoint 항목과 정렬되는지 확인 |
| 이슈 템플릿 생성 경로 보강 | [`issue-template-generation-guard.md`](issue-template-generation-guard.md) | `start-workflow.sh` 자동 생성 issue가 한국어 title/body/label과 body-file 경로를 쓰는지 확인 |
| PR 템플릿 문단형 설명 보강 | [`pr-template-readable-narrative.md`](pr-template-readable-narrative.md) | PR body가 7섹션 문단형 review handoff로 생성되는지 확인 |
| GitHub record drift audit | [`github-record-drift-audit.md`](github-record-drift-audit.md) | GitHub issue/PR이 템플릿 생성 경로를 우회했는지 읽기 전용으로 감지하고 PR-ready 전에 막는지 확인 |
| System Guardrails / Harness Protocol 분리 | [`guardrail-protocol-split.md`](guardrail-protocol-split.md) | 강제 가능한 안전장치는 GitHub/CI/platform 인벤토리로 분리하고 하네스는 협업 프로토콜로 유지하는 기준 확인 |
| Guardrail Scenario Audit | [`guardrail-scenario-audit.md`](guardrail-scenario-audit.md) | 시스템 가드레일과 협업 하네스 경계가 CI 기본 단위, 읽기 전용 audit, human-approved E2E로 나뉘는지 확인 |
| PR Size Hard Gate | [`pr-size-hard-gate.md`](pr-size-hard-gate.md) | PR size hard gate 기준, evidence exclusion, override 문구, required check 적용 상태 확인 |
| Week2 responsibility ver2 | [`week2-responsibility-ver2.md`](week2-responsibility-ver2.md) | 초기 회의안 이후 M1~M6 책임 분리를 ver2 기준으로 재정리하고 Spark/Parquet/Catalog 중복 책임을 제거 |
| Week2 main E2E path | [`week2-main-e2e-path.md`](week2-main-e2e-path.md) | 과거 Amazon Reviews 대표 경로 결정 evidence. 현재 대표 경로는 Source of Truth 전파 report와 ver2 Source of Truth를 우선 확인 |
| Week2 existing implementation anchor | [`week2-existing-implementation-anchor.md`](week2-existing-implementation-anchor.md) | 기존 M1 shell, M4 Kafka demo, M5 workflow/catalog, M6 skeleton을 ver2 후속 구현의 보존 anchor로 확인 |
| M4 Kafka contract smoke fixture | [`m4-kafka-contract-smoke.md`](m4-kafka-contract-smoke.md) | M4 Kafka replay contract fixture의 미확정 replay rate/source file TODO를 실제 smoke evidence 값으로 확정 |
| Week2 M3 JSON main path decision | [`week2-m3-json-main-path-decision.md`](week2-m3-json-main-path-decision.md) | 과거 M3 JSON path decision evidence. 현재 M3 기준은 `gold_product_health` TransformSpec과 PR #105 selective recovery를 함께 확인 |
| Week2 runner boundary decision | [`week2-runner-boundary-decision.md`](week2-runner-boundary-decision.md) | M2 SparkRunner, M3 TransformSpec/job logic, M5 runner selection이 공유할 input/output boundary 확인 |
| M2 Product Health runtime smoke | [`m2-product-health-runtime-smoke.md`](m2-product-health-runtime-smoke.md) | M2가 reviews/behavior/delivery/product raw input을 multi-source pass-through Parquet/evidence로 처리하는 additive RuntimeConfig 경계 확인 |
| M2 L6 preview runner adapter | [`m2-l6-preview-runner-adapter.md`](m2-l6-preview-runner-adapter.md) | M2 `Week2SparkRunner`가 M3 L6 preview-only spec을 받아 local preview Parquet와 `Week2RunnerResult` evidence를 만드는 경계 확인 |
| M2 Product Health L6 evidence | [`m2-product-health-l6-evidence.md`](m2-product-health-l6-evidence.md) | 작은 Product Health source evidence, L6 Gold preview Parquet, DuckDB SQL read smoke 확인 |
| M2 Taxi 5GB local Spark evidence | [`m2-taxi-5gb-local-spark-evidence.md`](m2-taxi-5gb-local-spark-evidence.md) | PySpark local mode가 4.87GB Taxi Parquet directory를 읽고 `gold_taxi_daily_metrics` Parquet과 Week2RunnerResult 호환 summary를 남기는지 확인 |
| M2 Taxi Docker Spark evidence | [`m2-taxi-docker-spark-evidence.md`](m2-taxi-docker-spark-evidence.md) | 공개 Spark image 기반 Docker Spark master/worker/driver가 작은 Taxi 파일과 4.87GB Taxi directory를 처리해 `gold_taxi_daily_metrics` Parquet과 Week2RunnerResult 호환 summary를 남기는지 확인 |
| M2 Docker Spark MinIO output smoke | [`m2-docker-spark-minio-output-smoke.md`](m2-docker-spark-minio-output-smoke.md) | Docker Spark가 만든 Taxi Gold Parquet을 local fallback path에 쓰고 같은 파일을 MinIO/S3-compatible object URI로 업로드하는지 확인 |
| M2 source input 계약 확장 | [`m2-source-input-contract.md`](m2-source-input-contract.md) | `RuntimeConfig.source_inputs[]`가 legacy `input_format`/`input_path`와 새 `source_type`/`format`/`path`를 함께 받는 호환 계약 확인 |
| Week2 team handoff summary | [`week2-team-handoff-summary.md`](week2-team-handoff-summary.md) | Phase 1~6 이후 팀원이 읽을 현재 분업/진행상황/다음 병렬 구현 순서 확인 |
| Week2 상품 리스크 Source of Truth 전파 | [`week2-product-risk-source-of-truth-propagation.md`](week2-product-risk-source-of-truth-propagation.md) | Week2 대표 경로가 5GB raw/bronze input 기반 `gold_product_health`로 갱신된 Source of Truth 전파 범위와 남은 구현 gap 확인 |
| Week2 data path scope clarity | [`week2-data-path-scope-clarity.md`](week2-data-path-scope-clarity.md) | 과거 세 데이터 경로 scope clarity evidence. 현재 5GB input 기반 `gold_product_health` 대표 경로는 Source of Truth 전파 report를 우선 확인 |
| Week2 M6 RAG scope | [`week2-m6-rag-scope.md`](week2-m6-rag-scope.md) | M6의 RAG 책임을 CatalogMetadata 기반 Semantic/RAG-lite/AI Query로 보강하고 full RAG/vector DB는 후속으로 유지한 기준 확인 |
| M6 M5 CatalogSource adapter | [`m6-m5-catalog-source-adapter.md`](m6-m5-catalog-source-adapter.md) | M6 AI Query가 M5 `Week2CatalogStore`의 최신 CatalogMetadata를 evidence source로 소비하는 adapter 연결 확인 |
| M6 answer evidence grounding | [`m6-answer-evidence-grounding.md`](m6-answer-evidence-grounding.md) | M6 `AIQueryResult.evidence`가 CatalogMetadata schema/metrics/lineage/retrieval terms를 포함하고 summary가 같은 근거를 말하는지 확인 |
| M6 SQL-first 2주차 빌드업 | [`m6-sql-first-week2-buildup.md`](m6-sql-first-week2-buildup.md) | M6 최종 방향은 RAG/LLM 포함이지만 2주차 후속 실행은 SQL MVP 완성부터라는 기준 확인 |
| M6 DuckDB runtime integration | [`m6-duckdb-runtime-integration.md`](m6-duckdb-runtime-integration.md) | M6 Step 3에서 기본 runtime을 DuckDB로 연결하고 실제 Week2 output file을 SQL로 읽는지 확인 |
| M6 SQL planner intent rules | [`m6-sql-planner-intents.md`](m6-sql-planner-intents.md) | M6 Step 4에서 deterministic SQL planner intent, product health 지표, unsupported guardrail을 확인 |
| M6 response contract route trace | [`m6-response-contract-trace.md`](m6-response-contract-trace.md) | M6 Step 5에서 `AIQueryResult.route`와 `retrieval_trace` additive response contract를 확인 |
| M6 Catalog RAG Index | [`m6-catalog-rag-index.md`](m6-catalog-rag-index.md) | M6 Step 6에서 CatalogMetadata 기반 RAG-lite index, safe chunk, stale cache, richer retrieval trace를 확인 |
| M6 Hybrid Route | [`m6-hybrid-route.md`](m6-hybrid-route.md) | M6 Step 7에서 SQL/RAG/Hybrid/Unsupported route 분기와 RAG-only no-SQL behavior를 확인 |
| M6 LLM Answer Adapter | [`m6-llm-answer-adapter.md`](m6-llm-answer-adapter.md) | M6 Step 8에서 safe `LLMAnswerContext`, deterministic template adapter, blocked/unsupported no-adapter-call behavior를 확인 |
| M1 live UI Phase plan | [`m1-live-ui-phase-plan.md`](m1-live-ui-phase-plan.md) | M1 shell 이후 Week2 M5/M6 API 연결과 발표 클릭 흐름을 5개 작은 Phase로 나눈 기준 확인 |
| M1 Week2 API Client 연결 | [`m1-week2-api-client.md`](m1-week2-api-client.md) | M1 live UI Phase 1에서 Week2 M5/M6 API client와 frontend export를 추가한 결과 확인 |
| M1 Run Status Live UI | [`m1-run-status-live-ui.md`](m1-run-status-live-ui.md) | M1 live UI Phase 2에서 `/runs` 화면이 M5 workflow 실행/refresh와 ExecutionResult 표시를 소비하는지 확인 |
| M1 AI Query Live UI | [`m1-ai-query-live-ui.md`](m1-ai-query-live-ui.md) | M1 live UI Phase 4에서 `/query` 화면이 M6 `AIQueryResult`와 evidence grounding을 표시하는지 확인 |
| M1 Demo Click Flow Polish | [`m1-demo-click-flow-polish.md`](m1-demo-click-flow-polish.md) | M1 live UI Phase 5에서 `/sources -> /runs -> /catalog -> /ask` 발표 클릭 흐름 CTA가 연결됐는지 확인 |
| M1 Week2 final demo flow | [`m1-week2-final-demo-flow.md`](m1-week2-final-demo-flow.md) | 최신 M5/M6 진행 뒤 `/catalog` query readiness와 `/query` DuckDB/evidence 상태 표시를 M1 화면에 보강했는지 확인 |
| M1 final browser smoke | [`m1-final-browser-smoke.md`](m1-final-browser-smoke.md) | 최신 main 기준 `/etl -> /catalog -> /query` browser smoke에서 run/catalog/query/evidence가 이어지는지 확인 |
| M1 query route trace UI | [`m1-query-route-trace-ui.md`](m1-query-route-trace-ui.md) | M1 `/query` 화면이 M6 `AIQueryResult.route`와 `retrieval_trace[]`를 성공/차단 상태와 함께 표시하는지 확인 |
| M1 Catalog Live UI | [`m1-catalog-live-ui.md`](m1-catalog-live-ui.md) | M1 live UI Phase 3에서 `/catalog`와 detail 화면이 M5 CatalogMetadata를 소비하는지 확인 |
| PR Conflict Resolution Protocol | [`pr-conflict-resolution-protocol.md`](pr-conflict-resolution-protocol.md) | PR conflict 감지, 분류, 사람 확인, 해결 후 재검증과 evidence 기록 규칙 확인 |
| Harness 변경사항 병합 후 점검 | [`harness-post-merge-change-audit.md`](harness-post-merge-change-audit.md) | PR #45~#47 병합 뒤 Pre-PR checkpoint, Product Rebaseline, validation/script 충돌 여부 확인 |
| Mid-Phase Steering 하네스 보강 | [`mid-phase-steering-harness.md`](mid-phase-steering-harness.md) | 작업 중 사람의 잦은 조향을 현재 Phase detail, scope change, Hotfix, 다음 Phase 후보, 보류 아이디어, 고영향 결정으로 분류하는 규칙 확인 |
| 협업 하네스 설명 가이드 | [`collaboration-harness-beginner-guide-v2.md`](collaboration-harness-beginner-guide-v2.md) | v1 전체 내용을 유지하면서 최신 하네스 규칙을 보강한 초보자 설명과 AI agent 운영 프롬프트 확인 |
| 협업 하네스 팀 사용 가이드 | [`collaboration-harness-team-usage-guide.md`](collaboration-harness-team-usage-guide.md) | 팀원이 Phase 시작, 확인 gate 응답, PR/merge 경계, 문서 기록 방식을 실제 요청 예시로 익히는 온보딩 guide 확인 |
| 협업 하네스 팀 사용 가이드 보고서 | [`collaboration-harness-team-guide-report.md`](collaboration-harness-team-guide-report.md) | 팀원용 사용 guide 작성 범위, 검증, 남은 위험, PR handoff 문맥 확인 |
| 하네스 판단 질문 중립성 | [`harness-neutral-decision-guidance.md`](harness-neutral-decision-guidance.md) | AI가 질문자의 원하는 결론에 끌려가지 않고 반대 관점, 리스크, 보완책, 추천도, 제안자 책임을 함께 제시하는 기준 확인 |
| 하네스 전제 확인 규칙 | [`context-assumption-check.md`](context-assumption-check.md) | 일반론/저장소 규칙/비교 답변/실행 승인/정책 결정 렌즈를 구분하고 고영향 행동 전 확인 gate로 연결하는 기준 확인 |
| AWS 비용 추정 | [`aws-cost-estimate.md`](aws-cost-estimate.md) | EKS-ready 구성의 기본 비용과 데이터셋/로그/전송량 증가 시 추가 비용 파악 |
| Infra / MVP / 장기 Roadmap | [`phase-1-mvp-roadmap.md`](phase-1-mvp-roadmap.md) | 인프라 선행 원칙, XFlow 참고 MVP 범위, M0~M5 MVP milestone, M6~M15 장기 milestone, 다음 구현 Phase |
| Infrastructure Foundation | [`phase-2-infrastructure-foundation.md`](phase-2-infrastructure-foundation.md) | CI/CD, Docker, Kubernetes, AWS approval gate foundation |

## 다음 Phase 문맥 로딩

기본적으로 아래만 읽는다.

- 이 README의 Latest Report Index
- 직전 Phase report
- 관련 영역의 최신 report
- 필요한 경우 관련 report 1개 추가

audit, retrospective, whole-project analysis가 아니면 많은 report를 한꺼번에 읽지 않는다.

## Source of Truth 충돌

- Source of Truth가 우선한다.
- report가 더 정확한 구현 상태를 보여준다면, report만 고치지 말고 Change Propagation Rule에 따라 가장 이른 Source of Truth layer를 업데이트한다.
