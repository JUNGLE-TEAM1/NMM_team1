# Week2 data path scope clarity 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-26
- Changed: ver2 문서에서 Week2 데이터 경로 기준을 보강했다. 세 데이터 경로는 모두 구현 대상이며, Amazon Reviews JSON은 AI Query/분석 대표 경로, Taxi Batch와 Kafka Event는 필수 처리/evidence 경로로 정리했다. Synthetic companion dataset 기반 multi-dataset 분석은 후속 리서치로 분리했다.
- Verified: `rg -n "Amazon Reviews|Taxi|Kafka|필수 처리/evidence|synthetic|공통 entity|M6 분석" docs/project-context/asklake-week2-module-plan/ver2`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR review/CI. Runtime code, `docs/03-interface-reference.md`, `contracts/*.sample.json`은 변경하지 않았다.
- Next context: M2/M3/M4는 Taxi/Amazon/Kafka 처리/evidence 경로를 모두 닫되, M6 분석 대표 경로는 먼저 Amazon Reviews JSON으로 연결한다.
- Risk: 팀이 세 데이터셋 전체의 통합 분석까지 발표 범위로 다시 올리면 synthetic companion dataset 설계가 별도 Phase로 필요하다.
