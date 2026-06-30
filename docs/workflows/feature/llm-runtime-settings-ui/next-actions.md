# 다음 행동

## Current Recommendation / 현재 권장

- PR #308 CI 결과를 확인한다.
- PR #308이 merge된 뒤 stacked MongoDB PR #309의 base를 `main`으로 retarget하거나, GitHub가 자동으로 main diff를 갱신하는지 확인한다.

## Resume Condition / 재개 조건

- `.env.local`이 accidentally tracked 되거나 PR check가 secret/log 노출을 지적하면 즉시 수정한다.
