# Dashboard card storage decisions

- Decision status: accepted

## Decision Option Briefs

- not needed. 선택지는 low-risk backend-only slice와 UI 포함 slice였고, PR size/worktree risk 때문에 backend-only를 채택했다.

## Accepted Decisions

| Decision | Reason | Impact |
| --- | --- | --- |
| Backend 저장/조회 API만 구현한다 | 현재 worktree에 unrelated UI 변경이 있고 PR size hard gate를 피해야 한다 | UI 저장 버튼과 Dashboard 화면은 후속 PR로 분리 |
| `chart_spec`은 JSON object로 API에 노출하고 SQLite에는 `chart_spec_json`으로 저장한다 | SQLite metadata store의 기존 JSON 저장 패턴과 맞다 | API consumer는 object shape만 읽으면 된다 |
| `dashboard_card_id`는 backend가 UUID로 생성한다 | 클라이언트 중복 id 책임을 줄인다 | 저장 응답에서 생성 id를 받아 이후 조회에 사용 |

## Deferred Decisions

| Decision | Reason | Revisit trigger | Target |
| --- | --- | --- | --- |
| 카드 수정/삭제 | 최소 저장/조회 PR 범위를 넘는다 | Dashboard UI에서 관리 액션이 필요할 때 | follow-up Dashboard UI PR |
| SQL 재실행/refresh | query execution policy와 stale dataset handling이 필요하다 | 저장 card를 최신 데이터로 refresh해야 할 때 | follow-up Dashboard refresh PR |
| user/tenant 권한 | MVP demo tenant 저장소에는 아직 auth boundary가 없다 | 사용자별 Dashboard 저장이 필요할 때 | auth/tenant scope PR |

## Revisit / Rollback Conditions

- Dashboard UI 저장 버튼 구현 시 이 API payload가 실제 `AIQueryResult` consumer shape와 맞지 않으면 `DashboardCardCreate`를 조정한다.
- Auth/tenant boundary가 생기면 `dashboard_cards`에 tenant/user scope를 추가하는 별도 migration PR을 만든다.
