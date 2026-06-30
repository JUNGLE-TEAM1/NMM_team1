# Product Health External Source Contract 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-07-01
- Changed: Product Health source inventory를 Kafka/PostgreSQL/MongoDB/S3 runtime source 기준으로 재정의하고 local/prepared artifact를 fallback evidence로 분리했다.
- Verified: Product Health source inventory backend test, Product Health preset synthesis regression test, frontend build, diff check.
- Remaining: C-43에서 runtime connection seed/readiness를 연결 화면에 맞춘다.
- Next context: C-44에서 Source Dataset 저장 payload까지 외부 시스템 connection type과 fallback evidence 기준으로 정렬한다.
- Risk: 실제 Kafka consume, PostgreSQL query, MongoDB scan, S3 object scan은 아직 수행하지 않는다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_product_health_source_inventory.py backend/tests/test_product_health_preset_synthesis.py -q
npm --prefix frontend run build
git diff --check
```

## Regression Guard / 회귀 보호

- Checked feature: Product Health runtime source inventory.
- Protected behavior: Product Health primary source가 local/prepared artifact로 되돌아가지 않는다.
- Result: passed.

## Failure Scenario / 실패 시나리오

- Reviewed failure: fallback artifact가 primary connection처럼 표시되는 경우.
- Expected behavior: `binding_type=runtime_source`, `connection_type=kafka/postgres/mongodb/s3`, fallback은 `fallback_*` 필드에 표시한다.
- Verification: backend contract test and frontend build.
- Result: passed.

## Final Judgment / 최종 판단

- Done: yes for C-42.
- Remaining risk: connection seed와 Source save alignment는 C-43/C-44로 남는다.
