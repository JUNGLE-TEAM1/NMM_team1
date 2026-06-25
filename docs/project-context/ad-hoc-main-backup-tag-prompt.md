# Ad-hoc main backup tag prompt

## 목적

이 문서는 사용자가 명시적으로 요청했을 때만 `origin/main`의 현재 상태를 Git tag로 백업하기 위한 보조 프롬프트다.

이 문서는 Source of Truth나 하네스 운영 규칙이 아니다. `main`, `dev`, `master` 같은 브랜치 전략을 바꾸지 않고, 필요할 때 고정 스냅샷을 남기는 실행 루트만 제공한다.

공용 실행은 `scripts/create-main-backup-tag.sh`를 사용한다.

## 트리거 문구

아래와 같은 요청을 받으면 이 프롬프트를 적용한다.

- "오늘 백업 만들어줘"
- "main 백업 태그 만들어줘"
- "백업 tag 찍어줘"
- "origin/main 스냅샷 남겨줘"

## 실행 절차

1. 현재 저장소와 브랜치 상태를 확인한다.
2. `scripts/create-main-backup-tag.sh`를 실행한다.
3. 완료 후 스크립트가 출력한 태그명, 대상 commit, GitHub Tags 링크를 보고한다.

## 안전 규칙

- 이 요청만으로 `main`, `dev`, `master` 같은 브랜치를 새로 만들지 않는다.
- `main`에 merge, pull, rebase, PR merge를 실행하지 않는다.
- 작업 중인 feature/docs 브랜치의 uncommitted 변경을 건드리지 않는다.
- 기존 태그를 덮어쓰거나 삭제하지 않는다.
- 하네스 Source of Truth 문서에는 반영하지 않는다.
- 단순 백업 실행으로 취급하고, 별도 Phase나 PR 정책 변경으로 확대하지 않는다.
- 검증이 필요하면 `scripts/create-main-backup-tag.sh --dry-run`을 먼저 실행한다.

## 태그명 규칙

- 기본: `backup/main-YYYY-MM-DD`
- 중복 시: `backup/main-YYYY-MM-DD-N`

## 명령 예시

```bash
git status --short --branch
scripts/create-main-backup-tag.sh
```

실제 태그를 만들지 않고 확인만 하려면 dry run을 사용한다.

```bash
scripts/create-main-backup-tag.sh --dry-run
```

## 완료 보고 예시

```text
완료했습니다. `backup/main-2026-06-25` 태그를 `origin/main`의 `<commit>`에 만들고 push했습니다.
GitHub Tags에서 확인할 수 있습니다: https://github.com/JUNGLE-TEAM1/NMM_team1/tags
```
