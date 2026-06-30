# Runtime evidence integration 계획

## 목표

C-4.5 local materialization 결과에 source-level evidence와 runtime evidence summary를 추가한다.

## 범위

- `duration_ms`
- `source_evidence[]`
- `runtime_evidence`
- `/runs` evidence 표시

## 제외

- M4 Kafka replay 실제 호출
- M2 5GB batch 실제 재실행
- CatalogMetadata publish
