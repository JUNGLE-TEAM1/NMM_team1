# Product Context Coherence Audit 보고서

## Short Report / 짧은 보고

- Type: audit
- Branch/work location: `docs/product-context-ci-guard-audit`, `docs/workflows/docs/product-context-ci-guard-audit`
- Date: 2026-06-24
- Changed: MVP v1/current implementation baseline과 Target MVP 문맥 분리 상태를 감사하고, strict validation에 product context guard를 추가했다.
- Verified: `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR/push/handoff는 `Pre-PR Human Checkpoint` 선택 전까지 보류.
- Next context: PR 진행 여부를 선택하거나, 다음 구현 Phase `feature/trust-state-model`로 이동한다.
- Risk: static guard는 핵심 앵커 누락을 잡지만 문장 의미 전체를 해석하지는 않는다.

## 1. 문맥 검사 결과

| 검사 항목 | 판단 | 근거 |
| --- | --- | --- |
| MVP v1/current baseline 분리 | 통과 | `README.md`, `docs/01~03`, `docs/05~08`에서 baseline과 Target MVP를 분리한다. |
| Target MVP 신뢰 루프 | 통과 | `Trusted Dataset -> Query/Ask -> Evidence -> Recovery`가 외부 요약, 제품, acceptance, workflow에 남아 있다. |
| 과거 report 처리 | 통과 | 과거 M0~M5 report는 historical evidence로 유지하고 Source of Truth처럼 소급 수정하지 않는다. |
| 다음 Phase 연결 | 통과 | `docs/08-development-workflow.md`가 `feature/trust-state-model`을 다음 Target MVP 구현 후보로 둔다. |
| 새 PR handoff 규칙 | 통과 | `Pre-PR Human Checkpoint`, `--approved-pr`, deprecated `--auto-pr` guard가 이미 validation/fixture/CI에 연결되어 있다. |

## 2. CI 포함 상태

| 규칙 | 현재 CI 포함 여부 | 판단 |
| --- | --- | --- |
| `scripts/test-harness.sh` | 포함 | `.github/workflows/ci.yml` harness job에서 실행한다. |
| `scripts/validate-harness.sh` | 포함 | harness job에서 실행한다. |
| `scripts/validate-harness.sh --strict` | 포함 | harness job에서 실행한다. |
| `Pre-PR Human Checkpoint` 문서 wiring | 포함 | strict validation이 workflow docs와 status workflow 문구를 확인한다. |
| `--approved-pr` helper | 포함 | strict validation과 fixture가 확인한다. |
| Product context static guard | 이번 Phase에서 추가 | strict validation이 baseline/Target MVP/trust loop 앵커를 확인한다. |
| 실제 사람 승인 여부 또는 GitHub remote state | 제외 | CI에서 안정적으로 알 수 없고 외부 상태 의존이 크다. |

## 3. 추가한 Guard

`scripts/validate-harness.sh --strict`는 이제 아래를 확인한다.

- `README.md`, `docs/01~03`, `docs/05~08`에 current baseline 분리 앵커가 남아 있는지
- 같은 문서들에 `Target MVP` 문맥이 남아 있는지
- `README.md`, `docs/01`, `docs/05`, `docs/08`에 Target MVP 신뢰 루프가 남아 있는지
- `docs/06`에 current baseline이 제품 목표로 되돌아가는 회귀 guard가 있는지
- `docs/06`에 Trust Gate 없이 Query/Ask가 진행되는 회귀 guard가 있는지
- `docs/08`에 다음 Target MVP 구현 Phase `feature/trust-state-model`이 남아 있는지

`scripts/test-harness.sh`에는 trust loop 문장이 빠지면 strict validation이 실패하는 fixture를 추가했다.

## 4. 검증

```bash
scripts/test-harness.sh
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

결과:

- `scripts/test-harness.sh`: passed, 14 tests
- `scripts/validate-harness.sh`: passed
- `scripts/validate-harness.sh --strict`: passed

## 5. Acceptance / Regression / Manual Verification

Acceptance:

- `docs/05`의 문서와 계약 일관성 항목을 확인했다.
- baseline acceptance와 Target MVP acceptance가 분리되어 있다.

Regression Guard:

- Checked feature: Current Baseline이 제품 목표처럼 남는 경우, Target MVP 범위 경계, Trust Gate 없이 Query/Ask가 진행되는 경우
- Protected behavior: current baseline은 현재 구현/증거 기준이고, Target MVP는 신뢰 루프 구현 방향이다.
- Result: strict validation guard로 핵심 앵커 누락을 자동 감지한다.

Manual Verification:

- Document executed: `docs/07-manual-verification-playbook.md`의 AskLake 문서 Rebaseline 수동 점검 항목
- Environment: local docs/static validation
- Result: 통과
- Failure/limitation: semantic rewrite 전체를 자동 판별하지는 않는다.
- Evidence: `scripts/test-harness.sh`, `scripts/validate-harness.sh --strict`

## 6. 다음 선택

1. `PR 진행`: 승인 후 `scripts/prepare-pr.sh --approved-pr docs/workflows/docs/product-context-ci-guard-audit`
2. `로컬 완료로 보류`: 현재 branch를 local complete 상태로 두고 다음 Phase 때 재개
3. `추가 수정`: checkpoint evidence section 강제 같은 더 강한 guard를 별도 Phase로 검토
4. `다음 Phase`: `feature/trust-state-model` 시작
