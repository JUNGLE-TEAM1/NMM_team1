from app.domain.schemas import ColumnSchema


class TransformError(ValueError):
    pass


def apply_select_fields(
    schema: list[ColumnSchema],
    rows: list[dict[str, object]],
    fields: list[str],
) -> tuple[list[ColumnSchema], list[dict[str, object]]]:
    missing_fields = find_missing_fields(schema, fields)
    if missing_fields:
        raise TransformError(f"Unknown select fields: {', '.join(missing_fields)}")

    by_name = {column.name: column for column in schema}
    selected_schema = [by_name[field] for field in fields]
    selected_rows = [{field: row.get(field, "") for field in fields} for row in rows]
    return selected_schema, selected_rows


def find_missing_fields(schema: list[ColumnSchema], fields: list[str]) -> list[str]:
    available_fields = {column.name for column in schema}
    return [field for field in fields if field not in available_fields]
