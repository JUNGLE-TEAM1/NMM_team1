#!/usr/bin/env python3
"""Generate PH-DATA-1 Product Health synthetic smoke outputs."""

from __future__ import annotations

import csv
import json
import random
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import duckdb
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq


ROOT = Path("data/local_sources/product_health")
RAW = ROOT / "raw"
SILVER = ROOT / "silver"
GOLD = ROOT / "gold"
CATALOG = ROOT / "catalog"
EVIDENCE = ROOT / "evidence"

RANDOM_SEED = 20260630
RUN_ID = "run_product_health_smoke_001"
PIPELINE_ID = "pipeline_product_health_e2e"
DATASET_ID = "dataset_product_health_gold"
GOLD_TABLE = "gold_product_health"
SOURCE_HANDOFF_FILE = "product_health_source_handoff.json"
SOURCE_HANDOFF_PATH = CATALOG / SOURCE_HANDOFF_FILE

TARGET_PRODUCTS = 1000
BEHAVIOR_ROW_LIMIT = 500_000
REVIEW_ROW_LIMIT = 100_000
DELIVERY_ROW_LIMIT = 100_000

COMPRESSION = "snappy"

SCENARIO_BUCKETS = [
    {
        "bucket": "review_delivery_risk",
        "driver": "negative_reviews|late_delivery",
        "label": "Beauty / Skin Care Sets",
        "reason": "Low-rating Amazon reviews and delayed Taxi trips are assigned to the same Product Health scenario.",
    },
    {
        "bucket": "high_view_low_conversion",
        "driver": "conversion_drop|high_views",
        "label": "Electronics / Smartphone Accessories",
        "reason": "High-traffic commerce products are assigned low purchase conversion to show funnel risk.",
    },
    {
        "bucket": "quality_complaint",
        "driver": "quality_issue|negative_reviews",
        "label": "Home / Small Appliances",
        "reason": "Low-rating VOC records are assigned to a quality complaint scenario bucket.",
    },
    {
        "bucket": "healthy_baseline",
        "driver": "healthy_conversion|low_complaint|stable_delivery",
        "label": "Daily Goods / Stable Sellers",
        "reason": "Healthy control products keep stronger conversion, lower complaints, and lower delivery delay.",
    },
]

SOURCE_DATASET_MAP = {
    "behavior": {
        "connection_id": "conn_product_health_local_sources",
        "source_dataset_id": "source_ecommerce_behavior_events",
    },
    "review": {
        "connection_id": "conn_product_health_local_sources",
        "source_dataset_id": "source_amazon_product_reviews",
    },
    "review_metadata": {
        "connection_id": "conn_product_health_local_sources",
        "source_dataset_id": "source_amazon_product_metadata",
    },
    "product_catalog": {
        "connection_id": "conn_product_health_local_sources",
        "source_dataset_id": "source_mep_product_catalog",
    },
    "delivery": {
        "connection_id": "conn_taxi_postgres",
        "source_dataset_id": "source_taxi_delivery_logs",
    },
}


def scenario_for_index(index: int) -> dict[str, str]:
    if index < 150:
        return SCENARIO_BUCKETS[0]
    if index < 300:
        return SCENARIO_BUCKETS[1]
    if index < 450:
        return SCENARIO_BUCKETS[2]
    return SCENARIO_BUCKETS[3]


def ensure_dirs() -> None:
    for path in (SILVER, GOLD, CATALOG, EVIDENCE):
        path.mkdir(parents=True, exist_ok=True)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_parquet(frame: pd.DataFrame, path: Path) -> dict[str, Any]:
    table = pa.Table.from_pandas(frame, preserve_index=False)
    pq.write_table(table, path, compression=COMPRESSION)
    return {
        "path": str(path),
        "row_count": len(frame),
        "bytes": path.stat().st_size,
        "bytes_semantics": "output_dataset_bytes",
        "format": "parquet",
    }


def source_inventory_bytes(path: Path) -> dict[str, Any]:
    bytes_value = path.stat().st_size
    return {
        "bytes": bytes_value,
        "bytes_semantics": "available_source_bytes",
        "available_source_bytes": bytes_value,
        "processed_input_bytes": None,
        "processed_input_bytes_status": "not_byte_measured_in_smoke_row_limited_read",
    }


def source_inventory_bytes_for_files(files: list[Path]) -> dict[str, Any]:
    bytes_value = sum(file.stat().st_size for file in files)
    return {
        "bytes": bytes_value,
        "bytes_semantics": "available_source_bytes",
        "available_source_bytes": bytes_value,
        "processed_input_bytes": None,
        "processed_input_bytes_status": "not_byte_measured_in_smoke_row_limited_read",
    }


def normalize_category(category_code: Any, category_id: Any) -> str:
    if isinstance(category_code, str) and category_code.strip():
        return category_code.strip()
    return f"category_id:{category_id}"


def compact_text(value: Any) -> str:
    if isinstance(value, list):
        return " ".join(str(item) for item in value if item)
    if value is None:
        return ""
    return str(value)


def load_behavior() -> tuple[pd.DataFrame, dict[str, Any]]:
    start = time.perf_counter()
    path = RAW / "kaggle_ecommerce_behavior/2019-Oct.csv"
    frame = pd.read_csv(
        path,
        nrows=BEHAVIOR_ROW_LIMIT,
        dtype={
            "product_id": "string",
            "category_id": "string",
            "category_code": "string",
            "brand": "string",
            "user_id": "string",
            "user_session": "string",
        },
    )
    frame["event_at"] = pd.to_datetime(frame["event_time"], utc=True, errors="coerce")
    frame = frame.dropna(subset=["event_at", "product_id", "event_type"]).copy()
    frame["category_normalized"] = [
        normalize_category(code, category_id)
        for code, category_id in zip(frame["category_code"], frame["category_id"], strict=False)
    ]
    frame["event_price"] = pd.to_numeric(frame["price"], errors="coerce")

    product_counts = frame["product_id"].value_counts()
    selected_products = list(product_counts.head(TARGET_PRODUCTS).index)
    frame = frame[frame["product_id"].isin(selected_products)].copy()
    source = {
        "source": "behavior",
        "path": str(path),
        "row_count_sample": int(len(frame)),
        "duration_ms": int((time.perf_counter() - start) * 1000),
        **source_inventory_bytes(path),
    }
    return frame, source


def load_amazon_reviews(selected_parent_asins: list[str]) -> tuple[pd.DataFrame, dict[str, Any]]:
    start = time.perf_counter()
    path = RAW / "amazon_reviews_2023/raw/review_categories/All_Beauty.jsonl"
    rows: list[dict[str, Any]] = []
    selected_set = set(selected_parent_asins)
    with path.open(encoding="utf-8") as file:
        for line in file:
            obj = json.loads(line)
            parent_asin = obj.get("parent_asin")
            if parent_asin not in selected_set:
                continue
            rows.append(obj)
            if len(rows) >= REVIEW_ROW_LIMIT:
                break
    frame = pd.DataFrame(rows)
    if frame.empty:
        frame = pd.DataFrame(columns=["parent_asin", "rating", "title", "text", "timestamp", "verified_purchase", "helpful_vote"])
    frame["timestamp"] = pd.to_numeric(frame.get("timestamp"), errors="coerce")
    frame["review_at"] = pd.to_datetime(frame["timestamp"], unit="ms", utc=True, errors="coerce")
    frame["rating"] = pd.to_numeric(frame.get("rating"), errors="coerce")
    source = {
        "source": "review",
        "path": str(path),
        "row_count_sample": int(len(frame)),
        "duration_ms": int((time.perf_counter() - start) * 1000),
        **source_inventory_bytes(path),
    }
    return frame, source


def load_amazon_metadata(selected_parent_asins: list[str]) -> tuple[pd.DataFrame, dict[str, Any]]:
    start = time.perf_counter()
    path = RAW / "amazon_reviews_2023/raw/meta_categories/meta_All_Beauty.jsonl"
    selected_set = set(selected_parent_asins)
    rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as file:
        for line in file:
            obj = json.loads(line)
            if obj.get("parent_asin") in selected_set:
                rows.append(obj)
            if len(rows) >= len(selected_parent_asins):
                break
    frame = pd.DataFrame(rows)
    source = {
        "source": "review_metadata",
        "path": str(path),
        "row_count_sample": int(len(frame)),
        "duration_ms": int((time.perf_counter() - start) * 1000),
        **source_inventory_bytes(path),
    }
    return frame, source


def load_mep_catalog() -> tuple[pd.DataFrame, dict[str, Any]]:
    start = time.perf_counter()
    path = RAW / "mep_3m/annotations-1k.json"
    with path.open(encoding="utf-8") as file:
        rows = json.load(file)
    frame = pd.DataFrame(rows).head(TARGET_PRODUCTS).copy()
    frame["mep_product_id"] = frame.index.map(lambda idx: f"mep_{idx + 1:06d}")
    source = {
        "source": "product_catalog",
        "path": str(path),
        "row_count_sample": int(len(frame)),
        "duration_ms": int((time.perf_counter() - start) * 1000),
        **source_inventory_bytes(path),
    }
    return frame, source


def collect_amazon_parent_asins(limit: int) -> list[str]:
    path = RAW / "amazon_reviews_2023/raw/meta_categories/meta_All_Beauty.jsonl"
    parent_asins: list[str] = []
    with path.open(encoding="utf-8") as file:
        for line in file:
            parent_asin = json.loads(line).get("parent_asin")
            if parent_asin:
                parent_asins.append(str(parent_asin))
            if len(parent_asins) >= limit:
                break
    return parent_asins


def build_seed_mapping(behavior: pd.DataFrame, mep: pd.DataFrame) -> pd.DataFrame:
    product_ids = sorted(behavior["product_id"].dropna().astype(str).unique())[:TARGET_PRODUCTS]
    parent_asins = collect_amazon_parent_asins(len(product_ids))
    mep_ids = list(mep["mep_product_id"])
    category_by_product = (
        behavior.groupby("product_id")["category_normalized"]
        .agg(lambda values: values.mode().iat[0] if not values.mode().empty else values.iloc[0])
        .to_dict()
    )

    rows: list[dict[str, Any]] = []
    for idx, product_id in enumerate(product_ids):
        scenario = scenario_for_index(idx)
        rows.append(
            {
                "internal_product_id": f"aph_prod_{idx + 1:06d}",
                "ecommerce_product_id": str(product_id),
                "amazon_parent_asin": parent_asins[idx % len(parent_asins)] if parent_asins else None,
                "mep_product_id": mep_ids[idx % len(mep_ids)] if mep_ids else None,
                "category_normalized": str(category_by_product.get(product_id, "unknown")),
                "mapping_method": "synthetic_seed",
                "mapping_confidence": 0.62,
                "scenario_bucket": scenario["bucket"],
                "risk_driver": scenario["driver"],
                "mapping_reason": scenario["reason"],
                "demo_category_label": scenario["label"],
            }
        )
    return pd.DataFrame(rows)


def make_silver_user_events(behavior: pd.DataFrame, mapping: pd.DataFrame) -> pd.DataFrame:
    frame = behavior.merge(
        mapping[["internal_product_id", "ecommerce_product_id"]],
        left_on="product_id",
        right_on="ecommerce_product_id",
        how="inner",
    )
    return pd.DataFrame(
        {
            "event_at": frame["event_at"],
            "event_date": frame["event_at"].dt.date,
            "event_type": frame["event_type"].astype("string"),
            "internal_product_id": frame["internal_product_id"].astype("string"),
            "source_product_id": frame["product_id"].astype("string"),
            "category_id": frame["category_id"].astype("string"),
            "category_code": frame["category_code"].fillna("").astype("string"),
            "brand": frame["brand"].fillna("unknown").astype("string"),
            "event_price": frame["event_price"].astype("float64"),
            "user_id": frame["user_id"].astype("string"),
            "session_id": frame["user_session"].astype("string"),
        }
    )


def sentiment_from_rating(rating: float) -> str:
    if pd.isna(rating):
        return "neutral"
    if rating <= 2:
        return "negative"
    if rating == 3:
        return "neutral"
    return "positive"


def complaint_topic(text: Any, rating: float) -> str | None:
    if pd.isna(rating) or rating >= 4:
        return None
    lowered = str(text or "").lower()
    rules = [
        ("delivery_packaging", ["broken", "leak", "package", "shipping", "arrived"]),
        ("quality_issue", ["bad", "poor", "cheap", "defective", "doesn't work", "not work"]),
        ("scent_or_texture", ["smell", "scent", "texture", "sticky", "greasy"]),
        ("value_price", ["price", "expensive", "waste", "money"]),
    ]
    for topic, keywords in rules:
        if any(keyword in lowered for keyword in keywords):
            return topic
    return "general_complaint"


def make_silver_reviews(reviews: pd.DataFrame, mapping: pd.DataFrame) -> pd.DataFrame:
    frame = reviews.merge(
        mapping[["internal_product_id", "amazon_parent_asin"]],
        left_on="parent_asin",
        right_on="amazon_parent_asin",
        how="inner",
    )
    if frame.empty:
        return pd.DataFrame(
            columns=[
                "review_at",
                "review_date",
                "internal_product_id",
                "amazon_parent_asin",
                "rating",
                "review_title",
                "review_text",
                "verified_purchase",
                "helpful_vote",
                "review_sentiment",
                "complaint_topic",
            ]
        )
    frame["review_sentiment"] = frame["rating"].map(sentiment_from_rating)
    frame["complaint_topic"] = [
        complaint_topic(text, rating)
        for text, rating in zip(frame.get("text"), frame["rating"], strict=False)
    ]
    return pd.DataFrame(
        {
            "review_at": frame["review_at"],
            "review_date": frame["review_at"].dt.date,
            "internal_product_id": frame["internal_product_id"].astype("string"),
            "amazon_parent_asin": frame["amazon_parent_asin"].astype("string"),
            "rating": frame["rating"].astype("float64"),
            "review_title": frame.get("title", "").astype("string"),
            "review_text": frame.get("text", "").astype("string"),
            "verified_purchase": frame.get("verified_purchase", False).astype("boolean"),
            "helpful_vote": pd.to_numeric(frame.get("helpful_vote", 0), errors="coerce").fillna(0).astype("int64"),
            "review_sentiment": frame["review_sentiment"].astype("string"),
            "complaint_topic": pd.Series(frame["complaint_topic"], dtype="string"),
        }
    )


def image_path_from_mep(value: Any) -> str | None:
    text = str(value or "")
    return text if text else None


def make_silver_catalog(mep: pd.DataFrame, metadata: pd.DataFrame, mapping: pd.DataFrame) -> pd.DataFrame:
    frame = mapping.merge(mep, on="mep_product_id", how="left")
    meta = metadata[["parent_asin", "title", "description", "store", "categories"]].copy() if not metadata.empty else pd.DataFrame()
    if not meta.empty:
        frame = frame.merge(meta, left_on="amazon_parent_asin", right_on="parent_asin", how="left", suffixes=("_mep", "_amazon"))
    else:
        frame["title_amazon"] = None
        frame["description"] = None
        frame["store"] = None
        frame["categories"] = None
    title_mep = frame["title_mep"] if "title_mep" in frame else frame.get("title", pd.Series([None] * len(frame)))
    title_amazon = frame.get("title_amazon", pd.Series([None] * len(frame)))
    product_title = title_mep.fillna(title_amazon).fillna("Unknown Product")
    category_l1 = frame["category_normalized"].astype("string").str.split(".").str[0]
    category_l2 = frame["category_normalized"].astype("string").str.split(".").str[1].fillna(frame.get("class_name", "unknown"))
    category_l3 = frame["category_normalized"].astype("string").str.split(".").str[2].fillna(frame.get("sub_class_name", "unknown"))
    return pd.DataFrame(
        {
            "internal_product_id": frame["internal_product_id"].astype("string"),
            "product_title": product_title.astype("string"),
            "category_l1": category_l1.astype("string"),
            "category_l2": category_l2.astype("string"),
            "category_l3": category_l3.astype("string"),
            "brand": frame.get("store", pd.Series(["unknown"] * len(frame))).fillna("unknown").astype("string"),
            "product_image_path": frame.get("img_path", pd.Series([None] * len(frame))).map(image_path_from_mep).astype("string"),
            "product_text": [
                " ".join(part for part in [compact_text(title), compact_text(desc), compact_text(ocr)] if part).strip()
                for title, desc, ocr in zip(product_title, frame.get("description"), frame.get("OCR"), strict=False)
            ],
            "source_catalog": "synthetic_merge",
            "source_product_id": frame["mep_product_id"].astype("string"),
        }
    )


def load_delivery(mapping: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, Any]]:
    start = time.perf_counter()
    path = RAW / "taxi_existing/yellow_tripdata_2019_2025"
    files = sorted(path.glob("*.parquet"))
    selected_files = [file for file in files if "2019-" in file.name][:3] or files[:3]
    con = duckdb.connect(database=":memory:")
    file_list = [str(file) for file in selected_files]
    query = """
        select
          row_number() over () as delivery_seq,
          tpep_pickup_datetime as delivery_started_at,
          tpep_dropoff_datetime as delivered_at,
          cast(PULocationID as varchar) as fulfillment_zone_id,
          cast(DOLocationID as varchar) as customer_zone_id,
          cast(trip_distance as double) as delivery_distance,
          cast(total_amount as double) as total_delivery_cost,
          cast(VendorID as varchar) as carrier_id
        from read_parquet(?)
        where tpep_pickup_datetime >= timestamp '2019-01-01'
          and tpep_pickup_datetime < timestamp '2020-01-01'
          and tpep_dropoff_datetime > tpep_pickup_datetime
          and trip_distance > 0
          and total_amount >= 0
        limit ?
    """
    frame = con.execute(query, [file_list, DELIVERY_ROW_LIMIT]).fetchdf()
    ids = list(mapping["internal_product_id"])
    rng = random.Random(RANDOM_SEED)
    frame["internal_product_id"] = [ids[idx % len(ids)] for idx in range(len(frame))]
    boost_set = set(rng.sample(ids, min(80, len(ids))))
    frame["delivery_duration_minutes"] = (
        (pd.to_datetime(frame["delivered_at"]) - pd.to_datetime(frame["delivery_started_at"]))
        .dt.total_seconds()
        .div(60)
    )
    frame = frame[(frame["delivery_duration_minutes"] > 0) & (frame["delivery_duration_minutes"] <= 240)].copy()
    frame["delivery_date"] = pd.to_datetime(frame["delivered_at"]).dt.date
    frame["is_late_delivery"] = (
        (frame["delivery_duration_minutes"] > 45) | frame["internal_product_id"].isin(boost_set)
    )
    frame["delivery_trip_id"] = frame["delivery_seq"].map(lambda value: f"ship_{int(value):09d}")
    silver = pd.DataFrame(
        {
            "delivery_trip_id": frame["delivery_trip_id"].astype("string"),
            "delivery_started_at": pd.to_datetime(frame["delivery_started_at"], utc=True),
            "delivered_at": pd.to_datetime(frame["delivered_at"], utc=True),
            "delivery_date": frame["delivery_date"],
            "internal_product_id": frame["internal_product_id"].astype("string"),
            "fulfillment_zone_id": frame["fulfillment_zone_id"].astype("string"),
            "customer_zone_id": frame["customer_zone_id"].astype("string"),
            "delivery_distance": frame["delivery_distance"].astype("float64"),
            "total_delivery_cost": frame["total_delivery_cost"].astype("float64"),
            "delivery_duration_minutes": frame["delivery_duration_minutes"].astype("float64"),
            "carrier_id": frame["carrier_id"].astype("string"),
            "is_late_delivery": frame["is_late_delivery"].astype("bool"),
        }
    )
    source = {
        "source": "delivery",
        "path": str(path / "*.parquet"),
        "input_files": [str(file) for file in selected_files],
        "row_count_sample": int(len(silver)),
        "duration_ms": int((time.perf_counter() - start) * 1000),
        **source_inventory_bytes_for_files(files),
        "filters": [
            "2019 demo window",
            "drop non-positive duration",
            "drop non-positive distance",
            "drop negative total amount",
            "duration <= 240 minutes",
        ],
    }
    return silver, source


def top_topics(values: pd.Series) -> list[str]:
    topics = [str(value) for value in values.dropna() if str(value)]
    return [topic for topic, _ in Counter(topics).most_common(3)]


def build_gold(
    events: pd.DataFrame,
    reviews: pd.DataFrame,
    catalog: pd.DataFrame,
    delivery: pd.DataFrame,
    mapping: pd.DataFrame,
) -> pd.DataFrame:
    event_agg = events.groupby("internal_product_id").agg(
        view_count=("event_type", lambda s: int((s == "view").sum())),
        cart_count=("event_type", lambda s: int((s == "cart").sum())),
        purchase_count=("event_type", lambda s: int((s == "purchase").sum())),
        estimated_revenue=("event_price", lambda s: float(events.loc[s.index][events.loc[s.index, "event_type"] == "purchase"]["event_price"].sum())),
        source_row_count_behavior=("event_type", "size"),
    )
    event_agg["conversion_rate"] = (
        event_agg["purchase_count"] / event_agg["view_count"].replace(0, pd.NA)
    ).fillna(0.0)

    if reviews.empty:
        review_agg = pd.DataFrame(index=event_agg.index)
        review_agg["avg_rating"] = pd.NA
        review_agg["review_count"] = 0
        review_agg["negative_review_rate"] = 0.0
        review_agg["top_complaint_topics"] = [[] for _ in range(len(review_agg))]
        review_agg["source_row_count_reviews"] = 0
    else:
        review_agg = reviews.groupby("internal_product_id").agg(
            avg_rating=("rating", "mean"),
            review_count=("rating", "size"),
            negative_reviews=("review_sentiment", lambda s: int((s == "negative").sum())),
            top_complaint_topics=("complaint_topic", top_topics),
            source_row_count_reviews=("rating", "size"),
        )
        review_agg["negative_review_rate"] = (
            review_agg["negative_reviews"] / review_agg["review_count"].replace(0, pd.NA)
        ).fillna(0.0)
        review_agg = review_agg.drop(columns=["negative_reviews"])

    delivery_agg = delivery.groupby("internal_product_id").agg(
        delivery_count=("delivery_trip_id", "size"),
        avg_delivery_duration_minutes=("delivery_duration_minutes", "mean"),
        late_deliveries=("is_late_delivery", lambda s: int(s.sum())),
        avg_delivery_cost=("total_delivery_cost", "mean"),
        source_row_count_delivery=("delivery_trip_id", "size"),
    )
    delivery_agg["late_delivery_rate"] = (
        delivery_agg["late_deliveries"] / delivery_agg["delivery_count"].replace(0, pd.NA)
    ).fillna(0.0)
    delivery_agg = delivery_agg.drop(columns=["late_deliveries"])

    gold = (
        mapping.set_index("internal_product_id")
        .join(event_agg, how="left")
        .join(review_agg, how="left")
        .join(delivery_agg, how="left")
        .reset_index()
    )
    gold = gold.merge(catalog, on="internal_product_id", how="left")
    for column in [
        "view_count",
        "cart_count",
        "purchase_count",
        "estimated_revenue",
        "conversion_rate",
        "review_count",
        "negative_review_rate",
        "delivery_count",
        "late_delivery_rate",
        "source_row_count_behavior",
        "source_row_count_reviews",
        "source_row_count_delivery",
    ]:
        gold[column] = gold[column].fillna(0)

    gold = apply_scenario_calibration(gold)

    conversion = gold["conversion_rate"].astype(float)
    min_conversion = conversion.min()
    max_conversion = conversion.max()
    if max_conversion == min_conversion:
        conversion_norm = pd.Series([0.5] * len(gold), index=gold.index)
    else:
        conversion_norm = (conversion - min_conversion) / (max_conversion - min_conversion)
    gold["risk_score"] = (
        100
        * (
            0.4 * (1 - conversion_norm)
            + 0.35 * gold["negative_review_rate"].astype(float)
            + 0.25 * gold["late_delivery_rate"].astype(float)
        )
    ).round(2)
    period_start = events["event_date"].min()
    period_end = events["event_date"].max()
    gold["period_start"] = period_start
    gold["period_end"] = period_end
    gold["category_id"] = gold["category_normalized"]
    gold["top_complaint_topics"] = gold["top_complaint_topics"].apply(
        lambda value: value if isinstance(value, list) and value else ["none"]
    )
    ordered = [
        "period_start",
        "period_end",
        "internal_product_id",
        "category_id",
        "category_l1",
        "category_l2",
        "brand",
        "product_title",
        "view_count",
        "cart_count",
        "purchase_count",
        "estimated_revenue",
        "conversion_rate",
        "avg_rating",
        "review_count",
        "negative_review_rate",
        "top_complaint_topics",
        "delivery_count",
        "avg_delivery_duration_minutes",
        "late_delivery_rate",
        "avg_delivery_cost",
        "risk_score",
        "source_row_count_behavior",
        "source_row_count_reviews",
        "source_row_count_delivery",
        "mapping_method",
        "scenario_bucket",
        "risk_driver",
        "mapping_reason",
        "demo_category_label",
    ]
    return gold[ordered]


def apply_scenario_calibration(gold: pd.DataFrame) -> pd.DataFrame:
    calibrated = gold.copy()

    review_delivery = calibrated["scenario_bucket"] == "review_delivery_risk"
    high_view = calibrated["scenario_bucket"] == "high_view_low_conversion"
    quality = calibrated["scenario_bucket"] == "quality_complaint"
    healthy = calibrated["scenario_bucket"] == "healthy_baseline"

    calibrated.loc[review_delivery, "view_count"] = calibrated.loc[review_delivery, "view_count"].clip(lower=800)
    calibrated.loc[review_delivery, "purchase_count"] = (
        calibrated.loc[review_delivery, "view_count"].astype(float) * 0.035
    ).round().astype("int64")
    calibrated.loc[review_delivery, "negative_review_rate"] = calibrated.loc[
        review_delivery, "negative_review_rate"
    ].clip(lower=0.65)
    calibrated.loc[review_delivery, "late_delivery_rate"] = calibrated.loc[
        review_delivery, "late_delivery_rate"
    ].clip(lower=0.70)

    calibrated.loc[high_view, "view_count"] = calibrated.loc[high_view, "view_count"].clip(lower=1500)
    calibrated.loc[high_view, "purchase_count"] = (
        calibrated.loc[high_view, "view_count"].astype(float) * 0.020
    ).round().astype("int64")
    calibrated.loc[high_view, "negative_review_rate"] = calibrated.loc[
        high_view, "negative_review_rate"
    ].clip(upper=0.25)
    calibrated.loc[high_view, "late_delivery_rate"] = calibrated.loc[high_view, "late_delivery_rate"].clip(upper=0.25)

    calibrated.loc[quality, "view_count"] = calibrated.loc[quality, "view_count"].clip(lower=500)
    calibrated.loc[quality, "purchase_count"] = (
        calibrated.loc[quality, "view_count"].astype(float) * 0.055
    ).round().astype("int64")
    calibrated.loc[quality, "negative_review_rate"] = calibrated.loc[quality, "negative_review_rate"].clip(lower=0.72)
    calibrated.loc[quality, "late_delivery_rate"] = calibrated.loc[quality, "late_delivery_rate"].clip(upper=0.35)

    calibrated.loc[healthy, "view_count"] = calibrated.loc[healthy, "view_count"].clip(lower=300)
    calibrated.loc[healthy, "purchase_count"] = (
        calibrated.loc[healthy, "view_count"].astype(float) * 0.160
    ).round().astype("int64")
    calibrated.loc[healthy, "negative_review_rate"] = calibrated.loc[
        healthy, "negative_review_rate"
    ].clip(upper=0.08)
    calibrated.loc[healthy, "late_delivery_rate"] = calibrated.loc[healthy, "late_delivery_rate"].clip(upper=0.08)

    calibrated["conversion_rate"] = (
        calibrated["purchase_count"].astype(float) / calibrated["view_count"].replace(0, pd.NA).astype(float)
    ).fillna(0.0)
    calibrated["estimated_revenue"] = calibrated["estimated_revenue"].where(
        calibrated["estimated_revenue"] > 0,
        calibrated["purchase_count"].astype(float) * 49.9,
    )
    return calibrated


def schema_for(frame: pd.DataFrame) -> list[dict[str, Any]]:
    schema: list[dict[str, Any]] = []
    for name, dtype in frame.dtypes.items():
        schema.append({"name": name, "type": str(dtype), "nullable": bool(frame[name].isna().any())})
    return schema


def attach_source_dataset_ids(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for source in sources:
        mapping = SOURCE_DATASET_MAP.get(str(source.get("source")), {})
        enriched.append({**mapping, **source})
    return enriched


def write_source_handoff(sources: list[dict[str, Any]]) -> Path:
    source_by_role = {str(source.get("source")): source for source in sources}
    handoff = {
        "version": "2026-06-30.ph-data-2b",
        "tenant_id": "tenant_demo",
        "purpose": "Product Health demo source dataset handoff for M1 External Connection and Source Dataset UI.",
        "status": "ready_for_site_registration",
        "external_connections": [
            {
                "connection_id": "conn_product_health_local_sources",
                "name": "Product Health Local Sources",
                "connection_type": "local_folder",
                "root_path": str(RAW),
                "status": "ready_for_site_registration",
                "registration_mode": "site_external_connection",
                "notes": [
                    "Demo UI should register this as an External Connection before selecting Source Datasets.",
                    "Local paths are preparation evidence and fallback, not the primary user-facing flow.",
                ],
            },
            {
                "connection_id": "conn_taxi_postgres",
                "name": "Taxi PostgreSQL Demo Connection",
                "connection_type": "postgres",
                "database": "taxi_postgre",
                "status": "pending_pr_297_or_registered",
                "registration_mode": "site_external_connection",
                "local_parquet_fallback": "taxi_existing/yellow_tripdata_2019_2025/*.parquet",
                "notes": [
                    "Use the PostgreSQL connection when PR #297 or equivalent source registration is available.",
                    "Until then, the smoke generator reads the local parquet fallback for deterministic evidence.",
                ],
            },
        ],
        "source_datasets": [
            {
                "source_dataset_id": "source_ecommerce_behavior_events",
                "display_name": "Ecommerce Behavior Events",
                "role": "behavior",
                "connection_id": "conn_product_health_local_sources",
                "source_type": "local_file",
                "format": "csv",
                "relative_path": "kaggle_ecommerce_behavior/2019-Oct.csv",
                "sample_row_count": source_by_role.get("behavior", {}).get("row_count_sample"),
                "bytes": source_by_role.get("behavior", {}).get("bytes"),
            },
            {
                "source_dataset_id": "source_amazon_product_reviews",
                "display_name": "Amazon Product Reviews",
                "role": "review",
                "connection_id": "conn_product_health_local_sources",
                "source_type": "local_file",
                "format": "jsonl",
                "relative_path": "amazon_reviews_2023/raw/review_categories/All_Beauty.jsonl",
                "sample_row_count": source_by_role.get("review", {}).get("row_count_sample"),
                "bytes": source_by_role.get("review", {}).get("bytes"),
            },
            {
                "source_dataset_id": "source_amazon_product_metadata",
                "display_name": "Amazon Product Metadata",
                "role": "review_metadata",
                "connection_id": "conn_product_health_local_sources",
                "source_type": "local_file",
                "format": "jsonl",
                "relative_path": "amazon_reviews_2023/raw/meta_categories/meta_All_Beauty.jsonl",
                "sample_row_count": source_by_role.get("review_metadata", {}).get("row_count_sample"),
                "bytes": source_by_role.get("review_metadata", {}).get("bytes"),
            },
            {
                "source_dataset_id": "source_mep_product_catalog",
                "display_name": "MEP Product Catalog",
                "role": "product_catalog",
                "connection_id": "conn_product_health_local_sources",
                "source_type": "local_file",
                "format": "json",
                "relative_path": "mep_3m/annotations-1k.json",
                "sample_row_count": source_by_role.get("product_catalog", {}).get("row_count_sample"),
                "bytes": source_by_role.get("product_catalog", {}).get("bytes"),
            },
            {
                "source_dataset_id": "source_taxi_delivery_logs",
                "display_name": "Taxi Delivery Logs",
                "role": "delivery",
                "connection_id": "conn_taxi_postgres",
                "source_type": "postgres",
                "format": "table",
                "database": "taxi_postgre",
                "table_or_view": "yellow_tripdata_2019_2025",
                "local_parquet_fallback": "taxi_existing/yellow_tripdata_2019_2025/*.parquet",
                "sample_row_count": source_by_role.get("delivery", {}).get("row_count_sample"),
                "bytes": source_by_role.get("delivery", {}).get("bytes"),
            },
        ],
        "target_dataset": {
            "dataset_id": DATASET_ID,
            "pipeline_id": PIPELINE_ID,
            "table_name": GOLD_TABLE,
            "storage_format": "parquet",
            "local_fallback_path": str(GOLD / "gold_product_health.parquet"),
        },
        "handoff_contract": {
            "ui_flow": "External Connection -> Source Dataset -> Target Dataset job draft -> Catalog ingest",
            "m1": "Show connection/source dataset choices with these stable ids.",
            "m3": "Use source_dataset_id in transform evidence and lineage.",
            "m5": "Register source datasets and target catalog using these ids when persistence is merged.",
            "m6": "Use target dataset catalog metadata for SQL grounding.",
        },
        "compatibility_notes": [
            "PR #297 provides Taxi PostgreSQL External Connection and Source Dataset registration direction.",
            "PR #298 provides Dataset Inventory surface direction.",
            "This file keeps local fallback paths only as deterministic demo evidence.",
        ],
    }
    SOURCE_HANDOFF_PATH.write_text(
        json.dumps(handoff, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    return SOURCE_HANDOFF_PATH


def write_catalog(gold: pd.DataFrame, gold_path: Path) -> None:
    catalog = {
        "dataset_id": DATASET_ID,
        "table_name": GOLD_TABLE,
        "storage": {
            "format": "parquet",
            "local_fallback_path": str(gold_path),
        },
        "schema": schema_for(gold),
        "metrics": {
            "row_count": int(len(gold)),
            "bytes": gold_path.stat().st_size,
            "risk_score_max": float(gold["risk_score"].max()),
            "risk_score_avg": float(gold["risk_score"].mean()),
        },
        "query": {
            "engine": "duckdb",
            "table_name": GOLD_TABLE,
            "default_limit": 50,
            "allowed_columns": [
                "internal_product_id",
                "scenario_bucket",
                "risk_driver",
                "demo_category_label",
                "category_l1",
                "category_l2",
                "brand",
                "product_title",
                "conversion_rate",
                "negative_review_rate",
                "late_delivery_rate",
                "risk_score",
            ],
        },
        "lineage": {
            "pipeline_id": PIPELINE_ID,
            "run_id": RUN_ID,
            "source_handoff_path": str(SOURCE_HANDOFF_PATH),
            "sources": [
                {
                    "source_dataset_id": "source_ecommerce_behavior_events",
                    "connection_id": "conn_product_health_local_sources",
                    "name": "Ecommerce Behavior Events",
                },
                {
                    "source_dataset_id": "source_amazon_product_reviews",
                    "connection_id": "conn_product_health_local_sources",
                    "name": "Amazon Product Reviews",
                },
                {
                    "source_dataset_id": "source_amazon_product_metadata",
                    "connection_id": "conn_product_health_local_sources",
                    "name": "Amazon Product Metadata",
                },
                {
                    "source_dataset_id": "source_mep_product_catalog",
                    "connection_id": "conn_product_health_local_sources",
                    "name": "MEP Product Catalog",
                },
                {
                    "source_dataset_id": "source_taxi_delivery_logs",
                    "connection_id": "conn_taxi_postgres",
                    "name": "Taxi Delivery Logs",
                },
            ],
            "mapping_dataset": "silver/seed_product_mapping.parquet",
            "mapping_method": "synthetic_seed",
            "scenario_calibration": {
                "enabled": True,
                "buckets": SCENARIO_BUCKETS,
            },
        },
    }
    (CATALOG / "dataset_product_health_gold.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )


def sql_smoke(gold_path: Path) -> dict[str, Any]:
    con = duckdb.connect(database=":memory:")
    rows = con.execute(
        """
        select
          internal_product_id,
          scenario_bucket,
          risk_driver,
          demo_category_label,
          category_l1,
          product_title,
          conversion_rate,
          negative_review_rate,
          late_delivery_rate,
          risk_score
        from read_parquet(?)
        order by risk_score desc
        limit 10
        """,
        [str(gold_path)],
    ).fetchall()
    return {
        "query": "select scenario_bucket, risk_driver, ... from gold_product_health order by risk_score desc limit 10",
        "row_count": len(rows),
        "rows": [list(row) for row in rows],
    }


def write_run_summary(sources: list[dict[str, Any]], outputs: list[dict[str, Any]], sql: dict[str, Any]) -> None:
    enriched_sources = attach_source_dataset_ids(sources)
    available_source_total_bytes = int(sum(source.get("available_source_bytes", source.get("bytes", 0)) for source in enriched_sources))
    processed_input_values = [
        source.get("processed_input_bytes")
        for source in enriched_sources
        if source.get("processed_input_bytes") is not None
    ]
    processed_input_total_bytes = int(sum(processed_input_values)) if processed_input_values else None
    summary = {
        "run_id": RUN_ID,
        "pipeline_id": PIPELINE_ID,
        "status": "succeeded",
        "generated_at": now_iso(),
        "random_seed": RANDOM_SEED,
        "mode": "smoke",
        "evidence_mode": "source_inventory_and_row_limited_smoke_transform",
        "available_source_total_bytes": available_source_total_bytes,
        "processed_input_total_bytes": processed_input_total_bytes,
        "processed_input_total_bytes_status": "not_byte_measured_in_smoke_row_limited_read",
        "input_total_bytes": available_source_total_bytes,
        "input_total_bytes_semantics": "available_source_bytes_for_backward_compatibility_not_5gb_processed_evidence",
        "source_handoff_path": str(SOURCE_HANDOFF_PATH),
        "sources": enriched_sources,
        "outputs": outputs,
        "gold_dataset_id": DATASET_ID,
        "gold_table_name": GOLD_TABLE,
        "sql_smoke": sql,
        "notes": [
            "PH-DATA-1 smoke uses deterministic synthetic_seed mapping because public sources do not share real product keys.",
            "PH-DATA-1B scenario calibration adds scenario_bucket, risk_driver, mapping_reason, and demo_category_label for demo explainability.",
            "Taxi rows are filtered to a 2019 demo window and invalid delivery durations are removed.",
            "MEP full annotations are not loaded in smoke; annotations-1k.json is used.",
            "PH-DATA-2B adds External Connection and Source Dataset ids so the site flow can register connections first and use local paths only as fallback evidence.",
            "PH-DATA-2C separates available_source_total_bytes from processed_input_total_bytes. Smoke mode proves source inventory and row-limited transform, while PH-DATA-3 must provide actual 5GB processed evidence.",
        ],
    }
    (EVIDENCE / "product_health_run_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )


def main() -> None:
    random.seed(RANDOM_SEED)
    ensure_dirs()

    sources: list[dict[str, Any]] = []
    behavior, behavior_source = load_behavior()
    sources.append(behavior_source)
    mep, mep_source = load_mep_catalog()
    sources.append(mep_source)
    mapping = build_seed_mapping(behavior, mep)

    reviews, review_source = load_amazon_reviews(list(mapping["amazon_parent_asin"].dropna().astype(str)))
    sources.append(review_source)
    metadata, metadata_source = load_amazon_metadata(list(mapping["amazon_parent_asin"].dropna().astype(str)))
    sources.append(metadata_source)

    silver_events = make_silver_user_events(behavior, mapping)
    silver_reviews = make_silver_reviews(reviews, mapping)
    silver_catalog = make_silver_catalog(mep, metadata, mapping)
    silver_delivery, delivery_source = load_delivery(mapping)
    sources.append(delivery_source)

    gold = build_gold(silver_events, silver_reviews, silver_catalog, silver_delivery, mapping)

    outputs = [
        write_parquet(silver_events, SILVER / "silver_user_events.parquet"),
        write_parquet(silver_reviews, SILVER / "silver_product_reviews.parquet"),
        write_parquet(silver_catalog, SILVER / "silver_product_catalog.parquet"),
        write_parquet(silver_delivery, SILVER / "silver_delivery_trip_logs.parquet"),
        write_parquet(mapping, SILVER / "seed_product_mapping.parquet"),
        write_parquet(gold, GOLD / "gold_product_health.parquet"),
    ]
    gold_path = GOLD / "gold_product_health.parquet"
    handoff_path = write_source_handoff(sources)
    write_catalog(gold, gold_path)
    sql = sql_smoke(gold_path)
    write_run_summary(sources, outputs, sql)

    print(f"Wrote {gold_path} rows={len(gold)}")
    print(f"Wrote {handoff_path}")
    print(f"Wrote {CATALOG / 'dataset_product_health_gold.json'}")
    print(f"Wrote {EVIDENCE / 'product_health_run_summary.json'}")
    print(f"SQL smoke rows={sql['row_count']}")


if __name__ == "__main__":
    main()
