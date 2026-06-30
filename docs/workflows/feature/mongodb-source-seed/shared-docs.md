# MongoDB Source Dataset seed 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | External Connection Metadata API에 MongoDB collection preview를 추가 | API contract 변경 | 중간 |
| `docs/04-development-guide.md` | MongoDB compose/seed smoke 명령 추가 | 로컬 재현 경로 반영 | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | MongoDB External Connection/Source Dataset acceptance 추가 | 완료 기준 반영 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | schema preview/secret guard를 PostgreSQL 전용에서 외부 연결 공통으로 확장 | 회귀 기준 반영 | 낮음 |
| `docs/07-manual-verification-playbook.md` | MongoDB seed + Source Dataset 등록 점검 추가 | 수동 재현 | 낮음 |
| `docs/08-development-workflow.md` | Dataset Module Connection Queue에 MongoDB Source Dataset seed slice note 추가 | Phase 경계 반영 | 낮음 |
| `docs/reports/README.md` | durable report index에 MongoDB Source Dataset seed 추가 | 증거 report 발견성 | 낮음 |

## Integration Notes / 통합 메모

- 현재 branch에 기존 `feature/llm-runtime-settings-ui` dirty 변경이 있어 checkout 없이 workspace만 만들고 진행한다.
- `docker-compose.yml`의 기존 사용자 변경을 피하기 위해 MongoDB는 별도 `docker-compose.mongodb.yml`로 추가한다.

## Conflicts To Resolve / 해결할 충돌

- `docs/03-interface-reference.md`와 `.env.example`은 기존 dirty 변경이 있으므로 LLM env 섹션을 보존한다.
