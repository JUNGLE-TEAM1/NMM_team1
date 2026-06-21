# AskLake AWS 비용 정리

작성일: 2026-06-22

이 문서는 현재 `feature/aws-bootstrap-readiness` 기준으로 AWS를 실제 구동할 때 예상되는 비용을 팀원이 빠르게 판단하기 위한 문서다.
금액은 대략적인 월 비용이며, 실제 청구액은 AWS 가격 변경, region, 사용량, free tier, 세금, 환율, 로그/트래픽 패턴에 따라 달라진다.

## 기준

- Region: `ap-northeast-2` 서울
- 월 계산: 730시간
- 기본 target: EKS-ready bootstrap
- EKS node: `t3.small` 1대, 최대 2대
- Node volume: 30GB gp3 가정
- Registry: ECR private repository
- Dataset storage: 아직 실제 AWS 리소스로 만들지 않았으므로 S3 또는 EBS 사용 시 추가 비용으로 분리
- 실제 AWS resource 생성은 아직 하지 않았다.

## 기본 상시 비용

현재 구성 그대로 EKS를 24시간 켜면 기본 비용은 아래 정도로 본다.

| 항목 | 기준 | 예상 월 비용 | 비고 |
| --- | --- | ---: | --- |
| EKS control plane | $0.10/hour * 730h | 약 $73.00 | pod가 없어도 cluster가 살아 있으면 발생 |
| EC2 worker node | `t3.small` Linux On-Demand, $0.026/hour * 730h | 약 $18.98 | node 1대 기준 |
| EBS node volume | gp3 30GB * $0.08/GB-month | 약 $2.40 | node root volume 가정 |
| Public IPv4 | 1개 * $0.005/hour * 730h | 약 $3.65 | public subnet/node 사용 시 발생 가능 |
| ECR image storage | 예: 1GB * $0.10/GB-month | 약 $0.10 | image 보관량에 따라 증가 |
| CloudWatch logs | 소량 로그 | 약 $0~5 | 로그량과 보관 기간에 따라 증가 |

기본 합계는 대략 **월 $98~105** 수준이다.
환율 1달러 1,400원 가정 시 약 **월 13.7만~14.7만 원** 정도다.

## 노드 수에 따른 비용

현재 EKS config는 `desiredCapacity: 1`, `maxSize: 2`다.

| 노드 수 | 추가되는 주요 비용 | 예상 월 비용 |
| --- | --- | ---: |
| 1대 | EKS + EC2 1대 + EBS + IPv4 | 약 $98~105 |
| 2대 | EC2/EBS/IPv4가 1대분 추가 | 약 $123~130 |

CPU burst가 오래 지속되면 T3 unlimited CPU credit 비용이 추가될 수 있다.

## 데이터셋 저장 비용

AskLake MVP는 아직 실제 S3 bucket이나 DB를 만들지 않았다.
데이터셋을 AWS에 저장하기 시작하면 저장 위치에 따라 비용이 달라진다.

| 데이터셋 크기 | S3 Standard 저장비 | EBS gp3 저장비 | 비고 |
| ---: | ---: | ---: | --- |
| 1GB | 약 $0.02/월 | 약 $0.08/월 | 거의 무시 가능 |
| 10GB | 약 $0.23/월 | 약 $0.80/월 | MVP 샘플 수준 |
| 100GB | 약 $2.30/월 | 약 $8.00/월 | 저장비보다 로그/전송비가 더 중요해질 수 있음 |
| 1TB | 약 $23.55/월 | 약 $81.92/월 | S3가 장기 저장에 유리 |
| 5TB | 약 $117.76/월 | 약 $409.60/월 | lifecycle/압축/삭제 정책 필요 |

권장:

- 원본/결과 데이터셋은 S3를 우선 검토한다.
- EBS는 node-local 임시 처리나 짧은 수명 데이터에만 사용한다.
- 오래 보관할 데이터는 lifecycle policy를 설계한다.

## 데이터 처리와 로그 비용

데이터셋 자체보다 더 위험한 비용은 로그와 외부 전송이다.

| 사용 패턴 | 비용 영향 | 예시 |
| --- | --- | --- |
| 처리 결과를 모두 CloudWatch에 출력 | 매우 위험 | 100GB 로그 ingest면 약 $47.5 이상 가능 |
| 데이터셋을 인터넷으로 자주 다운로드 | 중간~높음 | 100GB/month까지는 free tier 가능, 이후 대략 GB당 $0.09 구간 |
| S3 내부 저장 후 EKS가 같은 region에서 읽기 | 낮음 | 같은 region 내부 사용이면 보통 인터넷 반출보다 안전 |
| ECR image를 같은 region의 EKS에서 pull | 낮음 | ECR storage만 주로 발생 |

예상 추가 비용 예시:

| 월 사용량 | CloudWatch log ingest 추가 | 인터넷 반출 추가 |
| ---: | ---: | ---: |
| 10GB | 약 $2.50 | $0 |
| 100GB | 약 $47.50 | $0 |
| 1TB | 약 $509.50 | 약 $83.16 |
| 5TB | 약 $2,557.50 | 약 $451.80 |

이 표는 “데이터셋 전체가 로그나 인터넷 반출로 나간다”는 나쁜 상황을 보여준다.
정상 설계에서는 데이터셋 내용을 로그에 찍지 않고, 외부 다운로드도 제한해야 한다.

## 선택 리소스 비용

현재 manifest는 `ClusterIP`라 외부 LoadBalancer를 만들지 않는다.
하지만 외부 접속을 위해 ALB/NLB, NAT Gateway, private subnet 구성을 붙이면 비용이 늘어난다.

| 항목 | 비용 영향 | 설명 |
| --- | --- | --- |
| ALB/NLB | 대략 월 $20~35+ | 외부 HTTP/TCP endpoint를 만들 때 발생 |
| NAT Gateway | 대략 월 $30~50+ per NAT + GB 처리비 | private node가 인터넷으로 image/package를 받으면 필요할 수 있음 |
| 추가 public IPv4 | IP당 약 $3.65/월 | EC2, NAT, Load Balancer 등에서 발생 가능 |
| 추가 EBS volume | gp3 기준 약 $0.08/GB-month | DB나 persistent volume을 붙일 때 발생 |

비용을 줄이려면:

- 처음에는 `ClusterIP`와 포트포워딩/내부 smoke 위주로 검증한다.
- 외부 endpoint는 꼭 필요할 때만 만든다.
- NAT Gateway를 만들기 전에 public subnet node, VPC endpoint, App Runner/ECS 대안을 비교한다.

## 시나리오별 추정

| 시나리오 | 구성 | 월 예상 |
| --- | --- | ---: |
| 로컬/문서만 유지 | AWS 리소스 없음 | $0 |
| ECR만 생성하고 image 소량 저장 | ECR 1~5GB | 약 $0.10~0.50 |
| EKS dev cluster 최소 상시 운영 | EKS + t3.small 1대 + 30GB EBS + IPv4 | 약 $98~105 |
| EKS dev cluster + worker 2대 | 위 구성 + worker 1대 추가 | 약 $123~130 |
| EKS + ALB 외부 접속 | 최소 EKS + ALB | 약 $120~140+ |
| EKS private networking + NAT | 최소 EKS + NAT 1개 | 약 $130~160+ |
| 1TB 데이터셋 S3 저장 추가 | 최소 EKS + S3 1TB | 약 $122~130 |
| 1TB 데이터셋을 인터넷으로 매월 전부 다운로드 | 최소 EKS + S3 + egress | 약 $205+ |

## 팀 판단

MVP 초반에 EKS를 상시 운영하면 고정비가 높다.
Kubernetes 검증이 목적이면 EKS를 짧게 켜고 바로 삭제하는 방식이 안전하다.

비용 우선이면 다음 대안을 비교하는 것이 좋다.

- App Runner: 운영 부담이 낮고 MVP API/UI 배포가 빠름.
- ECS/Fargate: EKS control plane 비용 없이 container 운영 가능.
- EKS: Kubernetes 학습/운영 검증에는 좋지만 월 고정비가 큼.

## 권장 비용 guard

- AWS Budget을 월 $30, $75, $120 구간으로 설정한다.
- EKS 생성 전에 삭제 명령과 owner를 기록한다.
- CloudWatch log retention을 짧게 둔다.
- 데이터셋 내용을 application log에 출력하지 않는다.
- S3 lifecycle policy를 둔다.
- 실험 cluster는 작업 후 삭제한다.
- `ASKLAKE_AWS_APPROVED=APPROVED` 없이 `--execute`를 실행하지 않는다.

## 참고 공식 자료

- Amazon EKS Pricing: https://aws.amazon.com/eks/pricing/
- Amazon EC2 On-Demand Pricing: https://aws.amazon.com/ec2/pricing/on-demand/
- Amazon ECR Pricing: https://aws.amazon.com/ecr/pricing/
- Amazon EBS Pricing: https://aws.amazon.com/ebs/pricing/
- Amazon S3 Pricing: https://aws.amazon.com/s3/pricing/
- Amazon CloudWatch Pricing: https://aws.amazon.com/cloudwatch/pricing/
- Elastic Load Balancing Pricing: https://aws.amazon.com/elasticloadbalancing/pricing/
- Amazon VPC Pricing: https://aws.amazon.com/vpc/pricing/
