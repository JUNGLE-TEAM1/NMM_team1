# Local Tool Runtime Readiness 노트

## 진행 메모

- `main` clean 상태에서 `scripts/start-workflow.sh docs local-tool-runtime-readiness "Local Tool Runtime Readiness"`로 workspace를 생성했다.
- 변경 시작 계층은 Development Operations로 판단했다.
- Docker Desktop 사건의 재발 방지를 위해 safe start와 host-level install 확인 경계를 문서화했다.

## 결정

- 하네스 규칙은 문서로만 보강하고, 이번 Phase에서 script/CI는 변경하지 않는다.
- 설치되어 있는 local-only runtime의 safe start는 agent가 먼저 시도한다.
- host-level install, 권한 상승, 라이선스, 비용/외부 resource 생성은 사람 확인 대상이다.

## 열린 질문

- 특정 tool별 자동 설치 스크립트를 만들지는 않았다. 필요하면 별도 Phase에서 결정한다.
- BuildKit fallback을 smoke script에 내장할지는 보류했다.

## 링크 / 증거

- `docs/04-development-guide.md`
- `docs/12-quality-gates.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/13-human-command-flow.md`
- `docs/reports/local-tool-runtime-readiness.md`
