# Week2 M6 RAG scope 보강 계획

## 브랜치

- Branch: `codex/docs-week2-m6-rag-scope`
- Workspace: `docs/workflows/docs/week2-m6-rag-scope`
- Created: 2026-06-26

## 목표

- Week2 ver2 문서에서 M6의 Semantic/RAG/AI Query 책임이 사라진 것처럼 보이지 않게 보강한다.
- RAG 범위는 `CatalogMetadata` 기반 semantic retrieval, dataset selection evidence, RAG-lite grounding으로 제한한다.
- 외부 vector DB, full document RAG, 대규모 indexing, real LLM provider 연결은 후속 확장으로 유지한다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- 관련 ver2 handoff/anchor/transition 문서의 M6 표현 정렬
- branch workspace evidence와 Phase report 작성

## 범위 제외

- runtime code 변경
- `contracts/*.sample.json` 변경
- 외부 vector DB/full document RAG/real LLM 구현 범위 추가
- Taxi/Kafka의 M6 분석 연결을 이번 기본 범위로 승격

## 완료 기준

- [x] M6에서 RAG가 빠진 것처럼 보이지 않는다.
- [x] 이번 기본 범위가 full RAG/vector DB로 커진 것처럼 보이지 않는다.
- [x] Amazon Reviews 분석 대표 경로와 Taxi/Kafka 필수 처리/evidence 경로 결정이 유지된다.
- [x] 검증 결과를 `quality.md`와 report에 기록한다.
