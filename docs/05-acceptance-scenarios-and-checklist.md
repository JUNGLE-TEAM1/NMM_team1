# 05. Acceptance Scenarios & Checklist

## 1) Representative Success Scenario

1. 팀이 `README.md`, `AGENTS.md`, `docs/01~07`을 프로젝트 기준으로 확인한다.
2. 첫 작업을 GitHub Issue 또는 팀 합의 요구사항과 연결한다.
3. `scripts/start-workflow.sh`로 branch workspace를 만든다.
4. 작업 범위, 검증 방식, linked issue, PR closing keyword를 workspace에 기록한다.
5. 구현 후 테스트/수동 검증/하네스 검증을 실행하고 Phase report를 작성한다.

## 2) Golden Path

- [ ] 프로젝트 목표와 MVP 범위가 `docs/01`에 기록되어 있다.
- [ ] 아키텍처와 외부 연동이 `docs/02`에 기록되어 있다.
- [ ] API/UI/CLI/PR metadata 계약이 `docs/03`에 기록되어 있다.
- [ ] 실행, 테스트, 브랜치, PR 규칙이 `docs/04`와 `docs/11`에 기록되어 있다.
- [ ] 첫 실제 branch workspace가 `docs/workflows/` 아래에 생성된다.
- [ ] linked GitHub issue가 있으면 `sync.md`와 PR body에 closing keyword가 기록된다.
- [ ] `scripts/validate-harness.sh --strict`가 통과하거나 deferral reason이 기록된다.

## 3) Feature Completion Criteria

### Project Bootstrap

- [ ] 프로젝트 운영 문서가 NMM_team1 기준으로 작성되어 있다.
- [ ] 초기 예시 workspace와 과거 report는 가져오지 않는다.
- [ ] 첫 실제 Phase를 시작할 수 있는 branch workspace 생성 명령이 동작한다.
- [ ] 관련 regression guard가 `docs/06`에 있다.
- [ ] 관련 manual verification이 `docs/07` 또는 `docs/manual-verification/`에 있다.

### Product Feature

- [ ] Happy path works
- [ ] Required state is persisted or output is produced
- [ ] User-visible feedback exists
- [ ] Failure state is handled
- [ ] Related interfaces match `docs/03`
- [ ] Related regression guard exists in `docs/06`
- [ ] Manual verification exists in `docs/07` or `docs/manual-verification/`

## 4) Document / Contract Consistency

- [ ] `docs/02` architecture matches implementation
- [ ] `docs/03` interface contracts match implementation
- [ ] `docs/06` regression/failure criteria match behavior
- [ ] `docs/07` manual verification matches current workflows
- [ ] `docs/08` Phase status matches actual progress

## 5) Deployment / Operations Criteria

- [ ] Health/smoke checks pass
- [ ] Required env values are documented
- [ ] Migration/data changes verified
- [ ] Logs expose actionable failures
- [ ] Rollback or recovery note exists

## 6) Release / Submission Gate

- [ ] Golden Path completed at least once
- [ ] Tests/build/smoke/manual verification recorded
- [ ] No secrets committed
- [ ] Known limitations documented
- [ ] Latest report links evidence to acceptance criteria
