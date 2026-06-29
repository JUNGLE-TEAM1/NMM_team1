# Data integration transform output preview 노트

## 진행 메모

- Transform 단계에 `Output schema preview`를 추가했다.
- Select Fields에서 선택된 field만 output schema table에 남도록 했다.
- field를 해제하면 preview row도 즉시 줄어든다.

## 결정

- 이번 Phase는 Transform 기능 추가가 아니라 Select Fields 결과 표현 보강만 다룬다.
- Filter/Join/Aggregate/Cast/Rename 및 backend/API/schema/payload 변경은 제외한다.

## 열린 질문

- 다음 Phase에서 Review & Run API 연결 범위를 어디까지 붙일지 사람 확인이 필요하다.

## 링크 / 증거

- Local URL: `http://127.0.0.1:5173/dataset`
- Checks: `npm run build`, `scripts/validate-harness.sh`
- Browser smoke: API source 선택 -> Transform 이동 -> `sku`, `partner_id` 해제 -> output preview가 4개 row로 축소됨.
