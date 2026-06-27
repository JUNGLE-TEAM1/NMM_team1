# PR record reconciliation Hotfix 노트

- #181은 title/body template drift가 있었고, 원격 title/body를 보정했다.
- #182는 no-issue 예외 승인 문구가 없어 새 linked issue check 기준 실패였고, 원격 body에 approved no-issue exception을 추가했다.
- #181/#182 모두 `scripts/audit-github-records.sh --pr 181 --pr 182` 통과 상태다.
- #181/#182 모두 origin/main linked issue check 기준 통과 상태다.
- 추가 지시로 #150 이후 merged PR 중 drift가 있던 PR도 title/body metadata를 보정했다.
- 보정 대상: #150, #153, #154, #156, #157, #159, #160, #167, #170, #180, #183.
- 제목 보정: #153 `[검증] ...`, #157 `[기능] ...`, #160 `[문서/운영] ...`, #183 `[기능] ...`로 harness prefix를 맞췄다.
- body 보정: 승인 없는 no-issue PR에는 `No Linked Issue Exception: approved`와 historical metadata reconciliation 사유를 추가했고, 구형/축약 body PR은 7-section template으로 재작성했다.
