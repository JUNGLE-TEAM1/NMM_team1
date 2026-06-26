# M1 live UI Phase plan 작업 계획

## 목표

Week2 ver2 기준에서 M1 UI/API Gateway의 live integration 후속 작업을 5개 작은 Phase로 문서화한다.

## 포함 범위

- `m1-live-ui-phase-plan.md` 신규 작성
- ver2 README 읽는 순서에 새 문서 추가
- M1이 소유하지 않는 schema inference, SparkRunner, runner selection, Catalog 저장소, M6 retrieval/scoring/SQL 로직을 제외 범위로 명시

## 제외 범위

- frontend/runtime code 변경
- M5 PR #132 변경
- M6 PR #145 내부 구현 변경
- Source of Truth 계약/schema 변경

## 완료 기준

- 5개 M1 Phase가 문서에 모두 있다.
- 각 Phase에 목표, 포함/제외 범위, 의존 API, 변경 예상 파일, 완료 기준, 검증 계획, 위험, 다음 Phase handoff가 있다.
- strict harness validation과 diff check를 통과한다.
