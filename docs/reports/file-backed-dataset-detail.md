# File-backed dataset detail 보고서

## Short Report / 짧은 보고

- Type: Phase C-16
- Date: 2026-06-30
- Changed: Source/Silver/Gold Dataset 응답과 UI에 local file-backed evidence 표시를 추가했다.
- Verified: backend focused tests 29개, frontend build, Source/Silver/Gold browser smoke.
- Remaining: 실제 파일 삭제, row preview, ETL 실행은 후속 Phase로 유지한다.
- Next context: C-17 `gold-build-local-materialization-alignment`.
- Risk: 현재 작업 branch 이름과 workspace 이름이 다르고 dirty worktree가 크므로 PR 전 포함 파일 선별이 필요하다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-persistence`, `docs/workflows/feature/file-backed-dataset-detail/`
- Date: 2026-06-30
- Workspace state: completed

## Goal / 목표

- Dataset 상세가 실제 local file evidence와 metadata-only/missing 상태를 구분해 보여준다.

## Implementation Summary / 구현 요약

- `DatasetFileEvidence` contract를 추가했다.
- Source raw path, Silver prepared parquet, Gold prepared parquet를 read-side로 검사해 `file_evidence`로 반환한다.
- 목록과 상세 modal에 `file-backed`, `missing file`, `metadata-only`와 path/bytes/row/schema evidence를 표시한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_draft_persistence.py -q
npm run build
```

## Manual Verification / 수동 검증

- `/datasets/source`: `source_product_catalog` 상세에서 raw JSON path와 bytes 확인.
- `/datasets/silver`: `silver_product_catalog` 상세에서 `silver_product_catalog.parquet`, `rows 1000`, `schema fields 10` 확인.
- `/datasets/gold`: `dataset_product_health` 상세에서 `gold_product_health.parquet`, `rows 1000`, `schema fields 30` 확인.

## Regression Guard / 회귀 보호

- Silver 상세 클릭 시 빈 화면이 되던 잘못된 변수 참조를 수정했다.
- Missing path는 목록 전체 실패가 아니라 `missing file` evidence로 분리된다.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: local DB에 검증용 metadata가 남아 있으므로 demo seed/cleanup 정책은 후속에서 정리한다.
