# XFlow 참고 MVP 로드맵 계획

## 브랜치

- Branch: `feature/mvp-roadmap`
- Workspace: `docs/workflows/feature/mvp-roadmap`
- Created: 2026-06-21

## 목표

- XFlow를 read-only reference로 참고해 AskLake의 infrastructure-first 데이터 파이프라인 MVP와 마일스톤을 확정한다.
- MVP를 작게 유지하면서 XFlow급 프로젝트 볼륨까지 확장 가능한 장기 구현 마일스톤을 정리한다.
- 제품 기능 개발 전에 CI/CD, Docker, Kubernetes, AWS foundation을 먼저 세팅하는 방향으로 로드맵을 조정한다.

## 범위

- `README.md`, `AGENTS.md`, `docs/01~08`에 MVP 범위, 아키텍처 후보, 인터페이스 후보, 수용 기준, 회귀 기준, 수동 검증, Phase 큐를 반영한다.
- XFlow의 사용자 흐름을 소스 등록, 최소 파이프라인 작성, 실행, 결과 카탈로그 확인으로 축소한다.
- 다음 구현 Phase 후보를 M1~M4로 정리한다.
- M6~M15 장기 마일스톤을 source 확장, transform 확장, job run 관리, catalog, quality, lineage, SQL Lab, AI assistant, CDC, distributed/cloud 후보로 나눈다.
- 각 장기 마일스톤에 포함 범위, 제외 범위, 선행 조건, 검증 방법, 완료 기준, 주요 리스크를 기록한다.
- M1을 `feature/infrastructure-foundation`으로 두고 CI/CD, Docker, Kubernetes, AWS approval gate를 제품 기능보다 먼저 진행한다.

## 범위 제외

- XFlow 코드를 AskLake로 복사하지 않는다.
- 제품 코드를 구현하지 않는다.
- Airflow, Spark, Kafka, OpenSearch, Trino, Bedrock 등 데이터 플랫폼 확장 기능을 MVP 필수 범위로 만들지 않는다.
- AWS resource는 approval gate 없이 생성하지 않는다.
- M6 이후 장기 로드맵을 이유로 M1~M5 MVP/infrastructure 완료 기준을 키우지 않는다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `/Users/tail1/Documents/데이터 파이프라인/xflow/README.md`
- `/Users/tail1/Documents/데이터 파이프라인/xflow/backend/main.py`
- `/Users/tail1/Documents/데이터 파이프라인/xflow/frontend/src/App.jsx`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

XFlow를 read-only reference로 참고해 AskLake MVP와 마일스톤을 정리한다.
XFlow 코드는 복사하지 않는다.
MVP는 infrastructure-first foundation 위에서 작게 유지한다.
XFlow급 볼륨은 M6 이후 장기 마일스톤으로 분리한다.
CI/CD, Docker, Kubernetes, AWS foundation은 제품 기능 개발 전에 먼저 정리한다.
실제 AWS 비용이 발생하는 resource는 사람 승인 없이 만들지 않는다.
공유 Source of Truth 문서와 workspace evidence를 함께 업데이트한다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

MVP 범위, 마일스톤, 수용 기준, 회귀 기준, 수동 검증이 서로 일관되는지 확인한다.
MVP와 장기 로드맵이 섞이지 않았는지 확인한다.
`scripts/validate-harness.sh`와 `scripts/validate-harness.sh --strict`를 실행하고 `quality.md`와 report에 증거를 기록한다.
```

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
