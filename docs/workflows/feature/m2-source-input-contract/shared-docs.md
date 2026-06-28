# M2 source input 계약 확장 공유 문서

| 문서 | 변경 | 이유 | 위험 |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | `RuntimeConfig.source_inputs[]`의 legacy 필드와 새 필드 호환 기준 추가 | M2/M3/M5/M6 공유 contract라서 Source of Truth에 반영 필요 | 낮음: additive |
| `docs/06-regression-and-failure-scenarios.md` | `source_type`과 `format` 계층을 섞지 않는 regression guard 추가 | 후속 팀원이 DB/Kafka 연결과 파일 형식을 같은 칸으로 다루지 않게 함 | 낮음: 문서 guard |
| `contracts/runtime_config.sample.json` | Product Health source input fixture에 새 필드와 legacy 필드 병기 | 실제 fixture로 호환 shape를 보여줌 | 낮음: 기존 필드 유지 |
