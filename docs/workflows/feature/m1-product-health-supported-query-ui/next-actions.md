# M1 Product Health supported query UI 다음 행동

## 현재 상태

M1 `/query` 화면이 Product Health Gold + M6 DuckDB SQL 성공 결과를 실제로 표시한다.

## 다음 후보

1. Product title/category 표시 보정
   - 원본 상품명 대신 발표용 `demo_product_label` 또는 `demo_category_label` 중심으로 보여준다.
2. PR 준비
   - 현재 dirty worktree와 behind 상태를 정리하고 포함 파일을 선별한다.
3. 최종 demo smoke
   - `/datasets` 또는 연결 화면에서 시작해 `/query` 결과까지 이어지는 전체 클릭 시나리오를 다시 확인한다.
