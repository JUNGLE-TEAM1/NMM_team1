# PR Conflict Resolution Protocol 보고서

## Short Report / 짧은 보고

- Type: Harness documentation
- Date: 2026-06-24
- Changed: PR conflict 감지, 분류, 사람 확인, 해결 후 재검증, `sync.md`/`quality.md` evidence 기록 규칙을 `docs/11`, `docs/10`, `docs/13`, `docs/12`, `docs/08`에 추가하고, `scripts/start-workflow.sh`, `scripts/status-workflow.sh`, `scripts/validate-harness.sh`, `scripts/test-harness.sh`에 template/status/static guard/fixture를 연결했다.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/test-harness.sh`, `git diff --check`
- Remaining: 이번 요청은 branch/push/PR 없이 local template/status/validation 보강까지 수행했다. 실제 GitHub PR conflict를 live로 재현하는 E2E는 별도 사람 승인 audit 대상이다.
- Next context: PR이 conflict 상태가 되면 `docs/11-git-sync-policy.md`의 `PR Conflict Resolution Protocol`과 `docs/10-next-action-menu.md`의 `PR Conflict Detected` 메뉴를 따른다.
- Risk: merge/rebase/push/PR merge는 여전히 사람 확인 뒤에만 실행한다.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/10-next-action-menu.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/15-context-budget-rule.md`

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/11`, `docs/10`, `docs/13`
- Escalated context read: `docs/08`, `docs/12`, `docs/15`, 관련 `rg` 결과
- Context omitted intentionally: 제품/architecture/interface/acceptance/regression/manual verification 전체 문서는 이번 변경이 Git sync/PR conflict 운영 규칙에 한정되어 열지 않았다.

## 변경 시작 계층

- Start layer: Git Sync Policy
- Propagation: Development Operations/Git Sync Policy -> Workflow -> Next Action Menu -> Quality Gates -> Human Command Flow
- Scope: docs-only harness rule clarification

## Document Updates / 문서 업데이트

- Updated: `docs/11-git-sync-policy.md`에 `PR Conflict Resolution Protocol`과 status/template evidence 위치 추가
- Updated: `docs/10-next-action-menu.md`에 `PR Conflict Detected` 메뉴 추가
- Updated: `docs/13-human-command-flow.md`에 `PR 충돌 해결해` 사람 명령 흐름 추가
- Updated: `docs/12-quality-gates.md`에 conflict resolution evidence 기록 요구 추가
- Updated: `docs/08-development-workflow.md`에 Git Sync 규칙과 PR stop condition 전파
- Updated: `docs/18-harness-regression-policy.md`에 PR conflict workflow guard 기대값 추가
- Updated: `scripts/start-workflow.sh`에 `PR Conflict Confirm`과 `PR Conflict Resolution` template 추가
- Updated: `scripts/status-workflow.sh`에 PR conflict evidence read-only 요약과 unresolved conflict 우선 추천 추가
- Updated: `scripts/validate-harness.sh`에 protocol/menu/command/template/status static guard 추가
- Updated: `scripts/test-harness.sh`에 PR conflict status fixture 추가
- Not updated and why: `docs/09-collaboration-agreement.md`는 기존 사람 확인 원칙으로 충분해 수정하지 않았다.

## Verification Commands / 검증 명령

```bash
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
scripts/test-harness.sh
git diff --check
```

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: 실제 conflict 자동 감지와 status output 강화는 별도 script hardening Phase 후보로 남긴다.
