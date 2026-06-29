# AI query dataset context 계획

## 브랜치

- Branch: `feature/ai-query-dataset-context`
- Workspace: `docs/workflows/feature/ai-query-dataset-context`
- Created: 2026-06-29

## 목표

- M6 AI Query가 CatalogMetadata와 Target Dataset context를 읽어 read-only SQL/evidence 결과를 만든다.
- 사용자가 생성/등록된 dataset을 선택하고 질문할 수 있게 한다.

## 범위

- AI Query dataset selector 또는 catalog detail handoff.
- CatalogMetadata 기반 SQL context 구성.
- read-only SQL validation과 DuckDB/local output 조회.
- query result, SQL, evidence, chart-ready summary 표시.

## 범위 제외

- LLM/RAG production quality 확장.
- write SQL.
- permission/PII masking full policy.
- dashboard full build.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/ai-query-dataset-context` Phase만 구현한다.
M6 AI Query가 CatalogMetadata와 Target Dataset context를 읽어 read-only SQL/evidence 결과를 만들게 한다.
dataset selector 또는 catalog detail handoff를 제공하고, SQL/rows/evidence를 화면에 표시한다.
RAG/LLM production 확장, 권한 full policy, dashboard는 구현하지 않는다.
```

## 완료 기준

- [ ] AI Query가 dataset context를 선택하거나 전달받는다.
- [ ] CatalogMetadata 기반 read-only SQL context가 구성된다.
- [ ] SQL, rows, evidence가 화면에 표시된다.
- [ ] unsupported/empty/error 상태가 사용자에게 설명 가능하다.
- [ ] report와 quality evidence를 남긴다.
