# Catalog metadata integration 계획

## 브랜치

- Branch: `feature/catalog-metadata-integration`
- Workspace: `docs/workflows/feature/catalog-metadata-integration`
- Created: 2026-06-29

## 목표

- 성공한 run output을 M3/M5 CatalogMetadata로 등록한다.
- 데이터 카탈로그 화면이 실제 dataset metadata, schema, storage, metrics, lineage를 조회하도록 연결한다.

## 범위

- CatalogMetadata create/update/read 연결.
- Source Dataset과 Target Dataset lineage 연결.
- schema, storage path, metrics, quality facts, SQL allowlist context 저장.
- Catalog list/detail UI API 연결.

## 범위 제외

- AI Query execution.
- 권한/마스킹 정책 full implementation.
- production warehouse sync.
- lineage graph full canvas.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/catalog-metadata-integration` Phase만 구현한다.
성공한 run output을 CatalogMetadata로 등록하고 데이터 카탈로그 list/detail UI가 실제 metadata를 조회하도록 연결한다.
M6가 후속 Phase에서 소비할 수 있도록 SQL allowlist context와 output path를 포함한다.
AI Query 실행은 구현하지 않는다.
```

## 완료 기준

- [ ] run output이 CatalogMetadata로 등록된다.
- [ ] Catalog list/detail이 API 기반 metadata를 표시한다.
- [ ] schema, storage, metrics, lineage가 확인된다.
- [ ] M6가 소비할 SQL allowlist context가 존재한다.
- [ ] report와 quality evidence를 남긴다.
