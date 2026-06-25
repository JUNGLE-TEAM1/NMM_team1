# AskLake 2주차 모듈 분업 Project Context

## 문서 목적

이 묶음은 AskLake 2주차 모듈 분업과 주요 기술 결정을 하네스와 다음 작업자가 참고할 수 있게 정리한 project context다.

아직 모든 세부 계약이 Source of Truth에 반영된 것은 아니므로, 구현 계약으로 확정할 내용은 공통 계약 설계 때 별도로 확인한다.

## 읽는 순서

1. `decisions.md`
2. `plan.md`
3. `contract-setup-prompt.md`
4. `query-result-contract-prompt.md`
5. `query-result-contract-execution-prompt.md`
6. `lite-parallel-manifest-prompt.md`
7. `decision-options.md`
8. 필요 시 `meeting-summary.md`, `meeting-decision-options.md`

자동 또는 반자동 데이터 활용에서도 위 순서를 기본값으로 사용한다.

## 문서 역할

| 문서 | 역할 | 사용 방식 |
| --- | --- | --- |
| `decisions.md` | canonical 최종 결정 로그 | 작업자가 가장 먼저 확인할 기준 문서 |
| `plan.md` | 이번 주 실행 계획과 모듈별 목표 | 모듈별 산출물과 실행 순서 확인 |
| `contract-setup-prompt.md` | 공통 계약 설정 Phase 시작 프롬프트 | 2주차 구현 전 계약 fixture와 producer/consumer 경계를 고정할 때 사용 |
| `query-result-contract-prompt.md` | `QueryResult` 계약 보완 프롬프트 | `SqlEngineAdapter.execute()` 반환 shape와 `AIQueryResult` fixture를 정렬할 때 사용 |
| `query-result-contract-execution-prompt.md` | `QueryResult` 계약 보완 실행 프롬프트 | `docs/03`, `AIQueryResult` fixture, workspace/report를 실제로 보완할 때 사용 |
| `lite-parallel-manifest-prompt.md` | Lite 병렬 manifest 생성 프롬프트 | M1~M6 병렬 개발을 위한 AI/harness coordination 계약을 만들 때 사용 |
| `decision-options.md` | 결정 옵션과 장단점 근거 | 결정 배경이나 대안 검토가 필요할 때 확인 |
| `meeting-summary.md` | 회의 공유용 요약 | 팀 공유와 미팅 진행용 |
| `meeting-decision-options.md` | 회의용 옵션 분석 | 회의에서 같이 볼 설명용 |

## 데이터 활용 규칙

- 이 묶음의 canonical 데이터 소스는 `decisions.md`다.
- `decision-options.md`는 옵션 분석이나 결정 배경이 필요할 때만 읽는다.
- `meeting-summary.md`와 `meeting-decision-options.md`는 회의 공유용이므로 자동 추출의 canonical 입력으로 사용하지 않는다.
- 실제 구현 계약 값은 공통 계약 설계 전까지 임의 확정하지 않는다.

## 충돌 규칙

- 같은 묶음 안에서 표현이 충돌하면 `decisions.md`를 우선한다.
- `decisions.md`와 Source of Truth가 충돌하면 Source of Truth를 우선한다.
- Source of Truth에 반영되지 않은 결정이 구현 계약, API, schema, 검증 기준에 영향을 주면 Change Propagation Rule에 따라 전파 여부를 먼저 판단한다.
- 회의용 문서는 공유와 설명을 위한 문서이며, canonical 데이터 소스는 아니다.

## 작업자가 따라야 할 핵심 원칙

- 공통 계약 설계 전에는 세부 path, row count, sample contract 값을 임의로 확정하지 않는다.
- M6는 DuckDB를 직접 import하지 않고 `SqlEngineAdapter`를 통해 호출한다.
- 검증 질문은 Day 4 전까지 고정하지 않는다.
- Airflow 실패 시 같은 `WorkflowDefinition`을 local runner로 실행할 수 있게 유지한다.
- PR 또는 report 작성 시 이 묶음을 참고했다면 관련 문서 링크에 `decisions.md`와 필요한 보조 문서를 포함한다.

## 공통 계약 설계 때 확정할 항목

| 항목 | 비고 |
| --- | --- |
| MinIO bucket/path 규칙 | 저장소 계약 확정 시 결정 |
| Amazon Reviews demo/fixed/extended sample 실제 파일 경로와 row 수 | 실제 데이터 위치와 처리 범위 확인 후 결정 |
| `contracts/*.sample.json` 필드 세부값 | 모듈 간 소비 계약으로 확정 |
| `SqlEngineAdapter` 실제 Python 인터페이스 위치 | backend 패키지 구조 확인 후 결정 |
| local runner 전환 조건의 구체 기준 | Airflow adapter 구현 전 결정 |

## 관련 Source of Truth 후보

이 묶음의 결정이 실제 구현 계약으로 확정되면 아래 문서를 우선 검토한다.

| 계층 | 문서 |
| --- | --- |
| Architecture | `docs/02-architecture.md` |
| Interface | `docs/03-interface-reference.md` |
| Acceptance | `docs/05-acceptance-scenarios-and-checklist.md` |
| Regression | `docs/06-regression-and-failure-scenarios.md` |
| Manual Verification | `docs/07-manual-verification-playbook.md` |
| Workflow | `docs/08-development-workflow.md` |
