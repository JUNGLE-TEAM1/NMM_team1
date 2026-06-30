# External connection type alignment 다음 행동

## 추천 다음 Phase

1. 실제 persistence/API 연결
   - UI의 Local File 입력을 `/api/sources` 또는 최소 external connection adapter와 연결한다.
2. Source Dataset 저장
   - Source Dataset draft가 `SourceConfig.connection_ref` 또는 `RuntimeConfig.source_inputs[]`로 저장되게 한다.
3. Kafka replay smoke
   - M4 replay evidence endpoint 또는 sample topic contract를 Source Dataset review에 연결한다.

## 수동 확인 경로

`/dataset` -> `데이터셋 생성` -> `External Connection` -> `Kafka Topic` -> `Configure`
