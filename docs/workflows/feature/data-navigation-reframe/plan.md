# Data navigation reframe 계획

## 목표

좌측 메뉴를 `연결`, `데이터셋`, `작업`, `실행 기록`으로 재정리하고, 하위 메뉴가 필요한 `데이터셋`과 `작업`만 펼침 구조로 만든다.

## 범위

- `/connections`
- `/datasets/source`
- `/datasets/silver`
- `/datasets/gold`
- `/jobs/silver-transform`
- `/jobs/gold-build`
- `/runs`
- 기존 `/dataset` 호환
- 기존 API 기반 목록/파생 표시

## 제외

- 새 backend API
- Airflow trigger
- Job Run 생성
- Silver/Gold materialization
- 편집/삭제/실행 버튼
