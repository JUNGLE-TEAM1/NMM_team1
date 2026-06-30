# M3 v2.1.1 계약 문서 보강 보고서

## Short Report / 짧은 보고

- Type: Hotfix / contract patch
- Date: 2026-06-27
- Changed:
  - `docs/reports/m3-expanded-layer-contract/selected-improvement-contract-v2.1.1.md`를 새 canonical patch 문서로 추가했다.
  - `docs/reports/m3-expanded-layer-contract/index.html`에 v2.1.1 링크를 추가했다.
- Verified:
  - `gold_readiness_axis_ref` nullable schema 제거 여부 검색
  - legacy `salt_secret_ref`, `review_ref`, `decision_trace_ref`, `checkpoint_ref`, `lateness_policy_ref` 잔여 검색
  - `preview_scope.window_id` field 잔여 검색
  - L10 package `m6_context_status` 직접 포함 여부 검색
  - L0 source unit 양방향 consistency rule 포함 여부 검색
  - aggregate `cardinality_guard` 포함 여부 검색
  - HTML index v2.1.1 링크 검색
- Remaining:
  - stream runtime, watermark, schema drift, production write, unstructured/RAG는 core가 아니라 extension hook으로 남긴다.
  - 이 문서는 계약 보강 문서이며, validator 구현 코드는 별도 작업이다.
- Next context:
  - 다음 구현 단계에서는 v2.1.1의 regression guard를 validator fixture로 옮기면 된다.
- Risk:
  - 기존 v2.1 문서는 보존되어 있어 사용자가 v2.1과 v2.1.1 중 어느 문서를 canonical로 볼지 혼동할 수 있다. index에는 v2.1.1 링크를 추가했다.

## Goal / 목표

v2.1에서 남은 P0/P1 충돌을 반영해 M3 logical L0-L16 core 계약을 v2.1.1로 보강한다. 물리 artifact 폴더는 compatibility 때문에 `l0`~`l10`을 유지하지만, 발표/구현/판단 기준은 `logical_layer=L0`~`L16`이다. 특히 L16 M6 context handoff, L15 Silver/Gold context 분리, Gold readiness axis nullability, source_unit consistency, preview_scope 정렬, aggregate params, `_ref` naming, replay locator, PII exposure 분리를 명확하게 닫는다.

## Changed Files / 변경 파일

- `docs/reports/m3-expanded-layer-contract/selected-improvement-contract-v2.1.1.md`
- `docs/reports/m3-expanded-layer-contract/index.html`
- `docs/reports/m3-expanded-layer-contract-v2.1.1-report.md`

## Implementation Summary / 구현 요약

- v2.1을 삭제하지 않고 v2.1.1 문서를 새로 만들었다.
- L0에 object/window/source_unit 양방향 consistency validation을 추가했다.
- L1 record locator를 object-backed와 stream-backed로 나누고 replay anchor 조건을 강화했다.
- artifact가 아닌 secret/review/trace/external handle은 `_ref`를 쓰지 않도록 naming rule과 schema를 수정했다.
- L6에 `preview_scope.json`을 추가하고 legacy `window_id`를 금지했다.
- L6 aggregate params를 `input_ref`, `group_by`, `measures`, `time_window`, `cardinality_guard` 중심으로 재정의했다.
- L9 precedence rule에서 Gold readiness가 Silver context를 바꾸지 못하도록 분리했다.
- L9 `gold_readiness_axis.json`를 항상 생성하도록 하고 `gold_readiness_axis_ref`를 non-null로 고정했다.
- L10 `catalog_sync_contract_package.json`에 `m6_context_status`를 직접 추가하고 gate summary / SQL context와의 일치 rule을 추가했다.
- `pii_handling`은 `none|mask|hash`만 허용하고 hidden/forbidden은 exposure 필드로 분리했다.

## Verification Commands / 검증 명령

```powershell
$p='D:\NMM_team1\docs\reports\m3-expanded-layer-contract\selected-improvement-contract-v2.1.1.md'
$text=Get-Content -LiteralPath $p -Encoding UTF8 -Raw
$checks=@(
  @{Name='file exists'; Pass=(Test-Path -LiteralPath $p)},
  @{Name='no nullable gold_readiness_axis_ref schema'; Pass=($text -notmatch '"gold_readiness_axis_ref"\s*:\s*"string\|null"')},
  @{Name='no legacy exact refs'; Pass=($text -notmatch '\b(salt_secret_ref|review_ref|decision_trace_ref|checkpoint_ref|lateness_policy_ref)\b')},
  @{Name='no hidden in pii_handling schema'; Pass=($text -notmatch '"pii_handling"\s*:\s*"none\|mask\|hash\|hidden"')},
  @{Name='no preview_scope window_id field'; Pass=($text -notmatch '"window_id"\s*:')},
  @{Name='has top-level m6_context_status in L10 package'; Pass=($text -match 'catalog_sync_contract_package[\s\S]*"m6_context_status"')},
  @{Name='has source unit bidirectional consistency'; Pass=($text -match '양방향' -and $text -match 'objects\[\]\.source_unit_id' -and $text -match 'stream_windows\[\]\.source_unit_id')},
  @{Name='has aggregate cardinality guard'; Pass=($text -match '"cardinality_guard"')}
)
foreach($c in $checks){ if($c.Pass){ "PASS $($c.Name)" } else { "FAIL $($c.Name)" } }
if($checks.Pass -contains $false){ exit 1 }
```

```powershell
$p='D:\NMM_team1\docs\reports\m3-expanded-layer-contract\index.html'
$text=Get-Content -LiteralPath $p -Encoding UTF8 -Raw
if($text -match 'selected-improvement-contract-v2\.1\.1\.md'){ 'PASS index links v2.1.1' } else { 'FAIL missing v2.1.1 link'; exit 1 }
```

## Review Notes / 검토 기록

- Round 1:
  - 검색 기반 검증을 수행했다.
  - `lateness_policy_ref`가 core aggregate params에 남아 있어 watermark 정책을 core에 끌어온 것처럼 보이는 문제를 발견했다.
  - `index.html` 하단 산출물 링크에 v2.1.1이 빠져 있는 문제를 발견했다.
  - 둘 다 수정했다.
- Round 2:
  - L9 precedence, Gold status table, `gold_readiness_axis.json`, L10 package, SQL context schema를 라인 단위로 재검토했다.
  - `gold_requested` 예시가 boolean placeholder가 아니라 고정값처럼 보이는 문제를 발견해 `"boolean"`으로 수정했다.
- Round 3:
  - legacy `_ref` 검색 오탐을 단어 경계 검색으로 재검증했다.
  - 금지된 legacy field name은 남아 있지 않았다.

## Regression Guard / 회귀 보호

- Checked feature: L9/L10 context handoff
- Protected behavior:
  - Gold readiness가 Silver context를 오염시키지 않는다.
  - Gold가 `not_requested` 또는 `deferred`여도 L9 axis와 L10 refs가 비지 않는다.
  - L10 package, gate summary, SQL context의 `m6_context_status`가 같은 값을 가져야 한다.
- Result: 문서 rule과 regression guard에 반영했다.

## Manual Verification / 수동 검증

- Document executed: `docs/reports/m3-expanded-layer-contract/selected-improvement-contract-v2.1.1.md`
- Environment: Windows PowerShell, local repository `D:\NMM_team1`
- Result:
  - 사용자 지정 6개 P0/P1과 첨부 P1을 모두 문서에 반영했다.
  - 반영 불가능한 항목은 없었다.
- Failure/limitation:
  - 실제 schema validator 또는 Spark execution code는 이번 요청 범위가 아니므로 구현하지 않았다.

## Secret / Migration / Env Check

- Secret check:
  - secret 값 추가 없음.
  - `salt_secret_id`는 secret value가 아니라 secret manager id placeholder다.
- Migration/data change:
  - 없음.
- Env change:
  - 없음.

## Final Judgment / 최종 판단

- Done:
  - v2.1.1 계약 문서와 index link를 작성했다.
  - 문서 검색 검증과 수동 검토를 수행했다.
- Remaining risk:
  - validator code가 아직 없으므로 이 계약을 실제 입력으로 강제하려면 별도 implementation phase가 필요하다.
