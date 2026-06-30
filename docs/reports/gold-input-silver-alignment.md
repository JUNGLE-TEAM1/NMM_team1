# Gold input silver alignment 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Gold Dataset 생성 입력을 persisted Silver Dataset 선택으로 보정했다.
- Verified: backend focused tests `10 passed`, frontend build passed, browser smoke passed.
- Remaining: Job schedule quick edit은 C-12로 남겼다.
- Next context: C-12에서 Jobs 화면의 schedule edit과 dataset definition edit 경계를 분리한다.
- Risk: backend Target draft 계약의 `source_refs` 이름은 runner/catalog 호환을 위해 유지되며 UI에서는 Silver input으로 표시한다.
