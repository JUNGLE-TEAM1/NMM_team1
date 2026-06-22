# AskLake

크래프톤 정글 SW-AI LAB 12기 나만의 무기 만들기 302호 1팀 프로젝트 AskLake.

AskLake의 MVP 후보는 XFlow를 참고한 경량 데이터 파이프라인 플랫폼이다. 사용자는 웹 UI에서 데이터 소스를 등록하고, 간단한 변환 파이프라인을 정의한 뒤, 실행 결과와 카탈로그 메타데이터를 확인할 수 있어야 한다.

## 협업 하네스

이 저장소는 프로젝트 작업을 Phase 단위로 기록하고 검증하기 위한 협업 하네스를 포함한다.

- AI 작업 규칙: `AGENTS.md`
- 문서 계층 지도: `docs/00-layer-map.md`
- 작업 흐름 문서: `docs/08-development-workflow.md`
- branch workspace 안내: `docs/workflows/README.md`
- 로컬 하네스 검증: `scripts/validate-harness.sh`
- workspace 상태 요약: `scripts/status-workflow.sh`

## 현재 상태

- MVP와 마일스톤은 `docs/01-product-planning.md`에 기록한다.
- 아키텍처와 인터페이스 계약은 `docs/02-architecture.md`, `docs/03-interface-reference.md`에 기록한다.
- 수용 기준, 회귀 기준, 수동 검증은 `docs/05`, `docs/06`, `docs/07`에 기록한다.
- GitHub Issue / PR / Project / Notion sync 관련 파일은 `.github/` 아래에 둔다.
- M2 앱 골격은 `backend/`, `frontend/`, `infra/docker/`, `docker-compose.yml`에 둔다.

## 로컬 앱 실행

```bash
docker compose build
docker compose up
```

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/health`
- Container smoke: `scripts/smoke-container-app.sh`
- Sample source path: `samples/orders.csv`

## 기존 코드베이스 적용 방식

현재 `main`은 제품 코드가 없는 초기 상태다. MVP 구현이 시작되면 `docs/08-development-workflow.md`의 Phase 순서와 branch workspace 방식으로 진행한다. 나중에 기존 코드가 생긴 뒤 하네스를 다시 붙일 때는 `Existing Codebase Adoption` 또는 `baseline + next-change` 방식을 따른다.

## 라이선스

프로젝트 라이선스는 아직 결정되지 않았다.
