# PR record reconciliation Hotfix 노트

- #181은 title/body template drift가 있었고, 원격 title/body를 보정했다.
- #182는 no-issue 예외 승인 문구가 없어 새 linked issue check 기준 실패였고, 원격 body에 approved no-issue exception을 추가했다.
- #181/#182 모두 `scripts/audit-github-records.sh --pr 181 --pr 182` 통과 상태다.
- #181/#182 모두 origin/main linked issue check 기준 통과 상태다.

