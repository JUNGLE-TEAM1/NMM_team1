# M2 source input 계약 확장 계획

## 목표

M2 `RuntimeConfig.source_inputs[]`가 기존 `input_format` / `input_path`를 계속 받으면서, 미래 UI source connection 흐름에 맞는 `source_type` / `format` / `path` 표현도 받을 수 있게 한다.

## 범위

- 기존 `input_format` / `input_path` 호출은 제거하지 않는다.
- 새 필드는 additive로 추가한다.
- 이번 실행 지원 범위는 `source_type=local_file`만이다.
- `postgres`, `mongodb`, `kafka`, `s3` 직접 연결은 아직 connector가 없으므로 명확한 failed result로 남긴다.
- UI source connection, credential 저장, 실제 DB/Kafka connector 구현은 포함하지 않는다.

## 완료 조건

- 기존 multi-source runner 테스트가 통과한다.
- 새 `source_type=local_file`, `format`, `path` 입력 테스트가 통과한다.
- 미지원 source type 테스트가 실패 result를 확인한다.
- `contracts/runtime_config.sample.json`과 `docs/03-interface-reference.md`에 계층 구분이 반영된다.
