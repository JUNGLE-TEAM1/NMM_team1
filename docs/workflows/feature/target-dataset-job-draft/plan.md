# Target dataset job draft 계획

## 브랜치

- Branch: `feature/target-dataset-job-draft`
- Workspace: `docs/workflows/feature/target-dataset-job-draft`
- Created: 2026-06-29

## 목표

- `Target Dataset` wizard의 Review 결과를 Target Dataset metadata와 ETL job definition draft로 저장한다.
- 실행은 하지 않고, M5 run handoff가 받을 수 있는 job definition 계약을 준비한다.

## 범위

- Target Dataset create/list/read API.
- ETL Job Definition draft create/read API 또는 Target Dataset 내부 draft field.
- 저장 필드: `target_dataset_id`, `source_dataset_id`, `process_rule`, `selected_fields`, `schedule`, `job_definition`, `status=draft`.
- Review 화면에서 저장된 draft id를 표시한다.

## 범위 제외

- M5 run 생성.
- M2/M4 runtime 실행.
- CatalogMetadata 등록.
- AI Query 연결.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/target-dataset-job-draft` Phase만 구현한다.
Target Dataset wizard Review 결과를 target dataset metadata와 ETL job definition draft로 저장/조회한다.
실행 버튼, run history, M5 orchestration 호출은 구현하지 않는다.
저장 계약은 후속 `feature/target-dataset-run-handoff`가 그대로 소비할 수 있게 구조화한다.
```

## 완료 기준

- [ ] Target Dataset draft를 저장할 수 있다.
- [ ] ETL job definition draft가 source/process/schedule 정보를 가진다.
- [ ] 저장 후 review/summary에서 draft id를 확인할 수 있다.
- [ ] 실행 또는 run 생성은 발생하지 않는다.
- [ ] report와 quality evidence를 남긴다.
