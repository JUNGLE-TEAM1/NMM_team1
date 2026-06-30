# Source Snapshot large data readiness shared docs

## Proposed Source Of Truth Changes

| File | Change | Reason | Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | Source Snapshot 응답 필드와 bounded sample semantics 추가 | API/UI가 full ingest처럼 보이지 않게 함 | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | Snapshot evidence acceptance 추가 | demo acceptance에서 대용량 처리 증거 오해 방지 | low |
| `docs/06-regression-and-failure-scenarios.md` | Source Snapshot sample/full ingest regression 추가 | `row_count`/bytes 의미 drift 방지 | low |
| `docs/07-manual-verification-playbook.md` | C-36 수동 검증 단계 추가 | 사람이 UI에서 경계를 확인 가능하게 함 | low |
| `docs/08-development-workflow.md` | C-36 Phase와 범위 원칙 추가 | 남은 Phase queue 정렬 | low |
