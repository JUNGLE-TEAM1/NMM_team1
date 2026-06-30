# PH-DATA-2C 보고서

## 상태

Completed.

## 변경 요약

- `scripts/product_health_synthetic_smoke.py`의 source evidence에 `available_source_bytes`, `processed_input_bytes`, `bytes_semantics`를 추가했다.
- run summary에 `available_source_total_bytes`, `processed_input_total_bytes`, `processed_input_total_bytes_status`, `input_total_bytes_semantics`를 추가했다.
- 기존 `input_total_bytes`는 하위 호환 필드로 유지하되 smoke에서는 available source bytes임을 명시했다.
- `product-health-synthetic-data-contract.md`, ver2 README, PH-DATA-3 plan을 실제 처리 bytes 기준으로 갱신했다.

## 검증

| 항목 | 결과 |
| --- | --- |
| smoke script | passed |
| JSON assertion | passed |
| available source bytes | `11080285895` |
| processed input bytes | `null`, smoke row-limited read라 byte 미측정 |
| PH-DATA-3 기준 | `processed_input_total_bytes >= 5GB` |

실행 명령:

```bash
.venv/bin/python scripts/product_health_synthetic_smoke.py
.venv/bin/python - <<'PY'
import json
from pathlib import Path
root = Path('data/local_sources/product_health')
summary = json.loads((root/'evidence/product_health_run_summary.json').read_text())
assert summary['available_source_total_bytes'] > 5 * 1024**3
assert summary['processed_input_total_bytes'] is None
assert summary['input_total_bytes'] == summary['available_source_total_bytes']
assert summary['input_total_bytes_semantics'] == 'available_source_bytes_for_backward_compatibility_not_5gb_processed_evidence'
assert all('available_source_bytes' in source for source in summary['sources'])
assert all('processed_input_bytes' in source for source in summary['sources'])
assert all(source.get('bytes_semantics') == 'available_source_bytes' for source in summary['sources'])
PY
```

## Handoff

PH-DATA-3은 이번 smoke summary를 5GB 처리 증거로 사용하지 않는다.

PH-DATA-3에서는 실제 처리량을 측정해 `processed_input_total_bytes >= 5GB`를 기록하고, 그때부터 `input_total_bytes`도 같은 의미로 맞춘다.
