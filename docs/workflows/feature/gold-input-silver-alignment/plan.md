# Gold input silver alignment 계획

## 목표

Gold Dataset 생성 wizard의 입력을 Source Dataset 직접 선택에서 Silver Dataset 선택으로 보정한다.

## 문제 정의

- 현재 Gold/Target Dataset wizard는 Source Dataset을 직접 선택한다.
- Silver Dataset은 자동 파생 planned output으로 취급되어 Medallion 구조가 흐릿하다.
- Gold는 원칙적으로 Silver Dataset을 조합해 만드는 것이 더 자연스럽다.

## 범위

- Gold Dataset wizard Source 선택 단계를 Silver Dataset 선택 단계로 변경
- 2개 이상 Silver Dataset 선택 지원
- selected Silver Dataset에서 source lineage와 processing recipe 요약 구성
- 기존 source 기반 draft와의 최소 호환 표시

## 제외

- Silver Dataset 생성
- Silver/Gold materialization 실행
- Job schedule edit
- 기존 draft 대규모 migration

## 완료 기준

- Gold Dataset 생성은 Silver Dataset 목록을 입력으로 보여준다.
- 저장 payload는 Silver input context를 보존한다.
- UI 문구에서 Gold가 Source를 직접 조합하는 것처럼 보이지 않는다.
