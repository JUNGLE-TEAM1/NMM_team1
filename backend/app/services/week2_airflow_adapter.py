from typing import Any

from app.services.week2_local_runner import Week2RunnerResult


class Week2AirflowError(RuntimeError):
    pass


class Week2AirflowUnavailableError(Week2AirflowError):
    pass


class Week2AirflowAdapter:
    def run(self, workflow_definition: dict[str, Any], run_id: str) -> Week2RunnerResult:
        raise Week2AirflowUnavailableError("Week 2 Airflow adapter is not configured")
