from app.domain.target_contracts import AuditEvent, JobRun, now_iso


class InMemoryJobRunner:
    def __init__(self) -> None:
        self.audit_events: list[AuditEvent] = []

    def run(self, job_type: str, dataset_id: str) -> JobRun:
        run = JobRun(
            job_type=job_type,
            status="succeeded",
            dataset_id=dataset_id,
            idempotency_key=f"{job_type}:{dataset_id}",
            finished_at=now_iso(),
        )
        self.audit_events.append(
            AuditEvent(
                actor="system",
                action=f"job.{job_type}.succeeded",
                resource_ref=run.id,
            )
        )
        return run
