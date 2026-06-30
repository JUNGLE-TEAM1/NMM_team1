# Target Dataset multi-source processing 결정 기록

| Decision | Status | Rationale |
| --- | --- | --- |
| source cardinality | accepted | Product Health gold dataset은 리뷰/VOC, 카탈로그, 행동/주문, 배송 proxy source를 결합하는 시나리오라 Target Dataset 생성에서 2개 이상 source 선택이 필요하다. |
| base dataset 표현 | accepted | 최종 Gold row 단위는 `product_id`이므로 `Primary source`보다 `Base dataset`과 `Target grain`이 더 정확하다. Product Health preset은 Partner Catalog API를 base로 둔다. |
| processing 표현 | accepted | 데모에서는 SQL canvas보다 Join/Aggregate/Enrich/Score/Select recipe card가 더 직관적이다. |
| Silver 표현 | accepted | Silver Dataset은 별도 생성 wizard가 아니라 Target Dataset Process 단계의 intermediate output live preview로 보여준다. 사용자는 source/recipe를 조작하고 diagram은 결과를 설명한다. |
| Airflow 표현 | accepted | 현재 Airflow는 기존 Week2 smoke adapter가 있을 뿐 Product Health Target Dataset job과 직접 연결되지 않았으므로 `handoff` 선택지로만 표시한다. |
