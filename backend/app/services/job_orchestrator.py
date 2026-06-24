from app.domain.target_contracts import JobRun
from app.ports.job_runner import JobRunner


class JobOrchestratorService:
    def __init__(self, runner: JobRunner) -> None:
        self.runner = runner

    def run_schema_discovery(self, dataset_id: str) -> JobRun:
        return self.runner.run(job_type="schema_discovery", dataset_id=dataset_id)
