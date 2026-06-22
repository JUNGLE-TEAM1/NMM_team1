from typing import Protocol


class ResultStore(Protocol):
    def write_rows(self, dataset_id: str, rows: list[dict[str, object]]) -> str: ...

    def read_sample(self, location: str, limit: int = 5) -> list[dict[str, object]]: ...
