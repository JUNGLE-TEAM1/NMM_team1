# Project Context

## 문서 목적

`docs/project-context/`는 아직 Source of Truth에 바로 반영하지 않은 프로젝트별 참고 맥락을 보관하는 곳이다.

여기에는 회의 결정, 옵션 분석, 프로젝트별 실행 참고 자료, Source of Truth로 승격되기 전의 결정 로그를 둘 수 있다.

이 디렉터리는 정식 branch workspace가 아니며, `docs/workflows/`의 Phase workspace 검증 규칙을 적용하지 않는다. 따라서 project context 문서만으로 `report.md`, `quality.md`, `sync.md` 같은 branch workspace 산출물을 요구하지 않는다.

## 사용 원칙

- `docs/project-context/`의 문서는 참고 맥락이다. 구현 계약, API, schema, 검증 기준, 운영 규칙의 최종 기준은 `docs/00-layer-map.md`의 Source of Truth 계층을 따른다.
- 구현 또는 계약에 영향을 주는 내용이 확정되면 Change Propagation Rule에 따라 적절한 Source of Truth 문서로 전파한다.
- 작업자가 새 작업을 시작할 때 요청, branch 이름, branch workspace, PR 주제, workspace 설명과 관련 있는 project context 묶음이 있으면 해당 묶음의 `README.md`를 먼저 확인한다.
- 같은 묶음 안에 `decisions.md` 같은 canonical 결정 로그가 있으면 그 문서를 우선한다.
- 회의용 문서는 공유와 설명을 위한 자료이며 canonical 데이터 소스가 아니다.
- project context와 Source of Truth가 충돌하면 Source of Truth를 우선하고, 필요한 경우 변경 전파 여부를 사람에게 제안한다.
- PR 또는 report를 작성할 때 참고한 project context 문서가 있으면 관련 문서 링크에 포함한다.
- 문서 추가/수정 자체도 팀 공유 산출물이면 PR 후보가 될 수 있다. 다만 push, PR 생성, merge는 기존 Git Sync Policy와 Human Checkpoint 규칙을 따른다.

## 현재 등록된 프로젝트 맥락

| 경로 | 설명 | 우선 확인 문서 |
| --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/` | AskLake 2주차 모듈 분업, 결정 옵션, 확정 결정 로그, 공통 계약/병렬 실행 프롬프트, 회의 공유 문서 | `README.md`, `decisions.md`, `contract-setup-prompt.md`, `query-result-contract-prompt.md`, `query-result-contract-execution-prompt.md`, `lite-parallel-manifest-prompt.md` |
