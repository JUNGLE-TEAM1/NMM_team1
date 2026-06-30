# LLM local env 설정 파일 연결 계획

## 목표

- 앱 UI에 API key 입력칸을 만들지 않는다.
- repository root의 `.env.local`을 VS Code에서 직접 열어 편집할 수 있게 한다.
- `.env.local`은 Git ignored 상태로 유지한다.
- Docker Compose backend가 `.env.local`의 LLM 설정을 읽는다.

## 범위

- `.gitignore`, `.env.example`, `docker-compose.yml` 설정 보강
- LLM env contract 관련 최소 문서 업데이트
- 실제 API key 생성, 노출, 저장 대행은 제외
