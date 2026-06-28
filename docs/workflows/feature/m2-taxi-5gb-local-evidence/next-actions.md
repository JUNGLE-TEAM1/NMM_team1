# M2 Taxi 5GB local Spark evidence 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: local evidence complete; PR prep pending
- Summary: PySpark local mode로 Taxi 5GB급 Parquet directory를 읽고 daily Gold Parquet을 생성했다. 이제 문서/검증을 마무리하고 PR로 올릴 수 있다.

## Recommended Next Action / 권장 다음 행동

- 검증 명령을 마저 실행한 뒤 commit과 PR을 생성한다.
- Reason: 이번 branch의 목표였던 local Spark 5GB evidence는 성공했고, Docker Spark cluster는 다음 branch 범위다.

## Options / 선택지

1. PR-ready 검증을 끝내고 PR을 생성한다.
2. 같은 branch에서 MinIO/S3 write까지 추가한다.
3. 이 branch를 닫고 다음 branch에서 Docker Spark cluster를 진행한다.
4. Product Health 5GB 입력이 준비될 때까지 M2 작업을 멈춘다.

## Waiting On Human / 사람 응답 대기

- PR 생성 또는 후속 범위 확정.

## Last User Choice / 마지막 사용자 선택

- 사용자는 "짧게 local Spark 5GB 먼저 실행"을 지시했다.

## Next AI Action / 다음 AI 행동

- option 1이면 local validation을 마저 실행하고 commit/PR을 생성한다.
- option 2이면 `plan.md`를 수정하고 MinIO/S3 smoke를 추가한다.
- option 3이면 현재 branch를 PR로 올린 뒤 Docker Spark cluster branch를 시작한다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
