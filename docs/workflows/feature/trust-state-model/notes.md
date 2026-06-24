# Trust State Model 노트

## 진행 메모

- 작업 시작 전 `main` 작업트리가 clean이고 `catalog_trust` handoff가 `ready`임을 확인했다.
- `feature/trust-state-model` branch/workspace를 생성했고 GitHub issue #57이 연결됐다.
- TDD로 trust 상태 응답과 trust gate endpoint 실패를 먼저 확인한 뒤 구현했다.
- 기존 baseline `CatalogDataset.status == "ready"`는 유지하고 Target 상태는 `trust_status`로 분리했다.
- 보완 검토에서 일부 gate만 통과한 상태를 `Blocked`로 단정하지 않도록 `Verifying`과 명시 실패 `Blocked`를 분리했다.

## 결정

- 실제 PII/policy/secret provider는 도입하지 않고 deterministic placeholder gate만 구현한다.
- 모든 required gate가 통과하면 `Trusted`, 명시 실패가 있으면 `Blocked`, 아직 검토 중이면 `Verifying`으로 기록한다.

## 열린 질문

- 다음 Phase에서 Query/Policy가 `Draft`, `Verifying`, `Blocked` dataset을 어떻게 차단/보류할지 정해야 한다.
- Source Connector 확장 Phase가 draft dataset owner를 어떻게 지정할지 정해야 한다.

## 링크 / 증거

- GitHub issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/57
- Focused test: `PYTHONPATH=backend pytest backend/tests/test_source_catalog.py -q` -> 6 passed
- Full backend test: `PYTHONPATH=backend pytest backend/tests -q` -> 17 passed
- Frontend build: `npm run build` -> passed
- Harness validation: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict` -> passed
