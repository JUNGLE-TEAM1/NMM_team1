# Big dataset manipulation context alignment 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-25
- Changed: AskLake가 대용량/복합 데이터셋을 수집·스키마화·변환·검산·게시하는 플랫폼이라는 문맥을 README와 Source of Truth에 보강하고, Query Engine은 특정 엔진이 아니라 adapter 경계로 보이게 정리했다. 사람이 보는 온보딩/project context 요약도 현재 B2B SaaS 및 dataset manipulation 흐름에 맞게 보강했다.
- Verified: 대용량/변환/검산/evidence 키워드 검색, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`로 확인했다.
- Remaining: push/PR/merge는 사람 확인 전 실행하지 않는다.
- Next context: 후속 구현 Phase는 output path, row count, bytes, duration, SQL 검산 evidence를 완료 기준에 포함한다.
- Risk: 이 문맥 보강이 production-grade distributed processing 또는 cloud deploy 강제 도입으로 오해되지 않아야 한다.
