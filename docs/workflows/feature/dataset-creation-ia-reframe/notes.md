# Dataset creation IA reframe 노트

## 진행 메모

- 2026-06-29: R-1 범위로 `/dataset` 생성 entry를 3분기 구조로 보정함.
- External Connection 선택은 상세 wizard를 열지 않고 다음 Phase 안내 toast만 표시한다.
- Source/Target 기존 wizard 진입은 유지했다.

## 결정

- 데이터셋 생성의 최상위 선택지는 External Connection, Source Dataset, Target Dataset으로 둔다.
- Source Dataset은 "등록된 External Connection에서 raw/source dataset 생성"으로 설명한다.
- Target Dataset은 "Source Dataset 기반 target dataset + ETL job definition 준비"로 설명한다.

## 열린 질문

- Source Dataset 상세 wizard 내부의 기존 source type/card 선택 UI는 R-3에서 connection 선택 기반으로 교체해야 한다.

## 링크 / 증거

- `npm run build` in `frontend/`: pass
- `scripts/validate-harness.sh`: pass
- Browser smoke: `http://127.0.0.1:13000/dataset`
