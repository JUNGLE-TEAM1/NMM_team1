import json
import re
from copy import deepcopy
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.domain.runtime_config import StorageConfig
from app.services.week2_airflow_adapter import Week2AirflowAdapter, Week2AirflowError
from app.services.week2_catalog_store import Week2CatalogStore
from app.services.week2_local_runner import Week2LocalRunner, Week2RunnerResult
from app.services.week2_storage_adapter import StorageLocation, Week2StorageAdapter

SUCCESSFUL_RUN_STATUSES = {"succeeded", "fallback_succeeded"}
AIRFLOW_SUCCESS_STATUS = "succeeded"
SUPPORTED_EXECUTORS = {"airflow", "local_runner"}


class Week2WorkflowNotFoundError(ValueError):
    """Week 2 workflow, run, catalog 조회 대상이 없을 때 발생하는 오류."""

    pass


class Week2WorkflowInvalidExecutorError(ValueError):
    """지원하지 않는 Week 2 executor 요청이 들어왔을 때 발생하는 오류."""

    pass


class Week2WorkflowService:
    """Week 2 workflow 실행, runner 선택, run/catalog 저장을 묶는 서비스."""

    def __init__(
        self,
        contracts_dir: Path | None = None,
        airflow_adapter: Week2AirflowAdapter | None = None,
        local_runner: Week2LocalRunner | None = None,
        output_root: Path | None = None,
        catalog_store: Week2CatalogStore | None = None,
    ) -> None:
        """계약 fixture, runner, catalog store를 준비해 workflow 실행 상태를 초기화한다."""

        self.contracts_dir = contracts_dir or default_contracts_dir()
        self.output_root = output_root or default_week2_output_root()
        self.source_config = self._load_contract("source_config.sample.json")
        self.schema_definition = self._load_contract("schema_definition.sample.json")
        self.workflow_definition = self._load_contract("workflow_definition.sample.json")
        self.execution_template = self._load_contract("execution_result.sample.json")
        self.catalog_template = self._load_contract("catalog_metadata.sample.json")
        self.catalog_store = catalog_store or Week2CatalogStore(self.output_root / "_metadata")
        self.airflow_adapter = airflow_adapter or Week2AirflowAdapter()
        self.local_runner = local_runner or Week2LocalRunner(
            source_config=self.source_config,
            schema_definition=self.schema_definition,
            output_root=self.output_root,
        )
        self.storage_adapter = Week2StorageAdapter()
        self.runs = self.catalog_store.load_runs()
        self.catalog = self.catalog_store.load_catalog()
        self.sequence = self.catalog_store.sequence_start(self.runs)

    def trigger_run(self, pipeline_id: str, executor: str, triggered_by: str) -> dict[str, Any]:
        """요청받은 executor로 workflow를 실행하고 run/catalog metadata를 저장한다."""

        if pipeline_id != self.workflow_definition["pipeline_id"]:
            raise Week2WorkflowNotFoundError("Week 2 workflow not found")
        if executor not in SUPPORTED_EXECUTORS:
            supported = ", ".join(sorted(SUPPORTED_EXECUTORS))
            raise Week2WorkflowInvalidExecutorError(f"Unsupported Week 2 executor: {executor}. Supported: {supported}")

        self.sequence += 1
        run_id = f"run_reviews_demo_{self.sequence:03d}"
        timestamp = now_iso()
        runner_result = self._run_with_executor(executor, run_id)
        status = runner_result.status

        run = deepcopy(self.execution_template)
        run["run_id"] = run_id
        run["pipeline_id"] = pipeline_id
        run["executor"] = executor
        run["status"] = status
        run["triggered_by"] = triggered_by
        run["timestamps"] = {
            "started_at": timestamp,
            "finished_at": timestamp,
        }
        run["outputs"] = [self._output_for_run(output, run_id) for output in run["outputs"]]
        run["row_count"] = runner_result.row_count
        run["bytes"] = runner_result.bytes
        run["duration_ms"] = runner_result.duration_ms
        run["task_results"] = runner_result.task_results
        run["logs"] = self._logs_for_executor(executor, status, runner_result.logs)

        self.runs[run_id] = run
        self.catalog_store.save_run(run)
        if status in SUCCESSFUL_RUN_STATUSES:
            catalog = self._catalog_for_run(run_id, timestamp, runner_result)
            self.catalog[catalog["dataset_id"]] = catalog
            self.catalog_store.save_catalog(catalog)
        return run

    def get_run(self, run_id: str) -> dict[str, Any]:
        """저장된 run metadata를 run_id로 조회한다."""

        run = self.runs.get(run_id)
        if run is None:
            raise Week2WorkflowNotFoundError("Week 2 run not found")
        return run

    def get_catalog_metadata(self, dataset_id: str) -> dict[str, Any]:
        """저장된 Catalog metadata를 dataset_id로 조회한다."""

        catalog = self.catalog.get(dataset_id)
        if catalog is None:
            raise Week2WorkflowNotFoundError("Week 2 catalog metadata not found")
        return catalog

    def _run_with_executor(self, executor: str, run_id: str) -> Week2RunnerResult:
        """executor 이름에 맞는 runner를 호출하고 Airflow 실패 시 local fallback을 적용한다."""

        if executor == "local_runner":
            return self.local_runner.run(self.workflow_definition, run_id=run_id)

        try:
            airflow_result = self.airflow_adapter.run(self.workflow_definition, run_id=run_id)
        except Week2AirflowError as error:
            fallback_result = self.local_runner.run(self.workflow_definition, run_id=run_id)
            return result_with_logs(
                fallback_result,
                [
                    {
                        "level": "warning",
                        "message": f"Airflow unavailable; falling back to local runner: {error}",
                    }
                ],
            )

        if should_fallback_to_local_runner(airflow_result):
            fallback_result = self.local_runner.run(self.workflow_definition, run_id=run_id)
            return result_with_logs(
                fallback_result,
                airflow_result.logs
                + [
                    {
                        "level": "warning",
                        "message": f"Airflow returned {airflow_result.status}; falling back to local runner",
                    }
                ],
            )

        return airflow_result

    def _load_contract(self, file_name: str) -> dict[str, Any]:
        """contracts 디렉터리의 JSON fixture를 dict로 읽는다."""

        path = self.contracts_dir / file_name
        with path.open(encoding="utf-8") as contract_file:
            return json.load(contract_file)

    def _output_for_run(self, output: dict[str, Any], run_id: str) -> dict[str, Any]:
        """ExecutionResult output URI 안의 run_id segment를 현재 run_id로 치환한다."""

        updated_output = deepcopy(output)
        updated_output["uri"] = replace_run_id(updated_output["uri"], run_id)
        return updated_output

    def _runtime_storage_config(self) -> StorageConfig:
        """runtime/catalog fixture를 합쳐 runner와 Catalog가 공유할 storage 설정을 만든다."""

        runtime_config_path = self.contracts_dir / "runtime_config.sample.json"
        runtime_storage: dict[str, Any] = {}
        if runtime_config_path.exists():
            with runtime_config_path.open(encoding="utf-8") as runtime_config_file:
                runtime_storage = json.load(runtime_config_file).get("storage", {})
        return StorageConfig(
            profile=runtime_storage.get("profile", self.catalog_template["storage"].get("profile", "minio")),
            bucket=runtime_storage.get("bucket", self.catalog_template["storage"].get("bucket", "asklake-demo")),
            endpoint=runtime_storage.get("endpoint"),
            prefix=self.catalog_template["storage"]["prefix"],
            local_fallback_root=str(self.output_root),
        )

    def _catalog_for_run(self, run_id: str, timestamp: str, runner_result: Any) -> dict[str, Any]:
        """runner 결과를 CatalogMetadata fixture에 반영해 저장 가능한 catalog record를 만든다."""

        catalog = deepcopy(self.catalog_template)
        output_file_name = Path(runner_result.output_path).name if runner_result.output_path else f"{catalog['dataset_id']}.parquet"
        storage_location = self._catalog_storage_location(run_id, output_file_name)
        catalog["s3_uri"] = storage_location.uri
        catalog["storage"]["bucket"] = storage_location.bucket
        catalog["storage"]["prefix"] = storage_location.prefix
        catalog["storage"]["local_fallback_path"] = runner_result.output_path or str(storage_location.local_path)
        catalog["metrics"]["row_count"] = output_row_count(runner_result)
        catalog["metrics"]["bytes"] = output_bytes(runner_result)
        catalog["metrics"]["quality"]["schema_match"] = "passed"
        catalog["metrics"]["quality"]["row_count_checked"] = output_row_count(runner_result) is not None
        catalog["lineage"]["run_id"] = run_id
        catalog["updated_at"] = timestamp
        return catalog

    def _catalog_storage_location(self, run_id: str, output_file_name: str) -> StorageLocation:
        """Catalog에 기록할 S3-compatible URI와 local fallback path를 계산한다."""

        return self.storage_adapter.build_location(
            self._runtime_storage_config(),
            run_id=run_id,
            file_name=output_file_name,
            local_root=self.output_root,
        )

    def _logs_for_executor(
        self,
        executor: str,
        status: str,
        runner_logs: list[dict[str, str]],
    ) -> list[dict[str, str]]:
        """runner 로그 뒤에 어떤 executor 경로가 쓰였는지 사람이 읽을 수 있는 로그를 덧붙인다."""

        logs = deepcopy(runner_logs)
        if executor == "airflow" and status == AIRFLOW_SUCCESS_STATUS:
            logs.append({"level": "info", "message": "airflow adapter executed Week 2 workflow boundary"})
        elif executor == "airflow":
            logs.append({"level": "info", "message": "airflow adapter fell back to local runner"})
        else:
            logs.append({"level": "info", "message": "local runner executed Week 2 workflow boundary"})
        return logs


def default_contracts_dir() -> Path:
    """기본 contracts fixture 디렉터리 경로를 반환한다."""

    return repo_root() / "contracts"


def default_week2_output_root() -> Path:
    """Week 2 local fallback output root의 기본 경로를 반환한다."""

    return repo_root() / "data" / "week2"


def repo_root() -> Path:
    """contracts 디렉터리를 기준으로 repository root를 찾는다."""

    for parent in Path(__file__).resolve().parents:
        if (parent / "contracts").is_dir():
            return parent
    return Path(__file__).resolve().parents[3]


def now_iso() -> str:
    """UTC 기준 현재 시각을 ISO 문자열로 반환한다."""

    return datetime.now(UTC).isoformat()


def replace_run_id(value: str, run_id: str) -> str:
    """문자열 안의 기존 run_id segment를 새 run_id로 바꾼다."""

    return re.sub(r"run_id=[^/]+", f"run_id={run_id}", value)


def should_fallback_to_local_runner(airflow_result: Week2RunnerResult) -> bool:
    """Airflow 결과가 성공이 아니면 local runner fallback이 필요한 것으로 판단한다."""

    return airflow_result.status != AIRFLOW_SUCCESS_STATUS


def result_with_logs(result: Week2RunnerResult, leading_logs: list[dict[str, str]]) -> Week2RunnerResult:
    """기존 runner 결과 앞에 fallback 또는 Airflow 로그를 붙인 새 결과를 만든다."""

    return Week2RunnerResult(
        status=result.status,
        task_results=result.task_results,
        logs=leading_logs + result.logs,
        row_count=result.row_count,
        bytes=result.bytes,
        duration_ms=result.duration_ms,
        output_path=result.output_path,
        output_row_count=result.output_row_count,
        output_bytes=result.output_bytes,
    )


def output_row_count(result: Week2RunnerResult) -> int | None:
    """Catalog metric에 쓸 output row count를 고르고 없으면 input row count로 대체한다."""

    return result.output_row_count if result.output_row_count is not None else result.row_count


def output_bytes(result: Week2RunnerResult) -> int | None:
    """Catalog metric에 쓸 output bytes를 고르고 없으면 input bytes로 대체한다."""

    return result.output_bytes if result.output_bytes is not None else result.bytes
