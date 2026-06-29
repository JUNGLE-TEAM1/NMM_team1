# M2 Product Health 실제 L6 실행 증거 생성 노트

## 진행 메모

- 2026-06-28: PR #230 merge 후 최신 `main` `94e67c5`에서 시작했다.
- 작은 데이터 다운로드는 새로 하지 않는다. 레포 내 `backend/samples/product_health_*_seed.jsonl` 4종을 사용한다.
- 이번 smoke는 source 4종 처리 증거와 L6 Gold preview SQL read를 묶는다.
- L6 Gold preview는 reviews fact input만 집계해 `review_count`, `average_rating`을 만든다.

## 결정

- `gold_product_health.parquet` 파일명과 `gold_product_health` SQL table name을 사용하되, 최종 Product Health metric semantics는 확정하지 않는다.
- `negative_review_rate`, `conversion_rate`, `late_delivery_rate`, `risk_score`는 M3가 최종 의미를 정한 뒤 후속 Phase에서 확장한다.
- 5GB Product Health evidence는 입력 묶음이 준비된 뒤 같은 evidence shape로 별도 실행한다.

## 열린 질문

- M3가 최종 `gold_product_health` schema와 metric formula를 언제 확정할지 확인해야 한다.
- 5GB Product Health input 묶음의 source별 파일 경로와 형식이 아직 확정되지 않았다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/239
- CLI smoke summary: `data/results/m2_product_health_l6_evidence/summary.json`
- Gold preview output: `data/results/m2_product_health_l6_evidence/l6_preview/run_id=run_product_health_l6_evidence_001/gold_product_health.parquet`
