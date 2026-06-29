# Data integration wizard flow 노트

## 진행 메모

- 사용자 아이디어: AWS 설정 wizard처럼 `1단계`, `2단계`를 표시하고 본문은 현재 단계 하나만 보여준다.
- `뒤로가기`와 `다음` 중심의 navigation을 두며, 임의 단계 점프는 이번 Phase에서 제외한다.
- 사용자 피드백에 따라 반쯤 감싼 UI를 정리하고, start panel/중복 카드/중복 preview를 걷어낸 뒤 좌측 단계 목록 + 우측 설정 panel 구조로 개선했다.
- Source 선택 직후 Transform이 미리 `완료`로 보이던 상태 표시 문제를 수정했다.
- 사용자 피드백: 좌측 세로 stepper가 좁아 보여서 상단 가로 stepper로 변경했다. 설정 panel은 전체 폭을 사용한다.
- Schema preview가 컬럼 chip만으로 제한적으로 보여 demo source fixture에 `field/type/sample` metadata를 추가하고 compact schema table로 보강했다.
- Source 선택 알림을 layout을 밀어내는 inline notice에서 floating toast로 변경했다. 약 2.4초 후 fade-out 상태로 전환되고 제거된다.

## 결정

- `feature/data-integration-wizard-flow`를 B-3.5 보완 Phase로 둔다.
- Source type picker와 Transform Select Fields는 유지하고 wizard shell로 감싼다.
- Target/Review는 이번 Phase에서 placeholder만 유지한다.

## 열린 질문

- Target/Run placeholder 표현이 데모에 충분히 자연스러운지 사람 확인이 필요하다.

## 링크 / 증거

- Workflow queue: `docs/08-development-workflow.md`
- Phase plan: `docs/workflows/feature/data-integration-wizard-flow/plan.md`
- Local URL: `http://127.0.0.1:5173/dataset`
- Checks: `npm run build`, `scripts/validate-harness.sh`
- Browser smoke: Source 선택 -> Transform 이동 -> Target/Review placeholder -> 뒤로가기 확인.
- Browser smoke: 상단 가로 stepper에서 Source 선택 -> Transform 이동 흐름 재확인.
- Browser smoke: API source 선택 후 schema preview table 6행 표시, Transform Select Fields 6개 연결 확인.
- Browser smoke: Source 선택 toast가 `fixed` 위치로 표시되고 wizard card 위치를 밀지 않음을 확인.
