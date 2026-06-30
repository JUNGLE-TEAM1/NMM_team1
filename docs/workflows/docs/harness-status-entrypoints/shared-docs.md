# Harness status entrypoints 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/workflows/README.md` | 현재 상태 확인 entrypoint와 10분 운영 루트 추가 | 활성 branch/workspace와 historical evidence를 처음부터 구분하기 위해 | 낮음: 안내 문서 변경 |
| `docs/reports/README.md` | evidence reading ladder 추가 | 모든 report를 읽지 않고 최신 index와 관련 report만 읽도록 유도하기 위해 | 낮음: 안내 문서 변경 |

## Integration Notes / 통합 메모

- 이 작업은 하네스 동작을 바꾸지 않고 탐색/온보딩 안내만 추가한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
