# Week2 M1 Synthetic Raw Scale 보고서

## Short Report / 짧은 보고

- Type: Feature / Data seed scale
- Date: 2026-06-26
- Changed: PR #154의 generator를 보강해 manifest/summary에 `selected_option=option_2_recommended_mvp_demo`를 기록하고, `Health_and_Personal_Care` 기반 local ignored `data/`를 review 100,000행, product 10,000행, behavior 30,000행으로 재생성했다.
- Verified: focused unittest, JSONL 100,000행 parse/6필드 검증, manifest/summary JSON validation, `Week2LocalRunner` smoke -> `fallback_succeeded`, input `row_count=100000`, output `output_row_count=28190`, strict harness validation. PR finalization 중 최신 `origin/main`을 병합한 뒤 focused unittest, local runner smoke, strict harness validation을 재실행해 통과했다.
- Remaining: M3 handoff, PR 준비 여부, Taxi delivery seed 후속 여부.
- Next context: scale sample은 `data/week2/mvp_synthesis/...`에 local로 있다. 다른 worktree에서는 generation command로 재생성해야 한다.
- Risk: `Health_and_Personal_Care`는 파일 크기와 시나리오 균형을 본 선택이다. 발표 질문이 Electronics/Cell Phones를 강하게 요구하면 category 재선택이 필요하다.
