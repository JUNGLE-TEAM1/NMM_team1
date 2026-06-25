# 이슈 템플릿 생성 경로 보강 노트

## 진행 메모

- 2026-06-25: PR #89 이후 issue/PR 생성 경로 분석에서 GitHub UI template이 아닌 `start-workflow.sh`, `prepare-pr.sh`, 수동 `gh` 경로가 template drift를 만든 것을 확인했다.
- 2026-06-25: 이번 작업은 기존 remote issue/PR 보정 없이 `start-workflow.sh` 생성 경로만 보강한다.
- 2026-06-25: fake `gh` fixture에서 issue body file을 캡처해 한국어 heading, label, literal newline escape 부재를 검증하도록 했다.

## 결정

- 사람이 넘긴 제목 내용은 임의 번역하지 않고, 스크립트가 붙이는 prefix와 기본 문구만 한국어화한다.
- `test` type은 적절한 기존 label 정책이 없어 label을 붙이지 않고 `[검증]` prefix만 사용한다.

## 열린 질문

- 이미 생성된 #90-#101, #96-#99의 remote 보정은 하네스 보강 이후 별도 작업으로 진행한다.

## 링크 / 증거

- `scripts/test-harness.sh`
- `scripts/validate-harness.sh --strict`
