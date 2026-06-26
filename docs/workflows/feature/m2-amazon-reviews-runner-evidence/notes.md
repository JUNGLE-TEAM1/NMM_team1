# M2 Amazon Reviews JSONL runner evidence 노트

## 진행 메모

- `origin/main` `1fa4469` 기준으로 새 branch workspace를 만들었다.
- 이 작업의 핵심은 새 data contract를 만드는 것이 아니라, 이미 merge된 M2 `RuntimeConfig` + `Week2SparkRunner`를 Week 2 대표 데이터인 Amazon Reviews JSONL에 실제로 적용해보는 것이다.
- 기본 입력은 `backend/samples/amazon_reviews_demo.jsonl`이고, M1 synthetic raw 10,000행 입력도 같은 runner evidence 명령으로 검증했다.
- M1 synthetic raw 산출물은 `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`이며, generated `data/`는 git ignore라 commit하지 않는다.
- GitHub issue `#158`은 Project 3 칸반에 연결했고 status는 `In Progress`로 맞췄다.

## 결정

- Amazon Reviews JSONL을 M2 다음 evidence 대상으로 둔다. 이유는 Week 2 main E2E path가 Amazon Reviews JSON -> M3 -> M5 -> M6 -> M1로 정해져 있기 때문이다.
- 이번 PR은 `Week2SparkRunner`를 실제 Spark cluster로 바꾸지 않는다. 현재 목적은 Spark 교체 가능한 입력/출력/metric 경계를 local `pyarrow` 실행으로 검증하는 것이다.
- Taxi evidence와 SQL smoke는 이번 PR에서 분리한다. Taxi는 정형 대용량 처리 evidence이고, SQL smoke는 Parquet output 이후 별도 검산 단계다.

## 열린 질문

- M1 synthetic raw 10,000행 파일을 팀원이 각자 로컬에서 재생성할지, 별도 shared storage에 둘지는 아직 확정되지 않았다.
- M5 Workflow/Catalog가 `Week2SparkRunner`를 직접 호출하는 시점에 runner selection adapter가 필요한지는 후속 통합에서 확인한다.
- SQL engine으로 Parquet output을 바로 읽는 검산은 후속 branch에서 정한다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/158
- 기본 입력: `backend/samples/amazon_reviews_demo.jsonl`
- M1 synthetic raw 재생성 명령 후보: `python3 scripts/week2_m1_synthetic_raw.py --category Gift_Cards --review-rows 10000 --product-rows 1000 --events-per-product 3`
- 이번 evidence 실행 명령: `.venv/bin/python scripts/week2_m2_amazon_reviews_runner_evidence.py --summary-path data/results/m2_amazon_reviews_runner_evidence/summary.json`
- 기본 sample 실행 결과: status `succeeded`, input row count `4`, output row count `4`, output bytes `1898`
- M1 synthetic raw 실행 결과: input row count `10000`, output row count `10000`, output bytes `731455`, duration `114ms`
