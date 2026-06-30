# Catalog metadata integration 결정

- Decision: C-6 publish는 Job Run과 CatalogDataset 사이의 명시적 수동 액션으로 둔다.
- Reason: 데모에서 `Run 준비 -> Local 실행 -> Catalog 등록 -> Gold Dataset 확인` 순서가 가장 설명 가능하다.
- Deferred: 자동 publish, SQL allowlist 생성, AI Query context 소비는 C-7 이후로 넘긴다.
