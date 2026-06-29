// M1 static shell only. Replace these placeholders with real API state in M2-M6.
export const m1SourceConfigPlaceholder = {
  contract: "SourceConfig",
  tenant_id: "tenant_placeholder",
  source_id: "source_reviews_placeholder",
  source_type: "amazon_reviews_json",
  name: "Amazon Reviews JSON placeholder source",
  connection_ref: {
    kind: "local_file_or_minio_object",
    path_status: "pending_data_location_decision",
  },
  options: {
    sample_profile: "placeholder",
    format: "jsonl",
    sample_rows_decision: "M3 sample reader 구현 전 확정",
  },
};

// M1 static shell only. Replace with M3 schema inference response.
export const m1SchemaPreviewPlaceholder = {
  contract: "SchemaDefinition",
  schema_version: "schema_reviews_placeholder",
  dataset_id: "dataset_reviews_schema_placeholder",
  fields: [
    ["review_id", "string", "false", "none"],
    ["product_id", "string", "false", "none"],
    ["rating", "number", "true", "cast override"],
    ["review_text", "string", "true", "none"],
    ["review_time", "timestamp", "true", "cast override"],
    ["verified_purchase", "boolean", "true", "none"],
  ],
};

// M1 static shell only. Replace with M5 WorkflowDefinition and ExecutionResult state.
export const m1WorkflowPlaceholder = {
  contract: "WorkflowDefinition",
  pipeline_id: "pipeline_reviews_placeholder",
  nodes: [
    ["Source", "Amazon Reviews JSON", "M1/M3 source config"],
    ["Select/Filter", "필드 선택", "M5 workflow node"],
    ["Cast/Normalize", "rating, review_time 보정", "M3 schema output"],
    ["Aggregate", "product_id별 metric", "M5 workflow node"],
    ["Load", "dataset_reviews_output_placeholder", "M5 catalog handoff"],
  ],
};

// M1 static shell only. Replace with M5 CatalogMetadata.
export const m1CatalogPlaceholder = {
  contract: "CatalogMetadata",
  dataset_id: "dataset_reviews_output_placeholder",
  name: "Amazon Reviews Output Placeholder",
  layer: "output placeholder",
  s3_uri: "s3://asklake-placeholder/reviews/output/run_id=pending/",
  query_table: "reviews_output_pending",
  quality: "schema_match, row_count 확인 대기",
};

// M1 static shell only. Replace with M6 AIQueryResult and QueryResult.
export const m1AiQueryPlaceholder = {
  contract: "AIQueryResult",
  status: "M6 연결 대기",
  question: "Day 4 검증 질문 확정 전",
  sql: "SELECT product_id, review_count, average_rating FROM reviews_output_pending LIMIT 10",
  answer_metadata: {
    source: "internal",
    provider: "m6",
    fallback_used: false,
    fallback_reason: null,
    used_evidence_indexes: [],
    grounding_state: "blocked",
  },
  chart_spec: "bar(product_id, review_count)",
};

// M1 static shell only. Replace with M2-M4 connection/source API state.
export const m1ConnectionPlaceholders = [
  ["PostgreSQL 주문 DB", "postgres_order_transactions", "M2 연결 대기", "M2 Batch"],
  ["MongoDB 고객 프로필", "mongo_customer_profiles", "M3 연결 대기", "M3 JSON/Schema"],
  ["Kafka 주문 이벤트", "commerce.order.events", "M4 연결 대기", "M4 Kafka"],
  ["AskLake S3 Lake", "s3://asklake-placeholder/bronze/order_events", "M5 연결 대기", "M5 Catalog"],
];

// M1 static shell only. Replace with M5 run/catalog list state.
export const m1PipelinePlaceholders = [
  {
    name: "고객 주문 통합 Dataset Placeholder",
    owner: "데이터 엔지니어링 팀",
    type: "결과 데이터셋 placeholder",
    status: "M5 연결 대기",
    mode: "배치 예정",
    purpose: "MongoDB 고객 프로필 컬럼과 PostgreSQL 주문 컬럼을 user_id 기준으로 조인할 예정인 placeholder row입니다.",
    updated: "연결 전",
  },
  {
    name: "고객 주문 원본 Dataset Placeholder",
    owner: "데이터 엔지니어링 팀",
    type: "원본 데이터셋 placeholder",
    status: "M2 연결 대기",
    mode: "배치 예정",
    purpose: "MongoDB 고객 프로필과 주문 거래 PostgreSQL 데이터를 원본 형태로 적재할 예정인 placeholder row입니다.",
    updated: "연결 전",
  },
  {
    name: "mongo_customer_profiles",
    owner: "고객 플랫폼 팀",
    type: "수집 대상 placeholder",
    status: "M3 연결 대기",
    mode: "배치 예정",
    purpose: "MongoDB 고객 프로필 컬렉션에서 고객 등급과 지역 정보를 가져올 예정입니다.",
    updated: "연결 전",
  },
  {
    name: "postgres_order_transactions",
    owner: "주문 플랫폼 팀",
    type: "수집 대상 placeholder",
    status: "M2 연결 대기",
    mode: "배치 예정",
    purpose: "PostgreSQL 주문 테이블에서 주문 금액과 상태 컬럼을 가져올 예정입니다.",
    updated: "연결 전",
  },
];

// M1 static shell only. Replace module rows as real integration contracts land.
export const m1IntegrationRows = [
  ["M2 Batch", "batch source/run metrics", "ExecutionResult, CatalogMetadata"],
  ["M3 JSON/Schema", "schema preview/override", "SourceConfig, SchemaDefinition"],
  ["M4 Kafka", "streaming status/lag/throughput", "SourceConfig, ExecutionResult"],
  ["M5 Workflow/Catalog", "run status, logs, retry, lineage", "WorkflowDefinition, ExecutionResult, CatalogMetadata"],
  ["M6 RAG/AI Query", "question, evidence, SQL result, chart", "AIQueryResult, QueryResult"],
];

// M1 static shell only. Replace labels only if the product flow changes.
export const m1StartSteps = [
  ["소스 연결", "기존 연결 선택 또는 새 연결 생성", "source"],
  ["원본 데이터", "테이블, 컬렉션, 경로, 토픽 선택", "schema"],
  ["파이프라인 구성", "선택한 원본으로 캔버스 시작", "workflow"],
];
