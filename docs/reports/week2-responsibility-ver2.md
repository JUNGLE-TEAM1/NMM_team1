# Week2 responsibility ver2 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-25
- Changed: `docs/project-context/asklake-week2-module-plan/README.md`에 ver2 안내를 추가하고, `docs/project-context/asklake-week2-module-plan/ver2/` 아래에 현재 작업 기준 책임 분리 문서 3개와 병렬 구현 전 6-Phase queue를 추가했다. `docs/workflows/docs/week2-responsibility-ver2/` workspace evidence를 작성했다.
- Verified: responsibility keyword check, Iceberg exclusion check, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: `docs/03-interface-reference.md`, `contracts/*.sample.json`, runtime implementation 반영은 후속 PR에서 실제 code boundary가 확정된 뒤 진행한다.
- Next context: M2 `RuntimeConfig`/`SparkRunner` boundary 또는 M3 Amazon Reviews JSON main path 구현 Phase를 시작할 때 `ver2/README.md`를 먼저 읽는다.
- Risk: ver2는 Project Context 기준 문서이며 아직 Source of Truth interface/contracts를 바꾸지 않는다. 구현 branch는 ver2를 참고하되 실제 API/schema 변경 전에는 별도 Source of Truth 전파가 필요하다.
