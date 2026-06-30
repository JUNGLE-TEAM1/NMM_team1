# Harness status entrypoints 노트

## 진행 메모

- 2026-06-28: 하네스 품질 평가 후속으로 온보딩/현황 파악 약점을 줄이는 문서 안내 보강을 진행.
- 기존 작업트리에 `docs/workflows/feature/m5-airflow-smoke-integration/sync.md` 수정이 있어 branch 전환 없이 `--no-checkout --no-issue`로 workspace만 생성.

## 결정

- 이번 Phase는 상태 확인 entrypoint와 report 읽기 순서만 보강한다.
- YAML/JSON frontmatter 분리와 script 모듈화는 별도 Phase로 분리한다.

## 열린 질문

- 이 변경을 PR로 보낼지, 기존 `feature/m5-airflow-smoke-integration` 작업에 흡수할지는 사용자 확인 필요.

## 링크 / 증거

- `docs/workflows/README.md`
- `docs/reports/README.md`
- `scripts/validate-harness.sh` passed
- `scripts/validate-harness.sh --strict` passed
- `scripts/test-harness.sh` passed 31 fixture regression tests
