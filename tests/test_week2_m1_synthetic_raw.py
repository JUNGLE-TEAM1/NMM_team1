import importlib.util
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "week2_m1_synthetic_raw.py"
SPEC = importlib.util.spec_from_file_location("week2_m1_synthetic_raw", SCRIPT_PATH)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


class Week2M1SyntheticRawTest(unittest.TestCase):
    def test_to_review_seed_maps_amazon_review_shape(self) -> None:
        row = {
            "rating": 5.0,
            "text": "Having Amazon money is always good.",
            "parent_asin": "B00IX1I3G6",
            "timestamp": 1549866158332,
            "verified_purchase": True,
        }

        seed = module.to_review_seed(row, 1)

        self.assertEqual(
            seed,
            {
                "review_id": "R000001",
                "product_id": "B00IX1I3G6",
                "rating": 5.0,
                "review_text": "Having Amazon money is always good.",
                "review_time": "2019-02-11T06:22:38Z",
                "verified_purchase": True,
            },
        )
        self.assertEqual(list(seed.keys()), module.REQUIRED_REVIEW_FIELDS)

    def test_summary_requires_all_m3_review_fields(self) -> None:
        rows = [
            {
                "review_id": "R000001",
                "product_id": "B00IX1I3G6",
                "rating": 5.0,
                "review_text": "Great gift",
                "review_time": "2019-02-11T06:22:38Z",
                "verified_purchase": True,
            }
        ]

        summary = module.summarize_reviews(rows)

        self.assertEqual(summary["row_count"], 1)
        self.assertIs(summary["required_fields_present"], True)
        self.assertEqual(summary["required_fields"], module.REQUIRED_REVIEW_FIELDS)

    def test_behavior_rows_contains_view_cart_purchase(self) -> None:
        products = [{"product_id": "B00IX1I3G6"}]
        reviews = [{"review_time": "2024-05-01T00:00:00Z"}]

        rows = module.behavior_rows(products, reviews, events_per_product=3)

        self.assertEqual([row["event_type"] for row in rows], ["view", "cart", "purchase"])
        self.assertTrue(all(row["is_synthetic_source"] is True for row in rows))


if __name__ == "__main__":
    unittest.main()
