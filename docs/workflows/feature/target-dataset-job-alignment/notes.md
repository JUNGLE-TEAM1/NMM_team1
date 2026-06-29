# Target dataset job alignment 노트

## 진행 메모

- 2026-06-29: Target Dataset wizard 5단계 구조는 유지하고 copy/review summary를 ETL job definition 중심으로 정렬함.
- Process는 `ETL processing rule`, Scheduling은 `ETL job schedule`, Review는 target dataset draft와 job definition을 분리해 표시한다.
- 2026-06-29 Hotfix: 전체 검수에서 발견된 dataset type modal 단계 문구와 Target Source 선택 modal copy 불일치를 보정함.

## 결정

- Target Dataset 생성은 Source Dataset을 입력으로 target dataset과 ETL job definition을 함께 준비하는 demo draft 흐름으로 표현한다.
- 실제 ETL 실행, run history, polling, cron persistence, backend job API는 제외한다.

## 열린 질문

- 후속 backend/interface Phase에서 draft 저장 모델과 job definition persistence를 어떻게 나눌지 결정해야 한다.

## 링크 / 증거

- `npm run build` in `frontend/`: pass
- `scripts/validate-harness.sh`: pass
- Browser smoke: `http://127.0.0.1:13000/dataset`
- Hotfix verification: dataset type modal 3개 card copy, Source Dataset 단계명, Target Source 선택 modal title/body 확인
