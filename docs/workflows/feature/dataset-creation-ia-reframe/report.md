# Dataset creation IA reframe 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/dataset-creation-ia-reframe`, `docs/workflows/feature/dataset-creation-ia-reframe`
- Date: 2026-06-29
- Workspace state: archived
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/workflows/feature/dataset-creation-ia-reframe/plan.md`, 관련 `docs/08-development-workflow.md` 섹션
- Escalated context read: browser skill instruction for local UI smoke
- Context omitted intentionally: 전체 Source of Truth audit는 하지 않음. R-1은 UI entry reframe에 한정.
- Changed: `/dataset` 생성 모달을 External Connection / Source Dataset / Target Dataset 3개 선택지로 재정의하고 entry copy를 새 IA에 맞춤. External Connection 선택은 다음 Phase 안내 toast만 표시.
- Verified: `npm run build` in `frontend/` 통과; `scripts/validate-harness.sh` 통과; 브라우저에서 3개 선택지, External Connection 안내, Source/Target 기존 진입 smoke 확인.
- Remaining: External Connection 상세 wizard는 R-2, Source Dataset connection 기반 보정은 R-3, Target Dataset ETL job wording 정렬은 R-4.
- Next context: `feature/external-connection-create-wizard`
- Risk: Source Dataset 상세 wizard 내부에는 아직 D-3의 오래된 source type/card 선택 문구가 남아 있으며 R-3에서 제거해야 한다.
