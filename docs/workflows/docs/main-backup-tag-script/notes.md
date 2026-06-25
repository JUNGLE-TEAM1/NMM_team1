# Main backup tag script 노트

## 진행 메모

- 기존 project-context 프롬프트는 설명 문서라 다른 작업자가 항상 같은 방식으로 실행한다고 보장하기 어렵다.
- `scripts/create-main-backup-tag.sh`를 추가해 누구나 같은 명령으로 `origin/main` 기준 backup tag를 만들 수 있게 한다.
- 검증 중에는 실제 tag를 만들지 않도록 `--dry-run`을 사용한다.

## 결정

- backup 기준은 로컬 `main`이 아니라 `origin/main`이다.
- 정식 하네스 Source of Truth 정책은 바꾸지 않는다.

## 열린 질문

- 없음

## 링크 / 증거

- `scripts/create-main-backup-tag.sh --dry-run --date 2026-06-26`
