# Dataset create type choice 노트

## 진행 메모

- 2026-06-29: `데이터셋 생성`을 누른 뒤 Source Dataset과 Target Dataset을 먼저 선택하는 구조로 분리하기로 함.
- 2026-06-29: `데이터셋 생성` CTA와 Source/Target 선택 modal을 구현함.
- 2026-06-29: Source 선택은 placeholder shell로, Target 선택은 기존 wizard로 진입하게 연결함.
- 2026-06-29: 브라우저에서 modal open, Source placeholder 진입, Target wizard 복귀를 확인함.

## 결정

- 이 Phase는 선택 modal과 wizard mode 진입까지만 다룬다.
- Source/Target 세부 wizard는 각각 후속 Phase에서 구현한다.

## 열린 질문

- 없음. 선택지는 데모에서 헷갈리지 않도록 Source는 "외부/원천 데이터 등록", Target은 "가공 결과 데이터셋 생성"으로 설명한다.

## 링크 / 증거

- `docs/08-development-workflow.md`의 D-2 항목
- `npm run build` pass
- `scripts/validate-harness.sh` pass
