# Pull Request

## 1. PR 요약

<!-- 이 PR이 무엇을 바꾸는지 2~4문장으로 적어주세요. -->

- 요약:
- 연결된 Issue: <!-- 예: Closes #123 / 관련 없음 -->
- Phase 또는 Hotfix: <!-- 예: Phase 3 / Hotfix / 문서-only small change -->
- Branch:
- Branch workspace: <!-- 예: docs/workflows/feature/source-catalog -->

## 2. 변경 내용

<!-- 리뷰어가 diff를 읽기 전에 전체 그림을 이해할 수 있게 작성합니다. -->

- [ ] 기능 또는 동작 변경
- [ ] 문서 변경
- [ ] 테스트 또는 검증 보강
- [ ] 하네스/운영 템플릿 변경
- [ ] 기타:

주요 변경:

-

변경하지 않은 것:

-

## 3. Source of Truth / 공유 문서

<!-- 하네스 규칙, 제품 범위, interface/schema, acceptance 등이 바뀌었는지 확인합니다. -->

- 관련 Source of Truth docs:
  -
- [ ] 공유 Source of Truth 문서가 변경되었다.
- [ ] 공유 Source of Truth 문서는 변경되지 않았다.
- [ ] 변경이 있었다면 workspace `shared-docs.md`에 기록했다.
- [ ] 고영향 결정이 있었다면 workspace `decisions.md`에 `accepted` 또는 `deferred` 상태로 기록했다.
- [ ] README는 외부 요약 범위로만 유지했다.

메모:

-

## 4. Interface / Schema 영향

<!-- API, schema, CLI, event, UI contract, env var, data model 변경 여부를 적습니다. -->

- [ ] interface/schema 변경 없음
- [ ] interface/schema 변경 있음
- [ ] 변경이 있다면 `docs/02-architecture.md` 또는 `docs/03-interface-reference.md`를 업데이트했다.
- [ ] migration 또는 data 변경이 있다면 검증 방법과 rollback note를 기록했다.

상세:

-

## 5. 품질 게이트

<!-- 실행한 명령은 그대로 적고, 실행하지 못했다면 이유를 적습니다. -->

- Quality gate status: <!-- pass / partial / skipped -->
- TDD 상태:
- 실행한 검증 명령:
  -
- 실행하지 못한 검증과 이유:
  -

체크리스트:

- [ ] `quality.md`에 TDD 상태 또는 skip reason을 기록했다.
- [ ] test/build/smoke/manual verification 중 현재 변경에 맞는 검증을 수행했다.
- [ ] `scripts/validate-harness.sh` 통과 또는 skip reason 기록
- [ ] `scripts/validate-harness.sh --strict` 통과 또는 skip reason 기록
- [ ] integration branch라면 `scripts/validate-harness.sh --integration` 통과 또는 deferral reason 기록

## 6. Acceptance / Regression / Manual Verification

<!-- 관련 기준을 확인하고, 결과를 짧게 남깁니다. -->

- 확인한 acceptance criteria:
  -
- 확인한 regression/failure scenario:
  -
- manual verification 결과:
  -

체크리스트:

- [ ] 관련 `docs/05` acceptance criteria를 확인했다.
- [ ] 관련 `docs/06` Regression Guard / Failure Scenario를 확인했다.
- [ ] 관련 `docs/07` Manual Verification 항목을 확인했다.
- [ ] 결과를 workspace `quality.md`, `report.md`, 또는 PR 본문에 기록했다.

## 7. Git Sync / PR 상태

<!-- branch, issue, PR, main sync 상태가 서로 모순되지 않게 기록합니다. -->

- Start Sync:
- Mid-Phase Sync:
- Pre-Merge 또는 Pre-PR Sync:
- PR readiness from `scripts/status-workflow.sh`:

체크리스트:

- [ ] `sync.md`에 Start Sync를 기록했다.
- [ ] `sync.md`에 Pre-Merge Sync 결과 또는 deferral reason을 기록했다.
- [ ] linked issue가 있다면 `sync.md`에 issue 링크를 기록했다.
- [ ] linked issue가 있다면 PR body에 `Closes #123` 같은 closing keyword를 포함했다.
- [ ] PR 생성 후 `sync.md`에 PR link와 pushed branch를 기록했다.
- [ ] merge/finalize/cleanup은 사람 확인 전 실행하지 않는다.

## 8. Security / Secret / License

<!-- credential, token, private key, license 문구 변경은 특히 주의합니다. -->

- [ ] API key, token, private key, 실제 credential을 포함하지 않았다.
- [ ] `.env`, local config, 개인 파일을 포함하지 않았다.
- [ ] 라이선스 조항을 추가하거나 수정하지 않았다.
- [ ] 로그 또는 스크린샷에 민감 정보가 없다.

메모:

-

## 9. 리뷰어에게 부탁할 부분

<!-- 특히 봐야 할 파일, 결정, 위험, 의도적으로 남긴 trade-off를 적습니다. -->

- 집중 리뷰 영역:
  -
- 남은 위험:
  -
- 후속 작업 후보:
  -

## 10. Merge 전 Human Checkpoint

<!-- PR 생성 이후 merge/finalize/cleanup은 사람 선택이 필요합니다. -->

- [ ] PR만 생성하고 merge는 보류한다.
- [ ] 리뷰 후 merge 진행 가능하다.
- [ ] merge 전에 추가 확인이 필요하다:

추가 확인 사항:

-
