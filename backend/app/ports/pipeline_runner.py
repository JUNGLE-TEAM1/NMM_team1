from typing import Protocol


class PipelineRunner(Protocol):
    def run(self, pipeline_id: str) -> str: ...
