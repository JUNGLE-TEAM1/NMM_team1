# Data integration target step 노트

## 진행 메모

- wizard 3단계 Target 설정에 `target_name` 입력을 추가했다.
- 기본값은 `dataset_product_health_gold`이며, 빈 값이면 다음 단계가 비활성화된다.
- Review 단계 Target summary에 입력한 target name이 표시된다.

## 결정

- 이번 Phase는 결과 dataset 이름만 다루며 저장소/S3 path/Parquet/target schema editor는 제외한다.

## 열린 질문

- 다음 Phase에서 실제 Review & Run API 연결을 어느 수준까지 붙일지 사람 확인이 필요하다.

## 링크 / 증거

- Local URL: `http://127.0.0.1:5173/dataset`
- Checks: `npm run build`, `scripts/validate-harness.sh`
- Browser smoke: target name empty disables next, filled target name enables next and appears in Review.
