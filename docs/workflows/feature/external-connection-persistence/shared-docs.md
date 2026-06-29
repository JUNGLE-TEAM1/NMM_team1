# External connection persistence 공유 문서 영향

| 문서 | 예상 영향 | 위험 |
| --- | --- | --- |
| `docs/03-interface-reference.md` | 기존 `SourceConnection` / `SourceConfig.connection_ref`에 External Connection UI mapping note 추가 가능 | 낮음 |
| `contracts/source_config.sample.json` | 필요 시 `connection_ref.kind` 예시를 CSV/Kafka/S3/API로 확장 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | connection 생성 acceptance 추가 가능 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | secret 저장 금지와 새 connection schema 발명 금지 기준 추가 가능 | 중간 |
