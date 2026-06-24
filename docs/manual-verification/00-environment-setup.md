# 00. Environment Setup

## 목적

local 또는 target 검증 환경이 준비되었는지 확인한다.

## 사전 조건

- 필요한 도구가 설치되어 있다.
- 필요한 env example 또는 설정 안내가 있다.
- 실제 secret이 commit되어 있지 않다.
- OS/shell 조합이 `docs/04-development-guide.md`의 지원 등급과 일치한다.

## 절차

1. OS와 shell을 기록한다. Windows는 WSL2 + Docker Desktop integration인지 native PowerShell/CMD인지 구분한다.
2. `git`, `docker`, `docker compose`, `bash`, `curl`, `python3` 또는 `python` readiness를 확인한다. `rg`는 있으면 확인하고, 없으면 harness scripts의 Python fallback 동작 여부를 기록한다. `node`, `npm`은 host frontend direct run 경로를 검증할 때만 readiness를 확인한다.
3. setup command가 있다면 실행한다.
4. migration 또는 init command가 필요하면 실행한다.
5. service 또는 app을 시작한다.
6. health/smoke target을 확인한다.

## 기대 결과

- 필요한 service가 시작된다.
- health/smoke target이 응답한다.
- log에 blocking error가 없다.

## 실패 시

- env 값을 확인한다.
- port/process 충돌을 확인한다.
- dependency 설치 상태를 확인한다.
- migration/data 초기화 상태를 확인한다.
- 기존 checkout의 `scripts/*.sh`가 CRLF인지, 현재 shell과 다른 Git 구현으로 만든 worktree인지 확인한다.
- Windows native shell이면 WSL2 경로로 재검증할지 또는 cross-platform tooling Phase로 분리할지 기록한다.

## 증거

- 실행한 명령
- 결과
- 필요한 경우 log/screenshot
