# Source dataset detail/manage 결정

- Decision: C-9는 Source Dataset 관리성만 보강하고 Silver/Gold 구조 변경은 하지 않는다.
- Reason: Source Dataset 상세/수정/삭제는 독립적으로 확인 가능하며, Silver 생성 이전에 관리 기반이 필요하다.
- Deferred: Silver Dataset 생성, Gold wizard Silver 입력 전환, 실제 ingest/delete cascade.
