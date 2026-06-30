# Catalog payload 기반 Catalog 등록 다음 행동

## Current state

- `catalog_payload` consumer path 구현과 focused validation이 완료되었다.

## Next

1. PR 5A 최종 Manual Run artifact가 같은 field names를 쓰는지 확인한다.
2. PR 5A가 `storage_uri`만 제공하고 `output_path`를 생략하는 경우도 smoke한다.
3. M6 SQL runtime이 S3-compatible `storage_uri` 직접 조회를 요구하면 별도 Phase에서 adapter 범위를 확장한다.
