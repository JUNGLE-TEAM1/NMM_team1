import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  FileCheck2,
  FileJson,
  FolderOpen,
  GitBranch,
  GitMerge,
  HardDrive,
  HelpCircle,
  Layers3,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  MessageSquareText,
  MonitorCheck,
  Network,
  Play,
  PlayCircle,
  Plus,
  RefreshCw,
  Route,
  Save,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Table2,
  Terminal,
  Trash2,
  Workflow,
  Wrench,
  X,
} from "lucide-react";

import {
  WEEK2_DEFAULT_DATASET_ID,
  WEEK2_DEFAULT_PIPELINE_ID,
  askWeek2AiQuery,
  getWeek2AirflowReadiness,
  getHealth,
  getWeek2Catalog,
  getWeek2Run,
  getWeek2SparkReadiness,
  triggerWeek2Run,
} from "../api/asklakeClient";
import {
  createExternalConnection,
  deleteExternalConnection,
  getExternalConnectionCredentialPolicy,
  inspectExternalConnection,
  listExternalConnections,
  testExternalConnection,
  updateExternalConnection,
} from "../api/externalConnectionApi";
import { getCatalogDatasetManagementPolicy, listCatalogDatasets } from "../api/catalogApi";
import { getKafkaReplayHealth, getKafkaReplayRun, listKafkaReplayRuns } from "../api/kafkaReplayApi";
import {
  createSourceDataset,
  createSourceDatasetSnapshot,
  deleteSourceDataset,
  listProductHealthSourceInventory,
  listSourceDatasets,
  listSourceDatasetSnapshots,
  updateSourceDataset,
} from "../api/sourceDatasetApi";
import {
  createSilverDataset,
  createSilverDatasetMaterialization,
  deleteSilverDataset,
  listSilverDatasets,
  listSilverDatasetMaterializations,
  updateSilverDataset,
  updateSilverDatasetSchedule,
} from "../api/silverDatasetApi";
import {
  createTargetDatasetDraft,
  createTargetDatasetJobRun,
  deleteTargetDatasetDraft,
  executeTargetDatasetJobRun,
  listTargetDatasetDrafts,
  listTargetDatasetJobRuns,
  publishTargetDatasetJobRunToCatalog,
  updateTargetDatasetDraft,
  updateTargetDatasetDraftSchedule,
} from "../api/targetDatasetDraftApi";
import asklakeLogo from "../assets/asklake-logo.png";
import { StatusPill } from "../components/StatusPill";
import {
  m1AiQueryPlaceholder,
  m1CatalogPlaceholder,
  m1IntegrationRows,
  m1WorkflowPlaceholder,
} from "./m1StaticShellData";
import "./styles.css";

const WEEK2_DEFAULT_CATALOG_DETAIL_URL = `/catalog/${WEEK2_DEFAULT_DATASET_ID}`;
const AI_QUERY_SESSION_STORAGE_KEY = "asklake.ai_query.latest_result.v1";

const navItems = [
  {
    path: "/connections",
    label: "연결",
    description: "External",
    icon: ServerCog,
  },
  {
    path: "/datasets/source",
    label: "데이터셋",
    description: "Source / Silver / Gold",
    icon: Database,
    children: [
      {
        path: "/datasets/source",
        label: "Source Datasets",
      },
      {
        path: "/datasets/silver",
        label: "Silver Datasets",
      },
      {
        path: "/datasets/gold",
        label: "Gold Datasets",
      },
    ],
  },
  {
    path: "/jobs/silver-transform",
    label: "작업",
    description: "Sync / Transform / Build",
    icon: Workflow,
    children: [
      {
        path: "/jobs/connection-sync",
        label: "Connection Sync Jobs",
      },
      {
        path: "/jobs/silver-transform",
        label: "Silver Transform Jobs",
      },
      {
        path: "/jobs/gold-build",
        label: "Gold Build Jobs",
      },
    ],
  },
  {
    path: "/runs",
    label: "실행 기록",
    description: "Job Runs",
    icon: Play,
  },
  {
    path: "/catalog",
    label: "데이터 카탈로그",
    description: "Catalog",
    icon: LayoutDashboard,
  },
  {
    path: "/ask",
    label: "AI Query",
    description: "Ask / SQL",
    icon: MessageSquareText,
  },
];

const PRODUCT_HEALTH_DATASET_ID = "dataset_product_health_gold";

const integrationFlowSteps = [
  {
    id: "source",
    title: "Source",
    description: "연결할 원본 데이터를 고릅니다.",
    status: "선택 대기",
    icon: Database,
  },
  {
    id: "transform",
    title: "Transform",
    description: "처음에는 Select Fields만 다룹니다.",
    status: "설정 대기",
    icon: GitBranch,
  },
  {
    id: "target",
    title: "Target",
    description: "결과 dataset 이름을 정합니다.",
    status: "설정 대기",
    icon: Table2,
  },
  {
    id: "run",
    title: "Review",
    description: "생성 전 설정을 확인합니다.",
    status: "검토 대기",
    icon: Play,
  },
];

const demoSourceDatasets = [
  {
    id: "source_product_health_reviews",
    name: "Product Health Reviews",
    sourceType: "csv",
    typeLabel: "CSV / Local File",
    status: "Demo source",
    description: "리뷰 원문과 평점이 포함된 제품 상태 분석용 원천 파일입니다.",
    resource: "product_health_reviews.jsonl",
    updatedLabel: "오늘 10:15",
    updatedRank: 7,
    columns: ["review_id", "product_id", "rating", "review_text", "review_time"],
    schema: [
      { name: "review_id", type: "string", sample: "rv_10291" },
      { name: "product_id", type: "string", sample: "sku_8842" },
      { name: "rating", type: "number", sample: "4" },
      { name: "review_text", type: "text", sample: "배송은 빨랐지만 포장이 아쉬웠어요" },
      { name: "review_time", type: "datetime", sample: "2026-06-28 09:42" },
    ],
  },
  {
    id: "source_orders_csv",
    name: "Sample Orders CSV",
    sourceType: "csv",
    typeLabel: "CSV",
    status: "Baseline source",
    description: "주문 데모에 쓰는 정적 CSV dataset입니다.",
    resource: "sample_orders.csv",
    updatedLabel: "어제 18:20",
    updatedRank: 6,
    columns: ["order_id", "customer", "amount", "status"],
    schema: [
      { name: "order_id", type: "string", sample: "ord_32018" },
      { name: "customer", type: "string", sample: "J. Kim" },
      { name: "amount", type: "decimal", sample: "129000" },
      { name: "status", type: "string", sample: "paid" },
    ],
  },
  {
    id: "source_order_events_kafka",
    name: "Order Events Topic",
    sourceType: "kafka",
    typeLabel: "Kafka",
    status: "Streaming sample",
    description: "주문 생성, 결제, 취소 이벤트를 흘려보내는 topic 예시입니다.",
    resource: "commerce.order.events",
    updatedLabel: "오늘 09:40",
    updatedRank: 8,
    columns: ["event_id", "order_id", "event_type", "payload", "event_time"],
    schema: [
      { name: "event_id", type: "string", sample: "evt_98213" },
      { name: "order_id", type: "string", sample: "ord_32018" },
      { name: "event_type", type: "string", sample: "payment_confirmed" },
      { name: "payload", type: "json", sample: "{\"amount\":129000}" },
      { name: "event_time", type: "datetime", sample: "2026-06-29 09:40" },
    ],
  },
  {
    id: "source_commerce_orders_postgres",
    name: "Commerce Orders PostgreSQL",
    sourceType: "postgres",
    typeLabel: "PostgreSQL",
    status: "Warehouse ready",
    description: "운영 주문 테이블을 batch source로 연결하는 예시입니다.",
    resource: "commerce.orders",
    updatedLabel: "월요일 08:30",
    updatedRank: 5,
    columns: ["order_id", "user_id", "total_amount", "payment_status", "created_at", "updated_at"],
    schema: [
      { name: "order_id", type: "varchar", sample: "ord_32018" },
      { name: "user_id", type: "varchar", sample: "usr_2048" },
      { name: "total_amount", type: "numeric", sample: "129000" },
      { name: "payment_status", type: "varchar", sample: "paid" },
      { name: "created_at", type: "timestamp", sample: "2026-06-28 14:12" },
      { name: "updated_at", type: "timestamp", sample: "2026-06-28 14:18" },
    ],
  },
  {
    id: "source_customer_profiles_mongo",
    name: "Customer Profiles MongoDB",
    sourceType: "mongodb",
    typeLabel: "MongoDB",
    status: "Profile sample",
    description: "고객 속성 document를 통합하는 NoSQL source 예시입니다.",
    resource: "customer.profiles",
    updatedLabel: "지난주 금요일",
    updatedRank: 3,
    columns: ["_id", "segment", "preferences", "last_seen_at"],
    schema: [
      { name: "_id", type: "objectId", sample: "667f3c..." },
      { name: "segment", type: "string", sample: "loyal" },
      { name: "preferences", type: "document", sample: "{ channels: [\"email\"] }" },
      { name: "last_seen_at", type: "datetime", sample: "2026-06-21 22:10" },
    ],
  },
  {
    id: "source_partner_catalog_api",
    name: "Partner Catalog API",
    sourceType: "api",
    typeLabel: "API",
    status: "External sample",
    description: "파트너 상품 카탈로그를 API 응답 형태로 가져오는 예시입니다.",
    resource: "GET /partner/catalog",
    updatedLabel: "오늘 11:05",
    updatedRank: 9,
    columns: ["sku", "partner_id", "title", "category", "price", "synced_at"],
    schema: [
      { name: "sku", type: "string", sample: "PT-8842" },
      { name: "partner_id", type: "string", sample: "partner_17" },
      { name: "title", type: "string", sample: "Air Flow Desk Fan" },
      { name: "category", type: "string", sample: "home_appliance" },
      { name: "price", type: "decimal", sample: "48900" },
      { name: "synced_at", type: "datetime", sample: "2026-06-29 11:05" },
    ],
  },
  {
    id: "source_delivery_proxy_taxi",
    name: "Delivery Proxy Taxi Parquet",
    sourceType: "s3",
    typeLabel: "Parquet / Local Folder",
    status: "Delivery proxy",
    description: "Taxi Parquet directory를 배송 지연 proxy source로 쓰는 Product Health 데모 입력입니다.",
    resource: "data/raw/taxi/yellow_tripdata_2019_2025",
    updatedLabel: "local 5GB",
    updatedRank: 4,
    columns: ["product_id", "order_id", "pickup_zone", "dropoff_zone", "delivery_minutes", "late_delivery_flag"],
    schema: [
      { name: "product_id", type: "string", sample: "sku_8842" },
      { name: "order_id", type: "string", sample: "ord_32018" },
      { name: "pickup_zone", type: "integer", sample: "132" },
      { name: "dropoff_zone", type: "integer", sample: "236" },
      { name: "delivery_minutes", type: "number", sample: "38.5" },
      { name: "late_delivery_flag", type: "boolean", sample: "true" },
    ],
  },
  {
    id: "source_raw_events_s3",
    name: "AskLake Raw S3",
    sourceType: "s3",
    typeLabel: "S3",
    status: "Object storage",
    description: "S3 prefix 아래 적재된 raw event 파일 묶음입니다.",
    resource: "s3://asklake-demo/raw/events/",
    updatedLabel: "지난주 수요일",
    updatedRank: 2,
    columns: ["object_key", "event_date", "source_app", "record_count"],
    schema: [
      { name: "object_key", type: "string", sample: "raw/events/2026/06/29/part-0001.json" },
      { name: "event_date", type: "date", sample: "2026-06-29" },
      { name: "source_app", type: "string", sample: "checkout" },
      { name: "record_count", type: "integer", sample: "18542" },
    ],
  },
];

const sourceTypeOptions = [
  { id: "all", label: "전체", description: "모든 source dataset" },
  { id: "csv", label: "CSV", description: "파일 기반 source" },
  { id: "kafka", label: "Kafka", description: "stream topic" },
  { id: "postgres", label: "PostgreSQL", description: "RDB table" },
  { id: "mongodb", label: "MongoDB", description: "document source" },
  { id: "api", label: "API", description: "external endpoint" },
  { id: "s3", label: "S3", description: "object storage" },
];

const sourceSortOptions = [
  { id: "recent", label: "최근 수정순" },
  { id: "name", label: "이름순" },
  { id: "status", label: "상태순" },
  { id: "columns", label: "컬럼 수 많은 순" },
];

const silverStandardizeRuleOptions = [
  { id: "normalize_ids", label: "ID 정규화", detail: "product_id, user_id 같은 join key를 문자열 기준으로 정리합니다." },
  { id: "cast_types", label: "타입 캐스팅", detail: "숫자, 날짜, boolean 필드를 분석 가능한 타입으로 맞춥니다." },
  { id: "dedupe_records", label: "중복 제거", detail: "source key와 timestamp 기준으로 중복 row를 제거합니다." },
  { id: "trim_text", label: "텍스트 정리", detail: "리뷰/VOC 텍스트의 공백과 비어 있는 값을 정리합니다." },
];

const silverValidationRuleOptions = [
  { id: "required_keys", label: "필수 키 확인", detail: "분석 grain에 필요한 id 필드가 비어 있지 않은지 확인합니다." },
  { id: "valid_ranges", label: "값 범위 확인", detail: "rating, price, quantity 같은 수치 범위 이상치를 표시합니다." },
  { id: "schema_drift", label: "스키마 드리프트 확인", detail: "Source schema preview와 Silver output schema 차이를 기록합니다." },
];

const targetProcessingRecipes = [
  {
    id: "standardize_sources",
    title: "Standardize to Silver",
    kind: "Silver",
    detail: "각 raw/source dataset을 정규화된 silver intermediate dataset으로 표준화합니다.",
    output: ["silver_product_catalog", "silver_product_reviews", "silver_behavior_events"],
  },
  {
    id: "join_product",
    title: "Join by product_id",
    kind: "Join",
    detail: "리뷰/VOC와 상품 카탈로그를 product_id 기준으로 결합합니다.",
    output: ["product_id", "category", "avg_rating"],
  },
  {
    id: "aggregate_behavior",
    title: "Aggregate behavior",
    kind: "Aggregate",
    detail: "주문/행동 이벤트를 상품 단위 전환, 구매, 취소 지표로 집계합니다.",
    output: ["view_count", "purchase_count", "conversion_rate"],
  },
  {
    id: "attach_delivery",
    title: "Attach delivery risk",
    kind: "Enrich",
    detail: "배송/운송 proxy source를 상품 또는 주문 단위 지연 리스크로 붙입니다.",
    output: ["late_delivery_rate", "delivery_risk"],
  },
  {
    id: "score_health",
    title: "Calculate health score",
    kind: "Score",
    detail: "평점, 부정 리뷰, 전환 하락, 배송 지연을 결합해 product health score를 만듭니다.",
    output: ["risk_score", "risk_reason"],
  },
  {
    id: "select_gold_columns",
    title: "Select gold columns",
    kind: "Select",
    detail: "AI Query와 Catalog에 노출할 gold dataset 컬럼만 남깁니다.",
    output: ["product_health_status", "evidence_summary"],
  },
];

const targetGoldSchemaPreview = [
  { name: "product_id", type: "string", sample: "sku_8842" },
  { name: "category", type: "string", sample: "home_appliance" },
  { name: "avg_rating", type: "number", sample: "3.2" },
  { name: "conversion_rate", type: "number", sample: "0.041" },
  { name: "late_delivery_rate", type: "number", sample: "0.18" },
  { name: "risk_score", type: "number", sample: "82" },
  { name: "risk_reason", type: "text", sample: "부정 리뷰와 배송 지연이 함께 증가" },
  { name: "evidence_summary", type: "json", sample: "{\"sources\":4,\"checks\":6}" },
];

const targetExecutorOptions = [
  {
    id: "local_runner",
    label: "local_runner",
    detail: "데모 기본값. 저장된 job draft를 로컬 실행 경계로 넘깁니다.",
  },
  {
    id: "airflow",
    label: "Airflow handoff",
    detail: "Airflow DAG run conf로 넘길 준비 상태를 표시합니다. 서버가 떠 있어야 실제 성공입니다.",
  },
  {
    id: "spark_runner",
    label: "spark_runner",
    detail: "M2 multi-source runtime evidence와 연결할 후속 실행 경계입니다.",
  },
];

const silverOutputPurposeBySourceId = {
  source_partner_catalog_api: {
    name: "silver_product_catalog",
    purpose: "상품 id/category 표준화",
  },
  source_product_health_reviews: {
    name: "silver_product_reviews",
    purpose: "평점/리뷰 텍스트 정규화",
  },
  source_order_events_kafka: {
    name: "silver_behavior_events",
    purpose: "주문/행동 이벤트를 상품 단위로 정렬",
  },
  source_delivery_proxy_taxi: {
    name: "silver_delivery_proxy",
    purpose: "배송 지연 proxy flag 정리",
  },
};

const externalConnectionTypes = [
  {
    id: "local_file",
    label: "Local File",
    description: "JSONL, JSON, CSV 단일 원천 파일을 local path로 연결",
    placeholder: "backend/samples/product_health_reviews_seed.jsonl",
    resourceLabel: "file_path",
    authMode: "No credential",
    modeLabel: "직접 연결 가능",
    contractHint: "SourceConfig.connection_ref.path",
    connectorKind: "file",
    detectedFormat: "JSONL",
    detectedDataset: "Product reviews / VOC",
    confidence: "High",
    recommendedRole: "Source Dataset",
    syncMode: "manual",
    syncSchedule: "manual on demand",
    inspectSummary: "파일 경로와 확장자를 기준으로 JSONL 리뷰/VOC 원천으로 preview합니다.",
  },
  {
    id: "local_folder",
    label: "Local Folder",
    description: "Parquet directory 또는 dataset snapshot folder 연결",
    placeholder: "data/raw/taxi/yellow_tripdata_2019_2025",
    resourceLabel: "folder_path",
    authMode: "No credential",
    modeLabel: "직접 연결 가능",
    contractHint: "RuntimeConfig.source_inputs[].path",
    connectorKind: "folder",
    detectedFormat: "Parquet directory",
    detectedDataset: "Delivery / trip logs",
    confidence: "Medium",
    recommendedRole: "Source Dataset",
    syncMode: "scheduled",
    syncSchedule: "daily folder scan",
    inspectSummary: "폴더 내 Parquet 묶음을 배송/운송 proxy source로 preview합니다.",
  },
  {
    id: "kafka",
    label: "Kafka",
    description: "bootstrap server에 실제 접속해 streaming source 연결을 검증",
    placeholder: "127.0.0.1:29092",
    resourceLabel: "bootstrap_servers",
    authMode: "No credential in local demo",
    modeLabel: "Runtime connection test",
    contractHint: "KafkaTopicContract + source_inputs[].topic",
    connectorKind: "stream",
    detectedFormat: "JSON message",
    detectedDataset: "Order events",
    confidence: "Medium",
    recommendedRole: "Streaming Source Dataset",
    syncMode: "streaming",
    syncSchedule: "continuous topic consumption",
    inspectSummary: "Kafka broker metadata와 topic list 조회로 실제 접속 가능 여부를 확인합니다.",
    runtimeCheck: true,
    runtimeConnectorType: "kafka",
    runtimeCapability: "broker metadata + topic list",
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    description: "host/database와 secret reference로 실제 DB 접속을 검증",
    placeholder: "127.0.0.1:15432/asklake",
    resourceLabel: "postgres_database",
    authMode: "Secret reference only",
    modeLabel: "Runtime connection test",
    contractHint: "secret_refs.username/password env ref만 전달, 원문 credential 저장 금지",
    connectorKind: "database",
    detectedFormat: "Table/collection schema",
    detectedDataset: "PostgreSQL source",
    confidence: "Connection tested",
    recommendedRole: "Runtime Source Connection",
    syncMode: "scheduled",
    syncSchedule: "daily incremental sync",
    inspectSummary: "PostgreSQL driver connect와 lightweight query로 실제 접속 가능 여부를 확인합니다.",
    runtimeCheck: true,
    runtimeConnectorType: "postgres",
    runtimeCapability: "driver connect + select 1",
    secretRefFields: [
      { key: "username", label: "Username env ref", placeholder: "ASKLAKE_DEMO_POSTGRES_USER" },
      { key: "password", label: "Password env ref", placeholder: "ASKLAKE_DEMO_POSTGRES_PASSWORD" },
    ],
    defaultSecretRefs: {
      username: "ASKLAKE_DEMO_POSTGRES_USER",
      password: "ASKLAKE_DEMO_POSTGRES_PASSWORD",
    },
  },
  {
    id: "mongodb",
    label: "MongoDB",
    description: "MongoDB URI와 secret reference로 실제 DB 접속을 검증",
    placeholder: "mongodb://127.0.0.1:27017/admin",
    resourceLabel: "mongo_uri",
    authMode: "Secret reference only",
    modeLabel: "Runtime connection test",
    contractHint: "secret_refs.username/password env ref만 전달, 원문 credential 저장 금지",
    connectorKind: "database",
    detectedFormat: "Collection schema",
    detectedDataset: "MongoDB source",
    confidence: "Connection tested",
    recommendedRole: "Runtime Source Connection",
    syncMode: "scheduled",
    syncSchedule: "daily collection scan",
    inspectSummary: "MongoDB ping으로 실제 접속 가능 여부를 확인합니다.",
    runtimeCheck: true,
    runtimeConnectorType: "mongodb",
    runtimeCapability: "driver connect + ping",
    secretRefFields: [
      { key: "username", label: "Username env ref", placeholder: "ASKLAKE_DEMO_MONGO_USER" },
      { key: "password", label: "Password env ref", placeholder: "ASKLAKE_DEMO_MONGO_PASSWORD" },
    ],
    defaultSecretRefs: {
      username: "ASKLAKE_DEMO_MONGO_USER",
      password: "ASKLAKE_DEMO_MONGO_PASSWORD",
    },
  },
  {
    id: "s3",
    label: "MinIO / S3",
    description: "endpoint/bucket과 secret reference로 실제 object storage 접속을 검증",
    placeholder: "http://127.0.0.1:9000/asklake-demo",
    resourceLabel: "s3_bucket_endpoint",
    authMode: "Secret reference only",
    modeLabel: "Runtime connection test",
    contractHint: "secret_refs.access_key/secret_key env ref만 전달, 원문 credential 저장 금지",
    connectorKind: "object_storage",
    detectedFormat: "Object list",
    detectedDataset: "S3 object source",
    confidence: "Connection tested",
    recommendedRole: "Runtime Source Connection",
    syncMode: "scheduled",
    syncSchedule: "hourly prefix scan",
    inspectSummary: "S3 client bucket list로 실제 접속 가능 여부를 확인합니다.",
    runtimeCheck: true,
    runtimeConnectorType: "s3",
    runtimeCapability: "S3 client + bucket list",
    secretRefFields: [
      { key: "access_key", label: "Access key env ref", placeholder: "ASKLAKE_DEMO_MINIO_ACCESS_KEY" },
      { key: "secret_key", label: "Secret key env ref", placeholder: "ASKLAKE_DEMO_MINIO_SECRET_KEY" },
    ],
    defaultSecretRefs: {
      access_key: "ASKLAKE_DEMO_MINIO_ACCESS_KEY",
      secret_key: "ASKLAKE_DEMO_MINIO_SECRET_KEY",
    },
  },
];

const externalConnectionPresets = [
  {
    id: "amazon_reviews_jsonl",
    label: "Amazon Reviews JSONL",
    connectionTypeId: "local_file",
    name: "conn_amazon_reviews_jsonl",
    resource: "data/local_sources/product_health/raw/amazon_reviews_2023/raw/review_categories/All_Beauty.jsonl",
  },
  {
    id: "mep_product_json",
    label: "MEP Product JSON",
    connectionTypeId: "local_file",
    name: "conn_mep_product_catalog_json",
    resource: "data/local_sources/product_health/raw/mep_3m/annotations-1k.json",
  },
  {
    id: "behavior_events_jsonl",
    label: "Behavior Events JSONL",
    connectionTypeId: "local_file",
    name: "conn_behavior_events_jsonl",
    resource: "backend/samples/product_health_behavior_events_seed.jsonl",
  },
  {
    id: "taxi_delivery_parquet",
    label: "Taxi Delivery Parquet",
    connectionTypeId: "local_folder",
    name: "conn_taxi_delivery_parquet",
    resource: "data/raw/taxi/yellow_tripdata_2019_2025",
  },
];

const demoExternalConnections = [
  {
    id: "conn_product_health_reviews_file",
    name: "Product Health Reviews File",
    connectorId: "local_file",
    typeLabel: "Local File",
    status: "직접 연결 가능",
    description: "로컬 JSONL 리뷰 파일을 Source Dataset으로 등록하는 연결입니다.",
    resourceLabel: "file_path",
    resource: "backend/samples/product_health_reviews_seed.jsonl",
    syncMode: "manual",
    syncSchedule: "manual on demand",
    updatedLabel: "local sample",
    columns: ["review_id", "product_id", "rating", "review_text", "review_time"],
    schema: [
      { name: "review_id", type: "string", sample: "rv_000001" },
      { name: "product_id", type: "string", sample: "aph_prod_000006" },
      { name: "rating", type: "number", sample: "2" },
      { name: "review_text", type: "text", sample: "배송 지연과 품질 불만이 함께 기록된 리뷰" },
      { name: "review_time", type: "datetime", sample: "2026-06-28 09:42" },
    ],
  },
  {
    id: "conn_taxi_parquet_folder",
    name: "Taxi Delivery Parquet Folder",
    connectorId: "local_folder",
    typeLabel: "Local Folder",
    status: "직접 연결 가능",
    description: "이미 보유한 Taxi Parquet directory를 배송/운송 proxy source로 연결합니다.",
    resourceLabel: "folder_path",
    resource: "data/raw/taxi/yellow_tripdata_2019_2025",
    syncMode: "scheduled",
    syncSchedule: "daily folder scan",
    updatedLabel: "local 5GB",
    columns: ["tpep_pickup_datetime", "tpep_dropoff_datetime", "PULocationID", "DOLocationID", "trip_distance"],
    schema: [
      { name: "tpep_pickup_datetime", type: "timestamp", sample: "2024-01-01 08:12:11" },
      { name: "tpep_dropoff_datetime", type: "timestamp", sample: "2024-01-01 08:38:42" },
      { name: "PULocationID", type: "integer", sample: "132" },
      { name: "DOLocationID", type: "integer", sample: "236" },
      { name: "trip_distance", type: "number", sample: "12.8" },
    ],
  },
  {
    id: "conn_order_events_kafka",
    name: "Order Events Kafka Topic",
    connectorId: "kafka",
    typeLabel: "Kafka Topic",
    status: "Replay evidence",
    description: "실시간 주문 이벤트 topic은 유지하되, 현재 데모에서는 replay/sample evidence로 검증합니다.",
    resourceLabel: "topic",
    resource: "commerce.order.events",
    syncMode: "streaming",
    syncSchedule: "continuous topic consumption",
    updatedLabel: "M4 replay",
    columns: ["event_id", "order_id", "event_type", "payload", "event_time"],
    schema: [
      { name: "event_id", type: "string", sample: "evt_98213" },
      { name: "order_id", type: "string", sample: "ord_32018" },
      { name: "event_type", type: "string", sample: "payment_confirmed" },
      { name: "payload", type: "json", sample: "{\"amount\":129000}" },
      { name: "event_time", type: "datetime", sample: "2026-06-29 09:40" },
    ],
  },
];

const demoQuestionGroups = [
  {
    title: "Product Health SQL intents",
    tone: "primary",
    questions: [
      ["top_risk", "위험 점수가 높고 부정 리뷰, 낮은 구매 전환, 배송 지연이 겹친 문제 상품군을 찾아줘."],
      ["top_negative_review", "부정 리뷰율이 가장 높은 상품을 보여줘."],
      ["low_conversion", "구매 전환율이 가장 낮은 상품을 찾아줘."],
      ["top_late_delivery", "배송 지연율이 가장 높은 상품을 알려줘."],
    ],
  },
  {
    title: "Unsupported guardrail",
    tone: "warning",
    questions: [["unsupported", "다음 분기 매출을 예측하고 광고 문구까지 생성해줘."]],
  },
  {
    title: "Legacy reviews path",
    tone: "secondary",
    questions: [
      ["legacy_rating", "Amazon reviews에서 평점 높은 상품 알려줘"],
      ["legacy_count", "리뷰가 가장 많은 상품 알려줘"],
      ["legacy_table", "Amazon reviews의 product_id별 review_count를 보여줘"],
    ],
  },
];

function connectionSchemaPreview(connectionType) {
  if (connectionType.runtimeCheck) {
    return [];
  }
  if (connectionType.id === "local_folder") {
    return [
      { name: "tpep_pickup_datetime", type: "timestamp" },
      { name: "tpep_dropoff_datetime", type: "timestamp" },
      { name: "trip_distance", type: "number" },
    ];
  }
  if (connectionType.id === "kafka") {
    return [
      { name: "event_id", type: "string" },
      { name: "event_type", type: "string" },
      { name: "payload", type: "json" },
    ];
  }
  return [
    { name: "review_id", type: "string" },
    { name: "product_id", type: "string" },
    { name: "rating", type: "number" },
  ];
}

function connectionTypeLabel(connectorType) {
  const connectionType = externalConnectionTypes.find((type) => type.id === connectorType);
  return connectionType ? connectionType.label : connectorType;
}

function mapExternalConnectionRecord(record) {
  const schema = (record.schema_preview || []).map((field) => ({
    name: field.name,
    type: field.type,
    sample: "metadata preview",
  }));

  return {
    id: record.id,
    name: record.name,
    connectorId: record.connector_type,
    typeLabel: connectionTypeLabel(record.connector_type),
    status: record.status === "metadata_ready" ? "저장됨" : record.status,
    description: `${record.detected_dataset || record.connector_type} source connection metadata입니다.`,
    resourceLabel: record.resource_label,
    resource: record.resource,
    authMode: record.auth_mode,
    modeLabel: record.mode_label,
    contractHint: record.contract_hint,
    detectedFormat: record.detected_format,
    detectedDataset: record.detected_dataset,
    confidence: record.confidence,
    recommendedRole: record.recommended_role,
    syncMode: record.sync_mode || "manual",
    syncSchedule: record.sync_schedule || "manual on demand",
    updatedLabel: "방금",
    columns: schema.map((field) => field.name),
    schema,
  };
}

function mapProductHealthInventoryItemToConnection(item) {
  const schema = (item.schema_preview || []).map((field) => ({
    name: field.name,
    type: field.type,
    sample: item.binding_type === "prepared_dataset" ? "prepared metadata" : "source inventory",
  }));

  return {
    id: `product-health:${item.role}`,
    name: item.connection_name,
    connectorId: item.connection_type || "local_file",
    typeLabel: item.binding_type === "prepared_dataset" ? "Prepared Dataset" : "Local File",
    status: item.status === "ready" ? "inventory ready" : item.status,
    description: `${item.label} Product Health source inventory입니다.`,
    resourceLabel: item.resource_label,
    resource: item.path,
    authMode: "No credential",
    modeLabel: productHealthBindingLabel(item.binding_type),
    contractHint: "ProductHealthSourceInventory",
    detectedFormat: item.binding_type === "prepared_dataset" ? "Parquet" : "Local source",
    detectedDataset: item.label,
    confidence: item.status === "ready" ? "High" : "Missing",
    recommendedRole: "Source Dataset",
    syncMode: "manual",
    syncSchedule: "manual on demand",
    updatedLabel: "inventory",
    columns: schema.map((field) => field.name),
    schema,
    productHealthInventory: item,
  };
}

function productHealthBindingLabel(bindingType) {
  const labels = {
    raw_file: "Raw file",
    prepared_dataset: "Prepared dataset",
    missing: "Missing",
    mismatch: "Mismatch",
  };
  return labels[bindingType] || bindingType || "Source";
}

function productHealthStatusLabel(item) {
  if (!item) return "unknown";
  if (item.status === "ready" && item.binding_type === "prepared_dataset") return "prepared ready";
  if (item.status === "ready") return "raw ready";
  return item.status;
}

function formatConnectionResourceLabel(label) {
  const labels = {
    file_path: "파일 경로",
    folder_path: "폴더 경로",
    dataset_folder: "데이터셋 폴더",
    topic: "Kafka Topic",
    bootstrap_servers: "Bootstrap servers",
    postgres_database: "PostgreSQL host/database",
    mongo_uri: "MongoDB URI",
    s3_bucket_endpoint: "S3 endpoint/bucket",
    table_or_collection: "테이블/컬렉션",
    bucket_prefix: "Bucket prefix",
  };
  return labels[label] || label || "원본 범위";
}

function defaultConnectionSecretRefs(connectionType) {
  return { ...(connectionType.defaultSecretRefs || {}) };
}

function isRuntimeConnectionType(connectionType) {
  return Boolean(connectionType?.runtimeCheck);
}

function runtimeConnectionPassed(state, connectionType) {
  return state.status === "passed" && state.checkId === connectionType?.id;
}

function runtimeConnectionCheckLabel(connectionType) {
  return connectionType.runtimeCapability || "runtime connection test";
}

function isLocalDiscoveryConnection(connection) {
  return ["local_file", "local_folder"].includes(connection?.connectorId);
}

function sourceDiscoveryStatus(connection, discoveryState) {
  if (!connection) {
    return {
      status: "waiting",
      label: "Connection 필요",
      canCreate: false,
      message: "External Connection을 먼저 선택합니다.",
    };
  }
  if (isLocalDiscoveryConnection(connection)) {
    if (discoveryState.status === "inspecting") {
      return {
        status: "inspecting",
        label: "Discovery 실행 중",
        canCreate: false,
        message: "local path에서 schema/sample/bytes를 확인하고 있습니다.",
      };
    }
    if (discoveryState.status === "error") {
      return {
        status: "error",
        label: "Discovery 실패",
        canCreate: false,
        message: discoveryState.error || "local path를 확인할 수 없습니다.",
      };
    }
    return {
      status: "ready",
      label: "Schema discovery ready",
      canCreate: (discoveryState.result?.schema_preview?.length || connection.schema?.length || 0) > 0,
      message: discoveryState.result
        ? "실제 local path에서 schema/sample/bytes evidence를 확인했습니다."
        : "저장된 connection schema preview를 사용할 수 있습니다. 필요하면 discovery를 다시 실행하세요.",
    };
  }
  if (discoveryState.status === "inspecting") {
    return {
      status: "inspecting",
      label: "Discovery 실행 중",
      canCreate: false,
      message: `${connection.typeLabel}에서 지정한 raw scope schema를 확인하고 있습니다.`,
    };
  }
  if (discoveryState.status === "discovered" && discoveryState.result?.schema_preview?.length) {
    return {
      status: "ready",
      label: "Schema discovery ready",
      canCreate: true,
      message: `${connection.typeLabel} runtime source에서 schema/sample evidence를 확인했습니다.`,
    };
  }
  if (discoveryState.status === "error") {
    return {
      status: "error",
      label: "Discovery 실패",
      canCreate: false,
      message: discoveryState.error || `${connection.typeLabel} schema discovery를 완료하지 못했습니다.`,
    };
  }
  return {
    status: "pending",
    label: "Schema discovery pending",
    canCreate: false,
    message: `${connection.typeLabel}은 raw scope를 입력하고 Discovery를 실행해야 Source Dataset으로 저장할 수 있습니다.`,
  };
}

function secretRefsForConnection(connection) {
  const connectionType = externalConnectionTypes.find((type) => type.id === connection?.connectorId);
  return defaultConnectionSecretRefs(connectionType || {});
}

function defaultSourceScopeForConnection(connection) {
  if (!connection) return "";
  if (connection.connectorId === "postgres") return "public.connection_smoke";
  if (connection.connectorId === "mongodb") return "asklake.connection_smoke";
  if (connection.connectorId === "s3") return "product_health/source/s3_events.jsonl";
  if (connection.connectorId === "kafka") return "asklake-connection-smoke";
  return connection.resource;
}

function defaultDiscoveryScopeForConnectionType(connectionType) {
  if (!connectionType) return "";
  return defaultSourceScopeForConnection({
    connectorId: connectionType.id,
    resource: connectionType.placeholder,
  });
}

function silverOutputForSource(source) {
  const configuredOutput = silverOutputPurposeBySourceId[source.id];
  if (configuredOutput) {
    return {
      ...configuredOutput,
      fromSourceId: source.id,
      fromSourceName: source.name,
    };
  }

  return {
    name: `silver_${source.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
    purpose: "source schema와 key를 Silver intermediate 형태로 정리",
    fromSourceId: source.id,
    fromSourceName: source.name,
  };
}

function sourceDatasetNameForConnection(connection) {
  const text = `${connection.name} ${connection.resource} ${connection.detectedDataset || ""}`.toLowerCase();
  if (text.includes("review") || text.includes("amazon") || text.includes("voc")) {
    return "source_product_reviews";
  }
  if (text.includes("mep") || text.includes("catalog") || text.includes("product catalog") || text.includes("annotations")) {
    return "source_product_catalog";
  }
  if (text.includes("behavior") || text.includes("event")) {
    return "source_user_events";
  }
  if (text.includes("taxi") || text.includes("delivery") || text.includes("trip")) {
    return "source_delivery_trip_logs";
  }
  if (connection.connectorId === "kafka") {
    return "source_order_events";
  }
  return `source_${connection.name.toLowerCase().replace(/^conn_/, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
}

function targetSourceRefPayload(source, role) {
  return {
    source_id: source.id,
    name: source.name,
    role,
    type_label: source.typeLabel,
    resource: source.resource,
  };
}

function targetSilverRefPayload(silverDataset, role) {
  return {
    source_id: silverDataset.id,
    name: silverDataset.name,
    role,
    type_label: "Silver Dataset",
    resource: `from ${silverDataset.source_dataset_name}`,
  };
}

function silverOutputPayload(silverDataset) {
  return {
    name: silverDataset.name,
    from_source_id: silverDataset.source_dataset_id,
    from_source_name: silverDataset.source_dataset_name,
    purpose: silverDataset.purpose,
  };
}

function normalizePath(pathname) {
  if (pathname === "/" || pathname === "" || pathname === "/dataset" || pathname === "/sources") return "/datasets/source";
  if (pathname === "/datasets") return "/datasets/source";
  if (pathname === "/jobs") return "/jobs/silver-transform";
  if (pathname === "/schema-preview") return "/datasets/source";
  if (pathname === "/etl/visual" || pathname === "/etl-visual") return "/etl-visual";
  if (pathname === "/etl") return "/runs";
  if (pathname === "/query") return "/ask";
  if (pathname.startsWith("/catalog/")) return "/catalog-detail";
  const supportedPaths = [
    ...navItems.flatMap((item) => [item.path, ...(item.children || []).map((child) => child.path)]),
    "/catalog",
    "/catalog-detail",
    "/ask",
    "/dashboard",
    "/admin",
    "/etl-visual",
  ];
  return supportedPaths.includes(pathname) ? pathname : "/datasets/source";
}

export function App() {
  const initialPath = normalizePath(window.location.pathname);
  const [health, setHealth] = useState({ state: "loading", message: "확인 중" });
  const [activePath, setActivePath] = useState(() => initialPath);
  const [expandedNav, setExpandedNav] = useState(() => ({
    datasets: normalizePath(window.location.pathname).startsWith("/datasets"),
    jobs: normalizePath(window.location.pathname).startsWith("/jobs"),
  }));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [isNoticeLeaving, setIsNoticeLeaving] = useState(false);
  const [pendingDatasetEdit, setPendingDatasetEdit] = useState(null);
  const [focusedCatalogDatasetId, setFocusedCatalogDatasetId] = useState("");

  useEffect(() => {
    refreshHealth();
    const canonicalUrl = routeToUrl(initialPath);
    if (window.location.pathname !== canonicalUrl) {
      window.history.replaceState({}, "", canonicalUrl);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => setActivePath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;

    setIsNoticeLeaving(false);
    const fadeTimer = window.setTimeout(() => setIsNoticeLeaving(true), 2400);
    const clearTimer = window.setTimeout(() => {
      setNotice("");
      setIsNoticeLeaving(false);
    }, 2850);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [notice]);

  async function refreshHealth() {
    setHealth({ state: "loading", message: "확인 중" });
    try {
      const payload = await getHealth();
      setHealth({ state: "ok", message: `${payload.service} ${payload.status}` });
    } catch (error) {
      setHealth({ state: "error", message: error.message });
    }
  }

  function navigate(path, options = {}) {
    const nextPath = normalizePath(path);
    const displayPath = path.startsWith("/catalog/") ? path : routeToUrl(nextPath);
    if (options.pendingDatasetEdit) {
      setPendingDatasetEdit(options.pendingDatasetEdit);
    }
    if (options.focusCatalogDatasetId) {
      setFocusedCatalogDatasetId(options.focusCatalogDatasetId);
    }
    window.history.pushState({}, "", displayPath);
    setActivePath(nextPath);
  }

  const activeItem = useMemo(() => navItems.find((item) => activePath === item.path || item.children?.some((child) => child.path === activePath)) || navItems[0], [activePath]);

  function toggleNavItem(item) {
    if (!item.children?.length) {
      navigate(item.path);
      return;
    }

    const navKey = item.path.split("/")[1];
    setExpandedNav((current) => ({ ...current, [navKey]: !current[navKey] }));
    if (!activePath.startsWith(`/${navKey}`)) {
      navigate(item.path);
    }
  }

  return (
    <main className={`m1-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="shell-sidebar" aria-label="AskLake M1 navigation">
        <div className="brand-block">
          <img className="brand-logo" src={asklakeLogo} alt="AskLake" />
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const navKey = item.path.split("/")[1];
            const isExpanded = Boolean(expandedNav[navKey]);
            const isActive = activeItem.path === item.path || item.children?.some((child) => child.path === activePath);

            return (
              <div className={`nav-group ${isExpanded ? "expanded" : ""}`} key={item.path}>
                <button
                  type="button"
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => toggleNavItem(item)}
                  aria-current={!item.children?.length && isActive ? "page" : undefined}
                  aria-expanded={item.children?.length ? isExpanded : undefined}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  {item.children?.length ? <ChevronRight className="nav-chevron" size={15} /> : null}
                </button>
                {item.children?.length && isExpanded ? (
                  <div className="nav-sublist" aria-label={`${item.label} 하위 메뉴`}>
                    {item.children.map((child) => {
                      const isChildActive = activePath === child.path;
                      return (
                        <button
                          key={child.path}
                          type="button"
                          className={`nav-subitem ${isChildActive ? "active" : ""}`}
                          onClick={() => navigate(child.path)}
                          aria-current={isChildActive ? "page" : undefined}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <button type="button" className="logout-button">
          <LogOut size={16} />
          로그아웃
        </button>
      </aside>

      <section className="shell-main">
        <button
          type="button"
          className="collapse-button"
          aria-label={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          aria-pressed={isSidebarCollapsed}
          onClick={() => setIsSidebarCollapsed((current) => !current)}
        >
          {isSidebarCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
        <header className="topbar">
          <div className="topbar-search">
            <Search size={18} />
            <span>데이터셋, source, schema 검색...</span>
            <kbd>/</kbd>
          </div>
          <div className="topbar-actions">
            <button type="button" className="refresh-button" onClick={refreshHealth}>
              <RefreshCw size={16} />
              Health
            </button>
            <StatusPill health={health} />
            <div className="user-chip" aria-label="Current shell user">
              <span>S</span>
            </div>
            <div className="user-meta">
              <strong>study</strong>
              <span>관리자</span>
            </div>
            <button
              type="button"
              className="copilot-toggle"
              onClick={() => setIsCopilotOpen((current) => !current)}
              aria-pressed={isCopilotOpen}
            >
              <Sparkles size={16} />
              AI 도우미
            </button>
          </div>
        </header>

        <section className="page-surface">
          {notice ? (
            <ToastNotice
              message={notice}
              isLeaving={isNoticeLeaving}
              onClose={() => {
                setNotice("");
                setIsNoticeLeaving(false);
              }}
            />
          ) : null}
          {activePath === "/connections" ? (
            <SourcesPage
              navigate={navigate}
              setNotice={setNotice}
              dataView="connections"
              pendingDatasetEdit={pendingDatasetEdit}
              onPendingDatasetEditConsumed={() => setPendingDatasetEdit(null)}
            />
          ) : null}
          {activePath === "/datasets/source" ? (
            <SourcesPage
              navigate={navigate}
              setNotice={setNotice}
              dataView="datasets-source"
              pendingDatasetEdit={pendingDatasetEdit}
              onPendingDatasetEditConsumed={() => setPendingDatasetEdit(null)}
            />
          ) : null}
          {activePath === "/datasets/silver" ? (
            <SourcesPage
              navigate={navigate}
              setNotice={setNotice}
              dataView="datasets-silver"
              pendingDatasetEdit={pendingDatasetEdit}
              onPendingDatasetEditConsumed={() => setPendingDatasetEdit(null)}
            />
          ) : null}
          {activePath === "/datasets/gold" ? (
            <SourcesPage
              navigate={navigate}
              setNotice={setNotice}
              dataView="datasets-gold"
              pendingDatasetEdit={pendingDatasetEdit}
              onPendingDatasetEditConsumed={() => setPendingDatasetEdit(null)}
            />
          ) : null}
          {activePath === "/jobs/connection-sync" ? (
            <SourcesPage
              navigate={navigate}
              setNotice={setNotice}
              dataView="jobs-connection"
              pendingDatasetEdit={pendingDatasetEdit}
              onPendingDatasetEditConsumed={() => setPendingDatasetEdit(null)}
            />
          ) : null}
          {activePath === "/jobs/silver-transform" ? (
            <SourcesPage
              navigate={navigate}
              setNotice={setNotice}
              dataView="jobs-silver"
              pendingDatasetEdit={pendingDatasetEdit}
              onPendingDatasetEditConsumed={() => setPendingDatasetEdit(null)}
            />
          ) : null}
          {activePath === "/jobs/gold-build" ? (
            <SourcesPage
              navigate={navigate}
              setNotice={setNotice}
              dataView="jobs-gold"
              pendingDatasetEdit={pendingDatasetEdit}
              onPendingDatasetEditConsumed={() => setPendingDatasetEdit(null)}
            />
          ) : null}
          {activePath === "/etl-visual" ? <VisualEditorPage navigate={navigate} setNotice={setNotice} /> : null}
          {activePath === "/runs" ? <JobRunsPage setNotice={setNotice} /> : null}
          {activePath === "/catalog" ? <CatalogPage navigate={navigate} focusedCatalogDatasetId={focusedCatalogDatasetId} /> : null}
          {activePath === "/catalog-detail" ? <CatalogDetailShell navigate={navigate} /> : null}
          {activePath === "/ask" ? <AiQueryPage navigate={navigate} setNotice={setNotice} /> : null}
          {activePath === "/dashboard" ? <DashboardPlaceholder /> : null}
          {activePath === "/admin" ? <AdminPlaceholder /> : null}
        </section>
        <AiCopilotDock isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      </section>
    </main>
  );
}

function routeToUrl(path) {
  if (path === "/sources") return "/datasets/source";
  if (path === "/etl-visual") return "/etl/visual";
  if (path === "/runs") return "/runs";
  if (path === "/ask") return "/query";
  if (path === "/catalog-detail") return WEEK2_DEFAULT_CATALOG_DETAIL_URL;
  return path;
}

function PageIntro({ icon: Icon, title, body, status }) {
  return (
    <div className="page-intro">
      <div className="intro-icon">
        <Icon size={24} />
      </div>
      <div>
        <p className="eyebrow">{status}</p>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

function SourcesPage({ navigate, setNotice, dataView = "datasets-source", pendingDatasetEdit, onPendingDatasetEditConsumed }) {
  const [isDatasetTypeModalOpen, setIsDatasetTypeModalOpen] = useState(false);
  const [datasetCreationMode, setDatasetCreationMode] = useState(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceModalPurpose, setSourceModalPurpose] = useState("target");
  const [connectionWizardStepIndex, setConnectionWizardStepIndex] = useState(0);
  const [selectedConnectionType, setSelectedConnectionType] = useState(externalConnectionTypes[0]);
  const [connectionName, setConnectionName] = useState("conn_product_health_reviews_file");
  const [connectionResource, setConnectionResource] = useState(externalConnectionTypes[0].placeholder);
  const [connectionSecretRefs, setConnectionSecretRefs] = useState(defaultConnectionSecretRefs(externalConnectionTypes[0]));
  const [connectionDiscoveryScope, setConnectionDiscoveryScope] = useState(defaultDiscoveryScopeForConnectionType(externalConnectionTypes[0]));
  const [connectionInspected, setConnectionInspected] = useState(false);
  const [connectionInspectState, setConnectionInspectState] = useState({ status: "idle", result: null, error: "" });
  const [connectionRuntimeCheckState, setConnectionRuntimeCheckState] = useState({ status: "idle", checkId: "", result: null, error: "" });
  const [connectionSaveState, setConnectionSaveState] = useState({ status: "idle", record: null, error: "" });
  const [savedExternalConnections, setSavedExternalConnections] = useState([]);
  const [credentialPolicy, setCredentialPolicy] = useState(null);
  const [productHealthSourceInventory, setProductHealthSourceInventory] = useState(null);
  const [savedSourceDatasets, setSavedSourceDatasets] = useState([]);
  const [savedSilverDatasets, setSavedSilverDatasets] = useState([]);
  const [savedTargetDatasetDrafts, setSavedTargetDatasetDrafts] = useState([]);
  const [savedTargetJobRuns, setSavedTargetJobRuns] = useState([]);
  const [publishedCatalogDatasets, setPublishedCatalogDatasets] = useState([]);
  const [catalogDatasetPolicy, setCatalogDatasetPolicy] = useState(null);
  const [datasetDraftListState, setDatasetDraftListState] = useState({ loading: true, error: "" });
  const [jobRunCreateState, setJobRunCreateState] = useState({ status: "idle", draftId: "", error: "" });
  const [sourceWizardStepIndex, setSourceWizardStepIndex] = useState(0);
  const [sourceDraft, setSourceDraft] = useState(null);
  const [sourceDiscoveryState, setSourceDiscoveryState] = useState({ status: "idle", result: null, error: "" });
  const [sourceDatasetName, setSourceDatasetName] = useState("source_product_health_reviews");
  const [sourceRawScope, setSourceRawScope] = useState("");
  const [sourceDatasetSaveState, setSourceDatasetSaveState] = useState({ status: "idle", record: null, error: "" });
  const [managedSourceDataset, setManagedSourceDataset] = useState(null);
  const [managedSourceForm, setManagedSourceForm] = useState({ name: "", raw_scope: "", resource_label: "" });
  const [managedSourceMode, setManagedSourceMode] = useState("detail");
  const [managedSourceState, setManagedSourceState] = useState({ status: "idle", error: "" });
  const [managedSourceSnapshotState, setManagedSourceSnapshotState] = useState({ status: "idle", snapshots: [], error: "" });
  const [managedConnection, setManagedConnection] = useState(null);
  const [managedConnectionForm, setManagedConnectionForm] = useState({
    name: "",
    resource: "",
    resource_label: "",
    sync_mode: "manual",
    sync_schedule: "manual on demand",
  });
  const [managedConnectionMode, setManagedConnectionMode] = useState("detail");
  const [managedConnectionState, setManagedConnectionState] = useState({ status: "idle", error: "" });
  const [managedSilverDataset, setManagedSilverDataset] = useState(null);
  const [managedSilverForm, setManagedSilverForm] = useState({
    name: "",
    purpose: "",
    standardize_rules: "",
    validation_rules: "",
  });
  const [managedSilverMode, setManagedSilverMode] = useState("detail");
  const [managedSilverState, setManagedSilverState] = useState({ status: "idle", error: "" });
  const [managedSilverMaterializationState, setManagedSilverMaterializationState] = useState({ status: "idle", materializations: [], error: "" });
  const [managedTargetDraft, setManagedTargetDraft] = useState(null);
  const [managedTargetForm, setManagedTargetForm] = useState({
    target_dataset_name: "",
    description: "",
    target_grain: "",
    processing_recipes: "",
    executor_handoff: "local_runner",
  });
  const [managedTargetMode, setManagedTargetMode] = useState("detail");
  const [managedTargetState, setManagedTargetState] = useState({ status: "idle", error: "" });
  const [silverWizardStepIndex, setSilverWizardStepIndex] = useState(0);
  const [selectedSilverSourceId, setSelectedSilverSourceId] = useState("");
  const [silverDatasetName, setSilverDatasetName] = useState("silver_product_health_reviews");
  const [silverPurpose, setSilverPurpose] = useState("Source Dataset을 표준화/검증한 Silver Dataset metadata");
  const [selectedSilverStandardizeRules, setSelectedSilverStandardizeRules] = useState(["normalize_ids", "cast_types"]);
  const [selectedSilverValidationRules, setSelectedSilverValidationRules] = useState(["required_keys", "schema_drift"]);
  const [silverDatasetSaveState, setSilverDatasetSaveState] = useState({ status: "idle", record: null, error: "" });
  const [datasetReturnFlow, setDatasetReturnFlow] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [targetSilverIds, setTargetSilverIds] = useState([]);
  const [baseTargetSilverId, setBaseTargetSilverId] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(targetProcessingRecipes.map((recipe) => recipe.id));
  const [targetName, setTargetName] = useState("dataset_product_health_gold");
  const [targetDescription, setTargetDescription] = useState("제품 상태 분석용 Gold Dataset");
  const [targetScheduleMode, setTargetScheduleMode] = useState("manual");
  const [targetScheduleNote, setTargetScheduleNote] = useState("데모에서는 수동 실행으로만 준비합니다.");
  const [targetExecutorMode, setTargetExecutorMode] = useState("local_runner");
  const [targetDraftSaveState, setTargetDraftSaveState] = useState({ status: "idle", record: null, error: "" });
  const [scheduleEditorJob, setScheduleEditorJob] = useState(null);
  const [scheduleEditorForm, setScheduleEditorForm] = useState({ mode: "manual", note: "" });
  const [scheduleEditorState, setScheduleEditorState] = useState({ status: "idle", error: "" });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const normalizedTargetName = targetName.trim();
  const normalizedTargetDescription = targetDescription.trim();
  const selectedTargetSilvers = savedSilverDatasets.filter((silverDataset) => targetSilverIds.includes(silverDataset.id));
  const baseTargetSilver =
    selectedTargetSilvers.find((silverDataset) => silverDataset.id === baseTargetSilverId) || selectedTargetSilvers[0] || null;
  const enrichmentTargetSilvers = selectedTargetSilvers.filter((silverDataset) => silverDataset.id !== baseTargetSilver?.id);
  const selectedProcessRecipes = targetProcessingRecipes.filter((recipe) => selectedRecipeIds.includes(recipe.id));
  const selectedSilverOutputs = selectedTargetSilvers.map(silverOutputPayload);
  const selectedFieldSummary =
    selectedProcessRecipes.length > 0 ? selectedProcessRecipes.slice(0, 3).map((recipe) => recipe.kind).join(", ") : "선택된 처리 방법이 없습니다.";
  const selectedOutputSchema = selectedProcessRecipes.length > 0 ? targetGoldSchemaPreview : [];
  const targetSourceSummary =
    selectedTargetSilvers.length > 0
      ? `${selectedTargetSilvers.length} silver datasets · base ${baseTargetSilver?.name || "미지정"}`
      : "2개 이상의 Silver Dataset을 선택합니다.";
  const wizardSteps = [
    {
      id: "overview",
      title: "Overview",
      summary: normalizedTargetName || "Gold Dataset 이름을 입력합니다.",
      isComplete: Boolean(normalizedTargetName),
    },
    {
      id: "source",
      title: "Silver 선택",
      summary: targetSourceSummary,
      isComplete: currentStepIndex > 1 && selectedTargetSilvers.length >= 2,
    },
    {
      id: "process",
      title: "Process",
      summary: selectedProcessRecipes.length > 0 ? `${selectedProcessRecipes.length} processing recipes` : "target 갱신 처리 방법을 설정합니다.",
      isComplete: currentStepIndex > 3 && selectedProcessRecipes.length > 0,
    },
    {
      id: "handoff",
      title: "Build 실행 준비",
      summary: `${targetExecutorMode} 실행 경계`,
      isComplete: currentStepIndex > 4,
    },
    {
      id: "scheduling",
      title: "Scheduling",
      summary: targetScheduleMode === "manual" ? "Job manual trigger" : "Job schedule placeholder",
      isComplete: currentStepIndex > 5,
    },
    {
      id: "review",
      title: "Review",
      summary: "생성 준비 확인",
      isComplete: false,
    },
  ];
  const sourceWizardSteps = [
    {
      id: "connection",
      title: "Connection 선택",
      isComplete: Boolean(sourceDraft),
    },
    {
      id: "raw-config",
      title: "Raw Dataset 설정",
      isComplete: sourceWizardStepIndex > 1 && Boolean(sourceDatasetName.trim() && sourceRawScope.trim()),
    },
    {
      id: "review",
      title: "Review",
      isComplete: false,
    },
  ];
  const connectionWizardSteps = [
    {
      id: "connector-type",
      title: "Connector Type",
      summary: selectedConnectionType ? selectedConnectionType.label : "connector를 선택합니다.",
      isComplete: Boolean(selectedConnectionType),
    },
    {
      id: "configure",
      title: "Configure & Inspect",
      summary: connectionName.trim() || "connection 이름을 입력합니다.",
      isComplete: connectionWizardStepIndex > 1 && Boolean(connectionName.trim() && connectionResource.trim()),
    },
    {
      id: "review",
      title: "Review",
      summary: "연결 draft 확인",
      isComplete: false,
    },
  ];
  const currentStep = wizardSteps[currentStepIndex];
  const currentSourceStep = sourceWizardSteps[sourceWizardStepIndex];
  const currentConnectionStep = connectionWizardSteps[connectionWizardStepIndex];
  const isRuntimeConnection = isRuntimeConnectionType(selectedConnectionType);
  const selectedConnectionPresets = externalConnectionPresets.filter((preset) => preset.connectionTypeId === selectedConnectionType.id);
  const isConnectionReadyForReview = isRuntimeConnection
    ? runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType) && Boolean(connectionInspectState.result?.schema_preview?.length)
    : Boolean(connectionInspected && connectionInspectState.result);
  const sourceDiscovery = sourceDiscoveryStatus(sourceDraft, sourceDiscoveryState);
  const sourceSchemaPreview = sourceDiscoveryState.result?.schema_preview?.length
    ? sourceDiscoveryState.result.schema_preview.map((field) => ({
        name: field.name,
        type: field.type,
        sample: field.sample || "discovered",
      }))
    : sourceDraft?.schema || [];
  const silverWizardSteps = [
    { id: "source", title: "Source 선택" },
    { id: "rules", title: "Rules 설정" },
    { id: "review", title: "Review" },
  ];
  const currentSilverStep = silverWizardSteps[silverWizardStepIndex];
  const selectedSilverSource = savedSourceDatasets.find((sourceDataset) => sourceDataset.id === selectedSilverSourceId) || null;
  const selectedSilverStandardizeRuleDetails = silverStandardizeRuleOptions.filter((rule) =>
    selectedSilverStandardizeRules.includes(rule.id),
  );
  const selectedSilverValidationRuleDetails = silverValidationRuleOptions.filter((rule) =>
    selectedSilverValidationRules.includes(rule.id),
  );
  const canGoNext =
    (currentStep.id === "overview" && Boolean(normalizedTargetName)) ||
    (currentStep.id === "source" && selectedTargetSilvers.length >= 2) ||
    (currentStep.id === "process" && selectedProcessRecipes.length > 0) ||
    currentStep.id === "handoff" ||
    currentStep.id === "scheduling";
  const canGoNextSource =
    (currentSourceStep.id === "connection" && Boolean(sourceDraft)) ||
    (currentSourceStep.id === "raw-config" && Boolean(sourceDatasetName.trim() && sourceRawScope.trim()) && sourceDiscovery.canCreate);
  const canGoNextConnection =
    (currentConnectionStep.id === "connector-type" && Boolean(selectedConnectionType)) ||
    (currentConnectionStep.id === "configure" &&
      Boolean(connectionName.trim() && connectionResource.trim() && isConnectionReadyForReview));
  const canGoNextSilver =
    (currentSilverStep.id === "source" && Boolean(selectedSilverSource)) ||
    (currentSilverStep.id === "rules" &&
      Boolean(silverDatasetName.trim() && silverPurpose.trim()) &&
      selectedSilverStandardizeRules.length > 0 &&
      selectedSilverValidationRules.length > 0);
  const sourceConnectionOptions = savedExternalConnections;
  const silverDatasetRecords = savedSilverDatasets.map((silverDataset) => ({
    id: silverDataset.id,
    name: silverDataset.name,
    source: silverDataset.source_dataset_name,
    purpose: silverDataset.purpose,
    rules: [...(silverDataset.standardize_rules || []), ...(silverDataset.validation_rules || [])],
    status: silverDataset.status,
    fileEvidence: silverDataset.file_evidence,
  }));
  const publishedGoldDatasetRecords = publishedCatalogDatasets
    .filter((dataset) => dataset.source_type === "target_dataset_job_run")
    .map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      target: dataset.lineage?.target_dataset_name || dataset.name,
      sources: dataset.metrics?.source_count || dataset.source_evidence?.length || 0,
      silverOutputs: dataset.metrics?.silver_output_count || dataset.lineage?.silver_output_paths?.length || 0,
      rows: dataset.metrics?.row_count || dataset.row_count,
      bytes: dataset.metrics?.bytes || 0,
      path: dataset.storage?.local_path || dataset.path,
      status: "registered",
      recordType: "registered",
      catalog: dataset,
    }));
  const plannedGoldDatasetRecords = savedTargetDatasetDrafts.map((targetDraft) => ({
    id: targetDraft.id,
    name: targetDraft.gold_output || targetDraft.target_dataset_name,
    target: targetDraft.target_dataset_name,
    sources: targetDraft.source_refs?.length || 0,
    silverOutputs: targetDraft.silver_outputs?.length || 0,
    rows: null,
    bytes: null,
    path: "",
    status: targetDraft.status,
    recordType: "planned",
    draft: targetDraft,
  }));
  const goldDatasetRecords = [...publishedGoldDatasetRecords, ...plannedGoldDatasetRecords];
  const connectionJobRecords = savedExternalConnections.map((connection) => ({
    id: `connection-job:${connection.id}`,
    connectionId: connection.id,
    type: "connection",
    name: `Sync ${connection.name}`,
    input: connection.resource,
    output: "Source Dataset raw zone",
    schedule: connection.syncMode === "manual" ? "manual" : "placeholder",
    scheduleNote: connection.syncSchedule || "",
    status: connection.status || "planned",
    connection,
  }));
  const silverJobRecords = savedSilverDatasets.map((silverDataset) => ({
    id: `silver-job:${silverDataset.id}`,
    datasetId: silverDataset.id,
    type: "silver",
    name: `Standardize ${silverDataset.source_dataset_name || silverDataset.name}`,
    input: silverDataset.source_dataset_name,
    output: silverDataset.name,
    rules: [...(silverDataset.standardize_rules || []), ...(silverDataset.validation_rules || [])].join(", "),
    schedule: silverDataset.schedule?.mode || "manual",
    scheduleNote: silverDataset.schedule?.note || "",
    status: "planned",
  }));
  const goldJobRecords = savedTargetDatasetDrafts.map((targetDraft) => ({
    id: targetDraft.id,
    datasetId: targetDraft.id,
    type: "gold",
    name: `Build ${targetDraft.gold_output || targetDraft.target_dataset_name}`,
    input: `${targetDraft.silver_outputs?.length || 0} silver datasets`,
    output: targetDraft.gold_output || targetDraft.target_dataset_name,
    rules: (targetDraft.processing_recipes || []).join(", ") || "processing recipe 없음",
    runner: targetDraft.executor_handoff,
    schedule: targetDraft.schedule?.mode || "manual",
    scheduleNote: targetDraft.schedule?.note || "",
    status: "ready to run",
  }));

  async function refreshDatasetDraftLists() {
    setDatasetDraftListState({ loading: true, error: "" });
    try {
      const [
        connections,
        sourceDatasets,
        silverDatasets,
        targetDrafts,
        catalogDatasets,
        catalogPolicy,
        nextCredentialPolicy,
        nextProductHealthInventory,
      ] = await Promise.all([
        listExternalConnections(),
        listSourceDatasets(),
        listSilverDatasets(),
        listTargetDatasetDrafts(),
        listCatalogDatasets(),
        getCatalogDatasetManagementPolicy(),
        getExternalConnectionCredentialPolicy(),
        listProductHealthSourceInventory(),
      ]);
      setSavedExternalConnections(connections.map(mapExternalConnectionRecord));
      setCredentialPolicy(nextCredentialPolicy);
      setProductHealthSourceInventory(nextProductHealthInventory);
      setSavedSourceDatasets(sourceDatasets);
      setSavedSilverDatasets(silverDatasets);
      setSavedTargetDatasetDrafts(targetDrafts);
      setPublishedCatalogDatasets(catalogDatasets);
      setCatalogDatasetPolicy(catalogPolicy);
      setDatasetDraftListState({ loading: false, error: "" });
    } catch (error) {
      setDatasetDraftListState({ loading: false, error: error.message });
      setNotice(`Dataset draft 목록 조회 실패: ${error.message}`);
    }
  }

  async function refreshTargetJobRuns() {
    try {
      const jobRuns = await listTargetDatasetJobRuns();
      setSavedTargetJobRuns(jobRuns);
    } catch (error) {
      setNotice(`Job Run 목록 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshDatasetDraftLists();
    refreshTargetJobRuns();
  }, []);

  useEffect(() => {
    if (!pendingDatasetEdit || datasetDraftListState.loading) return;
    if (pendingDatasetEdit.type === "silver" && dataView === "datasets-silver") {
      const silverDataset = savedSilverDatasets.find((dataset) => dataset.id === pendingDatasetEdit.id);
      if (silverDataset) {
        openSilverDatasetDetail(silverDataset, "edit");
        onPendingDatasetEditConsumed?.();
      }
    }
    if (pendingDatasetEdit.type === "gold" && dataView === "datasets-gold") {
      const targetDraft = savedTargetDatasetDrafts.find((draft) => draft.id === pendingDatasetEdit.id);
      if (targetDraft) {
        openTargetDraftDetail(targetDraft, "edit");
        onPendingDatasetEditConsumed?.();
      }
    }
  }, [pendingDatasetEdit, dataView, datasetDraftListState.loading, savedSilverDatasets, savedTargetDatasetDrafts]);

  function handleSourceSelect(source) {
    setSelectedSource(source);
    setSelectedFields(source.columns);
    setNotice(`${source.name} source를 선택했습니다.`);
    setIsSourceModalOpen(false);
  }

  function selectSourceConnection(connection) {
    setSourceDraft(connection);
    setSourceDiscoveryState({ status: "idle", result: null, error: "" });
    setSourceDatasetName(sourceDatasetNameForConnection(connection));
    setSourceRawScope(defaultSourceScopeForConnection(connection));
    setSourceDatasetSaveState({ status: "idle", record: null, error: "" });
    setNotice(`${connection.name} external connection을 선택했습니다.`);
  }

  function selectProductHealthInventorySource(item) {
    if (!item.can_create_source_dataset) {
      setNotice(`${item.label} source는 아직 Source Dataset으로 저장할 수 없습니다: ${item.message}`);
      return;
    }
    const connection = mapProductHealthInventoryItemToConnection(item);
    setSourceDraft(connection);
    setSourceDatasetName(item.source_dataset_name);
    setSourceRawScope(item.path);
    setSourceDiscoveryState({
      status: "discovered",
      result: {
        detected_format: connection.detectedFormat,
        detected_dataset: item.label,
        confidence: connection.confidence,
        recommended_role: "Source Dataset",
        schema_preview: item.schema_preview || [],
        bytes: item.bytes || 0,
        file_count: 1,
        row_count: item.row_count,
        row_count_status: item.row_count_status,
        message: item.message,
      },
      error: "",
    });
    setSourceDatasetSaveState({ status: "idle", record: null, error: "" });
    setNotice(`${item.label} Product Health source 후보를 선택했습니다.`);
  }

  async function discoverSelectedSourceConnection(connection = sourceDraft) {
    if (!connection) {
      setNotice("External Connection을 먼저 선택하세요.");
      return;
    }
    if (!isLocalDiscoveryConnection(connection) && !sourceRawScope.trim()) {
      setSourceDiscoveryState({
        status: "error",
        result: null,
        error: `${connection.typeLabel} schema discovery에는 table/collection/object/topic raw scope가 필요합니다.`,
      });
      setNotice("raw scope를 먼저 입력하세요.");
      return;
    }
    setSourceDiscoveryState({ status: "inspecting", result: null, error: "" });
    setSourceDatasetSaveState({ status: "idle", record: null, error: "" });
    try {
      const result = await inspectExternalConnection({
        connector_type: connection.connectorId,
        resource: connection.resource,
        resource_label: connection.resourceLabel,
        secret_refs: secretRefsForConnection(connection),
        options: isLocalDiscoveryConnection(connection) ? {} : { scope: sourceRawScope.trim() },
      });
      const schema = result.schema_preview.map((field) => ({
        name: field.name,
        type: field.type,
        sample: field.sample || "discovered",
      }));
      setSourceDraft({
        ...connection,
        detectedFormat: result.detected_format,
        detectedDataset: result.detected_dataset,
        confidence: result.confidence,
        recommendedRole: result.recommended_role,
        columns: schema.map((field) => field.name),
        schema,
      });
      setSourceDiscoveryState({ status: "discovered", result, error: "" });
      setNotice(`${connection.name} schema discovery를 확인했습니다.`);
    } catch (error) {
      setSourceDiscoveryState({ status: "error", result: null, error: error.message });
      setNotice(`Source Dataset discovery 실패: ${error.message}`);
    }
  }

  function selectSilverSourceDataset(sourceDataset) {
    setSelectedSilverSourceId(sourceDataset.id);
    setSilverDatasetName(`silver_${sourceDataset.name.replace(/^source_/, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`);
    setSilverPurpose(`${sourceDataset.name}를 표준화/검증한 Silver Dataset metadata`);
    setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
  }

  function toggleSilverRule(kind, ruleId) {
    const setter = kind === "standardize" ? setSelectedSilverStandardizeRules : setSelectedSilverValidationRules;
    setter((currentRules) =>
      currentRules.includes(ruleId)
        ? currentRules.filter((currentRule) => currentRule !== ruleId)
        : [...currentRules, ruleId],
    );
    setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
  }

  async function saveSilverDatasetDraft() {
    if (
      !selectedSilverSource ||
      !silverDatasetName.trim() ||
      !silverPurpose.trim() ||
      selectedSilverStandardizeRuleDetails.length === 0 ||
      selectedSilverValidationRuleDetails.length === 0
    ) {
      setNotice("source dataset, silver name, rule을 먼저 확인하세요.");
      return;
    }

    setSilverDatasetSaveState({ status: "saving", record: null, error: "" });
    try {
      const record = await createSilverDataset({
        source_dataset_id: selectedSilverSource.id,
        source_dataset_name: selectedSilverSource.name,
        name: silverDatasetName.trim(),
        purpose: silverPurpose.trim(),
        standardize_rules: selectedSilverStandardizeRuleDetails.map((rule) => rule.id),
        validation_rules: selectedSilverValidationRuleDetails.map((rule) => rule.id),
        schema_preview: (selectedSilverSource.schema_preview || []).map((field) => ({
          name: field.name,
          type: field.type,
        })),
      });
      setSilverDatasetSaveState({ status: "saved", record, error: "" });
      setSavedSilverDatasets((records) => [record, ...records.filter((silverRecord) => silverRecord.id !== record.id)]);
      setNotice(`${record.name} silver dataset metadata를 저장했습니다.`);
      if (datasetReturnFlow?.target === "gold") {
        setTargetSilverIds((ids) => (ids.includes(record.id) ? ids : [record.id, ...ids]));
        setBaseTargetSilverId((currentId) => currentId || record.id);
        setCurrentStepIndex(1);
        setDatasetCreationMode("target");
        setDatasetReturnFlow(null);
        setNotice(`${record.name} 저장 후 Gold Dataset 입력 선택으로 돌아왔습니다.`);
      } else {
        setDatasetCreationMode(null);
      }
    } catch (error) {
      setSilverDatasetSaveState({ status: "error", record: null, error: error.message });
      setNotice(`Silver Dataset 저장 실패: ${error.message}`);
    }
  }

  async function saveSourceDatasetDraft() {
    if (!sourceDraft || !sourceDatasetName.trim() || !sourceRawScope.trim()) {
      setNotice("connection, source dataset name, source scope를 먼저 확인하세요.");
      return;
    }
    if (!sourceDiscovery.canCreate || sourceSchemaPreview.length === 0) {
      setNotice("Source Dataset schema discovery가 가능한 connection만 저장할 수 있습니다.");
      return;
    }

    setSourceDatasetSaveState({ status: "saving", record: null, error: "" });
    try {
      const record = await createSourceDataset({
        connection_id: sourceDraft.id,
        connection_name: sourceDraft.name,
        connection_type: sourceDraft.connectorId,
        name: sourceDatasetName.trim(),
        raw_scope: sourceRawScope.trim(),
        resource_label: sourceDraft.resourceLabel,
        schema_preview: sourceSchemaPreview.map((field) => ({
          name: field.name,
          type: field.type,
        })),
      });
      setSourceDatasetSaveState({ status: "saved", record, error: "" });
      setSavedSourceDatasets((records) => [record, ...records.filter((sourceRecord) => sourceRecord.id !== record.id)]);
      setNotice(`${record.name} source dataset metadata를 저장했습니다.`);
      if (datasetReturnFlow?.target === "silver") {
        selectSilverSourceDataset(record);
        setSilverWizardStepIndex(1);
        setDatasetCreationMode("silver");
        setDatasetReturnFlow({ target: "gold" });
        setNotice(`${record.name} 저장 후 Silver Dataset rules 설정으로 이동했습니다.`);
      } else {
        setDatasetCreationMode(null);
      }
    } catch (error) {
      setSourceDatasetSaveState({ status: "error", record: null, error: error.message });
      setNotice(`Source Dataset 저장 실패: ${error.message}`);
    }
  }

  function openSourceDatasetDetail(sourceDataset, mode = "detail") {
    setManagedSourceDataset(sourceDataset);
    setManagedSourceForm({
      name: sourceDataset.name,
      raw_scope: sourceDataset.raw_scope,
      resource_label: sourceDataset.resource_label,
    });
    setManagedSourceMode(mode);
    setManagedSourceState({ status: "idle", error: "" });
    setManagedSourceSnapshotState({ status: "loading", snapshots: [], error: "" });
    listSourceDatasetSnapshots(sourceDataset.id)
      .then((snapshots) => {
        setManagedSourceSnapshotState({ status: "idle", snapshots, error: "" });
      })
      .catch((error) => {
        setManagedSourceSnapshotState({ status: "error", snapshots: [], error: error.message });
      });
  }

  function closeSourceDatasetDetail() {
    setManagedSourceDataset(null);
    setManagedSourceMode("detail");
    setManagedSourceState({ status: "idle", error: "" });
    setManagedSourceSnapshotState({ status: "idle", snapshots: [], error: "" });
  }

  function openConnectionDetail(connection, mode = "detail") {
    setManagedConnection(connection);
    setManagedConnectionForm({
      name: connection.name,
      resource: connection.resource,
      resource_label: connection.resourceLabel,
      sync_mode: connection.syncMode,
      sync_schedule: connection.syncSchedule,
    });
    setManagedConnectionMode(mode);
    setManagedConnectionState({ status: "idle", error: "" });
  }

  function closeConnectionDetail() {
    setManagedConnection(null);
    setManagedConnectionMode("detail");
    setManagedConnectionState({ status: "idle", error: "" });
  }

  async function saveManagedConnection() {
    if (!managedConnection) return;
    if (!managedConnectionForm.name.trim() || !managedConnectionForm.resource.trim() || !managedConnectionForm.resource_label.trim()) {
      setManagedConnectionState({ status: "error", error: "name, resource, resource label을 확인하세요." });
      return;
    }

    setManagedConnectionState({ status: "saving", error: "" });
    try {
      const updated = await updateExternalConnection(managedConnection.id, {
        name: managedConnectionForm.name.trim(),
        resource: managedConnectionForm.resource.trim(),
        resource_label: managedConnectionForm.resource_label.trim(),
        sync_mode: managedConnectionForm.sync_mode,
        sync_schedule: managedConnectionForm.sync_schedule.trim(),
      });
      const mappedConnection = mapExternalConnectionRecord(updated);
      setSavedExternalConnections((records) => records.map((record) => (record.id === mappedConnection.id ? mappedConnection : record)));
      setManagedConnection(mappedConnection);
      setManagedConnectionMode("detail");
      setManagedConnectionState({ status: "saved", error: "" });
      setNotice(`${mappedConnection.name} external connection metadata를 수정했습니다.`);
    } catch (error) {
      setManagedConnectionState({ status: "error", error: error.message });
      setNotice(`External Connection 수정 실패: ${error.message}`);
    }
  }

  async function removeManagedConnection() {
    if (!managedConnection) return;
    setManagedConnectionState({ status: "deleting", error: "" });
    try {
      await deleteExternalConnection(managedConnection.id);
      setSavedExternalConnections((records) => records.filter((record) => record.id !== managedConnection.id));
      setNotice(`${managedConnection.name} external connection metadata를 삭제했습니다.`);
      closeConnectionDetail();
    } catch (error) {
      setManagedConnectionState({ status: "error", error: error.message });
      setNotice(`External Connection 삭제 실패: ${error.message}`);
    }
  }

  function openSilverDatasetDetail(silverDataset, mode = "detail") {
    setManagedSilverDataset(silverDataset);
    setManagedSilverForm({
      name: silverDataset.name,
      purpose: silverDataset.purpose,
      standardize_rules: (silverDataset.standardize_rules || []).join("\n"),
      validation_rules: (silverDataset.validation_rules || []).join("\n"),
    });
    setManagedSilverMode(mode);
    setManagedSilverState({ status: "idle", error: "" });
    setManagedSilverMaterializationState({ status: "loading", materializations: [], error: "" });
    listSilverDatasetMaterializations(silverDataset.id)
      .then((materializations) => {
        setManagedSilverMaterializationState({ status: "idle", materializations, error: "" });
      })
      .catch((error) => {
        setManagedSilverMaterializationState({ status: "error", materializations: [], error: error.message });
      });
  }

  function closeSilverDatasetDetail() {
    setManagedSilverDataset(null);
    setManagedSilverMode("detail");
    setManagedSilverState({ status: "idle", error: "" });
    setManagedSilverMaterializationState({ status: "idle", materializations: [], error: "" });
  }

  async function saveManagedSilverDataset() {
    if (!managedSilverDataset) return;
    const standardizeRules = managedSilverForm.standardize_rules.split("\n").map((rule) => rule.trim()).filter(Boolean);
    const validationRules = managedSilverForm.validation_rules.split("\n").map((rule) => rule.trim()).filter(Boolean);
    if (!managedSilverForm.name.trim() || !managedSilverForm.purpose.trim() || standardizeRules.length === 0 || validationRules.length === 0) {
      setManagedSilverState({ status: "error", error: "name, purpose, rules를 확인하세요." });
      return;
    }

    setManagedSilverState({ status: "saving", error: "" });
    try {
      const updated = await updateSilverDataset(managedSilverDataset.id, {
        name: managedSilverForm.name.trim(),
        purpose: managedSilverForm.purpose.trim(),
        standardize_rules: standardizeRules,
        validation_rules: validationRules,
      });
      setSavedSilverDatasets((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      setManagedSilverDataset(updated);
      setManagedSilverMode("detail");
      setManagedSilverState({ status: "saved", error: "" });
      setNotice(`${updated.name} silver dataset metadata를 수정했습니다.`);
    } catch (error) {
      setManagedSilverState({ status: "error", error: error.message });
      setNotice(`Silver Dataset 수정 실패: ${error.message}`);
    }
  }

  async function removeManagedSilverDataset() {
    if (!managedSilverDataset) return;
    setManagedSilverState({ status: "deleting", error: "" });
    try {
      await deleteSilverDataset(managedSilverDataset.id);
      setSavedSilverDatasets((records) => records.filter((record) => record.id !== managedSilverDataset.id));
      setNotice(`${managedSilverDataset.name} silver dataset metadata를 삭제했습니다.`);
      closeSilverDatasetDetail();
    } catch (error) {
      setManagedSilverState({ status: "error", error: error.message });
      setNotice(`Silver Dataset 삭제 실패: ${error.message}`);
    }
  }

  async function runManagedSilverMaterialization() {
    if (!managedSilverDataset) return;
    setManagedSilverMaterializationState((current) => ({ ...current, status: "running", error: "" }));
    try {
      const materialization = await createSilverDatasetMaterialization(managedSilverDataset.id, {
        sample_size: 10000,
        prefer_latest_source_snapshot: true,
      });
      const refreshed = await updateSilverDataset(managedSilverDataset.id, { status: "materialized" });
      setSavedSilverDatasets((records) => records.map((record) => (record.id === refreshed.id ? refreshed : record)));
      setManagedSilverDataset(refreshed);
      setManagedSilverMaterializationState((current) => ({
        status: "idle",
        materializations: [materialization, ...current.materializations.filter((record) => record.id !== materialization.id)],
        error: "",
      }));
      setNotice(`${managedSilverDataset.name} Silver output을 생성했습니다.`);
    } catch (error) {
      setManagedSilverMaterializationState((current) => ({ ...current, status: "error", error: error.message }));
      setNotice(`Silver output 생성 실패: ${error.message}`);
    }
  }

  function openTargetDraftDetail(targetDraft, mode = "detail") {
    setManagedTargetDraft(targetDraft);
    setManagedTargetForm({
      target_dataset_name: targetDraft.target_dataset_name,
      description: targetDraft.description,
      target_grain: targetDraft.target_grain,
      processing_recipes: (targetDraft.processing_recipes || []).join("\n"),
      executor_handoff: targetDraft.executor_handoff,
    });
    setManagedTargetMode(mode);
    setManagedTargetState({ status: "idle", error: "" });
  }

  function closeTargetDraftDetail() {
    setManagedTargetDraft(null);
    setManagedTargetMode("detail");
    setManagedTargetState({ status: "idle", error: "" });
  }

  async function saveManagedTargetDraft() {
    if (!managedTargetDraft) return;
    const processingRecipes = managedTargetForm.processing_recipes.split("\n").map((recipe) => recipe.trim()).filter(Boolean);
    if (!managedTargetForm.target_dataset_name.trim() || !managedTargetForm.description.trim() || processingRecipes.length === 0) {
      setManagedTargetState({ status: "error", error: "target name, description, processing recipe를 확인하세요." });
      return;
    }

    setManagedTargetState({ status: "saving", error: "" });
    try {
      const updated = await updateTargetDatasetDraft(managedTargetDraft.id, {
        target_dataset_name: managedTargetForm.target_dataset_name.trim(),
        description: managedTargetForm.description.trim(),
        target_grain: managedTargetForm.target_grain.trim(),
        processing_recipes: processingRecipes,
        gold_output: managedTargetForm.target_dataset_name.trim(),
        executor_handoff: managedTargetForm.executor_handoff,
      });
      setSavedTargetDatasetDrafts((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      setManagedTargetDraft(updated);
      setManagedTargetMode("detail");
      setManagedTargetState({ status: "saved", error: "" });
      setNotice(`${updated.target_dataset_name} Gold Dataset 설정을 수정했습니다.`);
    } catch (error) {
      setManagedTargetState({ status: "error", error: error.message });
      setNotice(`Gold Dataset 수정 실패: ${error.message}`);
    }
  }

  async function removeManagedTargetDraft() {
    if (!managedTargetDraft) return;
    setManagedTargetState({ status: "deleting", error: "" });
    try {
      await deleteTargetDatasetDraft(managedTargetDraft.id);
      setSavedTargetDatasetDrafts((records) => records.filter((record) => record.id !== managedTargetDraft.id));
      setNotice(`${managedTargetDraft.target_dataset_name} Gold Dataset 설정을 삭제했습니다.`);
      closeTargetDraftDetail();
    } catch (error) {
      setManagedTargetState({ status: "error", error: error.message });
      setNotice(`Gold Dataset 삭제 실패: ${error.message}`);
    }
  }

  async function saveManagedSourceDataset() {
    if (!managedSourceDataset) return;
    if (!managedSourceForm.name.trim() || !managedSourceForm.raw_scope.trim() || !managedSourceForm.resource_label.trim()) {
      setManagedSourceState({ status: "error", error: "name, raw scope, resource label을 확인하세요." });
      return;
    }

    setManagedSourceState({ status: "saving", error: "" });
    try {
      const updated = await updateSourceDataset(managedSourceDataset.id, {
        name: managedSourceForm.name.trim(),
        raw_scope: managedSourceForm.raw_scope.trim(),
        resource_label: managedSourceForm.resource_label.trim(),
      });
      setSavedSourceDatasets((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      setManagedSourceDataset(updated);
      setManagedSourceForm({
        name: updated.name,
        raw_scope: updated.raw_scope,
        resource_label: updated.resource_label,
      });
      setManagedSourceMode("detail");
      setManagedSourceState({ status: "saved", error: "" });
      setNotice(`${updated.name} source dataset metadata를 수정했습니다.`);
    } catch (error) {
      setManagedSourceState({ status: "error", error: error.message });
      setNotice(`Source Dataset 수정 실패: ${error.message}`);
    }
  }

  async function removeManagedSourceDataset() {
    if (!managedSourceDataset) return;
    setManagedSourceState({ status: "deleting", error: "" });
    try {
      await deleteSourceDataset(managedSourceDataset.id);
      setSavedSourceDatasets((records) => records.filter((record) => record.id !== managedSourceDataset.id));
      setNotice(`${managedSourceDataset.name} source dataset metadata를 삭제했습니다.`);
      closeSourceDatasetDetail();
    } catch (error) {
      setManagedSourceState({ status: "error", error: error.message });
      setNotice(`Source Dataset 삭제 실패: ${error.message}`);
    }
  }

  async function runManagedSourceSnapshot() {
    if (!managedSourceDataset) return;
    setManagedSourceSnapshotState((current) => ({ ...current, status: "running", error: "" }));
    try {
      const snapshot = await createSourceDatasetSnapshot(managedSourceDataset.id, { sample_size: 100 });
      const refreshedDataset = await updateSourceDataset(managedSourceDataset.id, { status: "snapshot_ready" });
      setManagedSourceDataset(refreshedDataset);
      setSavedSourceDatasets((records) => records.map((record) => (record.id === refreshedDataset.id ? refreshedDataset : record)));
      setManagedSourceSnapshotState((current) => ({
        status: "idle",
        snapshots: [snapshot, ...current.snapshots.filter((record) => record.id !== snapshot.id)],
        error: "",
      }));
      setNotice(`${managedSourceDataset.name} raw snapshot을 생성했습니다.`);
    } catch (error) {
      setManagedSourceSnapshotState((current) => ({ ...current, status: "error", error: error.message }));
      setNotice(`Raw snapshot 생성 실패: ${error.message}`);
    }
  }

  function toggleField(column) {
    setSelectedFields((currentFields) =>
      currentFields.includes(column)
        ? currentFields.filter((field) => field !== column)
        : [...currentFields, column],
    );
  }

  function selectAllFields() {
    if (selectedSource) {
      setSelectedFields(selectedSource.columns);
    }
  }

  function clearFields() {
    setSelectedFields([]);
  }

  function toggleTargetSilver(silverDataset) {
    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
    setTargetSilverIds((currentIds) => {
      if (currentIds.includes(silverDataset.id)) {
        const nextIds = currentIds.filter((silverId) => silverId !== silverDataset.id);
        if (baseTargetSilverId === silverDataset.id) {
          setBaseTargetSilverId(nextIds[0] || "");
        }
        return nextIds;
      }

      if (!baseTargetSilverId) {
        setBaseTargetSilverId(silverDataset.id);
      }
      return [...currentIds, silverDataset.id];
    });
  }

  function selectBaseTargetSilver(silverId) {
    if (!targetSilverIds.includes(silverId)) return;
    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
    setBaseTargetSilverId(silverId);
  }

  function toggleProcessingRecipe(recipeId) {
    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
    setSelectedRecipeIds((currentRecipeIds) =>
      currentRecipeIds.includes(recipeId)
        ? currentRecipeIds.filter((selectedRecipeId) => selectedRecipeId !== recipeId)
        : [...currentRecipeIds, recipeId],
    );
  }

  async function saveTargetDatasetDraft() {
    if (!normalizedTargetName || selectedTargetSilvers.length < 2 || selectedProcessRecipes.length === 0 || !baseTargetSilver) {
      setNotice("target name, base silver dataset, processing recipe를 먼저 확인하세요.");
      return;
    }

    setTargetDraftSaveState({ status: "saving", record: null, error: "" });
    try {
      const record = await createTargetDatasetDraft({
        target_dataset_name: normalizedTargetName,
        description: normalizedTargetDescription || "Gold Dataset 설정",
        base_source_ref: targetSilverRefPayload(baseTargetSilver, "base"),
        target_grain: "product_id",
        source_refs: selectedTargetSilvers.map((silverDataset) =>
          targetSilverRefPayload(silverDataset, silverDataset.id === baseTargetSilver.id ? "base" : "enrichment"),
        ),
        silver_outputs: selectedSilverOutputs,
        processing_recipes: selectedProcessRecipes.map((recipe) => recipe.id),
        gold_output: normalizedTargetName,
        executor_handoff: targetExecutorMode,
        schedule: {
          mode: targetScheduleMode,
          note: targetScheduleNote.trim(),
        },
        schema_preview: selectedOutputSchema.map((field) => ({
          name: field.name,
          type: field.type,
        })),
      });
      setTargetDraftSaveState({ status: "saved", record, error: "" });
      setSavedTargetDatasetDrafts((records) => [record, ...records.filter((targetRecord) => targetRecord.id !== record.id)]);
      setNotice(`${record.target_dataset_name} Gold Dataset 설정을 저장했습니다.`);
      setDatasetCreationMode(null);
    } catch (error) {
      setTargetDraftSaveState({ status: "error", record: null, error: error.message });
      setNotice(`Gold Dataset 저장 실패: ${error.message}`);
    }
  }

  function requestManualJobRun(job) {
    if (job.type === "gold") {
      createGoldBuildRun(job.id);
      return;
    }

    const runnerLabel = job.type === "connection" ? "Connection Sync runner" : "Silver Transform runner";
    setNotice(`${job.name} 수동 실행 요청을 확인했습니다. ${runnerLabel} 실제 실행 연결은 후속 Phase에서 붙입니다.`);
  }

  async function createGoldBuildRun(targetDraftId) {
    setJobRunCreateState({ status: "creating", draftId: targetDraftId, error: "" });
    try {
      const run = await createTargetDatasetJobRun({
        target_dataset_draft_id: targetDraftId,
        job_type: "gold_build",
        triggered_by: "demo_user",
      });
      setSavedTargetJobRuns((records) => [run, ...records.filter((record) => record.id !== run.id)]);
      setJobRunCreateState({ status: "created", draftId: targetDraftId, error: "" });
      setNotice(`${run.gold_output} Gold Build 수동 실행을 queued 상태로 만들었습니다.`);
    } catch (error) {
      setJobRunCreateState({ status: "error", draftId: targetDraftId, error: error.message });
      setNotice(`수동 실행 요청 실패: ${error.message}`);
    }
  }

  function openScheduleEditor(job) {
    setScheduleEditorJob(job);
    setScheduleEditorForm({
      mode: job.schedule === "manual" ? "manual" : "placeholder",
      note: job.scheduleNote || "",
    });
    setScheduleEditorState({ status: "idle", error: "" });
  }

  function closeScheduleEditor() {
    setScheduleEditorJob(null);
    setScheduleEditorForm({ mode: "manual", note: "" });
    setScheduleEditorState({ status: "idle", error: "" });
  }

  async function saveJobSchedule() {
    if (!scheduleEditorJob) return;

    const schedule = {
      mode: scheduleEditorForm.mode,
      note: scheduleEditorForm.note.trim(),
    };
    setScheduleEditorState({ status: "saving", error: "" });

    try {
      if (scheduleEditorJob.type === "connection") {
        const updated = await updateExternalConnection(scheduleEditorJob.connectionId, {
          sync_mode: schedule.mode === "manual" ? "manual" : "scheduled",
          sync_schedule: schedule.note || "manual on demand",
        });
        setSavedExternalConnections((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      } else if (scheduleEditorJob.type === "silver") {
        const updated = await updateSilverDatasetSchedule(scheduleEditorJob.datasetId, schedule);
        setSavedSilverDatasets((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      } else {
        const updated = await updateTargetDatasetDraftSchedule(scheduleEditorJob.datasetId, schedule);
        setSavedTargetDatasetDrafts((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      }
      setNotice(`${scheduleEditorJob.name} schedule metadata를 수정했습니다.`);
      closeScheduleEditor();
    } catch (error) {
      setScheduleEditorState({ status: "error", error: error.message });
      setNotice(`Schedule 수정 실패: ${error.message}`);
    }
  }

  function goNext() {
    if (canGoNext && currentStepIndex < wizardSteps.length - 1) {
      setCurrentStepIndex((index) => index + 1);
    }
  }

  function goBack() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((index) => index - 1);
    }
  }

  function goNextSilver() {
    if (canGoNextSilver && silverWizardStepIndex < silverWizardSteps.length - 1) {
      setSilverWizardStepIndex((index) => index + 1);
    }
  }

  function goBackSilver() {
    if (silverWizardStepIndex > 0) {
      setSilverWizardStepIndex((index) => index - 1);
    }
  }

  function startDatasetCreation(mode) {
    setDatasetCreationMode(mode);
    setIsDatasetTypeModalOpen(false);
    setCurrentStepIndex(0);
    if (mode === "connection") {
      setConnectionWizardStepIndex(0);
    }
    if (mode === "source") {
      setSourceWizardStepIndex(0);
      if (!sourceDraft) {
        setSourceRawScope("");
      }
    }
    if (mode === "silver") {
      setSilverWizardStepIndex(0);
      setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
    }
  }

  function startSourceCreationForGoldInput() {
    setDatasetReturnFlow({ target: "silver" });
    startDatasetCreation("source");
  }

  function startSilverCreationForGoldInput() {
    setDatasetReturnFlow({ target: "gold" });
    startDatasetCreation("silver");
  }

  function selectConnectionType(connectionType) {
    if (connectionType.disabled) {
      setNotice(`${connectionType.label} connector는 후속 Phase에서 실제화합니다.`);
      return;
    }
    setSelectedConnectionType(connectionType);
    setConnectionName(`conn_${connectionType.id}_demo`);
    setConnectionResource(connectionType.placeholder);
    setConnectionSecretRefs(defaultConnectionSecretRefs(connectionType));
    setConnectionDiscoveryScope(defaultDiscoveryScopeForConnectionType(connectionType));
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
    setNotice(`${connectionType.label} external connection type을 선택했습니다.`);
  }

  function setConnectionResourceValue(value) {
    setConnectionResource(value);
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
  }

  function setConnectionSecretRefValue(key, value) {
    setConnectionSecretRefs((refs) => ({ ...refs, [key]: value }));
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
  }

  function setConnectionDiscoveryScopeValue(value) {
    setConnectionDiscoveryScope(value);
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
  }

  function selectConnectionPreset(presetId) {
    const preset = externalConnectionPresets.find((candidate) => candidate.id === presetId);
    const connectionType = externalConnectionTypes.find((type) => type.id === preset?.connectionTypeId);
    if (!connectionType || connectionType.disabled) return;
    setSelectedConnectionType(connectionType);
    setConnectionName(preset.name);
    setConnectionResource(preset.resource);
    setConnectionSecretRefs(defaultConnectionSecretRefs(connectionType));
    setConnectionDiscoveryScope(defaultDiscoveryScopeForConnectionType(connectionType));
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
    setNotice(`${preset.label} source location을 선택했습니다.`);
  }

  async function inspectConnectionSource() {
    if (!connectionName.trim() || !connectionResource.trim()) {
      setNotice("connection name과 source location을 먼저 입력하세요.");
      return;
    }
    setConnectionInspected(false);
    setConnectionInspectState({ status: "inspecting", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
    try {
      const result = await inspectExternalConnection({
        connector_type: selectedConnectionType.id,
        resource: connectionResource.trim(),
        resource_label: selectedConnectionType.resourceLabel,
      });
      setConnectionInspected(true);
      setConnectionInspectState({ status: "discovered", result, error: "" });
      setNotice(`${selectedConnectionType.label} source schema를 확인했습니다.`);
    } catch (error) {
      setConnectionInspectState({ status: "error", result: null, error: error.message });
      setNotice(`소스 검사 실패: ${error.message}`);
    }
  }

  async function testConnectionRuntimeFromWizard() {
    if (!connectionName.trim() || !connectionResource.trim()) {
      setNotice("connection name과 연결 리소스를 먼저 입력하세요.");
      return;
    }
    if (!connectionDiscoveryScope.trim()) {
      setNotice("schema discovery scope를 먼저 입력하세요.");
      return;
    }
    const secretRefs = Object.fromEntries(
      Object.entries(connectionSecretRefs)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => Boolean(value)),
    );
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "checking", checkId: selectedConnectionType.id, result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
    try {
      const runtimeResult = await testExternalConnection({
        connector_type: selectedConnectionType.runtimeConnectorType || selectedConnectionType.id,
        resource: connectionResource.trim(),
        resource_label: selectedConnectionType.resourceLabel,
        secret_refs: secretRefs,
      });
      setConnectionRuntimeCheckState({ status: "passed", checkId: selectedConnectionType.id, result: runtimeResult, error: "" });
      setConnectionInspectState({ status: "inspecting", result: null, error: "" });
      let discoveryResult;
      try {
        discoveryResult = await inspectExternalConnection({
          connector_type: selectedConnectionType.id,
          resource: connectionResource.trim(),
          resource_label: selectedConnectionType.resourceLabel,
          secret_refs: secretRefs,
          options: { scope: connectionDiscoveryScope.trim() },
        });
      } catch (error) {
        setConnectionInspectState({ status: "error", result: null, error: error.message });
        setNotice(`${selectedConnectionType.label} schema discovery 실패: ${error.message}`);
        return;
      }
      setConnectionInspected(true);
      setConnectionInspectState({ status: "discovered", result: discoveryResult, error: "" });
      setNotice(`${selectedConnectionType.label} 연결 테스트와 schema discovery가 통과했습니다.`);
    } catch (error) {
      setConnectionRuntimeCheckState({ status: "failed", checkId: selectedConnectionType.id, result: null, error: error.message });
      setConnectionInspectState({ status: "idle", result: null, error: "" });
      setNotice(`${selectedConnectionType.label} 실제 연결 테스트 실패: ${error.message}`);
    }
  }

  async function saveExternalConnectionDraft() {
    if (!connectionName.trim() || !connectionResource.trim() || !isConnectionReadyForReview) {
      setNotice(isRuntimeConnection ? "실제 연결 테스트까지 완료한 뒤 connection을 저장하세요." : "소스 검사까지 완료한 뒤 connection을 저장하세요.");
      return;
    }

    const discoveredConnection = connectionInspectState.result;
    const runtimeResult = connectionRuntimeCheckState.result;
    setConnectionSaveState({ status: "saving", record: null, error: "" });
    try {
      const record = await createExternalConnection({
        name: connectionName.trim(),
        connector_type: selectedConnectionType.id,
        resource: connectionResource.trim(),
        resource_label: selectedConnectionType.resourceLabel,
        auth_mode: selectedConnectionType.authMode,
        mode_label: selectedConnectionType.modeLabel,
        contract_hint: selectedConnectionType.contractHint,
        detected_format: discoveredConnection?.detected_format || selectedConnectionType.detectedFormat,
        detected_dataset: discoveredConnection?.detected_dataset || runtimeResult?.connector_type || selectedConnectionType.detectedDataset,
        confidence: discoveredConnection?.confidence || selectedConnectionType.confidence,
        recommended_role: discoveredConnection?.recommended_role || selectedConnectionType.recommendedRole,
        sync_mode: selectedConnectionType.syncMode,
        sync_schedule: selectedConnectionType.syncSchedule,
        schema_preview: discoveredConnection?.schema_preview || connectionSchemaPreview(selectedConnectionType),
      });
      const mappedConnection = mapExternalConnectionRecord(record);
      setSavedExternalConnections((connections) => [mappedConnection, ...connections.filter((connection) => connection.id !== mappedConnection.id)]);
      setConnectionSaveState({ status: "saved", record, error: "" });
      setNotice(`${record.name} external connection을 저장했습니다.`);
      setDatasetCreationMode(null);
    } catch (error) {
      setConnectionSaveState({ status: "error", record: null, error: error.message });
      setNotice(`External Connection 저장 실패: ${error.message}`);
    }
  }

  function goNextConnection() {
    if (canGoNextConnection && connectionWizardStepIndex < connectionWizardSteps.length - 1) {
      setConnectionWizardStepIndex((index) => index + 1);
    }
  }

  function goBackConnection() {
    if (connectionWizardStepIndex > 0) {
      setConnectionWizardStepIndex((index) => index - 1);
    }
  }

  function openSourcePicker(purpose) {
    setSourceModalPurpose(purpose);
    setIsSourceModalOpen(true);
  }

  function goNextSource() {
    if (canGoNextSource && sourceWizardStepIndex < sourceWizardSteps.length - 1) {
      setSourceWizardStepIndex((index) => index + 1);
    }
  }

  function goBackSource() {
    if (sourceWizardStepIndex > 0) {
      setSourceWizardStepIndex((index) => index - 1);
    }
  }

  function renderExternalConnectionWizard() {
    return (
      <section className="pipeline-table-card data-wizard-card external-connection-wizard">
        <div className="table-card-header">
          <div className="table-title-line">
            <ServerCog size={20} />
            <div>
              <strong>Create External Connection</strong>
              <p>로컬 파일/폴더는 schema inspect, DB/S3/Kafka는 실제 runtime connection test로 Source Dataset 입력을 준비합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <button type="button" className="ghost-action" onClick={() => setIsDatasetTypeModalOpen(true)}>
              생성 유형 변경
            </button>
            <span className="badge slate">{connectionWizardStepIndex + 1}/3 단계</span>
          </div>
        </div>
        <div className="data-wizard-layout">
          <aside className="wizard-progress connection-wizard-progress" aria-label="External connection creation wizard progress">
            {connectionWizardSteps.map((step, index) => {
              const isCurrent = index === connectionWizardStepIndex;
              const status = isCurrent ? "진행 중" : step.isComplete ? "완료" : "대기";

              return (
                <article className={`wizard-progress-step ${isCurrent ? "current" : ""} ${step.isComplete ? "complete" : ""}`} key={step.id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{status}</p>
                  </div>
                </article>
              );
            })}
          </aside>
          <main className="wizard-stage">
            {renderConnectionWizardStep()}
            <footer className="wizard-navigation">
              <button type="button" className="ghost-action" onClick={connectionWizardStepIndex === 0 ? () => setDatasetCreationMode(null) : goBackConnection}>
                <ArrowLeft size={16} />
                {connectionWizardStepIndex === 0 ? "목록으로" : "뒤로가기"}
              </button>
              {connectionWizardStepIndex < connectionWizardSteps.length - 1 ? (
                <button type="button" className="primary-action" onClick={goNextConnection} disabled={!canGoNextConnection}>
                  다음
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-action"
                  onClick={saveExternalConnectionDraft}
                  disabled={
                    !connectionName.trim() ||
                    !connectionResource.trim() ||
                    !isConnectionReadyForReview ||
                    connectionSaveState.status === "saving"
                  }
                >
                  {connectionSaveState.status === "saving" ? "저장 중" : "External connection 저장"}
                  {connectionSaveState.status === "saving" ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}
                </button>
              )}
            </footer>
          </main>
        </div>
      </section>
    );
  }

  function renderConnectionWizardStep() {
    if (currentConnectionStep.id === "connector-type") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>1단계</span>
            <div>
              <h3>Connector Type</h3>
              <p>Connector Type은 데이터셋 종류가 아니라 가져오는 방식입니다. 데이터셋 의미는 다음 단계에서 판정합니다.</p>
            </div>
          </div>
          <div className="connection-type-grid" aria-label="External connector type choices">
            {externalConnectionTypes.map((connectionType) => (
              <button
                key={connectionType.id}
                type="button"
                className={`${selectedConnectionType?.id === connectionType.id ? "selected" : ""} ${connectionType.disabled ? "disabled" : ""}`}
                disabled={connectionType.disabled}
                onClick={() => selectConnectionType(connectionType)}
              >
                <span className="connection-card-icon">
                  <ServerCog size={18} />
                </span>
                <strong>{connectionType.label}</strong>
                <p>{connectionType.description}</p>
                <small>{connectionType.modeLabel} · {formatConnectionResourceLabel(connectionType.resourceLabel)}</small>
              </button>
            ))}
          </div>
          <div className="wizard-placeholder compact">
            <CheckCircle2 size={22} />
            <strong>
              {selectedConnectionType.label} 방식이 선택되었습니다. 다음 단계에서{" "}
              {isRuntimeConnectionType(selectedConnectionType) ? "실제 연결 테스트" : "소스 검사"}를 실행합니다.
            </strong>
          </div>
        </section>
      );
    }

    if (currentConnectionStep.id === "configure") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>2단계</span>
            <div>
              <h3>Configure & Inspect</h3>
              <p>
                {isRuntimeConnection
                  ? "연결 리소스와 secret reference를 정한 뒤 실제 런타임 접속을 확인합니다."
                  : "연결 위치를 정한 뒤 소스 검사를 실행하면 sample/schema 기준으로 데이터셋 의미를 판정합니다."}
              </p>
            </div>
          </div>
          <div className="source-config-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>연결 정보</strong>
                  <p>어디서 어떻게 가져올지 정하는 connector 설정입니다.</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>연결 이름</span>
                <input
                  type="text"
                  value={connectionName}
                  onChange={(event) => {
                    setConnectionName(event.target.value);
                    setConnectionSaveState({ status: "idle", record: null, error: "" });
                  }}
                  placeholder="conn_product_health_reviews_file"
                />
              </label>
              <label className="target-name-field">
                <span>{formatConnectionResourceLabel(selectedConnectionType.resourceLabel)}</span>
                <input
                  type="text"
                  value={connectionResource}
                  onChange={(event) => setConnectionResourceValue(event.target.value)}
                  placeholder={selectedConnectionType.placeholder}
                />
              </label>
              {selectedConnectionPresets.length ? (
                <div className="source-location-actions" aria-label="Source location selection shortcuts">
                  {selectedConnectionPresets.map((preset) => (
                    <button type="button" key={preset.id} onClick={() => selectConnectionPreset(preset.id)}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {isRuntimeConnection && selectedConnectionType.secretRefFields?.length ? (
                <div className="secret-ref-grid" aria-label="Secret reference fields">
                  {selectedConnectionType.secretRefFields.map((field) => (
                    <label className="target-name-field" key={field.key}>
                      <span>{field.label}</span>
                      <input
                        type="text"
                        value={connectionSecretRefs[field.key] || ""}
                        onChange={(event) => setConnectionSecretRefValue(field.key, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
              {isRuntimeConnection ? (
                <label className="target-name-field">
                  <span>Schema discovery scope</span>
                  <input
                    type="text"
                    value={connectionDiscoveryScope}
                    onChange={(event) => setConnectionDiscoveryScopeValue(event.target.value)}
                    placeholder={defaultDiscoveryScopeForConnectionType(selectedConnectionType)}
                  />
                </label>
              ) : null}
              <div className="target-summary-strip">
                <span>Auth mode</span>
                <strong>{selectedConnectionType.authMode}</strong>
                <p>{selectedConnectionType.contractHint}</p>
              </div>
              <button
                type="button"
                className="primary-action inspect-source-action"
                onClick={isRuntimeConnection ? testConnectionRuntimeFromWizard : inspectConnectionSource}
                disabled={
                  !connectionName.trim() ||
                  !connectionResource.trim() ||
                  connectionInspectState.status === "inspecting" ||
                  connectionRuntimeCheckState.status === "checking"
                }
              >
                {isRuntimeConnection
                  ? connectionRuntimeCheckState.status === "checking"
                    ? "연결 확인 중"
                    : connectionInspectState.status === "inspecting"
                      ? "Discovery 중"
                      : "연결 테스트 + Schema discovery"
                  : connectionInspectState.status === "inspecting"
                    ? "검사 중"
                    : "소스 검사"}
                {connectionInspectState.status === "inspecting" || connectionRuntimeCheckState.status === "checking" ? (
                  <Loader2 className="spin" size={16} />
                ) : isRuntimeConnection ? (
                  <Network size={16} />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ShieldCheck size={18} />
                <div>
                  <strong>{isRuntimeConnection ? "Connection test result" : "Inspect result"}</strong>
                  <p>
                    {isRuntimeConnection
                      ? runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType)
                        ? "실제 런타임 접속과 schema discovery 결과가 함께 표시됩니다."
                        : "실제 연결 테스트를 실행하면 결과가 표시됩니다."
                      : connectionInspected
                        ? "실제 local path에서 읽은 schema discovery 결과입니다."
                        : "소스 검사를 실행하면 결과가 표시됩니다."}
                  </p>
                </div>
              </div>
              {isRuntimeConnection && connectionRuntimeCheckState.status === "failed" ? (
                <EmptyState
                  icon={AlertCircle}
                  title="연결 테스트 실패"
                  body={connectionRuntimeCheckState.error || "런타임 서버, 리소스, secret reference를 확인하세요."}
                />
              ) : isRuntimeConnection && runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType) ? (
                <>
                  <div className="source-config-summary connection-config-summary">
                    <InfoCard title="Connector" value={selectedConnectionType.label} detail={selectedConnectionType.description} />
                    <InfoCard
                      title="Runtime check"
                      value={connectionRuntimeCheckState.result.status}
                      detail={runtimeConnectionCheckLabel(selectedConnectionType)}
                    />
                    <InfoCard
                      title="Capabilities"
                      value={connectionRuntimeCheckState.result.checked_capabilities.join(", ")}
                      detail="실제 driver/broker/client check"
                    />
                    <InfoCard
                      title="Credential policy"
                      value={connectionRuntimeCheckState.result.secret_values_exposed ? "exposed" : "not exposed"}
                      detail="secret ref 이름만 사용"
                    />
                    <InfoCard
                      title="Schema discovery"
                      value={
                        connectionInspectState.status === "discovered"
                          ? `${connectionInspectState.result.schema_preview.length} fields`
                          : connectionInspectState.status === "inspecting"
                            ? "running"
                            : connectionInspectState.status === "error"
                              ? "failed"
                              : "not started"
                      }
                      detail={connectionDiscoveryScope || "discovery scope 필요"}
                    />
                  </div>
                  {connectionInspectState.status === "error" ? (
                    <div className="wizard-placeholder compact danger">
                      <AlertCircle size={22} />
                      <strong>Schema discovery 실패</strong>
                      <p>{connectionInspectState.error}</p>
                    </div>
                  ) : null}
                  {connectionInspectState.status === "inspecting" ? (
                    <div className="wizard-placeholder compact">
                      <Loader2 className="spin" size={22} />
                      <strong>Schema discovery 실행 중</strong>
                      <p>{connectionDiscoveryScope} scope에서 sample/schema를 확인하고 있습니다.</p>
                    </div>
                  ) : null}
                  {connectionInspectState.status === "discovered" && connectionInspectState.result ? (
                    <>
                      <div className="source-config-summary connection-config-summary">
                        <InfoCard
                          title="Format"
                          value={connectionInspectState.result.detected_format}
                          detail={`${formatBytes(connectionInspectState.result.bytes)} · ${connectionInspectState.result.row_count_status}`}
                        />
                        <InfoCard
                          title="Dataset scope"
                          value={connectionInspectState.result.detected_dataset}
                          detail={connectionInspectState.result.message}
                        />
                        <InfoCard
                          title="Schema fields"
                          value={`${connectionInspectState.result.schema_preview.length}`}
                          detail={connectionInspectState.result.schema_preview.slice(0, 4).map((field) => field.name).join(", ")}
                        />
                      </div>
                      <div className="schema-preview-table" aria-label="Runtime connection schema preview">
                        <div className="schema-preview-head">
                          <span>Field</span>
                          <span>Type</span>
                          <span>Sample</span>
                        </div>
                        {connectionInspectState.result.schema_preview.slice(0, 8).map((field) => (
                          <div className="schema-preview-row" key={field.name}>
                            <strong>{field.name}</strong>
                            <span>{field.type}</span>
                            <code>discovered</code>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                  <div className="target-summary-strip">
                    <span>Runtime note</span>
                    <strong>{connectionRuntimeCheckState.result.message}</strong>
                    <p>{safeRuntimeSummary(connectionRuntimeCheckState.result.safe_summary)}</p>
                  </div>
                </>
              ) : connectionInspectState.status === "error" ? (
                <EmptyState
                  icon={AlertCircle}
                  title="검사 실패"
                  body={connectionInspectState.error || "경로 또는 파일 형식을 확인하세요."}
                />
              ) : connectionInspected && connectionInspectState.result ? (
                <>
                  <div className="source-config-summary connection-config-summary">
                    <InfoCard title="Connector" value={selectedConnectionType.label} detail={selectedConnectionType.description} />
                    <InfoCard
                      title="Format"
                      value={connectionInspectState.result.detected_format}
                      detail={`${formatBytes(connectionInspectState.result.bytes)} · ${connectionInspectState.result.file_count || 1} file`}
                    />
                    <InfoCard
                      title="Detected dataset"
                      value={connectionInspectState.result.detected_dataset}
                      detail={`${connectionInspectState.result.confidence} confidence`}
                    />
                    <InfoCard
                      title="Schema"
                      value={`${connectionInspectState.result.schema_preview.length} fields`}
                      detail={connectionInspectState.result.schema_preview.slice(0, 3).map((field) => field.name).join(", ")}
                    />
                    <InfoCard
                      title="Rows"
                      value={connectionInspectState.result.row_count ?? "미측정"}
                      detail={connectionInspectState.result.row_count_status}
                    />
                  </div>
                  <div className="target-summary-strip">
                    <span>Inspect note</span>
                    <strong>{connectionInspectState.result.recommended_role}</strong>
                    <p>{connectionInspectState.result.message}</p>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={isRuntimeConnection ? Network : Search}
                  title={isRuntimeConnection ? "연결 테스트 대기" : "검사 대기"}
                  body={
                    isRuntimeConnection
                      ? "리소스와 secret reference를 입력한 뒤 실제 연결 테스트를 실행합니다."
                      : "파일 또는 폴더를 지정한 뒤 소스 검사를 실행합니다."
                  }
                />
              )}
            </section>
          </div>
        </section>
      );
    }

    return (
      <section className="wizard-step-body">
        <div className="wizard-step-heading">
          <span>3단계</span>
          <div>
            <h3>Review</h3>
            <p>External Connection draft로 준비할 내용을 최종 확인합니다.</p>
          </div>
        </div>
        <div className="review-summary-grid">
          <article>
            <span>Connection</span>
            <strong>{connectionName.trim() || "연결 이름 필요"}</strong>
            <p>demo external connection draft</p>
          </article>
          <article>
            <span>Connector type</span>
            <strong>{selectedConnectionType.label}</strong>
            <p>{selectedConnectionType.description}</p>
          </article>
          <article>
            <span>{formatConnectionResourceLabel(selectedConnectionType.resourceLabel)}</span>
            <strong>{connectionResource.trim() || selectedConnectionType.placeholder}</strong>
            <p>{selectedConnectionType.modeLabel} · {selectedConnectionType.authMode}</p>
          </article>
          <article>
            <span>Detected dataset</span>
            <strong>
              {connectionInspectState.result?.detected_dataset ||
                (runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType)
                  ? selectedConnectionType.detectedDataset
                  : "검사 대기")}
            </strong>
            <p>
              {connectionInspectState.result
                ? `${connectionInspectState.result.detected_format} · ${connectionInspectState.result.confidence} confidence`
                : runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType)
                  ? `${connectionRuntimeCheckState.result.connector_type} · ${connectionRuntimeCheckState.result.status}`
                  : "Configure & Inspect에서 소스 검사 또는 실제 연결 테스트를 먼저 실행합니다."}
            </p>
          </article>
          {isRuntimeConnection ? (
            <article>
              <span>Runtime check</span>
              <strong>{runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType) ? "passed" : "대기"}</strong>
              <p>
                {runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType)
                  ? safeRuntimeSummary(connectionRuntimeCheckState.result.safe_summary)
                  : runtimeConnectionCheckLabel(selectedConnectionType)}
              </p>
            </article>
          ) : null}
          {isRuntimeConnection ? (
            <article>
              <span>Schema discovery</span>
              <strong>{connectionInspectState.result ? `${connectionInspectState.result.schema_preview.length} fields` : "대기"}</strong>
              <p>{connectionInspectState.result ? connectionInspectState.result.detected_dataset : connectionDiscoveryScope}</p>
            </article>
          ) : null}
          <article>
            <span>Sync schedule</span>
            <strong>{selectedConnectionType.syncMode}</strong>
            <p>{selectedConnectionType.syncSchedule}</p>
          </article>
        </div>
        <div className="wizard-placeholder compact">
          {connectionSaveState.status === "saved" ? <CheckCircle2 size={22} /> : <ServerCog size={22} />}
          <strong>
            {connectionSaveState.status === "saved"
              ? `저장됨: ${connectionSaveState.record?.id}`
              : isRuntimeConnection
                ? "실제 접속 확인 결과를 External Connection metadata로 저장합니다. 원문 credential은 저장하지 않습니다."
                : "소스 검사 결과를 External Connection metadata로 저장합니다"}
          </strong>
          {connectionSaveState.status === "error" ? <p>{connectionSaveState.error}</p> : null}
        </div>
      </section>
    );
  }

  function renderSourceDatasetShell() {
    return (
      <section className="pipeline-table-card data-wizard-card source-dataset-wizard">
        <div className="table-card-header">
          <div className="table-title-line">
            <Database size={20} />
            <div>
              <strong>Create Source Dataset</strong>
              <p>등록된 External Connection에서 raw/source dataset을 정의하는 흐름입니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <span className="badge slate">{sourceWizardStepIndex + 1}/3 단계</span>
          </div>
        </div>
        <div className="data-wizard-layout">
          <aside className="wizard-progress source-wizard-progress" aria-label="Source dataset creation wizard progress">
            {sourceWizardSteps.map((step, index) => {
              const isCurrent = index === sourceWizardStepIndex;
              const status = isCurrent ? "진행 중" : step.isComplete ? "완료" : "대기";

              return (
                <article className={`wizard-progress-step ${isCurrent ? "current" : ""} ${step.isComplete ? "complete" : ""}`} key={step.id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{status}</p>
                  </div>
                </article>
              );
            })}
          </aside>
          <main className="wizard-stage">
            {renderSourceWizardStep()}
            <footer className="wizard-navigation">
              <button type="button" className="ghost-action" onClick={sourceWizardStepIndex === 0 ? () => setDatasetCreationMode(null) : goBackSource}>
                <ArrowLeft size={16} />
                {sourceWizardStepIndex === 0 ? "목록으로" : "뒤로가기"}
              </button>
              {sourceWizardStepIndex < sourceWizardSteps.length - 1 ? (
                <button type="button" className="primary-action" onClick={goNextSource} disabled={!canGoNextSource}>
                  다음
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-action"
                  onClick={saveSourceDatasetDraft}
                  disabled={
                    !sourceDraft ||
                    !sourceDatasetName.trim() ||
                    !sourceRawScope.trim() ||
                    !sourceDiscovery.canCreate ||
                    sourceSchemaPreview.length === 0 ||
                    sourceDatasetSaveState.status === "saving"
                  }
                >
                  {sourceDatasetSaveState.status === "saving" ? "저장 중" : "Source Dataset 저장"}
                  {sourceDatasetSaveState.status === "saving" ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}
                </button>
              )}
            </footer>
          </main>
        </div>
      </section>
    );
  }

  function renderSourceWizardStep() {
    if (currentSourceStep.id === "connection") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>1단계</span>
            <div>
              <h3>Connection 선택</h3>
              <p>저장된 External Connection 중 raw/source dataset 입력으로 사용할 연결을 고릅니다.</p>
            </div>
          </div>
          {sourceConnectionOptions.length > 0 || productHealthSourceInventory?.sources?.length ? (
            <>
              {productHealthSourceInventory?.sources?.length ? (
                <section className="wizard-inline-panel product-health-inventory-panel">
                  <div className="table-title-line">
                    <Sparkles size={18} />
                    <div>
                      <strong>Product Health source inventory</strong>
                      <p>준비된 복합 데이터셋 원천을 raw file과 prepared dataset으로 구분해서 Source Dataset 후보로 표시합니다.</p>
                    </div>
                  </div>
                  <div className="connection-type-grid source-connection-grid product-health-source-grid">
                    {productHealthSourceInventory.sources.map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        className={`${sourceDraft?.id === `product-health:${item.role}` ? "selected" : ""} ${!item.can_create_source_dataset ? "disabled" : ""}`}
                        disabled={!item.can_create_source_dataset}
                        onClick={() => selectProductHealthInventorySource(item)}
                      >
                        <span className="connection-card-icon">
                          {item.binding_type === "prepared_dataset" ? <Archive size={18} /> : <FileJson size={18} />}
                        </span>
                        <strong>{item.label}</strong>
                        <p>{item.source_dataset_name}</p>
                        <small>{productHealthBindingLabel(item.binding_type)} · {productHealthStatusLabel(item)}</small>
                        <small>{formatBytes(item.bytes)} · {item.row_count ?? "row 미측정"} rows · {item.schema_preview?.length || 0} fields</small>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {sourceConnectionOptions.length > 0 ? (
                <div className="connection-type-grid source-connection-grid" aria-label="External connection choices for source dataset">
                  {sourceConnectionOptions.map((connection) => (
                    <button
                      key={connection.id}
                      type="button"
                      className={sourceDraft?.id === connection.id ? "selected" : ""}
                      onClick={() => selectSourceConnection(connection)}
                    >
                      <span className="connection-card-icon">
                        <ServerCog size={18} />
                      </span>
                      <strong>{connection.name}</strong>
                      <p>{connection.description}</p>
                      <small>{connection.typeLabel} · {formatConnectionResourceLabel(connection.resourceLabel)}</small>
                      <small>
                        {isLocalDiscoveryConnection(connection)
                          ? `${connection.columns.length} schema fields ready`
                          : "connection tested · schema discovery pending"}
                      </small>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState
              icon={ServerCog}
              title="저장된 External Connection이 없습니다"
              body="먼저 연결 화면에서 External Connection을 저장한 뒤 Source Dataset을 생성합니다."
            />
          )}
          <div className="wizard-source-layout">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <FileJson size={18} />
                <div>
                  <strong>Connection preview</strong>
                  <p>{sourceDraft ? "Raw Dataset 설정 단계에서 source scope와 schema preview로 사용됩니다." : "connection 선택 후 metadata preview가 표시됩니다."}</p>
                </div>
              </div>
              {sourceDraft ? (
                <div className="source-config-summary">
                  <InfoCard title="Connection" value={sourceDraft.name} detail={sourceDraft.status} />
                  <InfoCard title={formatConnectionResourceLabel(sourceDraft.resourceLabel)} value={sourceDraft.resource} detail={`수정 ${sourceDraft.updatedLabel}`} />
                  <InfoCard title="Discovery" value={sourceDiscovery.label} detail={sourceDiscovery.message} />
                  <InfoCard
                    title="Schema"
                    value={`${sourceSchemaPreview.length} columns`}
                    detail={sourceSchemaPreview.length ? sourceSchemaPreview.slice(0, 3).map((field) => field.name).join(", ") : "schema discovery pending"}
                  />
                </div>
              ) : (
                <EmptyState
                  icon={ServerCog}
                  title="선택된 External Connection이 없습니다"
                  body="저장된 External Connection을 선택해 raw/source dataset 설정을 시작합니다."
                />
              )}
              {sourceDraft ? (
                <>
                  <div className="table-card-actions source-discovery-actions">
                    <button
                      type="button"
                      className="ghost-action"
                      onClick={() => discoverSelectedSourceConnection(sourceDraft)}
                      disabled={sourceDiscoveryState.status === "inspecting"}
                    >
                      {sourceDiscoveryState.status === "inspecting" ? "Discovery 중" : "Discovery 다시 실행"}
                      {sourceDiscoveryState.status === "inspecting" ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
                    </button>
                  </div>
                  {sourceDiscoveryState.result ? (
                    <div className="source-config-summary connection-config-summary">
                      <InfoCard
                        title="Format"
                        value={sourceDiscoveryState.result.detected_format}
                        detail={`${formatBytes(sourceDiscoveryState.result.bytes)} · ${sourceDiscoveryState.result.file_count || 1} file`}
                      />
                      <InfoCard
                        title="Rows"
                        value={sourceDiscoveryState.result.row_count ?? "미측정"}
                        detail={sourceDiscoveryState.result.row_count_status}
                      />
                      <InfoCard
                        title="Detected dataset"
                        value={sourceDiscoveryState.result.detected_dataset}
                        detail={`${sourceDiscoveryState.result.confidence} confidence`}
                      />
                    </div>
                  ) : null}
                  {!sourceDiscovery.canCreate ? (
                    <div className="wizard-placeholder compact danger">
                      <AlertCircle size={22} />
                      <strong>{sourceDiscovery.label}</strong>
                      <p>{sourceDiscovery.message}</p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>
          </div>
        </section>
      );
    }

    if (currentSourceStep.id === "raw-config") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>2단계</span>
            <div>
              <h3>Raw Dataset 설정</h3>
              <p>선택한 연결에서 만들 raw/source dataset 이름과 원천 범위를 설정합니다.</p>
            </div>
          </div>
          <div className="source-config-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>Source Dataset 설정</strong>
                  <p>AskLake raw/source 영역에 등록할 원본 데이터셋 정보입니다.</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>Source Dataset 이름</span>
                <input
                  type="text"
                  value={sourceDatasetName}
                  onChange={(event) => {
                    setSourceDatasetName(event.target.value);
                    setSourceDatasetSaveState({ status: "idle", record: null, error: "" });
                  }}
                  placeholder="source_product_health_reviews"
                />
              </label>
              <label className="target-name-field">
                <span>{formatConnectionResourceLabel(sourceDraft?.resourceLabel)}</span>
                <input
                  type="text"
                  value={sourceRawScope}
                  onChange={(event) => {
                    setSourceRawScope(event.target.value);
                    setSourceDiscoveryState({ status: "idle", result: null, error: "" });
                    setSourceDatasetSaveState({ status: "idle", record: null, error: "" });
                  }}
                  placeholder={sourceDraft?.resource || "raw/source scope"}
                />
              </label>
              <div className="target-summary-strip">
                <span>External Connection</span>
                <strong>{sourceDraft?.name || "connection 필요"}</strong>
                <p>{sourceDraft ? `${sourceDraft.typeLabel} · ${sourceDraft.status}` : "Connection 선택 단계에서 고릅니다."}</p>
              </div>
              <button
                type="button"
                className="primary-action inspect-source-action"
                onClick={() => discoverSelectedSourceConnection(sourceDraft)}
                disabled={!sourceDraft || !sourceRawScope.trim() || sourceDiscoveryState.status === "inspecting"}
              >
                {sourceDiscoveryState.status === "inspecting" ? "Discovery 중" : "Schema discovery 실행"}
                {sourceDiscoveryState.status === "inspecting" ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
              </button>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <FileJson size={18} />
                <div>
                  <strong>Raw schema preview</strong>
                  <p>Source Dataset으로 저장될 raw/source schema 예시입니다.</p>
                </div>
              </div>
              {sourceDraft && sourceSchemaPreview.length > 0 ? (
                <div className="schema-preview-table" aria-label="Source dataset configure schema preview">
                  <div className="schema-preview-head">
                    <span>Field</span>
                    <span>Type</span>
                    <span>Sample</span>
                  </div>
                  {sourceSchemaPreview.map((field) => (
                    <div className="schema-preview-row" key={field.name}>
                      <strong>{field.name}</strong>
                      <span>{field.type}</span>
                      <code>{field.sample}</code>
                    </div>
                  ))}
                </div>
              ) : sourceDraft ? (
                <EmptyState
                  icon={AlertCircle}
                  title={sourceDiscovery.label}
                  body={sourceDiscovery.message}
                />
              ) : (
                <EmptyState icon={FileJson} title="Schema preview 대기" body="External Connection을 먼저 선택합니다." />
              )}
            </section>
          </div>
        </section>
      );
    }

    return (
      <section className="wizard-step-body">
        <div className="wizard-step-heading">
          <span>3단계</span>
          <div>
            <h3>Review</h3>
            <p>External Connection에서 raw/source dataset으로 만들 내용을 마지막으로 확인합니다.</p>
          </div>
        </div>
        <div className="review-summary-grid dataset-review-grid source-review-grid">
          <article className="review-primary">
            <span>External Connection</span>
            <strong>{sourceDraft?.name || "선택 전"}</strong>
            <p>{sourceDraft ? `${sourceDraft.typeLabel} · ${sourceDraft.status}` : "1단계에서 connection을 선택합니다."}</p>
          </article>
          <article className="review-output">
            <span>Source dataset</span>
            <strong>{sourceDatasetName.trim() || "Source Dataset 이름 필요"}</strong>
            <p>AskLake raw/source zone dataset draft입니다.</p>
          </article>
          <article>
            <span>{formatConnectionResourceLabel(sourceDraft?.resourceLabel)}</span>
            <strong>{sourceRawScope.trim() || "원본 범위 필요"}</strong>
            <p>{sourceDraft ? `${sourceSchemaPreview.length} columns · ${sourceDiscovery.label}` : "raw metadata 대기"}</p>
          </article>
          <article>
            <span>Discovery status</span>
            <strong>{sourceDiscovery.label}</strong>
            <p>{sourceDiscovery.message}</p>
          </article>
        </div>
        <div className="target-lineage-strip review-lineage-strip source-review-lineage">
          <span>{sourceDraft?.typeLabel || "External Connection"}</span>
          <ArrowRight size={16} />
          <span>{sourceRawScope.trim() || "raw scope"}</span>
          <ArrowRight size={16} />
          <strong>{sourceDatasetName.trim() || "Source Dataset"}</strong>
        </div>
        <div className="wizard-placeholder compact">
          {sourceDatasetSaveState.status === "saved" ? <CheckCircle2 size={22} /> : <ServerCog size={22} />}
          <strong>
            {sourceDatasetSaveState.status === "saved"
              ? `저장됨: ${sourceDatasetSaveState.record?.id}`
              : sourceDiscovery.canCreate
                ? "선택한 External Connection과 원본 범위를 Source Dataset metadata로 저장합니다"
                : "schema discovery가 가능한 connection만 Source Dataset으로 저장할 수 있습니다"}
          </strong>
          {sourceDatasetSaveState.status === "error" ? <p>{sourceDatasetSaveState.error}</p> : null}
        </div>
      </section>
    );
  }

  function renderSilverDatasetWizard() {
    return (
      <section className="pipeline-table-card data-wizard-card">
        <div className="table-card-header">
          <div className="table-title-line">
            <Layers3 size={20} />
            <div>
              <strong>Create Silver Dataset</strong>
              <p>Source Dataset을 표준화/검증한 Silver Dataset metadata로 저장합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <button type="button" className="ghost-action" onClick={() => setDatasetCreationMode(null)}>
              목록으로
            </button>
            <span className="badge slate">{silverWizardStepIndex + 1}/{silverWizardSteps.length} 단계</span>
          </div>
        </div>
        <div className="data-wizard-layout">
          <aside className="wizard-progress target-wizard-progress" aria-label="Silver dataset creation wizard progress">
            {silverWizardSteps.map((step, index) => {
              const isCurrent = index === silverWizardStepIndex;
              const isComplete =
                (step.id === "source" && Boolean(selectedSilverSource)) ||
                (step.id === "rules" &&
                  Boolean(silverDatasetName.trim() && silverPurpose.trim()) &&
                  selectedSilverStandardizeRules.length > 0 &&
                  selectedSilverValidationRules.length > 0);
              const status = isCurrent ? "진행 중" : isComplete ? "완료" : "대기";

              return (
                <article className={`wizard-progress-step ${isCurrent ? "current" : ""} ${isComplete ? "complete" : ""}`} key={step.id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{status}</p>
                  </div>
                </article>
              );
            })}
          </aside>
          <main className="wizard-stage">
            {currentSilverStep.id === "source" ? (
              <section className="wizard-step-body">
                <div className="wizard-step-heading">
                  <span>1단계</span>
                  <div>
                    <h3>Source Dataset 선택</h3>
                    <p>Silver Dataset으로 표준화할 persisted Source Dataset을 고릅니다.</p>
                  </div>
                </div>
                {savedSourceDatasets.length > 0 ? (
                  <div className="target-source-card-grid">
                    {savedSourceDatasets.map((sourceDataset) => {
                      const isSelected = selectedSilverSourceId === sourceDataset.id;
                      return (
                        <article className={`target-source-card ${isSelected ? "selected" : ""}`} key={sourceDataset.id}>
                          <button type="button" onClick={() => selectSilverSourceDataset(sourceDataset)}>
                            <div className="target-source-head">
                              <span>{sourceDataset.connection_type}</span>
                              <strong>{sourceDataset.name}</strong>
                            </div>
                            <p>{sourceDataset.raw_scope}</p>
                            <small>{sourceDataset.schema_preview?.length || 0} fields · {sourceDataset.status}</small>
                          </button>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState icon={Database} title="Source Dataset 필요" body="Silver Dataset은 Source Dataset에서만 만들 수 있습니다." />
                )}
              </section>
            ) : null}

            {currentSilverStep.id === "rules" ? (
              <section className="wizard-step-body">
                <div className="wizard-step-heading">
                  <span>2단계</span>
                  <div>
                    <h3>Rules 설정</h3>
                    <p>Silver output 이름과 표준화/검증 규칙 metadata를 설정합니다.</p>
                  </div>
                </div>
                <div className="source-config-grid silver-rules-layout">
                  <section className="wizard-inline-panel silver-draft-panel">
                    <div className="table-title-line">
                      <Layers3 size={18} />
                      <div>
                        <strong>Silver dataset draft</strong>
                        <p>{selectedSilverSource?.name || "Source Dataset 선택 필요"}</p>
                      </div>
                    </div>
                    <label className="target-name-field">
                      <span>silver_dataset_name</span>
                      <input
                        type="text"
                        value={silverDatasetName}
                        onChange={(event) => {
                          setSilverDatasetName(event.target.value);
                          setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
                        }}
                      />
                    </label>
                    <label className="target-name-field">
                      <span>purpose</span>
                      <input
                        type="text"
                        value={silverPurpose}
                        onChange={(event) => {
                          setSilverPurpose(event.target.value);
                          setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
                        }}
                      />
                    </label>
                  </section>
                  <section className="wizard-inline-panel silver-rules-panel">
                    <div className="table-title-line">
                      <ShieldCheck size={18} />
                      <div>
                        <strong>Standardize / Validate</strong>
                        <p>데모용 metadata rule이며 실제 row 변환은 실행하지 않습니다.</p>
                      </div>
                    </div>
                    <div className="processing-recipe-grid silver-rule-grid">
                      {[...silverStandardizeRuleOptions, ...silverValidationRuleOptions].map((rule) => {
                        const kind = silverStandardizeRuleOptions.some((option) => option.id === rule.id) ? "standardize" : "validation";
                        const isSelected =
                          kind === "standardize"
                            ? selectedSilverStandardizeRules.includes(rule.id)
                            : selectedSilverValidationRules.includes(rule.id);
                        return (
                          <button
                            type="button"
                            className={isSelected ? "selected" : ""}
                            onClick={() => toggleSilverRule(kind, rule.id)}
                            key={rule.id}
                          >
                            <span>{kind === "standardize" ? "Standardize" : "Validate"}</span>
                            <strong>{rule.label}</strong>
                            <p>{rule.detail}</p>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </section>
            ) : null}

            {currentSilverStep.id === "review" ? (
              <section className="wizard-step-body">
                <div className="wizard-step-heading">
                  <span>3단계</span>
                  <div>
                    <h3>Review</h3>
                    <p>Silver Dataset metadata로 저장될 내용을 확인합니다.</p>
                  </div>
                </div>
                <div className="review-summary-grid dataset-review-grid silver-review-grid">
                  <article className="review-primary">
                    <span>Source Dataset</span>
                    <strong>{selectedSilverSource?.name || "선택 전"}</strong>
                    <p>{selectedSilverSource?.raw_scope || "Source Dataset을 먼저 선택합니다."}</p>
                  </article>
                  <article className="review-output">
                    <span>Silver Dataset</span>
                    <strong>{silverDatasetName.trim() || "silver name 필요"}</strong>
                    <p>{silverPurpose.trim() || "purpose 필요"}</p>
                  </article>
                  <article>
                    <span>Standardize</span>
                    <strong>{selectedSilverStandardizeRuleDetails.length} rules</strong>
                    <p>{selectedSilverStandardizeRuleDetails.map((rule) => rule.label).join(", ") || "선택 없음"}</p>
                  </article>
                  <article>
                    <span>Validate</span>
                    <strong>{selectedSilverValidationRuleDetails.length} rules</strong>
                    <p>{selectedSilverValidationRuleDetails.map((rule) => rule.label).join(", ") || "선택 없음"}</p>
                  </article>
                </div>
                <div className="target-lineage-strip review-lineage-strip silver-review-lineage">
                  <span>{selectedSilverSource?.name || "Source Dataset"}</span>
                  <ArrowRight size={16} />
                  <span>{selectedSilverStandardizeRuleDetails.length + selectedSilverValidationRuleDetails.length} Rules</span>
                  <ArrowRight size={16} />
                  <strong>{silverDatasetName.trim() || "Silver Dataset"}</strong>
                </div>
                <div className="schema-preview-table" aria-label="Silver dataset schema preview">
                  <div className="schema-preview-head">
                    <span>Field</span>
                    <span>Type</span>
                    <span>Source</span>
                  </div>
                  {(selectedSilverSource?.schema_preview || []).map((field) => (
                    <div className="schema-preview-row" key={field.name}>
                      <strong>{field.name}</strong>
                      <span>{field.type}</span>
                      <code>{selectedSilverSource?.name}</code>
                    </div>
                  ))}
                </div>
                <div className="wizard-placeholder compact">
                  {silverDatasetSaveState.status === "saved" ? <CheckCircle2 size={22} /> : <Layers3 size={22} />}
                  <strong>
                    {silverDatasetSaveState.status === "saved"
                      ? `저장됨: ${silverDatasetSaveState.record?.id}`
                      : "이 draft는 Silver Dataset metadata로 저장됩니다"}
                  </strong>
                  {silverDatasetSaveState.status === "error" ? <p>{silverDatasetSaveState.error}</p> : null}
                </div>
              </section>
            ) : null}
          </main>
        </div>
        <footer className="wizard-navigation">
          <button type="button" className="ghost-action" onClick={silverWizardStepIndex === 0 ? () => setDatasetCreationMode(null) : goBackSilver}>
            <ArrowLeft size={16} />
            {silverWizardStepIndex === 0 ? "목록으로" : "뒤로가기"}
          </button>
          {silverWizardStepIndex < silverWizardSteps.length - 1 ? (
            <button type="button" className="primary-action" onClick={goNextSilver} disabled={!canGoNextSilver}>
              다음
              <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className="primary-action" onClick={saveSilverDatasetDraft} disabled={silverDatasetSaveState.status === "saving"}>
              <Save size={16} />
              {silverDatasetSaveState.status === "saving" ? "저장 중" : "Silver Dataset 저장"}
            </button>
          )}
        </footer>
      </section>
    );
  }

  function renderTargetDatasetWizard() {
    return (
      <section className="pipeline-table-card data-wizard-card">
        <div className="table-card-header">
          <div className="table-title-line">
            <Workflow size={20} />
            <div>
              <strong>Create Gold Dataset</strong>
              <p>Silver Dataset을 조합해 Gold Dataset과 Build Job 설정을 준비합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <button type="button" className="ghost-action" onClick={() => setIsDatasetTypeModalOpen(true)}>
              생성 유형 변경
            </button>
            <span className="badge slate">{currentStepIndex + 1}/{wizardSteps.length} 단계</span>
          </div>
        </div>
        <div className="data-wizard-layout">
          <aside className="wizard-progress target-wizard-progress" aria-label="Target dataset creation wizard progress">
            {wizardSteps.map((step, index) => {
              const isCurrent = index === currentStepIndex;
              const status = isCurrent ? "진행 중" : step.isComplete ? "완료" : "대기";

              return (
                <article className={`wizard-progress-step ${isCurrent ? "current" : ""} ${step.isComplete ? "complete" : ""}`} key={step.id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{status}</p>
                  </div>
                </article>
              );
            })}
          </aside>
          <main className="wizard-stage">
            {renderWizardStep()}
            <footer className="wizard-navigation">
              <button type="button" className="ghost-action" onClick={currentStepIndex === 0 ? () => setDatasetCreationMode(null) : goBack}>
                <ArrowLeft size={16} />
                {currentStepIndex === 0 ? "목록으로" : "뒤로가기"}
              </button>
              {currentStepIndex < wizardSteps.length - 1 ? (
                <button type="button" className="primary-action" onClick={goNext} disabled={!canGoNext}>
                  다음
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-action"
                  onClick={saveTargetDatasetDraft}
                  disabled={
                    !normalizedTargetName ||
                    selectedTargetSilvers.length < 2 ||
                    selectedProcessRecipes.length === 0 ||
                    targetDraftSaveState.status === "saving"
                  }
                >
                  {targetDraftSaveState.status === "saving" ? "저장 중" : "Gold Dataset 저장"}
                  {targetDraftSaveState.status === "saving" ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}
                </button>
              )}
            </footer>
          </main>
        </div>
      </section>
    );
  }

  function renderWizardStep() {
    if (currentStep.id === "overview") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>1단계</span>
            <div>
              <h3>Gold Dataset 개요</h3>
              <p>Build Job이 생성하거나 갱신할 Gold Dataset의 이름과 목적을 먼저 정합니다.</p>
            </div>
          </div>
          <section className="wizard-inline-panel target-setup-panel">
            <div className="table-title-line">
              <Table2 size={18} />
              <div>
                <strong>Gold Dataset 설정</strong>
                <p>Silver Dataset과 processing rule이 붙을 최종 분석용 데이터셋 정보입니다.</p>
              </div>
            </div>
            <label className="target-name-field">
              <span>Gold Dataset 이름</span>
              <input
                type="text"
                value={targetName}
                onChange={(event) => {
                  setTargetName(event.target.value);
                  setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                }}
                placeholder="dataset_product_health_gold"
              />
            </label>
            <label className="target-name-field">
              <span>생성 목적</span>
              <input
                type="text"
                value={targetDescription}
                onChange={(event) => {
                  setTargetDescription(event.target.value);
                  setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                }}
                placeholder="제품 상태 분석용 Gold Dataset"
              />
            </label>
            <div className="target-summary-strip">
              <span>Gold output</span>
              <strong>{normalizedTargetName || "Gold Dataset 이름 필요"}</strong>
              <p>{normalizedTargetDescription || "dataset 목적을 짧게 적어둡니다."}</p>
            </div>
          </section>
        </section>
      );
    }

    if (currentStep.id === "source") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>2단계</span>
            <div>
              <h3>Silver 선택</h3>
              <p>Gold Dataset을 만들 여러 Silver Dataset을 선택하고 row 기준이 되는 Base silver를 정합니다.</p>
            </div>
            <div className="handoff-actions">
              <button type="button" className="ghost-action" onClick={startSourceCreationForGoldInput}>
                Source Dataset 생성
                <Database size={16} />
              </button>
              <button type="button" className="primary-action" onClick={startSilverCreationForGoldInput}>
                Silver Dataset 생성
                <Layers3 size={16} />
              </button>
            </div>
          </div>
          <div className="wizard-source-layout">
            <div className="target-source-card-grid" aria-label="Target dataset silver choices">
              {savedSilverDatasets.map((silverDataset) => {
                const isSelected = targetSilverIds.includes(silverDataset.id);
                const isBase = baseTargetSilver?.id === silverDataset.id;

                return (
                  <article className={`target-source-card ${isSelected ? "selected" : ""}`} key={silverDataset.id}>
                    <button type="button" onClick={() => toggleTargetSilver(silverDataset)}>
                      <span className="source-card-icon">
                        <Layers3 size={18} aria-hidden="true" />
                      </span>
                      <span className="source-card-badge">Silver Dataset</span>
                      <strong>{silverDataset.name}</strong>
                      <p>{silverDataset.purpose}</p>
                      <small>{silverDataset.schema_preview?.length || 0} fields · from {silverDataset.source_dataset_name}</small>
                    </button>
                    {isSelected ? (
                      <button
                        type="button"
                        className={`source-role-toggle ${isBase ? "base" : ""}`}
                        onClick={() => selectBaseTargetSilver(silverDataset.id)}
                      >
                        {isBase ? "Base silver" : "Enrichment silver"}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <FileJson size={18} />
                <div>
                  <strong>Multi-silver preview</strong>
                  <p>{selectedTargetSilvers.length > 0 ? "선택한 Silver Dataset들이 Processing 단계의 join/enrich 입력으로 사용됩니다." : "2개 이상의 Silver Dataset을 선택합니다."}</p>
                </div>
              </div>
              {selectedTargetSilvers.length > 0 ? (
                <div className="multi-source-preview-list">
                  {selectedTargetSilvers.map((silverDataset) => (
                    <div className="multi-source-preview-item" key={silverDataset.id}>
                      <div>
                        <strong>{silverDataset.name}</strong>
                        <p>{baseTargetSilver?.id === silverDataset.id ? "Base silver" : "Enrichment"} · from {silverDataset.source_dataset_name}</p>
                      </div>
                      <span>{(silverDataset.schema_preview || []).map((field) => field.name).slice(0, 4).join(", ")}</span>
                    </div>
                  ))}
                  <div className="target-summary-strip">
                    <span>Target grain</span>
                    <strong>{baseTargetSilver ? "product_id 단위 gold dataset" : "base silver 필요"}</strong>
                    <p>{baseTargetSilver ? `${baseTargetSilver.name}를 기준으로 상품별 row를 만들고 enrichment silver를 붙입니다.` : "Base silver를 고르면 join 기준과 output row 단위가 명확해집니다."}</p>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Layers3}
                  title="아직 선택된 Silver Dataset이 없습니다"
                  body="Silver Dataset을 2개 이상 만든 뒤 Gold Dataset 입력으로 선택합니다."
                />
              )}
            </section>
          </div>
        </section>
      );
    }

    if (currentStep.id === "process") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>3단계</span>
            <div>
              <h3>Process</h3>
              <p>{selectedTargetSilvers.length >= 2 ? "선택한 Silver Dataset들을 어떤 방식으로 합칠지 processing recipe를 정합니다." : "Silver Dataset을 2개 이상 먼저 선택합니다."}</p>
            </div>
          </div>
          <section className={`transform-panel wizard-inline-panel ${selectedTargetSilvers.length >= 2 ? "" : "disabled"}`}>
            <div className="table-title-line">
              <GitBranch size={18} />
              <div>
                <strong>Recommended processing recipe</strong>
                <p>데모에서는 SQL을 직접 쓰기보다 join, aggregate, enrich, score 방법을 선택해 job draft로 남깁니다.</p>
              </div>
            </div>
            {selectedTargetSilvers.length >= 2 ? (
              <>
                <div className="processing-recipe-grid" aria-label="Target processing recipe choices">
                  {targetProcessingRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      className={selectedRecipeIds.includes(recipe.id) ? "selected" : ""}
                      onClick={() => toggleProcessingRecipe(recipe.id)}
                    >
                      <span>{recipe.kind}</span>
                      <strong>{recipe.title}</strong>
                      <p>{recipe.detail}</p>
                      <small>Output · {recipe.output.join(", ")}</small>
                    </button>
                  ))}
                </div>
                <section className="silver-lineage-preview" aria-label="Silver to gold lineage preview">
                  <div className="table-title-line">
                    <Workflow size={18} />
                    <div>
                      <strong>Processing diagram</strong>
                      <p>Base Silver를 기준으로 enrichment Silver를 붙이고 recipe 순서대로 Gold Dataset을 만듭니다.</p>
                    </div>
                  </div>
                  <div className="process-diagram">
                    <section className="process-diagram-column process-input-column">
                      <span>Inputs</span>
                      <div className="process-node base-node">
                        <strong>{baseTargetSilver?.name || "Base Silver Dataset"}</strong>
                        <small>기준 grain · product_id</small>
                      </div>
                      {enrichmentTargetSilvers.length ? (
                        enrichmentTargetSilvers.map((silverDataset) => (
                          <div className="process-node enrichment-node" key={silverDataset.id}>
                            <strong>{silverDataset.name}</strong>
                            <small>enrichment · {silverDataset.source_dataset_name}</small>
                          </div>
                        ))
                      ) : (
                        <div className="process-node muted-node">
                          <strong>Enrichment Silver</strong>
                          <small>추가 Silver Dataset을 선택하면 join 입력으로 표시됩니다.</small>
                        </div>
                      )}
                    </section>
                    <div className="process-arrow" aria-hidden="true">
                      <ArrowRight size={22} />
                    </div>
                    <section className="process-diagram-column process-recipe-column">
                      <span>Processing</span>
                      <div className="process-recipe-lane">
                        {selectedProcessRecipes.map((recipe, index) => (
                          <article className="process-recipe-node" key={recipe.id}>
                            <span>{index + 1}</span>
                            <div>
                              <strong>{recipe.title}</strong>
                              <small>{recipe.kind} output · {recipe.output.slice(0, 2).join(", ")}</small>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                    <div className="process-arrow" aria-hidden="true">
                      <ArrowRight size={22} />
                    </div>
                    <section className="process-diagram-column process-output-column">
                      <span>Output</span>
                      <div className="process-node gold-node">
                        <strong>{normalizedTargetName || "dataset_product_health_gold"}</strong>
                        <small>{selectedOutputSchema.length} fields · Gold Dataset</small>
                      </div>
                      <div className="process-node catalog-node">
                        <strong>Catalog / AI Query</strong>
                        <small>실행 성공 후 schema, lineage, SQL context로 등록</small>
                      </div>
                    </section>
                  </div>
                </section>
                <div className="target-lineage-strip">
                  <span>{baseTargetSilver?.name || "Base silver"}</span>
                  <ArrowRight size={16} />
                  <span>{selectedTargetSilvers.length} Silver Datasets</span>
                  <ArrowRight size={16} />
                  <span>{enrichmentTargetSilvers.length} enrichment silvers</span>
                  <ArrowRight size={16} />
                  <span>{selectedProcessRecipes.length} recipes</span>
                  <ArrowRight size={16} />
                  <strong>{normalizedTargetName || "Gold Dataset"}</strong>
                </div>
                <div className="transform-output-preview">
                  <div className="table-title-line">
                    <Table2 size={18} />
                    <div>
                      <strong>Gold schema preview</strong>
                      <p>선택한 recipe들이 만들 Gold Dataset schema preview입니다.</p>
                    </div>
                  </div>
                  {selectedOutputSchema.length > 0 ? (
                    <div className="schema-preview-table" aria-label="Transform output schema preview">
                      <div className="schema-preview-head">
                        <span>Field</span>
                        <span>Type</span>
                        <span>Sample</span>
                      </div>
                      {selectedOutputSchema.map((field) => (
                        <div className="schema-preview-row" key={field.name}>
                          <strong>{field.name}</strong>
                          <span>{field.type}</span>
                          <code>{field.sample}</code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Table2}
                      title="Gold schema가 비어 있습니다"
                      body="Gold Dataset에 남길 필드를 하나 이상 선택합니다."
                    />
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={GitBranch}
                title="Process 설정 대기"
                body="뒤로가기로 돌아가 Silver Dataset을 2개 이상 선택합니다."
              />
            )}
          </section>
          <div className="wizard-placeholder compact">
            <CheckCircle2 size={22} />
            <strong>다음 단계에서 Build Job 실행 방식을 확인합니다</strong>
          </div>
        </section>
      );
    }

    if (currentStep.id === "handoff") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>4단계</span>
            <div>
              <h3>Build 실행 준비</h3>
              <p>Gold Dataset을 갱신할 Build Job이 어떤 실행 방식으로 준비되는지 정합니다. 실제 실행 연결은 다음 Phase에서 붙입니다.</p>
            </div>
          </div>
          <section className="wizard-inline-panel target-handoff-panel">
            <div className="table-title-line">
              <Play size={18} />
              <div>
                <strong>Build Job 실행 방식</strong>
                <p>저장될 Build Job의 실행 대상을 고릅니다. Airflow DAG trigger, run id, status polling은 아직 호출하지 않습니다.</p>
              </div>
            </div>
            <div className="target-executor-grid" aria-label="Target dataset executor handoff">
              {targetExecutorOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={targetExecutorMode === option.id ? "selected" : ""}
                  onClick={() => {
                    setTargetExecutorMode(option.id);
                    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                  }}
                >
                  <Network size={18} />
                  <strong>{option.label}</strong>
                  <p>{option.detail}</p>
                </button>
              ))}
            </div>
            <div className="target-summary-strip">
              <span>실행 방식</span>
              <strong>{targetExecutorMode}</strong>
              <p>
                {targetExecutorMode === "airflow"
                  ? "Airflow 실행 준비 metadata만 저장합니다. DAG trigger와 run status는 다음 Phase에서 붙입니다."
                  : targetExecutorMode === "spark_runner"
                    ? "Spark runner 실행 준비 metadata만 저장합니다. 실제 materialization은 다음 실행 Phase에서 붙입니다."
                    : "Local runner 실행 준비 metadata만 저장합니다. 실제 Silver/Gold 생성은 다음 실행 Phase에서 붙입니다."}
              </p>
            </div>
          </section>
        </section>
      );
    }

    if (currentStep.id === "scheduling") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>5단계</span>
            <div>
              <h3>Scheduling</h3>
              <p>Gold Dataset을 갱신할 Build Job의 실행 시점을 정합니다.</p>
            </div>
          </div>
          <section className="wizard-inline-panel target-schedule-panel">
            <div className="table-title-line">
              <Clock3 size={18} />
              <div>
                <strong>Schedule policy</strong>
                <p>데모 기본값은 manual입니다. schedule placeholder는 저장 의미만 있고 실제 스케줄러 등록은 하지 않습니다.</p>
              </div>
            </div>
            <div className="schedule-choice-grid" aria-label="Target dataset schedule mode">
              <label className={targetScheduleMode === "manual" ? "selected" : ""}>
                <input
                  type="radio"
                  name="target-schedule"
                  value="manual"
                  checked={targetScheduleMode === "manual"}
                  onChange={() => {
                    setTargetScheduleMode("manual");
                    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                  }}
                />
                <span>
                  <strong>Manual</strong>
                  <small>데모 기본값. Gold Dataset 갱신 job을 수동 실행 대상으로 표시합니다.</small>
                </span>
              </label>
              <label className={targetScheduleMode === "placeholder" ? "selected" : ""}>
                <input
                  type="radio"
                  name="target-schedule"
                  value="placeholder"
                  checked={targetScheduleMode === "placeholder"}
                  onChange={() => {
                    setTargetScheduleMode("placeholder");
                    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                  }}
                />
                <span>
                  <strong>Schedule placeholder</strong>
                  <small>cron UI 자리만 확인합니다. job schedule 저장은 하지 않습니다.</small>
                </span>
              </label>
            </div>
            <label className="target-name-field">
              <span>스케줄 메모</span>
              <input
                type="text"
                value={targetScheduleNote}
                onChange={(event) => {
                  setTargetScheduleNote(event.target.value);
                  setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                }}
                placeholder="데모에서는 수동 실행으로만 준비합니다."
              />
            </label>
            <div className="target-summary-strip">
              <span>Schedule summary</span>
              <strong>{targetScheduleMode === "manual" ? "Manual" : "Placeholder"}</strong>
              <p>{targetScheduleNote.trim() || "schedule note 없음"}</p>
            </div>
          </section>
        </section>
      );
    }

    if (currentStep.id === "review") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>6단계</span>
            <div>
              <h3>Review</h3>
              <p>Gold Dataset과 Build Job 설정을 최종 확인합니다.</p>
            </div>
          </div>
          <div className="review-summary-grid dataset-review-grid target-review-grid">
            <article className="review-primary">
              <span>Gold Dataset</span>
              <strong>{normalizedTargetName || "Gold Dataset 이름 필요"}</strong>
              <p>{normalizedTargetDescription || "생성 목적 없음"}</p>
            </article>
            <article className="review-output">
              <span>Job input</span>
              <strong>{selectedTargetSilvers.length} Silver Datasets</strong>
              <p>{baseTargetSilver ? `Base silver · ${baseTargetSilver.name} · Target grain product_id` : "Silver 선택 단계에서 고릅니다."}</p>
            </article>
            <article>
              <span>ETL process</span>
              <strong>{selectedProcessRecipes.length} recipes</strong>
              <p>{selectedFieldSummary}{selectedProcessRecipes.length > 3 ? "..." : ""}</p>
            </article>
            <article>
              <span>Silver outputs</span>
              <strong>{selectedTargetSilvers.length} persisted inputs</strong>
              <p>{selectedTargetSilvers.map((silverDataset) => silverDataset.name).slice(0, 3).join(", ") || "silver 없음"}{selectedTargetSilvers.length > 3 ? "..." : ""}</p>
            </article>
            <article>
              <span>Gold schema</span>
              <strong>{selectedOutputSchema.length} fields</strong>
              <p>{selectedOutputSchema.map((field) => field.name).slice(0, 4).join(", ") || "schema 없음"}</p>
            </article>
            <article>
              <span>실행 준비</span>
              <strong>{targetExecutorMode}</strong>
              <p>실제 DAG trigger/run status는 다음 Phase에서 연결합니다.</p>
            </article>
            <article>
              <span>Schedule</span>
              <strong>{targetScheduleMode === "manual" ? "Manual trigger" : "Schedule placeholder"}</strong>
              <p>{targetScheduleNote.trim() || "schedule note 없음"}</p>
            </article>
          </div>
          <div className="target-lineage-strip review-lineage-strip">
            <span>External Connections</span>
            <ArrowRight size={16} />
            <span>Source Datasets</span>
            <ArrowRight size={16} />
            <span>{selectedTargetSilvers.length} Silver Datasets</span>
            <ArrowRight size={16} />
            <span>{selectedProcessRecipes.length} Processing recipes</span>
            <ArrowRight size={16} />
            <span>{targetExecutorMode}</span>
            <ArrowRight size={16} />
            <strong>{normalizedTargetName || "Gold Dataset"}</strong>
          </div>
          <div className="wizard-placeholder compact">
            {targetDraftSaveState.status === "saved" ? <CheckCircle2 size={22} /> : <ServerCog size={22} />}
            <strong>
              {targetDraftSaveState.status === "saved"
                ? `저장됨: ${targetDraftSaveState.record?.id}`
                : "Gold Dataset과 Build Job 설정을 metadata로 저장합니다. 실제 trigger는 다음 Phase에서 연결합니다."}
            </strong>
            {targetDraftSaveState.status === "error" ? <p>{targetDraftSaveState.error}</p> : null}
          </div>
        </section>
      );
    }

    return (
      <section className="wizard-step-body">
        <EmptyState icon={AlertCircle} title="알 수 없는 단계입니다" body="wizard step 설정을 확인합니다." />
      </section>
    );
  }

  function renderSavedDraftOverview() {
    const connectionCount = savedExternalConnections.length;
    const sourceCount = savedSourceDatasets.length;
    const targetCount = savedTargetDatasetDrafts.length;

    return (
      <section className="pipeline-table-card dataset-draft-overview" aria-label="Saved dataset draft overview">
        <div className="table-card-header">
          <div className="table-title-line">
            <ListChecks size={20} />
            <div>
              <strong>저장된 설정 현황</strong>
              <p>External Connection, Source Dataset, Gold Dataset 설정을 한 화면에서 확인합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <span className={`badge ${datasetDraftListState.error ? "danger" : "slate"}`}>
              {datasetDraftListState.loading ? "조회 중" : datasetDraftListState.error ? "조회 실패" : `${connectionCount + sourceCount + targetCount} drafts`}
            </span>
            <button type="button" className="ghost-action" onClick={refreshDatasetDraftLists}>
              <RefreshCw size={16} />
              새로고침
            </button>
          </div>
        </div>
        {datasetDraftListState.error ? (
          <div className="wizard-placeholder compact">
            <AlertCircle size={22} />
            <strong>{datasetDraftListState.error}</strong>
          </div>
        ) : (
          <div className="dataset-draft-board">
            <DraftColumn
              title="External Connection"
              count={connectionCount}
              empty="저장된 external connection이 없습니다."
              records={savedExternalConnections.slice(0, 3).map((connection) => ({
                id: connection.id,
                title: connection.name,
                meta: `${connection.typeLabel} · ${connection.status}`,
                detail: connection.resource,
              }))}
            />
            <DraftColumn
              title="Source Dataset"
              count={sourceCount}
              empty="저장된 source dataset이 없습니다."
              records={savedSourceDatasets.slice(0, 3).map((sourceDataset) => ({
                id: sourceDataset.id,
                title: sourceDataset.name,
                meta: `${sourceDataset.connection_type} · ${sourceDataset.status}`,
                detail: sourceDataset.raw_scope,
              }))}
            />
            <DraftColumn
              title="Gold Dataset"
              count={targetCount}
              empty="저장된 Gold Dataset 설정이 없습니다."
              records={savedTargetDatasetDrafts.slice(0, 3).map((targetDraft) => ({
                id: targetDraft.id,
                title: targetDraft.target_dataset_name,
                meta: `${targetDraft.executor_handoff} · ${targetDraft.status}`,
                detail: `${targetDraft.source_refs?.length || 0} inputs · ${targetDraft.silver_outputs?.length || 0} silver datasets`,
              }))}
            />
          </div>
        )}
      </section>
    );
  }

  function renderNavigationView() {
    if (dataView === "connections") {
      return (
        <>
          <PageHeader
            title="연결"
            body="외부 데이터 위치와 접속 설정을 관리합니다. 데이터셋 생성 전 먼저 등록되는 입력 지점입니다."
            actionLabel="연결 생성"
            onAction={() => startDatasetCreation("connection")}
          />
          <OperationalList
            icon={ServerCog}
            title="External Connections"
            body="Local File, Local Folder, Kafka Topic 같은 외부 연결 설정입니다. 데모 원천은 개별 preset으로 선택합니다."
            records={savedExternalConnections.map((connection) => ({
              id: connection.id,
              title: connection.name,
              meta: `${connection.typeLabel} · ${connection.status} · ${connection.syncMode}`,
              detail: `${connection.resource} · ${connection.syncSchedule}`,
              actions: [
                {
                  label: "상세",
                  icon: Search,
                  onClick: () => openConnectionDetail(connection, "detail"),
                },
                {
                  label: "수정",
                  icon: Wrench,
                  onClick: () => openConnectionDetail(connection, "edit"),
                },
                {
                  label: "삭제",
                  icon: Trash2,
                  danger: true,
                  onClick: () => openConnectionDetail(connection, "delete"),
                },
              ],
            }))}
            empty="저장된 External Connection이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
          <details className="catalog-policy-details">
            <summary>DB/S3 보안 정책 보기</summary>
            <CredentialSecretPolicyPanel policy={credentialPolicy} />
          </details>
        </>
      );
    }

    if (dataView === "datasets-source") {
      return (
        <>
          <PageHeader
            title="Source Datasets"
            body="External Connection에서 만든 Raw/Bronze 성격의 원본/준원본 데이터셋입니다."
            actionLabel="Source Dataset 생성"
            onAction={() => startDatasetCreation("source")}
          />
          <OperationalList
            icon={Database}
            title="Source Dataset"
            body="데이터 레이크 안에서 원천 데이터셋으로 참조될 metadata입니다."
            records={savedSourceDatasets.map((sourceDataset) => ({
              id: sourceDataset.id,
              title: sourceDataset.name,
              meta: `${sourceDataset.connection_type} · ${sourceDataset.status}`,
              detail: `${fileEvidenceLabel(sourceDataset.file_evidence)} · ${sourceDataset.raw_scope}`,
              variant: "source-dataset",
              facts: [
                ["Connection", sourceDataset.connection_name || sourceDataset.connection_type],
                ["Raw scope", sourceDataset.raw_scope],
                ["Schema", `${sourceDataset.schema_preview?.length || 0} fields`],
                ["Evidence", fileEvidenceLabel(sourceDataset.file_evidence)],
              ],
              actions: [
                {
                  label: "상세",
                  icon: Search,
                  onClick: () => openSourceDatasetDetail(sourceDataset, "detail"),
                },
                {
                  label: "수정",
                  icon: Wrench,
                  onClick: () => openSourceDatasetDetail(sourceDataset, "edit"),
                },
                {
                  label: "삭제",
                  icon: Trash2,
                  danger: true,
                  onClick: () => openSourceDatasetDetail(sourceDataset, "delete"),
                },
              ],
            }))}
            empty="저장된 Source Dataset이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "datasets-silver") {
      return (
        <>
          <PageHeader
            title="Silver Datasets"
            body="Source Dataset을 표준화하고 검증한 중간 데이터셋입니다."
            actionLabel="Silver Dataset 생성"
            onAction={() => startDatasetCreation("silver")}
          />
          <OperationalList
            icon={Layers3}
            title="Silver Dataset"
            body="Source Dataset에서 독립 생성된 persisted Silver Dataset metadata입니다."
            records={silverDatasetRecords.map((silverDataset) => ({
              id: silverDataset.id,
              title: silverDataset.name,
              meta: `${silverDataset.status} · from ${silverDataset.source || "source 미지정"}`,
              detail: `${fileEvidenceLabel(silverDataset.fileEvidence)} · ${silverDataset.purpose || "표준화 목적 없음"} · ${silverDataset.rules.length} rules`,
              variant: "silver-dataset",
              facts: [
                ["Source", silverDataset.source || "source 미지정"],
                ["Purpose", silverDataset.purpose || "표준화 목적 없음"],
                ["Rules", `${silverDataset.rules.length} rules`],
                ["Evidence", fileEvidenceLabel(silverDataset.fileEvidence)],
              ],
              actions: [
                {
                  label: "상세",
                  icon: Search,
                  onClick: () => openSilverDatasetDetail(savedSilverDatasets.find((dataset) => dataset.id === silverDataset.id), "detail"),
                },
                {
                  label: "수정",
                  icon: Wrench,
                  onClick: () => openSilverDatasetDetail(savedSilverDatasets.find((dataset) => dataset.id === silverDataset.id), "edit"),
                },
                {
                  label: "삭제",
                  icon: Trash2,
                  danger: true,
                  onClick: () => openSilverDatasetDetail(savedSilverDatasets.find((dataset) => dataset.id === silverDataset.id), "delete"),
                },
              ],
            }))}
            empty="저장된 Silver Dataset이 없습니다. Source Dataset에서 Silver Dataset을 먼저 생성합니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "datasets-gold") {
      return (
        <>
          <PageHeader
            title="Gold Datasets"
            body="여러 Silver Dataset을 조합해 분석 목적에 맞게 만드는 최종 데이터셋입니다."
            actionLabel="Gold Dataset 생성"
            onAction={() => startDatasetCreation("target")}
          />
          <OperationalList
            icon={Table2}
            title="Gold Dataset"
            body="Gold Dataset 생성 설정에서 파생되는 최종 output dataset입니다."
            records={goldDatasetRecords.map((goldDataset) => ({
              id: goldDataset.id,
              title: goldDataset.name,
              meta: `${goldDataset.status} · ${goldDataset.sources} sources`,
              detail:
                goldDataset.status === "registered"
                  ? `${goldDataset.silverOutputs} silver outputs · rows ${goldDataset.rows} · bytes ${goldDataset.bytes} · ${goldDataset.path}`
                  : `${fileEvidenceLabel(goldDataset.draft?.file_evidence)} · ${goldDataset.silverOutputs} silver outputs · definition ${goldDataset.target}`,
              variant: "gold-dataset",
              facts:
                goldDataset.status === "registered"
                  ? [
                      ["Silver outputs", `${goldDataset.silverOutputs}`],
                      ["Rows", formatMetric(goldDataset.rows)],
                      ["Bytes", formatBytes(goldDataset.bytes)],
                      ["Path", goldDataset.path || "path 없음"],
                    ]
                  : [
                      ["Definition", goldDataset.target],
                      ["Silver inputs", `${goldDataset.silverOutputs}`],
                      ["Evidence", fileEvidenceLabel(goldDataset.draft?.file_evidence)],
                      ["Status", goldDataset.status],
                    ],
              actions:
                goldDataset.recordType === "registered"
                  ? [
                      {
                        label: "상세",
                        icon: Search,
                        onClick: () => setNotice(`${goldDataset.name} registered CatalogDataset은 이번 Phase에서 상세 보기만 지원합니다.`),
                      },
                    ]
                  : [
                      {
                        label: "상세",
                        icon: Search,
                        onClick: () => openTargetDraftDetail(goldDataset.draft, "detail"),
                      },
                      {
                        label: "수정",
                        icon: Wrench,
                        onClick: () => openTargetDraftDetail(goldDataset.draft, "edit"),
                      },
                      {
                        label: "삭제",
                        icon: Trash2,
                        danger: true,
                        onClick: () => openTargetDraftDetail(goldDataset.draft, "delete"),
                      },
                    ],
            }))}
            empty="저장된 Gold Dataset 정의가 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "jobs-connection") {
      return (
        <>
          <PageHeader
            title="Connection Sync Jobs"
            body="External Connection에서 원천 데이터를 가져오거나 스캔해 Source Dataset/raw 영역을 갱신하는 작업입니다."
          />
          <OperationalList
            icon={ServerCog}
            title="Connection Sync Jobs"
            body="저장된 External Connection에서 파생됩니다. 실제 file scan, Kafka replay, DB/S3 sync runner는 후속 Phase에서 연결합니다."
            records={connectionJobRecords.map((job) => ({
              id: job.id,
              title: job.name,
              meta: `${job.status} · ${job.schedule}`,
              detail: "External Connection sync job",
              facts: [
                ["Input", job.input || "connection resource 미지정"],
                ["Output", job.output],
                ["Schedule", job.scheduleNote || job.schedule],
              ],
              actions: [
                {
                  label: "수동 실행",
                  icon: Play,
                  onClick: () => requestManualJobRun(job),
                },
                {
                  label: "Schedule 수정",
                  icon: Clock3,
                  onClick: () => openScheduleEditor(job),
                },
                {
                  label: "Connection 편집",
                  icon: ServerCog,
                  onClick: () => openConnectionDetail(job.connection, "edit"),
                },
              ],
            }))}
            empty="계획된 Connection Sync Job이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "jobs-silver") {
      return (
        <>
          <PageHeader
            title="Silver Transform Jobs"
            body="Source Dataset을 Silver Dataset으로 표준화/검증하는 생성 작업입니다. 스케줄러 또는 수동 실행 요청으로 실행됩니다."
          />
          <OperationalList
            icon={GitBranch}
            title="Silver Transform Jobs"
            body="Persisted Silver Dataset metadata에서 planned 작업으로 파생됩니다. 현재 Silver runner는 후속 Phase에서 연결합니다."
            records={silverJobRecords.map((job) => ({
              id: job.id,
              title: job.name,
              meta: `${job.status} · ${job.schedule} · output ${job.output}`,
              detail: "Source to Silver transform job",
              facts: [
                ["Input", job.input || "source 미지정"],
                ["Output", job.output],
                ["Rules", job.rules || "rule 없음"],
                ["Schedule", job.scheduleNote || job.schedule],
              ],
              actions: [
                {
                  label: "수동 실행",
                  icon: Play,
                  onClick: () => requestManualJobRun(job),
                },
                {
                  label: "Schedule 수정",
                  icon: Clock3,
                  onClick: () => openScheduleEditor(job),
                },
                {
                  label: "Dataset 편집",
                  icon: Layers3,
                  onClick: () => navigate("/datasets/silver", { pendingDatasetEdit: { type: "silver", id: job.datasetId } }),
                },
              ],
            }))}
            empty="계획된 Silver Transform Job이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "jobs-gold") {
      return (
        <>
          <PageHeader
            title="Gold Build Jobs"
            body="Silver Dataset을 조합해 Gold Dataset을 만들거나 갱신하는 작업입니다. 스케줄러 또는 수동 실행 요청으로 실행됩니다."
          />
          <OperationalList
            icon={Workflow}
            title="Gold Build Jobs"
            body="Gold Dataset 설정에서 파생됩니다. 수동 실행은 실행 기록에 queued run을 만들고, 실제 local runner 실행은 실행 기록에서 진행합니다."
            records={goldJobRecords.map((job) => ({
              id: job.id,
              title: job.name,
              meta: `${job.status} · ${job.runner} · ${job.schedule}`,
              detail: "Silver to Gold build job",
              facts: [
                ["Input", job.input],
                ["Output", job.output],
                ["Rules", job.rules],
                ["Schedule", job.scheduleNote || job.schedule],
              ],
              actions: [
                {
                  label: jobRunCreateState.status === "creating" && jobRunCreateState.draftId === job.id ? "실행 요청 중" : "수동 실행",
                  icon: Play,
                  disabled: jobRunCreateState.status === "creating",
                  onClick: () => requestManualJobRun(job),
                },
                {
                  label: "Schedule 수정",
                  icon: Clock3,
                  onClick: () => openScheduleEditor(job),
                },
                {
                  label: "Dataset 편집",
                  icon: Table2,
                  onClick: () => navigate("/datasets/gold", { pendingDatasetEdit: { type: "gold", id: job.datasetId } }),
                },
              ],
            }))}
            empty="실행 준비된 Gold Build Job이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    return null;
  }

  return (
    <div className="page-stack">
      {!datasetCreationMode ? renderNavigationView() : null}
      {datasetCreationMode ? (
        <div className="dataset-mode-strip" aria-label="Current dataset creation mode">
          <span>현재 생성 유형</span>
          <strong>
            {datasetCreationMode === "connection"
              ? "External Connection"
              : datasetCreationMode === "source"
                ? "Source Dataset"
                : datasetCreationMode === "silver"
                  ? "Silver Dataset"
                  : "Gold Dataset"}
          </strong>
          <p>
            {datasetCreationMode === "connection"
              ? "Local File, Local Folder, Kafka Topic 연결 설정을 준비하는 흐름입니다."
              : datasetCreationMode === "source"
                ? "등록된 External Connection에서 raw/source dataset을 만드는 흐름입니다."
                : datasetCreationMode === "silver"
                  ? "Source Dataset을 표준화/검증한 Silver Dataset metadata를 만드는 흐름입니다."
                  : "Silver Dataset을 조합해 Gold Dataset과 Build Job 설정을 준비하는 흐름입니다."}
          </p>
        </div>
      ) : null}
      {datasetCreationMode === "connection" ? renderExternalConnectionWizard() : null}
      {datasetCreationMode === "source" ? renderSourceDatasetShell() : null}
      {datasetCreationMode === "silver" ? renderSilverDatasetWizard() : null}
      {datasetCreationMode === "target" ? renderTargetDatasetWizard() : null}
      {isDatasetTypeModalOpen ? (
        <DatasetTypeChoiceModal
          onClose={() => setIsDatasetTypeModalOpen(false)}
          onSelect={startDatasetCreation}
        />
      ) : null}
      {isSourceModalOpen ? (
        <SourceStartModal
          sources={demoSourceDatasets}
          onClose={() => setIsSourceModalOpen(false)}
          onSelect={handleSourceSelect}
          onCreateNew={() => {
            setIsSourceModalOpen(false);
            setDatasetReturnFlow({ target: "silver" });
            startDatasetCreation("source");
            setNotice("Source Dataset 생성 화면으로 이동했습니다.");
          }}
        />
      ) : null}
      {managedSourceDataset ? (
        <SourceDatasetManageModal
          dataset={managedSourceDataset}
          form={managedSourceForm}
          mode={managedSourceMode}
          state={managedSourceState}
          onClose={closeSourceDatasetDetail}
          onModeChange={(mode) => {
            setManagedSourceMode(mode);
            setManagedSourceState({ status: "idle", error: "" });
          }}
          onFormChange={setManagedSourceForm}
          onSave={saveManagedSourceDataset}
          onDelete={removeManagedSourceDataset}
          snapshotState={managedSourceSnapshotState}
          onRunSnapshot={runManagedSourceSnapshot}
        />
      ) : null}
      {managedConnection ? (
        <ConnectionManageModal
          connection={managedConnection}
          form={managedConnectionForm}
          mode={managedConnectionMode}
          state={managedConnectionState}
          onClose={closeConnectionDetail}
          onModeChange={(mode) => {
            setManagedConnectionMode(mode);
            setManagedConnectionState({ status: "idle", error: "" });
          }}
          onFormChange={setManagedConnectionForm}
          onSave={saveManagedConnection}
          onDelete={removeManagedConnection}
        />
      ) : null}
      {managedSilverDataset ? (
        <SilverDatasetManageModal
          dataset={managedSilverDataset}
          form={managedSilverForm}
          mode={managedSilverMode}
          state={managedSilverState}
          onClose={closeSilverDatasetDetail}
          onModeChange={(mode) => {
            setManagedSilverMode(mode);
            setManagedSilverState({ status: "idle", error: "" });
          }}
          onFormChange={setManagedSilverForm}
          onSave={saveManagedSilverDataset}
          onDelete={removeManagedSilverDataset}
          materializationState={managedSilverMaterializationState}
          onRunMaterialization={runManagedSilverMaterialization}
        />
      ) : null}
      {managedTargetDraft ? (
        <TargetDraftManageModal
          draft={managedTargetDraft}
          form={managedTargetForm}
          mode={managedTargetMode}
          state={managedTargetState}
          onClose={closeTargetDraftDetail}
          onModeChange={(mode) => {
            setManagedTargetMode(mode);
            setManagedTargetState({ status: "idle", error: "" });
          }}
          onFormChange={setManagedTargetForm}
          onSave={saveManagedTargetDraft}
          onDelete={removeManagedTargetDraft}
        />
      ) : null}
      {scheduleEditorJob ? (
        <JobScheduleEditorModal
          job={scheduleEditorJob}
          form={scheduleEditorForm}
          state={scheduleEditorState}
          onFormChange={setScheduleEditorForm}
          onSave={saveJobSchedule}
          onClose={closeScheduleEditor}
        />
      ) : null}
    </div>
  );
}

function JobScheduleEditorModal({ job, form, state, onFormChange, onSave, onClose }) {
  const isSaving = state.status === "saving";
  const editTargetLabel = job.type === "connection" ? "Connection 편집" : "Dataset 편집";
  const jobTypeLabel =
    job.type === "connection" ? "Connection Sync Job" : job.type === "silver" ? "Silver Transform Job" : "Gold Build Job";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal" role="dialog" aria-modal="true" aria-labelledby="job-schedule-title">
        <header>
          <div>
            <h2 id="job-schedule-title">Job schedule 수정</h2>
            <p>Schedule metadata만 수정합니다. 작업 정의는 {editTargetLabel}에서 관리합니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <section className="wizard-inline-panel">
            <div className="table-title-line">
              <Clock3 size={18} />
              <div>
                <strong>{job.name}</strong>
                <p>{jobTypeLabel}</p>
              </div>
            </div>
            <div className="schedule-choice-grid" aria-label="Job schedule mode">
              <label className={form.mode === "manual" ? "selected" : ""}>
                <input
                  type="radio"
                  name="job-schedule"
                  value="manual"
                  checked={form.mode === "manual"}
                  onChange={() => onFormChange({ ...form, mode: "manual" })}
                />
                <strong>Manual trigger</strong>
                <small>스케줄러 없이 사용자가 수동 실행할 때 사용합니다.</small>
              </label>
              <label className={form.mode === "placeholder" ? "selected" : ""}>
                <input
                  type="radio"
                  name="job-schedule"
                  value="placeholder"
                  checked={form.mode === "placeholder"}
                  onChange={() => onFormChange({ ...form, mode: "placeholder" })}
                />
                <strong>Schedule placeholder</strong>
                <small>스케줄 의도만 metadata로 저장합니다.</small>
              </label>
            </div>
            <label className="target-name-field">
              <span>스케줄 메모</span>
              <input
                type="text"
                value={form.note}
                onChange={(event) => onFormChange({ ...form, note: event.target.value })}
                placeholder="weekday 09:00 build window"
              />
            </label>
            <div className="wizard-placeholder compact">
              <Wrench size={22} />
              <strong>작업 정의 편집은 {editTargetLabel}에서 진행합니다</strong>
              <p>이 modal은 schedule metadata만 바꾸며 실제 scheduler 등록이나 DAG trigger는 수행하지 않습니다.</p>
            </div>
            {state.error ? (
              <div className="wizard-placeholder compact danger">
                <AlertCircle size={22} />
                <strong>{state.error}</strong>
              </div>
            ) : null}
          </section>
        </div>
        <footer>
          <button type="button" className="ghost-action" onClick={onClose}>
            닫기
          </button>
          <button type="button" className="primary-action" onClick={onSave} disabled={isSaving}>
            <Save size={16} />
            {isSaving ? "저장 중" : "Schedule 저장"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function ManageModeToolbar({ mode, onModeChange, allowDelete = true }) {
  return (
    <div className="source-manage-toolbar">
      <button type="button" className={mode === "detail" ? "selected" : ""} onClick={() => onModeChange("detail")}>
        상세
      </button>
      <button type="button" className={mode === "edit" ? "selected" : ""} onClick={() => onModeChange("edit")}>
        수정
      </button>
      {allowDelete ? (
        <button type="button" className={mode === "delete" ? "selected danger" : "danger"} onClick={() => onModeChange("delete")}>
          삭제
        </button>
      ) : null}
    </div>
  );
}

function ManageModalFooter({ mode, state, onClose, onSave, onDelete }) {
  const isBusy = state.status === "saving" || state.status === "deleting";

  return (
    <footer>
      <button type="button" className="ghost-action" onClick={onClose}>
        닫기
      </button>
      {mode === "edit" ? (
        <button type="button" className="primary-action" onClick={onSave} disabled={isBusy}>
          <Save size={16} />
          {state.status === "saving" ? "저장 중" : "수정 저장"}
        </button>
      ) : null}
      {mode === "delete" ? (
        <button type="button" className="primary-action danger-action" onClick={onDelete} disabled={isBusy}>
          <Trash2 size={16} />
          {state.status === "deleting" ? "삭제 중" : "삭제 확인"}
        </button>
      ) : null}
    </footer>
  );
}

function ManageError({ error }) {
  if (!error) return null;
  return (
    <div className="wizard-placeholder compact danger">
      <AlertCircle size={22} />
      <strong>{error}</strong>
    </div>
  );
}

function fileEvidenceLabel(evidence) {
  if (!evidence) return "metadata-only";
  if (evidence.status === "file_backed") return "file-backed";
  if (evidence.status === "missing") return "missing file";
  return "metadata-only";
}

function DatasetFileEvidencePanel({ evidence }) {
  if (!evidence) {
    return (
      <div className="wizard-placeholder compact">
        <FileCheck2 size={22} />
        <strong>metadata-only</strong>
        <p>연결된 local file evidence가 없습니다.</p>
      </div>
    );
  }

  const isMissing = evidence.status === "missing";
  return (
    <section className={`wizard-placeholder compact ${isMissing ? "danger" : ""}`}>
      {isMissing ? <AlertCircle size={22} /> : <FileCheck2 size={22} />}
      <strong>{fileEvidenceLabel(evidence)}</strong>
      <p>{evidence.message}</p>
      <div className="source-manage-facts">
        <span>path</span>
        <strong>{evidence.path || "-"}</strong>
        <span>bytes</span>
        <strong>{formatMetric(formatBytes(evidence.bytes))}</strong>
        <span>rows</span>
        <strong>{formatMetric(evidence.row_count)}</strong>
        <span>row count</span>
        <strong>{evidence.row_count_status}</strong>
        <span>schema fields</span>
        <strong>{formatMetric(evidence.schema_fields)}</strong>
      </div>
    </section>
  );
}

function safeRuntimeSummary(summary) {
  if (!summary) return "-";
  return Object.entries(summary)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join(" · ");
}

function ConnectionManageModal({ connection, form, mode, state, onClose, onModeChange, onFormChange, onSave, onDelete }) {
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="connection-manage-title">
        <header>
          <div>
            <h2 id="connection-manage-title">External Connection 상세</h2>
            <p>{connection.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <ManageModeToolbar mode={mode} onModeChange={onModeChange} />
          <div className="source-manage-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>Connection metadata</strong>
                  <p>{connection.typeLabel}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>Silver Dataset 이름</span>
                <input type="text" value={form.name} onChange={(event) => onFormChange({ ...form, name: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>resource</span>
                <input type="text" value={form.resource} onChange={(event) => onFormChange({ ...form, resource: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>resource_label</span>
                <input type="text" value={form.resource_label} onChange={(event) => onFormChange({ ...form, resource_label: event.target.value })} readOnly={!isEditMode} />
              </label>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Clock3 size={18} />
                <div>
                  <strong>Sync metadata</strong>
                  <p>{connection.syncMode}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>sync_mode</span>
                <select value={form.sync_mode} onChange={(event) => onFormChange({ ...form, sync_mode: event.target.value })} disabled={!isEditMode}>
                  <option value="manual">manual</option>
                  <option value="scheduled">scheduled</option>
                  <option value="streaming">streaming</option>
                </select>
              </label>
              <label className="target-name-field">
                <span>sync_schedule</span>
                <input type="text" value={form.sync_schedule} onChange={(event) => onFormChange({ ...form, sync_schedule: event.target.value })} readOnly={!isEditMode} />
              </label>
              <div className="source-manage-facts">
                <span>status</span>
                <strong>{connection.status}</strong>
                <span>schema fields</span>
                <strong>{connection.schema?.length || 0}</strong>
              </div>
            </section>
          </div>
          {isDeleteMode ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{connection.name} metadata를 삭제합니다.</strong>
              <p>Source Dataset이 참조 중이면 삭제가 차단됩니다.</p>
            </div>
          ) : null}
          <ManageError error={state.error} />
        </div>
        <ManageModalFooter mode={mode} state={state} onClose={onClose} onSave={onSave} onDelete={onDelete} />
      </section>
    </div>
  );
}

function SilverDatasetManageModal({
  dataset,
  form,
  mode,
  state,
  materializationState,
  onClose,
  onModeChange,
  onFormChange,
  onSave,
  onDelete,
  onRunMaterialization,
}) {
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";
  const isMaterializing = materializationState.status === "running";
  const latestMaterialization = materializationState.materializations[0] || null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="silver-manage-title">
        <header>
          <div>
            <h2 id="silver-manage-title">Silver Dataset 상세</h2>
            <p>{dataset.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <ManageModeToolbar mode={mode} onModeChange={onModeChange} />
          <div className="source-manage-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Layers3 size={18} />
                <div>
                  <strong>Silver metadata</strong>
                  <p>from {dataset.source_dataset_name}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>name</span>
                <input type="text" value={form.name} onChange={(event) => onFormChange({ ...form, name: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>생성 목적</span>
                <input type="text" value={form.purpose} onChange={(event) => onFormChange({ ...form, purpose: event.target.value })} readOnly={!isEditMode} />
              </label>
              <div className="source-manage-facts">
                <span>status</span>
                <strong>{dataset.status}</strong>
                <span>schedule</span>
                <strong>{dataset.schedule?.mode || "manual"}</strong>
              </div>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ListChecks size={18} />
                <div>
                  <strong>Rules</strong>
                  <p>한 줄에 하나씩 입력합니다.</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>표준화 규칙</span>
                <textarea value={form.standardize_rules} onChange={(event) => onFormChange({ ...form, standardize_rules: event.target.value })} readOnly={!isEditMode} rows={4} />
              </label>
              <label className="target-name-field">
                <span>검증 규칙</span>
                <textarea value={form.validation_rules} onChange={(event) => onFormChange({ ...form, validation_rules: event.target.value })} readOnly={!isEditMode} rows={4} />
              </label>
            </section>
          </div>
          <DatasetFileEvidencePanel evidence={dataset.file_evidence} />
          <section className="wizard-inline-panel snapshot-panel">
            <div className="snapshot-panel-header">
              <div className="table-title-line">
                <FileCheck2 size={18} />
                <div>
                  <strong>Silver materialization evidence</strong>
                  <p>Source Snapshot 또는 local Source에서 Silver parquet output을 생성합니다.</p>
                </div>
              </div>
              <button type="button" className="primary-action" onClick={onRunMaterialization} disabled={isMaterializing || isEditMode || isDeleteMode}>
                <PlayCircle size={16} />
                {isMaterializing ? "생성 중" : "Silver output 생성"}
              </button>
            </div>
            {materializationState.status === "loading" ? (
              <p className="muted-line">materialization evidence를 불러오는 중입니다.</p>
            ) : null}
            {latestMaterialization ? (
              <div className="snapshot-evidence-grid materialization-evidence-grid">
                <article>
                  <span>Status</span>
                  <strong>{latestMaterialization.status}</strong>
                  <p>{latestMaterialization.message}</p>
                </article>
                <article>
                  <span>Rows</span>
                  <strong>{latestMaterialization.row_count}</strong>
                  <p>{latestMaterialization.failed_row_count} failed · {latestMaterialization.duration_ms}ms</p>
                </article>
                <article className="snapshot-path-card">
                  <span>Output path</span>
                  <strong>{latestMaterialization.output_path}</strong>
                  <p>{formatBytes(latestMaterialization.output_bytes)} parquet</p>
                </article>
                <article className="snapshot-path-card">
                  <span>Input path</span>
                  <strong>{latestMaterialization.input_path}</strong>
                  <p>from {latestMaterialization.source_dataset_name}</p>
                </article>
              </div>
            ) : materializationState.status !== "loading" ? (
              <div className="wizard-placeholder compact">
                <FileCheck2 size={20} />
                <strong>아직 생성된 Silver output이 없습니다.</strong>
                <p>Source Snapshot이 있으면 그 결과를 우선 사용하고, 없으면 local source를 bounded read합니다.</p>
              </div>
            ) : null}
            {materializationState.error ? (
              <div className="wizard-placeholder compact danger">
                <AlertCircle size={20} />
                <strong>{materializationState.error}</strong>
              </div>
            ) : null}
          </section>
          {isDeleteMode ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{dataset.name} metadata를 삭제합니다.</strong>
              <p>Gold Dataset 설정이 참조 중이면 삭제가 차단됩니다.</p>
            </div>
          ) : null}
          <ManageError error={state.error} />
        </div>
        <ManageModalFooter mode={mode} state={state} onClose={onClose} onSave={onSave} onDelete={onDelete} />
      </section>
    </div>
  );
}

function TargetDraftManageModal({ draft, form, mode, state, onClose, onModeChange, onFormChange, onSave, onDelete }) {
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="target-manage-title">
        <header>
          <div>
            <h2 id="target-manage-title">Gold Dataset 상세</h2>
            <p>{draft.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <ManageModeToolbar mode={mode} onModeChange={onModeChange} />
          <div className="source-manage-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Table2 size={18} />
                <div>
                  <strong>Gold Dataset metadata</strong>
                  <p>{draft.status}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>Gold Dataset 이름</span>
                <input type="text" value={form.target_dataset_name} onChange={(event) => onFormChange({ ...form, target_dataset_name: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>생성 목적</span>
                <input type="text" value={form.description} onChange={(event) => onFormChange({ ...form, description: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>데이터 기준 단위</span>
                <input type="text" value={form.target_grain} onChange={(event) => onFormChange({ ...form, target_grain: event.target.value })} readOnly={!isEditMode} />
              </label>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Workflow size={18} />
                <div>
                  <strong>Processing</strong>
                  <p>{draft.source_refs?.length || 0} silver inputs</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>실행 방식</span>
                <select value={form.executor_handoff} onChange={(event) => onFormChange({ ...form, executor_handoff: event.target.value })} disabled={!isEditMode}>
                  <option value="local_runner">local_runner</option>
                  <option value="airflow">airflow</option>
                  <option value="spark_runner">spark_runner</option>
                </select>
              </label>
              <label className="target-name-field">
                <span>Processing recipes</span>
                <textarea value={form.processing_recipes} onChange={(event) => onFormChange({ ...form, processing_recipes: event.target.value })} readOnly={!isEditMode} rows={5} />
              </label>
            </section>
          </div>
          <DatasetFileEvidencePanel evidence={draft.file_evidence} />
          {isDeleteMode ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{draft.target_dataset_name} metadata를 삭제합니다.</strong>
              <p>Job Run이 참조 중이면 삭제가 차단됩니다.</p>
            </div>
          ) : null}
          <ManageError error={state.error} />
        </div>
        <ManageModalFooter mode={mode} state={state} onClose={onClose} onSave={onSave} onDelete={onDelete} />
      </section>
    </div>
  );
}

function SourceDatasetManageModal({
  dataset,
  form,
  mode,
  state,
  snapshotState,
  onClose,
  onModeChange,
  onFormChange,
  onSave,
  onDelete,
  onRunSnapshot,
}) {
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";
  const isBusy = state.status === "saving" || state.status === "deleting";
  const isSnapshotRunning = snapshotState.status === "running";
  const latestSnapshot = snapshotState.snapshots[0] || null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="source-dataset-manage-title">
        <header>
          <div>
            <h2 id="source-dataset-manage-title">Source Dataset 상세</h2>
            <p>External Connection에서 만들어진 raw/source dataset metadata를 확인하고 관리합니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <div className="source-manage-toolbar">
            <button type="button" className={!isEditMode && !isDeleteMode ? "selected" : ""} onClick={() => onModeChange("detail")}>
              상세
            </button>
            <button type="button" className={isEditMode ? "selected" : ""} onClick={() => onModeChange("edit")}>
              수정
            </button>
            <button type="button" className={isDeleteMode ? "selected danger" : "danger"} onClick={() => onModeChange("delete")}>
              삭제
            </button>
          </div>

          <div className="source-manage-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Database size={18} />
                <div>
                  <strong>Dataset metadata</strong>
                  <p>{dataset.id}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => onFormChange({ ...form, name: event.target.value })}
                  readOnly={!isEditMode}
                />
              </label>
              <label className="target-name-field">
                <span>raw_scope</span>
                <input
                  type="text"
                  value={form.raw_scope}
                  onChange={(event) => onFormChange({ ...form, raw_scope: event.target.value })}
                  readOnly={!isEditMode}
                />
              </label>
              <label className="target-name-field">
                <span>resource_label</span>
                <input
                  type="text"
                  value={form.resource_label}
                  onChange={(event) => onFormChange({ ...form, resource_label: event.target.value })}
                  readOnly={!isEditMode}
                />
              </label>
              <div className="source-manage-facts">
                <span>status</span>
                <strong>{dataset.status}</strong>
                <span>layer</span>
                <strong>{dataset.layer}</strong>
                <span>created_at</span>
                <strong>{dataset.created_at}</strong>
                <span>updated_at</span>
                <strong>{dataset.updated_at}</strong>
              </div>
            </section>

            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>Connection</strong>
                  <p>{dataset.connection_id}</p>
                </div>
              </div>
              <div className="review-summary-grid source-manage-summary">
                <article>
                  <span>연결 이름</span>
                  <strong>{dataset.connection_name}</strong>
                  <p>{dataset.connection_type}</p>
                </article>
                <article>
                  <span>Schema fields</span>
                  <strong>{dataset.schema_preview?.length || 0}</strong>
                  <p>Source Dataset schema preview</p>
                </article>
              </div>
              <div className="schema-preview-table" aria-label="Managed source dataset schema preview">
                <div className="schema-preview-head">
                  <span>Field</span>
                  <span>Type</span>
                  <span>Mode</span>
                </div>
                {(dataset.schema_preview || []).map((field) => (
                  <div className="schema-preview-row" key={field.name}>
                    <strong>{field.name}</strong>
                    <span>{field.type}</span>
                    <code>read only</code>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <DatasetFileEvidencePanel evidence={dataset.file_evidence} />

          <section className="wizard-inline-panel snapshot-panel">
            <div className="snapshot-panel-header">
              <div className="table-title-line">
                <HardDrive size={18} />
                <div>
                  <strong>Raw snapshot evidence</strong>
                  <p>metadata 생성과 분리해서 실제 row/message snapshot을 저장합니다.</p>
                </div>
              </div>
              <button type="button" className="primary-action" onClick={onRunSnapshot} disabled={isSnapshotRunning || isEditMode || isDeleteMode}>
                <PlayCircle size={16} />
                {isSnapshotRunning ? "생성 중" : "Raw snapshot 생성"}
              </button>
            </div>
            {snapshotState.status === "loading" ? (
              <p className="muted-line">snapshot evidence를 불러오는 중입니다.</p>
            ) : null}
            {latestSnapshot ? (
              <div className="snapshot-evidence-grid">
                <article>
                  <span>Status</span>
                  <strong>{latestSnapshot.status}</strong>
                  <p>{latestSnapshot.message}</p>
                </article>
                <article>
                  <span>Rows</span>
                  <strong>{latestSnapshot.row_count}</strong>
                  <p>{latestSnapshot.duration_ms}ms · limit {formatMetric(latestSnapshot.row_limit || latestSnapshot.requested_sample_size)}</p>
                </article>
                <article>
                  <span>Coverage</span>
                  <strong>{formatSnapshotCoverage(latestSnapshot)}</strong>
                  <p>{formatBytes(latestSnapshot.input_bytes)} input · {latestSnapshot.input_bytes_semantics || "available_input_bytes"}</p>
                </article>
                <article className="snapshot-path-card">
                  <span>Output path</span>
                  <strong>{latestSnapshot.output_path}</strong>
                  <p>{formatBytes(latestSnapshot.output_bytes)} written</p>
                </article>
              </div>
            ) : snapshotState.status !== "loading" ? (
              <div className="wizard-placeholder compact">
                <Archive size={20} />
                <strong>아직 생성된 raw snapshot이 없습니다.</strong>
                <p>Source Dataset metadata 확인 뒤 수동 실행하면 bounded snapshot evidence가 남습니다.</p>
              </div>
            ) : null}
            {snapshotState.error ? (
              <div className="wizard-placeholder compact danger">
                <AlertCircle size={20} />
                <strong>{snapshotState.error}</strong>
              </div>
            ) : null}
          </section>

          {isDeleteMode ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{dataset.name} metadata를 삭제합니다.</strong>
              <p>이번 페이즈에서는 Source Dataset metadata만 삭제하며 downstream draft 정리는 수행하지 않습니다.</p>
            </div>
          ) : null}
          {state.error ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{state.error}</strong>
            </div>
          ) : null}
        </div>
        <footer>
          <button type="button" className="ghost-action" onClick={onClose}>
            닫기
          </button>
          {isEditMode ? (
            <button type="button" className="primary-action" onClick={onSave} disabled={isBusy}>
              <Save size={16} />
              {state.status === "saving" ? "저장 중" : "수정 저장"}
            </button>
          ) : null}
          {isDeleteMode ? (
            <button type="button" className="primary-action danger-action" onClick={onDelete} disabled={isBusy}>
              <Trash2 size={16} />
              {state.status === "deleting" ? "삭제 중" : "삭제 확인"}
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

function DraftColumn({ title, count, records, empty }) {
  return (
    <article className="dataset-draft-column">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{count} saved</p>
        </div>
        <span>{count}</span>
      </header>
      {records.length > 0 ? (
        <div className="dataset-draft-list">
          {records.map((record) => (
            <div className="dataset-draft-item" key={record.id}>
              <strong>{record.title}</strong>
              <p>{record.meta}</p>
              <small>{record.detail}</small>
            </div>
          ))}
        </div>
      ) : (
        <div className="dataset-draft-empty">
          <Database size={18} />
          <p>{empty}</p>
        </div>
      )}
    </article>
  );
}

function OperationalList({ icon: Icon, title, body, records, empty, onRefresh, loading, layout = "grid" }) {
  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <Icon size={20} />
          <div>
            <strong>{title}</strong>
            <p>{body}</p>
          </div>
        </div>
        <div className="table-card-actions">
          <span className="badge slate">{loading ? "조회 중" : `${records.length} items`}</span>
          {onRefresh ? (
            <button type="button" className="ghost-action" onClick={onRefresh}>
              <RefreshCw size={16} />
              새로고침
            </button>
          ) : null}
        </div>
      </div>
      {records.length > 0 ? (
        <div className={`operational-list-grid ${layout === "list" ? "list-layout" : ""}`}>
          {records.map((record) => (
            <article
              className={`operational-list-item ${record.facts?.length ? "fact-card" : ""} ${record.variant || ""}`}
              key={record.id}
            >
              <strong>{record.title}</strong>
              <p>{record.meta}</p>
              {record.facts?.length ? (
                <div className="fact-card-grid">
                  {record.facts.map(([label, value]) => (
                    <div className={`fact-card-item ${isWideFact(label, value) ? "wide" : ""}`} key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <small>{record.detail}</small>
              )}
              {record.actions?.length ? (
                <div className="operational-list-actions">
                  {record.actions.map((action) => {
                    const ActionIcon = action.icon || Play;
                    return (
                      <button
                        type="button"
                        className={`ghost-action ${action.danger ? "danger-action" : ""}`}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        key={action.label}
                      >
                        {action.label}
                        <ActionIcon size={15} />
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {record.onAction ? (
                <button type="button" className="ghost-action" onClick={record.onAction} disabled={record.actionDisabled}>
                  {record.actionLabel}
                  <Play size={15} />
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="dataset-draft-empty operational-empty">
          <Icon size={20} />
          <p>{empty}</p>
        </div>
      )}
    </section>
  );
}

function isWideFact(label, value) {
  const normalizedLabel = String(label || "").toLowerCase();
  const text = String(value || "");
  const isPathValue = text.includes("/") || text.includes("s3://");
  if (["path", "raw scope", "run id"].includes(normalizedLabel)) return true;
  if (["input", "output"].includes(normalizedLabel)) return isPathValue;
  return isPathValue;
}

function JobRunsPage({ setNotice }) {
  const [runState, setRunState] = useState({ loading: true, records: [], error: "" });
  const [executeState, setExecuteState] = useState({ status: "idle", runId: "", error: "" });
  const [publishState, setPublishState] = useState({ status: "idle", runId: "", error: "" });
  const [runFilter, setRunFilter] = useState("all");

  async function refreshRuns() {
    setRunState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const records = await listTargetDatasetJobRuns();
      setRunState({ loading: false, records, error: "" });
    } catch (error) {
      setRunState({ loading: false, records: [], error: error.message });
      setNotice(`Job Runs 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshRuns();
  }, []);

  async function executeRun(runId) {
    setExecuteState({ status: "executing", runId, error: "" });
    try {
      const executed = await executeTargetDatasetJobRun(runId);
      setRunState((current) => ({
        ...current,
        records: current.records.map((record) => (record.id === executed.id ? executed : record)),
      }));
      setExecuteState({ status: "executed", runId, error: "" });
      setNotice(`${executed.gold_output} ${runOutputModeLabel(executed)} ${executed.status === "succeeded" ? "완료됐습니다." : "준비 상태로 기록됐습니다."}`);
    } catch (error) {
      setExecuteState({ status: "error", runId, error: error.message });
      setNotice(`Local 실행 실패: ${error.message}`);
    }
  }

  async function publishRun(runId) {
    setPublishState({ status: "publishing", runId, error: "" });
    try {
      const dataset = await publishTargetDatasetJobRunToCatalog(runId);
      setPublishState({ status: "published", runId, error: "" });
      setNotice(`${dataset.name} CatalogMetadata 등록이 완료됐습니다. 데이터셋 > Gold Datasets에서 확인할 수 있습니다.`);
    } catch (error) {
      setPublishState({ status: "error", runId, error: error.message });
      setNotice(`Catalog 등록 실패: ${error.message}`);
    }
  }

  const runHistoryItems = runState.records.map((run) => {
    const isExecuting = executeState.status === "executing" && executeState.runId === run.id;
    const isPublishing = publishState.status === "publishing" && publishState.runId === run.id;
    return {
      runType: "gold",
      status: run.status,
      record: {
        id: run.id,
        title: run.gold_output,
        meta: `Gold Build · ${runStatusLabel(run.status)} · ${shortRunId(run.id)} · ${formatRunTimestamp(run.updated_at || run.created_at)}`,
        detail: run.run_note || "Gold Build 실행 기록",
        variant: "run-record",
        facts: [
          ["Type", "Gold Build"],
          ["Status", runStatusLabel(run.status)],
          ["Executor", executorLabel(run.executor_handoff)],
          ["Mode", runOutputModeLabel(run)],
          ["Run Role", run.runtime_evidence?.run_record_role || "definition handoff"],
          ["Output", outputFileName(run.output_path)],
          ["Rows", formatMetric(run.row_count)],
          ["Bytes", formatBytes(run.output_bytes)],
          ["Artifact", run.runtime_evidence?.result_artifact_status || run.runtime_evidence?.object_storage?.status || run.runtime_evidence?.output_format || "-"],
        ],
        actions: [
          {
            label: isExecuting ? "확인 중" : run.executor_handoff === "local_runner" ? "실행" : "준비 확인",
            icon: Play,
            disabled: isExecuting || isPublishing || run.status !== "queued",
            onClick: () => executeRun(run.id),
          },
          {
            label: isPublishing ? "등록 중" : "Catalog 등록",
            icon: Table2,
            disabled: isExecuting || isPublishing || run.status !== "succeeded",
            onClick: () => publishRun(run.id),
          },
        ].filter((action) => !action.disabled || action.label === "실행 중" || action.label === "확인 중" || action.label === "등록 중"),
      },
    };
  });
  const runFilters = [
    ["all", "전체", runHistoryItems.length],
    ["connection", "Connection", runHistoryItems.filter((item) => item.runType === "connection").length],
    ["silver", "Silver", runHistoryItems.filter((item) => item.runType === "silver").length],
    ["gold", "Gold", runHistoryItems.filter((item) => item.runType === "gold").length],
    ["failed", "실패", runHistoryItems.filter((item) => item.status === "failed").length],
  ];
  const filteredRunHistoryItems = runHistoryItems.filter((item) => {
    if (runFilter === "all") return true;
    if (runFilter === "failed") return item.status === "failed";
    return item.runType === runFilter;
  });
  const filteredRunRecords = filteredRunHistoryItems.map((item) => item.record);

  return (
    <div className="page-stack">
      <PageHeader
        title="실행 기록"
        body="Connection Sync, Silver Transform, Gold Build 같은 작업 실행 로그를 타입별로 확인합니다."
      />
      <div className="filter-row">
        {runFilters.map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            className={runFilter === id ? "selected" : ""}
            onClick={() => setRunFilter(id)}
          >
            {label}
            <span>{count}</span>
          </button>
        ))}
      </div>
      <OperationalList
        icon={Play}
        title="작업 실행 로그"
        body="모든 작업은 run log로 남기고, 현재는 Gold Build run이 실제 저장되어 있습니다."
        layout="list"
        records={filteredRunRecords}
        empty={runHistoryEmptyMessage(runFilter, runState.error)}
        onRefresh={refreshRuns}
        loading={runState.loading}
      />
    </div>
  );
}

function runHistoryEmptyMessage(filter, error) {
  if (error) return error;
  if (filter === "connection") return "아직 저장된 Connection Sync 실행 로그가 없습니다. Connection runner persistence가 붙으면 여기에 표시됩니다.";
  if (filter === "silver") return "아직 저장된 Silver Transform 실행 로그가 없습니다. Silver runner persistence가 붙으면 여기에 표시됩니다.";
  if (filter === "failed") return "실패한 실행 로그가 없습니다.";
  if (filter === "gold") return "아직 Gold Build 실행 로그가 없습니다. 작업 > Gold Build Jobs에서 수동 실행을 누르면 생성됩니다.";
  return "아직 저장된 실행 로그가 없습니다. 작업 화면에서 수동 실행을 누르면 run log가 생성됩니다.";
}

function runStatusLabel(status) {
  if (status === "queued") return "실행 대기";
  if (status === "ready_to_run") return "준비됨";
  if (status === "running") return "실행 중";
  if (status === "succeeded") return "성공";
  if (status === "failed") return "실패";
  return status || "상태 없음";
}

function executorLabel(executor) {
  if (executor === "local_runner") return "local_runner";
  if (executor === "airflow") return "Airflow";
  if (executor === "spark_runner") return "Spark";
  return executor || "-";
}

function shortRunId(runId) {
  return runId ? `run ${String(runId).slice(0, 8)}` : "run id 없음";
}

function outputFileName(path) {
  if (!path) return "실행 전";
  return String(path).split("/").filter(Boolean).pop() || path;
}

function formatRunTimestamp(value) {
  if (!value) return "시간 없음";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AirflowReadinessPanel({ setNotice }) {
  const [state, setState] = useState({ loading: true, readiness: null, error: "" });

  async function refreshAirflowReadiness() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const readiness = await getWeek2AirflowReadiness();
      setState({ loading: false, readiness, error: "" });
    } catch (error) {
      setState({ loading: false, readiness: null, error: error.message });
      setNotice(`Airflow readiness 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshAirflowReadiness();
  }, []);

  const readiness = state.readiness;
  const status = readiness?.status || (state.loading ? "checking" : "unknown");
  const isConfigured = readiness?.status === "configured";

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <Network size={20} />
          <div>
            <strong>Airflow Trigger Readiness</strong>
            <p>env 설정 가능 상태를 확인합니다. 이 패널은 DAG trigger를 실행하지 않습니다.</p>
          </div>
        </div>
        <button type="button" className="icon-link" onClick={refreshAirflowReadiness} disabled={state.loading} aria-label="Airflow readiness 새로고침">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>status</span>
          <strong>{status}</strong>
          <p>{readiness?.message || state.error || "Airflow readiness를 확인합니다."}</p>
        </article>
        <article>
          <span>DAG</span>
          <strong>{readiness?.dag_id || "asklake_week2_reviews"}</strong>
          <p>{readiness?.base_url || "base url 없음"}</p>
        </article>
        <article>
          <span>trigger</span>
          <strong>{readiness?.trigger_available ? "available" : "not available"}</strong>
          <p>fallback {readiness?.fallback_available ? "available" : "blocked"}</p>
        </article>
        <article>
          <span>result root</span>
          <strong>{readiness?.result_root_exists ? "exists" : "missing"}</strong>
          <p>{readiness?.result_root || "data/week2/_airflow_results"}</p>
        </article>
      </div>

      <div className="source-manage-grid">
        <section className={`wizard-inline-panel ${isConfigured ? "" : "muted-panel"}`}>
          <div className="table-title-line">
            {isConfigured ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <div>
              <strong>{isConfigured ? "Airflow env configured" : "Airflow env not configured"}</strong>
              <p>{isConfigured ? "DAG trigger metadata는 준비됐지만 여기서 실행하지 않습니다." : "airflow executor는 현재 local runner fallback으로 설명해야 합니다."}</p>
            </div>
          </div>
          <div className="source-manage-facts">
            <span>username</span>
            <strong>{readiness?.username_configured ? "configured" : "not set"}</strong>
            <span>password</span>
            <strong>{readiness?.password_configured ? "configured" : "not set"}</strong>
            <span>credential values</span>
            <strong>{readiness?.credential_values_exposed ? "exposed" : "not exposed"}</strong>
            <span>timeout</span>
            <strong>{formatMetric(readiness?.timeout_seconds)}s</strong>
          </div>
        </section>
        <section className="wizard-inline-panel">
          <div className="table-title-line">
            <ListChecks size={18} />
            <div>
              <strong>Required env</strong>
              <p>값 자체가 아니라 필요 항목만 표시합니다.</p>
            </div>
          </div>
          <div className="dataset-draft-list compact-list">
            {(readiness?.required_env || ["ASKLAKE_WEEK2_AIRFLOW_BASE_URL", "ASKLAKE_WEEK2_AIRFLOW_DAG_ID", "ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT"]).map((item) => (
              <div className="dataset-draft-item" key={item}>
                <strong>{item}</strong>
                <p>required for real Airflow trigger readiness</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {state.error ? (
        <div className="wizard-placeholder compact danger">
          <AlertCircle size={22} />
          <strong>{state.error}</strong>
        </div>
      ) : null}
    </section>
  );
}

function CredentialSecretPolicyPanel({ policy }) {
  const blockedUntil = policy?.blocked_until || [
    "secret storage backend is selected",
    "DB/S3 connector runtime is implemented",
    "error redaction tests are added",
  ];
  const forbiddenFields = policy?.forbidden_request_fields || ["password", "access_key", "secret_key", "token", "raw_credential"];
  const requiredReferences = policy?.required_references || {
    database: ["host_ref", "username_ref", "password_ref"],
    object_storage: ["endpoint_ref", "access_key_ref", "secret_key_ref"],
  };

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <ShieldCheck size={20} />
          <div>
            <strong>Credential Secret Boundary</strong>
            <p>DB/S3 연결은 실제 credential 값을 저장하지 않고 secret_ref 계약으로만 후속 연결합니다.</p>
          </div>
        </div>
        <span className="badge slate">{policy?.status || "secret_ref_design_only"}</span>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>storage</span>
          <strong>{policy?.credential_storage || "secret_ref_only"}</strong>
          <p>local env name 또는 future secret store reference만 metadata로 남깁니다.</p>
        </article>
        <article>
          <span>raw values</span>
          <strong>{policy?.secret_value_storage || "forbidden"}</strong>
          <p>요청, 응답, 로그, metadata DB에 원문 값을 넣지 않습니다.</p>
        </article>
        <article>
          <span>inspect</span>
          <strong>{policy?.inspect_requires_secret_ref ? "secret_ref required" : "not configured"}</strong>
          <p>secret backend가 정해지기 전 DB/S3 schema discovery는 blocked입니다.</p>
        </article>
        <article>
          <span>connection test</span>
          <strong>{policy?.connection_test_enabled ? "enabled" : "disabled"}</strong>
          <p>실제 접속 테스트는 redaction test와 connector runtime 이후에 붙입니다.</p>
        </article>
      </div>

      <div className="source-manage-grid">
        <section className="wizard-inline-panel">
          <div className="table-title-line">
            <ListChecks size={18} />
            <div>
              <strong>Required references</strong>
              <p>값이 아니라 reference 이름만 다룹니다.</p>
            </div>
          </div>
          <div className="dataset-draft-list compact-list">
            {Object.entries(requiredReferences).map(([connector, refs]) => (
              <div className="dataset-draft-item" key={connector}>
                <strong>{connector}</strong>
                <p>{refs.join(", ")}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="wizard-inline-panel muted-panel">
          <div className="table-title-line">
            <AlertCircle size={18} />
            <div>
              <strong>Blocked until</strong>
              <p>{policy?.local_env_policy || "env var name은 허용하지만 env 값은 commit/log에 남기지 않습니다."}</p>
            </div>
          </div>
          <div className="dataset-draft-list compact-list">
            {blockedUntil.map((item) => (
              <div className="dataset-draft-item" key={item}>
                <strong>{item}</strong>
                <p>후속 구현 전 확인 필요</p>
              </div>
            ))}
            <div className="dataset-draft-item">
              <strong>Forbidden request fields</strong>
              <p>{forbiddenFields.join(", ")}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function CatalogDatasetManagementPolicyPanel({ policy, publishedCount }) {
  const allowedActions = policy?.allowed_actions || ["detail", "ai_query_context"];
  const disabledActions = policy?.disabled_actions || ["metadata_update", "metadata_delete", "file_delete", "cascade_delete"];
  const referenceBlocking = policy?.reference_blocking || [
    "AI Query context와 lineage audit을 깨뜨리지 않기 위해 삭제 정책은 후속 Phase에서 분리합니다.",
  ];

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <ShieldCheck size={20} />
          <div>
            <strong>CatalogDataset Management Boundary</strong>
            <p>registered Gold Dataset은 현재 read-only evidence입니다. metadata 삭제와 실제 파일 삭제는 분리합니다.</p>
          </div>
        </div>
        <span className="badge slate">{publishedCount} registered</span>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>policy</span>
          <strong>{policy?.status || "read_only_boundary"}</strong>
          <p>상세 확인과 AI Query context 소비만 허용합니다.</p>
        </article>
        <article>
          <span>allowed</span>
          <strong>{allowedActions.join(", ")}</strong>
          <p>published CatalogDataset은 lineage/evidence anchor로 유지합니다.</p>
        </article>
        <article>
          <span>disabled</span>
          <strong>{disabledActions.join(", ")}</strong>
          <p>metadata-only 삭제, file delete, cascade delete는 같은 버튼으로 묶지 않습니다.</p>
        </article>
        <article>
          <span>file delete</span>
          <strong>{policy?.file_delete_policy || "never_without_explicit_human_confirmation"}</strong>
          <p>output parquet/jsonl evidence는 사람 확인 없이 삭제하지 않습니다.</p>
        </article>
      </div>

      <div className="dataset-draft-list compact-list">
        {referenceBlocking.map((item) => (
          <div className="dataset-draft-item" key={item}>
            <strong>Blocked rule</strong>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SparkReadinessPanel({ setNotice }) {
  const [state, setState] = useState({ loading: true, readiness: null, error: "" });

  async function refreshSparkReadiness() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const readiness = await getWeek2SparkReadiness();
      setState({ loading: false, readiness, error: "" });
    } catch (error) {
      setState({ loading: false, readiness: null, error: error.message });
      setNotice(`Spark readiness 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshSparkReadiness();
  }, []);

  const readiness = state.readiness;
  const status = readiness?.status || (state.loading ? "checking" : "unknown");
  const localReady = readiness?.local_smoke_available;
  const clusterReady = readiness?.distributed_cluster_available;
  const supportedSourceTypes = readiness?.supported_source_types || ["local_file"];
  const unsupportedSourceTypes = readiness?.unsupported_source_types || ["s3", "postgres", "mongodb", "kafka"];

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <Sparkles size={20} />
          <div>
            <strong>Spark Runner Readiness</strong>
            <p>local smoke와 distributed Spark cluster 실행 경계를 확인합니다. 이 패널은 Spark job을 시작하지 않습니다.</p>
          </div>
        </div>
        <button type="button" className="icon-link" onClick={refreshSparkReadiness} disabled={state.loading} aria-label="Spark readiness 새로고침">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>status</span>
          <strong>{status}</strong>
          <p>{readiness?.message || state.error || "Spark runner readiness를 확인합니다."}</p>
        </article>
        <article>
          <span>implementation</span>
          <strong>{readiness?.runner_implementation || "local_pyarrow_smoke"}</strong>
          <p>{readiness?.runner || "spark_runner"}</p>
        </article>
        <article>
          <span>local smoke</span>
          <strong>{localReady ? "available" : "blocked"}</strong>
          <p>pyarrow {readiness?.pyarrow_available ? "available" : "missing"}</p>
        </article>
        <article>
          <span>distributed cluster</span>
          <strong>{clusterReady ? "available" : "not available"}</strong>
          <p>{readiness?.spark_master || "master 미설정"}</p>
        </article>
      </div>

      <div className="source-manage-grid">
        <section className={localReady ? "wizard-inline-panel" : "wizard-inline-panel muted-panel"}>
          <div className="table-title-line">
            {localReady ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <div>
              <strong>{localReady ? "Local smoke ready" : "Local smoke blocked"}</strong>
              <p>{readiness?.boundary || "Spark runner는 현재 local_file smoke 중심이며 대용량 ETL 재실행은 하지 않습니다."}</p>
            </div>
          </div>
          <div className="source-manage-facts">
            <span>pyspark</span>
            <strong>{readiness?.pyspark_available ? "available" : "not detected"}</strong>
            <span>java</span>
            <strong>{readiness?.java_available ? "available" : "not detected"}</strong>
            <span>cluster env</span>
            <strong>{readiness?.cluster_configured ? "configured" : "not set"}</strong>
            <span>output</span>
            <strong>{readiness?.output_format || "parquet"}</strong>
          </div>
        </section>
        <section className="wizard-inline-panel">
          <div className="table-title-line">
            <ListChecks size={18} />
            <div>
              <strong>Source type boundary</strong>
              <p>현재 smoke에서 실제 처리 가능한 source와 후속 source를 분리합니다.</p>
            </div>
          </div>
          <div className="dataset-draft-list compact-list">
            <div className="dataset-draft-item">
              <strong>Supported: {supportedSourceTypes.join(", ")}</strong>
              <p>formats {(readiness?.supported_input_formats || ["json", "jsonl", "parquet"]).join(", ")}</p>
            </div>
            <div className="dataset-draft-item">
              <strong>Deferred: {unsupportedSourceTypes.join(", ")}</strong>
              <p>S3/DB/Kafka Spark read는 별도 connector/credential/cluster Phase가 필요합니다.</p>
            </div>
            <div className="dataset-draft-item">
              <strong>L6 preview operations</strong>
              <p>{(readiness?.l6_preview_supported_operations || []).slice(0, 8).join(", ") || "contract 확인 중"}</p>
            </div>
          </div>
        </section>
      </div>

      {state.error ? (
        <div className="wizard-placeholder compact danger">
          <AlertCircle size={22} />
          <strong>{state.error}</strong>
        </div>
      ) : null}
    </section>
  );
}

function KafkaReplayEvidencePanel({ setNotice }) {
  const [state, setState] = useState({
    loading: true,
    health: null,
    runs: [],
    selectedRun: null,
    error: "",
  });

  async function refreshKafkaReplay() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [health, runPayload] = await Promise.all([getKafkaReplayHealth(), listKafkaReplayRuns()]);
      const runs = runPayload?.runs || [];
      setState({
        loading: false,
        health,
        runs,
        selectedRun: runs[0] || null,
        error: "",
      });
    } catch (error) {
      setState({ loading: false, health: null, runs: [], selectedRun: null, error: error.message });
      setNotice(`Kafka replay evidence 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshKafkaReplay();
  }, []);

  async function openReplayRun(runId) {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const run = await getKafkaReplayRun(runId);
      setState((current) => ({ ...current, loading: false, selectedRun: run, error: "" }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error.message }));
      setNotice(`Kafka replay run 조회 실패: ${error.message}`);
    }
  }

  const health = state.health;
  const selectedRun = state.selectedRun;
  const metrics = selectedRun?.metrics || {};
  const lineage = selectedRun?.lineage || {};
  const isMissingEvidence = health?.status === "missing_evidence" || (!state.loading && state.runs.length === 0);

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <Network size={20} />
          <div>
            <strong>Kafka Replay Evidence</strong>
            <p>M4 replay receipt 조회 전용입니다. 실제 Kafka consume/produce trigger는 실행하지 않습니다.</p>
          </div>
        </div>
        <button type="button" className="icon-link" onClick={refreshKafkaReplay} disabled={state.loading} aria-label="Kafka replay evidence 새로고침">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>health</span>
          <strong>{health?.status || (state.loading ? "checking" : "unknown")}</strong>
          <p>{health?.message || state.error || "Kafka replay evidence 상태를 확인합니다."}</p>
        </article>
        <article>
          <span>topic</span>
          <strong>{health?.topic || "-"}</strong>
          <p>{health?.latest_run_id || "latest run 없음"}</p>
        </article>
        <article>
          <span>sent rows</span>
          <strong>{formatMetric(health?.sent_rows)}</strong>
          <p>errors {formatMetric(health?.error_count)}</p>
        </article>
        <article>
          <span>throughput</span>
          <strong>{formatMetric(health?.throughput_per_second)}</strong>
          <p>progress {formatMetric(health?.progress_percent)}%</p>
        </article>
      </div>

      {isMissingEvidence ? (
        <div className="wizard-placeholder compact">
          <AlertCircle size={22} />
          <strong>Kafka replay evidence 없음</strong>
          <p>{health?.evidence_dir || "data/results/week2/_metadata/kafka_replay"} 아래에 replay receipt가 아직 없습니다.</p>
        </div>
      ) : null}

      {selectedRun ? (
        <div className="source-manage-grid">
          <section className="wizard-inline-panel">
            <div className="table-title-line">
              <FileJson size={18} />
              <div>
                <strong>{selectedRun.run_id}</strong>
                <p>{selectedRun.status} · {selectedRun.topic}</p>
              </div>
            </div>
            <div className="source-manage-facts">
              <span>source</span>
              <strong>{selectedRun.source_file || "-"}</strong>
              <span>target</span>
              <strong>{lineage.target_ref || lineage.kafka_topic || "-"}</strong>
              <span>started</span>
              <strong>{selectedRun.started_at || "-"}</strong>
              <span>finished</span>
              <strong>{selectedRun.finished_at || "-"}</strong>
            </div>
          </section>
          <section className="wizard-inline-panel">
            <div className="table-title-line">
              <BarChart3 size={18} />
              <div>
                <strong>Replay metrics</strong>
                <p>durable receipt 기준, broker live lag가 아닙니다.</p>
              </div>
            </div>
            <div className="source-manage-facts">
              <span>sent_rows</span>
              <strong>{formatMetric(metrics.sent_rows)}</strong>
              <span>failed_rows</span>
              <strong>{formatMetric(metrics.failed_rows)}</strong>
              <span>processed_bytes</span>
              <strong>{formatMetric(formatBytes(metrics.processed_bytes))}</strong>
              <span>duration</span>
              <strong>{formatMetric(metrics.duration_ms)}ms</strong>
            </div>
          </section>
        </div>
      ) : null}

      {state.runs.length > 0 ? (
        <div className="operational-record-list">
          {state.runs.map((run) => (
            <article className="operational-record" key={run.run_id}>
              <div>
                <div className="table-title-line">
                  <Route size={17} />
                  <div>
                    <strong>{run.run_id}</strong>
                    <p>{run.status || "unknown"} · {run.topic || "topic 없음"}</p>
                  </div>
                </div>
                <small>
                  sent {formatMetric(run.metrics?.sent_rows)} · errors {formatMetric(run.metrics?.error_count)} · {run.updated_at || run.finished_at || "-"}
                </small>
              </div>
              <button type="button" className="ghost-action" onClick={() => openReplayRun(run.run_id)} disabled={state.loading}>
                Evidence 보기
                <FileCheck2 size={15} />
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {state.error ? (
        <div className="wizard-placeholder compact danger">
          <AlertCircle size={22} />
          <strong>{state.error}</strong>
        </div>
      ) : null}
    </section>
  );
}

function runOutputModeLabel(run) {
  if (run?.runtime_evidence?.executor_status === "readiness_only") {
    return `${executorLabel(run.executor_handoff)} readiness`;
  }
  if (run?.runtime_evidence?.materialization_mode === "prepared_gold_reference") {
    return "prepared parquet reference";
  }
  if (run?.runtime_evidence?.materialization_mode === "silver_parquet_to_gold") {
    return "Silver parquet to Gold";
  }
  if (run?.runtime_evidence?.materialization_mode === "local_demo_jsonl") {
    return "local demo JSONL";
  }
  return "local materialization";
}

function DatasetTypeChoiceModal({ onClose, onSelect }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal dataset-type-modal" role="dialog" aria-modal="true" aria-labelledby="dataset-type-title">
        <header>
          <div>
            <h2 id="dataset-type-title">무엇을 만들까요?</h2>
            <p>외부 연결, raw/source dataset, 가공 결과 dataset의 역할을 분리해서 준비합니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="dataset-type-options">
          <button type="button" onClick={() => onSelect("connection")}>
            <span className="dataset-type-icon">
              <ServerCog size={22} />
            </span>
            <strong>External Connection</strong>
            <p>Local File, Local Folder, Kafka Topic 연결 설정을 준비합니다.</p>
            <small>{"Connector Type -> Configure -> Review"}</small>
          </button>
          <button type="button" onClick={() => onSelect("source")}>
            <span className="dataset-type-icon">
              <Database size={22} />
            </span>
            <strong>Source Dataset</strong>
            <p>등록된 External Connection에서 raw/source dataset을 만듭니다.</p>
            <small>{"Connection 선택 -> Raw Dataset 설정 -> Review"}</small>
          </button>
          <button type="button" onClick={() => onSelect("silver")}>
            <span className="dataset-type-icon">
              <Layers3 size={22} />
            </span>
            <strong>Silver Dataset</strong>
            <p>Source Dataset을 표준화/검증한 중간 dataset metadata를 만듭니다.</p>
            <small>{"Source 선택 -> Rules 설정 -> Review"}</small>
          </button>
          <button type="button" onClick={() => onSelect("target")}>
            <span className="dataset-type-icon">
              <Table2 size={22} />
            </span>
            <strong>Gold Dataset</strong>
            <p>Silver Dataset을 조합해 Gold Dataset과 Build Job 설정을 준비합니다.</p>
            <small>{"Overview -> Silver 선택 -> Process -> 실행 준비 -> Scheduling -> Review"}</small>
          </button>
        </div>
      </section>
    </div>
  );
}

function SourceStartModal({ sources, onClose, onSelect, onCreateNew }) {
  const [selectedType, setSelectedType] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const visibleSources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredSources = sources.filter((source) => {
      const matchesType = selectedType === "all" || source.sourceType === selectedType;
      const matchesQuery =
        !normalizedQuery ||
        [source.name, source.typeLabel, source.status, source.description, source.resource]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesType && matchesQuery;
    });

    return [...filteredSources].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }

      if (sortBy === "columns") {
        return b.columns.length - a.columns.length || a.name.localeCompare(b.name);
      }

      return b.updatedRank - a.updatedRank;
    });
  }, [query, selectedType, sortBy, sources]);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="source-modal-title">
        <header>
          <div>
            <h2 id="source-modal-title">등록된 Source Dataset 선택</h2>
            <p>Gold Dataset의 입력으로 사용할 등록된 Source Dataset을 고릅니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-picker-body">
          <div className="source-type-grid" aria-label="Source type filter">
            {sourceTypeOptions.map((type) => (
              <button
                key={type.id}
                type="button"
                className={selectedType === type.id ? "active" : ""}
                onClick={() => setSelectedType(type.id)}
              >
                <strong>{type.label}</strong>
                <small>{type.description}</small>
              </button>
            ))}
          </div>
          <div className="source-picker-toolbar">
            <label className="source-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="dataset 검색"
                aria-label="dataset 검색"
              />
            </label>
            <label>
              <span>종류</span>
              <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                {sourceTypeOptions.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>정렬</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                {sourceSortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {visibleSources.length > 0 ? (
            <div className="source-card-grid">
              {visibleSources.map((source) => (
                <button key={source.id} type="button" className="source-card" onClick={() => onSelect(source)}>
                  <div className="source-card-head">
                    <span className="source-card-icon">
                      <Database size={18} aria-hidden="true" />
                    </span>
                    <span className="source-card-badge">{source.typeLabel}</span>
                  </div>
                  <strong>{source.name}</strong>
                  <p>{source.description}</p>
                  <div className="source-card-meta">
                    <span>{source.status}</span>
                    <span>{source.columns.length} columns</span>
                  </div>
                  <small>{source.resource}</small>
                  <small>수정 {source.updatedLabel}</small>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Database}
              title="조건에 맞는 dataset이 없습니다"
              body="전체 보기로 바꾸거나 검색어를 줄여서 다시 확인합니다."
            />
          )}
        </div>
        <footer>
          <button type="button" className="ghost-action" onClick={onClose}>
            취소
          </button>
          <button type="button" className="primary-action" onClick={onCreateNew}>
            Source Dataset 생성
            <ArrowRight size={16} />
          </button>
        </footer>
      </section>
    </div>
  );
}
function VisualEditorPage({ navigate, setNotice }) {
  const [selectedNode, setSelectedNode] = useState("Source");
  const canvasNodes = [
    ["Source", "Amazon Reviews JSON", "left"],
    ["Select", "필드 선택", "center"],
    ["Cast", "rating, review_time", "center"],
    ["Aggregate", "product_id별 metric", "center"],
    ["Load", "dataset_reviews_gold", "right"],
  ];

  return (
    <div className="visual-editor-shell">
      <header className="visual-toolbar">
        <button type="button" className="ghost-action" onClick={() => navigate("/sources")}>
          <ArrowLeft size={16} />
          데이터셋
        </button>
        <div>
          <h2>파이프라인 시각 편집</h2>
          <p>기준 데모의 canvas flow를 M1 static shell로 보존합니다.</p>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="ghost-action" onClick={() => setNotice("M1에서는 저장 API를 호출하지 않습니다.")}>
            <Save size={16} />
            저장 대기
          </button>
          <button type="button" className="primary-action" onClick={() => setNotice("M5 ExecutionResult 연결 전에는 실행하지 않습니다.")}>
            <Play size={16} />
            실행 대기
          </button>
        </div>
      </header>
      <section className="visual-body">
        <aside className="node-palette">
          <strong>노드 팔레트</strong>
          {["Source", "Select Fields", "Filter", "Cast", "Aggregate", "Load"].map((item) => (
            <button key={item} type="button" onClick={() => setSelectedNode(item)}>
              <Plus size={14} />
              {item}
            </button>
          ))}
        </aside>
        <div className="canvas-board">
          {canvasNodes.map(([type, label, lane], index) => (
            <button
              type="button"
              className={`canvas-node ${selectedNode === type ? "active" : ""} ${lane}`}
              key={type}
              onClick={() => setSelectedNode(type)}
            >
              <span>{index + 1}</span>
              <strong>{type}</strong>
              <small>{label}</small>
            </button>
          ))}
          <div className="canvas-line one" />
          <div className="canvas-line two" />
          <div className="canvas-line three" />
        </div>
        <aside className="properties-panel">
          <strong>Properties</strong>
          <p>{selectedNode} 설정은 후속 모듈 연결 후 실제 form으로 교체됩니다.</p>
          <InfoCard title="Contract" value="WorkflowDefinition" detail="M5 owner" />
        </aside>
      </section>
    </div>
  );
}

const m5ExecutorOptions = [
  {
    id: "local_runner",
    title: "Local runner",
    detail: "backend 내부 runner가 sample JSONL을 읽고 gold output과 Catalog를 만든다.",
    badge: "가장 안정적인 학습 경로",
  },
  {
    id: "airflow",
    title: "Airflow",
    detail: "Airflow DAG를 트리거하고 shared result artifact를 backend가 다시 읽는다.",
    badge: "Docker/Airflow 필요",
  },
];

const m5CoreFlow = [
  {
    icon: Workflow,
    eyebrow: "1. 실행 계약",
    title: "WorkflowDefinition",
    plain: "무슨 pipeline을 어떤 순서로 실행할지 정한 약속입니다.",
    focus: "pipeline_id, node 순서",
  },
  {
    icon: ServerCog,
    eyebrow: "2. 실행",
    title: "Runner",
    plain: "local_runner 또는 Airflow가 실제 실행을 담당합니다.",
    focus: "executor, status, logs",
  },
  {
    icon: FileCheck2,
    eyebrow: "3. 결과 파일",
    title: "Output Artifact",
    plain: "실행 결과로 gold dataset 파일과 위치가 생깁니다.",
    focus: "dataset_id, output URI",
  },
  {
    icon: FolderOpen,
    eyebrow: "4. 카탈로그",
    title: "CatalogMetadata",
    plain: "M6/Query가 읽을 metadata로 output 증거가 등록됩니다.",
    focus: "lineage.run_id, row_count",
  },
];

const m5MustKnowItems = [
  {
    title: "M5의 핵심 기능",
    body: "workflow를 실행하고, 실행 증거와 catalog metadata를 남긴다.",
  },
  {
    title: "검증 기준",
    body: "같은 run_id가 ExecutionResult, output, CatalogMetadata에 이어져야 한다.",
  },
  {
    title: "주의할 상태",
    body: "`fallback_succeeded`는 성공처럼 보여도 어떤 executor에서 왜 fallback됐는지 로그로 확인해야 한다.",
  },
  {
    title: "학습 목표",
    body: "화면을 보고 M5가 통합 전에 어디까지 동작하는지 세 문장으로 설명한다.",
  },
];

const m5WorkflowLearningSteps = [
  {
    id: "node_source_reviews",
    type: "Source",
    label: "Amazon Reviews JSON",
    lesson: "입력 JSONL을 읽습니다.",
  },
  {
    id: "node_filter_reviews",
    type: "Select/Filter",
    label: "필드 선택",
    lesson: "분석에 필요한 column만 남깁니다.",
  },
  {
    id: "node_normalize_reviews",
    type: "Cast/Normalize",
    label: "타입 정리",
    lesson: "Catalog schema로 이어질 타입을 맞춥니다.",
  },
  {
    id: "node_aggregate_reviews",
    type: "Aggregate",
    label: "product별 집계",
    lesson: "review_count와 average_rating을 만듭니다.",
  },
  {
    id: "node_load_reviews",
    type: "Load",
    label: WEEK2_DEFAULT_DATASET_ID,
    lesson: "gold output과 CatalogMetadata를 남깁니다.",
  },
];

function formatMetric(value, fallback = "-") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function runBadgeClass(status) {
  if (status === "succeeded") return "green";
  if (status === "fallback_succeeded") return "orange";
  if (status === "failed" || status === "fallback_failed") return "orange";
  return "blue";
}

function isFallbackRun(run) {
  const status = run?.status || "";
  const logs = run?.logs || [];
  return status.startsWith("fallback") || logs.some((log) => String(log.message || "").toLowerCase().includes("falling back"));
}

function isSuccessfulRun(run) {
  return run?.status === "succeeded" || run?.status === "fallback_succeeded";
}

function statusMeaning(run) {
  if (!run) return "아직 실행 전입니다.";
  if (run.executor === "local_runner" && run.status === "fallback_succeeded") {
    return "local runner가 local fallback output 경로로 정상 산출물을 만들었다는 뜻입니다.";
  }
  if (run.executor === "airflow" && run.status === "fallback_succeeded") {
    return "Airflow 실행은 실패했고 local runner fallback이 대신 성공했다는 뜻입니다.";
  }
  if (run.executor === "airflow" && run.status === "succeeded" && !isFallbackRun(run)) {
    return "Airflow DAG 실행이 fallback 없이 성공했다는 뜻입니다.";
  }
  if (run.status === "succeeded") return "선택한 runner가 성공 결과를 반환했다는 뜻입니다.";
  return "성공으로 해석하지 말고 task_results와 logs를 먼저 봐야 합니다.";
}

function checkStateLabel(state) {
  if (state === "pass") return "확인됨";
  if (state === "warn") return "주의";
  return "대기";
}

function buildM5LearningChecks(run, catalog) {
  const output = run?.outputs?.[0];
  const catalogRunId = catalog?.lineage?.run_id;
  const catalogMatchesRun = Boolean(run?.run_id && catalogRunId === run.run_id);
  const hasOutput = Boolean(output?.dataset_id && output?.uri);
  const successful = isSuccessfulRun(run);

  return [
    {
      id: "run",
      state: run?.run_id ? "pass" : "wait",
      title: "Run ID가 생겼나",
      value: run?.run_id || "실행 전",
      detail: "run_id는 이 실험에서 모든 evidence를 묶는 기준키입니다.",
    },
    {
      id: "status",
      state: !run ? "wait" : successful ? "pass" : "warn",
      title: "status를 제대로 해석했나",
      value: run?.status || "not_run",
      detail: statusMeaning(run),
    },
    {
      id: "output",
      state: !run ? "wait" : hasOutput ? "pass" : "warn",
      title: "output dataset이 생겼나",
      value: output?.dataset_id || "아직 없음",
      detail: output?.uri || "ExecutionResult.outputs에서 dataset과 path를 확인합니다.",
    },
    {
      id: "catalog",
      state: !run ? "wait" : catalogMatchesRun ? "pass" : "warn",
      title: "Catalog가 같은 run을 가리키나",
      value: catalogRunId || "아직 없음",
      detail: catalogMatchesRun
        ? "CatalogMetadata.lineage.run_id가 현재 run_id와 같습니다."
        : "Catalog가 비었거나 이전 성공 run을 가리킬 수 있습니다.",
    },
  ];
}

function buildM5Narrative(run, catalog) {
  if (!run) {
    return [
      `M5는 ${WEEK2_DEFAULT_PIPELINE_ID} workflow를 실행하는 모듈입니다.`,
      "실행 전에는 run_id, output, catalog evidence가 아직 없습니다.",
      "`local_runner 실행`을 누른 뒤 같은 run_id가 어디까지 이어지는지 확인합니다.",
    ];
  }

  const output = run.outputs?.[0];
  const catalogRunId = catalog?.lineage?.run_id;
  const catalogSentence = catalogRunId === run.run_id
    ? `CatalogMetadata도 같은 run_id(${catalogRunId})를 가리킵니다.`
    : `CatalogMetadata는 아직 현재 run_id(${run.run_id})와 완전히 연결됐다고 볼 수 없습니다.`;

  return [
    `M5는 ${WEEK2_DEFAULT_PIPELINE_ID}를 ${run.executor}로 실행했고 run_id는 ${run.run_id}입니다.`,
    `status는 ${run.status}입니다. ${statusMeaning(run)}`,
    `output은 ${output?.dataset_id || "아직 없음"}이고, ${catalogSentence}`,
  ];
}

function runInterpretation(run, catalog) {
  if (!run) {
    return {
      title: "아직 실행 전입니다",
      body: "지금 볼 핵심은 4개입니다. run_id가 생기는지, status를 어떻게 해석해야 하는지, output이 생기는지, Catalog가 같은 run_id를 가리키는지 확인합니다.",
      tone: "neutral",
    };
  }

  const catalogRunId = catalog?.lineage?.run_id;
  const catalogLineage = catalogRunId === run.run_id ? "Catalog lineage도 이번 run을 가리킵니다." : "Catalog는 아직 이번 run을 가리키지 않거나 이전 성공 run을 보여줄 수 있습니다.";

  if (run.status === "succeeded" && run.executor === "airflow" && !isFallbackRun(run)) {
    return {
      title: "Airflow 경로가 실제로 성공했습니다",
      body: `DAG 실행 결과를 backend adapter가 읽었고, fallback 없이 succeeded가 되었습니다. ${catalogLineage}`,
      tone: "success",
    };
  }

  if (run.executor === "local_runner" && isSuccessfulRun(run)) {
    return {
      title: "Local runner가 output과 Catalog evidence를 만들었습니다",
      body: `이 경로의 핵심은 Airflow가 아니라 local runner가 demo output을 만들었는지입니다. ${statusMeaning(run)} ${catalogLineage}`,
      tone: "success",
    };
  }

  if (run.executor === "airflow" && run.status === "fallback_succeeded") {
    return {
      title: "Airflow는 실패했고 local fallback이 성공했습니다",
      body: "데모 API는 사용성을 위해 fallback을 허용하지만, Airflow 자체 성공으로 해석하면 안 됩니다. log에서 falling back 메시지를 확인하세요.",
      tone: "warning",
    };
  }

  if (run.status === "succeeded") {
    return {
      title: "Runner 경로가 성공했습니다",
      body: `선택한 executor가 output과 실행 증거를 반환했습니다. ${catalogLineage}`,
      tone: "success",
    };
  }

  return {
    title: "실행이 실패했거나 아직 끝나지 않았습니다",
    body: "이 상태는 성공처럼 보여주지 않습니다. task_results와 logs에서 실패 위치를 먼저 확인해야 합니다.",
    tone: "warning",
  };
}

function findTaskForStep(tasks, stepId) {
  return tasks.find((task) => task.node_id === stepId) || null;
}

function compactJson(value) {
  if (!value) return "{}";
  return JSON.stringify(value, null, 2);
}

function useWeek2CatalogState(datasetId = WEEK2_DEFAULT_DATASET_ID) {
  const [catalogState, setCatalogState] = useState({
    catalog: null,
    error: "",
    loading: true,
  });

  async function refreshCatalog() {
    setCatalogState((previous) => ({ ...previous, error: "", loading: true }));
    try {
      const catalog = await getWeek2Catalog(datasetId);
      setCatalogState({ catalog, error: "", loading: false });
    } catch (error) {
      setCatalogState((previous) => ({
        catalog: previous.catalog,
        error: error.message,
        loading: false,
      }));
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const catalog = await getWeek2Catalog(datasetId);
        if (isMounted) setCatalogState({ catalog, error: "", loading: false });
      } catch (error) {
        if (isMounted) setCatalogState({ catalog: null, error: error.message, loading: false });
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [datasetId]);

  return { catalogState, refreshCatalog };
}

function useLiveCatalogDatasetState(preferredDatasetId) {
  const [catalogState, setCatalogState] = useState({
    catalog: null,
    count: 0,
    error: "",
    loading: true,
  });

  async function refreshCatalog() {
    setCatalogState((previous) => ({ ...previous, error: "", loading: true }));
    try {
      const datasets = await listCatalogDatasets();
      const publishedGoldDatasets = datasets.filter(
        (dataset) => dataset.source_type === "target_dataset_job_run" && dataset.status === "ready",
      );
      const selectedCatalog =
        publishedGoldDatasets.find((dataset) => dataset.id === preferredDatasetId) || publishedGoldDatasets[0] || null;
      setCatalogState({
        catalog: selectedCatalog,
        count: publishedGoldDatasets.length,
        error: "",
        loading: false,
      });
    } catch (error) {
      setCatalogState((previous) => ({
        ...previous,
        error: error.message,
        loading: false,
      }));
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCatalogDatasets() {
      try {
        const datasets = await listCatalogDatasets();
        if (!isMounted) return;
        const publishedGoldDatasets = datasets.filter(
          (dataset) => dataset.source_type === "target_dataset_job_run" && dataset.status === "ready",
        );
        const selectedCatalog =
          publishedGoldDatasets.find((dataset) => dataset.id === preferredDatasetId) || publishedGoldDatasets[0] || null;
        setCatalogState({
          catalog: selectedCatalog,
          count: publishedGoldDatasets.length,
          error: "",
          loading: false,
        });
      } catch (error) {
        if (isMounted) {
          setCatalogState((previous) => ({
            ...previous,
            error: error.message,
            loading: false,
          }));
        }
      }
    }

    loadCatalogDatasets();
    return () => {
      isMounted = false;
    };
  }, [preferredDatasetId]);

  return { catalogState, refreshCatalog };
}

function productHealthReadiness(catalog, error, loading) {
  const hasCatalog = Boolean(catalog);
  const hasLocalPath = Boolean(catalog?.storage?.local_fallback_path);
  const hasAllowedColumns = Boolean(catalog?.query?.allowed_columns?.length);
  const allowsReadonlySql = Boolean(catalog?.query?.allow_readonly_sql);
  const hasLineage = Boolean(catalog?.lineage?.run_id);
  const ready = hasCatalog && hasLocalPath && hasAllowedColumns && allowsReadonlySql && hasLineage;

  if (loading) {
    return {
      status: "checking",
      title: "Product Health Gold 확인 중",
      body: `${PRODUCT_HEALTH_DATASET_ID} CatalogMetadata를 조회하고 있습니다.`,
      checks: [
        ["CatalogMetadata", "checking", "M5 Catalog 조회 중"],
        ["Gold local path", "checking", "storage.local_fallback_path 확인 중"],
        ["Query contract", "checking", "allowlist 확인 중"],
        ["Lineage", "checking", "run_id 확인 중"],
      ],
    };
  }

  if (!hasCatalog) {
    const missingBody = `${PRODUCT_HEALTH_DATASET_ID} CatalogMetadata가 없습니다. M2/M3/M5가 gold_product_health output과 Catalog lineage를 먼저 닫아야 합니다.`;
    return {
      status: "missing",
      title: "Product Health Gold가 아직 준비되지 않았습니다",
      body: error ? `${missingBody} (${error})` : missingBody,
      checks: [
        ["CatalogMetadata", "missing", "M5 Catalog 등록 필요"],
        ["Gold output", "missing", "M3 TransformSpec과 M2 runtime output 필요"],
        ["Query evidence", "missing", "M6가 읽을 local fallback path 없음"],
        ["Next owner", "missing", "M2/M3/M5 통합 후 M1 재확인"],
      ],
    };
  }

  return {
    status: ready ? "ready" : "partial",
    title: ready ? "Product Health Gold query 준비됨" : "Product Health Gold evidence가 일부 부족합니다",
    body: ready
      ? "CatalogMetadata, lineage, local fallback path, readonly SQL allowlist가 모두 보입니다."
      : "Catalog는 보이지만 local path, allowed columns, lineage 중 일부가 빠져 있어 성공으로 표시하지 않습니다.",
    checks: [
      ["CatalogMetadata", "ready", catalog.dataset_id],
      ["Gold local path", hasLocalPath ? "ready" : "missing", catalog.storage?.local_fallback_path || "storage.local_fallback_path 필요"],
      ["Query contract", hasAllowedColumns && allowsReadonlySql ? "ready" : "missing", catalog.query?.table_name || "allowed_columns 또는 allow_readonly_sql 필요"],
      ["Lineage", hasLineage ? "ready" : "missing", catalog.lineage?.run_id || "M5 lineage.run_id 필요"],
    ],
  };
}

function liveCatalogDatasetReadiness(catalog, error, loading, count, preferredDatasetId) {
  const hasCatalog = Boolean(catalog);
  const schemaFields = catalog?.schema || [];
  const hasLocalPath = Boolean(catalog?.storage?.local_path || catalog?.path);
  const hasAllowedColumns = schemaFields.length > 0;
  const hasLineage = Boolean(catalog?.lineage?.run_id);
  const ready = hasCatalog && hasLocalPath && hasAllowedColumns && hasLineage;

  if (loading) {
    return {
      status: "checking",
      eyebrow: "Live catalog readiness",
      title: "Published Gold Dataset 확인 중",
      body: "CatalogDataset 목록에서 AI Query가 사용할 Gold output을 찾고 있습니다.",
      checks: [
        ["CatalogDataset", "checking", "published catalog 조회 중"],
        ["Gold local path", "checking", "storage.local_path 확인 중"],
        ["Query columns", "checking", "schema columns 확인 중"],
        ["Lineage", "checking", "run_id 확인 중"],
      ],
    };
  }

  if (!hasCatalog) {
    const targetLabel = preferredDatasetId ? ` (${preferredDatasetId})` : "";
    return {
      status: "missing",
      eyebrow: "Live catalog readiness",
      title: "Published Gold Dataset이 아직 없습니다",
      body: error
        ? `CatalogDataset 조회 실패: ${error}`
        : `Catalog 등록된 Target Dataset${targetLabel}을 찾지 못했습니다. 실행 기록에서 succeeded run을 Catalog 등록하면 여기에 표시됩니다.`,
      checks: [
        ["CatalogDataset", "missing", count ? `${count} published items, 선택 dataset 없음` : "published target dataset 없음"],
        ["Gold local path", "missing", "storage.local_path 필요"],
        ["Query columns", "missing", "schema columns 필요"],
        ["Lineage", "missing", "run_id 필요"],
      ],
    };
  }

  return {
    status: ready ? "ready" : "partial",
    eyebrow: "Live catalog readiness",
    title: ready ? `${catalog.name} query 준비됨` : `${catalog.name} evidence가 일부 부족합니다`,
    body: ready
      ? "Published CatalogDataset의 local path, schema columns, lineage가 AI Query context와 연결되어 있습니다."
      : "CatalogDataset은 보이지만 local path, schema columns, lineage 중 일부가 부족합니다.",
    checks: [
      ["CatalogDataset", "ready", catalog.id],
      ["Gold local path", hasLocalPath ? "ready" : "missing", catalog.storage?.local_path || catalog.path || "storage.local_path 필요"],
      ["Query columns", hasAllowedColumns ? "ready" : "missing", schemaFields.map((field) => field.name).join(", ") || "schema columns 필요"],
      ["Lineage", hasLineage ? "ready" : "missing", catalog.lineage?.run_id || "run_id 필요"],
    ],
  };
}

function demoReadinessItems(readiness) {
  const checkState = Object.fromEntries(readiness.checks.map(([label, state, detail]) => [label, { state, detail }]));
  const catalogReady = checkState.CatalogMetadata?.state === "ready";
  const goldOutputReady = checkState["Gold output"]?.state === "ready" || checkState["Gold local path"]?.state === "ready";
  const lineageReady = checkState.Lineage?.state === "ready";
  const queryReady = readiness.status === "ready";

  return [
    {
      module: "M2",
      label: "Runtime evidence",
      state: goldOutputReady ? "ready" : readiness.status === "checking" ? "unknown" : "not-ready",
      detail: goldOutputReady ? "Gold output local path 확인됨" : "source별 runtime output evidence 대기",
    },
    {
      module: "M3",
      label: "Gold semantics",
      state: goldOutputReady ? "unknown" : "not-ready",
      detail: goldOutputReady ? "metric 의미 최종 확인 필요" : "gold_product_health TransformSpec/output 대기",
    },
    {
      module: "M5",
      label: "Catalog lineage",
      state: catalogReady && lineageReady ? "ready" : readiness.status === "checking" ? "unknown" : "not-ready",
      detail: catalogReady && lineageReady ? "CatalogMetadata와 run_id 확인됨" : "dataset_product_health_gold Catalog lineage 대기",
    },
    {
      module: "M6",
      label: "SQL evidence",
      state: queryReady ? "ready" : readiness.status === "checking" ? "unknown" : "blocked",
      detail: queryReady ? "readonly SQL + local fallback 실행 가능" : "Product Health SQL success smoke 대기",
    },
    {
      module: "M1",
      label: "Browser smoke",
      state: "ready",
      detail: "CTA/readiness UI smoke 가능, 실제 SQL success는 upstream 준비 후 재확인",
    },
  ];
}

function catalogQualityRows(catalog) {
  return Object.entries(catalog?.metrics?.quality || {}).map(([key, value]) => [
    key,
    formatMetric(value),
  ]);
}

function catalogSchemaRows(catalog) {
  return (catalog?.schema?.fields || []).map((field) => [
    field.name,
    field.type,
    formatMetric(field.nullable),
  ]);
}

function catalogLineageNodes(catalog) {
  const lineage = catalog?.lineage || {};
  return [
    ["Source", (lineage.source_ids || []).join(", ") || "-"],
    ["Upstream", (lineage.upstream_datasets || []).join(", ") || "-"],
    ["Pipeline", lineage.pipeline_id || "-"],
    ["Run", lineage.run_id || "-"],
    ["Dataset", catalog?.dataset_id || "-"],
  ];
}

function RunStatusPage({ navigate }) {
  const [executor, setExecutor] = useState("local_runner");
  const [runState, setRunState] = useState({
    error: "",
    loading: false,
    run: null,
  });
  const [catalogState, setCatalogState] = useState({
    catalog: null,
    error: "",
    loading: false,
  });

  const currentRun = runState.run;
  const currentCatalog = catalogState.catalog;
  const currentTaskResults = currentRun?.task_results || [];
  const currentOutputs = currentRun?.outputs || [];
  const interpretation = runInterpretation(currentRun, currentCatalog);
  const catalogMatchesRun = Boolean(currentRun?.run_id && currentCatalog?.lineage?.run_id === currentRun.run_id);
  const fallback = isFallbackRun(currentRun);
  const learningChecks = buildM5LearningChecks(currentRun, currentCatalog);
  const narrative = buildM5Narrative(currentRun, currentCatalog);

  async function loadWeek2Catalog() {
    setCatalogState((current) => ({ ...current, error: "", loading: true }));
    try {
      const catalog = await getWeek2Catalog(WEEK2_DEFAULT_DATASET_ID);
      setCatalogState({ catalog, error: "", loading: false });
      return catalog;
    } catch (error) {
      setCatalogState((current) => ({
        catalog: current.catalog,
        error: error.message,
        loading: false,
      }));
      return null;
    }
  }

  async function executeWeek2Run() {
    setRunState({ error: "", loading: true, run: currentRun });
    try {
      const run = await triggerWeek2Run(WEEK2_DEFAULT_PIPELINE_ID, {
        executor,
        triggeredBy: executor === "airflow" ? "m5_airflow_demo" : "m5_local_demo",
      });
      setRunState({ error: "", loading: false, run });
      await loadWeek2Catalog();
    } catch (error) {
      setRunState({ error: error.message, loading: false, run: currentRun });
    }
  }

  async function refreshWeek2Evidence() {
    setRunState({ error: "", loading: true, run: currentRun });
    try {
      const run = currentRun?.run_id ? await getWeek2Run(currentRun.run_id) : currentRun;
      setRunState({ error: "", loading: false, run });
      await loadWeek2Catalog();
    } catch (error) {
      setRunState({ error: error.message, loading: false, run: currentRun });
      await loadWeek2Catalog();
    }
  }

  return (
    <div className="page-stack m5-demo-page">
      <PageHeader
        title="M5 데모: 실행 결과가 Catalog가 되는 과정"
        body="M5의 핵심은 workflow를 실행하고, 그 결과가 output과 Catalog metadata로 이어졌는지 증명하는 것입니다."
        actionLabel="Catalog 화면"
        onAction={() => navigate("/catalog")}
      />

      <section className="m5-focus-hero">
        <div className="m5-focus-copy">
          <p className="eyebrow">M5 핵심 기능</p>
          <h3>workflow를 실행해서 `ExecutionResult`를 만들고, 그 output을 `CatalogMetadata`로 등록합니다.</h3>
          <p>
            이 데모에서 외워야 할 것은 많지 않습니다. 같은 `run_id`가 실행 결과, output,
            catalog lineage까지 이어지면 M5 독립 기능은 성공적으로 설명할 수 있습니다.
          </p>
        </div>
        <M5EssentialList />
      </section>

      <M5CoreFlowMap run={currentRun} catalog={currentCatalog} />

      <section className="m5-control-panel m5-run-console">
        <div className="m5-section-heading">
          <div>
            <p className="eyebrow">실험 1</p>
            <h3>executor를 고르고 run_id를 만듭니다</h3>
          </div>
          <span className={`badge ${runBadgeClass(currentRun?.status)}`}>{currentRun?.status || "not_run"}</span>
        </div>
        <div className="m5-executor-grid" role="radiogroup" aria-label="M5 executor 선택">
          {m5ExecutorOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`m5-executor-option ${executor === option.id ? "active" : ""}`}
              onClick={() => setExecutor(option.id)}
              aria-pressed={executor === option.id}
            >
              <span className="m5-option-icon">
                {option.id === "airflow" ? <Network size={18} /> : <ServerCog size={18} />}
              </span>
              <strong>{option.title}</strong>
              <small>{option.detail}</small>
              <em>{option.badge}</em>
            </button>
          ))}
        </div>
        <div className="m5-action-row">
          <button type="button" className="primary-action" onClick={executeWeek2Run} disabled={runState.loading}>
            {runState.loading ? <Loader2 size={16} /> : <Play size={16} />}
            {runState.loading ? "실행 중" : `${executor} 실행`}
          </button>
          <button type="button" className="ghost-action" onClick={refreshWeek2Evidence} disabled={runState.loading || catalogState.loading}>
            <RefreshCw size={16} />
            evidence 새로고침
          </button>
        </div>
      </section>

      {runState.error ? (
        <EmptyState
          icon={AlertCircle}
          title="M5 실행 결과를 불러오지 못했습니다"
          body={runState.error}
        />
      ) : null}

      <section className={`m5-interpretation ${interpretation.tone}`}>
        <div className="m5-interpretation-icon">
          {interpretation.tone === "success" ? <CheckCircle2 size={22} /> : interpretation.tone === "warning" ? <AlertCircle size={22} /> : <BookOpen size={22} />}
        </div>
        <div>
          <p className="eyebrow">Result interpretation</p>
          <h3>{interpretation.title}</h3>
          <p>{interpretation.body}</p>
        </div>
      </section>

      {currentRun ? (
        <section className="demo-handoff-panel">
          <div>
            <p className="eyebrow">Next demo step</p>
            <h3>CatalogMetadata 확인으로 이동</h3>
            <p>{currentRun.run_id} 실행 결과가 만든 dataset metadata를 확인한 뒤 AI Query로 이어갑니다.</p>
          </div>
          <div className="handoff-actions">
            <button type="button" className="primary-action" onClick={() => navigate(WEEK2_DEFAULT_CATALOG_DETAIL_URL)}>
              Catalog detail
              <ArrowRight size={16} />
            </button>
            <button type="button" className="ghost-action" onClick={() => navigate("/ask")}>
              AI Query
              <MessageSquareText size={16} />
            </button>
          </div>
        </section>
      ) : null}

      <M5VerdictPanel checks={learningChecks} />
      <M5NarrativePanel sentences={narrative} />

      <section className="m5-evidence-section m5-compact-workflow">
        <div className="m5-section-heading">
          <div>
            <p className="eyebrow">실험 2</p>
            <h3>처리 흐름은 5단계로만 읽습니다</h3>
          </div>
          <span className={`badge ${fallback ? "orange" : "blue"}`}>{fallback ? "fallback visible" : "runner evidence"}</span>
        </div>
        <M5WorkflowTimeline taskResults={currentTaskResults} />
      </section>

      <section className="m5-two-column m5-evidence-layout">
        <M5EvidenceBoard
          run={currentRun}
          catalog={currentCatalog}
          taskResults={currentTaskResults}
          outputs={currentOutputs}
          catalogMatchesRun={catalogMatchesRun}
        />

        <CatalogEvidencePanel
          catalog={currentCatalog}
          loading={catalogState.loading}
          error={catalogState.error}
          currentRunId={currentRun?.run_id}
          onRefresh={loadWeek2Catalog}
        />
      </section>

      {currentRun?.logs?.length ? (
        <section className="m5-evidence-section">
          <div className="m5-section-heading">
            <div>
              <p className="eyebrow">Step 4</p>
              <h3>로그로 성공과 fallback을 구분합니다</h3>
            </div>
            <HelpCircle size={18} />
          </div>
          <div className="run-log-list m5-run-log-list">
            {currentRun.logs.map((log, index) => (
              <p key={`${log.level}-${index}`}>
                <strong>{formatMetric(log.level, "info")}</strong>
                <span>{formatMetric(log.message)}</span>
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="m5-detail-drawer">
        <div className="m5-section-heading">
          <div>
            <p className="eyebrow">필요할 때만</p>
            <h3>원본 JSON으로 화면 값을 검산합니다</h3>
          </div>
          <button type="button" className="ghost-action" onClick={() => navigate("/etl-visual")}>
            <Route size={16} />
            workflow canvas
          </button>
        </div>
        <div className="m5-raw-section">
          <RawJsonBlock title="ExecutionResult raw JSON" value={currentRun} />
          <RawJsonBlock title="CatalogMetadata raw JSON" value={currentCatalog} />
        </div>
      </section>
    </div>
  );
}

function M5EssentialList() {
  return (
    <div className="m5-essential-list" aria-label="M5 필수 학습 항목">
      {m5MustKnowItems.map((item) => (
        <article key={item.title}>
          <CheckCircle2 size={16} />
          <div>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function M5CoreFlowMap({ run, catalog }) {
  const output = run?.outputs?.[0];
  const catalogRunId = catalog?.lineage?.run_id;
  const values = {
    "WorkflowDefinition": WEEK2_DEFAULT_PIPELINE_ID,
    "Runner": run ? `${run.executor} / ${run.status}` : "실행 전",
    "Output Artifact": output?.dataset_id || "실행 후 확인",
    "CatalogMetadata": catalogRunId ? `lineage: ${catalogRunId}` : "Catalog 대기",
  };

  return (
    <section className="m5-core-flow">
      <div className="m5-section-heading">
        <div>
          <p className="eyebrow">먼저 이 그림만 이해하세요</p>
          <h3>M5는 4칸짜리 흐름입니다</h3>
        </div>
      </div>
      <div className="m5-core-flow-grid">
        {m5CoreFlow.map((step, index) => {
          const Icon = step.icon;
          return (
            <article className="m5-core-flow-card" key={step.title}>
              <span className="m5-core-index">{index + 1}</span>
              <span className="m5-core-icon"><Icon size={18} /></span>
              <p className="eyebrow">{step.eyebrow}</p>
              <h4>{step.title}</h4>
              <p>{step.plain}</p>
              <strong>{values[step.title]}</strong>
              <small>봐야 할 값: {step.focus}</small>
              {index < m5CoreFlow.length - 1 ? <ArrowRight className="m5-core-arrow" size={18} /> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function M5VerdictPanel({ checks }) {
  return (
    <section className="m5-verdict-panel">
      <div className="m5-section-heading">
        <div>
          <p className="eyebrow">실험 결과 판정</p>
          <h3>이 4개만 확인하면 됩니다</h3>
        </div>
      </div>
      <div className="m5-verdict-grid">
        {checks.map((check) => (
          <M5CheckCard key={check.id} check={check} />
        ))}
      </div>
    </section>
  );
}

function M5CheckCard({ check }) {
  const Icon = check.state === "pass" ? CheckCircle2 : check.state === "warn" ? AlertCircle : CircleDot;
  return (
    <article className={`m5-check-card ${check.state}`}>
      <div>
        <Icon size={18} />
        <span>{checkStateLabel(check.state)}</span>
      </div>
      <h4>{check.title}</h4>
      <strong>{check.value}</strong>
      <p>{check.detail}</p>
    </article>
  );
}

function M5NarrativePanel({ sentences }) {
  return (
    <section className="m5-narrative-panel">
      <div>
        <p className="eyebrow">학습 목표</p>
        <h3>이 세 문장을 말할 수 있으면 데모를 이해한 것입니다</h3>
      </div>
      <ol>
        {sentences.map((sentence) => (
          <li key={sentence}>{sentence}</li>
        ))}
      </ol>
    </section>
  );
}

function M5EvidenceBoard({ run, catalog, taskResults, outputs, catalogMatchesRun }) {
  const output = outputs[0];
  const fallbackSignal = run ? (isFallbackRun(run) ? "fallback signal 있음" : "fallback signal 없음") : "실행 전";
  const evidenceRows = [
    ["run_id", formatMetric(run?.run_id), "모든 evidence를 묶는 기준"],
    ["status", formatMetric(run?.status, "not_run"), statusMeaning(run)],
    ["input rows", formatMetric(run?.row_count), "ExecutionResult.row_count"],
    ["output", formatMetric(output?.dataset_id), formatMetric(output?.uri, "output URI 대기")],
    ["catalog lineage", catalogMatchesRun ? "current run" : formatMetric(catalog?.lineage?.run_id, "not current"), "CatalogMetadata.lineage.run_id"],
    ["fallback/log", fallbackSignal, "logs에서 falling back 여부 확인"],
  ];

  return (
    <section className="m5-evidence-section">
      <div className="m5-section-heading">
        <div>
          <p className="eyebrow">핵심 증거</p>
          <h3>숫자보다 먼저 evidence 출처를 봅니다</h3>
        </div>
        <Terminal size={18} />
      </div>
      <DataTable columns={["항목", "현재 값", "의미"]} rows={evidenceRows} />
      {run ? (
        <details className="m5-task-detail">
          <summary>task_results 세부 보기</summary>
          <DataTable
            columns={["node", "status", "attempt", "rows", "bytes", "error"]}
            rows={(taskResults.length ? taskResults : [{ node_id: "-", status: "-", attempt: "-", row_count: "-", bytes: "-", error: "-" }]).map((task) => [
              formatMetric(task.node_id),
              formatMetric(task.status),
              formatMetric(task.attempt),
              formatMetric(task.row_count),
              formatMetric(task.bytes),
              formatMetric(task.error),
            ])}
          />
        </details>
      ) : (
        <EmptyState
          icon={MonitorCheck}
          title="아직 실행 증거가 없습니다"
          body="먼저 local_runner를 실행해서 run_id와 output을 만듭니다."
        />
      )}
    </section>
  );
}

function LearningCard({ icon: Icon, title, body }) {
  return (
    <article className="m5-learning-card">
      <span><Icon size={18} /></span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function EvidenceMetric({ title, value, lesson }) {
  return (
    <article className="m5-metric-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{lesson}</span>
    </article>
  );
}

function M5WorkflowTimeline({ taskResults }) {
  return (
    <div className="m5-workflow-timeline">
      {m5WorkflowLearningSteps.map((step, index) => {
        const task = findTaskForStep(taskResults, step.id);
        const status = task?.status || (taskResults.length ? "not_reported" : "waiting");
        return (
          <article className={`m5-timeline-step ${status}`} key={step.id}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.type}</strong>
              <p>{step.label}</p>
              <small>{step.lesson}</small>
              <em>{status}</em>
            </div>
            {index < m5WorkflowLearningSteps.length - 1 ? <ChevronRight size={18} /> : null}
          </article>
        );
      })}
    </div>
  );
}

function CatalogEvidencePanel({ catalog, loading, error, currentRunId, onRefresh }) {
  const matchesRun = Boolean(currentRunId && catalog?.lineage?.run_id === currentRunId);
  const schemaRows = catalog?.schema?.fields?.map((field) => [
    field.name,
    field.type,
    String(field.nullable),
  ]) || [];

  return (
    <section className="m5-evidence-section">
      <div className="m5-section-heading">
        <div>
          <p className="eyebrow">Step 3-b</p>
          <h3>CatalogMetadata가 최신 run을 가리키는지 확인합니다</h3>
        </div>
        <button type="button" className="icon-link" onClick={onRefresh} disabled={loading} aria-label="Catalog evidence 새로고침">
          {loading ? <Loader2 size={16} /> : <RefreshCw size={16} />}
        </button>
      </div>
      {error ? (
        <EmptyState
          icon={AlertCircle}
          title="CatalogMetadata를 아직 읽지 못했습니다"
          body={error}
        />
      ) : null}
      {catalog ? (
        <>
          <div className={`m5-catalog-lineage ${matchesRun ? "matched" : "stale"}`}>
            <Layers3 size={18} />
            <div>
              <strong>{matchesRun ? "이번 run과 Catalog가 연결됐습니다" : "Catalog가 현재 run과 다를 수 있습니다"}</strong>
              <p>Catalog lineage run_id: {formatMetric(catalog.lineage?.run_id)}</p>
            </div>
          </div>
          <div className="m5-catalog-facts">
            <span>dataset: {formatMetric(catalog.dataset_id)}</span>
            <span>layer: {formatMetric(catalog.layer)}</span>
            <span>rows: {formatMetric(catalog.metrics?.row_count)}</span>
            <span>bytes: {formatMetric(catalog.metrics?.bytes)}</span>
          </div>
          <code>{formatMetric(catalog.s3_uri)}</code>
          <p className="m5-path-note">local fallback path: {formatMetric(catalog.storage?.local_fallback_path)}</p>
          {schemaRows.length ? (
            <DataTable columns={["field", "type", "nullable"]} rows={schemaRows} />
          ) : null}
        </>
      ) : !error ? (
        <EmptyState
          icon={Database}
          title="Catalog evidence 대기 중"
          body="성공한 run이 있으면 M5 CatalogStore가 dataset_reviews_gold metadata를 저장합니다."
        />
      ) : null}
    </section>
  );
}

function RawJsonBlock({ title, value }) {
  return (
    <details className="m5-raw-json">
      <summary>
        <FileJson size={16} />
        {title}
      </summary>
      <pre>{compactJson(value)}</pre>
    </details>
  );
}

function CatalogPage({ navigate, focusedCatalogDatasetId = "" }) {
  const [selectedTag, setSelectedTag] = useState("전체");
  const [catalogDatasets, setCatalogDatasets] = useState([]);
  const [catalogDatasetPolicyState, setCatalogDatasetPolicyState] = useState(null);
  const [selectedCatalogDatasetId, setSelectedCatalogDatasetId] = useState("");
  const [catalogListState, setCatalogListState] = useState({ loading: true, error: "" });
  const tags = ["전체", "gold", "silver", "source"];
  const filteredCatalogDatasets = catalogDatasets.filter((dataset) => selectedTag === "전체" || catalogDatasetLayer(dataset) === selectedTag);
  const selectedCatalogDataset =
    catalogDatasets.find((dataset) => dataset.id === selectedCatalogDatasetId) || filteredCatalogDatasets[0] || catalogDatasets[0] || null;

  useEffect(() => {
    let isMounted = true;
    async function loadCatalogManagementBoundary() {
      setCatalogListState({ loading: true, error: "" });
      try {
        const datasets = await listCatalogDatasets();
        const policy = await getCatalogDatasetManagementPolicy().catch(() => null);
        if (!isMounted) return;
        setCatalogDatasets(datasets);
        setCatalogDatasetPolicyState(policy);
        setSelectedCatalogDatasetId((current) => {
          if (focusedCatalogDatasetId && datasets.some((dataset) => dataset.id === focusedCatalogDatasetId)) {
            return focusedCatalogDatasetId;
          }
          return current || datasets[0]?.id || "";
        });
        setCatalogListState({ loading: false, error: "" });
      } catch (error) {
        if (!isMounted) return;
        setCatalogDatasets([]);
        setCatalogDatasetPolicyState(null);
        setCatalogListState({ loading: false, error: error.message });
      }
    }
    loadCatalogManagementBoundary();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        title="데이터 카탈로그"
        body="등록된 분석용 데이터셋을 찾고, 스키마/경로/lineage를 확인한 뒤 AI Query에 넘기는 읽기 전용 목록입니다."
        actionLabel={catalogListState.loading ? "조회 중" : "새로고침"}
        onAction={async () => {
          setCatalogListState({ loading: true, error: "" });
          try {
            const datasets = await listCatalogDatasets();
            const policy = await getCatalogDatasetManagementPolicy().catch(() => null);
            setCatalogDatasets(datasets);
            setCatalogDatasetPolicyState(policy);
            setSelectedCatalogDatasetId((current) => {
              if (focusedCatalogDatasetId && datasets.some((dataset) => dataset.id === focusedCatalogDatasetId)) {
                return focusedCatalogDatasetId;
              }
              return current || datasets[0]?.id || "";
            });
            setCatalogListState({ loading: false, error: "" });
          } catch (error) {
            setCatalogListState({ loading: false, error: error.message });
          }
        }}
      />
      <section className="catalog-purpose-panel">
        <article>
          <Database size={18} />
          <div>
            <strong>무엇을 보여주나</strong>
            <p>Gold Dataset의 이름, row count, 파일 경로, 스키마를 확인합니다.</p>
          </div>
        </article>
        <article>
          <GitBranch size={18} />
          <div>
            <strong>왜 필요한가</strong>
            <p>이 데이터가 어떤 job/run에서 만들어졌는지 lineage 근거를 남깁니다.</p>
          </div>
        </article>
        <article>
          <MessageSquareText size={18} />
          <div>
            <strong>다음에 뭘 하나</strong>
            <p>선택한 카탈로그 데이터셋을 AI Query의 read-only context로 사용합니다.</p>
          </div>
        </article>
      </section>
      <div className="filter-row">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={selectedTag === tag ? "selected" : ""}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {catalogListState.error ? (
        <EmptyState
          icon={AlertCircle}
          title="CatalogDataset 목록을 불러오지 못했습니다"
          body={catalogListState.error}
        />
      ) : null}
      {focusedCatalogDatasetId && !catalogListState.loading && !catalogListState.error && !catalogDatasets.some((dataset) => dataset.id === focusedCatalogDatasetId) ? (
        <p className="runtime-warning">
          AI Query evidence가 가리킨 CatalogDataset `{focusedCatalogDatasetId}`을 현재 카탈로그 목록에서 찾지 못했습니다.
        </p>
      ) : null}
      {catalogListState.loading ? (
        <EmptyState icon={Loader2} title="CatalogDataset 조회 중" body="publish된 데이터셋 metadata를 확인하고 있습니다." />
      ) : null}
      {!catalogListState.loading && !catalogListState.error && filteredCatalogDatasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title={`${selectedTag} 카탈로그 데이터셋이 없습니다`}
          body="실행 기록에서 성공한 Gold Build 결과를 Catalog에 등록하면 이 목록에 표시됩니다."
        />
      ) : null}
      {filteredCatalogDatasets.length ? (
        <section className="catalog-dataset-list" aria-label="registered catalog datasets">
          {filteredCatalogDatasets.map((dataset) => {
            const isSelected = selectedCatalogDataset?.id === dataset.id;
            return (
              <article key={dataset.id} className={`catalog-dataset-card ${isSelected ? "selected" : ""}`}>
                <header>
                  <div className="table-title-line">
                    <Table2 size={20} />
                    <div>
                      <strong>{dataset.name}</strong>
                      <p>{dataset.id}</p>
                    </div>
                  </div>
                  <span className="badge green">{catalogDatasetLayer(dataset)}</span>
                </header>
                <div className="catalog-card-facts">
                  <span>rows {formatMetric(dataset.row_count)}</span>
                  <span>schema {dataset.schema?.length || 0} fields</span>
                  <span>{dataset.source_type || "catalog dataset"}</span>
                </div>
                <code>{dataset.path}</code>
                <div className="catalog-card-actions">
                  <button type="button" className="ghost-action" onClick={() => setSelectedCatalogDatasetId(dataset.id)}>
                    상세 보기
                    <Search size={15} />
                  </button>
                  <button type="button" className="primary-action" onClick={() => navigate("/ask")}>
                    AI Query
                    <MessageSquareText size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
      {selectedCatalogDataset ? (
        <>
          <section className="catalog-selected-panel">
            <div>
              <p className="eyebrow">Selected CatalogDataset</p>
              <h3>{selectedCatalogDataset.name}</h3>
              <p>{selectedCatalogDataset.path}</p>
            </div>
            <span className="badge green">read-only</span>
          </section>
          <div className="grid three">
            <InfoCard title="Layer" value={catalogDatasetLayer(selectedCatalogDataset)} detail={selectedCatalogDataset.source_type} />
            <InfoCard title="Rows" value={formatMetric(selectedCatalogDataset.row_count)} detail="registered evidence" />
            <InfoCard title="Schema" value={`${selectedCatalogDataset.schema?.length || 0} fields`} detail="AI Query column context" />
          </div>
          <section className="contract-panel">
            <div>
              <p className="eyebrow">Schema preview</p>
              <h3>질문 가능한 컬럼</h3>
              <p>AI Query는 이 컬럼 목록을 근거로 read-only SQL을 구성합니다.</p>
            </div>
            <div className="catalog-schema-chips">
              {(selectedCatalogDataset.schema || []).slice(0, 12).map((field) => (
                <span key={field.name}>
                  {field.name}
                  <small>{field.type}</small>
                </span>
              ))}
            </div>
          </section>
          <DataTable columns={["field", "type"]} rows={catalogDatasetSchemaRows(selectedCatalogDataset)} />
          <DataTable columns={["sample key", "value"]} rows={catalogDatasetSampleRows(selectedCatalogDataset)} />
        </>
      ) : null}
      <details className="catalog-policy-details">
        <summary>관리 정책 보기</summary>
        <CatalogDatasetManagementPolicyPanel policy={catalogDatasetPolicyState} publishedCount={catalogDatasets.length} />
      </details>
    </div>
  );
}

function catalogDatasetLayer(dataset) {
  const text = `${dataset?.name || ""} ${dataset?.path || ""} ${dataset?.source_type || ""}`.toLowerCase();
  if (text.includes("gold") || text.includes("target_dataset")) return "gold";
  if (text.includes("silver")) return "silver";
  return "source";
}

function catalogDatasetSchemaRows(dataset) {
  return (dataset?.schema || []).map((field) => [field.name, field.type]);
}

function catalogDatasetSampleRows(dataset) {
  const firstSample = dataset?.sample?.[0] || {};
  return Object.entries(firstSample)
    .slice(0, 10)
    .map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : formatMetric(value)]);
}

function CatalogDetailShell({ navigate }) {
  const [tab, setTab] = useState("lineage");
  const { catalogState, refreshCatalog } = useWeek2CatalogState();
  const catalog = catalogState.catalog;
  const tabs = [
    ["lineage", "리니지(데이터 계보)", GitBranch],
    ["quality", "품질 검사 리포트", ShieldCheck],
    ["governance", "거버넌스 설정", Wrench],
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title={catalog?.name || m1CatalogPlaceholder.name}
        body={catalog ? `${catalog.dataset_id} CatalogMetadata detail입니다.` : "Catalog detail과 lineage/quality/governance tab shell입니다."}
        actionLabel={catalogState.loading ? "조회 중" : "목록으로"}
        onAction={() => (catalogState.loading ? refreshCatalog() : navigate("/catalog"))}
      />
      {catalogState.error ? (
        <EmptyState
          icon={AlertCircle}
          title="CatalogMetadata를 불러오지 못했습니다"
          body="아직 successful Week2 run이 없을 수 있습니다. /etl에서 로컬 runner 실행 후 다시 확인하세요."
        />
      ) : null}
      {catalogState.loading ? (
        <EmptyState icon={Loader2} title="Catalog detail 조회 중" body={WEEK2_DEFAULT_DATASET_ID} />
      ) : null}
      {catalog ? (
        <div className="grid three">
          <InfoCard title="Dataset" value={catalog.dataset_id} detail={catalog.layer} />
          <InfoCard title="Storage" value={catalog.storage?.profile} detail={catalog.storage?.prefix} />
          <InfoCard title="Updated" value={catalog.updated_at} detail={catalog.version} />
        </div>
      ) : null}
      {catalog ? (
        <section className="demo-handoff-panel">
          <div>
            <p className="eyebrow">Next demo step</p>
            <h3>M6 AI Query로 근거 확인</h3>
            <p>{catalog.dataset_id}의 schema, metrics, lineage를 evidence로 사용해 질문 결과를 확인합니다.</p>
          </div>
          <div className="handoff-actions">
            <button type="button" className="primary-action" onClick={() => navigate("/ask")}>
              AI Query 실행
              <ArrowRight size={16} />
            </button>
            <button type="button" className="ghost-action" onClick={() => navigate("/runs")}>
              Run으로 돌아가기
              <ListChecks size={16} />
            </button>
          </div>
        </section>
      ) : null}
      <section className="detail-tabs">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </section>
      {tab === "lineage" ? <LineageShell catalog={catalog} /> : null}
      {tab === "quality" && catalog ? (
        <>
          <div className="grid three">
            <InfoCard title="schema status" value={catalog.metrics?.quality?.schema_match} detail="M5 quality fact" />
            <InfoCard title="row count checked" value={formatMetric(catalog.metrics?.quality?.row_count_checked)} detail="M5 quality fact" />
            <InfoCard title="query allowed" value={formatMetric(catalog.query?.allow_readonly_sql)} detail={catalog.query?.table_name} />
          </div>
          <DataTable columns={["quality fact", "value"]} rows={catalogQualityRows(catalog)} />
        </>
      ) : null}
      {tab === "quality" && !catalog && !catalogState.loading ? (
        <div className="grid three">
          <InfoCard title="schema status" value="연결 대기" detail="M5 quality output 필요" />
          <InfoCard title="row count checked" value="연결 대기" detail="ExecutionResult quality metric" />
          <InfoCard title="query allowed" value="연결 대기" detail="CatalogMetadata 필요" />
        </div>
      ) : null}
      {tab === "governance" ? (
        <DataTable
          columns={["policy", "state", "owner"]}
          rows={[
            ["mask customer identifiers", "연결 대기", "M6/RBAC"],
            ["monthly aggregate only", "연결 대기", "M5/M6"],
            ["allow readonly SQL", formatMetric(catalog?.query?.allow_readonly_sql, "disabled"), "M6"],
          ]}
        />
      ) : null}
      {catalog ? (
        <section className="contract-panel">
          <div>
            <p className="eyebrow">Local fallback path</p>
            <code>{catalog.storage?.local_fallback_path}</code>
          </div>
          <p>{catalog.s3_uri}</p>
        </section>
      ) : null}
    </div>
  );
}

function LineageShell({ catalog }) {
  const lineageRows = catalog
    ? catalogLineageNodes(catalog)
    : [
        ["Source", "M5 연결 대기"],
        ["Raw placeholder", "M5 연결 대기"],
        ["Prepared placeholder", "M5 연결 대기"],
        ["Quality Gate", "M5 연결 대기"],
        ["Output placeholder", m1CatalogPlaceholder.dataset_id],
      ];

  return (
    <section className="lineage-shell">
      {lineageRows.map(([label, detail], index) => (
        <article key={label}>
          <span>{index + 1}</span>
          <strong>{label}</strong>
          <p>{detail}</p>
        </article>
      ))}
    </section>
  );
}

function AiQueryPage({ navigate, setNotice }) {
  const [restoredQuerySession] = useState(() => readStoredAiQuerySession());
  const [queryText, setQueryText] = useState(
    restoredQuerySession.question || "리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군을 찾아줘",
  );
  const [queryState, setQueryState] = useState({
    result: restoredQuerySession.result || null,
    error: "",
    loading: false,
  });
  const [viewMode, setViewMode] = useState(restoredQuerySession.viewMode || "table");
  const queryResult = queryState.result?.query_result;
  const rows = queryResult?.rows || queryState.result?.rows || [];
  const columns = queryResult?.columns?.length
    ? queryResult.columns.map((column) => column.name)
    : Object.keys(rows[0] || {});
  const evidence = queryState.result?.evidence || [];
  const route = queryState.result?.route;
  const retrievalTrace = Array.isArray(queryState.result?.retrieval_trace)
    ? queryState.result.retrieval_trace
    : [];
  const routeIsExecutableSql = route === "sql" && queryState.result?.status === "succeeded";
  const productHealthAnswer = productHealthAnswerSummary(queryState.result);
  const selectedCatalogDatasetId = querySelectedCatalogDatasetId(queryState.result);
  const displaySql = queryState.result
    ? queryDisplaySql(queryResult?.sql ?? queryState.result.sql)
    : m1AiQueryPlaceholder.sql;
  const answerSummary = splitQueryAnswerSummary(queryState.result?.summary || queryState.result?.status);

  async function submitQuery(nextQuestion = queryText) {
    const question = nextQuestion.trim();
    if (!question) {
      setQueryState((previous) => ({ ...previous, error: "질문을 입력해야 합니다." }));
      setNotice("질문을 입력한 뒤 실행할 수 있습니다.");
      return;
    }

    setQueryText(question);
    setQueryState((previous) => ({ ...previous, error: "", loading: true }));
    try {
      const result = await askWeek2AiQuery(question);
      setQueryState({ result, error: "", loading: false });
      writeStoredAiQuerySession({ question, result, viewMode });
    } catch (error) {
      setQueryState((previous) => ({
        result: previous.result,
        error: error.message,
        loading: false,
      }));
    }
  }

  function changeViewMode(nextViewMode) {
    setViewMode(nextViewMode);
    if (queryState.result) {
      writeStoredAiQuerySession({ question: queryText, result: queryState.result, viewMode: nextViewMode });
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="AI Query"
        body="M6 AIQueryResult를 받아 SQL 실행 결과와 근거를 표시합니다."
        actionLabel={queryState.loading ? "실행 중" : "샘플 질문 실행"}
        onAction={() => submitQuery()}
      />
      <section className="ask-layout">
        <div className="question-box query-editor">
          <Search size={18} />
          <textarea
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            placeholder={m1AiQueryPlaceholder.question}
          />
          <button
            type="button"
            className="primary-action"
            onClick={() => submitQuery()}
            disabled={queryState.loading}
          >
            {queryState.loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            {queryState.loading ? "실행 중" : "질문 실행"}
          </button>
          {queryState.error ? <p className="form-error">{queryState.error}</p> : null}
          <div className="demo-question-groups" aria-label="Product Health demo question candidates">
            {demoQuestionGroups.map((group) => (
              <section key={group.title} className={`demo-question-group ${group.tone}`}>
                <div className="demo-question-heading">
                  <span>{group.title}</span>
                  <small>{group.tone === "warning" ? "blocked route" : group.tone === "primary" ? "SQL route" : "supporting path"}</small>
                </div>
                <div className="demo-question-list">
                  {group.questions.map(([intent, question]) => (
                    <button
                      key={intent}
                      type="button"
                      className={`ghost-action ${group.tone === "warning" ? "warning" : ""}`}
                      onClick={() => submitQuery(question)}
                      disabled={queryState.loading}
                    >
                      <Sparkles size={14} />
                      <span>{question}</span>
                      <small>{intent}</small>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="contract-panel query-summary-panel">
          <p className="eyebrow">AI Query answer</p>
          {!queryState.result ? (
            <div className="query-empty-state">
              <MessageSquareText size={22} />
              <h3>질문을 실행하면 답변이 표시됩니다</h3>
              <p>왼쪽에서 Product Health 질문을 선택하거나 직접 입력하면 SQL 결과, 요약, 근거가 이곳에 정리됩니다.</p>
            </div>
          ) : (
            <>
              <div className="query-status-row">
                <h3>{answerSummary.headline}</h3>
                {queryState.result.guardrail ? (
                  <span className={`badge ${queryStatusBadgeClass(queryState.result)}`}>
                    {queryState.result.guardrail.validation_status}
                  </span>
                ) : null}
              </div>
              {queryState.result.guardrail?.failure_message ? (
                <p className="form-error">{queryState.result.guardrail.failure_message}</p>
              ) : null}
              {productHealthAnswer ? <ProductHealthAnswerPanel summary={productHealthAnswer} compact /> : null}
              {answerSummary.evidenceFacts.length ? (
                <div className="query-evidence-summary" aria-label="AI Query evidence summary">
                  <span>근거 요약</span>
                  <div>
                    {answerSummary.evidenceFacts.map(([label, value]) => (
                      <p key={label}>
                        <strong>{label}</strong>
                        {value}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
              {route && !routeIsExecutableSql ? (
                <p className="runtime-warning">
                  Query route가 `{route}`로 분기되어 SQL 성공 결과처럼 처리하지 않습니다.
                </p>
              ) : null}
              {isMissingLocalPathError(queryState.error) ? (
                <p className="runtime-warning">
                  Catalog output file이 아직 없어서 SQL 실행이 차단됐습니다. 먼저 실행/모니터링에서 Week2 workflow를 성공시킨 뒤 다시 질문하세요.
                </p>
              ) : null}
              <details className="query-debug-details">
                <summary>SQL / 실행 정보</summary>
                <code>{displaySql}</code>
                <div className="runtime-check-list compact">
                  <RuntimeCheck label="DuckDB runtime" ready={isDuckDbEngine(queryResult?.engine)} />
                  <RuntimeCheck label={`route=${route || "pending"}`} ready={routeIsExecutableSql} />
                  <RuntimeCheck label="SQL rows" ready={rows.length > 0} />
                  <RuntimeCheck label="evidence" ready={evidence.length > 0} />
                </div>
                <p>Chart spec: {formatChartSpec(queryState.result?.chart_spec)}</p>
              </details>
              <div className="segmented-control">
                {["table", "chart"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={viewMode === mode ? "active" : ""}
                    onClick={() => changeViewMode(mode)}
                  >
                    {mode === "table" ? <Table2 size={14} /> : <BarChart3 size={14} />}
                    {mode}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      {queryState.result ? (
        <section className="ask-result-stack">
          <div className="grid three">
            <InfoCard
              title="Dataset"
              value={queryState.result.selected_datasets?.[0]?.dataset_id}
              detail={queryState.result.selected_datasets?.[0]?.reason}
            />
            <InfoCard title="Engine" value={queryRuntimeLabel(queryResult)} detail={queryRuntimeDetail(queryResult)} />
            <InfoCard
              title="Route"
              value={route || "pending"}
              detail={routeDetail(queryState.result)}
            />
            <InfoCard
              title="Rows"
              value={formatMetric(queryResult?.row_count ?? rows.length)}
              detail={`${formatMetric(queryResult?.duration_ms)} ms / ${formatMetric(queryResult?.executed_at)}`}
            />
          </div>
          <section className="demo-handoff-panel">
            <div>
              <p className="eyebrow">Review loop</p>
              <h3>근거에서 run과 catalog로 돌아가기</h3>
              <p>AI Query 결과를 확인한 뒤 같은 세션에서 실행 결과와 CatalogMetadata를 다시 볼 수 있습니다.</p>
            </div>
            <div className="handoff-actions">
              <button type="button" className="ghost-action" onClick={() => navigate("/runs")}>
                Run Status
                <ListChecks size={16} />
              </button>
              <button
                type="button"
                className="primary-action"
                onClick={() => navigate("/catalog", { focusCatalogDatasetId: selectedCatalogDatasetId })}
                disabled={!selectedCatalogDatasetId}
              >
                Catalog detail
                <ArrowRight size={16} />
              </button>
            </div>
          </section>

          {viewMode === "table" ? (
            <DataTable
              columns={columns.length ? columns : ["result"]}
              rows={rows.length ? queryRows(rows, columns) : [["반환된 row가 없습니다."]]}
            />
          ) : (
            <section className="chart-spec-panel">
              <BarChart3 size={22} />
              <div>
                <strong>{queryState.result.chart_spec?.title || "Chart spec"}</strong>
                <p>
                  {formatMetric(queryState.result.chart_spec?.type)} / x:{" "}
                  {formatMetric(queryState.result.chart_spec?.x)} / y:{" "}
                  {formatMetric(queryState.result.chart_spec?.y)}
                </p>
              </div>
            </section>
          )}

          <RetrievalTracePanel trace={retrievalTrace} route={route} />

          <section className="evidence-grid">
            {evidence.map((item) => (
              <EvidenceCard key={`${item.dataset_id}:${item.run_id || item.s3_uri || item.table_name}`} evidence={item} />
            ))}
          </section>
        </section>
      ) : null}
    </div>
  );
}

function queryStatusBadgeClass(result) {
  if (result.status === "succeeded" && result.guardrail?.validation_status === "passed") return "green";
  if (result.status === "blocked" || result.guardrail?.validation_status === "blocked") return "orange";
  if (result.status === "failed" || result.guardrail?.validation_status === "failed") return "red";
  return "blue";
}

function querySelectedCatalogDatasetId(result) {
  return result?.selected_datasets?.[0]?.dataset_id || result?.evidence?.[0]?.dataset_id || "";
}

function readStoredAiQuerySession() {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.sessionStorage.getItem(AI_QUERY_SESSION_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return {};
    return {
      question: typeof parsed.question === "string" ? parsed.question : "",
      result: parsed.result && typeof parsed.result === "object" ? parsed.result : null,
      viewMode: parsed.viewMode === "chart" ? "chart" : "table",
    };
  } catch {
    return {};
  }
}

function writeStoredAiQuerySession({ question, result, viewMode }) {
  if (typeof window === "undefined" || !result) return;
  try {
    window.sessionStorage.setItem(
      AI_QUERY_SESSION_STORAGE_KEY,
      JSON.stringify({
        question,
        result,
        viewMode: viewMode === "chart" ? "chart" : "table",
      }),
    );
  } catch {
    // Session storage is a UX convenience only; query execution should never fail because of it.
  }
}

function queryRouteBadgeClass(route) {
  if (route === "sql") return "green";
  if (route === "unsupported") return "orange";
  if (route === "rag" || route === "hybrid") return "blue";
  return "gray";
}

function routeDetail(result) {
  if (!result?.route) return "M6 route 대기";
  if (result.route === "sql" && result.status === "succeeded") return "SQL runtime으로 실행됨";
  if (result.route === "unsupported") return "지원하지 않는 질문으로 SQL 실행 차단";
  return `${formatMetric(result.status)} 상태로 처리`;
}

function queryDisplaySql(sql) {
  if (typeof sql === "string" && sql.trim()) return sql;
  return "SQL not generated: blocked or unsupported route";
}

function isDuckDbEngine(engine) {
  return String(engine || "").toLowerCase() === "duckdb";
}

function queryRuntimeLabel(queryResult) {
  if (!queryResult?.engine) return "대기";
  return queryResult.engine;
}

function queryRuntimeDetail(queryResult) {
  if (!queryResult?.engine) return "질문 실행 후 runtime 표시";
  if (isDuckDbEngine(queryResult.engine)) return "M6 DuckDB 실제 SQL runtime";
  return "fallback 또는 test SqlEngineAdapter";
}

function isMissingLocalPathError(message) {
  return String(message || "").includes("local_path_missing");
}

function RuntimeCheck({ label, ready }) {
  return (
    <span className={`runtime-check ${ready ? "ready" : "pending"}`}>
      {ready ? <ShieldCheck size={13} /> : <AlertCircle size={13} />}
      {label}
    </span>
  );
}

function formatChartSpec(chartSpec) {
  if (!chartSpec) return m1AiQueryPlaceholder.chart_spec;
  return `${formatMetric(chartSpec.type)} / ${formatMetric(chartSpec.x)} -> ${formatMetric(chartSpec.y)}`;
}

function queryRows(rows, columns) {
  return rows.map((row) => columns.map((column) => formatMetric(row[column])));
}

function splitQueryAnswerSummary(summary) {
  const text = formatMetric(summary, "질문 결과");
  const [headline, evidenceText] = text.split(/\s*근거:\s*/);
  return {
    headline: headline.trim() || text,
    evidenceFacts: compactEvidenceFacts(evidenceText),
  };
}

function compactEvidenceFacts(evidenceText) {
  if (!evidenceText) return [];
  const preferredOrder = ["dataset", "run_id", "row_count", "schema"];
  const factsByKey = evidenceText.split(";").reduce((accumulator, part) => {
    const [rawKey, ...rawValue] = part.split("=");
    const key = rawKey?.trim();
    const value = rawValue.join("=").trim();
    if (!key || !value) return accumulator;
    accumulator[key] = key === "schema" ? `${value.split(",").filter(Boolean).length} fields` : value;
    return accumulator;
  }, {});

  return preferredOrder
    .filter((key) => factsByKey[key])
    .map((key) => [key, factsByKey[key]]);
}

function productHealthAnswerSummary(result) {
  if (!result || result.status !== "succeeded") return null;
  const datasetId = result.selected_datasets?.[0]?.dataset_id;
  if (datasetId !== PRODUCT_HEALTH_DATASET_ID) return null;
  const firstRow = result.rows?.[0] || result.query_result?.rows?.[0];
  if (!firstRow) return null;
  const evidence = result.evidence?.[0] || {};
  return {
    productId: firstRow.internal_product_id || firstRow.product_id || "-",
    title: firstRow.product_title || "-",
    scenario: firstRow.scenario_bucket || firstRow.demo_category_label || "-",
    riskDriver: firstRow.risk_driver || "-",
    riskScore: firstRow.risk_score,
    negativeReviewRate: firstRow.negative_review_rate,
    conversionRate: firstRow.conversion_rate,
    lateDeliveryRate: firstRow.late_delivery_rate,
    processedInputBytes: evidence.metrics?.processed_input_total_bytes,
    goldRows: evidence.metrics?.row_count,
    runId: evidence.run_id,
    tableName: evidence.table_name,
  };
}

function ProductHealthAnswerPanel({ summary, compact = false }) {
  const metrics = [
    ["위험 점수", summary.riskScore],
    ["부정 리뷰율", formatRate(summary.negativeReviewRate)],
    ["구매 전환율", formatRate(summary.conversionRate)],
    ["배송 지연율", formatRate(summary.lateDeliveryRate)],
    ["처리 입력", formatBytes(summary.processedInputBytes)],
    ["Gold rows", formatMetric(summary.goldRows)],
  ];

  return (
    <section className={`product-health-answer-panel ${compact ? "compact" : ""}`}>
      <header>
        <div>
          <p className="eyebrow">Answer summary</p>
          <h3>{summary.productId}</h3>
          <p>{summary.title}</p>
        </div>
        <span className="badge green">SQL grounded</span>
      </header>
      <div className="product-health-answer-meta">
        <span>{summary.scenario}</span>
        <span>{summary.riskDriver}</span>
        <span>run: {formatMetric(summary.runId)}</span>
        <span>table: {formatMetric(summary.tableName)}</span>
      </div>
      <div className="product-health-answer-metrics">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{formatMetric(value)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatRate(value) {
  if (typeof value !== "number") return value;
  return `${(value * 100).toFixed(1)}%`;
}

function formatBytes(value) {
  if (typeof value !== "number") return value;
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GiB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MiB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${value} B`;
}

function formatSnapshotCoverage(snapshot) {
  if (!snapshot) return "not created";
  if (snapshot.coverage_status === "input_exhausted_before_limit") return "source exhausted";
  if (snapshot.coverage_status === "bounded_sample_limit_reached") return "bounded sample";
  return snapshot.coverage_status || snapshot.snapshot_mode || "bounded sample";
}

function RetrievalTracePanel({ trace, route }) {
  return (
    <section className="retrieval-trace-panel">
      <header>
        <div>
          <p className="eyebrow">Retrieval trace</p>
          <h3>M6가 선택한 evidence 경로</h3>
        </div>
        <span className={`badge ${queryRouteBadgeClass(route)}`}>route={route || "pending"}</span>
      </header>
      {trace.length ? (
        <div className="retrieval-trace-list">
          {trace.map((item, index) => (
            <article key={`${item.source_type || "source"}:${item.source_id || index}:${item.evidence_index ?? index}`}>
              <div className="trace-node-icon">
                <Route size={16} />
              </div>
              <div>
                <div className="trace-title-row">
                  <strong>{formatMetric(item.source_id, `trace ${index + 1}`)}</strong>
                  <span className="badge slate">{formatMetric(item.source_type, "source")}</span>
                </div>
                <p>
                  score {formatMetric(item.score)} / evidence index {formatMetric(item.evidence_index)}
                </p>
                <small>matched terms: {formatTraceTerms(item.matched_terms)}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="trace-empty">retrieval_trace가 비어 있습니다. M1은 빈 trace를 성공 근거로 꾸미지 않습니다.</p>
      )}
    </section>
  );
}

function ProductHealthReadinessPanel({ readiness, onRefresh, loading, compact }) {
  return (
    <section className={`product-health-readiness ${readiness.status} ${compact ? "compact" : ""}`}>
      <header>
        <div>
          <p className="eyebrow">{readiness.eyebrow || "Dataset readiness"}</p>
          <h3>{readiness.title}</h3>
          <p>{readiness.body}</p>
        </div>
        <div className="product-health-actions">
          <span className={`badge ${productHealthBadgeClass(readiness.status)}`}>{readiness.status}</span>
          <button type="button" className="icon-link" onClick={onRefresh} disabled={loading} aria-label="Dataset readiness 새로고침">
            {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
          </button>
        </div>
      </header>
      <div className="product-health-checks">
        {readiness.checks.map(([label, state, detail]) => (
          <article key={label}>
            <RuntimeCheck label={label} ready={state === "ready"} />
            <span>{detail}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function DemoReadinessPanel({ items }) {
  return (
    <section className="demo-readiness-panel" aria-label="M1 demo readiness by module">
      <header>
        <div>
          <p className="eyebrow">Demo readiness</p>
          <h3>M2/M3/M5/M6/M1 발표 준비 상태</h3>
          <p>확인되지 않은 항목은 성공으로 표시하지 않고 다음 책임 영역을 그대로 보여줍니다.</p>
        </div>
      </header>
      <div className="demo-readiness-grid">
        {items.map((item) => (
          <article key={item.module} className={`demo-readiness-item ${item.state}`}>
            <div className="demo-readiness-title">
              <strong>{item.module}</strong>
              <span className={`badge ${demoReadinessBadgeClass(item.state)}`}>{item.state}</span>
            </div>
            <span>{item.label}</span>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function productHealthBadgeClass(status) {
  if (status === "ready") return "green";
  if (status === "partial" || status === "checking") return "orange";
  return "red";
}

function demoReadinessBadgeClass(state) {
  if (state === "ready") return "green";
  if (state === "blocked" || state === "not-ready") return "red";
  return "orange";
}

function formatTraceTerms(terms) {
  if (!Array.isArray(terms) || terms.length === 0) return "-";
  return terms.map((term) => formatMetric(term)).join(", ");
}

function EvidenceCard({ evidence }) {
  const schemaRows = (evidence.schema_fields || []).map((field) => [
    field.name,
    field.type,
    formatMetric(field.nullable),
  ]);
  const metricRows = Object.entries(evidence.metrics || {}).map(([key, value]) => [
    key,
    formatEvidenceValue(value),
  ]);
  const lineageRows = Object.entries(evidence.lineage || {}).map(([key, value]) => [
    key,
    formatEvidenceValue(value),
  ]);
  const evidenceStoragePath = evidence.storage?.local_fallback_path || evidence.storage?.local_path || "";

  return (
    <article className="evidence-card">
      <header>
        <div>
          <p className="eyebrow">Evidence</p>
          <h3>{evidence.dataset_id}</h3>
        </div>
        {evidence.table_name ? <span className="badge blue">{evidence.table_name}</span> : null}
      </header>
      <div className="evidence-facts">
        <span>run: {formatMetric(evidence.run_id)}</span>
        <span>freshness: {formatMetric(evidence.freshness)}</span>
        <span>terms: {(evidence.retrieval_terms || []).join(", ") || "-"}</span>
      </div>
      {evidenceStoragePath ? <code>{evidenceStoragePath}</code> : null}
      {evidence.s3_uri ? <code>{evidence.s3_uri}</code> : null}
      {schemaRows.length ? <DataTable columns={["field", "type", "nullable"]} rows={schemaRows} /> : null}
      {metricRows.length || lineageRows.length ? (
        <div className="grid two evidence-tables">
          {metricRows.length ? <DataTable columns={["metric", "value"]} rows={metricRows} /> : null}
          {lineageRows.length ? <DataTable columns={["lineage", "value"]} rows={lineageRows} /> : null}
        </div>
      ) : null}
    </article>
  );
}

function formatEvidenceValue(value) {
  if (Array.isArray(value)) return value.join(", ") || "-";
  if (value && typeof value === "object") return JSON.stringify(value);
  return formatMetric(value);
}

function DashboardPlaceholder() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        body="M6 chart와 insight detail이 붙을 자리입니다."
        actionLabel="연결 대기"
      />
      <EmptyState
        icon={Sparkles}
        title="Dashboard placeholder surface"
        body="현재 M1에서는 navigation shell만 보존하고 실제 dashboard query는 M6에서 연결합니다."
      />
    </div>
  );
}

function AdminPlaceholder() {
  return (
    <div className="page-stack">
      <PageHeader
        title="사용자/권한"
        body="기준 데모의 admin navigation 자리를 보존하되, 실제 권한 관리는 M1 범위 밖입니다."
        actionLabel="RBAC 연결 대기"
      />
      <EmptyState
        icon={ShieldCheck}
        title="권한 관리 기능은 연결 전입니다"
        body="fake admin 생성이나 mock login 없이 shell route만 유지합니다."
      />
    </div>
  );
}

function AiCopilotDock({ isOpen, onClose }) {
  return (
    <aside className={`ai-copilot-dock ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <header>
        <div className="copilot-icon">
          <Sparkles size={16} />
        </div>
        <div>
          <strong>AI 도우미</strong>
          <span>자연어 SQL 변환</span>
        </div>
        <button type="button" className="copilot-close" onClick={onClose} aria-label="AI 도우미 닫기">
          <X size={18} />
        </button>
      </header>
      <div className="copilot-empty">
        <div className="copilot-large-icon">
          <Sparkles size={26} />
        </div>
        <h3>AI SQL 도우미</h3>
        <p>자연어로 데이터에 대해 질문하면 SQL 쿼리를 생성합니다.</p>
        <button type="button">"품질 위험 점수가 높은 상품을 보여줘"</button>
        <button type="button">"부정 리뷰와 배송 지연이 함께 증가한 카테고리는?"</button>
        <button type="button">"전환율이 떨어진 상품의 근거 데이터를 요약해줘"</button>
      </div>
    </aside>
  );
}

function PageHeader({ title, body, actionLabel, onAction }) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      {actionLabel ? (
        <button type="button" className="ghost-action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </header>
  );
}

function ToastNotice({ message, isLeaving, onClose }) {
  return (
    <div className={`toast-notice ${isLeaving ? "leaving" : ""}`} role="status">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="알림 닫기">
        <X size={16} />
      </button>
    </div>
  );
}

function InfoCard({ title, value, detail }) {
  return (
    <article className="info-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <section className="empty-state">
      <Icon size={22} />
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </section>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join(":")}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
