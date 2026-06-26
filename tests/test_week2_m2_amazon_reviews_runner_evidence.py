import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

import pyarrow.parquet as pq


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "week2_m2_amazon_reviews_runner_evidence.py"
SPEC = importlib.util.spec_from_file_location("week2_m2_amazon_reviews_runner_evidence", SCRIPT_PATH)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


def write_jsonl(path: Path, rows: list[dict]) -> None:
    """테스트가 사용할 작은 JSONL 입력 파일을 만든다."""

    path.write_text("\n".join(json.dumps(row) for row in rows) + "\n", encoding="utf-8")


class Week2M2AmazonReviewsRunnerEvidenceTest(unittest.TestCase):
    """Amazon Reviews evidence CLI helper가 runner 경계를 지키는지 검증한다."""

    def test_run_evidence_writes_parquet_and_reports_metrics(self) -> None:
        """정상 review JSONL이 Parquet output과 metric evidence로 이어지는지 확인한다."""

        source_path = self.tmp_path / "reviews_seed.jsonl"
        output_root = self.tmp_path / "results"
        write_jsonl(
            source_path,
            [
                {
                    "review_id": "R000001",
                    "product_id": "B001",
                    "rating": 5,
                    "review_text": "Great battery life",
                    "review_time": "2026-06-20T10:00:00Z",
                    "verified_purchase": True,
                },
                {
                    "review_id": "R000002",
                    "product_id": "B002",
                    "rating": 3,
                    "review_text": "Average packaging",
                    "review_time": "2026-06-21T10:00:00Z",
                    "verified_purchase": False,
                },
            ],
        )

        evidence = module.run_evidence(
            input_path=source_path,
            output_root=output_root,
            run_id="run_test_amazon_reviews",
        )

        output_path = Path(evidence["output"]["path"])
        self.assertEqual(evidence["status"], "succeeded")
        self.assertEqual(evidence["input"]["logical_shape"], "amazon_reviews_json")
        self.assertTrue(evidence["input"]["required_fields_present"])
        self.assertEqual(evidence["input"]["row_count"], 2)
        self.assertEqual(evidence["output"]["row_count"], 2)
        self.assertGreater(evidence["output"]["bytes"], 0)
        self.assertTrue(output_path.exists())
        self.assertEqual(pq.read_table(output_path).num_rows, 2)

    def test_run_evidence_fails_when_required_review_field_is_missing(self) -> None:
        """필수 review field가 빠진 입력은 output을 만들지 않고 실패 evidence를 반환한다."""

        source_path = self.tmp_path / "bad_reviews.jsonl"
        output_root = self.tmp_path / "results"
        write_jsonl(
            source_path,
            [
                {
                    "review_id": "R000001",
                    "product_id": "B001",
                    "rating": 5,
                    "review_time": "2026-06-20T10:00:00Z",
                    "verified_purchase": True,
                }
            ],
        )

        evidence = module.run_evidence(
            input_path=source_path,
            output_root=output_root,
            run_id="run_test_bad_amazon_reviews",
        )

        self.assertEqual(evidence["status"], "failed")
        self.assertFalse(evidence["input"]["required_fields_present"])
        self.assertEqual(evidence["input"]["bad_row_count"], 1)
        self.assertEqual(evidence["input"]["missing_required_fields"][0]["missing_fields"], ["review_text"])
        self.assertFalse(output_root.exists())

    def setUp(self) -> None:
        """테스트별 임시 디렉터리를 만든다."""

        self.tmp_dir = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self.tmp_dir.name)

    def tearDown(self) -> None:
        """테스트가 만든 임시 파일을 제거한다."""

        self.tmp_dir.cleanup()


if __name__ == "__main__":
    unittest.main()
