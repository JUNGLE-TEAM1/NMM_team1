import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  ChevronRight,
  Database,
  FileJson,
  GitBranch,
  GitMerge,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";

import { getHealth } from "../api/asklakeClient";
import asklakeLogo from "../assets/asklake-logo.png";
import { StatusPill } from "../components/StatusPill";
import "./styles.css";

const navItems = [
  {
    path: "/catalog",
    label: "데이터 카탈로그",
    description: "Metadata",
    icon: LayoutDashboard,
  },
  {
    path: "/sources",
    label: "데이터 통합",
    description: "소스 연결",
    icon: GitMerge,
  },
  {
    path: "/schema-preview",
    label: "스키마 미리보기",
    description: "추론/보정",
    icon: FileJson,
  },
  {
    path: "/runs",
    label: "실행/모니터링",
    description: "Run 상태",
    icon: ListChecks,
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

const sourceConfig = {
  contract: "SourceConfig",
  tenant_id: "tenant_demo",
  source_id: "source_amazon_reviews_demo",
  source_type: "amazon_reviews_json",
  name: "Amazon Reviews JSON demo source",
  connection_ref: {
    kind: "local_file_or_minio_object",
    path_status: "pending_data_location_decision",
  },
  options: {
    sample_profile: "demo",
    format: "jsonl",
    sample_rows_decision: "M3 sample reader 구현 전 확정",
  },
};

const schemaDefinition = {
  contract: "SchemaDefinition",
  schema_version: "schema_reviews_v1",
  dataset_id: "dataset_reviews_silver",
  fields: [
    ["review_id", "string", "false", "none"],
    ["product_id", "string", "false", "none"],
    ["rating", "number", "true", "cast override"],
    ["review_text", "string", "true", "none"],
    ["review_time", "timestamp", "true", "cast override"],
    ["verified_purchase", "boolean", "true", "none"],
  ],
};

const workflowDefinition = {
  contract: "WorkflowDefinition",
  pipeline_id: "pipeline_reviews_json_e2e",
  nodes: [
    ["Source", "Amazon Reviews JSON", "M1/M3 source config"],
    ["Select/Filter", "필드 선택", "M5 workflow node"],
    ["Cast/Normalize", "rating, review_time 보정", "M3 schema output"],
    ["Aggregate", "product_id별 review metric", "M5 workflow node"],
    ["Load", "dataset_reviews_gold", "M5 catalog handoff"],
  ],
};

const catalogMetadata = {
  contract: "CatalogMetadata",
  dataset_id: "dataset_reviews_gold",
  name: "Amazon Reviews Gold",
  layer: "gold",
  s3_uri: "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/",
  query_table: "reviews_gold",
  quality: "schema_match, row_count 확인 대기",
};

const aiQueryResult = {
  contract: "AIQueryResult",
  status: "M6 연결 대기",
  question: "Day 4 검증 질문 확정 전",
  sql: "SELECT product_id, review_count, average_rating FROM reviews_gold LIMIT 10",
  chart_spec: "bar(product_id, review_count)",
};

const integrationRows = [
  ["M2 Batch", "batch source/run metrics", "ExecutionResult, CatalogMetadata"],
  ["M3 JSON/Schema", "schema preview/override", "SourceConfig, SchemaDefinition"],
  ["M4 Kafka", "streaming status/lag/throughput", "SourceConfig, ExecutionResult"],
  ["M5 Workflow/Catalog", "run status, logs, retry, lineage", "WorkflowDefinition, ExecutionResult, CatalogMetadata"],
  ["M6 RAG/AI Query", "question, evidence, SQL result, chart", "AIQueryResult, QueryResult"],
];

const startSteps = [
  ["소스 연결", "기존 연결 선택 또는 새 연결 생성", Database],
  ["원본 데이터", "테이블, 컬렉션, 경로, 토픽 선택", FileJson],
  ["파이프라인 구성", "선택한 원본으로 캔버스 시작", GitBranch],
];

const pipelineRows = [
  {
    name: "고객 주문 통합 Silver Dataset",
    owner: "데이터 엔지니어링 팀",
    type: "결과 데이터셋",
    status: "활성",
    mode: "배치",
    purpose: "MongoDB 고객 프로필 컬럼과 PostgreSQL 주문 컬럼을 user_id 기준으로 조인해 분석 가능한 형태로 정제한 Silver Dataset입니다.",
    updated: "2026. 6. 25. 오후 4:59:27",
  },
  {
    name: "고객 주문 원본 Bronze Dataset",
    owner: "데이터 엔지니어링 팀",
    type: "결과 데이터셋",
    status: "활성",
    mode: "배치",
    purpose: "MongoDB 고객 프로필과 주문 거래 PostgreSQL 데이터를 원본 형태로 S3 Bronze 영역에 적재한 데이터셋입니다.",
    updated: "2026. 6. 25. 오후 4:59:27",
  },
  {
    name: "mongo_customer_profiles",
    owner: "고객 플랫폼 팀",
    type: "수집 대상",
    status: "비활성",
    mode: "배치",
    purpose: "MongoDB 고객 프로필 컬렉션에서 고객 등급과 지역 정보를 가져옵니다.",
    updated: "2026. 6. 25. 오후 4:59:27",
  },
  {
    name: "postgres_order_transactions",
    owner: "주문 플랫폼 팀",
    type: "수집 대상",
    status: "비활성",
    mode: "배치",
    purpose: "PostgreSQL 주문 테이블에서 주문 금액과 상태 컬럼을 가져옵니다.",
    updated: "2026. 6. 25. 오후 4:59:27",
  },
];

function normalizePath(pathname) {
  if (pathname === "/" || pathname === "" || pathname === "/dataset") return "/sources";
  if (pathname === "/etl") return "/runs";
  if (pathname === "/query") return "/ask";
  return navItems.some((item) => item.path === pathname) ? pathname : "/sources";
}

export function App() {
  const [health, setHealth] = useState({ state: "loading", message: "확인 중" });
  const [activePath, setActivePath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    refreshHealth();
  }, []);

  useEffect(() => {
    const onPopState = () => setActivePath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
    const displayPath = nextPath === "/sources" ? "/dataset" : nextPath;
    window.history.pushState({}, "", displayPath);
    setActivePath(nextPath);
  }

  const activeItem = useMemo(
    () => navItems.find((item) => item.path === activePath) || navItems[0],
    [activePath],
  );

  return (
    <main className="m1-shell">
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
        <button type="button" className="collapse-button" aria-label="Collapse sidebar">
          <ChevronRight size={14} />
        </button>
        <header className="topbar">
          <div className="topbar-search">
            <Search size={18} />
            <span>데이터셋, source, pipeline 검색...</span>
            <kbd>/</kbd>
          </div>
          <div className="topbar-actions">
            <button type="button" className="refresh-button" onClick={refreshHealth}>
              <RefreshCw size={16} />
              Health
            </button>
            <StatusPill health={health} />
            <div className="user-chip" aria-label="Current demo user">
              <span>S</span>
            </div>
            <div className="user-meta">
              <strong>study</strong>
              <span>관리자</span>
            </div>
          </div>
        </header>

        <section className="page-surface">
          {activePath === "/sources" ? <SourcesPage /> : null}
          {activePath === "/schema-preview" ? <SchemaPreviewPage /> : null}
          {activePath === "/runs" ? <RunStatusPage /> : null}
          {activePath === "/catalog" ? <CatalogPage /> : null}
          {activePath === "/ask" ? <AiQueryPage /> : null}
          {activePath === "/dashboard" ? <DashboardPlaceholder /> : null}
          {activePath === "/admin" ? <AdminPlaceholder /> : null}
        </section>
        <AiCopilotDock />
      </section>
    </main>
  );
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

function SourcesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="데이터 통합"
        body="파이프라인을 만들고, 필요한 경우 연결을 보조 관리합니다."
        actionLabel="연결 대기"
      />
      <section className="start-panel">
        <div className="start-panel-copy">
          <span className="section-icon">
            <Plus size={16} />
          </span>
          <div>
            <h3>새 파이프라인 시작</h3>
            <p>M2~M5 구현이 붙으면 이 흐름에서 source 선택, schema preview, workflow 실행으로 이어집니다.</p>
          </div>
        </div>
        <div className="start-steps">
          {startSteps.map(([title, description, Icon], index) => (
            <article className="start-step" key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>
                  <Icon size={15} />
                  {title}
                </strong>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <PipelineTable />
      <div className="grid two">
        <InfoCard title="Contract" value={sourceConfig.contract} detail="Producer: M1 / Consumers: M2, M3, M4, M5" />
        <InfoCard title="Demo Tenant" value={sourceConfig.tenant_id} detail="실제 로그인/RBAC 없이 tenant_id 구조만 유지" />
        <InfoCard title="Source ID" value={sourceConfig.source_id} detail={sourceConfig.source_type} />
        <InfoCard title="Connection" value={sourceConfig.connection_ref.kind} detail={sourceConfig.connection_ref.path_status} />
      </div>
      <EmptyState
        icon={Boxes}
        title="아직 등록된 실제 source가 없습니다"
        body="M3 JSON sample reader 또는 M2/M4 connector가 붙으면 이 영역이 source 목록과 connection test 결과로 바뀝니다."
      />
    </div>
  );
}

function PipelineTable() {
  return (
    <section className="pipeline-table-card">
      <div className="table-card-header">
        <div>
          <h2>데이터셋/파이프라인</h2>
          <div className="table-title-line">
            <ListChecks size={20} />
            <div>
              <strong>구축 중인 파이프라인</strong>
              <p>소스, 변환, 결과 데이터셋이 연결된 작업을 확인합니다.</p>
            </div>
          </div>
        </div>
        <label className="table-search">
          <Search size={16} />
          <input value="" readOnly placeholder="파이프라인 검색..." />
        </label>
      </div>
      <div className="wide-table-wrap">
        <table className="demo-table">
          <thead>
            <tr>
              <th>파이프라인 이름</th>
              <th>담당자</th>
              <th>결과 유형</th>
              <th>구축 상태</th>
              <th>실행 방식</th>
              <th>목적</th>
              <th>최근 수정일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {pipelineRows.map((row) => (
              <tr key={row.name}>
                <td className="table-link">{row.name}</td>
                <td>{row.owner}</td>
                <td>
                  <span className={`badge ${row.type === "결과 데이터셋" ? "orange" : "gray"}`}>{row.type}</span>
                </td>
                <td>
                  <span className={`badge ${row.status === "활성" ? "green" : "slate"}`}>{row.status}</span>
                </td>
                <td>
                  <span className="badge blue">{row.mode}</span>
                </td>
                <td className="purpose-cell">{row.purpose}</td>
                <td>{row.updated}</td>
                <td>
                  <button type="button" className="icon-danger" aria-label="삭제 비활성">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        <span>전체 4개 중 1-4 표시</span>
        <div>
          <button type="button">이전</button>
          <button type="button" className="active-page">1</button>
          <button type="button">다음</button>
        </div>
      </footer>
    </section>
  );
}

function SchemaPreviewPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="스키마 미리보기"
        body="Amazon Reviews JSON의 추론 스키마와 사용자 보정 결과를 렌더링할 위치입니다."
        actionLabel="M3 연결 예정"
      />
      <DataTable
        columns={["field path", "type", "nullable", "override"]}
        rows={schemaDefinition.fields}
      />
      <EmptyState
        icon={AlertCircle}
        title="sample size와 실제 파일 경로는 아직 확정 전입니다"
        body="계약 fixture의 TODO 값을 실제 M3 구현 결과로 교체해야 합니다."
      />
    </div>
  );
}

function RunStatusPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="실행/모니터링"
        body="M5가 WorkflowDefinition, ExecutionResult, 로그, retry 상태를 연결할 화면입니다."
        actionLabel="실행 결과 없음"
      />
      <div className="pipeline-strip">
        {workflowDefinition.nodes.map(([type, label, detail], index) => (
          <div className="pipeline-node" key={type}>
            <span>{index + 1}</span>
            <strong>{type}</strong>
            <p>{label}</p>
            <small>{detail}</small>
            {index < workflowDefinition.nodes.length - 1 ? <ChevronRight size={18} /> : null}
          </div>
        ))}
      </div>
      <EmptyState
        icon={Loader2}
        title="실행 버튼과 자동 완료 연출은 없습니다"
        body="실제 run 상태는 M5 ExecutionResult가 붙은 뒤 queued, running, succeeded, failed 등으로 표시됩니다."
      />
    </div>
  );
}

function CatalogPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="데이터 카탈로그"
        body="M5가 생성한 dataset metadata와 lineage를 M6가 소비할 수 있게 보여주는 화면입니다."
        actionLabel="CatalogMetadata 연결 대기"
      />
      <section className="catalog-feature">
        <div className="dataset-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="catalog-title-row">
            <h3>{catalogMetadata.name}</h3>
            <span>Gold</span>
            <span>품질 확인 대기</span>
          </div>
          <p>타겟 데이터셋을 찾고 구조를 확인하는 demo3 카탈로그 카드 스타일을 M1 shell에 맞춰 보존했습니다.</p>
        </div>
        <ArrowRight size={18} />
      </section>
      <div className="grid three">
        <InfoCard title="Dataset" value={catalogMetadata.dataset_id} detail={catalogMetadata.name} />
        <InfoCard title="Layer" value={catalogMetadata.layer} detail="Trusted 전 gate 상태 표시 예정" />
        <InfoCard title="Query table" value={catalogMetadata.query_table} detail="M6 allowlist context" />
      </div>
      <section className="contract-panel">
        <div>
          <p className="eyebrow">Storage contract</p>
          <code>{catalogMetadata.s3_uri}</code>
        </div>
        <p>{catalogMetadata.quality}</p>
      </section>
    </div>
  );
}

function AiQueryPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="AI Query"
        body="검증 질문, selected dataset, evidence, SQL, chart spec을 표시할 위치입니다."
        actionLabel="M6 연결 대기"
      />
      <section className="ask-layout">
        <div className="question-box">
          <Search size={18} />
          <span>{aiQueryResult.question}</span>
        </div>
        <div className="contract-panel">
          <p className="eyebrow">{aiQueryResult.contract}</p>
          <h3>{aiQueryResult.status}</h3>
          <code>{aiQueryResult.sql}</code>
          <p>Chart spec: {aiQueryResult.chart_spec}</p>
        </div>
      </section>
      <DataTable
        columns={["module", "M1 surface", "contract"]}
        rows={integrationRows}
      />
    </div>
  );
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
        title="Dashboard demo surface"
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
        body="demo3의 admin navigation 자리를 보존하되, 실제 권한 관리는 M1 범위 밖입니다."
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

function AiCopilotDock() {
  return (
    <aside className="ai-copilot-dock">
      <header>
        <div className="copilot-icon">
          <Sparkles size={16} />
        </div>
        <div>
          <strong>AI 도우미</strong>
          <span>자연어 SQL 변환</span>
        </div>
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

function PageHeader({ title, body, actionLabel }) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <button type="button" className="ghost-action">
        {actionLabel}
      </button>
    </header>
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
