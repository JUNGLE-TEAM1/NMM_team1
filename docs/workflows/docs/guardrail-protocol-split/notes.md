# Guardrail protocol split 노트

## 진행 메모

- 2026-06-26: `scripts/start-workflow.sh docs guardrail-protocol-split "Guardrail protocol split"`로 branch workspace 생성.
- 이번 Phase는 실제 GitHub/repository settings를 바꾸지 않고, 문서상 책임 경계를 먼저 정리한다.
- 핵심 구분은 `System Guardrails`와 `Harness Protocol`이다.
- branch start issue 생성은 local branch creation을 GitHub가 직접 감지할 수 없으므로 `scripts/start-workflow.sh` 책임과 optional branch-push automation 후보로 분리한다.
- PR 이후 linked issue 필수, closing keyword, issue/Project status sync, lifecycle drift detection은 GitHub Actions/Project automation/required check 후보로 분리한다.

## 결정

- 강제 가능한 안전장치는 GitHub/CI/platform에 둔다.
- 하네스는 AI와 사람이 작업 상태, 판단 근거, 검증 결과, 복구 경로를 공유하기 위한 협업 프로토콜로 둔다.
- issue/PR/Project lifecycle은 시작 단계와 통합 단계로 나눈다. 시작 단계는 하네스 스크립트가 담당하고, 통합 단계는 시스템 가드레일 후보로 기록한다.
- `docs/system-guardrails.md`는 Layer Map에서 별도 `System Guardrails` layer로 둔다.

## 열린 질문

- `scripts/start-workflow.sh`는 issue `#133`을 생성하고 Project `In Progress` 설정을 보고했지만, 초기 확인 시 원격 상태가 `CLOSED` / Project `Done`이었다. 2026-06-26에 issue를 reopen하고 Project Status를 `In Progress`로 정렬했다.

## Follow-up 후보

- PR/Issue template shape check를 warning으로 둘지 required check 후보로 둘지 결정한다.
- PR linked issue required check를 hard gate로 둘지 warning/override label 방식으로 둘지 결정한다.
- branch push 시 issue 자동 생성 GitHub Action은 issue noise 위험이 있으므로 optional 후보로만 둘지 검토한다.
- GitHub branch protection, required checks, secret scanning, CODEOWNERS, environment protection 적용 여부를 별도 system guardrail application Phase에서 결정한다.

## 링크 / 증거

- GitHub issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/133
- 원격 issue 상태 확인: `gh issue view 133 --json number,title,state,url,closed,projectItems`
- 원격 상태 정렬: `gh issue reopen 133`, `gh project item-edit --id PVTI_lADOEVx8xs4BbEjqzgw5zSM --project-id PVT_kwDOEVx8xs4BbEjq --field-id PVTSSF_lADOEVx8xs4BbEjqzhV3sIQ --single-select-option-id 98236657`
