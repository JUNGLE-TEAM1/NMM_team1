# Phase 1 XFlow 참고 MVP 로드맵 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-21
- Changed: XFlow를 read-only reference로 참고해 AskLake 인프라 선행 원칙, MVP 범위, M0~M5 MVP milestone, M6~M15 장기 milestone, architecture/interface 후보, acceptance/regression/manual verification, workflow Phase 1을 작성했다.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: AWS deployment target, 첫 source type, metadata store, React Flow 적용 시점, M6 이후 우선순위를 다음 구현 Phase 결과에 따라 조정해야 한다.
- Next context: `feature/infrastructure-foundation`으로 CI/CD, Docker, Kubernetes, AWS approval gate를 확정한다.
- Risk: API/schema/storage/infra target은 후보 수준이며 제품 코드 구현 전 확정 계약으로 보지 않는다. AWS 비용 resource는 approval 없이 만들지 않는다.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/01-product-planning.md`
- `docs/02-architecture.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `/Users/tail1/Documents/데이터 파이프라인/xflow/README.md`
- `/Users/tail1/Documents/데이터 파이프라인/xflow/backend/main.py`
- `/Users/tail1/Documents/데이터 파이프라인/xflow/frontend/src/App.jsx`

## Goal / 목표

- XFlow 전체를 복제하지 않고, AskLake가 개발 시작 전에 인프라 foundation을 세운 뒤 데이터 파이프라인 MVP와 XFlow급 볼륨으로 가는 장기 마일스톤을 정의한다.

## Changed Files / 변경 파일

- `README.md`
- `AGENTS.md`
- `docs/01-product-planning.md`
- `docs/02-architecture.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/workflows/feature/mvp-roadmap/`
- `docs/reports/README.md`
- `docs/reports/phase-1-mvp-roadmap.md`

## Verification Commands / 검증 명령

```bash
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/mvp-roadmap/quality.md`
- Quality gate status: passed-with-skips
- TDD status: not applicable; 문서 기반 Phase
- CI/check result: local harness validation passed
- Skipped checks: product runtime tests; 제품 코드 없음
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/mvp-roadmap/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: infrastructure-first foundation accepted; MVP scope accepted; M6~M15 staged roadmap accepted; AWS target, first source type, metadata store, distributed/cloud stack deferred
- Revisit/rollback condition: AWS 비용 resource를 approval 없이 만들게 되면 plan/manifest 단계로 되돌린다.

## Regression Guard / 회귀 보호

- Checked feature: MVP Scope Boundary
- Protected behavior: XFlow 참고 기능이 MVP에 무제한으로 들어오지 않는다.
- Result: infrastructure foundation, MVP, M6 이후 장기 milestone을 분리했다.

## Failure Scenario / 실패 시나리오

- Reviewed failure: AWS resource가 승인 없이 생성되는 경우
- Expected behavior: CI/CD, Docker, Kubernetes, AWS 설계는 선행하지만 비용 resource 생성은 approval 뒤 진행
- Verification: `docs/01`, `docs/02`, `docs/08` 확인
- Result: CI/CD, Docker, Kubernetes, AWS foundation은 선행으로 기록하고, 비용 발생 AWS resource는 approval gate 뒤에 두었다.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`
- Environment: documentation-only Phase
- Result: MVP 데이터 파이프라인 수동 점검 경로를 추가했다.
- Failure/limitation: 실제 product runtime은 아직 없어서 실행 검증은 다음 Phase로 남는다.
- Evidence: `docs/07` MVP 데이터 파이프라인 수동 점검

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Project Bootstrap, Product Feature
- Status: partially complete for planning; implementation pending
- Evidence: MVP golden path와 milestone scope가 `docs/05`에 기록됨

## Context For Next Phase / 다음 Phase 문맥

- 다음 권장 Phase: `feature/infrastructure-foundation`
- 첫 결정 후보: source type은 CSV/local file이 가장 빠른 데모 경로이고, PostgreSQL은 XFlow 유사성이 높다.
- metadata store 후보: SQLite/file은 빠르고 단순하며, PostgreSQL은 XFlow 유사성과 backend 확장성이 좋다.
- 인프라 후보: EKS가 팀 요구에 맞는지, ECS/App Runner 같은 더 단순한 AWS target이 나은지 먼저 결정해야 한다.
- 장기 roadmap 후보: M6 source connectors부터 진행하되, M1 infrastructure foundation과 M2~M5 MVP가 먼저 동작해야 한다.

## Secret / Migration / Env Check

- Secret check: XFlow `.env` 파일은 열지 않았고 NMM에 secret을 추가하지 않았다.
- Migration/data change: 없음.
- Env change: 없음.

## Final Judgment / 최종 판단

- Done: 인프라 선행 방향, MVP, XFlow급 볼륨 장기 마일스톤 생성 완료.
- Remaining risk: 실제 endpoint/schema/storage는 후보 수준이라 첫 구현 Phase에서 확정해야 한다.
