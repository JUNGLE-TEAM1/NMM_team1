from typing import Protocol

from app.domain.target_contracts import JobRun


class JobRunner(Protocol):
    def run(self, job_type: str, dataset_id: str) -> JobRun: ...
