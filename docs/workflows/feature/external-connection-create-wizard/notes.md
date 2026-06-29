# External connection create wizard 노트

## 진행 메모

- 2026-06-29: External Connection 생성 wizard를 `Connector Type -> Configure -> Review` 3단계로 구현함.
- Connector type은 CSV, Kafka, PostgreSQL, MongoDB, REST API, S3를 제공한다.
- Configure는 connection name과 type별 resource placeholder만 다루며 secret 입력/저장/연결 테스트는 하지 않는다.

## 결정

- External Connection은 Source Dataset보다 앞선 연결 설정 draft로 표현한다.
- 최종 CTA는 disabled `Connection draft 준비`로 두어 실제 저장/API 호출을 암시하지 않는다.

## 열린 질문

- R-3에서 Source Dataset wizard가 External Connection card를 선택하도록 기존 source type/card UI를 교체해야 한다.

## 링크 / 증거

- `npm run build` in `frontend/`: pass
- `scripts/validate-harness.sh`: pass
- Browser smoke: `http://127.0.0.1:13000/dataset`
