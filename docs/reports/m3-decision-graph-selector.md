# M3 Decision Graph Selector 보고서

## Short Report / 짧은 보고

- Type: Docs/static HTML artifact
- Date: 2026-06-27
- Changed: `docs/project-context/asklake-week2-module-plan/ver2/m3-decision-graph-selector.html`를 새로 만들었다. 단일 선택 기반 대주제/중주제/소주제/후보 UI, upstream 선택에 따른 동적 표시, invalidated 기록, localStorage v3 저장, JSON/Markdown export를 구현했다.
- Verified:
  - `node -e "... new Function(script) ..."` -> `script syntax ok`
  - `Select-String ... "product_health|product-health|Product Health|health_score"` -> match 없음
  - `git diff --check -- docs/project-context/asklake-week2-module-plan/ver2/m3-decision-graph-selector.html` -> output 없음
  - Node VM model regression -> `model regression ok`
- Browser visual: Chrome headless screenshot을 생성하고 확인했다. `output/playwright/m3-decision-graph-selector.png`
- Remaining: 없음. Playwright CLI/Node REPL 출력 문제는 있었지만 Chrome headless screenshot과 JS model regression으로 대체 검증했다.
- Next context: 사람이 HTML에서 route.primary 후보를 고른 뒤 Markdown export를 `decisions.md`에 수동 반영한다. HTML은 Source of Truth 문서를 자동 수정하지 않는다.
- Risk: HTML은 정적 선택 도구이며, 실제 M3 code implementation 또는 runner contract를 생성하지 않는다.
