# Source catalog 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | M3 source/catalog API curl examples added | Team members need a quick API verification path. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | Source Catalog Ready State guard added | Missing CSV must not become ready dataset. | 낮음 |
| `docs/07-manual-verification-playbook.md` | Source Catalog manual verification added | UI/API manual verification path is now available. | 낮음 |
| `README.md` | Sample source path recorded | New contributors need the default sample path. | 낮음 |

## Integration Notes / 통합 메모

- M3 implementation matches PR #32 Source of Truth decisions.
- `scripts/smoke-container-app.sh` now verifies source registration and catalog list, not only health/frontend load.

## Conflicts To Resolve / 해결할 충돌

- 없음
