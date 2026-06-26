# Guardrail Scenario Audit 노트

## 진행 메모

- 이번 Phase는 `guardrail-protocol-split` 이후 후속 점검이다.
- 핵심 판단: CI 기본 단위는 이미 존재하지만, 운영 lifecycle drift는 매 PR hard gate보다 읽기 전용 scenario audit에 더 적합하다.
- PR size/risk warning은 현재 advisory로 유지한다. hard gate 승격은 별도 팀 결정이 필요하다.
- 실제 repository setting 확인이나 변경은 이번 Phase 범위가 아니다.

## 관찰

- `.github/workflows/ci.yml`은 harness job에서 linked issue/risk warning focused test와 strict validation을 실행한다.
- `.github/workflows/pr-linked-issue-check.yml`과 `.github/workflows/pr-risk-warning.yml`은 PR 이벤트에서 동작한다.
- `docs/system-guardrails.md`의 `requires-admin`, `partial`, `planned` 상태는 실제 system enforcement가 아직 완전하지 않음을 드러내는 장치다.
