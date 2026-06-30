# Gold input silver alignment 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Gold Dataset wizard 입력을 Source Dataset 직접 선택에서 persisted Silver Dataset 선택으로 보정했다.
- Verified: backend focused tests `10 passed`, frontend build passed, browser smoke passed.
- Remaining: Job schedule quick edit은 C-12로 남겼다.
- Next context: C-12에서 Silver/Gold Jobs의 schedule edit action과 dataset edit flow 분리를 추가한다.
- Risk: backend Target draft 계약의 `source_refs` 이름은 runner/catalog 호환을 위해 유지되며 UI에서는 Silver input으로 표시한다.
