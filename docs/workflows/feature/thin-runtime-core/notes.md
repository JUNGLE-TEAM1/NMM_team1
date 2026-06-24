# Thin Runtime Core 노트

## 진행 메모

- `main` clean 상태에서 `scripts/start-workflow.sh feature thin-runtime-core "Thin Runtime Core"`로 branch/workspace를 생성했다.
- 기존 backend는 `api -> services -> ports/domain`, `adapters -> ports/domain` 구조를 이미 갖고 있어서 대규모 refactor 없이 Target MVP thin skeleton만 추가했다.
- R0.6은 기능 구현 완료가 아니라 병렬 구현을 위한 importable contract, fake provider, service anchor를 제공한다.
- frontend는 visible UI 변경 없이 feature entry anchor만 추가했다.

## 결정

- 하네스 규칙은 추가하지 않는다.
- R0.5 shared contract 이름은 유지하고, 코드 위치 mapping만 `docs/03`에 추가한다.
- 실제 provider는 모두 금지하고 `backend/app/fakes/` local fixture만 사용한다.

## 열린 질문

- 첫 실제 source connector는 아직 결정하지 않았다.
- Query engine은 local-first 또는 Trino 도입 시점을 아직 결정하지 않았다.
- 첫 병렬 wave를 실제로 열지는 아직 결정하지 않았다.

## 링크 / 증거

- `backend/tests/test_thin_runtime_core.py`
- `backend/app/domain/target_contracts.py`
- `backend/app/fakes/`
- `docs/reports/thin-runtime-core.md`
