import csv
from pathlib import Path

from app.schemas import ColumnSchema


class CsvInspectionError(ValueError):
    pass


def resolve_source_path(path: str) -> Path:
    requested = Path(path)
    candidates: list[Path]

    if requested.is_absolute():
        candidates = [requested]
    else:
        candidates = [
            Path.cwd() / requested,
            Path.cwd() / "backend" / requested,
            Path(__file__).resolve().parents[1] / requested,
            Path("/app") / requested,
        ]

    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return candidate.resolve()

    raise CsvInspectionError(f"CSV file not found: {path}")


def inspect_csv(path: str, sample_size: int = 5) -> tuple[list[ColumnSchema], int, list[dict[str, object]]]:
    resolved = resolve_source_path(path)
    rows: list[dict[str, str]] = []
    row_count = 0

    try:
        with resolved.open(newline="", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)
            if not reader.fieldnames:
                raise CsvInspectionError(f"CSV file has no header: {path}")

            fieldnames = [field.strip() for field in reader.fieldnames]
            values_by_column: dict[str, list[str]] = {field: [] for field in fieldnames}

            for row in reader:
                cleaned = {field: (row.get(field) or "") for field in fieldnames}
                row_count += 1
                if len(rows) < sample_size:
                    rows.append(cleaned)
                for field, value in cleaned.items():
                    if value != "":
                        values_by_column[field].append(value)
    except UnicodeDecodeError as error:
        raise CsvInspectionError(f"CSV file must be UTF-8 encoded: {path}") from error

    schema = [
        ColumnSchema(name=field, type=infer_column_type(values_by_column[field]))
        for field in fieldnames
    ]
    return schema, row_count, [coerce_row(row, schema) for row in rows]


def infer_column_type(values: list[str]) -> str:
    if not values:
        return "string"
    if all(is_bool(value) for value in values):
        return "boolean"
    if all(is_int(value) for value in values):
        return "integer"
    if all(is_number(value) for value in values):
        return "number"
    return "string"


def coerce_row(row: dict[str, str], schema: list[ColumnSchema]) -> dict[str, object]:
    typed: dict[str, object] = {}
    schema_by_name = {column.name: column.type for column in schema}
    for key, value in row.items():
        column_type = schema_by_name.get(key, "string")
        if value == "":
            typed[key] = ""
        elif column_type == "integer":
            typed[key] = int(value)
        elif column_type == "number":
            typed[key] = float(value)
        elif column_type == "boolean":
            typed[key] = value.lower() in {"true", "yes", "1"}
        else:
            typed[key] = value
    return typed


def is_int(value: str) -> bool:
    try:
        int(value)
    except ValueError:
        return False
    return True


def is_number(value: str) -> bool:
    try:
        float(value)
    except ValueError:
        return False
    return True


def is_bool(value: str) -> bool:
    return value.lower() in {"true", "false", "yes", "no", "0", "1"}
