# 01. Product Planning

## 1) Project One-Liner

NMM_team1은 크래프톤 정글 SW-AI LAB 12기 나만의 무기 만들기 302호 1팀 프로젝트다.

## 2) Problem Definition

### MVP/Core Problem

- TBD: 팀이 해결하려는 사용자 문제를 구체화한다.
- TBD: MVP에서 반드시 증명해야 하는 핵심 가설을 기록한다.

### Expansion Problems

- TBD: MVP 이후로 미룰 확장 문제를 기록한다.

## 3) Target Users

- TBD: 주요 사용자와 이해관계자를 기록한다.

## 4) Goals

- 프로젝트 요구사항, 범위, 검증 기준을 Source of Truth 문서에 남긴다.
- 기능 구현은 Phase 단위 branch workspace로 진행한다.
- 각 Phase는 수용 기준, 회귀 기준, 수동 검증, 보고서를 남긴다.

## 5) MVP Scope

### Core Features

- TBD: 첫 MVP에 포함할 기능을 기록한다.

### Required Integrations

- GitHub Issue / PR / Project / Notion sync 흐름은 `.github/` 자동화로 관리한다.
- TBD: 제품 기능에 필요한 외부 연동을 기록한다.

### Optional Extensions

- TBD: MVP 이후 후보를 기록한다.

## 6) Non-MVP Scope

- TBD: 이번 MVP에서 하지 않을 일을 명시한다.

## 7) Key User Flows

### Flow A. Project Bootstrap

1. 팀이 `README.md`, `AGENTS.md`, `docs/01~07`의 빈칸을 프로젝트 기준으로 채운다.
2. 첫 실제 작업을 `scripts/start-workflow.sh`로 branch workspace에 기록한다.
3. PR 전 `scripts/status-workflow.sh`와 `scripts/validate-harness.sh --strict`로 상태를 확인한다.

### Flow B. Run A Feature Phase

1. 요구사항 변경 또는 기능 요청을 확인한다.
2. 관련 Source of Truth 문서를 갱신한다.
3. branch workspace의 `plan.md`, `quality.md`, `sync.md`를 작성한다.
4. 구현과 검증을 진행한다.
5. `docs/reports/`에 Phase 보고서를 남긴다.

## 8) Success Criteria

- 첫 실제 기능 Phase가 branch workspace와 연결된다.
- 프로젝트별 실행, 테스트, 검증 명령이 `docs/04`와 workspace `quality.md`에 기록된다.
- PR에 linked GitHub issue가 있으면 `Closes #<issue-number>` 또는 동등한 closing keyword가 기록된다.

## 9) Decisions / Open Questions

- Confirmed:
  - 이 저장소는 NMM_team1 프로젝트 운영용 하네스를 포함한다.
  - 초기 예시 workspace와 과거 Phase report는 가져오지 않는다.
- Open:
  - MVP 기능 범위는 아직 확정되지 않았다.
  - 실제 실행/test/build 명령은 프로젝트 코드 기준으로 확정해야 한다.
