# M4 Kafka contract smoke fixture 정리 공유 문서 변경

## Proposed Source Of Truth Changes

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `contracts/kafka_topic_contract.sample.json` | M4 replay rate/source file TODO를 실제 smoke evidence 값으로 확정 | M4 contract fixture가 더 이상 미확정 값으로 남지 않게 하기 위해 | 낮음 |

## Integration Notes

- M4는 product-health 1차 발표 핵심 경로가 아니라 supporting evidence다.
- Kafka를 Gold 생성 필수 입력으로 연결하지 않는다.

## Conflicts To Resolve

- 없음.
