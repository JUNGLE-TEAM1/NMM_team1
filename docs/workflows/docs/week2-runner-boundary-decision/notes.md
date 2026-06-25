# Week2 runner boundary decision 노트

## 진행 메모

- Phase 5 PR #124가 merge된 `origin/main` `a8fa6a2` 기준으로 workspace를 만들었다.
- `Week2RunnerResult` dataclass와 `Week2WorkflowService._run_with_executor()`를 확인했다.
- Phase 6은 code 변경 없이 M2/M3/M5 병렬 구현의 호출 계약을 결정한다.

## 결정

- runner result는 현재 `Week2RunnerResult` 호환 shape로 고정한다.
- M5는 runner selection과 run/catalog persistence를 맡는다.
- M3는 `TransformSpec`와 job logic을 만들지만 Spark session은 만들지 않는다.
- M2는 `RuntimeConfig`와 `SparkRunner` implementation을 맡지만 transformation semantics를 정의하지 않는다.

## 열린 질문

- 후속 code PR에서 실제 adapter class/function 이름을 결정한다.
- SparkRunner smoke fixture와 Amazon Reviews JSON sample path를 implementation branch에서 확정한다.

## 링크 / 증거

- `backend/app/services/week2_local_runner.py`
- `backend/app/services/week2_workflow.py`
- `contracts/execution_result.sample.json`
- `contracts/workflow_definition.sample.json`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
