# Notion issue sync last-write-wins hotfix Shared Document Patch Proposals

Use this file when branch work needs changes to shared Source of Truth documents.
Integration branches should read this file before merging branch work.

## Proposed Source Of Truth Changes

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | 기존 외부 서비스 경계와 Notion 속성을 그대로 사용했다. | 낮음 |
| `docs/03-interface-reference.md` | 변경 없음 | Notion schema 변경 없이 기존 속성만 사용했다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | hotfix 요구사항은 workspace/report에 기록하고 공용 acceptance 문서는 확장하지 않았다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | 이번 hotfix 전용 regression은 smoke test와 report에 기록했다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | live dry-run 확인은 후속 운영 확인으로 남겼고 공용 playbook 변경은 필요하지 않았다. | 낮음 |

## Integration Notes

- Source of Truth 문서 변경 없이 `.github` workflow/script와 hotfix evidence만 수정한다.

## Conflicts To Resolve

- 없음.
