# Dataset Feature Boundary next actions

## Recommended

1. C-49 Product Health lake write-through를 진행한다.

Reason: shell과 Dataset workspace entry boundary가 분리되어 C-49의 lake write-through 구현 표면이 줄었다.

## Watch

- Dataset feature 내부의 domain hook 추가 분리는 C-49 구현 중 실제 충돌 지점이 확인될 때 Hotfix 또는 후속 Phase로 제한한다.
- `VITE_PROXY_TARGET=http://127.0.0.1:8000` 없이 frontend dev server를 띄우면 기본 proxy가 `127.0.0.1:18000`을 향해 API 502가 날 수 있다.
