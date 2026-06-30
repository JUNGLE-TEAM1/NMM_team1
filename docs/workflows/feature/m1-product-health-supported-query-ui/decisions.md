# M1 Product Health supported query UI 결정 기록

## 결정

| 결정 | 내용 | 이유 | 재검토 조건 |
| --- | --- | --- | --- |
| 기본 질문 | Product Health 대표 질문을 기본 textarea 값으로 둔다. | 발표자가 `/query` 진입 후 즉시 대표 시나리오를 실행할 수 있어야 한다. | 데모 스크립트가 다른 질문으로 바뀔 때 |
| 요약 panel | 기존 결과 표를 대체하지 않고 Product Health answer panel을 추가한다. | 기존 M6 evidence/table 검증 흐름을 보존하면서 발표용 핵심 metric만 위로 올린다. | UI가 과밀해지거나 table 표시와 중복이 심할 때 |
| data label 보정 | 이번 Phase에서는 원본 `product_title`을 그대로 표시한다. | 연결 검증이 목적이고 synthetic data 의미 변경은 data Phase 범위다. | 발표 화면에서 원본 상품명이 너무 산만하다고 판단될 때 |
