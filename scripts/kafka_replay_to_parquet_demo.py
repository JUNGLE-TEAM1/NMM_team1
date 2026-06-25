#!/usr/bin/env python3
"""Replay a CSV into Kafka, then materialize consumed messages as Parquet.

This is a local demo harness. It uses Kafka CLI commands inside a Docker
container so the repo does not need a Python Kafka client dependency.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Replay CSV rows to Kafka and save the consumed JSON messages "
            "as a Parquet file."
        )
    )
    parser.add_argument("--csv", type=Path, help="CSV file to replay into Kafka.")
    parser.add_argument("--topic", required=True, help="Kafka topic name.")
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="Parquet file path to write.",
    )
    parser.add_argument(
        "--preview-html",
        type=Path,
        help="Optional HTML preview file for quick manual inspection.",
    )
    parser.add_argument(
        "--group",
        help="Consumer group id. Defaults to a timestamped demo group.",
    )
    parser.add_argument(
        "--container",
        default="kafka",
        help="Docker container that has kafka-console-* tools. Default: kafka.",
    )
    parser.add_argument(
        "--broker",
        default="localhost:9092",
        help="Bootstrap broker seen from inside the Kafka container.",
    )
    parser.add_argument(
        "--docker-bin",
        default="docker",
        help="Docker executable name or path.",
    )
    parser.add_argument(
        "--encoding",
        default="utf-8-sig",
        help="CSV file encoding. Default: utf-8-sig.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Replay only the first N CSV rows. 0 means all rows.",
    )
    parser.add_argument(
        "--max-messages",
        type=int,
        help="Number of Kafka messages to consume. Defaults to produced row count.",
    )
    parser.add_argument(
        "--timeout-ms",
        type=int,
        default=30000,
        help="Kafka consumer timeout in milliseconds. Default: 30000.",
    )
    parser.add_argument(
        "--skip-produce",
        action="store_true",
        help="Only consume an existing topic and write Parquet.",
    )
    return parser.parse_args()


def iter_csv_json_lines(
    csv_path: Path,
    encoding: str,
    limit: int,
) -> Iterable[str]:
    with csv_path.open("r", encoding=encoding, newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for index, record in enumerate(reader, start=1):
            if limit and index > limit:
                break
            yield json.dumps(record, ensure_ascii=False, separators=(",", ":"))


def run_producer(args: argparse.Namespace) -> int:
    if args.csv is None:
        raise SystemExit("--csv is required unless --skip-produce is used.")
    if not args.csv.exists():
        raise SystemExit(f"CSV file does not exist: {args.csv}")

    command = [
        args.docker_bin,
        "exec",
        "-i",
        args.container,
        "kafka-console-producer",
        "--bootstrap-server",
        args.broker,
        "--topic",
        args.topic,
    ]
    process = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if process.stdin is None:
        raise RuntimeError("Failed to open producer stdin.")

    produced_count = 0
    try:
        for line in iter_csv_json_lines(args.csv, args.encoding, args.limit):
            process.stdin.write(line)
            process.stdin.write("\n")
            produced_count += 1
    finally:
        process.stdin.close()

    stdout = process.stdout.read() if process.stdout else ""
    stderr = process.stderr.read() if process.stderr else ""
    return_code = process.wait()
    if return_code != 0:
        raise RuntimeError(
            "Kafka producer failed.\n"
            f"Command: {' '.join(command)}\n"
            f"stdout:\n{stdout}\n"
            f"stderr:\n{stderr}"
        )
    return produced_count


def run_consumer(
    args: argparse.Namespace,
    group_id: str,
    max_messages: int,
) -> tuple[list[dict[str, object]], int]:
    command = [
        args.docker_bin,
        "exec",
        args.container,
        "kafka-console-consumer",
        "--bootstrap-server",
        args.broker,
        "--topic",
        args.topic,
        "--group",
        group_id,
        "--from-beginning",
        "--max-messages",
        str(max_messages),
        "--timeout-ms",
        str(args.timeout_ms),
    ]
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0 and not result.stdout.strip():
        raise RuntimeError(
            "Kafka consumer failed before returning messages.\n"
            f"Command: {' '.join(command)}\n"
            f"stdout:\n{result.stdout}\n"
            f"stderr:\n{result.stderr}"
        )

    rows: list[dict[str, object]] = []
    skipped_count = 0
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            skipped_count += 1
            continue
        if isinstance(value, dict):
            rows.append(value)
        else:
            skipped_count += 1

    if not rows:
        raise RuntimeError(
            "No JSON object messages were consumed. Check topic, group, and offsets."
        )
    return rows, skipped_count


def write_parquet(rows: list[dict[str, object]], output_path: Path) -> None:
    try:
        import pandas as pd
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: install pandas and pyarrow first, "
            "for example `python -m pip install pandas pyarrow`."
        ) from exc

    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe = pd.DataFrame(rows)
    try:
        dataframe.to_parquet(output_path, index=False)
    except Exception as exc:  # pandas raises different errors per engine setup.
        raise SystemExit(
            "Failed to write Parquet. Install pyarrow or fastparquet, "
            "for example `python -m pip install pyarrow`."
        ) from exc


def write_preview_html(
    rows: list[dict[str, object]],
    preview_path: Path,
    parquet_path: Path,
    topic: str,
    group_id: str,
) -> None:
    preview_path.parent.mkdir(parents=True, exist_ok=True)
    columns = list(rows[0].keys())
    header = "".join(f"<th>{html.escape(column)}</th>" for column in columns)
    body_rows = []
    for row in rows[:50]:
        cells = "".join(
            f"<td>{html.escape(str(row.get(column, '')))}</td>"
            for column in columns
        )
        body_rows.append(f"<tr>{cells}</tr>")

    preview_path.write_text(
        f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Kafka replay Parquet preview</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 24px; color: #17202a; }}
    code {{ background: #eef2f7; padding: 2px 5px; border-radius: 4px; }}
    table {{ border-collapse: collapse; width: 100%; font-size: 13px; }}
    th, td {{ border: 1px solid #d8dee9; padding: 7px 9px; text-align: left; }}
    th {{ background: #f2f5f9; position: sticky; top: 0; }}
    .meta {{ margin-bottom: 18px; line-height: 1.6; }}
    .table-wrap {{ max-height: 70vh; overflow: auto; }}
  </style>
</head>
<body>
  <h1>Kafka replay Parquet preview</h1>
  <div class="meta">
    <div>Topic: <code>{html.escape(topic)}</code></div>
    <div>Consumer group: <code>{html.escape(group_id)}</code></div>
    <div>Rows in Parquet: <code>{len(rows)}</code></div>
    <div>Parquet file: <code>{html.escape(str(parquet_path))}</code></div>
  </div>
  <div class="table-wrap">
    <table>
      <thead><tr>{header}</tr></thead>
      <tbody>{''.join(body_rows)}</tbody>
    </table>
  </div>
</body>
</html>
""",
        encoding="utf-8",
    )


def default_group_id() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"kafka-parquet-demo-reader-{stamp}"


def main() -> int:
    args = parse_args()
    if args.limit < 0:
        raise SystemExit("--limit must be 0 or a positive integer.")
    if args.max_messages is not None and args.max_messages <= 0:
        raise SystemExit("--max-messages must be a positive integer.")

    group_id = args.group or default_group_id()
    try:
        produced_count = 0
        if not args.skip_produce:
            produced_count = run_producer(args)
            print(f"Produced {produced_count} messages to topic {args.topic}.")

        max_messages = args.max_messages or produced_count
        if max_messages <= 0:
            raise SystemExit(
                "--max-messages is required when --skip-produce is used."
            )

        rows, skipped_count = run_consumer(args, group_id, max_messages)
        write_parquet(rows, args.output)
        print(f"Consumed {len(rows)} JSON object messages with group {group_id}.")
        print(f"Wrote Parquet: {args.output}")
        if skipped_count:
            print(f"Skipped {skipped_count} non-JSON-object message(s).")

        if args.preview_html:
            write_preview_html(
                rows=rows,
                preview_path=args.preview_html,
                parquet_path=args.output,
                topic=args.topic,
                group_id=group_id,
            )
            print(f"Wrote preview HTML: {args.preview_html}")
    except FileNotFoundError as exc:
        print(f"ERROR: command not found: {exc.filename}", file=sys.stderr)
        return 1
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
