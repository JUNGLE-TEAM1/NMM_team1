# M1 Week2 final demo flow 노트

## 진행 메모

- `origin/main` `e640f90`에서 branch를 생성했다.
- #200 M5 local/demo completion은 `/etl` UI를 크게 바꾸므로 이번 branch에서 `/etl` 대규모 변경은 피했다.
- #204 M6 DuckDB runtime integration은 backend/runtime wiring을 담당하므로 이번 branch에서는 표시만 보강했다.
- `/catalog`에는 local output, readonly SQL, lineage readiness 표시를 추가했다.
- `/query`에는 DuckDB runtime, SQL rows, evidence readiness 표시와 `local_path_missing` 안내를 추가했다.

## 결정

- M1 follow-up은 frontend display polish로 제한한다.
- open PR source branch를 merge하지 않는다.

## 열린 질문

- 이 branch를 별도 PR로 열지, #200 merge 후 final smoke branch로 다시 정리할지 선택이 필요하다.

## 링크 / 증거

- `npm run build` in `frontend/`: passed
- static keyword check: passed
- route smoke on `127.0.0.1:13001`: `/catalog`, `/catalog/dataset_reviews_gold`, `/query`, `/etl` all 200
- `git diff --check`: passed
- `scripts/validate-harness.sh --strict`: passed
