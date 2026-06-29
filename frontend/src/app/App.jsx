import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
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
  Plus,
  RefreshCw,
  Route,
  Save,
  Search,
  ServerCog,
  ShieldCheck,
  ShieldQuestion,
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
  getHealth,
  getWeek2Catalog,
  getWeek2Run,
  triggerWeek2Run,
} from "../api/asklakeClient";
import { createSourceDataset, listSourceDatasets } from "../api/sourceDatasetApi";
import { createTargetDataset } from "../api/targetDatasetApi";
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

const navItems = [
  {
    path: "/sources",
    label: "데이터셋",
    description: "Source / Target",
    icon: GitMerge,
  },
  {
    path: "/catalog",
    label: "데이터 카탈로그",
    description: "Metadata",
    icon: LayoutDashboard,
  },
  {
    path: "/ask",
    label: "AI Query",
    description: "M6 AIQueryResult",
    icon: MessageSquareText,
  },
  {
    path: "/dashboard",
    label: "Dashboard",
    description: "M6 chart",
    icon: LayoutDashboard,
  },
  {
    path: "/admin",
    label: "사용자/권한",
    description: "RBAC",
    icon: Wrench,
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

function normalizeDatasetName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function mapSourceDatasetRecord(record, rankOffset = 100) {
  const schema = (record.schema_preview || []).map((field) => ({
    name: field.name,
    type: field.type,
    sample: field.sample || "metadata draft",
  }));

  return {
    id: record.id,
    name: record.name,
    sourceType: record.connection_type,
    typeLabel: record.connection_type.toUpperCase(),
    status: "Metadata ready",
    description: `${record.connection_name}에서 정의한 raw/source dataset입니다.`,
    resource: record.raw_scope,
    updatedLabel: "방금",
    updatedRank: rankOffset,
    columns: schema.map((field) => field.name),
    schema,
  };
}

const externalConnectionTypes = [
  {
    id: "csv",
    label: "CSV",
    description: "로컬 업로드 또는 shared file path",
    placeholder: "/data/incoming/product_health_reviews.csv",
    resourceLabel: "file_path",
    authMode: "No credential",
  },
  {
    id: "kafka",
    label: "Kafka",
    description: "broker와 topic 기반 streaming source",
    placeholder: "commerce.order.events",
    resourceLabel: "topic",
    authMode: "SASL placeholder",
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    description: "RDB connection과 schema.table",
    placeholder: "commerce.orders",
    resourceLabel: "schema_table",
    authMode: "Secret reference disabled",
  },
  {
    id: "mongodb",
    label: "MongoDB",
    description: "database와 collection 기반 document source",
    placeholder: "customer.profiles",
    resourceLabel: "collection",
    authMode: "Secret reference disabled",
  },
  {
    id: "api",
    label: "REST API",
    description: "external endpoint response source",
    placeholder: "GET /partner/catalog",
    resourceLabel: "endpoint",
    authMode: "API key disabled",
  },
  {
    id: "s3",
    label: "S3",
    description: "bucket prefix 기반 object storage source",
    placeholder: "s3://asklake-demo/raw/events/",
    resourceLabel: "bucket_prefix",
    authMode: "IAM role placeholder",
  },
];

const demoExternalConnections = [
  {
    id: "conn_product_health_csv",
    name: "Product Health CSV Connection",
    connectorId: "csv",
    typeLabel: "CSV",
    status: "Connection draft",
    description: "제품 리뷰 raw 파일을 AskLake raw zone으로 가져오기 위한 CSV 연결입니다.",
    resourceLabel: "file_path",
    resource: "/data/incoming/product_health_reviews.csv",
    updatedLabel: "오늘 10:15",
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
    id: "conn_order_events_kafka",
    name: "Order Events Kafka Connection",
    connectorId: "kafka",
    typeLabel: "Kafka",
    status: "Streaming connection",
    description: "주문 이벤트 topic을 raw/source dataset으로 받기 위한 Kafka 연결입니다.",
    resourceLabel: "topic",
    resource: "commerce.order.events",
    updatedLabel: "오늘 09:40",
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
    id: "conn_commerce_postgres",
    name: "Commerce PostgreSQL Connection",
    connectorId: "postgres",
    typeLabel: "PostgreSQL",
    status: "Warehouse connection",
    description: "운영 주문 테이블을 raw/source dataset으로 가져오기 위한 DB 연결입니다.",
    resourceLabel: "schema_table",
    resource: "commerce.orders",
    updatedLabel: "월요일 08:30",
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
    id: "conn_partner_api",
    name: "Partner Catalog API Connection",
    connectorId: "api",
    typeLabel: "REST API",
    status: "API connection",
    description: "파트너 상품 카탈로그 endpoint를 raw/source dataset으로 받기 위한 API 연결입니다.",
    resourceLabel: "endpoint",
    resource: "GET /partner/catalog",
    updatedLabel: "오늘 11:05",
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
    id: "conn_raw_events_s3",
    name: "Raw Events S3 Connection",
    connectorId: "s3",
    typeLabel: "S3",
    status: "Object storage connection",
    description: "S3 prefix 아래 raw event 파일 묶음을 Source Dataset으로 정의하기 위한 연결입니다.",
    resourceLabel: "bucket_prefix",
    resource: "s3://asklake-demo/raw/events/",
    updatedLabel: "지난주 수요일",
    columns: ["object_key", "event_date", "source_app", "record_count"],
    schema: [
      { name: "object_key", type: "string", sample: "raw/events/2026/06/29/part-0001.json" },
      { name: "event_date", type: "date", sample: "2026-06-29" },
      { name: "source_app", type: "string", sample: "checkout" },
      { name: "record_count", type: "integer", sample: "18542" },
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

function normalizePath(pathname) {
  if (pathname === "/" || pathname === "" || pathname === "/dataset") return "/sources";
  if (pathname === "/schema-preview") return "/sources";
  if (pathname === "/etl/visual" || pathname === "/etl-visual") return "/etl-visual";
  if (pathname === "/etl") return "/runs";
  if (pathname === "/query") return "/ask";
  if (pathname.startsWith("/catalog/")) return "/catalog-detail";
  return navItems.some((item) => item.path === pathname) ? pathname : "/sources";
}

export function App() {
  const [health, setHealth] = useState({ state: "loading", message: "확인 중" });
  const [activePath, setActivePath] = useState(() => normalizePath(window.location.pathname));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [isNoticeLeaving, setIsNoticeLeaving] = useState(false);

  useEffect(() => {
    refreshHealth();
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

  function navigate(path) {
    const nextPath = normalizePath(path);
    const displayPath = path.startsWith("/catalog/") ? path : routeToUrl(nextPath);
    window.history.pushState({}, "", displayPath);
    setActivePath(nextPath);
  }

  const activeItem = useMemo(
    () => {
      if (activePath === "/etl-visual") return navItems.find((item) => item.path === "/sources");
      if (activePath === "/schema-preview") return navItems.find((item) => item.path === "/sources");
      if (activePath === "/catalog-detail") return navItems.find((item) => item.path === "/catalog");
      return navItems.find((item) => item.path === activePath) || navItems[0];
    },
    [activePath],
  );

  return (
    <main className={`m1-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="shell-sidebar" aria-label="AskLake M1 navigation">
        <div className="brand-block">
          <img className="brand-logo" src={asklakeLogo} alt="AskLake" />
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem.path === item.path;

            return (
              <button
                key={item.path}
                type="button"
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
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
          {activePath === "/sources" ? <SourcesPage navigate={navigate} setNotice={setNotice} /> : null}
          {activePath === "/etl-visual" ? <VisualEditorPage navigate={navigate} setNotice={setNotice} /> : null}
          {activePath === "/runs" ? <RunStatusPage navigate={navigate} /> : null}
          {activePath === "/catalog" ? <CatalogPage navigate={navigate} /> : null}
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
  if (path === "/sources") return "/dataset";
  if (path === "/etl-visual") return "/etl/visual";
  if (path === "/runs") return "/etl";
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

function SourcesPage({ navigate, setNotice }) {
  const [isDatasetTypeModalOpen, setIsDatasetTypeModalOpen] = useState(false);
  const [datasetCreationMode, setDatasetCreationMode] = useState(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceModalPurpose, setSourceModalPurpose] = useState("target");
  const [connectionWizardStepIndex, setConnectionWizardStepIndex] = useState(0);
  const [selectedConnectionType, setSelectedConnectionType] = useState(externalConnectionTypes[0]);
  const [connectionName, setConnectionName] = useState("conn_product_health_csv");
  const [connectionResource, setConnectionResource] = useState(externalConnectionTypes[0].placeholder);
  const [sourceWizardStepIndex, setSourceWizardStepIndex] = useState(0);
  const [sourceDraft, setSourceDraft] = useState(null);
  const [sourceDatasetName, setSourceDatasetName] = useState("source_product_health_reviews");
  const [sourceRawScope, setSourceRawScope] = useState("");
  const [apiSourceDatasets, setApiSourceDatasets] = useState([]);
  const [isSourceDatasetsLoading, setIsSourceDatasetsLoading] = useState(false);
  const [sourceDatasetError, setSourceDatasetError] = useState("");
  const [isSavingSourceDataset, setIsSavingSourceDataset] = useState(false);
  const [lastCreatedSourceDatasetId, setLastCreatedSourceDatasetId] = useState("");
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [targetName, setTargetName] = useState("dataset_product_health_gold");
  const [targetDescription, setTargetDescription] = useState("제품 상태 분석용 gold dataset draft");
  const [targetScheduleMode, setTargetScheduleMode] = useState("manual");
  const [targetScheduleNote, setTargetScheduleNote] = useState("데모에서는 수동 실행으로만 준비합니다.");
  const [isSavingTargetDraft, setIsSavingTargetDraft] = useState(false);
  const [targetDraftError, setTargetDraftError] = useState("");
  const [lastCreatedTargetDraft, setLastCreatedTargetDraft] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const normalizedTargetName = targetName.trim();
  const normalizedTargetDescription = targetDescription.trim();
  const selectedFieldSummary =
    selectedFields.length > 0 ? selectedFields.slice(0, 3).join(", ") : "선택된 필드가 없습니다.";
  const selectedOutputSchema = selectedSource
    ? selectedSource.schema.filter((field) => selectedFields.includes(field.name))
    : [];
  const savedSourceDatasets = useMemo(
    () => apiSourceDatasets.map((record, index) => mapSourceDatasetRecord(record, 100 + apiSourceDatasets.length - index)),
    [apiSourceDatasets],
  );
  const sourceDatasets = savedSourceDatasets.length > 0 ? savedSourceDatasets : demoSourceDatasets;
  const wizardSteps = [
    {
      id: "overview",
      title: "Overview",
      summary: normalizedTargetName || "target dataset 이름을 입력합니다.",
      isComplete: Boolean(normalizedTargetName),
    },
    {
      id: "source",
      title: "Source 선택",
      summary: selectedSource ? selectedSource.name : "등록된 Source Dataset을 선택합니다.",
      isComplete: currentStepIndex > 1 && Boolean(selectedSource),
    },
    {
      id: "process",
      title: "Process",
      summary: selectedFields.length > 0 ? `ETL rule · ${selectedFields.length} fields` : "target 갱신 처리 규칙을 설정합니다.",
      isComplete: currentStepIndex > 3 && selectedFields.length > 0,
    },
    {
      id: "scheduling",
      title: "Scheduling",
      summary: targetScheduleMode === "manual" ? "Job manual trigger" : "Job schedule placeholder",
      isComplete: currentStepIndex > 4,
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
      title: "Configure",
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
  const canGoNext =
    (currentStep.id === "overview" && Boolean(normalizedTargetName)) ||
    (currentStep.id === "source" && Boolean(selectedSource)) ||
    (currentStep.id === "process" && selectedFields.length > 0) ||
    currentStep.id === "scheduling";
  const canGoNextSource =
    (currentSourceStep.id === "connection" && Boolean(sourceDraft)) ||
    (currentSourceStep.id === "raw-config" && Boolean(sourceDatasetName.trim() && sourceRawScope.trim()));
  const canCreateSourceDataset =
    Boolean(sourceDraft && sourceDatasetName.trim() && sourceRawScope.trim()) && !isSavingSourceDataset;
  const canCreateTargetDraft =
    Boolean(normalizedTargetName && selectedSource && selectedFields.length > 0 && selectedOutputSchema.length > 0) &&
    !isSavingTargetDraft;
  const canGoNextConnection =
    (currentConnectionStep.id === "connector-type" && Boolean(selectedConnectionType)) ||
    (currentConnectionStep.id === "configure" && Boolean(connectionName.trim() && connectionResource.trim()));

  useEffect(() => {
    let isActive = true;
    setIsSourceDatasetsLoading(true);
    listSourceDatasets()
      .then((records) => {
        if (!isActive) return;
        setApiSourceDatasets(records);
        setSourceDatasetError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setSourceDatasetError(error.message);
      })
      .finally(() => {
        if (isActive) {
          setIsSourceDatasetsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleSourceSelect(source) {
    setSelectedSource(source);
    setSelectedFields(source.columns);
    setLastCreatedTargetDraft(null);
    setTargetDraftError("");
    setNotice(`${source.name} source를 선택했습니다.`);
    setIsSourceModalOpen(false);
  }

  function selectSourceConnection(connection) {
    setSourceDraft(connection);
    setSourceDatasetName(`source_${normalizeDatasetName(connection.name)}`);
    setSourceRawScope(connection.resource);
    setLastCreatedSourceDatasetId("");
    setNotice(`${connection.name} external connection을 선택했습니다.`);
  }

  async function saveSourceDataset() {
    if (!canCreateSourceDataset) return;
    setIsSavingSourceDataset(true);
    setSourceDatasetError("");

    try {
      const record = await createSourceDataset({
        connection_id: sourceDraft.id,
        connection_name: sourceDraft.name,
        connection_type: sourceDraft.connectorId,
        name: sourceDatasetName.trim(),
        raw_scope: sourceRawScope.trim(),
        resource_label: sourceDraft.resourceLabel,
        schema_preview: sourceDraft.schema.map(({ name, type }) => ({ name, type })),
      });
      setApiSourceDatasets((records) => [record, ...records.filter((item) => item.id !== record.id)]);
      const mappedSource = mapSourceDatasetRecord(record);
      setSelectedSource(mappedSource);
      setSelectedFields(mappedSource.columns);
      setLastCreatedSourceDatasetId(record.id);
      setNotice(`${record.name} Source Dataset metadata를 저장했습니다.`);
    } catch (error) {
      setSourceDatasetError(error.message);
      setNotice(`Source Dataset 저장 실패: ${error.message}`);
    } finally {
      setIsSavingSourceDataset(false);
    }
  }

  async function saveTargetDatasetDraft() {
    if (!canCreateTargetDraft) return;
    setIsSavingTargetDraft(true);
    setTargetDraftError("");

    const schedule = {
      mode: targetScheduleMode,
      note: targetScheduleNote.trim(),
    };
    const processRule = {
      type: "select_fields",
      selected_fields: selectedFields,
    };

    try {
      const record = await createTargetDataset({
        name: normalizedTargetName,
        description: normalizedTargetDescription,
        source_dataset_id: selectedSource.id,
        source_dataset_name: selectedSource.name,
        source_type: selectedSource.sourceType,
        selected_fields: selectedFields,
        process_rule: processRule,
        schedule,
        output_schema: selectedOutputSchema.map(({ name, type }) => ({ name, type })),
      });
      setLastCreatedTargetDraft(record);
      setNotice(`${record.name} Target Dataset draft를 저장했습니다.`);
    } catch (error) {
      setTargetDraftError(error.message);
      setNotice(`Target Dataset draft 저장 실패: ${error.message}`);
    } finally {
      setIsSavingTargetDraft(false);
    }
  }

  function toggleField(column) {
    setLastCreatedTargetDraft(null);
    setTargetDraftError("");
    setSelectedFields((currentFields) =>
      currentFields.includes(column)
        ? currentFields.filter((field) => field !== column)
        : [...currentFields, column],
    );
  }

  function selectAllFields() {
    if (selectedSource) {
      setSelectedFields(selectedSource.columns);
      setLastCreatedTargetDraft(null);
      setTargetDraftError("");
    }
  }

  function clearFields() {
    setSelectedFields([]);
    setLastCreatedTargetDraft(null);
    setTargetDraftError("");
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
  }

  function selectConnectionType(connectionType) {
    setSelectedConnectionType(connectionType);
    setConnectionName(`conn_${connectionType.id}_demo`);
    setConnectionResource(connectionType.placeholder);
    setNotice(`${connectionType.label} external connection type을 선택했습니다.`);
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
    listSourceDatasets()
      .then((records) => {
        setApiSourceDatasets(records);
        setSourceDatasetError("");
      })
      .catch((error) => setSourceDatasetError(error.message));
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
              <p>외부 원천에 접속하기 위한 demo connection draft를 준비합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <button type="button" className="ghost-action" onClick={() => setIsDatasetTypeModalOpen(true)}>
              유형 변경
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
              {connectionWizardStepIndex > 0 ? (
                <button type="button" className="ghost-action" onClick={goBackConnection}>
                  <ArrowLeft size={16} />
                  뒤로가기
                </button>
              ) : (
                <span />
              )}
              {connectionWizardStepIndex < connectionWizardSteps.length - 1 ? (
                <button type="button" className="primary-action" onClick={goNextConnection} disabled={!canGoNextConnection}>
                  다음
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" className="primary-action" disabled>
                  Connection draft 준비
                  <CheckCircle2 size={16} />
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
              <p>외부 데이터 원천에 맞는 연결 유형을 선택합니다.</p>
            </div>
          </div>
          <div className="connection-type-grid" aria-label="External connector type choices">
            {externalConnectionTypes.map((connectionType) => (
              <button
                key={connectionType.id}
                type="button"
                className={selectedConnectionType?.id === connectionType.id ? "selected" : ""}
                onClick={() => selectConnectionType(connectionType)}
              >
                <span className="connection-card-icon">
                  <ServerCog size={18} />
                </span>
                <strong>{connectionType.label}</strong>
                <p>{connectionType.description}</p>
                <small>{connectionType.resourceLabel}</small>
              </button>
            ))}
          </div>
          <div className="wizard-placeholder compact">
            <CheckCircle2 size={22} />
            <strong>{selectedConnectionType.label} connector draft가 선택되었습니다</strong>
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
              <h3>Configure</h3>
              <p>실제 credential 없이 demo-safe connection profile만 설정합니다.</p>
            </div>
          </div>
          <div className="source-config-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>Connection profile</strong>
                  <p>Source Dataset이 나중에 참조할 외부 연결 draft입니다.</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>connection_name</span>
                <input
                  type="text"
                  value={connectionName}
                  onChange={(event) => setConnectionName(event.target.value)}
                  placeholder="conn_product_health_csv"
                />
              </label>
              <label className="target-name-field">
                <span>{selectedConnectionType.resourceLabel}</span>
                <input
                  type="text"
                  value={connectionResource}
                  onChange={(event) => setConnectionResource(event.target.value)}
                  placeholder={selectedConnectionType.placeholder}
                />
              </label>
              <div className="target-summary-strip">
                <span>Auth mode</span>
                <strong>{selectedConnectionType.authMode}</strong>
                <p>Secret 입력과 연결 테스트는 이번 Phase에서 제외합니다.</p>
              </div>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ShieldCheck size={18} />
                <div>
                  <strong>Demo safety</strong>
                  <p>실제 외부 시스템에 접속하거나 credential을 저장하지 않습니다.</p>
                </div>
              </div>
              <div className="source-config-summary connection-config-summary">
                <InfoCard title="Connector" value={selectedConnectionType.label} detail={selectedConnectionType.description} />
                <InfoCard title="Resource" value={connectionResource || selectedConnectionType.placeholder} detail={selectedConnectionType.resourceLabel} />
                <InfoCard title="Scope" value="AskLake demo" detail="owner: study" />
              </div>
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
            <strong>{connectionName.trim() || "connection_name 필요"}</strong>
            <p>demo external connection draft</p>
          </article>
          <article>
            <span>Connector type</span>
            <strong>{selectedConnectionType.label}</strong>
            <p>{selectedConnectionType.description}</p>
          </article>
          <article>
            <span>{selectedConnectionType.resourceLabel}</span>
            <strong>{connectionResource.trim() || selectedConnectionType.placeholder}</strong>
            <p>{selectedConnectionType.authMode}</p>
          </article>
        </div>
        <div className="wizard-placeholder compact">
          <CheckCircle2 size={22} />
          <strong>Connection draft 준비 완료. 실제 저장과 연결 테스트는 아직 호출하지 않습니다.</strong>
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
            <button type="button" className="ghost-action" onClick={() => setIsDatasetTypeModalOpen(true)}>
              유형 변경
            </button>
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
              {sourceWizardStepIndex > 0 ? (
                <button type="button" className="ghost-action" onClick={goBackSource}>
                  <ArrowLeft size={16} />
                  뒤로가기
                </button>
              ) : (
                <span />
              )}
              {sourceWizardStepIndex < sourceWizardSteps.length - 1 ? (
                <button type="button" className="primary-action" onClick={goNextSource} disabled={!canGoNextSource}>
                  다음
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" className="primary-action" onClick={saveSourceDataset} disabled={!canCreateSourceDataset}>
                  {isSavingSourceDataset ? "저장 중" : lastCreatedSourceDatasetId ? "Source dataset 저장됨" : "Source dataset 저장"}
                  {isSavingSourceDataset ? <Loader2 size={16} className="spin-icon" /> : <CheckCircle2 size={16} />}
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
              <p>이미 등록된 External Connection 중 raw/source dataset의 입력으로 사용할 연결을 고릅니다.</p>
            </div>
          </div>
          <div className="connection-type-grid source-connection-grid" aria-label="External connection choices for source dataset">
            {demoExternalConnections.map((connection) => (
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
                <small>{connection.typeLabel} · {connection.resourceLabel}</small>
              </button>
            ))}
          </div>
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
                  <InfoCard title={sourceDraft.resourceLabel} value={sourceDraft.resource} detail={`수정 ${sourceDraft.updatedLabel}`} />
                  <InfoCard title="Schema" value={`${sourceDraft.columns.length} columns`} detail={sourceDraft.columns.slice(0, 3).join(", ")} />
                </div>
              ) : (
                <EmptyState
                  icon={ServerCog}
                  title="선택된 External Connection이 없습니다"
                  body="등록된 connection card를 선택해 raw/source dataset 설정을 시작합니다."
                />
              )}
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
              <p>선택한 External Connection에서 만들 raw/source dataset 이름과 원천 범위를 설정합니다.</p>
            </div>
          </div>
          <div className="source-config-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>Source dataset draft</strong>
                  <p>AskLake raw/source zone에 등록될 dataset draft입니다.</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>source_dataset_name</span>
                <input
                  type="text"
                  value={sourceDatasetName}
                  onChange={(event) => setSourceDatasetName(event.target.value)}
                  placeholder="source_product_health_reviews"
                />
              </label>
              <label className="target-name-field">
                <span>{sourceDraft?.resourceLabel || "source_scope"}</span>
                <input
                  type="text"
                  value={sourceRawScope}
                  onChange={(event) => setSourceRawScope(event.target.value)}
                  placeholder={sourceDraft?.resource || "raw/source scope"}
                />
              </label>
              <div className="target-summary-strip">
                <span>External Connection</span>
                <strong>{sourceDraft?.name || "connection 필요"}</strong>
                <p>{sourceDraft ? `${sourceDraft.typeLabel} · credential과 연결 테스트는 제외` : "Connection 선택 단계에서 고릅니다."}</p>
              </div>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <FileJson size={18} />
                <div>
                  <strong>Raw schema preview</strong>
                  <p>Source Dataset으로 저장될 raw/source schema 예시입니다.</p>
                </div>
              </div>
              {sourceDraft ? (
                <div className="schema-preview-table" aria-label="Source dataset configure schema preview">
                  <div className="schema-preview-head">
                    <span>Field</span>
                    <span>Type</span>
                    <span>Sample</span>
                  </div>
                  {sourceDraft.schema.map((field) => (
                    <div className="schema-preview-row" key={field.name}>
                      <strong>{field.name}</strong>
                      <span>{field.type}</span>
                      <code>{field.sample}</code>
                    </div>
                  ))}
                </div>
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
        <div className="review-summary-grid">
          <article>
            <span>External Connection</span>
            <strong>{sourceDraft?.name || "선택 전"}</strong>
            <p>{sourceDraft ? `${sourceDraft.typeLabel} · ${sourceDraft.status}` : "1단계에서 connection을 선택합니다."}</p>
          </article>
          <article>
            <span>Source dataset</span>
            <strong>{sourceDatasetName.trim() || "dataset_name 필요"}</strong>
            <p>AskLake raw/source zone dataset draft입니다.</p>
          </article>
          <article>
            <span>{sourceDraft?.resourceLabel || "source scope"}</span>
            <strong>{sourceRawScope.trim() || "source_scope 필요"}</strong>
            <p>{sourceDraft ? `${sourceDraft.columns.length} columns · ${sourceDraft.updatedLabel}` : "raw metadata 대기"}</p>
          </article>
        </div>
        <div className="wizard-placeholder compact">
          <CheckCircle2 size={22} />
          <strong>저장하면 Source Dataset metadata만 생성됩니다. ingest job과 raw table 생성은 실행하지 않습니다.</strong>
        </div>
        {sourceDatasetError ? (
          <div className="wizard-placeholder compact warning">
            <AlertCircle size={22} />
            <strong>{sourceDatasetError}</strong>
          </div>
        ) : null}
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
              <strong>Create Target Dataset</strong>
              <p>Source Dataset을 가공해 target dataset과 ETL job definition을 준비합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <button type="button" className="ghost-action" onClick={() => setIsDatasetTypeModalOpen(true)}>
              유형 변경
            </button>
            <span className="badge slate">{currentStepIndex + 1}/5 단계</span>
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
              {currentStepIndex > 0 ? (
                <button type="button" className="ghost-action" onClick={goBack}>
                  <ArrowLeft size={16} />
                  뒤로가기
                </button>
              ) : (
                <span />
              )}
              {currentStepIndex < wizardSteps.length - 1 ? (
                <button type="button" className="primary-action" onClick={goNext} disabled={!canGoNext}>
                  다음
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" className="primary-action" onClick={saveTargetDatasetDraft} disabled={!canCreateTargetDraft}>
                  {isSavingTargetDraft ? "저장 중..." : lastCreatedTargetDraft ? "Target draft 저장됨" : "Target draft 저장"}
                  {isSavingTargetDraft ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
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
              <h3>Overview</h3>
              <p>ETL job이 갱신할 target dataset의 이름과 목적을 먼저 정합니다.</p>
            </div>
          </div>
          <section className="wizard-inline-panel target-setup-panel">
            <div className="table-title-line">
              <Table2 size={18} />
              <div>
                <strong>Target dataset draft</strong>
                <p>Source Dataset과 processing rule이 붙을 output dataset 초안입니다.</p>
              </div>
            </div>
            <label className="target-name-field">
              <span>target_dataset_name</span>
              <input
                type="text"
                value={targetName}
                onChange={(event) => {
                  setTargetName(event.target.value);
                  setLastCreatedTargetDraft(null);
                  setTargetDraftError("");
                }}
                placeholder="dataset_product_health_gold"
              />
            </label>
            <label className="target-name-field">
              <span>purpose</span>
              <input
                type="text"
                value={targetDescription}
                onChange={(event) => {
                  setTargetDescription(event.target.value);
                  setLastCreatedTargetDraft(null);
                  setTargetDraftError("");
                }}
                placeholder="제품 상태 분석용 gold dataset draft"
              />
            </label>
            <div className="target-summary-strip">
              <span>Output draft</span>
              <strong>{normalizedTargetName || "target_dataset_name 필요"}</strong>
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
              <h3>Source 선택</h3>
              <p>ETL job input으로 사용할 등록된 Source Dataset을 고릅니다.</p>
            </div>
          </div>
          <div className="wizard-source-layout">
            <div className="wizard-primary-choice">
              <span className="flow-step-icon">
                <Database size={18} aria-hidden="true" />
              </span>
              <div>
                <strong>{selectedSource ? selectedSource.name : "등록된 Source Dataset을 선택하세요"}</strong>
                <p>
                  {selectedSource
                    ? `${selectedSource.typeLabel} · ${selectedSource.columns.length} columns · ${selectedSource.resource}`
                    : "등록된 Source Dataset card 목록에서 target dataset의 입력을 고릅니다."}
                </p>
              </div>
              <button type="button" className="primary-action" onClick={() => openSourcePicker("target")}>
                {selectedSource ? "Source 변경" : "Source 선택"}
                <ArrowRight size={16} />
              </button>
            </div>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <FileJson size={18} />
                <div>
                  <strong>Schema preview</strong>
                  <p>{selectedSource ? "Process 단계의 입력 schema로 사용됩니다." : "Source Dataset 선택 후 컬럼 미리보기가 표시됩니다."}</p>
                </div>
              </div>
              {selectedSource ? (
                <div className="schema-preview-table" aria-label="Selected source schema preview">
                  <div className="schema-preview-head">
                    <span>Field</span>
                    <span>Type</span>
                    <span>Sample</span>
                  </div>
                  {selectedSource.schema.map((field) => (
                    <div className="schema-preview-row" key={field.name}>
                      <strong>{field.name}</strong>
                      <span>{field.type}</span>
                      <code>{field.sample}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Database}
                  title="아직 선택된 Source Dataset이 없습니다"
                  body="Source 선택을 눌러 등록된 Source Dataset을 고릅니다."
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
              <p>{selectedSource ? `${selectedSource.name}에서 target dataset을 만들 처리 규칙을 설정합니다.` : "Source Dataset을 먼저 선택합니다."}</p>
            </div>
          </div>
          <section className={`transform-panel wizard-inline-panel ${selectedSource ? "" : "disabled"}`}>
            <div className="table-title-line">
              <GitBranch size={18} />
              <div>
                <strong>ETL processing rule</strong>
                <p>이번 demo job definition에서는 Select Fields 규칙만 다룹니다.</p>
              </div>
            </div>
            {selectedSource ? (
              <>
                <div className="transform-toolbar">
                  <span>
                    Select Fields · {selectedFields.length}/{selectedSource.columns.length}
                  </span>
                  <div>
                    <button type="button" className="ghost-action" onClick={selectAllFields}>
                      전체 선택
                    </button>
                    <button type="button" className="ghost-action" onClick={clearFields}>
                      선택 해제
                    </button>
                  </div>
                </div>
                <div className="field-choice-grid" aria-label="Select Fields columns">
                  {selectedSource.columns.map((column) => (
                    <label className="field-choice" key={column}>
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(column)}
                        onChange={() => toggleField(column)}
                      />
                      <span>{column}</span>
                    </label>
                  ))}
                </div>
                <div className="transform-output-preview">
                  <div className="table-title-line">
                    <Table2 size={18} />
                    <div>
                      <strong>Target schema preview</strong>
                      <p>ETL job이 target dataset에 남길 output schema입니다.</p>
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
                      title="Target schema가 비어 있습니다"
                      body="target dataset에 남길 필드를 하나 이상 선택합니다."
                    />
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={GitBranch}
                title="Process 설정 대기"
                body="뒤로가기로 돌아가 Source Dataset을 먼저 선택합니다."
              />
            )}
          </section>
          <div className="wizard-placeholder compact">
            <CheckCircle2 size={22} />
            <strong>다음 단계에서 ETL job schedule 기본값을 확인합니다</strong>
          </div>
        </section>
      );
    }

    if (currentStep.id === "scheduling") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>4단계</span>
            <div>
              <h3>Scheduling</h3>
              <p>Target Dataset을 갱신할 ETL job의 실행 계획을 정합니다.</p>
            </div>
          </div>
          <section className="wizard-inline-panel target-schedule-panel">
            <div className="table-title-line">
              <Clock3 size={18} />
              <div>
                <strong>ETL job schedule</strong>
                <p>실제 cron 저장, timezone persistence, job API는 후속 backend Phase에서 다룹니다.</p>
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
                    setLastCreatedTargetDraft(null);
                    setTargetDraftError("");
                  }}
                />
                <span>
                  <strong>Manual</strong>
                  <small>데모 기본값. target dataset 갱신 job을 수동 실행 대상으로 표시합니다.</small>
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
                    setLastCreatedTargetDraft(null);
                    setTargetDraftError("");
                  }}
                />
                <span>
                  <strong>Schedule placeholder</strong>
                  <small>cron UI 자리만 확인합니다. job schedule 저장은 하지 않습니다.</small>
                </span>
              </label>
            </div>
            <label className="target-name-field">
              <span>schedule_note</span>
              <input
                type="text"
                value={targetScheduleNote}
                onChange={(event) => {
                  setTargetScheduleNote(event.target.value);
                  setLastCreatedTargetDraft(null);
                  setTargetDraftError("");
                }}
                placeholder="데모에서는 수동 실행으로만 준비합니다."
              />
            </label>
            <div className="target-summary-strip">
              <span>Job schedule summary</span>
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
            <span>5단계</span>
            <div>
              <h3>Review</h3>
              <p>Target Dataset draft와 ETL job definition을 최종 확인합니다.</p>
            </div>
          </div>
          <div className="review-summary-grid target-review-grid">
            <article>
              <span>Target dataset</span>
              <strong>{normalizedTargetName || "target_dataset_name 필요"}</strong>
              <p>{normalizedTargetDescription || "purpose 없음"}</p>
            </article>
            <article>
              <span>Job input</span>
              <strong>{selectedSource ? selectedSource.name : "선택 전"}</strong>
              <p>{selectedSource ? `Source Dataset · ${selectedSource.typeLabel} · ${selectedSource.resource}` : "Source 선택 단계에서 고릅니다."}</p>
            </article>
            <article>
              <span>ETL process</span>
              <strong>Select Fields rule · {selectedFields.length} fields</strong>
              <p>{selectedFieldSummary}{selectedFields.length > 3 ? "..." : ""}</p>
            </article>
            <article>
              <span>Target schema</span>
              <strong>{selectedOutputSchema.length} fields</strong>
              <p>{selectedOutputSchema.map((field) => field.name).slice(0, 4).join(", ") || "schema 없음"}</p>
            </article>
            <article>
              <span>ETL job definition</span>
              <strong>{targetScheduleMode === "manual" ? "Manual trigger" : "Schedule placeholder"}</strong>
              <p>{targetScheduleNote.trim() || "schedule note 없음"}</p>
            </article>
          </div>
          <div className="wizard-placeholder compact">
            <CheckCircle2 size={22} />
            <strong>저장 시 Target Dataset metadata와 ETL job definition draft만 생성하며 실행은 호출하지 않습니다.</strong>
          </div>
          {lastCreatedTargetDraft ? (
            <div className="wizard-placeholder compact success">
              <Save size={22} />
              <strong>저장된 draft id: {lastCreatedTargetDraft.id}</strong>
            </div>
          ) : null}
          {targetDraftError ? (
            <div className="wizard-placeholder compact warning">
              <AlertCircle size={22} />
              <strong>{targetDraftError}</strong>
            </div>
          ) : null}
        </section>
      );
    }

    return (
      <section className="wizard-step-body">
        <EmptyState icon={AlertCircle} title="알 수 없는 단계입니다" body="wizard step 설정을 확인합니다." />
      </section>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="데이터셋"
        body="External Connection, Source Dataset, Target Dataset을 순서대로 준비하는 데모 진입점입니다."
        actionLabel="데이터셋 생성"
        onAction={() => setIsDatasetTypeModalOpen(true)}
      />
      {datasetCreationMode ? (
        <div className="dataset-mode-strip" aria-label="Current dataset creation mode">
          <span>현재 생성 유형</span>
          <strong>
            {datasetCreationMode === "connection"
              ? "External Connection"
              : datasetCreationMode === "source"
                ? "Source Dataset"
                : "Target Dataset"}
          </strong>
          <p>
            {datasetCreationMode === "connection"
              ? "CSV, Kafka, DB, API, S3 같은 외부 원천 연결 설정을 준비하는 흐름입니다."
              : datasetCreationMode === "source"
                ? "등록된 External Connection에서 raw/source dataset을 만드는 흐름입니다."
                : "Source Dataset을 가공해 target dataset과 ETL job definition을 준비하는 흐름입니다."}
          </p>
        </div>
      ) : null}
      {datasetCreationMode === "connection" ? renderExternalConnectionWizard() : null}
      {datasetCreationMode === "source" ? renderSourceDatasetShell() : null}
      {datasetCreationMode === "target" ? renderTargetDatasetWizard() : null}
      {!datasetCreationMode ? (
        <section className="pipeline-table-card dataset-start-card">
          <div className="dataset-placeholder-body">
            <div className="dataset-placeholder-icon">
              <Database size={28} />
            </div>
            <div>
              <h3>먼저 만들 항목을 선택하세요</h3>
              <p>External Connection을 등록한 뒤 Source Dataset을 만들고, Source Dataset에서 Target Dataset과 ETL job draft를 준비합니다.</p>
            </div>
            <button type="button" className="primary-action" onClick={() => setIsDatasetTypeModalOpen(true)}>
              데이터셋 생성
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : null}
      {isDatasetTypeModalOpen ? (
        <DatasetTypeChoiceModal
          onClose={() => setIsDatasetTypeModalOpen(false)}
          onSelect={startDatasetCreation}
        />
      ) : null}
      {isSourceModalOpen ? (
        <SourceStartModal
          sources={sourceDatasets}
          isLoading={isSourceDatasetsLoading}
          error={sourceDatasetError}
          onClose={() => setIsSourceModalOpen(false)}
          onSelect={handleSourceSelect}
          onCreateNew={() => {
            setIsSourceModalOpen(false);
            startDatasetCreation("source");
            setNotice("Source Dataset 생성 화면으로 이동했습니다.");
          }}
        />
      ) : null}
    </div>
  );
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
            <p>CSV, Kafka, PostgreSQL, API, S3 같은 외부 원천의 연결 설정을 등록합니다.</p>
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
          <button type="button" onClick={() => onSelect("target")}>
            <span className="dataset-type-icon">
              <Table2 size={22} />
            </span>
            <strong>Target Dataset</strong>
            <p>Source Dataset을 가공해 target dataset과 ETL job definition을 준비합니다.</p>
            <small>{"Overview -> Source -> Process -> Scheduling -> Review"}</small>
          </button>
        </div>
      </section>
    </div>
  );
}

function SourceStartModal({ sources, isLoading, error, onClose, onSelect, onCreateNew }) {
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
            <p>Target Dataset의 입력으로 사용할 등록된 Source Dataset을 고릅니다.</p>
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
          {isLoading ? (
            <EmptyState
              icon={Loader2}
              title="Source Dataset 목록을 불러오는 중입니다"
              body="저장된 metadata를 확인하고 있습니다."
            />
          ) : error && sources.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="API 목록을 불러오지 못했습니다"
              body="데모 fallback 없이 backend 연결을 다시 확인합니다."
            />
          ) : visibleSources.length > 0 ? (
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
          {error && sources.length > 0 ? (
            <p className="source-picker-hint">API 조회 실패 시 현재 화면은 demo fallback 또는 마지막 저장 목록을 표시합니다. {error}</p>
          ) : null}
        </div>
        <footer>
          <button type="button" className="ghost-action" onClick={onClose}>
            취소
          </button>
          <button type="button" className="primary-action" onClick={onCreateNew}>
            새 source 연결
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

function CatalogPage({ navigate }) {
  const [selectedTag, setSelectedTag] = useState("전체");
  const { catalogState, refreshCatalog } = useWeek2CatalogState();
  const {
    catalogState: productHealthCatalogState,
    refreshCatalog: refreshProductHealthCatalog,
  } = useWeek2CatalogState(PRODUCT_HEALTH_DATASET_ID);
  const tags = ["전체", "bronze", "silver", "gold"];
  const catalog = catalogState.catalog;
  const isVisible = selectedTag === "전체" || selectedTag === (catalog?.layer || m1CatalogPlaceholder.layer);
  const productHealthStatus = productHealthReadiness(
    productHealthCatalogState.catalog,
    productHealthCatalogState.error,
    productHealthCatalogState.loading,
  );

  return (
    <div className="page-stack">
      <PageHeader
        title="데이터 카탈로그"
        body="M5가 생성한 dataset metadata와 lineage를 M6가 소비할 수 있게 보여주는 화면입니다."
        actionLabel={catalogState.loading ? "조회 중" : "Catalog 새로고침"}
        onAction={refreshCatalog}
      />
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
      {catalogState.error ? (
        <EmptyState
          icon={AlertCircle}
          title="CatalogMetadata를 불러오지 못했습니다"
          body="아직 successful Week2 run이 없을 수 있습니다. /etl에서 로컬 runner 실행 후 다시 새로고침하세요."
        />
      ) : null}
      {catalogState.loading ? (
        <EmptyState icon={Loader2} title="CatalogMetadata 조회 중" body={WEEK2_DEFAULT_DATASET_ID} />
      ) : null}
      <ProductHealthReadinessPanel
        readiness={productHealthStatus}
        onRefresh={refreshProductHealthCatalog}
        loading={productHealthCatalogState.loading}
        compact={false}
      />
      {catalog && isVisible ? (
        <>
          <section className="catalog-feature">
            <div className="dataset-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="catalog-title-row">
                <h3>{catalog.name}</h3>
                <span>{catalog.contract}</span>
                <span>{catalog.metrics?.quality?.schema_match || "quality unknown"}</span>
              </div>
              <p>{catalog.dataset_id} metadata를 M6 query context와 lineage 확인에 사용할 수 있습니다.</p>
            </div>
            <button type="button" className="icon-link" onClick={() => navigate("/catalog-detail")} aria-label="catalog detail">
              <ArrowRight size={18} />
            </button>
            <button type="button" className="ghost-action" onClick={() => navigate("/ask")}>
              AI Query
              <MessageSquareText size={16} />
            </button>
          </section>
          <div className="grid three">
            <InfoCard title="Dataset" value={catalog.dataset_id} detail={catalog.name} />
            <InfoCard title="Layer" value={catalog.layer} detail={catalog.version} />
            <InfoCard title="Query table" value={catalog.query?.table_name} detail="M6 allowlist context" />
          </div>
          <div className="grid three">
            <InfoCard title="Rows" value={formatMetric(catalog.metrics?.row_count)} detail={catalog.metrics?.semantics?.row_count} />
            <InfoCard title="Bytes" value={formatMetric(catalog.metrics?.bytes)} detail={catalog.metrics?.semantics?.bytes} />
            <InfoCard title="Lineage run" value={catalog.lineage?.run_id} detail={catalog.lineage?.pipeline_id} />
          </div>
          <section className="contract-panel">
            <div>
              <p className="eyebrow">Storage contract</p>
              <code>{catalog.s3_uri}</code>
            </div>
            <p>{catalog.storage?.local_fallback_path}</p>
          </section>
          <section className="runtime-readiness-panel">
            <div>
              <p className="eyebrow">M6 query readiness</p>
              <h3>DuckDB Query가 읽을 evidence 확인</h3>
              <p>AI Query는 CatalogMetadata의 read-only SQL 계약과 local fallback output을 기준으로 실행됩니다.</p>
            </div>
            <div className="runtime-check-list">
              <RuntimeCheck label="local output" ready={Boolean(catalog.storage?.local_fallback_path)} />
              <RuntimeCheck label="readonly SQL" ready={Boolean(catalog.query?.allow_readonly_sql)} />
              <RuntimeCheck label="lineage" ready={Boolean(catalog.lineage?.run_id)} />
            </div>
          </section>
          <DataTable columns={["field", "type", "nullable"]} rows={catalogSchemaRows(catalog)} />
        </>
      ) : null}
      {catalog && !isVisible ? (
        <EmptyState icon={Database} title={`${selectedTag} catalog가 없습니다`} body={`${catalog.layer} layer metadata만 live API에서 조회됐습니다.`} />
      ) : null}
    </div>
  );
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
  const [queryText, setQueryText] = useState("Amazon reviews에서 평점 높은 상품 알려줘");
  const [queryState, setQueryState] = useState({
    result: null,
    error: "",
    loading: false,
  });
  const [viewMode, setViewMode] = useState("table");
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
  const answerMetadata = queryState.result?.answer_metadata || fallbackAnswerMetadata(queryState.result);
  const routeIsExecutableSql = route === "sql" && queryState.result?.status === "succeeded";
  const displaySql = queryState.result
    ? queryDisplaySql(queryResult?.sql ?? queryState.result.sql)
    : m1AiQueryPlaceholder.sql;
  const { catalogState: productHealthCatalogState, refreshCatalog: refreshProductHealthCatalog } =
    useWeek2CatalogState(PRODUCT_HEALTH_DATASET_ID);
  const productHealthStatus = productHealthReadiness(
    productHealthCatalogState.catalog,
    productHealthCatalogState.error,
    productHealthCatalogState.loading,
  );

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
    } catch (error) {
      setQueryState((previous) => ({
        result: previous.result,
        error: error.message,
        loading: false,
      }));
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
          <p className="eyebrow">{queryState.result?.contract || m1AiQueryPlaceholder.contract}</p>
          <div className="query-status-row">
            <h3>{queryState.result?.status || "질문 대기"}</h3>
            {queryState.result?.guardrail ? (
              <span className={`badge ${queryStatusBadgeClass(queryState.result)}`}>
                {queryState.result.guardrail.validation_status}
              </span>
            ) : null}
          </div>
          <p>{queryState.result?.summary || "아직 실행된 질문이 없습니다."}</p>
          <AnswerMetadataPanel metadata={answerMetadata} result={queryState.result} />
          {queryState.result?.guardrail?.failure_message ? (
            <p className="form-error">{queryState.result.guardrail.failure_message}</p>
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
          <code>{displaySql}</code>
          <div className="runtime-check-list compact">
            <RuntimeCheck label="DuckDB runtime" ready={isDuckDbEngine(queryResult?.engine)} />
            <RuntimeCheck label={`route=${route || "pending"}`} ready={routeIsExecutableSql} />
            <RuntimeCheck label="SQL rows" ready={rows.length > 0} />
            <RuntimeCheck label="evidence" ready={evidence.length > 0} />
          </div>
          <div className="segmented-control">
            {["table", "chart"].map((mode) => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? "active" : ""}
                onClick={() => setViewMode(mode)}
              >
                {mode === "table" ? <Table2 size={14} /> : <BarChart3 size={14} />}
                {mode}
              </button>
            ))}
          </div>
          <p>Chart spec: {formatChartSpec(queryState.result?.chart_spec)}</p>
        </div>
      </section>
      <ProductHealthReadinessPanel
        readiness={productHealthStatus}
        onRefresh={refreshProductHealthCatalog}
        loading={productHealthCatalogState.loading}
        compact
      />
      <DemoReadinessPanel items={demoReadinessItems(productHealthStatus)} />
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
              title="Answer"
              value={answerProviderLabel(answerMetadata)}
              detail={answerMetadataDetail(answerMetadata)}
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
              <button type="button" className="primary-action" onClick={() => navigate("/catalog-detail")}>
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
      ) : (
        <EmptyState
          icon={MessageSquareText}
          title="질문을 실행하면 결과가 표시됩니다"
          body="M1은 M6 응답을 표시하고 SQL, 요약, evidence를 직접 생성하지 않습니다."
        />
      )}
    </div>
  );
}

function queryStatusBadgeClass(result) {
  if (result.status === "succeeded" && result.guardrail?.validation_status === "passed") return "green";
  if (result.status === "blocked" || result.guardrail?.validation_status === "blocked") return "orange";
  if (result.status === "failed" || result.guardrail?.validation_status === "failed") return "red";
  return "blue";
}

function queryRouteBadgeClass(route) {
  if (route === "sql") return "green";
  if (route === "unsupported") return "orange";
  if (route === "rag" || route === "hybrid") return "blue";
  return "gray";
}

function answerSourceBadgeClass(metadata) {
  if (!metadata) return "gray";
  if (metadata.grounding_state === "blocked") return "orange";
  if (metadata.fallback_used) return "orange";
  if (metadata.source === "external") return "green";
  if (metadata.source === "template") return "blue";
  return "gray";
}

function fallbackAnswerMetadata(result) {
  if (!result) return m1AiQueryPlaceholder.answer_metadata;
  const blocked = result.status === "blocked" || result.guardrail?.validation_status === "blocked";
  return {
    source: "internal",
    provider: "m6",
    fallback_used: false,
    fallback_reason: null,
    used_evidence_indexes: [],
    grounding_state: blocked ? "blocked" : "insufficient_evidence",
  };
}

function groundingBadgeClass(state) {
  if (state === "grounded") return "green";
  if (state === "blocked") return "orange";
  if (state === "insufficient_evidence") return "red";
  return "gray";
}

function answerProviderLabel(metadata) {
  if (!metadata) return "answer pending";
  const provider = formatMetric(metadata.provider, "m6");
  const source = formatMetric(metadata.source, "internal");
  return `${provider} / ${source}`;
}

function answerMetadataDetail(metadata) {
  if (!metadata) return "질문 실행 후 표시";
  if (metadata.fallback_used) {
    return `fallback: ${formatMetric(metadata.fallback_reason)}`;
  }
  if (metadata.grounding_state === "blocked") return "M6 내부 보류 응답";
  return `evidence indexes: ${formatEvidenceIndexes(metadata.used_evidence_indexes)}`;
}

function formatEvidenceIndexes(indexes) {
  return Array.isArray(indexes) && indexes.length ? indexes.join(", ") : "-";
}

function AnswerMetadataPanel({ metadata, result }) {
  const hasResult = Boolean(result);
  const nextMetadata = metadata || {};
  return (
    <section className="answer-metadata-strip" aria-label="Answer generation metadata">
      <div className="answer-metadata-heading">
        <ShieldQuestion size={16} />
        <span>Answer generation</span>
      </div>
      <div className="answer-metadata-badges">
        <span className={`badge ${answerSourceBadgeClass(nextMetadata)}`}>
          {hasResult ? answerProviderLabel(nextMetadata) : "pending"}
        </span>
        <span className={`badge ${groundingBadgeClass(nextMetadata.grounding_state)}`}>
          {hasResult ? formatMetric(nextMetadata.grounding_state, "pending") : "pending"}
        </span>
        {nextMetadata.fallback_used ? (
          <span className="badge orange">fallback</span>
        ) : null}
      </div>
      <p>
        {hasResult
          ? answerMetadataDetail(nextMetadata)
          : "질문을 실행하면 provider, fallback, evidence 사용 상태가 표시됩니다."}
      </p>
    </section>
  );
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
          <p className="eyebrow">Product Health readiness</p>
          <h3>{readiness.title}</h3>
          <p>{readiness.body}</p>
        </div>
        <div className="product-health-actions">
          <span className={`badge ${productHealthBadgeClass(readiness.status)}`}>{readiness.status}</span>
          <button type="button" className="icon-link" onClick={onRefresh} disabled={loading} aria-label="Product Health readiness 새로고침">
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
        <button type="button">"매출 기준 상위 고객 10명을 보여줘"</button>
        <button type="button">"지난달 주문 수는 몇 건이야?"</button>
        <button type="button">"gmail.com 이메일 도메인을 가진 사용자를 보여줘"</button>
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
