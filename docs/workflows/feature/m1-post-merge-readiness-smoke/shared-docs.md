# M1 post-merge readiness smoke 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `frontend/src/app/styles.css` | 640px 이하 `.page-header` 좌우 음수 margin 제거 | 최신 main M1 `/query` mobile smoke에서 `.page-stack` overflow가 발견되어 UI 회귀를 보완했다. | 낮음. 모바일 레이아웃 보정이며 backend/API/schema contract 변경 없음. |
| `docs/reports/m1-post-merge-readiness-smoke.md` | Phase 실행 증거 report 추가 | 최신 main 기준 M1 readiness/CTA/route trace smoke 결과와 Product Health final evidence 부재 상태를 기록한다. | 낮음. 증거 계층 추가이며 Source of Truth 변경 없음. |
| `docs/reports/m1-demo-readiness-panel.md`, `docs/reports/m1-product-health-demo-cta.md` | stale PR 상태 문구를 merge 완료 상태로 정리 | 이미 merge된 M1 PR 상태와 report evidence가 충돌하지 않게 한다. | 낮음. 과거 report의 원격 상태 문구 정리이며 요구사항 변경 없음. |

## Integration Notes / 통합 메모

- M3 PR #245, M6 PR #241은 아직 main에 들어오지 않았으므로 이번 Phase는 `origin/main`에 이미 merge된 범위만 검증한다.

## Conflicts To Resolve / 해결할 충돌

- 없음
