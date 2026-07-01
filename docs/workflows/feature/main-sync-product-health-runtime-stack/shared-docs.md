# Main AI Query Product Health Runtime Stack 공유 문서

## Source of Truth 후보

| File | Planned Change | Reason | Status |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | `AIQueryResult.answer_metadata`, route/RAG/LLM safe evidence 계약 보강 | route/RAG/LLM 이식 후 계약 drift 방지 | applied |
| `docs/05-acceptance-scenarios-and-checklist.md` | Product Health AI Query route/RAG/LLM acceptance 추가 | 데모 완료 기준 명확화 | applied |
| `docs/06-regression-and-failure-scenarios.md` | stale catalog 선택, unsafe LLM context, route mismatch guard 추가 | 주요 회귀 방지 | applied |
| `docs/07-manual-verification-playbook.md` | AI Query sql/hybrid/rag/unsupported smoke 절차 추가 | 사람이 화면에서 검증 가능하게 함 | applied |
| `docs/08-development-workflow.md` | C-48 queue 추가 | 후속 Phase 위치 고정 | applied |

## Workspace 산출물

- `plan.md`: Phase 설계와 파일별 적용 전략
- `notes.md`: 분석 노트와 핵심 원칙
- `decisions.md`: 적용 결정과 보류 결정
- `quality.md`: 후속 구현 검증 계획
- `sources.md`: 분석에 사용한 파일/보고서
- `sync.md`: branch/upstream 상태 기록
- `report.md`: 이번 설계 반영 결과
