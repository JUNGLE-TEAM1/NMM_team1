#!/usr/bin/env python3
"""Canonical M3 L0-L10 Spark-backed contract validation entrypoint.

The implementation stays in ``m3_l0_l6_spark_contract_pipeline`` for backward
compatibility with earlier local reports and imports. New runs should call this
file so the entrypoint name matches the v2.1.1 expanded layer contract.
"""

from __future__ import annotations

from m3_l0_l6_spark_contract_pipeline import main


if __name__ == "__main__":
    raise SystemExit(main())
