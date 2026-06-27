# M2 SQL runtime smoke 노트

## 진행 메모

- 2026-06-27: #191 M2 MinIO upload smoke merge 이후 시작했다.
- 다음 연결점은 M6 SQL MVP다. `docs/03-interface-reference.md`는 Week 2 SQL 실행을 `M6 AI Query -> SqlEngineAdapter -> DuckDBSqlEngine -> CatalogMetadata.s3_uri or local path`로 정의한다.
- 현재 main의 `AppContainer.create_sql_engine()`은 `FakeSqlEngine`을 반환한다. 이번 Phase는 실제 file-backed SQL adapter를 추가하되, 기본 API 동작 전환은 테스트와 smoke 근거를 보고 결정한다.

## 결정

- 이번 Phase의 읽기 대상은 `CatalogMetadata.storage.local_fallback_path`다. MinIO/S3 object 직접 query는 production/profile 결정이 더 필요하므로 제외한다.
- `duckdb` dependency를 추가한다. 이유는 Parquet/JSONL local file을 SQL table처럼 읽는 MVP adapter 계약에 가장 가깝기 때문이다.

## 열린 질문

- 기본 container가 즉시 `DuckDBSqlEngine`을 사용할지, smoke script와 명시 주입에서 먼저 검증한 뒤 전환할지 결정이 필요하다.

## 링크 / 증거

- Issue: #198
- Previous M2 storage evidence: PR #191
