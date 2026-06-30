# Product Health handoff catalog ingest shared docs

| Source of Truth file | Proposed / applied change | Status | Notes |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | Product Health handoff import boundary, canonical mapping, local metadata output, Silver internal evidence rule | applied | raw handoff catalog direct registration 금지 |
| `docs/05-acceptance-scenarios-and-checklist.md` | handoff import 후 M6 DuckDB rows와 5GB evidence 반환 acceptance 추가 | applied | Week 2 product risk 대표 경로에 연결 |
| `docs/06-regression-and-failure-scenarios.md` | raw handoff catalog direct registration failure scenario 추가 | applied | M6 500 방지와 canonical import guard |
| `docs/07-manual-verification-playbook.md` | handoff importer manual verification command 추가 | applied | 실제 user Downloads path 포함 |
| `docs/08-development-workflow.md` | C-6 작은 구현 slice로 handoff import 위치 기록 | applied | Dataset Module Connection Queue에 연결 |
