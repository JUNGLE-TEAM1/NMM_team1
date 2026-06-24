# PR finalization state source 노트

## 진행 메모

- 원인: PR merge 뒤 `prepare-pr --finalize`가 local `sync.md`를 merged/CLOSED로 갱신해도 그 변경은 이미 merge된 PR에 다시 포함되지 않는다.
- 해결 방향: 과거 workspace를 소급 수정하지 않고, 상태 조회 스크립트가 PR link 기반 GitHub 상태를 읽어 stale local field를 보정한다.
- `gh`가 없거나 인증되지 않은 환경에서는 기존 `sync.md` 값을 유지하고 remote status unavailable로 표시한다.

## 결정

- GitHub PR/issue state를 post-merge authoritative source로 사용한다.
- local `sync.md` final field는 pre-merge handoff와 local finalization evidence로 취급한다.

## 열린 질문

- 장기적으로 finalization evidence를 별도 report로 남길지, GitHub 상태 조회만으로 충분한지 운영 후 재평가한다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/65
- Test fixture: `status workflow uses remote PR state for stale sync`
- Test fixture: `branch queue uses remote PR state for stale sync`
