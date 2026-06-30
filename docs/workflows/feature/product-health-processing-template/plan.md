# Product Health Processing Template Plan

## 목표

- PR 1 범위에서 Target Dataset Processing 화면이 M3 Product Health 추천 변환 규칙을 불러와 검토하고 저장할 수 있게 한다.
- 실행, multi-source mapping, Silver/Gold preview, Catalog/AI Query 연결은 후속 PR로 넘긴다.

## 범위

- `contracts/product_health_transform_spec.sample.json` 기반 추천 template 조회 API 추가
- Target Dataset wizard에 `recommended_template` / `manual` processing mode 추가
- 추천 template 선택 시 `bronze -> silver -> aggregate -> join -> derive -> load` step list와 `quality_rules` 표시
- Target Dataset metadata `process_rule`에 step list와 quality rules 저장

## 제외

- M2 runner 실행 연결
- Source Dataset role mapping
- sample row preview
- Catalog 등록과 AI Query 연결

## 작업 순서

1. M3 Product Health 계약 파일과 현재 Target Dataset 저장 경계 확인
2. Backend template response schema/service/API/test 추가
3. Frontend API client와 wizard UI 확장
4. `docs/03-interface-reference.md` 등 Source of Truth 최소 업데이트
5. backend test와 frontend build 검증
6. PR 생성
