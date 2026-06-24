#!/usr/bin/env python3
import pathlib
import re
import sys


def load_targets(paths):
    if not paths:
        return [(None, sys.stdin.read())]

    loaded = []
    for raw_path in paths:
        path = pathlib.Path(raw_path)
        if path.is_dir():
            for nested in sorted(candidate for candidate in path.rglob("*") if candidate.is_file()):
                loaded.append((str(nested), nested.read_text(encoding="utf-8", errors="ignore")))
            continue
        try:
            loaded.append((raw_path, path.read_text(encoding="utf-8", errors="ignore")))
        except FileNotFoundError:
            print(f"{raw_path}: No such file or directory", file=sys.stderr)
            raise SystemExit(2)
    return loaded


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: portable_rg.py <mode> <pattern> [files...]", file=sys.stderr)
        return 2

    mode = sys.argv[1]
    pattern = sys.argv[2]
    paths = sys.argv[3:]
    regex = re.compile(pattern)
    targets = load_targets(paths)

    if mode == "quiet":
      for _, text in targets:
        if regex.search(text):
          return 0
      return 1

    if mode == "count":
      count = 0
      for _, text in targets:
        count += sum(1 for line in text.splitlines() if regex.search(line))
      print(count)
      return 0

    if mode == "extract":
      matched = False
      for _, text in targets:
        for match in regex.finditer(text):
          print(match.group(0))
          matched = True
      return 0 if matched else 1

    if mode == "lines":
      matched = False
      for path, text in targets:
        for line_number, line in enumerate(text.splitlines(), start=1):
          if regex.search(line):
            if path:
              print(f"{path}:{line_number}:{line}")
            else:
              print(f"{line_number}:{line}")
            matched = True
      return 0 if matched else 1

    print(f"Unsupported mode: {mode}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
