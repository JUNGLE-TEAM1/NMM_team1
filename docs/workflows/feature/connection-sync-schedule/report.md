# Connection sync schedule 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: External Connection payload/schema/UI에 `sync_mode`와 `sync_schedule` metadata를 추가했다.
- Verified: backend focused tests 6 passed, frontend build 통과, contract JSON valid, diff check 통과, browser smoke에서 sync mode/schedule 표시와 Source Sync Jobs 미추가를 확인했다.
- Remaining: 실제 scheduler, Source Sync Jobs, Sync Run persistence는 후속.
- Next context: Source Sync Jobs와 실제 scheduler는 여전히 제외한다.
- Risk: 작업 메뉴까지 확장하면 다시 난잡해질 수 있으므로 C-8에서는 연결 metadata 표시까지만 한다.
