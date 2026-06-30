# Silver dataset creation 결정

- Decision: Silver Dataset은 Gold Dataset draft 내부 산출물이 아니라 독립 metadata로 만든다.
- Reason: Gold Dataset이 Silver Dataset을 입력으로 선택하려면 Silver가 먼저 생성/조회 가능해야 한다.
- Deferred: 실제 transform 실행과 Gold wizard 전환은 후속 Phase로 분리한다.
