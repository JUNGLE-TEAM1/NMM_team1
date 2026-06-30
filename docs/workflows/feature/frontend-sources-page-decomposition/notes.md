# Frontend SourcesPage decomposition 노트

## 진행 메모

- 2026-07-01: `SourcesPage`와 dataset workspace 전용 wizard/modal/list/helper를 `frontend/src/features/datasets/SourcesPage.jsx`로 이동했다.
- 2026-07-01: `formatMetric`, `formatBytes`를 `frontend/src/app/formatters.js`로 분리하고 `App.jsx`, `SourcesPage.jsx`가 공유 import하도록 정리했다.
- 2026-07-01: `/datasets/gold` browser smoke에서 처음 root가 빈 상태로 남는 문제를 확인했다. 원인은 feature 파일 이동 중 빠진 lucide icon import(`Sparkles`, `PlayCircle`)였고, import 복구 뒤 `/datasets/gold`가 정상 마운트됐다.
- 2026-07-01: 백엔드가 `127.0.0.1:18000`에서 실행 중이 아니어서 Vite proxy API notice가 표시됐지만, frontend route/render smoke와 console error 확인은 통과했다.

## 결정

- API/schema/data contract 변경 없이 frontend file boundary만 분리한다.
- `SourcesPage` 내부 70개 이상 state/hook 재분해는 후속 Phase로 넘긴다.

## 열린 질문

- 후속 Phase에서 `SourcesPage.jsx` 내부를 `hooks`, `view sections`, `modals`, `constants`로 추가 분해할지 결정한다.

## 링크 / 증거

- `npm --prefix frontend run build` passed.
- `git diff --check` passed.
- in-app browser route smoke: `/`, `/connections`, `/datasets/source`, `/datasets/silver`, `/datasets/gold`, `/jobs/connection-sync`, `/jobs/silver-transform`, `/jobs/gold-build` passed.
