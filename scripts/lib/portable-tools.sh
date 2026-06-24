#!/usr/bin/env bash

portable_python_bin() {
  if command -v python3 >/dev/null 2>&1; then
    printf '%s\n' "python3"
    return 0
  fi

  if command -v python >/dev/null 2>&1; then
    printf '%s\n' "python"
    return 0
  fi

  echo "python3 or python is required for AskLake portability helpers." >&2
  return 127
}

portable_rg_helper() {
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  printf '%s\n' "${script_dir}/portable_rg.py"
}

portable_rg_backend_available() {
  if [[ "${ASKLAKE_FORCE_PORTABLE_RG:-0}" == "1" ]]; then
    return 1
  fi

  command -v rg >/dev/null 2>&1 && command rg --version >/dev/null 2>&1
}

portable_rg_notice_once() {
  if [[ -n "${ASKLAKE_PORTABLE_RG_NOTICE:-}" ]]; then
    return 0
  fi

  echo "INFO: rg is unavailable in this shell; using the Python fallback search backend." >&2
  ASKLAKE_PORTABLE_RG_NOTICE=1
}

rg() {
  if portable_rg_backend_available; then
    command rg "$@"
    return $?
  fi

  portable_rg_notice_once

  local quiet=0
  local count=0
  local only_matching=0
  local line_number=0
  local pattern=""
  local -a files=()

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -q)
        quiet=1
        shift
        ;;
      -c)
        count=1
        shift
        ;;
      -o)
        only_matching=1
        shift
        ;;
      -n)
        line_number=1
        shift
        ;;
      --no-filename)
        shift
        ;;
      --)
        shift
        if [[ $# -eq 0 ]]; then
          echo "portable rg fallback requires a pattern after --" >&2
          return 2
        fi
        pattern="$1"
        shift
        files=("$@")
        break
        ;;
      -h|--help)
        echo "portable rg fallback supports -q, -c, -o, -n, and --no-filename." >&2
        return 0
        ;;
      -*)
        echo "portable rg fallback does not support option: $1" >&2
        return 2
        ;;
      *)
        pattern="$1"
        shift
        files=("$@")
        break
        ;;
    esac
  done

  if [[ -z "$pattern" ]]; then
    echo "portable rg fallback requires a pattern." >&2
    return 2
  fi

  local python_bin
  python_bin="$(portable_python_bin)" || return $?

  if [[ "$quiet" -eq 1 ]]; then
    "$python_bin" "$(portable_rg_helper)" quiet "$pattern" "${files[@]}"
    return $?
  fi

  if [[ "$count" -eq 1 ]]; then
    "$python_bin" "$(portable_rg_helper)" count "$pattern" "${files[@]}"
    return $?
  fi

  if [[ "$only_matching" -eq 1 ]]; then
    "$python_bin" "$(portable_rg_helper)" extract "$pattern" "${files[@]}"
    return $?
  fi

  if [[ "$line_number" -eq 1 ]]; then
    "$python_bin" "$(portable_rg_helper)" lines "$pattern" "${files[@]}"
    return $?
  fi

  "$python_bin" "$(portable_rg_helper)" lines "$pattern" "${files[@]}"
}
