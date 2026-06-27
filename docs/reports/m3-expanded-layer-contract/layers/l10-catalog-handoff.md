# L10 Catalog Metadata and Semantic Handoff 상세 설계

## 1. 역할

L10은 M3 L0-L9의 최종 handoff 계층이다. L10은 M5가 저장할 catalog package와 M6가 사용할 SQL/AI query context package를 만든다. L10은 새 정제를 수행하지 않는다. 이미 만들어진 artifact ref, version, gate result, catalog safety rule을 묶는다.

L10의 가장 중요한 원칙은 같은 version set을 공유하는 것이다. catalog metadata, SQL context, artifact manifest가 서로 다른 run이나 decision을 가리키면 downstream query가 틀어진다.

## 2. 선택 방식

선택 방식은 `Catalog Sync Contract Package`다. `catalog_sync_contract_package.json`이 상위 package이고, `artifact_reference_manifest.json`, `catalog_metadata_draft.json`, `sql_context_pack.json`, lineage/ref files를 함께 묶는다.

모든 `*_ref`는 string artifact id다. 실제 file path, MinIO/S3 URI, checksum, byte size는 `artifact_reference_manifest.json`에서 resolve한다. 이 규칙은 L10에서 특히 중요하다. M5/M6가 물리 위치를 직접 추측하지 않게 하기 위해서다.

## 3. 선택 이유

M5는 workflow/catalog 저장 상태를 관리하고, M6는 query context를 소비한다. 두 모듈이 같은 artifact chain을 봐야 한다. L10이 version/ref/status를 한 package로 묶으면 “M5 catalog는 최신인데 M6 query context는 이전 spec” 같은 문제가 줄어든다.

또한 L10은 Silver-only와 Gold-ready를 명확히 표현해야 한다. Gold가 not requested인데 catalog가 Gold ready처럼 보이면 M6 질의에서 hallucination이나 잘못된 metric 사용이 생길 수 있다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l10/catalog_sync_contract_package.json` | version set, refs, layer status를 묶는 최종 package다. |
| `l10/artifact_reference_manifest.json` | artifact id를 physical URI, checksum, byte size, access class로 resolve한다. |
| `l10/catalog_metadata_draft.json` | M5 catalog 저장용 dataset/layer/quality/caveat metadata다. |
| `l10/sql_context_pack.json` | M6 SQL/AI query에 허용되는 table, column, metric, caveat를 담는다. |
| `l10/field_level_lineage.json` | source path에서 Silver/Gold field까지의 lineage를 기록한다. |
| `l10/catalog_validation_result.json` | PII/query context validator와 ref resolver 결과를 기록한다. |

## 5. 장점

첫째, M5와 M6가 같은 상태를 본다. version set과 artifact manifest가 단일 handoff package에 있으므로 동기화 문제가 줄어든다.

둘째, query context 안전성이 높다. forbidden field, masked field, hidden catalog field를 M6 allowed columns에서 제거하거나 제한할 수 있다.

셋째, 설명 가능성이 높다. 사용자가 특정 field나 metric을 물었을 때 source path, transform decision, quality caveat까지 추적할 수 있다.

## 6. 단점과 문제

첫째, L10 package가 커진다. refs, versions, lineage, SQL context, caveat가 모두 들어가므로 단순 catalog row보다 복잡하다.

둘째, ref resolver가 정확해야 한다. artifact id가 중복되거나 checksum이 맞지 않으면 downstream이 잘못된 결과를 볼 수 있다.

셋째, catalog와 query context의 차이를 UI와 문서에서 설명해야 한다. catalog에 숨겨진 field가 physical Silver에는 있을 수 있다는 점을 팀이 이해해야 한다.

## 7. 가능 범위

L10은 Bronze/Silver/Gold layer status, dataset metadata, field lineage, quality axis refs, SQL context allowed tables/columns, metrics, forbidden fields, query caveats를 표현할 수 있다.

Gold 상태는 `available`, `deferred`, `needs_owner_review`, `blocked`, `not_requested`로 표현한다. M6 context도 `ready`, `ready_with_caveat`, `not_ready`, `blocked`, `not_requested`를 구분한다.

## 8. 한계

L10은 M5 catalog API에 실제 저장하는 runtime 자체가 아니다. L10은 저장할 package를 만든다. M5가 API 저장, transaction, permission, UI state를 책임진다.

L10은 retrieval/RAG context를 core로 만들지 않는다. SQL/AI query context는 structured table/metric 중심이다. unstructured retrieval은 extension hook이다.

## 9. 검증 기준

모든 `*_ref`는 `artifact_reference_manifest.json`에서 정확히 하나로 resolve되어야 한다. checksum mismatch는 block이다. access class가 consumer와 맞지 않으면 block이다. forbidden field가 `sql_context_pack.allowed_columns`에 있으면 block이다.

Gold not_requested 상태에서는 `sql_context_pack.metrics`가 비어 있거나 Gold not requested caveat를 포함해야 한다. processing/catalog safety block인데 M6 context가 ready이면 block이다.

## 10. Handoff

L10은 M5 catalog storage와 M6 query context로 넘어간다. M5는 package를 저장하고 approval/catalog status를 관리한다. M6는 `sql_context_pack.json`만으로 허용 table, allowed columns, metric caveat, forbidden fields를 이해해야 한다.
