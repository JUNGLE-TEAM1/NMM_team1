# GitHub record drift audit 보강 노트

## 진행 메모

- #112 `feat: M5 local UI demo panel`은 GitHub issue template/harness script 생성 경로 밖에서 만들어져 한국어 title prefix, body sections, label이 빠진 edge case로 확인했다.
- `scripts/audit-github-records.sh --issue 112`는 drift를 감지하고, `--issue 111`은 통과해 정상/비정상 구분을 확인했다.
- `scripts/status-workflow.sh`는 linked issue/PR audit 결과를 표시하고 drift가 있으면 자동 PR 생성을 보류한다.
- 2026-06-25 추가 확인: `상태보고 머지까지해` 같은 넓은 지시가 여러 open PR merge로 확대될 수 있음을 확인했고, merge/finalize 승인은 현재 workspace PR 또는 명시 PR 번호/branch 1개에만 적용되는 single-target guardrail을 추가했다.

## 결정

- 기존 GitHub issue/PR record는 이 branch에서 자동 수정하지 않는다. 먼저 하네스 보강과 회귀 검증을 완료한다.
- merge/finalize 승인 범위는 한 번에 한 PR로 제한한다. 다른 open PR은 상태 보고만 하고, 별도 PR 번호/branch 명시 없이는 merge하지 않는다.

## 열린 질문

- #112 및 이후 record 보정은 이 PR 또는 후속 작업 병합 후 별도 사람 지시로 수행한다.

## 링크 / 증거

- `scripts/test-harness.sh`: `Harness regression tests passed: 30`
- `scripts/audit-github-records.sh --issue 112`: drift 감지
- `scripts/audit-github-records.sh --issue 111`: pass
