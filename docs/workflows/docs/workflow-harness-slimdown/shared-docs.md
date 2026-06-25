# Workflow harness slimdown 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | 하위 정책 상세 반복을 줄이고 canonical 문서 참조 중심으로 압축 | workflow 문서가 sync/quality/context/menu/parallel 정책을 중복 소유하지 않도록 역할 경계 정리 | 낮음: 정책 의미 변경 없이 참조 정리 |

## Integration Notes / 통합 메모

- 제품/architecture/interface/acceptance 문서는 변경하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음
