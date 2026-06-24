# Local environment requirements 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `README.md` | 로컬 실행 섹션에 OS별 기준 문서와 WSL2 권장 경로를 짧게 연결 | README는 외부 요약으로 유지하고 상세 기준은 `docs/04`에 둔다. | Low |
| `docs/04-development-guide.md` | 로컬 개발 환경 요구사항, 지원 등급, 최소 도구, Docker Compose 권장 경로, Windows 주의사항 추가 | Development Operations가 환경 규칙 Source of Truth다. | Medium |
| `docs/05-acceptance-scenarios-and-checklist.md` | local support tier 기록 기준 추가 | 완료 기준에서 미검증 OS 범위를 놓치지 않기 위함 | Low |
| `docs/06-regression-and-failure-scenarios.md` | 로컬 환경 지원 범위 drift regression guard 추가 | Windows native 미보장을 잘못 보장으로 바꾸는 회귀 방지 | Low |
| `docs/07-manual-verification-playbook.md` | Docker readiness에 compose와 OS/shell 구분 추가 | 수동 검증 evidence가 OS 지원 등급과 연결되도록 함 | Low |
| `docs/manual-verification/00-environment-setup.md` | OS/shell readiness 절차 추가 | 환경 검증의 재현성 보강 | Low |
| `docs/manual-verification/07-mvp-demo-script.md` | Windows WSL2 권장 경로와 native Windows 미검증 범위 명시 | 데모 실행 전제 명확화 | Low |
| `docs/08-development-workflow.md` | cross-platform smoke audit/tooling 후속 Phase 후보 추가 | 문서 기준과 실제 검증/tooling을 분리 | Low |

## Integration Notes / 통합 메모

- API, schema, data model, architecture는 변경하지 않았다.
- `docs/02`와 `docs/03`은 로컬 환경 지원 등급 정리에 직접 영향이 없어 수정하지 않았다.

## Conflicts To Resolve / 해결할 충돌

- 현재 worktree에 기존 unrelated 변경이 있어 PR packaging 시 포함/제외 파일을 분리해야 한다.
