# M2 Taxi local batch evidence 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M2 Taxi local batch evidence IDs and `gold_taxi_daily_metrics` schema added | Taxi runner output is a shared downstream evidence shape for M5/M6 follow-up | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | M2 Taxi local batch evidence acceptance bullet added | Completion criteria must include row count, bytes, duration, output path evidence | low |
| `docs/07-manual-verification-playbook.md` | Taxi evidence CLI fixed/full-month verification step added | Human can reproduce local evidence without reading implementation internals | low |

## Integration Notes / 통합 메모

- `docs/02`는 수정하지 않는다. 이번 PR은 architecture boundary를 바꾸지 않고 M2 local evidence runner를 추가한다.
- `docs/06`은 수정하지 않는다. 기존 Week 2 fixture/hardening regression guard가 이 변경을 포괄한다.

## Conflicts To Resolve / 해결할 충돌

- none
