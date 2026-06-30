# 하네스 CI Fast Path와 Local Complete Gate 보강 노트

## 진행 메모

- CI 병목과 하네스 운영 병목을 함께 다루되, CI 변경과 운영 규칙 변경을 문서상 분리했다.
- workflow는 required job 이름을 유지하고 내부 heavy step을 path filter로 조건부 실행한다.
- 이 변경 자체는 CI/harness behavior 변경이므로 Fast Path 대상이 아니라 Escalate Read + harness regression 대상이다.

## 열린 질문

- repo admin이 나중에 `ci-status` aggregator를 required check로 등록할지 여부.

## 링크 / 증거

- `.github/workflows/ci.yml`
- `docs/12-quality-gates.md`
