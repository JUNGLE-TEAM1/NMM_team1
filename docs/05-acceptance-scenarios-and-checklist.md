# 05. 수용 시나리오와 체크리스트

## 1) 대표 성공 시나리오

1. 사용자가 웹 UI에서 샘플 데이터 소스를 등록한다.
2. 사용자가 source -> transform -> target으로 이어지는 최소 파이프라인을 만든다.
3. 사용자가 파이프라인을 실행한다.
4. 시스템이 실행 상태, 로그 또는 오류를 보여준다.
5. 사용자가 결과 데이터의 schema, row count, sample 또는 저장 위치를 카탈로그에서 확인한다.

## 2) 핵심 성공 경로

- [ ] 프로젝트 목표와 MVP 범위가 `docs/01`에 기록되어 있다.
- [ ] 아키텍처와 외부 연동이 `docs/02`에 기록되어 있다.
- [ ] API/UI/CLI/PR metadata 계약이 `docs/03`에 기록되어 있다.
- [ ] 제품 기능 개발 전에 CI/CD, Docker, Kubernetes, AWS foundation 계획과 approval gate가 기록되어 있다.
- [ ] MVP 핵심 성공 경로가 소스 등록, 파이프라인 작성, 실행, 결과 확인을 포함한다.
- [ ] 실행, 테스트, 브랜치, PR 규칙이 `docs/04`와 `docs/11`에 기록되어 있다.
- [ ] 첫 실제 branch workspace가 `docs/workflows/` 아래에 생성된다.
- [ ] linked GitHub issue가 있으면 `sync.md`와 PR body에 closing keyword가 기록된다.
- [ ] `scripts/validate-harness.sh --strict`가 통과하거나 deferral reason이 기록된다.

## 3) 기능 완료 기준

### 프로젝트 부트스트랩

- [ ] 프로젝트 운영 문서가 AskLake 기준으로 작성되어 있다.
- [ ] XFlow 참고 범위와 MVP 제외 범위가 명확히 구분되어 있다.
- [ ] 인프라 선행 마일스톤과 MVP 마일스톤이 `docs/01`과 `docs/08`에 기록되어 있다.
- [ ] 초기 예시 workspace와 과거 report는 가져오지 않는다.
- [ ] 첫 실제 Phase를 시작할 수 있는 branch workspace 생성 명령이 동작한다.
- [ ] 관련 regression guard가 `docs/06`에 있다.
- [ ] 관련 manual verification이 `docs/07` 또는 `docs/manual-verification/`에 있다.

### 제품 기능

- [ ] happy path가 동작한다: source 등록 -> pipeline 생성 -> run 실행 -> catalog 확인
- [ ] 필요한 상태가 저장되거나 결과물이 생성된다.
- [ ] running, success, failed 상태가 사용자에게 보인다.
- [ ] 실패한 output을 ready로 표시하지 않는다.
- [ ] 관련 interface가 `docs/03`과 일치한다.
- [ ] 관련 regression guard가 `docs/06`에 있다.
- [ ] manual verification이 `docs/07` 또는 `docs/manual-verification/`에 있다.

## 4) 문서와 계약 일관성

- [ ] `docs/02` architecture가 구현과 일치한다.
- [ ] `docs/03` interface contract가 구현과 일치한다.
- [ ] `docs/06` regression/failure 기준이 실제 동작과 일치한다.
- [ ] `docs/07` manual verification이 현재 workflow와 일치한다.
- [ ] `docs/08` Phase 상태가 실제 진행 상태와 일치한다.

## 5) 배포와 운영 기준

- [ ] health/smoke check가 통과한다.
- [ ] 필요한 env 값이 문서화되어 있다.
- [ ] Docker image build/run 경로가 기록되어 있다.
- [ ] Kubernetes manifest 또는 Helm 후보가 secret 없이 검증 가능하다.
- [ ] AWS resource 생성 전 비용/권한/rollback approval gate가 기록되어 있다.
- [ ] migration/data 변경이 검증되어 있다.
- [ ] log가 조치 가능한 실패 원인을 보여준다.
- [ ] rollback 또는 recovery note가 있다.

## 6) 릴리스 / 제출 게이트

- [ ] 핵심 성공 경로를 최소 1회 완료했다.
- [ ] test/build/smoke/manual verification 결과를 기록했다.
- [ ] secret을 commit하지 않았다.
- [ ] 알려진 제한 사항을 문서화했다.
- [ ] 최신 report가 evidence와 acceptance criteria를 연결한다.

## 7) 장기 마일스톤 수용 체크포인트

| 마일스톤 | 수용 체크포인트 |
| --- | --- |
| M6. 소스 확장 | 최소 1개 RDB source 연결 성공/실패가 UI/API에서 명확히 보인다. |
| M7. 변환 확장 | 각 transform이 입력 schema와 출력 schema를 예측 가능하게 바꾼다. |
| M8. 실행 관리 | run history, log, retry 또는 실패 상태가 한 화면에서 추적된다. |
| M9. 카탈로그 고도화 | 사용자가 dataset을 검색/filter하고 상세 metadata를 이해할 수 있다. |
| M10. 품질 검사 | 품질 결과가 catalog dataset과 연결되고 실패 원인이 표시된다. |
| M11. Lineage와 시각 편집 | graph와 저장된 pipeline contract가 서로 일치한다. |
| M12. SQL Lab | local query가 sample/result dataset에 대해 실행되고 결과가 표시된다. |
| M13. AI Assistant | AI 없이도 core flow가 동작하며, AI 결과는 검토 가능한 draft로 표시된다. |
| M14. Streaming/CDC 후보 | 도입/보류 결정이 비용, 운영, 대체 경로와 함께 기록된다. |
| M15. 선택적 분산/클라우드 확장 | 승인 gate, rollback, 비용/운영 risk가 기록된 작은 PoC만 진행된다. |
