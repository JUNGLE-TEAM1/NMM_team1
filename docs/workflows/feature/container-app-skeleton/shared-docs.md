# Container app skeleton 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | Health API contract를 `/health`, `/api/health`로 구체화 | M2 backend/frontend/container smoke가 같은 contract를 봐야 한다. | 낮음 |
| `docs/04-development-guide.md` | Docker Compose와 개별 backend/frontend 실행 명령 추가 | 팀원이 M2 앱 skeleton을 바로 실행할 수 있어야 한다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | Container App Health 회귀 보호 추가 | M2 health/container smoke가 이후 Phase에서 깨지지 않아야 한다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | Container App Skeleton 수동 점검 절차 추가 | 자동 smoke 외에 사람이 실행/응답을 확인하는 경로가 필요하다. | 낮음 |
| `README.md` | M2 앱 골격 위치와 local 실행 URL 추가 | 프로젝트 진입점에서 현재 실행 방법을 볼 수 있어야 한다. | 낮음 |
| `.github/workflows/ci.yml` | container smoke job에 backend test와 compose smoke 추가 | PR에서 M2 build/run 기준을 재현한다. | 중간: CI 시간이 늘고 Docker Hub/network 상태에 영향받을 수 있음 |

## Integration Notes / 통합 메모

- M2는 shared Source of Truth에 health contract와 실행 명령을 처음 연결한다.
- M3에서는 첫 source type과 metadata store 선택이 별도 결정으로 필요하다.

## Conflicts To Resolve / 해결할 충돌

- 없음
