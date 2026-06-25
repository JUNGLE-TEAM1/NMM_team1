# AskLake 2주차 Lite 병렬 Manifest 프롬프트 보고서

## Short Report / 짧은 보고

- Type: Docs / Project Context
- Date: 2026-06-25
- Changed: M1~M6 병렬 개발을 위한 Lite manifest 생성 프롬프트를 `docs/project-context/asklake-week2-module-plan/lite-parallel-manifest-prompt.md`로 추가하고 project context README에 연결했다.
- Verified: `scripts/validate-harness.sh --strict`
- Remaining: 실제 `.milestones/week2-demo/manifest.yaml`, `status.yaml`, `decisions.md`, handoff templates 생성은 이 프롬프트를 사용한 후속 작업에서 진행한다.
- Next context: 다음 작업자는 `lite-parallel-manifest-prompt.md`를 입력으로 Week 2 Lite manifest를 생성한다.
- Risk: 이 문서는 실행 프롬프트이며 Lite manifest 자체가 아니다. 실제 병렬 worktree/thread/branch 생성은 사람 확인 후 진행한다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: 사용자 제공 Lite manifest 프롬프트, `docs/project-context/asklake-week2-module-plan/README.md`
- Escalated context read: not needed
- Context omitted intentionally: actual `.milestones/week2-demo/` implementation, runtime source, full Source of Truth audit
