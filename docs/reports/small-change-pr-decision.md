# Small Change PR Decision 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-24
- Changed: 작은 변경의 PR 판단 기준, 포함/제외 파일 분리, `.DS_Store`와 unrelated untracked file 제외 규칙을 하네스 문서에 추가했다.
- Verified: `rg` terminology check, `scripts/validate-harness.sh --strict`, `scripts/test-harness.sh`, `git diff --check`
- Remaining: PR/push/handoff는 요청되지 않아 실행하지 않았다.
- Next context: 작은 변경이 완료되면 팀 공유 산출물인지 판단하고, PR 전 포함 파일과 제외 파일을 분리한다.
- Risk: 문서 규칙 보강만 수행했으며 제품 기능이나 runtime code는 변경하지 않았다.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/09-collaboration-agreement.md`
- `docs/10-next-action-menu.md`
- `docs/13-human-command-flow.md`

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: workflow, collaboration agreement, next action menu, human command flow의 PR/완료 관련 섹션
- Escalated context read: not needed
- Context omitted intentionally: 제품 planning, architecture, interface, runtime code. 이번 변경은 하네스 운영 규칙 보강에 한정된다.

## Verification Commands / 검증 명령

```bash
rg -n "Small Change PR|Small Change Completion Decision|\\.DS_Store|untracked|로컬 완료로 보류|팀 공유 산출물" docs/08-development-workflow.md docs/09-collaboration-agreement.md docs/10-next-action-menu.md docs/13-human-command-flow.md
scripts/validate-harness.sh --strict
scripts/test-harness.sh
```

## Document Updates / 문서 업데이트

- Updated: `docs/09-collaboration-agreement.md`에 `Small Change PR Agreement`를 추가했다.
- Updated: `docs/10-next-action-menu.md`에 `Small Change Completion Decision` 메뉴를 추가했다.
- Updated: `docs/13-human-command-flow.md`에 작은 변경 PR 판단 명령 예시와 AI 책임을 추가했다.
- Updated: `docs/08-development-workflow.md`에 작은 변경 완료와 PR 전 파일 분리 규칙을 연결했다.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: `scripts/start-workflow.sh`의 dirty checkpoint가 untracked 파일을 포함할 수 있으므로, 후속 script hardening이 필요할 수 있다.
