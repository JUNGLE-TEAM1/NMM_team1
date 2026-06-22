# Internal step prompt standard 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | 내부 단계별 프롬프트 규칙과 Step 양식 추가 | M2 같은 큰 Phase의 Step별 구현/검증 프롬프트 저장 위치를 명확히 하기 위해 | 낮음 |
| `docs/workflows/README.md` | `plan.md` 역할에 내부 단계별 프롬프트 저장 위치 명시 | workspace 파일 역할 혼동을 줄이기 위해 | 낮음 |
| `scripts/start-workflow.sh` | 새 workspace `plan.md` 템플릿에 내부 단계별 프롬프트 선택 섹션 추가 | 새 Phase 시작 시 표준 양식을 바로 사용할 수 있게 하기 위해 | 중간 |
| `scripts/validate-harness.sh` | Step 구조 guard 추가 | `### Step`을 쓰는 workspace의 구현/검증/완료 기준 누락 방지 | 중간 |

## Integration Notes / 통합 메모

- 작은 Phase는 내부 단계별 프롬프트를 쓰지 않아도 된다.
- Step guard는 `### Step`이 있는 `plan.md`에만 적용된다.

## Conflicts To Resolve / 해결할 충돌

- 기존 완료 workspace를 일괄 수정하지 않는다.
