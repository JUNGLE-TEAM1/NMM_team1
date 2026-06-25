import gzip
import json
import re
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

from app.domain.schemas import (
    CatalogDataset,
    CatalogMetadataDraft,
    ColumnSchema,
    GoldMetric,
    GoldRecommendation,
    JsonFieldProfile,
    JsonProfile,
    JsonRecommendationBundle,
    SilverRecommendation,
    SilverRecommendationColumn,
    SilverUserDecision,
    SourceCreate,
)


DEFAULT_SAMPLE_SIZE = 10
DEFAULT_MAX_SCAN_ROWS = 1000
MAX_IN_MEMORY_JSON_BYTES = 20 * 1024 * 1024


class JsonInspectionError(ValueError):
    pass


class JsonSourceConnector:
    source_type = "json"

    def inspect(self, source: SourceCreate) -> tuple[list[ColumnSchema], int, list[dict[str, object]]]:
        profile, rows = inspect_json(source.path)
        schema = [ColumnSchema(name=field.target_name, type=field.inferred_type) for field in profile.fields]
        return schema, profile.sampled_rows, rows

    def read_rows(self, dataset: CatalogDataset) -> tuple[list[ColumnSchema], list[dict[str, object]]]:
        profile, rows = inspect_json(dataset.path, max_scan_rows=DEFAULT_MAX_SCAN_ROWS)
        schema = [ColumnSchema(name=field.target_name, type=field.inferred_type) for field in profile.fields]
        return schema, rows


@dataclass
class FieldStats:
    source_path: str
    target_name: str
    type_counts: Counter[str] = field(default_factory=Counter)
    observed_count: int = 0
    sample_values: list[object] = field(default_factory=list)
    array: bool = False
    nested: bool = False

    def observe(self, value: object) -> None:
        self.observed_count += 1
        self.type_counts[infer_value_type(value)] += 1
        if isinstance(value, list):
            self.array = True
        if isinstance(value, (dict, list)):
            self.nested = True
        if value is not None and len(self.sample_values) < 3:
            self.sample_values.append(to_catalog_value(value))

    def profile(self, total_rows: int) -> JsonFieldProfile:
        inferred_type = infer_profile_type(self.type_counts)
        missing_count = max(total_rows - self.observed_count, 0)
        return JsonFieldProfile(
            source_path=self.source_path,
            target_name=self.target_name,
            inferred_type=inferred_type,
            observed_count=self.observed_count,
            missing_count=missing_count,
            nullable=missing_count > 0 or self.type_counts.get("null", 0) > 0,
            array=self.array,
            nested=self.nested,
            sample_values=self.sample_values,
        )


def inspect_json(
    path: str,
    sample_size: int = DEFAULT_SAMPLE_SIZE,
    max_scan_rows: int = DEFAULT_MAX_SCAN_ROWS,
) -> tuple[JsonProfile, list[dict[str, object]]]:
    resolved = resolve_json_path(path)
    record_path, records, file_format, sample_limited = read_json_records(resolved, max_scan_rows)
    if not records:
        raise JsonInspectionError(f"JSON file has no records: {path}")

    stats: dict[str, FieldStats] = {}
    sample_rows: list[dict[str, object]] = []
    for record in records:
        flattened = flatten_record(record)
        if len(sample_rows) < sample_size:
            sample_rows.append(
                {source_path: to_catalog_value(value) for source_path, (_, value) in flattened.items()}
            )
        for source_path, (target_name, value) in flattened.items():
            stats.setdefault(source_path, FieldStats(source_path, target_name)).observe(value)

    assign_unique_target_names(stats)
    total_rows = len(records)
    fields = [stats[path].profile(total_rows) for path in sorted(stats)]
    profile = JsonProfile(
        dataset_id="",
        format=file_format,
        record_path=record_path,
        sampled_rows=total_rows,
        sample_limited=sample_limited,
        fields=fields,
    )
    return profile, align_rows_to_fields(sample_rows, fields)


def resolve_json_path(path: str) -> Path:
    requested = Path(path)
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

    raise JsonInspectionError(f"JSON file not found: {path}")


def read_json_records(path: Path, max_scan_rows: int) -> tuple[str, list[object], str, bool]:
    if is_json_lines_path(path):
        records, limited = read_json_lines_sample(path, max_scan_rows)
        return "$lines[*]", records, "jsonl", limited

    size = path.stat().st_size
    first_char = peek_first_non_space(path)
    if first_char == "[":
        records, limited = read_json_array_sample(path, max_scan_rows)
        return "$[*]", records, "json_array", limited

    if size > MAX_IN_MEMORY_JSON_BYTES:
        raise JsonInspectionError(
            "Large JSON object files must be JSONL/NDJSON or a top-level array for sampled inspection"
        )

    try:
        with open_text(path) as json_file:
            payload = json.load(json_file)
    except UnicodeDecodeError as error:
        raise JsonInspectionError(f"JSON file must be UTF-8 encoded: {path}") from error
    except json.JSONDecodeError as error:
        raise JsonInspectionError(f"Invalid JSON at line {error.lineno}: {path}") from error

    record_path, records = extract_records(payload)
    return record_path, records[:max_scan_rows], "json", len(records) > max_scan_rows


def is_json_lines_path(path: Path) -> bool:
    name = path.name.lower()
    return name.endswith(".jsonl") or name.endswith(".ndjson") or name.endswith(".jsonl.gz") or name.endswith(".ndjson.gz")


def open_text(path: Path):
    if path.name.lower().endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8")
    return path.open("r", encoding="utf-8")


def peek_first_non_space(path: Path) -> str:
    with open_text(path) as json_file:
        while True:
            char = json_file.read(1)
            if char == "":
                return ""
            if not char.isspace():
                return char


def read_json_lines_sample(path: Path, max_scan_rows: int) -> tuple[list[object], bool]:
    records: list[object] = []
    try:
        with open_text(path) as json_file:
            for line_number, line in enumerate(json_file, start=1):
                stripped = line.strip()
                if not stripped:
                    continue
                if len(records) >= max_scan_rows:
                    return records, True
                try:
                    records.append(json.loads(stripped))
                except json.JSONDecodeError as error:
                    raise JsonInspectionError(f"Invalid JSON line {line_number}: {path}") from error
        return records, False
    except UnicodeDecodeError as error:
        raise JsonInspectionError(f"JSON file must be UTF-8 encoded: {path}") from error


def read_json_array_sample(path: Path, max_scan_rows: int) -> tuple[list[object], bool]:
    decoder = json.JSONDecoder()
    records: list[object] = []

    try:
        with open_text(path) as json_file:
            first = read_next_non_space(json_file)
            if first != "[":
                raise JsonInspectionError(f"Expected top-level JSON array: {path}")

            buffer = ""
            first_value = True
            while True:
                buffer = fill_until_token(json_file, buffer, path)
                if first_value and buffer.startswith("]"):
                    return records, False
                if not first_value:
                    if buffer.startswith("]"):
                        return records, False
                    if not buffer.startswith(","):
                        raise JsonInspectionError(f"Invalid JSON array: expected comma or closing bracket: {path}")
                    buffer = fill_until_token(json_file, buffer[1:], path)
                    if buffer.startswith("]"):
                        raise JsonInspectionError(f"Invalid JSON array: trailing comma: {path}")

                if len(records) >= max_scan_rows:
                    return records, True

                value, index = decode_array_value(decoder, json_file, buffer, path)
                records.append(value)
                buffer = buffer[index:]
                first_value = False
    except UnicodeDecodeError as error:
        raise JsonInspectionError(f"JSON file must be UTF-8 encoded: {path}") from error


def fill_until_token(file_obj, buffer: str, path: Path) -> str:
    while True:
        buffer = buffer.lstrip()
        if buffer:
            return buffer
        chunk = file_obj.read(8192)
        if chunk == "":
            raise JsonInspectionError(f"Invalid JSON array: missing closing bracket: {path}")
        buffer += chunk


def decode_array_value(decoder: json.JSONDecoder, file_obj, buffer: str, path: Path) -> tuple[object, int]:
    last_error: json.JSONDecodeError | None = None
    while True:
        buffer = buffer.lstrip()
        try:
            return decoder.raw_decode(buffer)
        except json.JSONDecodeError as error:
            last_error = error
            chunk = file_obj.read(8192)
            if chunk == "":
                raise JsonInspectionError(f"Invalid JSON array: could not decode array value: {path}") from last_error
            buffer += chunk


def read_next_non_space(file_obj) -> str:
    while True:
        char = file_obj.read(1)
        if char == "":
            return ""
        if not char.isspace():
            return char


def extract_records(payload: object) -> tuple[str, list[object]]:
    if isinstance(payload, list):
        return "$[*]", payload
    if isinstance(payload, dict):
        candidates = find_list_candidates(payload)
        if candidates:
            path, values = max(candidates, key=lambda item: len(item[1]))
            return path, values
        return "$", [payload]
    return "$", [{"value": payload}]


def find_list_candidates(value: object, prefix: str = "$") -> list[tuple[str, list[object]]]:
    candidates: list[tuple[str, list[object]]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{prefix}.{key}"
            if isinstance(child, list) and child:
                candidates.append((f"{child_path}[*]", child))
            candidates.extend(find_list_candidates(child, child_path))
    elif isinstance(value, list):
        for child in value[:5]:
            candidates.extend(find_list_candidates(child, f"{prefix}[*]"))
    return candidates


def flatten_record(record: object) -> dict[str, tuple[str, object]]:
    flattened: dict[str, tuple[str, object]] = {}

    def visit(value: object, source_path: str) -> None:
        if isinstance(value, dict):
            if not value:
                flattened[source_path] = (normalize_field_name(source_path), {})
            for key, child in value.items():
                next_path = f"{source_path}.{key}" if source_path else key
                visit(child, next_path)
        elif isinstance(value, list):
            array_path = f"{source_path}[]"
            flattened[array_path] = (f"{normalize_field_name(source_path)}_json", value)
        else:
            flattened[source_path or "value"] = (normalize_field_name(source_path or "value"), value)

    visit(record, "")
    return flattened


def assign_unique_target_names(stats: dict[str, FieldStats]) -> None:
    seen: dict[str, int] = {}
    for source_path in sorted(stats):
        base_name = stats[source_path].target_name
        count = seen.get(base_name, 0) + 1
        seen[base_name] = count
        if count > 1:
            stats[source_path].target_name = f"{base_name}_{count}"


def normalize_field_name(path: str) -> str:
    name = path.replace("[]", "")
    name = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "_", name)
    name = re.sub(r"[^0-9A-Za-z]+", "_", name)
    name = re.sub(r"_+", "_", name).strip("_").lower()
    return name or "value"


def to_catalog_value(value: object) -> object:
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return value


def align_rows_to_fields(rows: list[dict[str, object]], fields: list[JsonFieldProfile]) -> list[dict[str, object]]:
    return [{field.target_name: row.get(field.source_path, "") for field in fields} for row in rows]


def infer_value_type(value: object) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int):
        return "integer"
    if isinstance(value, float):
        return "number"
    if isinstance(value, str):
        return "string"
    return "json"


def infer_profile_type(type_counts: Counter[str]) -> str:
    non_null = {key: count for key, count in type_counts.items() if key != "null"}
    if not non_null:
        return "string"
    if len(non_null) == 1:
        return next(iter(non_null))
    if set(non_null).issubset({"integer", "number"}):
        return "number"
    return "string"


def build_json_recommendation_bundle(dataset: CatalogDataset) -> JsonRecommendationBundle:
    profile, _ = inspect_json(dataset.path)
    profile.dataset_id = dataset.id
    bronze_metadata = build_bronze_catalog_metadata(dataset, profile)
    silver = build_silver_recommendation(dataset, profile)
    silver_metadata = build_silver_catalog_metadata(dataset, profile, silver)
    gold = build_gold_recommendation(silver)
    gold_metadata = build_gold_catalog_metadata(dataset, silver, gold)
    return JsonRecommendationBundle(
        profile=profile,
        bronze_catalog_metadata=bronze_metadata,
        silver_recommendation=silver,
        silver_catalog_metadata=silver_metadata,
        gold_recommendation=gold,
        gold_catalog_metadata=gold_metadata,
    )


def build_silver_recommendation(dataset: CatalogDataset, profile: JsonProfile) -> SilverRecommendation:
    columns: list[SilverRecommendationColumn] = []
    decisions: list[SilverUserDecision] = []
    for field_profile in profile.fields:
        target_type = recommended_silver_type(field_profile)
        include = not field_profile.array
        transform = recommended_transform(field_profile, target_type)
        confidence = 0.9 if include else 0.55
        if field_profile.array:
            decisions.append(
                SilverUserDecision(
                    source_path=field_profile.source_path,
                    decision="array_strategy",
                    options=["keep_json", "explode_child_table", "exclude"],
                    default="keep_json",
                    reason="array fields can change row grain and require user confirmation",
                )
            )
        columns.append(
            SilverRecommendationColumn(
                source_path=field_profile.source_path,
                target_name=field_profile.target_name,
                target_type=target_type,
                include=include,
                transform=transform,
                nullable=field_profile.nullable,
                confidence=confidence,
                reason=recommendation_reason(field_profile, target_type),
            )
        )

    return SilverRecommendation(
        recommendation_id=f"silver_rec_{dataset.id}",
        source_dataset_id=dataset.id,
        target_dataset_id=f"{dataset.name}_silver",
        record_path=profile.record_path,
        mode="wide_table",
        columns=columns,
        needs_user_decision=decisions,
    )


def recommended_silver_type(field_profile: JsonFieldProfile) -> str:
    if looks_like_timestamp(field_profile):
        return "timestamp"
    if field_profile.inferred_type == "number":
        return "float"
    return field_profile.inferred_type


def recommended_transform(field_profile: JsonFieldProfile, target_type: str) -> str:
    transforms: list[str] = []
    if "." in field_profile.source_path:
        transforms.append("flatten")
    if target_type != field_profile.inferred_type:
        transforms.append("cast")
    if field_profile.array:
        transforms.append("array_decision")
    return "_".join(transforms) if transforms else "keep"


def recommendation_reason(field_profile: JsonFieldProfile, target_type: str) -> str:
    if field_profile.array:
        return "array field requires a keep, explode, or exclude decision"
    if "." in field_profile.source_path and target_type != field_profile.inferred_type:
        return "nested field with type normalization"
    if "." in field_profile.source_path:
        return "nested scalar field can be flattened"
    if target_type == "timestamp":
        return "field name and type look like time data"
    return "scalar field can be included in the wide silver table"


def looks_like_timestamp(field_profile: JsonFieldProfile) -> bool:
    name = field_profile.target_name.lower()
    if not any(token in name for token in ("time", "date", "timestamp", "created", "updated")):
        return False
    return field_profile.inferred_type in {"integer", "number", "string"}


def build_gold_recommendation(silver: SilverRecommendation) -> GoldRecommendation:
    included = [column for column in silver.columns if column.include]
    dimension_columns = [
        column for column in included if column.target_type == "string" and looks_like_dimension(column.target_name)
    ]
    numeric_columns = [column for column in included if column.target_type in {"integer", "number", "float"}]
    timestamp_columns = [column for column in included if column.target_type == "timestamp"]

    if dimension_columns:
        group_by = [dimension_columns[0].target_name]
        metrics = [GoldMetric(name="row_count", function="count", column="*")]
        if numeric_columns:
            metrics.append(
                GoldMetric(name=f"avg_{numeric_columns[0].target_name}", function="avg", column=numeric_columns[0].target_name)
            )
        if timestamp_columns:
            metrics.append(
                GoldMetric(
                    name=f"latest_{timestamp_columns[0].target_name}",
                    function="max",
                    column=timestamp_columns[0].target_name,
                )
            )
        return GoldRecommendation(
            recommendation_id=f"gold_rec_{silver.source_dataset_id}",
            source_dataset_id=silver.target_dataset_id,
            target_dataset_id=f"{group_by[0]}_summary",
            type="dimension_summary",
            group_by=group_by,
            metrics=metrics,
            recommended_questions=[
                f"{group_by[0]}별 데이터 수는?",
                f"{group_by[0]}별 주요 수치 평균은?",
            ],
            confidence=0.78,
            reason="dimension-like string column is available for grouped analysis",
        )

    if timestamp_columns:
        time_column = timestamp_columns[0].target_name
        return GoldRecommendation(
            recommendation_id=f"gold_rec_{silver.source_dataset_id}",
            source_dataset_id=silver.target_dataset_id,
            target_dataset_id=f"{time_column}_daily_volume",
            type="time_trend",
            group_by=[f"date({time_column})"],
            metrics=[GoldMetric(name="row_count", function="count", column="*")],
            recommended_questions=["일자별 데이터 수는?", "최근 데이터 적재 추세는?"],
            confidence=0.68,
            reason="timestamp-like column is available but no clear dimension column was found",
        )

    return GoldRecommendation(
        recommendation_id=f"gold_rec_{silver.source_dataset_id}",
        source_dataset_id=silver.target_dataset_id,
        target_dataset_id=f"{silver.target_dataset_id}_quality_summary",
        type="data_quality_summary",
        group_by=[],
        metrics=[
            GoldMetric(name="row_count", function="count", column="*"),
            GoldMetric(name="column_count", function="count_columns"),
        ],
        recommended_questions=["데이터 행 수는?", "비어 있는 주요 컬럼은?"],
        confidence=0.52,
        reason="no strong dimension or timestamp column was found, so quality summary is safer",
    )


def looks_like_dimension(name: str) -> bool:
    lowered = name.lower()
    return lowered.endswith("_id") or lowered in {"id", "type", "status", "category", "name", "product_id"}


def build_bronze_catalog_metadata(dataset: CatalogDataset, profile: JsonProfile) -> CatalogMetadataDraft:
    return CatalogMetadataDraft(
        dataset_id=dataset.id,
        name=dataset.name,
        layer="bronze",
        record_path=profile.record_path,
        storage_uri=dataset.path,
        schema_fields=[field.model_dump() for field in profile.fields],
        metrics={
            "sampled_rows": profile.sampled_rows,
            "field_count": len(profile.fields),
            "sample_limited": profile.sample_limited,
        },
        quality={"passed_checks": ["json_parse", "schema_profile"], "failed_checks": []},
        lineage={"input_datasets": [], "source_path": dataset.path},
        status="profiled",
    )


def build_silver_catalog_metadata(
    dataset: CatalogDataset,
    profile: JsonProfile,
    silver: SilverRecommendation,
) -> CatalogMetadataDraft:
    included_columns = [column for column in silver.columns if column.include]
    return CatalogMetadataDraft(
        dataset_id=silver.target_dataset_id,
        name=silver.target_dataset_id,
        layer="silver",
        source_dataset_id=dataset.id,
        record_path=profile.record_path,
        schema_fields=[
            {
                "name": column.target_name,
                "source_path": column.source_path,
                "type": column.target_type,
                "nullable": column.nullable,
            }
            for column in included_columns
        ],
        metrics={"sampled_rows": profile.sampled_rows, "column_count": len(included_columns)},
        quality={
            "passed_checks": ["schema_profile"],
            "failed_checks": [],
            "warnings": [decision.reason for decision in silver.needs_user_decision],
        },
        lineage={"input_datasets": [dataset.id], "transform_task": "silver_normalize_task.json"},
        status="draft",
    )


def build_gold_catalog_metadata(
    dataset: CatalogDataset,
    silver: SilverRecommendation,
    gold: GoldRecommendation,
) -> CatalogMetadataDraft:
    schema = [{"name": name, "type": "string", "nullable": False} for name in gold.group_by]
    schema.extend({"name": metric.name, "type": "number", "nullable": True} for metric in gold.metrics)
    return CatalogMetadataDraft(
        dataset_id=gold.target_dataset_id,
        name=gold.target_dataset_id,
        layer="gold",
        source_dataset_id=silver.target_dataset_id,
        schema_fields=schema,
        metrics={"metric_count": len(gold.metrics), "group_by_count": len(gold.group_by)},
        quality={"passed_checks": ["recommendation_generated"], "failed_checks": []},
        lineage={"input_datasets": [silver.target_dataset_id], "transform_task": "gold_aggregate_task.json"},
        status="draft",
    )
