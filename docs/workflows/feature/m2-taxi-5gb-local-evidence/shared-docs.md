# M2 Taxi 5GB local Spark evidence 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | update Taxi supporting evidence note so PySpark local mode is no longer described as future-only | current branch adds real PySpark local 5GB evidence | low |
| `docs/07-manual-verification-playbook.md` | add Taxi 5GB local Spark evidence command and expected evidence fields | next M2/M5/M6 users need a reproducible command | low |

## Integration Notes / 통합 메모

- Taxi local Spark 5GB evidence is supporting evidence only. It does not change the Week 2 representative Product Health path.

## Conflicts To Resolve / 해결할 충돌

- none known
