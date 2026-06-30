from dataclasses import dataclass
from time import perf_counter

from app.domain.schemas import TargetDatasetDraftRecord, TargetDatasetJobRunRecord
from app.services.target_dataset_local_runner import TargetDatasetLocalRunner, TargetDatasetLocalRunnerError


@dataclass(frozen=True)
class TargetDatasetRunExecutionResult:
    status: str
    run_note: str
    output_path: str | None
    row_count: int | None
    output_bytes: int | None
    silver_output_paths: list[str]
    logs: list[str]
    duration_ms: int
    source_evidence: list[dict[str, object]]
    runtime_evidence: dict[str, object]


class TargetDatasetRuntimeExecutor:
    def execute(
        self,
        run: TargetDatasetJobRunRecord,
        draft: TargetDatasetDraftRecord,
    ) -> TargetDatasetRunExecutionResult:
        if run.executor_handoff == "local_runner":
            return self._execute_local_runner(run, draft)
        if run.executor_handoff == "airflow":
            return readiness_only_result(
                run=run,
                executor="airflow",
                run_note="Airflow executor readiness recorded. DAG trigger is not executed in C-29.",
                logs=[
                    "Airflow handoff selected on the Gold Build job definition",
                    "DAG trigger is blocked until Airflow result artifact contract is wired to this Run record",
                    "Run remains ready_to_run; it is not marked succeeded",
                ],
                blocked_until=[
                    "Airflow base URL and credential refs are configured",
                    "DAG trigger endpoint is approved for this workflow",
                    "result artifact is mapped back into TargetDatasetJobRunRecord",
                ],
            )
        if run.executor_handoff == "spark_runner":
            return readiness_only_result(
                run=run,
                executor="spark_runner",
                run_note="Spark runner readiness recorded. Spark job is not executed in C-29.",
                logs=[
                    "Spark runner selected on the Gold Build job definition",
                    "Distributed Spark execution is blocked until cluster/result artifact contract is wired",
                    "Run remains ready_to_run; it is not marked succeeded",
                ],
                blocked_until=[
                    "Spark runner execution profile is selected",
                    "cluster or local runner result artifact path is configured",
                    "output dataset evidence is mapped back into TargetDatasetJobRunRecord",
                ],
            )
        raise TargetDatasetRuntimeExecutorError(f"Unsupported executor: {run.executor_handoff}")

    def _execute_local_runner(
        self,
        run: TargetDatasetJobRunRecord,
        draft: TargetDatasetDraftRecord,
    ) -> TargetDatasetRunExecutionResult:
        try:
            result = TargetDatasetLocalRunner().run(run, draft)
        except TargetDatasetLocalRunnerError as error:
            raise TargetDatasetRuntimeExecutorError(str(error)) from error
        return TargetDatasetRunExecutionResult(
            status="succeeded",
            run_note=run_note_for_runtime_evidence(result.runtime_evidence),
            output_path=result.output_path,
            row_count=result.row_count,
            output_bytes=result.output_bytes,
            silver_output_paths=result.silver_output_paths,
            logs=result.logs,
            duration_ms=result.duration_ms,
            source_evidence=result.source_evidence,
            runtime_evidence={
                **result.runtime_evidence,
                "executor_status": "executed",
                "run_record_role": "execution_evidence",
                "job_definition_id": run.target_dataset_draft_id,
            },
        )


class TargetDatasetRuntimeExecutorError(ValueError):
    pass


def readiness_only_result(
    run: TargetDatasetJobRunRecord,
    executor: str,
    run_note: str,
    logs: list[str],
    blocked_until: list[str],
) -> TargetDatasetRunExecutionResult:
    started = perf_counter()
    duration_ms = max(1, int((perf_counter() - started) * 1000))
    return TargetDatasetRunExecutionResult(
        status="ready_to_run",
        run_note=run_note,
        output_path=None,
        row_count=None,
        output_bytes=None,
        silver_output_paths=[],
        logs=logs,
        duration_ms=duration_ms,
        source_evidence=[],
        runtime_evidence={
            "runner": executor,
            "executor_status": "readiness_only",
            "run_record_role": "handoff_readiness",
            "status": "blocked",
            "trigger_attempted": False,
            "result_artifact_status": "not_connected",
            "blocked_until": blocked_until,
            "job_definition_id": run.target_dataset_draft_id,
        },
    )


def run_note_for_runtime_evidence(runtime_evidence: dict[str, object]) -> str:
    if runtime_evidence.get("materialization_mode") == "prepared_gold_reference":
        return "Prepared Product Health Gold parquet referenced for Product Health run execution."
    if runtime_evidence.get("materialization_mode") == "silver_parquet_to_gold":
        return "Silver parquet inputs materialized into local Gold parquet."
    return "Local runner materialization completed."
