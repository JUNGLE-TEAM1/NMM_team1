import argparse
import json
import os
from pathlib import Path
from typing import Any

from pymongo import MongoClient


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load a JSONL sample into a MongoDB collection.")
    parser.add_argument("--input", required=True, help="Path to a JSONL file.")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=27017)
    parser.add_argument("--database", default="asklake_demo")
    parser.add_argument("--collection", default="customer_events")
    parser.add_argument("--username", default="asklake")
    parser.add_argument("--password-env", default="ASKLAKE_MONGODB_PASSWORD")
    parser.add_argument("--auth-source", default="admin")
    parser.add_argument("--limit", type=int, default=500)
    parser.add_argument("--truncate", action="store_true")
    return parser.parse_args()


def read_jsonl(path: Path, limit: int) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as file:
        for line in file:
            if len(rows) >= limit:
                break
            stripped = line.strip()
            if not stripped:
                continue
            rows.append(json.loads(stripped))
    return rows


def main() -> None:
    args = parse_args()
    input_path = Path(args.input)
    password = os.environ.get(args.password_env)
    if not password:
        raise SystemExit(f"Missing password env: {args.password_env}")

    rows = read_jsonl(input_path, args.limit)
    if not rows:
        raise SystemExit(f"No rows found in {input_path}")

    with MongoClient(
        host=args.host,
        port=args.port,
        username=args.username,
        password=password,
        authSource=args.auth_source,
        serverSelectionTimeoutMS=5000,
    ) as client:
        client.admin.command("ping")
        collection = client[args.database][args.collection]
        if args.truncate:
            collection.delete_many({})
        result = collection.insert_many(rows, ordered=True)
        total = collection.estimated_document_count()

    print(
        json.dumps(
            {
                "input": str(input_path),
                "database": args.database,
                "collection": args.collection,
                "inserted_count": len(result.inserted_ids),
                "collection_count_estimate": total,
                "limit": args.limit,
                "truncated": args.truncate,
            },
            ensure_ascii=False,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
