# 02. Architecture

## 1) Technology Stack Rationale

| Area | Choice | Reason |
| --- | --- | --- |
| Runtime | TBD | 프로젝트 코드 기준으로 확정한다. |
| UI | TBD | 프로젝트 코드 기준으로 확정한다. |
| Data | TBD | 프로젝트 코드 기준으로 확정한다. |
| Infra | GitHub + repository automation | Issue/PR/Project/Notion sync 흐름을 유지한다. |

## 2) System Composition

```text
TBD client or entrypoint
  -> TBD service/module
  -> TBD data store or external system
```

## 3) Layer Structure

### Project Source

- Responsibility: 실제 제품 기능을 구현한다.
- Main files/modules: TBD
- Boundaries: 하네스 문서와 운영 스크립트는 제품 런타임 코드와 분리한다.

### Collaboration Harness

- Responsibility: 요구사항, Phase, 검증, PR 준비 상태를 기록한다.
- Main files/modules: `AGENTS.md`, `docs/`, `scripts/`, `.github/`
- Boundaries: 제품 요구사항과 구현 결과를 기록하지만 제품 런타임 로직을 대신하지 않는다.

## 4) Data Model

### Product Entity

| Field | Type | Notes |
| --- | --- | --- |
| TBD | TBD | 프로젝트 요구사항 확정 후 작성한다. |

## 5) Core Sequences

### Flow A. Phase-Based Development

```text
1. Human/AI -> Source of Truth: 요구사항과 범위 기록
2. Human/AI -> branch workspace: 계획, sync, quality, decision 기록
3. AI/Human -> product source: 구현
4. Human/AI -> checks: 테스트/검증 실행
5. Human/AI -> PR: linked issue와 closing keyword 확인
```

## 6) External Integrations

| Integration | Purpose | Failure Handling |
| --- | --- | --- |
| GitHub Issues / PRs | 작업 추적과 merge 후 issue close | PR 템플릿과 `sync.md`에서 closing keyword 확인 |
| GitHub Project / Notion sync | 보드 상태 동기화 | `.github/workflows/notion-issue-sync.yml` 결과와 secrets 설정 확인 |

## 7) Operations / Deployment

### Environments

- Local: TBD
- Staging: TBD
- Production: TBD

### Environment Variables / Secrets

| Name | Required | Notes |
| --- | --- | --- |
| `NOTION_TOKEN` | Yes, if Notion sync is active | GitHub Actions secret |
| `NOTION_DATABASE_ID` | Yes, if Notion sync is active | GitHub Actions secret |
| `ISSUE_SYNC_PAT` | Optional | GitHub Project 권한이 기본 token으로 부족할 때 사용 |

### Health Checks

- TBD: 프로젝트 실행 후 확인할 smoke check를 작성한다.

### Migration / Rollback

- Migration command: TBD
- Rollback limitation: TBD
- Data backup note: TBD

### Logging / Monitoring

- Logs: TBD
- Metrics: TBD
- Alerts: TBD
