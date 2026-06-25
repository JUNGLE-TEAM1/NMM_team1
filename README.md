# AskLake

크래프톤 정글 SW-AI LAB 12기 나만의 무기 만들기 302호 1팀 프로젝트 AskLake.

AskLake는 여러 데이터 소스를 연결해 대용량/복합 데이터셋을 수집·변환·검산·게시하고, 권한 안에서 SQL과 자연어 질문으로 활용하며, 답변과 분석 결과의 근거를 리니지·품질·정책·감사 기록으로 확인하게 하는 B2B SaaS Trusted Data & AI Platform을 목표로 한다.

## 제품 방향

AskLake의 Target MVP는 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 루프를 증명한다.
Target MVP는 `local/container` 환경의 단일 Demo Tenant로 핵심 신뢰 루프를 검증하며, 상용 멀티테넌트 SaaS 운영은 후속 범위로 둔다.

핵심 질문은 “데이터를 가져올 수 있는가”가 아니라 “이 데이터와 답변을 왜 믿을 수 있는가”다.
따라서 Target MVP는 하나의 데이터셋이 source onboarding, schema inference, 변환/정규화, Parquet 또는 S3-compatible 저장, 품질/PII/권한 검토, `Trusted` 게시, Query 또는 Ask 사용, Evidence 확인, 장애 영향 분석과 복구까지 이어지는 흐름을 우선한다.

## Current Implementation Baseline

현재 구현 baseline은 기존 M0~M5에서 완료된 경량 데이터 파이프라인 데모다.
이 baseline은 앞으로의 제품 목표를 제한하지 않고, 새 Target MVP를 시작하는 현재 코드 상태와 검증 증거로 사용한다.

현재 동작하는 baseline:

1. 샘플 CSV/local file source를 등록한다.
2. Catalog 상세에서 schema, row count, sample rows를 확인한다.
3. Pipeline Run에서 `select_fields` 기반 최소 transform을 실행한다.
4. result dataset의 status, row count, 저장 위치를 확인한다.

## 협업 하네스

이 저장소는 프로젝트 작업을 Phase 단위로 기록하고 검증하기 위한 협업 하네스를 포함한다.

- AI 작업 규칙: `AGENTS.md`
- 문서 계층 지도: `docs/00-layer-map.md`
- 작업 흐름 문서: `docs/08-development-workflow.md`
- branch workspace 안내: `docs/workflows/README.md`
- 로컬 하네스 검증: `scripts/validate-harness.sh`
- workspace 상태 요약: `scripts/status-workflow.sh`

## 현재 상태

- 제품 방향과 Target MVP는 `docs/01-product-planning.md`에 기록한다.
- 현재 구현 baseline과 target architecture는 `docs/02-architecture.md`에 구분해 기록한다.
- baseline contract와 Target MVP interface family는 `docs/03-interface-reference.md`에 기록한다.
- 수용 기준, 회귀 기준, 수동 검증은 `docs/05`, `docs/06`, `docs/07`에 기록한다.
- GitHub Issue / PR / Project / Notion sync 관련 파일은 `.github/` 아래에 둔다.
- 기존 M0~M5 report는 historical evidence로 유지한다.
- 앱 코드는 `backend/`, `frontend/`, `infra/docker/`, `docker-compose.yml`에 둔다.

## 로컬 앱 실행

자세한 OS별 지원 범위와 필수 도구는 `docs/04-development-guide.md`의 로컬 개발 환경 요구사항을 따른다.
권장 경로는 Docker Compose이며, Windows는 WSL2 + Docker Desktop integration을 기본 검증 경로로 둔다.

```bash
docker compose build
docker compose up
```

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/health`
- Container smoke: `scripts/smoke-container-app.sh`
- Sample source path: `samples/orders.csv`

## Baseline 데모

팀원 데모 흐름은 `docs/manual-verification/07-mvp-demo-script.md`를 따른다.
이 데모는 current implementation baseline 확인용이며 Target MVP 전체 범위를 의미하지 않는다.

## 기존 코드베이스 적용 방식

현재 `main`은 AskLake MVP skeleton과 최소 pipeline run을 포함한다.
이후 기능은 `docs/08-development-workflow.md`의 Phase 순서와 branch workspace 방식으로 진행한다.
현재 구현 baseline은 보존하고, 새 제품 목표는 Product Rebaseline 이후의 Target MVP Phase로 확장한다.
나중에 기존 코드가 더 커진 뒤 하네스를 다시 붙일 때는 `Existing Codebase Adoption` 또는 `baseline + next-change` 방식을 따른다.

## 라이선스

프로젝트 라이선스는 아직 결정되지 않았다.
