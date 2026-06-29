# Target dataset create wizard reframe 노트

## 진행 메모

- 2026-06-29: 현재 구현된 generic flow는 Target Dataset 생성 wizard의 재료로 재사용하기로 함.
- Target Dataset은 output dataset과 ETL job definition을 함께 준비하는 시나리오로 설명한다.
- 2026-06-29: Target Dataset wizard를 `Overview` -> `Source 선택` -> `Process` 3단계로 재구성함.
- 2026-06-29: Overview에 target dataset name과 purpose 입력을 배치함.
- 2026-06-29: Source 선택 단계는 기존 source picker와 schema preview를 재사용함.
- 2026-06-29: Process 단계는 기존 Select Fields와 output schema preview를 재사용하고 Scheduling/Review는 후속 Phase로 남김.
- 2026-06-29: 브라우저에서 Overview, Source 선택, Process, Source Dataset wizard 복귀를 확인함.

## 결정

- 이 Phase는 `Overview` -> `Source 선택` -> `Process`까지만 구현한다.
- Scheduling과 Review는 다음 Phase로 분리한다.

## 열린 질문

- Process label은 Target Dataset 생성 흐름에서 Transform보다 덜 혼동되는 것으로 보고 유지한다.

## 링크 / 증거

- `docs/08-development-workflow.md`의 D-4 항목
- `npm run build` pass
- `scripts/validate-harness.sh` pass
