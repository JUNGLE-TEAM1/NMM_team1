# PH-DATA-2C 결정

| 날짜 | 결정 | 근거 |
| --- | --- | --- |
| 2026-06-30 | smoke에서는 `input_total_bytes`를 하위 호환용으로 유지하되 `available_source_bytes` 의미임을 명시한다. | 기존 소비자가 깨지지 않게 하면서 5GB 처리 증거와 혼동을 줄인다. |
| 2026-06-30 | PH-DATA-3의 완료 기준은 `processed_input_total_bytes >= 5GB`로 둔다. | 5GB evidence는 준비된 파일 크기가 아니라 실제 처리한 input 기준이어야 한다. |
