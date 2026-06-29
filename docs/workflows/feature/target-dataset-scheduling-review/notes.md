# Target dataset scheduling review 노트

## 진행 메모

- 2026-06-29: Target Dataset wizard 후반부는 Scheduling과 Review로 분리함.
- 최종 CTA는 실제 실행이 아니라 draft/create preparation처럼 demo-safe하게 표현한다.
- 2026-06-29: Target Dataset wizard를 `Overview` -> `Source 선택` -> `Process` -> `Scheduling` -> `Review` 5단계로 완성함.
- 2026-06-29: Scheduling 기본값은 Manual이며, Schedule placeholder는 저장 없이 자리만 제공함.
- 2026-06-29: Review는 target dataset, source, process/output schema, schedule summary를 요약함.
- 2026-06-29: 최종 CTA는 `Target dataset draft 준비` 비활성 버튼으로 두어 실제 실행/API 호출을 암시하지 않게 함.
- 2026-06-29: 브라우저에서 5단계 진행과 Source Dataset wizard 복귀를 확인함.
- Hotfix 2026-06-29: `/dataset` 첫 진입을 Target wizard가 아닌 neutral 선택 전 화면으로 보정함.
- Hotfix 2026-06-29: Target 선택 card의 `현재 prototype wizard로 이동` 문구를 5단계 흐름 설명으로 교체함.
- Hotfix 2026-06-29: Scheduling Manual 설명이 실제 실행을 암시하지 않도록 draft 수동 실행 대상 표현으로 보정함.

## 결정

- Scheduling 기본값은 Manual/수동 실행으로 둔다.
- run history, polling, 실제 create/run API는 포함하지 않는다.

## 열린 질문

- 실제 저장 API를 붙일지는 데모 이후 별도 Phase에서 결정한다.

## 링크 / 증거

- `docs/08-development-workflow.md`의 D-5 항목
- `npm run build` pass
- `scripts/validate-harness.sh` pass
- Hotfix browser verification: 초기 neutral state, 선택 modal copy, Target Scheduling copy, Source wizard 유지 확인
