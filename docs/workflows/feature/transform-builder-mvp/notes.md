# Transform Builder MVP 노트

## 진행 메모

- PR #303 Multi-source Target Dataset을 먼저 squash merge했다.
- `feature/transform-builder-mvp` branch와 GitHub issue #304를 생성했다.
- 기존 Process UI는 M3 step list를 그대로 보여주는 구조였고, backend `process_rule`은 자유 dict라 frontend metadata 확장만으로 PR 3 범위를 처리할 수 있었다.
- recommended template 저장 시 `steps[]`에 cast/null policy edit를 반영하고, 별도 `builder_config`에 column mapping과 review/locked 상태를 남기도록 했다.
- 데모 UX 조정: Target Dataset wizard의 `Process`를 `Pipeline Plan`으로 정리하고, 추천 템플릿 기본 화면은 Raw sources -> internal transform -> Gold Target 자동 설정 완료 요약으로 두었다. column/cast/null 편집기는 `고급 설정 보기`에 접었다.
- 데모 단순화 결정: Bronze/Silver는 사용자-facing Target Dataset으로 따로 만들지 않고 Gold Target Dataset을 만들기 위한 내부 처리 단계로 표현한다.

## 결정

- PR 3에서는 실행/preview API를 만들지 않고, UI 설정과 저장 metadata까지만 닫는다.
- aggregate metric과 join key는 사용자가 확인하는 read-only 영역으로 두고, `risk_score`와 Gold schema는 locked로 둔다.
- XFLOW처럼 Pipeline Plan 화면을 단순화하되, multi-source 특성상 좌측은 단일 source table이 아니라 `reviews`, `behavior`, `delivery`, `product_master` role mapping으로 표현한다.

## 열린 질문

- 실제 합성 raw source가 준비되면 role별 column mapping 기본값과 validation 강도를 조정할 수 있다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/304
- Report: `docs/reports/transform-builder-mvp.md`
