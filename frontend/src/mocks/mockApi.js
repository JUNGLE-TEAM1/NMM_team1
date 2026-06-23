const FRONTEND_ONLY_FLAG = "VITE_FRONTEND_ONLY";
const STORAGE_KEY = "xflow.frontendOnly.mockState.commerceRevenueDemo.v2";
const CLEANUP_MARKER_KEY = "xflow.frontendOnly.cleanupVersion";
const CLEANUP_VERSION = "commerce-revenue-demo-v2";

const now = () => new Date().toISOString();

const makeColumns = () => [
  { name: "order_id", type: "BIGINT", nullable: false, description: "Unique order key" },
  { name: "customer_id", type: "VARCHAR", nullable: false, description: "Customer identifier" },
  { name: "order_date", type: "TIMESTAMP", nullable: false, description: "Order timestamp" },
  { name: "amount", type: "DOUBLE", nullable: false, description: "Order amount" },
  { name: "status", type: "VARCHAR", nullable: true, description: "Fulfillment status" },
];

const commerceOrderColumns = [
  { name: "order_id", type: "VARCHAR", nullable: false, description: "주문 식별자" },
  { name: "user_id", type: "VARCHAR", nullable: false, description: "고객 식별자" },
  { name: "product_id", type: "VARCHAR", nullable: false, description: "상품 식별자" },
  { name: "order_amount", type: "NUMERIC", nullable: false, description: "주문 금액" },
  { name: "order_status", type: "VARCHAR", nullable: true, description: "주문 상태" },
  { name: "ordered_at", type: "TIMESTAMP", nullable: false, description: "주문 시각" },
];

const orderEventColumns = [
  { name: "event_id", type: "VARCHAR", nullable: false, description: "주문 이벤트 ID" },
  { name: "order_id", type: "VARCHAR", nullable: false, description: "주문 식별자" },
  { name: "product_id", type: "VARCHAR", nullable: false, description: "상품 식별자" },
  { name: "event_name", type: "VARCHAR", nullable: false, description: "주문 이벤트명" },
  { name: "amount", type: "NUMERIC", nullable: true, description: "이벤트 기준 금액" },
  { name: "event_time", type: "TIMESTAMP", nullable: false, description: "수집 시각" },
];

const commerceGoldColumns = [
  { name: "month", type: "VARCHAR", nullable: false, description: "매출 기준 월" },
  { name: "product_id", type: "VARCHAR", nullable: false, description: "상품 식별자" },
  { name: "product_name", type: "VARCHAR", nullable: false, description: "상품명" },
  { name: "category", type: "VARCHAR", nullable: true, description: "상품 카테고리" },
  { name: "revenue", type: "NUMERIC", nullable: false, description: "월별 매출" },
  { name: "order_count", type: "INTEGER", nullable: false, description: "월별 주문 수" },
  { name: "avg_order_amount", type: "NUMERIC", nullable: false, description: "평균 주문 금액" },
];

const mongoCustomerColumns = [
  { name: "_id", type: "OBJECT_ID", nullable: false, description: "MongoDB 고객 문서 ID" },
  { name: "user_id", type: "STRING", nullable: false, description: "주문 데이터와 조인할 고객 ID" },
  { name: "customer_grade", type: "STRING", nullable: true, description: "고객 등급" },
  { name: "preferred_region", type: "STRING", nullable: true, description: "주요 이용 지역" },
  { name: "marketing_opt_in", type: "BOOLEAN", nullable: true, description: "마케팅 수신 동의 여부" },
  { name: "updated_at", type: "TIMESTAMP", nullable: true, description: "프로필 수정 시각" },
];

const productCatalogColumns = [
  { name: "_id", type: "OBJECT_ID", nullable: false, description: "MongoDB 상품 문서 ID" },
  { name: "product_id", type: "STRING", nullable: false, description: "주문 데이터와 조인할 상품 ID" },
  { name: "product_name", type: "STRING", nullable: false, description: "상품명" },
  { name: "category", type: "STRING", nullable: true, description: "상품 카테고리" },
  { name: "brand", type: "STRING", nullable: true, description: "브랜드" },
  { name: "updated_at", type: "TIMESTAMP", nullable: true, description: "상품 정보 수정 시각" },
];

const postgresOrderColumns = [
  { name: "order_id", type: "VARCHAR", nullable: false, description: "주문 식별자" },
  { name: "user_id", type: "VARCHAR", nullable: false, description: "고객 프로필 조인 키" },
  { name: "order_amount", type: "NUMERIC", nullable: false, description: "주문 금액" },
  { name: "order_status", type: "VARCHAR", nullable: true, description: "주문 상태" },
  { name: "ordered_at", type: "TIMESTAMP", nullable: false, description: "주문 생성 시각" },
];

const customerOrderBronzeColumns = [
  { name: "raw_source", type: "STRING", nullable: false, description: "원본 시스템 이름" },
  { name: "raw_payload", type: "JSON", nullable: false, description: "원본 레코드 페이로드" },
  { name: "ingested_at", type: "TIMESTAMP", nullable: false, description: "S3 적재 시각" },
  { name: "partition_date", type: "DATE", nullable: false, description: "적재 파티션 날짜" },
];

const customerOrderSilverColumns = [
  { name: "user_id", type: "VARCHAR", nullable: false, description: "고객/주문 통합 키" },
  { name: "order_id", type: "VARCHAR", nullable: false, description: "주문 식별자" },
  { name: "customer_grade", type: "VARCHAR", nullable: true, description: "고객 등급" },
  { name: "preferred_region", type: "VARCHAR", nullable: true, description: "주요 이용 지역" },
  { name: "order_amount", type: "NUMERIC", nullable: false, description: "주문 금액" },
  { name: "ordered_at", type: "TIMESTAMP", nullable: false, description: "주문 생성 시각" },
];

const sourceColumns = [
  { name: "event_id", type: "VARCHAR" },
  { name: "event_time", type: "TIMESTAMP" },
  { name: "user_id", type: "VARCHAR" },
  { name: "event_name", type: "VARCHAR" },
  { name: "properties", type: "JSON" },
];

const createAskLakeDemoItems = (createdAt = now()) => {
  const postgresSource = {
    id: "src-commerce-orders-postgres",
    name: "postgres_commerce_orders",
    description: "후즈러닝 커머스 주문 거래 원본 테이블입니다.",
    owner: "데이터 엔지니어링 팀",
    dataset_type: "source",
    source_type: "postgres",
    connection_id: "conn-postgres",
    table: "orders",
    columns: commerceOrderColumns,
    status: "active",
    job_type: "batch",
    import_ready: true,
    created_at: createdAt,
    updated_at: createdAt,
  };

  const kafkaSource = {
    id: "src-order-events-kafka",
    name: "kafka_order_events",
    description: "실시간 주문 이벤트를 담은 Kafka 스트림입니다.",
    owner: "커머스 플랫폼 팀",
    dataset_type: "source",
    source_type: "kafka",
    connection_id: "conn-kafka",
    topic: "commerce.order.events",
    columns: orderEventColumns,
    status: "active",
    job_type: "streaming",
    import_ready: true,
    created_at: createdAt,
    updated_at: createdAt,
  };

  const mongoCustomerSource = {
    id: "src-customer-profile-mongo",
    name: "mongo_customer_profiles",
    description: "MongoDB 고객 프로필 컬렉션에서 고객 등급과 지역 정보를 가져옵니다.",
    owner: "고객 플랫폼 팀",
    dataset_type: "source",
    source_type: "mongodb",
    connection_id: "conn-mongodb",
    collection: "customer_profiles",
    columns: mongoCustomerColumns,
    status: "active",
    job_type: "batch",
    import_ready: true,
    created_at: createdAt,
    updated_at: createdAt,
  };

  const postgresOrderSource = {
    id: "src-order-transactions-postgres",
    name: "postgres_order_transactions",
    description: "PostgreSQL 주문 테이블에서 주문 금액과 상태 컬럼을 가져옵니다.",
    owner: "주문 플랫폼 팀",
    dataset_type: "source",
    source_type: "postgres",
    connection_id: "conn-postgres",
    table: "order_transactions",
    columns: postgresOrderColumns,
    status: "active",
    job_type: "batch",
    import_ready: true,
    created_at: createdAt,
    updated_at: createdAt,
  };

  const customerOrderBronzeDataset = {
    id: "ds-customer-order-bronze",
    job_id: "ds-customer-order-bronze",
    name: "고객 주문 원본 Bronze Dataset",
    description: "MongoDB 고객 프로필과 PostgreSQL 주문 거래 데이터를 원본 형태로 S3 Bronze 영역에 적재한 목업 데이터셋입니다.",
    owner: "데이터 엔지니어링 팀",
    dataset_type: "target",
    layer: "bronze",
    quality_score: 88,
    sources: [
      { nodeId: "bronze-source-mongo", type: "mongodb", table: "customer_profiles", name: "MongoDB 고객 프로필" },
      { nodeId: "bronze-source-postgres", type: "postgres", table: "order_transactions", name: "PostgreSQL 주문 거래" },
    ],
    transforms: [
      { nodeId: "bronze-ingest", type: "raw-ingest", config: { mode: "append", keep_raw_payload: true } },
    ],
    destination: { type: "s3", path: "s3://asklake/bronze/customer_order_raw", format: "json" },
    target: { type: "s3", path: "s3://asklake/bronze/customer_order_raw" },
    schema: customerOrderBronzeColumns,
    columns: customerOrderBronzeColumns,
    nodes: [
      {
        id: "bronze-source-mongo",
        type: "custom",
        data: {
          label: "MongoDB 고객 프로필",
          name: "customer_profiles",
          platform: "MongoDB",
          nodeCategory: "source",
          columns: productCatalogColumns,
          schema: productCatalogColumns,
          description: "고객 등급, 주요 지역, 마케팅 동의 컬럼을 가져옵니다.",
        },
        position: { x: 80, y: 80 },
      },
      {
        id: "bronze-source-postgres",
        type: "custom",
        data: {
          label: "PostgreSQL 주문 거래",
          name: "order_transactions",
          platform: "PostgreSQL",
          nodeCategory: "source",
          columns: postgresOrderColumns,
          schema: postgresOrderColumns,
          description: "주문 ID, 고객 ID, 주문 금액, 주문 상태 컬럼을 가져옵니다.",
        },
        position: { x: 80, y: 280 },
      },
      {
        id: "bronze-ingest",
        type: "custom",
        data: {
          label: "원본 적재",
          name: "Raw Payload Append",
          platform: "Ingestion",
          nodeCategory: "transform",
          columns: customerOrderBronzeColumns,
          schema: customerOrderBronzeColumns,
          description: "두 원본 시스템의 레코드를 raw_payload 형태로 S3 Bronze 영역에 적재합니다.",
        },
        position: { x: 430, y: 180 },
      },
      {
        id: "bronze-target",
        type: "custom",
        data: {
          label: "Bronze Dataset",
          name: "customer_order_raw",
          platform: "S3 Bronze",
          nodeCategory: "target",
          columns: customerOrderBronzeColumns,
          schema: customerOrderBronzeColumns,
          description: "원본 페이로드를 보존한 재처리용 데이터셋입니다.",
        },
        position: { x: 780, y: 180 },
      },
    ],
    edges: [
      { id: "bronze-edge-1", source: "bronze-source-mongo", target: "bronze-ingest", animated: true },
      { id: "bronze-edge-2", source: "bronze-source-postgres", target: "bronze-ingest", animated: true },
      { id: "bronze-edge-3", source: "bronze-ingest", target: "bronze-target", animated: true },
    ],
    schedule: "매시간",
    schedule_frequency: "hourly",
    job_type: "batch",
    status: "active",
    is_active: true,
    import_ready: true,
    size_bytes: 157286400,
    actual_size_bytes: 157286400,
    row_count: 1830000,
    format: "JSON",
    tags: ["bronze", "mongodb", "postgres"],
    created_at: createdAt,
    updated_at: createdAt,
  };

  const customerOrderSilverDataset = {
    id: "ds-customer-order-silver",
    job_id: "ds-customer-order-silver",
    name: "고객 주문 통합 Silver Dataset",
    description: "MongoDB 고객 프로필 컬럼과 PostgreSQL 주문 컬럼을 user_id 기준으로 조인해 분석 가능한 형태로 정제한 Silver Dataset입니다.",
    owner: "데이터 엔지니어링 팀",
    dataset_type: "target",
    layer: "silver",
    quality_score: 97,
    sources: [
      { nodeId: "silver-source-mongo", type: "mongodb", table: "customer_profiles", name: "MongoDB 고객 프로필" },
      { nodeId: "silver-source-postgres", type: "postgres", table: "order_transactions", name: "PostgreSQL 주문 거래" },
      { nodeId: "silver-source-bronze", type: "s3", table: "customer_order_raw", name: "고객 주문 원본 Bronze Dataset" },
    ],
    transforms: [
      {
        nodeId: "silver-transform-select-join",
        type: "select-join-clean",
        config: {
          join_key: "user_id",
          selected_fields: ["user_id", "order_id", "customer_grade", "preferred_region", "order_amount", "ordered_at"],
          removed_fields: ["raw_payload", "_id"],
        },
      },
    ],
    destination: { type: "s3", path: "s3://asklake/silver/customer_order_360", format: "parquet" },
    target: { type: "s3", path: "s3://asklake/silver/customer_order_360" },
    schema: customerOrderSilverColumns,
    columns: customerOrderSilverColumns,
    nodes: [
      {
        id: "silver-source-mongo",
        type: "custom",
        data: {
          label: "MongoDB 고객 프로필",
          name: "customer_profiles",
          platform: "MongoDB",
          nodeCategory: "source",
          columns: mongoCustomerColumns,
          schema: mongoCustomerColumns,
          description: "고객 등급과 지역 관련 컬럼을 선택합니다.",
        },
        position: { x: 60, y: 70 },
      },
      {
        id: "silver-source-postgres",
        type: "custom",
        data: {
          label: "PostgreSQL 주문 거래",
          name: "order_transactions",
          platform: "PostgreSQL",
          nodeCategory: "source",
          columns: postgresOrderColumns,
          schema: postgresOrderColumns,
          description: "주문 금액과 주문 시각 컬럼을 선택합니다.",
        },
        position: { x: 60, y: 260 },
      },
      {
        id: "silver-source-bronze",
        type: "custom",
        data: {
          label: "Bronze 원본 적재",
          name: "customer_order_raw",
          platform: "S3 Bronze",
          nodeCategory: "source",
          columns: customerOrderBronzeColumns,
          schema: customerOrderBronzeColumns,
          description: "재처리 가능한 원본 적재 데이터입니다.",
        },
        position: { x: 60, y: 450 },
      },
      {
        id: "silver-transform-select-join",
        type: "custom",
        data: {
          label: "컬럼 선택 및 조인",
          name: "user_id 기준 조인",
          platform: "Transform",
          nodeCategory: "transform",
          columns: customerOrderSilverColumns,
          schema: customerOrderSilverColumns,
          description: "MongoDB와 PostgreSQL 컬럼을 user_id로 조인하고 분석 컬럼만 남깁니다.",
        },
        position: { x: 450, y: 260 },
      },
      {
        id: "silver-target",
        type: "custom",
        data: {
          label: "Silver Dataset",
          name: "customer_order_360",
          platform: "S3 Silver",
          nodeCategory: "target",
          columns: customerOrderSilverColumns,
          schema: customerOrderSilverColumns,
          description: "AI Query와 Dashboard에서 사용할 수 있는 정제 데이터셋입니다.",
        },
        position: { x: 820, y: 260 },
      },
    ],
    edges: [
      { id: "silver-edge-1", source: "silver-source-mongo", target: "silver-transform-select-join", animated: true },
      { id: "silver-edge-2", source: "silver-source-postgres", target: "silver-transform-select-join", animated: true },
      { id: "silver-edge-3", source: "silver-source-bronze", target: "silver-transform-select-join", animated: true },
      { id: "silver-edge-4", source: "silver-transform-select-join", target: "silver-target", animated: true },
    ],
    schedule: "매일 09:00",
    schedule_frequency: "daily",
    job_type: "batch",
    status: "active",
    is_active: true,
    import_ready: true,
    size_bytes: 94371840,
    actual_size_bytes: 94371840,
    row_count: 620000,
    format: "PARQUET",
    tags: ["silver", "mongodb", "postgres", "customer-360"],
    created_at: createdAt,
    updated_at: createdAt,
  };

  const goldDataset = {
    id: "ds-commerce-revenue-gold",
    job_id: "ds-commerce-revenue-gold",
    name: "월별 상품 매출 Gold Dataset",
    description: "PostgreSQL 주문 거래와 MongoDB 상품 카탈로그를 조인해 월별 상품 매출과 주문 수를 집계한 Gold Dataset입니다.",
    owner: "데이터 엔지니어링 팀",
    dataset_type: "target",
    layer: "gold",
    catalog_status: "new",
    quality_score: 100,
    permission_label: "마케터 권한 적용",
    sources: [
      { nodeId: "asklake-source-postgres", type: "postgres", table: "orders", name: "PostgreSQL 주문 거래" },
      { nodeId: "asklake-source-mongodb", type: "mongodb", table: "product_catalog", name: "MongoDB 상품 카탈로그" },
    ],
    transforms: [
      {
        nodeId: "asklake-transform-clean-join",
        type: "join-aggregate",
        config: {
          join_key: "product_id",
          filters: ["order_status = 'paid'"],
          metrics: ["revenue", "order_count", "avg_order_amount"],
        },
      },
    ],
    targets: [{ nodeId: "asklake-target-gold", type: "s3", config: { format: "parquet" } }],
    destination: { type: "s3", path: "s3://asklake/gold/monthly_product_sales", format: "parquet" },
    target: { type: "s3", path: "s3://asklake/gold/monthly_product_sales" },
    schema: commerceGoldColumns,
    columns: commerceGoldColumns,
    nodes: [
      {
        id: "asklake-source-postgres",
        type: "custom",
        data: {
          label: "PostgreSQL 주문 거래",
          name: "orders",
          platform: "PostgreSQL",
          nodeCategory: "source",
          columns: commerceOrderColumns,
          schema: commerceOrderColumns,
          description: "커머스 주문 거래에서 주문 금액, 상태, 상품 ID를 가져옵니다.",
        },
        position: { x: 80, y: 80 },
      },
      {
        id: "asklake-source-mongodb",
        type: "custom",
        data: {
          label: "MongoDB 상품 카탈로그",
          name: "product_catalog",
          platform: "MongoDB",
          nodeCategory: "source",
          columns: mongoCustomerColumns,
          schema: mongoCustomerColumns,
          description: "상품명, 카테고리, 브랜드 등 상품 메타데이터를 가져옵니다.",
        },
        position: { x: 80, y: 280 },
      },
      {
        id: "asklake-transform-clean-join",
        type: "custom",
        data: {
          label: "조인 및 비식별 처리",
          name: "product_id 기준 조인",
          platform: "Transform",
          nodeCategory: "transform",
          columns: commerceGoldColumns,
          schema: commerceGoldColumns,
          description: "product_id로 주문과 상품을 조인하고 결제 완료 주문만 월별로 집계합니다.",
        },
        position: { x: 420, y: 180 },
      },
      {
        id: "asklake-target-gold",
        type: "custom",
        data: {
          label: "월별 상품 매출 데이터",
          name: "Gold Dataset",
          platform: "Gold Dataset",
          nodeCategory: "target",
          columns: commerceGoldColumns,
          schema: commerceGoldColumns,
          description: "마케터와 기획자가 바로 분석에 사용할 수 있는 정제 데이터셋입니다.",
        },
        position: { x: 760, y: 180 },
      },
    ],
    edges: [
      { id: "asklake-edge-1", source: "asklake-source-postgres", target: "asklake-transform-clean-join", animated: true },
      { id: "asklake-edge-2", source: "asklake-source-mongodb", target: "asklake-transform-clean-join", animated: true },
      { id: "asklake-edge-3", source: "asklake-transform-clean-join", target: "asklake-target-gold", animated: true },
    ],
    schedule: "Batch 실행",
    schedule_frequency: "manual",
    job_type: "batch",
    status: "active",
    is_active: true,
    import_ready: true,
    size_bytes: 824633720,
    actual_size_bytes: 824633720,
    row_count: 2480000,
    format: "PARQUET",
    tags: ["gold", "commerce", "revenue", "orders", "quality-100"],
    preview_rows: [
      { month: "2026-04", product_name: "러닝화 Pro", category: "Shoes", revenue: "49,000,000", order_count: 910, avg_order_amount: "53,846" },
      { month: "2026-05", product_name: "트레이닝 셋업", category: "Apparel", revenue: "58,000,000", order_count: 1040, avg_order_amount: "55,769" },
      { month: "2026-06", product_name: "러닝화 Pro", category: "Shoes", revenue: "64,000,000", order_count: 1120, avg_order_amount: "57,143" },
    ],
    quality: {
      missing_rate: "0.00%",
      duplicate_count: 0,
      schema_status: "안정적",
    },
    created_at: createdAt,
    updated_at: createdAt,
  };

  const silverDataset = {
    id: "ds-commerce-orders-silver",
    job_id: "ds-commerce-orders-silver",
    name: "주문 거래 정제 데이터",
    description: "PostgreSQL 주문 원본에서 분석에 필요한 주문/고객/상태 컬럼만 정리한 Silver Dataset입니다.",
    owner: "데이터 엔지니어링 팀",
    dataset_type: "target",
    layer: "silver",
    quality_score: 96,
    sources: [
      { nodeId: "silver-source-postgres", type: "postgres", table: "orders", name: "PostgreSQL 주문 거래" },
    ],
    transforms: [
      { nodeId: "silver-transform-clean", type: "clean", config: { selected_fields: ["order_id", "user_id", "product_id", "order_amount", "order_status"] } },
    ],
    destination: { type: "s3", path: "s3://asklake/silver/orders_clean", format: "parquet" },
    target: { type: "s3", path: "s3://asklake/silver/orders_clean" },
    schema: commerceOrderColumns,
    columns: commerceOrderColumns,
    nodes: [
      { id: "silver-source-postgres", type: "source", data: { label: "orders", schema: commerceOrderColumns }, position: { x: 0, y: 100 } },
      { id: "silver-transform-clean", type: "transform", data: { label: "컬럼 정리", schema: commerceOrderColumns }, position: { x: 300, y: 100 } },
      { id: "silver-target", type: "target", data: { label: "Silver Dataset", schema: commerceOrderColumns }, position: { x: 620, y: 100 } },
    ],
    edges: [
      { id: "silver-edge-1", source: "silver-source-postgres", target: "silver-transform-clean" },
      { id: "silver-edge-2", source: "silver-transform-clean", target: "silver-target" },
    ],
    schedule: "매일 08:00",
    schedule_frequency: "daily",
    job_type: "batch",
    status: "active",
    is_active: true,
    import_ready: true,
    size_bytes: 248302796,
    actual_size_bytes: 248302796,
    row_count: 2480000,
    format: "PARQUET",
    tags: ["silver", "commerce-orders"],
    created_at: createdAt,
    updated_at: createdAt,
  };

  const bronzeDataset = {
    id: "ds-order-events-bronze",
    job_id: "ds-order-events-bronze",
    name: "주문 이벤트 원본 로그",
    description: "Kafka 주문 이벤트를 데이터 레이크에 원본 형태로 적재한 Bronze Dataset입니다.",
    owner: "커머스 플랫폼 팀",
    dataset_type: "target",
    layer: "bronze",
    quality_score: 91,
    sources: [
      { nodeId: "bronze-source-kafka", type: "kafka", table: "commerce.order.events", name: "Kafka 주문 이벤트" },
    ],
    transforms: [],
    destination: { type: "s3", path: "s3://asklake/bronze/order_events", format: "json" },
    target: { type: "s3", path: "s3://asklake/bronze/order_events" },
    schema: orderEventColumns,
    columns: orderEventColumns,
    nodes: [
      { id: "bronze-source-kafka", type: "source", data: { label: "commerce.order.events", schema: orderEventColumns }, position: { x: 0, y: 100 } },
      { id: "bronze-target", type: "target", data: { label: "Bronze Dataset", schema: orderEventColumns }, position: { x: 360, y: 100 } },
    ],
    edges: [{ id: "bronze-edge-1", source: "bronze-source-kafka", target: "bronze-target" }],
    schedule: "실시간",
    schedule_frequency: "streaming",
    job_type: "streaming",
    status: "active",
    is_active: true,
    import_ready: true,
    size_bytes: 192937984,
    actual_size_bytes: 192937984,
    row_count: 9800000,
    format: "JSON",
    tags: ["bronze", "order-events"],
    created_at: createdAt,
    updated_at: createdAt,
  };

  const kafkaConnection = {
    id: "conn-kafka",
    name: "주문 이벤트 Kafka",
    description: "커머스 주문 이벤트를 수집하는 Kafka 스트림 연결입니다.",
    type: "kafka",
    config: { bootstrap_servers: "kafka.local:9092", topic: "commerce.order.events" },
    status: "connected",
    created_at: createdAt,
    updated_at: createdAt,
  };

  const s3Connection = {
    id: "conn-s3",
    name: "AskLake S3 Lake",
    description: "Bronze, Silver, Gold 데이터셋이 저장되는 데이터 레이크입니다.",
    type: "s3",
    config: { bucket: "asklake-demo", region: "ap-northeast-2" },
    status: "connected",
    created_at: createdAt,
    updated_at: createdAt,
  };

  const mongoConnection = {
    id: "conn-mongodb",
    name: "커머스 MongoDB",
    description: "고객 프로필과 상품 카탈로그 문서를 담은 MongoDB 연결입니다.",
    type: "mongodb",
    config: { host: "mongodb.local", port: 27017, database: "commerce", collection: "product_catalog" },
    status: "connected",
    created_at: createdAt,
    updated_at: createdAt,
  };

  return {
    postgresSource,
    kafkaSource,
    mongoCustomerSource,
    postgresOrderSource,
    customerOrderBronzeDataset,
    customerOrderSilverDataset,
    goldDataset,
    silverDataset,
    bronzeDataset,
    kafkaConnection,
    s3Connection,
    mongoConnection,
  };
};

const seedState = () => {
  const createdAt = now();
  const askLakeDemo = createAskLakeDemoItems(createdAt);
  const sourceA = {
    id: "src-orders-postgres",
    name: "orders_postgres",
    description: "PostgreSQL orders table for checkout analytics.",
    owner: "Data Platform",
    dataset_type: "source",
    source_type: "postgres",
    connection_id: "conn-postgres",
    table: "orders",
    columns: makeColumns(),
    status: "active",
    job_type: "batch",
    import_ready: true,
    created_at: createdAt,
    updated_at: createdAt,
  };
  const sourceB = {
    id: "src-events-api",
    name: "product_events_api",
    description: "REST API source for product interaction events.",
    owner: "Growth",
    dataset_type: "source",
    source_type: "api",
    connection_id: "conn-events-api",
    api: {
      endpoint: "https://api.example.test/events",
      method: "GET",
      query_params: { limit: "100" },
      pagination: { type: "cursor", config: { cursor_param: "cursor" } },
      response_path: "data",
    },
    columns: sourceColumns,
    status: "active",
    job_type: "batch",
    import_ready: true,
    created_at: createdAt,
    updated_at: createdAt,
  };
  const targetA = {
    id: "ds-revenue-mart",
    job_id: "ds-revenue-mart",
    name: "daily_revenue_mart",
    description: "Curated daily revenue metrics by channel and customer segment.",
    owner: "Analytics",
    dataset_type: "target",
    source: { type: "postgres", table: "orders", connection_id: "conn-postgres" },
    sources: [
      { nodeId: "source-1", type: "postgres", table: "orders", name: "orders_postgres" },
      { nodeId: "source-2", type: "api", table: "events", name: "product_events_api" },
    ],
    transforms: [
      { nodeId: "transform-1", type: "filter", config: { condition: "status = 'paid'" } },
      { nodeId: "transform-2", type: "sql", config: { sql: "GROUP BY date_trunc('day', order_date)" } },
    ],
    targets: [{ nodeId: "target-1", type: "s3", config: { format: "parquet" } }],
    destination: { type: "s3", path: "s3://xflow-demo/curated/daily_revenue_mart", format: "parquet" },
    target: { type: "s3", path: "s3://xflow-demo/curated/daily_revenue_mart" },
    schema: makeColumns(),
    columns: makeColumns(),
    nodes: [
      { id: "source-1", type: "source", data: { label: "orders_postgres", schema: makeColumns() }, position: { x: 0, y: 120 } },
      { id: "transform-1", type: "transform", data: { label: "paid_orders_filter" }, position: { x: 300, y: 120 } },
      { id: "target-1", type: "target", data: { label: "daily_revenue_mart", schema: makeColumns() }, position: { x: 620, y: 120 } },
    ],
    edges: [
      { id: "edge-1", source: "source-1", target: "transform-1" },
      { id: "edge-2", source: "transform-1", target: "target-1" },
    ],
    schedule: "0 8 * * *",
    schedule_frequency: "daily",
    job_type: "batch",
    status: "active",
    is_active: true,
    import_ready: true,
    size_bytes: 384829440,
    actual_size_bytes: 384829440,
    row_count: 1284000,
    format: "PARQUET",
    tags: ["revenue", "curated", "daily"],
    created_at: createdAt,
    updated_at: createdAt,
  };
  const targetB = {
    id: "ds-events-stream",
    job_id: "ds-events-stream",
    name: "product_event_stream",
    description: "Near real-time product event lake table for funnel analysis.",
    owner: "Growth",
    dataset_type: "target",
    sources: [{ nodeId: "source-1", type: "api", table: "events", name: "product_events_api" }],
    transforms: [{ nodeId: "transform-1", type: "select-fields", config: { fields: ["event_id", "event_time", "user_id", "event_name"] } }],
    destination: { type: "s3", path: "s3://xflow-demo/stream/product_event_stream", format: "json" },
    target: { type: "s3", path: "s3://xflow-demo/stream/product_event_stream" },
    schema: sourceColumns,
    columns: sourceColumns,
    nodes: [
      { id: "source-1", type: "source", data: { label: "events_api", schema: sourceColumns }, position: { x: 0, y: 100 } },
      { id: "target-1", type: "target", data: { label: "product_event_stream", schema: sourceColumns }, position: { x: 360, y: 100 } },
    ],
    edges: [{ id: "edge-1", source: "source-1", target: "target-1" }],
    schedule: null,
    schedule_frequency: null,
    job_type: "streaming",
    status: "active",
    is_active: false,
    import_ready: true,
    size_bytes: 91226112,
    actual_size_bytes: 91226112,
    row_count: 438920,
    format: "JSON",
    tags: ["events", "streaming", "product"],
    created_at: createdAt,
    updated_at: createdAt,
  };

  return {
    sessions: {},
    users: [
      {
        id: "user-ui-admin",
        email: "study@xflow.local",
        password: "study1234",
        name: "study",
        is_admin: true,
        etl_access: true,
        domain_edit_access: true,
        dataset_access: [],
        all_datasets: true,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    roles: [
      {
        id: "role-admin",
        name: "UI Reviewer",
        description: "Frontend-only reviewer role with full demo access.",
        dataset_etl_access: true,
        query_ai_access: true,
        dataset_access: [],
        all_datasets: true,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    connections: [
      {
        id: "conn-postgres",
        name: "주문 거래 PostgreSQL",
        description: "주문 거래 테이블을 담은 PostgreSQL 연결입니다.",
        type: "postgres",
        config: { host: "postgres.local", port: 5432, database: "commerce", user: "demo" },
        status: "connected",
        created_at: createdAt,
        updated_at: createdAt,
      },
      askLakeDemo.mongoConnection,
      askLakeDemo.s3Connection,
    ],
    sourceDatasets: [askLakeDemo.mongoCustomerSource, askLakeDemo.postgresOrderSource],
    datasets: [askLakeDemo.customerOrderSilverDataset, askLakeDemo.customerOrderBronzeDataset],
    domains: [],
    jobRuns: {
      "ds-customer-order-silver": [
        {
          id: "run-customer-order-silver",
          dataset_id: "ds-customer-order-silver",
          status: "success",
          started_at: createdAt,
          finished_at: createdAt,
          airflow_run_id: "mock_customer_order_silver",
        },
      ],
      "ds-customer-order-bronze": [
        {
          id: "run-customer-order-bronze",
          dataset_id: "ds-customer-order-bronze",
          status: "success",
          started_at: createdAt,
          finished_at: createdAt,
          airflow_run_id: "mock_customer_order_bronze",
        },
      ],
    },
  };
};

const ensureAskLakeDemoState = (state) => {
  const demo = createAskLakeDemoItems(now());
  let changed = false;

  if (!state.sourceDatasets?.some((item) => item.id === demo.mongoCustomerSource.id)) {
    state.sourceDatasets = [demo.mongoCustomerSource, ...(state.sourceDatasets || [])];
    changed = true;
  }
  if (!state.sourceDatasets?.some((item) => item.id === demo.postgresOrderSource.id)) {
    state.sourceDatasets = [...(state.sourceDatasets || []), demo.postgresOrderSource];
    changed = true;
  }
  if (!state.datasets?.some((item) => item.id === demo.customerOrderSilverDataset.id)) {
    state.datasets = [demo.customerOrderSilverDataset, ...(state.datasets || [])];
    changed = true;
  }
  if (!state.datasets?.some((item) => item.id === demo.customerOrderBronzeDataset.id)) {
    state.datasets = [...(state.datasets || []), demo.customerOrderBronzeDataset];
    changed = true;
  }
  if (!state.connections?.some((item) => item.id === demo.mongoConnection.id)) {
    state.connections = [demo.mongoConnection, ...(state.connections || [])];
    changed = true;
  }
  if (!state.connections?.some((item) => item.id === demo.s3Connection.id)) {
    state.connections = [...(state.connections || []), demo.s3Connection];
    changed = true;
  }
  if (changed) saveState(state);
  return state;
};

const loadState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return ensureAskLakeDemoState(JSON.parse(stored));
  } catch (error) {
    console.warn("Failed to load XFlow mock state", error);
  }
  const initial = seedState();
  saveState(initial);
  return initial;
};

const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const cleanupDemoStorage = () => {
  if (localStorage.getItem(CLEANUP_MARKER_KEY) === CLEANUP_VERSION) return;

  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("xflow.frontendOnly.mockState.") ||
      key.startsWith("xflow_analysis_board_state")
    ) {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem(CLEANUP_MARKER_KEY, CLEANUP_VERSION);
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-XFlow-Mock": "true",
    },
  });

const noContent = () => new Response(null, { status: 204, headers: { "X-XFlow-Mock": "true" } });

const readJson = async (init) => {
  if (!init?.body) return {};
  try {
    return JSON.parse(init.body);
  } catch {
    return {};
  }
};

const nextId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const publicUser = (user) => ({
  user_id: user.id,
  id: user.id,
  email: user.email,
  name: user.name || user.email.split("@")[0],
  is_admin: !!user.is_admin,
  role_id: user.role_id || null,
  etl_access: !!user.etl_access,
  domain_edit_access: !!user.domain_edit_access,
  dataset_access: user.dataset_access || [],
  all_datasets: !!user.all_datasets,
  role_dataset_etl_access: true,
  role_query_ai_access: true,
});

const findById = (items, id) => items.find((item) => item.id === id || item._id === id);

const upsertById = (items, item) => {
  const index = items.findIndex((current) => current.id === item.id);
  if (index >= 0) items[index] = item;
  else items.unshift(item);
};

const catalogItems = (state) =>
  state.datasets.map((dataset) => ({
    ...dataset,
    schema: dataset.schema || dataset.columns || makeColumns(),
    columns: dataset.columns || dataset.schema || makeColumns(),
    sources: dataset.sources || [],
    size_bytes: dataset.size_bytes || dataset.actual_size_bytes || 0,
    format: dataset.format || dataset.destination?.format?.toUpperCase() || "PARQUET",
    target: dataset.target || dataset.destination,
  }));

const graphForDataset = (dataset) => ({
  nodes:
    dataset?.nodes ||
    [
      { id: "source-1", type: "source", data: { label: "source", schema: makeColumns() }, position: { x: 0, y: 100 } },
      { id: "target-1", type: "target", data: { label: dataset?.name || "target", schema: dataset?.schema || makeColumns() }, position: { x: 360, y: 100 } },
    ],
  edges: dataset?.edges || [{ id: "edge-1", source: "source-1", target: "target-1" }],
});

const sampleRows = [
  { order_id: 1001, customer_id: "C-1042", order_date: "2026-06-20", amount: 129500, status: "paid" },
  { order_id: 1002, customer_id: "C-2048", order_date: "2026-06-21", amount: 84200, status: "paid" },
  { order_id: 1003, customer_id: "C-3120", order_date: "2026-06-21", amount: 45100, status: "pending" },
];

const queryResult = () => ({
  columns: ["order_id", "customer_id", "order_date", "amount", "status"],
  rows: sampleRows,
  data: sampleRows,
  row_count: sampleRows.length,
  execution_time_ms: 38,
  page: 1,
  page_size: 1000,
  total_rows: sampleRows.length,
  total_pages: 1,
});

const previewPayload = () => ({
  columns: makeColumns(),
  schema: makeColumns(),
  preview_data: sampleRows,
  data: sampleRows,
  rows: sampleRows,
  total_rows: sampleRows.length,
});

const qualitySummary = (state) => {
  const results = state.datasets.map((dataset, index) => {
    const score = index === 0 ? 96 : 82;
    return {
      dataset_id: dataset.id,
      job_name: dataset.name,
      s3_path: dataset.destination?.path,
      overall_score: score,
      status: score >= 90 ? "healthy" : "warning",
      run_at: dataset.updated_at || now(),
      checks: [
        { name: "Row count validation", passed: true, value: dataset.row_count || 0, threshold: 1 },
        { name: "Null check", passed: score >= 90, value: score >= 90 ? 0.2 : 3.8, threshold: 5 },
      ],
    };
  });
  return {
    summary: {
      total_count: results.length,
      healthy_count: results.filter((item) => item.status === "healthy").length,
      warning_count: results.filter((item) => item.status === "warning").length,
      critical_count: 0,
      avg_score: results.length
        ? Math.round(results.reduce((sum, item) => sum + item.overall_score, 0) / results.length)
        : 0,
    },
    results,
  };
};

const handleAuth = async (state, pathname, method, init) => {
  if (pathname === "/api/login" && method === "POST") {
    const body = await readJson(init);
    const user =
      state.users.find((item) => item.email === body.email && item.password === body.password) ||
      state.users[0];
    if (!user) return jsonResponse({ detail: "Invalid email or password" }, 401);
    const sessionId = `mock-session-${Date.now()}`;
    state.sessions[sessionId] = publicUser(user);
    saveState(state);
    return jsonResponse({ session_id: sessionId, user: state.sessions[sessionId] });
  }

  if (pathname === "/api/signup" && method === "POST") {
    const body = await readJson(init);
    const user = {
      id: nextId("user"),
      email: body.email,
      password: body.password || "password",
      name: body.name || body.email?.split("@")[0] || "user",
      is_admin: !!body.is_admin,
      etl_access: true,
      domain_edit_access: true,
      all_datasets: true,
      dataset_access: [],
      created_at: now(),
      updated_at: now(),
    };
    state.users.unshift(user);
    saveState(state);
    return jsonResponse({ id: user.id, email: user.email, message: "Mock user created" }, 201);
  }

  if (pathname === "/api/me") {
    return jsonResponse(publicUser(state.users[0]));
  }

  if (pathname === "/api/logout") {
    return jsonResponse({ message: "Logged out" });
  }

  return null;
};

const handleCollection = async (state, collectionName, idPrefix, id, method, init) => {
  const collection = state[collectionName];
  if (!id) {
    if (method === "GET") return jsonResponse(collection);
    if (method === "POST") {
      const body = await readJson(init);
      const item = {
        id: body.id || nextId(idPrefix),
        ...body,
        created_at: body.created_at || now(),
        updated_at: now(),
      };
      if (collectionName === "datasets") item.dataset_type = item.dataset_type || "target";
      if (collectionName === "sourceDatasets") item.dataset_type = "source";
      collection.unshift(item);
      saveState(state);
      return jsonResponse(item, 201);
    }
  }

  const item = findById(collection, id);
  if (method === "GET") return jsonResponse(item || { id, name: id, columns: makeColumns(), schema: makeColumns() });
  if (method === "PUT" || method === "PATCH") {
    const body = await readJson(init);
    const nextItem = { ...(item || { id }), ...body, id, updated_at: now() };
    upsertById(collection, nextItem);
    saveState(state);
    return jsonResponse(nextItem);
  }
  if (method === "DELETE") {
    const index = collection.findIndex((entry) => entry.id === id);
    if (index >= 0) collection.splice(index, 1);
    saveState(state);
    return jsonResponse({ message: "Deleted in frontend-only mode" });
  }
  return null;
};

const handleRequest = async (input, init = {}) => {
  const state = loadState();
  const url = new URL(typeof input === "string" ? input : input.url, window.location.origin);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const method = (init.method || "GET").toUpperCase();
  const segments = pathname.split("/").filter(Boolean);

  const authResponse = await handleAuth(state, pathname, method, init);
  if (authResponse) return authResponse;

  if (pathname === "/health") return jsonResponse({ status: "healthy", mode: "frontend-only" });

  if (pathname === "/api/admin/users") return handleCollection(state, "users", "user", null, method, init);
  if (segments[0] === "api" && segments[1] === "admin" && segments[2] === "users") {
    return handleCollection(state, "users", "user", segments[3], method, init);
  }
  if (pathname === "/api/admin/roles") return handleCollection(state, "roles", "role", null, method, init);
  if (segments[0] === "api" && segments[1] === "admin" && segments[2] === "roles") {
    if (segments[3] === "bulk-add-dataset") return jsonResponse({ message: "Dataset permissions updated" });
    return handleCollection(state, "roles", "role", segments[3], method, init);
  }

  if (pathname === "/api/connections") return handleCollection(state, "connections", "conn", null, method, init);
  if (segments[0] === "api" && segments[1] === "connections") {
    if (segments[2] === "test") return jsonResponse({ status: "connected", message: "Mock connection successful" });
    return handleCollection(state, "connections", "conn", segments[2], method, init);
  }

  if (segments[0] === "api" && segments[1] === "metadata") {
    if (segments[3] === "tables") return jsonResponse(["order_transactions"]);
    if (segments[3] === "collections") return jsonResponse(["customer_profiles"]);
    if (segments[5] === "columns") {
      return jsonResponse(segments[2] === "conn-mongodb" ? mongoCustomerColumns : postgresOrderColumns);
    }
  }

  if (pathname === "/api/source-datasets") {
    return handleCollection(state, "sourceDatasets", "src", null, method, init);
  }
  if (segments[0] === "api" && segments[1] === "source-datasets") {
    if (segments[2] === "kafka" && segments[3] === "topics") return jsonResponse(["commerce.order.events"]);
    if (segments[2] === "kafka" && segments[3] === "schema") return jsonResponse({ columns: orderEventColumns, sample: sampleRows.map((row) => ({ raw_value: JSON.stringify(row) })) });
    if (segments[3] === "preview") return jsonResponse(previewPayload());
    if (segments[2] === "api" && segments[3] === "test") {
      return jsonResponse({ success: true, columns: sourceColumns, schema: sourceColumns, data: sampleRows, preview_data: sampleRows });
    }
    return handleCollection(state, "sourceDatasets", "src", segments[2], method, init);
  }

  if (pathname === "/api/datasets") {
    return handleCollection(state, "datasets", "ds", null, method, init);
  }
  if (segments[0] === "api" && segments[1] === "datasets") {
    const dataset = findById(state.datasets, segments[2]);
    if (segments[3] === "activate" || segments[3] === "deactivate") {
      if (dataset) dataset.is_active = segments[3] === "activate";
      saveState(state);
      return jsonResponse({ message: `Mock ${segments[3]} complete`, is_active: dataset?.is_active });
    }
    if (segments[3] === "run") {
      const run = { id: nextId("run"), dataset_id: segments[2], status: "success", started_at: now(), finished_at: now() };
      state.jobRuns[segments[2]] = [run, ...(state.jobRuns[segments[2]] || [])];
      saveState(state);
      return jsonResponse(run);
    }
    if (segments[3] === "nodes" && segments[5] === "metadata") return jsonResponse({ columns: makeColumns(), sample_rows: sampleRows });
    return handleCollection(state, "datasets", "ds", segments[2], method, init);
  }

  if (pathname === "/api/catalog") return jsonResponse(catalogItems(state));
  if (segments[0] === "api" && segments[1] === "catalog") {
    const item = findById(state.datasets, segments[2]);
    if (segments[3] === "lineage") return jsonResponse(graphForDataset(item));
    if (segments[3] === "layout") {
      if (method === "GET") return jsonResponse({ nodes: item?.nodes || [] });
      return jsonResponse({ message: "Layout saved" });
    }
    if (method === "PATCH" || method === "PUT") {
      const body = await readJson(init);
      const updated = { ...(item || { id: segments[2] }), ...body, updated_at: now() };
      upsertById(state.datasets, updated);
      saveState(state);
      return jsonResponse(updated);
    }
    return jsonResponse(item || catalogItems(state)[0]);
  }

  if (pathname === "/api/domains") return handleCollection(state, "domains", "domain", null, method, init);
  if (segments[0] === "api" && segments[1] === "domains") {
    if (segments[2] === "jobs" && segments[4] === "execution") return jsonResponse(graphForDataset(findById(state.datasets, segments[3]) || state.datasets[0]));
    if (segments[2] === "jobs") return jsonResponse(state.datasets.filter((dataset) => dataset.import_ready));
    if (segments[3] === "graph") {
      const domain = findById(state.domains, segments[2]);
      return jsonResponse({ nodes: domain?.nodes || graphForDataset(state.datasets[0]).nodes, edges: domain?.edges || graphForDataset(state.datasets[0]).edges });
    }
    if (segments[3] === "files" || segments[4] === "download") return jsonResponse([]);
    return handleCollection(state, "domains", "domain", segments[2], method, init);
  }

  if (segments[0] === "api" && segments[1] === "job-runs") {
    if (segments[2] === "bulk") {
      const ids = (url.searchParams.get("dataset_ids") || "").split(",").filter(Boolean);
      const grouped = {};
      ids.forEach((id) => {
        grouped[id] = state.jobRuns[id] || [];
      });
      return jsonResponse(grouped);
    }
    const datasetId = url.searchParams.get("dataset_id");
    if (datasetId) return jsonResponse(state.jobRuns[datasetId] || []);
    return jsonResponse(Object.values(state.jobRuns).flat());
  }

  if (segments[0] === "api" && segments[1] === "streaming") {
    return jsonResponse({ status: "stopped", message: "Mock streaming action skipped" });
  }
  if (segments[0] === "api" && segments[1] === "cdc") {
    return jsonResponse({ status: "inactive", message: "Mock CDC action skipped" });
  }

  if (segments[0] === "api" && segments[1] === "quality") {
    if (segments[2] === "dashboard" && segments[3] === "summary") return jsonResponse(qualitySummary(state));
    if (segments[3] === "run") return jsonResponse(qualitySummary(state).results[0]);
    if (segments[3] === "latest") return jsonResponse(qualitySummary(state).results[0]);
    if (segments[3] === "history") return jsonResponse(qualitySummary(state).results);
  }

  if (segments[0] === "api" && segments[1] === "opensearch") {
    if (segments[2] === "status") return jsonResponse({ status: "mocked", indexed_count: catalogItems(state).length });
    if (segments[2] === "search") return jsonResponse({ results: catalogItems(state), total: catalogItems(state).length });
    return jsonResponse({ message: "Mock OpenSearch action skipped" });
  }

  if (segments[0] === "api" && segments[1] === "ai") {
    if (segments[2] === "health") return jsonResponse({ status: "mocked" });
    if (segments[2] === "generate-sql") {
      return jsonResponse({ sql: "SELECT month, product_name, revenue, order_count FROM gold_monthly_product_sales ORDER BY month DESC LIMIT 10;" });
    }
    if (segments[2] === "search-schema") return jsonResponse({ results: catalogItems(state) });
  }

  if (segments[0] === "api" && (segments[1] === "duckdb" || segments[1] === "trino" || segments[1] === "sql")) {
    if (segments[1] === "sql" && segments[2] === "test") {
      return jsonResponse({
        valid: true,
        schema: makeColumns(),
        before_sample: sampleRows,
        after_sample: sampleRows,
        preview_data: sampleRows,
      });
    }
    if (segments.includes("catalogs")) {
      if (segments.length <= 3) return jsonResponse(["asklake"]);
      if (segments.length <= 5) return jsonResponse(["bronze", "silver", "gold"]);
      if (segments.length <= 7) return jsonResponse(["customer_order_raw", "customer_order_silver", "monthly_product_sales"]);
      if (segments[segments.length - 1] === "schema") return jsonResponse(makeColumns());
      if (segments[segments.length - 1] === "preview") return jsonResponse(queryResult());
    }
    if (segments[2] === "buckets") {
      if (segments.length === 3) return jsonResponse(["asklake-demo"]);
      return jsonResponse([{ key: "gold/monthly_product_sales/part-000.parquet", size: 2481200, type: "file" }]);
    }
    if (segments[2] === "schema") return jsonResponse(makeColumns());
    return jsonResponse(queryResult());
  }

  if (segments[0] === "api" && segments[1]?.startsWith("s3-")) {
    return jsonResponse(previewPayload());
  }
  if (segments[0] === "api" && segments[1] === "logs") {
    if (segments[2] === "health") return jsonResponse({ status: "mocked" });
    if (segments[2] === "schema") return jsonResponse({ columns: sourceColumns });
    return jsonResponse(previewPayload());
  }
  if (segments[0] === "api" && segments[1] === "rdb-transform") {
    return jsonResponse({ id: nextId("transform"), columns: makeColumns(), preview_data: sampleRows });
  }

  if (method === "GET") return jsonResponse([]);
  if (method === "DELETE") return noContent();
  return jsonResponse({ id: nextId("mock"), ...(await readJson(init)), updated_at: now() });
};

const isApiRequest = (input) => {
  const url = new URL(typeof input === "string" ? input : input.url, window.location.origin);
  return url.pathname === "/health" || url.pathname.startsWith("/api") || url.pathname.startsWith("/users");
};

export const setupMockApi = () => {
  if (import.meta.env[FRONTEND_ONLY_FLAG] === "false") return;
  cleanupDemoStorage();
  if (window.__xflowMockApiInstalled) return;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    if (!isApiRequest(input)) return nativeFetch(input, init);
    await new Promise((resolve) => window.setTimeout(resolve, 150));
    return handleRequest(input, init);
  };

  window.__xflowMockApiInstalled = true;
  window.__xflowMockStateReset = () => {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("xflow.frontendOnly.mockState.") ||
        key.startsWith("xflow_analysis_board_state")
      ) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(CLEANUP_MARKER_KEY, CLEANUP_VERSION);
    return loadState();
  };

  console.info("XFlow frontend-only mock API enabled");
};
