# Project issue link Hotfix 노트

## 진행 메모

- `gh auth refresh --hostname github.com -s read:project -s project`로 project scope를 추가했다.
- `gh project item-add 3 --owner JUNGLE-TEAM1 --url https://github.com/JUNGLE-TEAM1/NMM_team1/issues/78`로 누락 issue를 연결했다.
- Project item status를 정리해 열린 `#78`은 `In Progress`, 기존 closed issue 33개는 `Done`으로 설정했다.
- `gh project item-list 3 --owner JUNGLE-TEAM1`에서 `Done` 33개, `In Progress` 1개를 확인했다.

## 결정

- 기본 project target은 `ASKLAKE_GITHUB_PROJECT_OWNER`와 `ASKLAKE_GITHUB_PROJECT_NUMBER` env로 override 가능하게 두고, 기본값은 `JUNGLE-TEAM1` / `3`으로 둔다.
- 새로 생성되는 issue의 Project Status는 `In Progress`로 둔다.

## 열린 질문

- 없음.

## 링크 / 증거

- `https://github.com/JUNGLE-TEAM1/NMM_team1/issues/78`
- `https://github.com/orgs/JUNGLE-TEAM1/projects/3`
