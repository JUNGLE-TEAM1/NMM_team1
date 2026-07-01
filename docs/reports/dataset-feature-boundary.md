# Dataset Feature Boundary

## Short Report / 짧은 보고

- Type: Phase C-48B
- Date: 2026-07-01
- Changed: `App.jsx`에서 Dataset workspace 구현과 dataset-only mock/config/helper 잔여물을 제거하고 `features/datasets/SourcesPage`를 route entry로 사용했다.
- Verified: `npm --prefix frontend run build`, `git diff --check`, browser route smoke 통과.
- Remaining: Dataset feature 내부 domain hook/action 세분화는 C-49 구현 중 실제 충돌 지점이 확인될 때 후속으로 제한한다.
- Next context: C-49 Product Health lake write-through.
- Risk: 기존 dirty worktree의 backend/AI Query 변경은 본 Phase 범위 밖이라 검증 대상에서 제외했다.

## 변경 파일

- `frontend/src/app/App.jsx`
- `docs/workflows/feature/dataset-feature-boundary/quality.md`
- `docs/workflows/feature/dataset-feature-boundary/sync.md`
- `docs/workflows/feature/dataset-feature-boundary/next-actions.md`
- `docs/workflows/feature/dataset-feature-boundary/report.md`
- `docs/reports/dataset-feature-boundary.md`
- `docs/reports/README.md`

## 구현 요약

- `App.jsx`가 `DatasetSourcesPage`를 import해 dataset workspace route entry를 feature module로 위임한다.
- 예전 `SourcesPage` 구현과 dataset-only modal/config/helper 잔여물을 제거해 App shell과 Dataset feature 경계를 분리했다.
- C-49 lake write-through 구현 전 frontend entry surface를 줄였다.

## 검증

```bash
npm --prefix frontend run build
git diff --check
```

Browser smoke:

- `/connections`
- `/datasets/source`
- `/datasets/silver`
- `/datasets/gold`
- `/jobs/connection-sync`
- `/jobs/silver-transform`
- `/jobs/gold-build`
- `/runs`
- `/catalog`
- `/query`

결과: 모든 route가 non-blank content와 기대 label을 표시했고 Vite runtime error는 없었다.

## 다음 Phase 문맥

- C-49 Product Health lake write-through를 진행한다.
- Dataset feature 내부 domain hook/action 추가 분리는 C-49 중 실제 충돌 지점이 확인될 때만 최소 범위로 다룬다.
- 로컬 frontend smoke 시 `VITE_PROXY_TARGET=http://127.0.0.1:8000`을 지정해야 현재 backend와 맞는다.
