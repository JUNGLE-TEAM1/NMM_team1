# Source Snapshot large data readiness next actions

## Recommended

1. C-37 `Product Health Source Inventory Binding`으로 이동한다.

Reason: Source Snapshot의 sample/full ingest 경계가 명확해졌으므로, 다음은 이미 준비된 Product Health 원천들을 Source Dataset inventory에 묶는 단계가 자연스럽다.

## Alternatives

- Browser smoke를 별도 Hotfix/검증 Phase로 추가해 Source Dataset 상세 modal의 시각 표현을 확인한다.
- Full 5GB ingest runner 설계 Phase를 먼저 만든다. 단, Spark/Airflow 범위가 커진다.
