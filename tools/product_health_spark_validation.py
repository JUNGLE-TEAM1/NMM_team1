#!/usr/bin/env python3
"""Spark/MinIO validation harness for the M3 product-health contract.

This script is intentionally outside the production M3 core path. It exists to
prove that the M3 ProductHealth spec can be executed by a Spark-style M2
runtime without changing the contract semantics:

- fixed gold_product_health output columns
- source-level aggregation before joins
- product_id universe that does not drop rows when product master is missing
- null zero-denominator rules
- source-adaptive risk_score with per-row weight renormalization

It writes validation artifacts to MinIO and a local F: summary path. M3 still
does not own the production Spark session, production catalog write, or M6 query
execution.
"""

from __future__ import annotations

import argparse
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F
from pyspark.sql import types as T


OUTPUT_COLUMNS = [
    "product_id",
    "product_name",
    "category_l1",
    "review_count",
    "average_rating",
    "negative_review_rate",
    "view_count",
    "purchase_count",
    "conversion_rate",
    "delivery_count",
    "late_delivery_rate",
    "risk_score",
]

BASE_RISK_WEIGHTS = {
    "negative_review_rate": 0.35,
    "low_rating_score": 0.30,
    "low_conversion_score": 0.20,
    "late_delivery_rate": 0.15,
}

REVIEW_SCHEMA = T.StructType(
    [
        T.StructField("product_id", T.StringType()),
        T.StructField("parent_asin", T.StringType()),
        T.StructField("asin", T.StringType()),
        T.StructField("rating", T.DoubleType()),
        T.StructField("star_rating", T.DoubleType()),
        T.StructField("score", T.DoubleType()),
        T.StructField("sentiment", T.StringType()),
        T.StructField("review_sentiment", T.StringType()),
        T.StructField("product_name", T.StringType()),
        T.StructField("product_title", T.StringType()),
        T.StructField("category_l1", T.StringType()),
        T.StructField("category", T.StringType()),
        T.StructField("main_category", T.StringType()),
        T.StructField("title", T.StringType()),
        T.StructField("text", T.StringType()),
    ]
)

PRODUCT_SCHEMA = T.StructType(
    [
        T.StructField("product_id", T.StringType()),
        T.StructField("parent_asin", T.StringType()),
        T.StructField("asin", T.StringType()),
        T.StructField("product_name", T.StringType()),
        T.StructField("title", T.StringType()),
        T.StructField("name", T.StringType()),
        T.StructField("category_l1", T.StringType()),
        T.StructField("main_category", T.StringType()),
        T.StructField("category", T.StringType()),
        T.StructField("categories", T.ArrayType(T.StringType())),
        T.StructField("average_rating", T.DoubleType()),
        T.StructField("rating_number", T.LongType()),
    ]
)

BEHAVIOR_SCHEMA = T.StructType(
    [
        T.StructField("product_id", T.StringType()),
        T.StructField("item_id", T.StringType()),
        T.StructField("asin", T.StringType()),
        T.StructField("parent_asin", T.StringType()),
        T.StructField("event_type", T.StringType()),
        T.StructField("event_name", T.StringType()),
        T.StructField("behavior_type", T.StringType()),
        T.StructField("action", T.StringType()),
        T.StructField(
            "item",
            T.StructType(
                [
                    T.StructField("item_id", T.StringType()),
                    T.StructField("category_id", T.StringType()),
                    T.StructField("title", T.StringType()),
                ]
            ),
        ),
        T.StructField("interaction", T.StructType([T.StructField("action", T.StringType())])),
    ]
)

DELIVERY_SCHEMA = T.StructType(
    [
        T.StructField("product_id", T.StringType()),
        T.StructField("item_id", T.StringType()),
        T.StructField("asin", T.StringType()),
        T.StructField("parent_asin", T.StringType()),
        T.StructField("late_flag", T.BooleanType()),
        T.StructField("late_delivery_flag", T.BooleanType()),
        T.StructField("is_late_60", T.BooleanType()),
        T.StructField("promised_at", T.TimestampType()),
        T.StructField("delivered_at", T.TimestampType()),
    ]
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def default_jars() -> list[str]:
    import pyspark

    jar_dir = Path(pyspark.__file__).resolve().parent / "jars"
    candidates = [
        jar_dir / "org.apache.hadoop_hadoop-aws-3.4.1.jar",
        jar_dir / "software.amazon.awssdk_bundle-2.24.6.jar",
    ]
    return [str(path) for path in candidates if path.exists()]


def require_s3_credential(value: str | None, env_name: str, argument_name: str) -> str:
    resolved = value or os.environ.get(env_name)
    if not resolved:
        raise ValueError(f"{argument_name} or {env_name} is required for Spark/MinIO validation")
    return resolved


def build_spark(args: argparse.Namespace) -> SparkSession:
    builder = (
        SparkSession.builder.appName(args.app_name)
        .master(args.master)
        .config("spark.executor.instances", str(args.executor_instances))
        .config("spark.executor.cores", str(args.executor_cores))
        .config("spark.cores.max", str(args.cores_max))
        .config("spark.executor.memory", args.executor_memory)
        .config("spark.sql.shuffle.partitions", str(args.shuffle_partitions))
        .config("spark.task.maxFailures", "2")
        .config("spark.executor.heartbeatInterval", "30s")
        .config("spark.network.timeout", "240s")
        .config("spark.hadoop.fs.s3a.endpoint", args.s3_endpoint)
        .config("spark.hadoop.fs.s3a.access.key", args.s3_access_key)
        .config("spark.hadoop.fs.s3a.secret.key", args.s3_secret_key)
        .config("spark.hadoop.fs.s3a.path.style.access", "true")
        .config("spark.hadoop.fs.s3a.connection.ssl.enabled", "false")
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")
    )
    jars = default_jars()
    if jars:
        builder = builder.config("spark.jars", ",".join(jars))
    return builder.getOrCreate()


def read_json(spark: SparkSession, uri: str | None, schema: T.StructType, limit: int) -> DataFrame:
    if not uri:
        return spark.createDataFrame([], schema)
    df = spark.read.schema(schema).json(uri)
    return df.limit(limit) if limit > 0 else df


def empty_df(spark: SparkSession, schema: T.StructType) -> DataFrame:
    return spark.createDataFrame([], schema)


def ratio_or_null(numerator: F.Column, denominator: F.Column) -> F.Column:
    return F.when(denominator == 0, F.lit(None).cast("double")).otherwise(F.round(numerator.cast("double") / denominator.cast("double"), 6))


def product_id_from_reviews() -> F.Column:
    return F.coalesce(F.col("product_id"), F.col("parent_asin"), F.col("asin")).cast("string")


def product_id_from_products() -> F.Column:
    return F.coalesce(F.col("product_id"), F.col("parent_asin"), F.col("asin")).cast("string")


def product_id_from_behavior() -> F.Column:
    return F.coalesce(F.col("product_id"), F.col("item_id"), F.col("item.item_id"), F.col("asin"), F.col("parent_asin")).cast("string")


def product_id_from_delivery() -> F.Column:
    return F.coalesce(F.col("product_id"), F.col("item_id"), F.col("asin"), F.col("parent_asin")).cast("string")


def aggregate_reviews(df: DataFrame) -> DataFrame:
    normalized = (
        df.withColumn("product_id", product_id_from_reviews())
        .withColumn("rating_value", F.coalesce(F.col("rating"), F.col("star_rating"), F.col("score")).cast("double"))
        .withColumn("sentiment_value", F.lower(F.coalesce(F.col("sentiment"), F.col("review_sentiment"))))
        .filter(F.col("product_id").isNotNull())
    )
    return normalized.groupBy("product_id").agg(
        F.count(F.lit(1)).alias("review_count"),
        F.sum(F.coalesce(F.col("rating_value"), F.lit(0.0))).alias("rating_sum"),
        F.sum(F.when(F.col("rating_value").isNotNull(), 1).otherwise(0)).alias("rating_count"),
        F.sum(
            F.when((F.col("rating_value") <= 2) | (F.col("sentiment_value").isin("negative", "very_negative")), 1).otherwise(0)
        ).alias("negative_review_count"),
    )


def aggregate_behavior(df: DataFrame) -> DataFrame:
    action = F.lower(F.coalesce(F.col("event_type"), F.col("event_name"), F.col("behavior_type"), F.col("action"), F.col("interaction.action")))
    normalized = df.withColumn("product_id", product_id_from_behavior()).withColumn("action_value", action).filter(F.col("product_id").isNotNull())
    is_view = F.col("action_value").rlike("view|impression|pv|product_impression")
    is_purchase = F.col("action_value").rlike("purchase|buy|order|checkout")
    return normalized.groupBy("product_id").agg(
        F.sum(F.when(is_view, 1).otherwise(0)).alias("view_count"),
        F.sum(F.when(is_purchase, 1).otherwise(0)).alias("purchase_count"),
    )


def aggregate_delivery(df: DataFrame) -> DataFrame:
    late_flag = F.coalesce(F.col("late_flag"), F.col("late_delivery_flag"), F.col("is_late_60"), F.lit(False))
    normalized = df.withColumn("product_id", product_id_from_delivery()).filter(F.col("product_id").isNotNull())
    return normalized.groupBy("product_id").agg(
        F.count(F.lit(1)).alias("delivery_count"),
        F.sum(F.when((late_flag == F.lit(True)) | (F.col("delivered_at") > F.col("promised_at")), 1).otherwise(0)).alias("late_delivery_count"),
    )


def product_dimensions(products: DataFrame, reviews: DataFrame, behavior: DataFrame) -> DataFrame:
    product_dims = (
        products.withColumn("product_id", product_id_from_products())
        .select(
            "product_id",
            F.coalesce(F.col("product_name"), F.col("title"), F.col("name")).alias("product_name"),
            F.coalesce(F.col("category_l1"), F.col("main_category"), F.col("category"), F.element_at(F.col("categories"), 1)).alias("category_l1"),
        )
        .filter(F.col("product_id").isNotNull())
        .groupBy("product_id")
        .agg(F.first("product_name", ignorenulls=True).alias("master_product_name"), F.first("category_l1", ignorenulls=True).alias("master_category_l1"))
    )
    review_hints = (
        reviews.withColumn("product_id", product_id_from_reviews())
        .select(
            "product_id",
            F.coalesce(F.col("product_name"), F.col("product_title")).alias("product_name"),
            F.coalesce(F.col("category_l1"), F.col("category"), F.col("main_category")).alias("category_l1"),
        )
        .filter(F.col("product_id").isNotNull())
        .groupBy("product_id")
        .agg(F.first("product_name", ignorenulls=True).alias("review_product_name"), F.first("category_l1", ignorenulls=True).alias("review_category_l1"))
    )
    behavior_hints = (
        behavior.withColumn("product_id", product_id_from_behavior())
        .select(
            "product_id",
            F.coalesce(F.col("product_name"), F.col("item.title")).alias("product_name") if "product_name" in behavior.columns else F.col("item.title").alias("product_name"),
            F.coalesce(F.col("category_l1"), F.col("item.category_id")).alias("category_l1") if "category_l1" in behavior.columns else F.col("item.category_id").alias("category_l1"),
        )
        .filter(F.col("product_id").isNotNull())
        .groupBy("product_id")
        .agg(F.first("product_name", ignorenulls=True).alias("behavior_product_name"), F.first("category_l1", ignorenulls=True).alias("behavior_category_l1"))
    )
    product_ids = (
        product_dims.select("product_id")
        .unionByName(review_hints.select("product_id"))
        .unionByName(behavior_hints.select("product_id"))
        .distinct()
    )
    return (
        product_ids.join(product_dims, "product_id", "left")
        .join(review_hints, "product_id", "left")
        .join(behavior_hints, "product_id", "left")
        .select(
            "product_id",
            F.coalesce("master_product_name", "review_product_name", "behavior_product_name").alias("product_name"),
            F.coalesce("master_category_l1", "review_category_l1", "behavior_category_l1").alias("category_l1"),
        )
    )


def build_gold(products: DataFrame, reviews: DataFrame, behavior: DataFrame, delivery: DataFrame) -> DataFrame:
    spark = products.sparkSession
    dims = product_dimensions(products, reviews, behavior)
    review_agg = aggregate_reviews(reviews)
    behavior_agg = aggregate_behavior(behavior)
    delivery_agg = aggregate_delivery(delivery)
    universe = (
        dims.select("product_id")
        .unionByName(review_agg.select("product_id"))
        .unionByName(behavior_agg.select("product_id"))
        .unionByName(delivery_agg.select("product_id"))
        .distinct()
    )
    joined = (
        universe.join(dims, "product_id", "left")
        .join(review_agg, "product_id", "left")
        .join(behavior_agg, "product_id", "left")
        .join(delivery_agg, "product_id", "left")
        .withColumn("review_count", F.coalesce(F.col("review_count"), F.lit(0)).cast("long"))
        .withColumn("rating_count", F.coalesce(F.col("rating_count"), F.lit(0)).cast("long"))
        .withColumn("rating_sum", F.coalesce(F.col("rating_sum"), F.lit(0.0)).cast("double"))
        .withColumn("negative_review_count", F.coalesce(F.col("negative_review_count"), F.lit(0)).cast("long"))
        .withColumn("view_count", F.coalesce(F.col("view_count"), F.lit(0)).cast("long"))
        .withColumn("purchase_count", F.coalesce(F.col("purchase_count"), F.lit(0)).cast("long"))
        .withColumn("delivery_count", F.coalesce(F.col("delivery_count"), F.lit(0)).cast("long"))
        .withColumn("late_delivery_count", F.coalesce(F.col("late_delivery_count"), F.lit(0)).cast("long"))
        .withColumn("average_rating", F.when(F.col("rating_count") == 0, F.lit(None).cast("double")).otherwise(F.round(F.col("rating_sum") / F.col("rating_count"), 6)))
        .withColumn("negative_review_rate", ratio_or_null(F.col("negative_review_count"), F.col("review_count")))
        .withColumn("conversion_rate", ratio_or_null(F.col("purchase_count"), F.col("view_count")))
        .withColumn("late_delivery_rate", ratio_or_null(F.col("late_delivery_count"), F.col("delivery_count")))
        .withColumn("low_rating_score", F.when(F.col("average_rating").isNull(), F.lit(None).cast("double")).otherwise(F.round(F.least(F.greatest((F.lit(5.0) - F.col("average_rating")) / F.lit(4.0), F.lit(0.0)), F.lit(1.0)), 6)))
        .withColumn("low_conversion_score", F.when(F.col("conversion_rate").isNull(), F.lit(None).cast("double")).otherwise(F.round(F.lit(1.0) - F.col("conversion_rate"), 6)))
    )
    component_columns = [
        ("negative_review_rate", F.col("negative_review_rate")),
        ("low_rating_score", F.col("low_rating_score")),
        ("low_conversion_score", F.col("low_conversion_score")),
        ("late_delivery_rate", F.col("late_delivery_rate")),
    ]
    weight_sum = F.lit(0.0)
    weighted_sum = F.lit(0.0)
    for name, column in component_columns:
        weight = F.lit(BASE_RISK_WEIGHTS[name])
        weight_sum = weight_sum + F.when(column.isNotNull(), weight).otherwise(F.lit(0.0))
        weighted_sum = weighted_sum + F.when(column.isNotNull(), column * weight).otherwise(F.lit(0.0))
    return joined.withColumn("risk_score", F.when(weight_sum == 0, F.lit(None).cast("double")).otherwise(F.round(F.lit(100.0) * weighted_sum / weight_sum, 2))).select(
        *OUTPUT_COLUMNS
    )


def controlled_seed(spark: SparkSession) -> tuple[DataFrame, DataFrame, DataFrame, DataFrame]:
    products = spark.createDataFrame(
        [
            {"product_id": "S1", "product_name": "Demo Jacket", "category_l1": "Clothing"},
            {"product_id": "S2", "product_name": "Demo Shoes", "category_l1": "Shoes"},
            {"product_id": "S3", "product_name": "Demo Bag", "category_l1": "Accessories"},
        ],
        PRODUCT_SCHEMA,
    )
    reviews = spark.createDataFrame(
        [
            {"product_id": "S1", "rating": 5.0, "sentiment": "positive"},
            {"product_id": "S1", "rating": 1.0, "sentiment": "negative"},
            {"product_id": "S2", "rating": 4.0, "sentiment": "positive"},
        ],
        REVIEW_SCHEMA,
    )
    behavior = spark.createDataFrame(
        [
            {"product_id": "S1", "event_type": "product_view"},
            {"product_id": "S1", "event_type": "product_view"},
            {"product_id": "S1", "event_type": "purchase"},
            {"product_id": "S2", "event_type": "purchase"},
        ],
        BEHAVIOR_SCHEMA,
    )
    delivery = spark.createDataFrame(
        [
            {"product_id": "S1", "late_flag": True},
            {"product_id": "S1", "late_flag": False},
            {"product_id": "S2", "late_flag": False},
        ],
        DELIVERY_SCHEMA,
    )
    return products, reviews, behavior, delivery


def case_inputs(spark: SparkSession, args: argparse.Namespace, case: str) -> tuple[DataFrame, DataFrame, DataFrame, DataFrame]:
    if case == "controlled_full_seed":
        return controlled_seed(spark)
    products = empty_df(spark, PRODUCT_SCHEMA)
    reviews = empty_df(spark, REVIEW_SCHEMA)
    behavior = empty_df(spark, BEHAVIOR_SCHEMA)
    delivery = empty_df(spark, DELIVERY_SCHEMA)
    if case == "amazon_review_metadata":
        reviews = read_json(spark, args.amazon_reviews_uri, REVIEW_SCHEMA, args.source_limit)
        products = read_json(spark, args.amazon_metadata_uri, PRODUCT_SCHEMA, args.source_limit)
    elif case == "taobao_behavior_only":
        behavior = read_json(spark, args.taobao_behavior_uri, BEHAVIOR_SCHEMA, args.source_limit)
    else:
        raise ValueError(f"unsupported case: {case}")
    return products, reviews, behavior, delivery


def summarize_case(case: str, gold: DataFrame, output_uri: str, started: float, spark: SparkSession) -> dict[str, Any]:
    row_count = gold.count()
    non_null = {
        field: gold.filter(F.col(field).isNotNull()).count()
        for field in ["average_rating", "negative_review_rate", "conversion_rate", "late_delivery_rate", "risk_score"]
    }
    zero_denom = {
        "view_count_zero_conversion_null": gold.filter((F.col("view_count") == 0) & F.col("conversion_rate").isNull()).count(),
        "delivery_count_zero_late_delivery_null": gold.filter((F.col("delivery_count") == 0) & F.col("late_delivery_rate").isNull()).count(),
        "review_count_zero_negative_review_null": gold.filter((F.col("review_count") == 0) & F.col("negative_review_rate").isNull()).count(),
    }
    sample_rows = [row.asDict(recursive=True) for row in gold.orderBy(F.desc_nulls_last("risk_score")).limit(10).collect()]
    return {
        "case": case,
        "status": "succeeded",
        "row_count": row_count,
        "output_uri": output_uri,
        "output_schema": OUTPUT_COLUMNS,
        "metric_non_null_counts": non_null,
        "zero_denominator_evidence": zero_denom,
        "sample_rows": sample_rows,
        "duration_seconds": round(time.time() - started, 3),
        "spark": {
            "version": spark.version,
            "application_id": spark.sparkContext.applicationId,
            "master": spark.sparkContext.master,
        },
        "risk_score_policy": {
            "mode": "source_evidence_adaptive",
            "base_weights": BASE_RISK_WEIGHTS,
            "missing_component_handling": "exclude_from_weight_and_record_in_risk_score_coverage",
            "conversion_component_test_fallback": "1 - conversion_rate; not a universal production risk formula",
        },
    }


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def run(args: argparse.Namespace) -> dict[str, Any]:
    args.s3_access_key = require_s3_credential(args.s3_access_key, "M3_MINIO_ACCESS_KEY", "--s3-access-key")
    args.s3_secret_key = require_s3_credential(args.s3_secret_key, "M3_MINIO_SECRET_KEY", "--s3-secret-key")
    spark = build_spark(args)
    spark.sparkContext.setLogLevel("WARN")
    summaries: list[dict[str, Any]] = []
    overall_started = time.time()
    try:
        cases = ["amazon_review_metadata", "taobao_behavior_only", "controlled_full_seed"] if args.case == "all" else [args.case]
        for case in cases:
            started = time.time()
            products, reviews, behavior, delivery = case_inputs(spark, args, case)
            gold = build_gold(products, reviews, behavior, delivery).persist()
            output_uri = f"{args.output_uri.rstrip('/')}/case={case}"
            gold.write.mode("overwrite").json(f"{output_uri}/gold_product_health_json")
            gold.write.mode("overwrite").parquet(f"{output_uri}/gold_product_health_parquet")
            summaries.append(summarize_case(case, gold, output_uri, started, spark))
            gold.unpersist()
    finally:
        spark.stop()
    result = {
        "contract": "ProductHealthSparkMinIOValidation",
        "producer": "M3 local validation harness",
        "m3_core_runtime_claim": False,
        "created_at": utc_now(),
        "duration_seconds": round(time.time() - overall_started, 3),
        "output_uri": args.output_uri,
        "cases": summaries,
        "contract_refs": {
            "gold_contract": "contracts/product_health_gold_contract.sample.json",
            "transform_spec": "contracts/product_health_transform_spec.sample.json",
            "risk_score_policy": "contracts/product_health_risk_score_policy.sample.json",
        },
        "handoff_assessment": {
            "m2": "Spark can execute this as a deterministic source-aggregate-join-derive job.",
            "m5": "Output URI and summary can be persisted as workflow/catalog evidence.",
            "m6": "Fixed columns and catalog docs are sufficient for SQL context after L9 approval.",
            "m1": "M1 can render the fixed metric names and risk evidence without guessing column names.",
        },
    }
    write_json(args.summary_path, result)
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--case", choices=["all", "amazon_review_metadata", "taobao_behavior_only", "controlled_full_seed"], default="all")
    parser.add_argument("--master", default="spark://172.21.102.126:7077")
    parser.add_argument("--app-name", default="m3-product-health-spark-minio-validation")
    parser.add_argument("--s3-endpoint", default="http://172.21.102.126:9000")
    parser.add_argument("--s3-access-key", default=None)
    parser.add_argument("--s3-secret-key", default=None)
    parser.add_argument("--executor-instances", type=int, default=3)
    parser.add_argument("--executor-cores", type=int, default=2)
    parser.add_argument("--cores-max", type=int, default=6)
    parser.add_argument("--executor-memory", default="2g")
    parser.add_argument("--shuffle-partitions", type=int, default=12)
    parser.add_argument("--source-limit", type=int, default=0, help="0 means full source")
    parser.add_argument(
        "--amazon-reviews-uri",
        default="s3a://m3-raw/amazon_reviews/clothing_shoes_and_jewelry/reviews/Clothing_Shoes_and_Jewelry.jsonl",
    )
    parser.add_argument(
        "--amazon-metadata-uri",
        default="s3a://m3-raw/amazon_reviews/clothing_shoes_and_jewelry/metadata/meta_Clothing_Shoes_and_Jewelry.jsonl",
    )
    parser.add_argument("--taobao-behavior-uri", default="s3a://m3-raw/taobao/user_events/taobao_user_events_actual_like_full.jsonl")
    run_id = datetime.now().strftime("run_%Y%m%d_%H%M%S")
    parser.add_argument("--output-uri", default=f"s3a://m3-gold/product_health_validation/run_id={run_id}")
    parser.add_argument(
        "--summary-path",
        type=Path,
        default=Path(rf"F:\ai\m3-product-health-spark-minio-validation\{run_id}\summary.json"),
    )
    return parser.parse_args()


def main() -> int:
    result = run(parse_args())
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
