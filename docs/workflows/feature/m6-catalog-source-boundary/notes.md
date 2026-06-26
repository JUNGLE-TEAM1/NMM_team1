# M6 CatalogSource 경계 노트

## 진행 메모

- `scripts/start-workflow.sh --allow-dirty feature m6-catalog-source-boundary "M6 CatalogSource 경계"`로 branch workspace를 생성했다.
- workflow script가 기존 dirty worktree를 branch 전환 전 checkpoint commit으로 저장했으나, PR diff 오염을 막기 위해 작업 변경을 stash로 보관한 뒤 `origin/main` 기준 branch에 다시 적용했다.
- M6 query service가 `contracts/catalog_metadata.sample.json`을 직접 읽던 구조를 `CatalogSource` protocol 뒤로 분리했다.
- 기본 runtime은 `FixtureCatalogSource`를 container에서 주입해 기존 fixture 기반 동작을 유지한다.
- 테스트에서는 `InMemoryCatalogSource`를 주입해 fixture 파일 없이도 `selected_datasets`, `evidence`, `query_result`, SQL mirror가 catalog metadata 기반으로 만들어지는지 확인했다.

## 결정

- 이번 slice에서는 공유 `AIQueryResult` 또는 `CatalogMetadata` contract를 바꾸지 않는다.
- M5 실제 Catalog API/store 연동은 후속 adapter로 미룬다.
- semantic/RAG-lite 확장은 `CatalogSource` 경계 뒤에서 catalog 목록이 바뀌어도 `Week2AIQueryService`의 응답 계약은 유지하는 방향으로 둔다.

## 열린 질문

- M5가 제공할 실제 catalog source 형태가 API인지, DB repository인지, file sync인지 확정되면 `CatalogSource` adapter를 추가한다.
- M3 TransformSpec/JSON profile 정보를 M6 evidence에 어느 정도까지 노출할지는 다음 M5/M3 계약 안정화 뒤 확인한다.

## 링크 / 증거

- GitHub issue: #130
- `backend/tests/test_week2_ai_query.py`
- `backend/app/ports/catalog_source.py`
- `backend/app/adapters/fixture_catalog_source.py`
