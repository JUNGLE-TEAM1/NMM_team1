import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "week2_m1_delivery_seed.py"
SPEC = importlib.util.spec_from_file_location("week2_m1_delivery_seed", SCRIPT_PATH)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


class Week2M1DeliverySeedTest(unittest.TestCase):
    def test_taxi_row_to_delivery_maps_required_shape(self) -> None:
        row = {
            "tpep_pickup_datetime": "2024-01-01T10:00:00",
            "tpep_dropoff_datetime": "2024-01-01T10:42:00",
            "trip_distance": 8.4,
            "total_amount": 17.25,
            "PULocationID": 132,
            "DOLocationID": 161,
        }

        seed = module.taxi_row_to_delivery(row, 1, "P000001", late_threshold_minutes=60)

        self.assertIsNotNone(seed)
        assert seed is not None
        self.assertEqual(set(seed.keys()), set(module.REQUIRED_DELIVERY_FIELDS))
        self.assertEqual(seed["delivery_id"], "D00000001")
        self.assertEqual(seed["order_id"], "O00000001")
        self.assertEqual(seed["product_id"], "P000001")
        self.assertEqual(seed["delivery_started_at"], "2024-01-01T10:00:00Z")
        self.assertEqual(seed["delivered_at"], "2024-01-01T10:42:00Z")
        self.assertEqual(seed["delivery_duration_minutes"], 42)
        self.assertEqual(seed["delivery_distance_km"], 13.518)
        self.assertEqual(seed["total_delivery_cost_amount"], 17.25)
        self.assertIs(seed["late_delivery_flag"], False)
        self.assertIs(seed["is_synthetic_source"], True)
        self.assertEqual(seed["synthetic_rule_id"], "taxi_to_delivery_seed_v1")
        self.assertTrue(seed["source_taxi_row_hash"])

    def test_taxi_row_to_delivery_rejects_invalid_duration(self) -> None:
        row = {
            "tpep_pickup_datetime": "2024-01-01T10:00:00",
            "tpep_dropoff_datetime": "2024-01-01T09:59:00",
            "trip_distance": 1.0,
            "total_amount": 5.0,
        }

        self.assertIsNone(module.taxi_row_to_delivery(row, 1, "P000001", late_threshold_minutes=60))

    def test_taxi_row_to_delivery_rejects_out_of_month_source_rows(self) -> None:
        row = {
            "tpep_pickup_datetime": "2002-12-31T23:01:00",
            "tpep_dropoff_datetime": "2002-12-31T23:30:00",
            "trip_distance": 1.0,
            "total_amount": 5.0,
        }

        self.assertIsNone(
            module.taxi_row_to_delivery(
                row,
                1,
                "P000001",
                late_threshold_minutes=60,
                source_start_at=module.coerce_datetime("2024-01-01T00:00:00Z"),
                source_end_at=module.coerce_datetime("2024-02-01T00:00:00Z"),
            )
        )

    def test_read_product_ids_uses_existing_seed_or_fallback(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            product_path = Path(tmp) / "product_master_seed.jsonl"
            product_path.write_text(json.dumps({"product_id": "B00TEST"}) + "\n", encoding="utf-8")

            self.assertEqual(module.read_product_ids(product_path, fallback_count=2), ["B00TEST"])
            self.assertEqual(module.read_product_ids(Path(tmp) / "missing.jsonl", fallback_count=2), ["P000001", "P000002"])

    def test_summarize_delivery_validates_required_fields(self) -> None:
        row = module.taxi_row_to_delivery(
            {
                "tpep_pickup_datetime": "2024-01-01T10:00:00",
                "tpep_dropoff_datetime": "2024-01-01T11:10:00",
                "trip_distance": 2.0,
                "total_amount": 20.0,
            },
            2,
            "P000002",
            late_threshold_minutes=60,
        )
        assert row is not None

        summary = module.summarize_delivery([row])

        self.assertEqual(summary["row_count"], 1)
        self.assertTrue(summary["required_fields_present"])
        self.assertTrue(summary["is_synthetic_source_all_true"])
        self.assertTrue(summary["late_delivery_flag_boolean"])
        self.assertTrue(summary["source_taxi_row_hash_present"])


if __name__ == "__main__":
    unittest.main()
