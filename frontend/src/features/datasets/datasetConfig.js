export const demoSourceDatasets = [
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


export const sourceTypeOptions = [
  { id: "all", label: "전체", description: "모든 source dataset" },
  { id: "csv", label: "CSV", description: "파일 기반 source" },
  { id: "kafka", label: "Kafka", description: "stream topic" },
  { id: "postgres", label: "PostgreSQL", description: "RDB table" },
  { id: "mongodb", label: "MongoDB", description: "document source" },
  { id: "api", label: "API", description: "external endpoint" },
  { id: "s3", label: "S3", description: "object storage" },
];

export const sourceSortOptions = [
  { id: "recent", label: "최근 수정순" },
  { id: "name", label: "이름순" },
  { id: "status", label: "상태순" },
  { id: "columns", label: "컬럼 수 많은 순" },
];

export const silverStandardizeRuleOptions = [
  { id: "normalize_ids", label: "ID 정규화", detail: "product_id, user_id 같은 join key를 문자열 기준으로 정리합니다." },
  { id: "cast_types", label: "타입 캐스팅", detail: "숫자, 날짜, boolean 필드를 분석 가능한 타입으로 맞춥니다." },
  { id: "dedupe_records", label: "중복 제거", detail: "source key와 timestamp 기준으로 중복 row를 제거합니다." },
  { id: "trim_text", label: "텍스트 정리", detail: "리뷰/VOC 텍스트의 공백과 비어 있는 값을 정리합니다." },
];

export const silverValidationRuleOptions = [
  { id: "required_keys", label: "필수 키 확인", detail: "분석 grain에 필요한 id 필드가 비어 있지 않은지 확인합니다." },
  { id: "valid_ranges", label: "값 범위 확인", detail: "rating, price, quantity 같은 수치 범위 이상치를 표시합니다." },
  { id: "schema_drift", label: "스키마 드리프트 확인", detail: "Source schema preview와 Silver output schema 차이를 기록합니다." },
];

export const targetProcessingRecipes = [
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

export const targetGoldSchemaPreview = [
  { name: "product_id", type: "string", sample: "sku_8842" },
  { name: "category", type: "string", sample: "home_appliance" },
  { name: "avg_rating", type: "number", sample: "3.2" },
  { name: "conversion_rate", type: "number", sample: "0.041" },
  { name: "late_delivery_rate", type: "number", sample: "0.18" },
  { name: "risk_score", type: "number", sample: "82" },
  { name: "risk_reason", type: "text", sample: "부정 리뷰와 배송 지연이 함께 증가" },
  { name: "evidence_summary", type: "json", sample: "{\"sources\":4,\"checks\":6}" },
];

export const targetExecutorOptions = [
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

export const externalConnectionTypes = [
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

export const externalConnectionPresets = [
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


export function connectionSchemaPreview(connectionType) {
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

export function connectionTypeLabel(connectorType) {
  const connectionType = externalConnectionTypes.find((type) => type.id === connectorType);
  return connectionType ? connectionType.label : connectorType;
}

export function mapExternalConnectionRecord(record) {
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

export function mapProductHealthInventoryItemToConnection(item) {
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

export function productHealthBindingLabel(bindingType) {
  const labels = {
    raw_file: "Raw file",
    prepared_dataset: "Prepared dataset",
    missing: "Missing",
    mismatch: "Mismatch",
  };
  return labels[bindingType] || bindingType || "Source";
}

export function productHealthStatusLabel(item) {
  if (!item) return "unknown";
  if (item.status === "ready" && item.binding_type === "prepared_dataset") return "prepared ready";
  if (item.status === "ready") return "raw ready";
  return item.status;
}

export function formatConnectionResourceLabel(label) {
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

export function defaultConnectionSecretRefs(connectionType) {
  return { ...(connectionType.defaultSecretRefs || {}) };
}

export function isRuntimeConnectionType(connectionType) {
  return Boolean(connectionType?.runtimeCheck);
}

export function runtimeConnectionPassed(state, connectionType) {
  return state.status === "passed" && state.checkId === connectionType?.id;
}

export function runtimeConnectionCheckLabel(connectionType) {
  return connectionType.runtimeCapability || "runtime connection test";
}

export function isLocalDiscoveryConnection(connection) {
  return ["local_file", "local_folder"].includes(connection?.connectorId);
}

export function sourceDiscoveryStatus(connection, discoveryState) {
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

export function secretRefsForConnection(connection) {
  const connectionType = externalConnectionTypes.find((type) => type.id === connection?.connectorId);
  return defaultConnectionSecretRefs(connectionType || {});
}

export function defaultSourceScopeForConnection(connection) {
  if (!connection) return "";
  if (connection.connectorId === "postgres") return "public.connection_smoke";
  if (connection.connectorId === "mongodb") return "asklake.connection_smoke";
  if (connection.connectorId === "s3") return "product_health/source/s3_events.jsonl";
  if (connection.connectorId === "kafka") return "asklake-connection-smoke";
  return connection.resource;
}

export function defaultDiscoveryScopeForConnectionType(connectionType) {
  if (!connectionType) return "";
  return defaultSourceScopeForConnection({
    connectorId: connectionType.id,
    resource: connectionType.placeholder,
  });
}

export function silverOutputForSource(source) {
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

export function sourceDatasetNameForConnection(connection) {
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

export function targetSourceRefPayload(source, role) {
  return {
    source_id: source.id,
    name: source.name,
    role,
    type_label: source.typeLabel,
    resource: source.resource,
  };
}

export function targetSilverRefPayload(silverDataset, role) {
  return {
    source_id: silverDataset.id,
    name: silverDataset.name,
    role,
    type_label: "Silver Dataset",
    resource: `from ${silverDataset.source_dataset_name}`,
  };
}

export function silverOutputPayload(silverDataset) {
  return {
    name: silverDataset.name,
    from_source_id: silverDataset.source_dataset_id,
    from_source_name: silverDataset.source_dataset_name,
    purpose: silverDataset.purpose,
  };
}
