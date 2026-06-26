# M2 RuntimeConfig SparkRunner smoke 계획

## 브랜치

- Branch: `feature/m2-runtime-sparkrunner-smoke`
- Workspace: `docs/workflows/feature/m2-runtime-sparkrunner-smoke`
- Created: 2026-06-26

## 목표

- M2 구현을 Taxi 전용 ETL이 아니라 데이터셋 독립 `RuntimeConfig`/`SparkRunner` 공통 실행기로 시작한다.
- 첫 PR은 M2 전체 구현이 아니라 Spark read/write smoke와 표준 실행 결과 반환까지로 제한한다.
- TLC NYC Taxi Dataset은 예전 M2 계획과 정형 빅데이터 ETL 가능성을 보여주는 evidence로 쓰되, 첫 PR에서 full Taxi ETL을 완성하지 않는다.

## 범위

- `RuntimeConfig`의 최소 필드를 정의한다.
  - input format
  - input path
  - output path 또는 output root
  - runner kind
  - local runtime option
- `SparkRunner` 또는 동등한 M2 실행기 skeleton을 만든다.
- 작은 fixture 또는 임시 데이터로 read/write smoke를 검증한다. 가능하면 Amazon Reviews 우선 흐름과 맞게 JSON/JSONL fixture를 먼저 고려하되, 구현 제약이 있으면 Parquet fixture로 최소 smoke를 닫는다.
- runner 결과는 `Week2RunnerResult` 호환 방향으로 `status`, `row_count`, `bytes`, `duration_ms`, `output_path`를 반환한다.
- 입력 format/path/options 차이는 code branch가 아니라 config로 처리한다.
- TLC NYC Taxi Parquet은 실제 대용량 파일을 commit하지 않고 local/manual evidence 후보로 둔다.

## 범위 제외

- Taxi 전용 `TaxiRunner` 구현
- Taxi 비즈니스 변환 정책, Gold 지표 정의, 품질 규칙 정의
- Amazon Reviews 분석 대표 path의 `TransformSpec` 정의
- M5 runner selection/Catalog persistence 연결
- M6 SQL/RAG/AI Query 연결
- UI 변경
- 대용량 원본 Parquet, 로컬 DB volume, 생성된 output data commit
- MinIO/S3 운영 연동 완료

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

이번 Phase는 구현 범위가 작아야 하므로 아래 순서로 나눈다.

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step 1 - RuntimeConfig 최소 shape

#### 목표

- M2 실행기가 dataset-specific code 없이 입력 형식과 경로를 받을 수 있게 한다.

#### 범위

- `RuntimeConfig` 최소 필드 결정
- fixture 또는 test에서 사용할 config 예시 작성

#### 범위 제외

- 전체 shared contract 승격
- M5/M6 공식 API 변경

#### 구현 프롬프트

```text
@AGENTS.md @docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md @docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md

M2 RuntimeConfig 최소 shape를 구현한다. input_format, input_path, output_path 또는 output_root, runner kind를 포함하되 Taxi 전용 필드를 만들지 않는다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

RuntimeConfig fixture가 dataset-independent인지 확인하고 관련 unit test를 실행한다.
```

#### 완료 기준

- [x] `RuntimeConfig`가 Taxi 전용 필드 없이 입력 format/path/options를 표현한다.
- [x] fixture 또는 unit test가 있다.

### Step 2 - SparkRunner read/write smoke

#### 목표

- Spark 또는 local-equivalent 실행기가 입력을 읽고 Parquet output을 쓰는 최소 경로를 만든다.

#### 범위

- input format이 `json`, `jsonl`, 또는 `parquet`인 작은 fixture read
- output path에 Parquet write
- row count, bytes, duration 계산
- 실패 시 status/error 반환

#### 범위 제외

- Taxi full-month benchmark
- Amazon Reviews JSON transformation semantics
- Gold business metric

#### 구현 프롬프트

```text
@AGENTS.md @docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md @docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md

M2 SparkRunner smoke를 구현한다. 작은 fixture를 읽고 Parquet output을 쓰며 `Week2RunnerResult` 호환 metrics를 반환한다. 가능하면 Amazon Reviews 우선 흐름과 맞는 JSON/JSONL fixture를 사용하되, Taxi 전용 runner나 transformation semantics를 만들지 않는다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

SparkRunner smoke test를 실행하고 row_count, bytes, duration_ms, output_path가 반환되는지 확인한다. 대용량 데이터 파일은 commit하지 않는다.
```

#### 완료 기준

- [x] 작은 fixture로 read/write smoke가 통과한다.
- [x] `status`, `row_count`, `bytes`, `duration_ms`, `output_path`가 반환된다.
- [x] 대용량 Taxi 파일은 commit되지 않는다.

### Step 3 - PR evidence 정리

#### 목표

- 첫 PR이 M2 전체 구현이 아니라 공통 실행기 smoke임을 명확히 남긴다.

#### 범위

- `quality.md` 검증 결과 기록
- `report.md` 변경/검증/남은 일 기록
- follow-up PR 범위 기록

#### 범위 제외

- PR 생성 전 추가 기능 확장

#### 구현 프롬프트

```text
@AGENTS.md @docs/workflows/feature/m2-runtime-sparkrunner-smoke/plan.md

M2 SparkRunner smoke의 검증 증거와 후속 PR 분할 계획을 workspace에 기록한다.
```

#### 검증 프롬프트

```text
@AGENTS.md

git diff --check, relevant backend tests, scripts/validate-harness.sh --strict를 실행하고 결과를 workspace에 남긴다.
```

#### 완료 기준

- [x] 첫 PR 범위와 제외 범위가 report에 남아 있다.
- [x] 후속 PR 후보가 next-actions에 남아 있다.
- [x] local validation 결과가 quality에 남아 있다.

## PR 분할 기준

첫 PR에서 M2가 해야 할 모든 것을 끝내지 않는다. 첫 PR은 공통 실행기 smoke로 제한한다.

아래 표는 확정된 순서가 아니라 현재 후속 후보 정리다. 공식 문서가 고정한 것은 “M2는 dataset-independent `RuntimeConfig`/`SparkRunner` smoke부터 시작하고, TLC NYC Taxi Dataset은 정형 빅데이터 ETL 가능성 evidence로 쓴다”는 경계까지다.

| 구분 | 목적 | 포함 | 제외 |
| --- | --- | --- | --- |
| 첫 PR | `RuntimeConfig` + `SparkRunner` smoke | 작은 fixture read/write, 공통 result shape, basic tests. 가능하면 Amazon Reviews 우선 흐름과 맞는 JSON/JSONL fixture를 먼저 검토 | Taxi full ETL, M5 Catalog 연결, M6 SQL 연결 |
| 후속 후보 A | TLC NYC Taxi evidence | local Taxi Parquet manual/benchmark evidence, row_count/bytes/duration/output_path 기록 | Taxi business Gold 지표, UI |
| 후속 후보 B | M5 runner integration | M5가 optional SparkRunner를 선택/호출하고 성공 결과만 Catalog update 후보로 사용 | M3 transformation semantics |
| 후속 후보 C | SQL smoke 연결 | output Parquet을 DuckDB 또는 Spark SQL로 count 확인 | M6 full AI Query/RAG 연결 |

첫 PR 완료 뒤 후속 순서는 팀 dependency와 준비 상태를 보고 정한다. TLC NYC Taxi evidence가 반드시 두 번째 PR이라는 규칙은 없다.

## 완료 기준

- [x] `RuntimeConfig` 최소 shape가 구현되어 있다.
- [x] `SparkRunner` 또는 동등한 실행기 smoke가 작은 fixture로 read/write를 수행한다.
- [x] `Week2RunnerResult` 호환 방향의 metrics가 반환된다.
- [x] Taxi 전용 runner나 transformation semantics를 만들지 않는다.
- [x] 대용량 원본/출력 데이터가 commit되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
