# XFlow 참고 MVP 로드맵 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Local-first MVP scope decision.
- XFlow급 볼륨 장기 로드맵 decision.
- Infrastructure-first foundation decision.

## Accepted Decisions / 확정된 결정

| 결정 | 선택안 | 이유 | 확인 주체 / 시점 |
| --- | --- | --- | --- |
| MVP scope | Local-first source -> pipeline -> run -> catalog flow | XFlow 전체 복제보다 데모 가능한 핵심 흐름을 먼저 검증하기 위해 | 사용자 요청 / 2026-06-21 |
| Long-term roadmap | M6~M15 staged roadmap after MVP foundation | XFlow급 볼륨을 구현 가능 단위로 나누되 MVP를 키우지 않기 위해 | 사용자 요청 / 2026-06-22 |
| Infrastructure-first | CI/CD, Docker, Kubernetes, AWS foundation before product feature development | 팀이 배포 가능한 구조를 먼저 깔고 개발을 시작하고 싶다고 명시했기 때문에 | 사용자 요청 / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| 결정 | 보류 이유 | 재검토 시점 | 대상 branch / Phase |
| --- | --- | --- | --- |
| First source type | PostgreSQL vs CSV/local file 결정 필요 | M2/M3에서 구현 난이도와 데모 데이터를 보고 결정 | `feature/container-app-skeleton` 또는 `feature/source-catalog` |
| Metadata store | PostgreSQL vs SQLite vs file 결정 필요 | MVP 저장소 선택은 코드 구조와 실행 명령에 영향 | `feature/container-app-skeleton` |
| Distributed/cloud stack | S3/Spark/Airflow/Trino/OpenSearch/Kubernetes 도입 여부 | 실제 병목과 비용/운영 승인 필요 | M13~M15 |
| AWS deployment target | EKS vs ECS/App Runner/EC2 등 선택 필요 | Kubernetes 요구와 운영 복잡도/비용 균형 필요 | `feature/infrastructure-foundation` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| 결정 | 조건 | 행동 |
| --- | --- | --- |
| MVP scope | cloud/distributed infra가 필수로 들어오면 | Non-MVP로 되돌리고 local golden path를 먼저 완료 |
| Long-term roadmap | M6 이후 항목이 M1~M5 완료 조건을 키우면 | 장기 milestone으로 되돌리고 MVP scope를 복구 |
| AWS foundation | 비용 발생 resource를 approval 없이 만들게 되면 | plan/manifest 단계로 되돌리고 approval checklist를 먼저 완료 |
