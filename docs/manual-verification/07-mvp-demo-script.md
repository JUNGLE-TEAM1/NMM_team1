# 07. MVP Demo Script

## 목적

AskLake MVP를 3분 안에 재현 가능한 흐름으로 시연한다.

## 사전 조건

- Docker Desktop 또는 Docker Compose가 실행 가능하다.
- repository root에서 명령을 실행한다.
- 기본 포트 `3000`, `8000`이 비어 있다. 충돌이 있으면 `scripts/smoke-container-app.sh`의 smoke 전용 포트 `13000`, `18000` 경로로 먼저 검증한다.

## 실행

```bash
docker compose build
docker compose up
```

Frontend는 `http://localhost:3000`, backend health는 `http://localhost:8000/health`에서 확인한다.

## 3분 Golden Path

1. 화면 상단 health 상태가 `ok`인지 확인한다.
2. 기본 CSV 경로 `samples/orders.csv`로 source를 등록한다.
3. Catalog 상세에서 schema, row count, sample rows를 확인한다.
4. Pipeline Run 영역에서 기본 선택 컬럼으로 pipeline을 실행한다.
5. run status가 `success`인지 확인한다.
6. Catalog 상세가 result dataset으로 이동했는지 확인한다.
7. result dataset의 schema, row count, 저장 위치를 설명한다.

## 실패 경로

1. CSV 경로를 `samples/missing.csv`로 바꿔 source 등록을 시도한다.
2. 오류 메시지가 표시되고 ready dataset이 생기지 않는지 확인한다.
3. 존재하지 않는 컬럼 이름으로 pipeline을 만들면 오류가 표시되는지 확인한다.

## 자동 Smoke

```bash
scripts/smoke-container-app.sh
```

이 smoke는 source 등록, pipeline 생성, run success, result catalog 생성을 한 번에 확인한다.

## 데모 종료

```bash
docker compose down --remove-orphans
```

## 기록할 증거

- 실행 환경: local Docker Compose 또는 smoke script
- 성공 흐름: source 이름, pipeline 이름, result dataset 이름
- 실패 흐름: 오류 메시지
- 남은 제한: local CSV result store, 실제 AWS/EKS deploy 미실행
