# L2 Profile and Schema Snapshot 상세 설계

## 1. 역할

L2는 unknown source를 schema/profile evidence로 바꾸는 계층이다. 여기서 말하는 schema는 최종 Silver schema가 아니라 “현재 관찰된 구조와 품질의 snapshot”이다. L2 결과는 L3 AI input pack의 근거가 되고, L9/L10에서 caveat와 lineage를 설명하는 데도 쓰인다.

L2는 format별 특성을 보존해야 한다. CSV, JSON, JSONL, Parquet은 구조 추론 방식이 다르다. 모든 source를 단일 generic table profile로 뭉개면 중요한 evidence가 사라진다.

## 2. 선택 방식

선택 방식은 `Format-specialized Profile Pack`이다. L2는 먼저 format router가 detected format과 confidence를 기록하고, 이후 CSV profile, JSON path trie, JSONL field frequency, Parquet schema/statistics profile 같은 format별 artifact를 만든다.

혼합 source이면 profile artifact를 여러 개 만들 수 있다. 예를 들어 같은 source 안에 CSV object와 JSONL stream window가 같이 있으면 `profile_artifacts[]`에 각각의 scope와 ref를 둔다.

## 3. 선택 이유

CSV는 delimiter, quote, escape, header row, null token이 중요하다. JSON/JSONL은 nested path, optional field, array expansion risk, type conflict가 중요하다. Parquet은 physical schema, logical type, partition value, row group statistics가 중요하다. 이 차이를 무시하면 L4 recommendation이 부정확해진다.

대용량에서는 전체 row를 분석하지 않고도 profile을 만들어야 한다. L2는 sample, sketch, histogram, null ratio, approximate cardinality, type conflict count, rescue ratio를 중심으로 summary를 만든다. 이 summary만 L3로 넘기면 AI 입력 크기와 비용을 제한할 수 있다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l2/profile_snapshot.json` | format router와 profile artifact 목록을 묶는 상위 snapshot이다. |
| `l2/csv_profile.json` | delimiter/header/null token/type 후보/column statistics를 기록한다. |
| `l2/json_profile.json` | path trie, nested field, array risk, type conflict를 기록한다. |
| `l2/jsonl_profile.json` | line-level field frequency, optional path, malformed line ratio를 기록한다. |
| `l2/parquet_profile.json` | Parquet schema, partition, row group statistics, logical type 정보를 기록한다. |
| `l2/profile_quality_summary.json` | profile confidence, sample coverage, known risk를 요약한다. |

## 5. 장점

첫째, format별로 필요한 evidence를 잃지 않는다. CSV dialect와 JSON nested path를 같은 column list로 만들면 추천 품질이 떨어지는데, 이를 방지한다.

둘째, AI 비용을 통제한다. L3는 raw가 아니라 L2의 profile evidence만 받으므로 전체 row를 AI로 보지 않는다.

셋째, 재현 가능한 snapshot이 된다. 같은 L0/L1 범위와 같은 profiler version이면 같은 profile artifact를 만들 수 있다.

## 6. 단점과 문제

첫째, profiler 구현이 format별로 나뉘어 복잡해진다. 단일 generic profile보다 개발량이 많다.

둘째, sample bias가 생길 수 있다. source 앞부분만 보고 profile하면 뒤쪽 partition의 type conflict나 rare field를 놓칠 수 있다.

셋째, profile confidence가 낮은 경우 L4 추천도 보수적으로 바뀌어야 한다. 이를 UI에서 설명하지 않으면 사용자가 왜 `needs_review`가 많은지 이해하기 어렵다.

## 7. 가능 범위

CSV, JSON, JSONL, Parquet의 구조적 profile을 지원한다. approximate count, null ratio, distinct estimate, min/max, string length, type candidate, nested depth, array expansion risk 같은 evidence를 만들 수 있다.

대용량에서는 bounded scan, stratified sample, partition sample, sketch 기반 통계를 사용할 수 있다. 이 방식은 모든 row를 AI로 넘기지 않으면서도 추천에 필요한 충분한 근거를 제공한다.

## 8. 한계

L2는 최종 schema를 확정하지 않는다. 최종 Silver schema는 L4 추천, L5 승인, L6 compile을 거쳐야 한다. L2는 PII를 완전히 판정하지도 않는다. PII candidate hint를 만들 수 있지만 최종 exposure 판단은 L3/L7/L10 validator가 함께 맡는다.

schema drift report는 core가 아니라 extension hook이다. 반복 운영에서 이전 profile과 현재 profile을 비교하는 기능은 중요하지만, 첫 onboarding core contract에는 snapshot까지만 둔다.

## 9. 검증 기준

`profile_snapshot.json`은 detected format, confidence, evidence, profile refs를 포함해야 한다. 각 profile ref는 artifact manifest에서 resolve되어야 한다. L2가 raw payload를 AI-safe artifact로 직접 넘기면 안 된다.

## 10. Handoff

L2는 L1 bronze/rescue evidence를 받아 L3 redacted AI evidence pack으로 넘긴다. L3는 L2 profile 중 AI가 봐도 되는 field evidence만 골라 budget 안에서 축약한다.
