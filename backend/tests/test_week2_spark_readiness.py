from fastapi.testclient import TestClient

from app.core.app_factory import create_app
from app.services.week2_spark_runner import spark_readiness


def test_spark_readiness_reports_local_smoke_boundary() -> None:
    readiness = spark_readiness({})

    assert readiness["runner"] == "spark_runner"
    assert readiness["runner_implementation"] == "local_pyarrow_smoke"
    assert readiness["distributed_cluster_available"] is False
    assert readiness["cluster_configured"] is False
    assert readiness["spark_master"] is None
    assert readiness["supported_source_types"] == ["local_file"]
    assert "kafka" in readiness["unsupported_source_types"]
    assert "parquet" in readiness["supported_input_formats"]
    assert "does not start Spark" in readiness["boundary"]


def test_spark_readiness_reports_cluster_env_without_marking_distributed_available() -> None:
    readiness = spark_readiness({"ASKLAKE_SPARK_MASTER_URL": "spark://m2-spark-master:7077"})

    assert readiness["cluster_configured"] is True
    assert readiness["spark_master_configured"] is True
    assert readiness["spark_master"] == "spark://m2-spark-master:7077"
    assert readiness["distributed_cluster_available"] is False
    assert "local_file" in readiness["supported_source_types"]


def test_spark_readiness_route_is_read_only() -> None:
    client = TestClient(create_app())

    response = client.get("/api/week2/spark/readiness")

    assert response.status_code == 200
    payload = response.json()
    assert payload["runner"] == "spark_runner"
    assert payload["distributed_cluster_available"] is False
