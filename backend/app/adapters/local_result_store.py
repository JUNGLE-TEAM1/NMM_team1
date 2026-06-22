import csv
from pathlib import Path


class LocalResultStore:
    def __init__(self, base_path: str = "data/results") -> None:
        self.base_path = Path(base_path)

    def write_rows(self, dataset_id: str, rows: list[dict[str, object]]) -> str:
        self.base_path.mkdir(parents=True, exist_ok=True)
        location = self.base_path / f"{dataset_id}.csv"
        fieldnames = list(rows[0].keys()) if rows else []

        with location.open("w", newline="", encoding="utf-8") as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

        return str(location)

    def read_sample(self, location: str, limit: int = 5) -> list[dict[str, object]]:
        rows: list[dict[str, object]] = []
        with Path(location).open(newline="", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                rows.append(dict(row))
                if len(rows) >= limit:
                    break
        return rows
