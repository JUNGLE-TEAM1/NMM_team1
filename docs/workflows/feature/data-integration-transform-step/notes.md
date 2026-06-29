# Data integration transform step 노트

## 진행 메모

- Source 선택 전 Transform step은 `Source 필요` 상태와 disabled 안내 패널을 보인다.
- Source 선택 후 해당 source schema 컬럼을 checkbox로 표시한다.
- 필드 선택/해제 결과가 Transform 카드의 선택 개수와 대표 컬럼명에 반영된다.

## 결정

- 이번 Phase는 `Select Fields`만 다루며 Filter/Join/Aggregate/Cast와 backend schema 확장은 제외한다.

## 열린 질문

- 다음 Phase에서 Target step을 먼저 열지, 선택 필드를 실제 pipeline payload에 먼저 연결할지 사람 확인이 필요하다.

## 링크 / 증거

- Local URL: `http://127.0.0.1:5173/dataset`
- Checks: `npm run build`, `scripts/validate-harness.sh`
- Browser smoke: Source 선택 전 disabled, API source 선택 후 6개 필드 표시, 2개 해제 후 `4개 선택` 요약 확인.
