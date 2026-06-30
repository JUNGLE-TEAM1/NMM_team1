# Target Dataset multi-source processing 노트

- 2026-06-30: 사용자가 Product Health 데모 기준 Target Dataset은 여러 Source Dataset을 선택하고, Process 단계에서 어떻게 합칠지 보여줘야 하지 않냐고 확인했다.
- 2026-06-30: Airflow는 현재 Week2 smoke adapter는 있으나 Product Health Target Dataset job과 직접 연결되어 있지 않으므로 실행 성공이 아니라 handoff 선택지로만 표현하기로 했다.
