import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Boxes,
  ChevronRight,
  Database,
  FileJson,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

import { getHealth } from "../api/asklakeClient";
import { StatusPill } from "../components/StatusPill";
import "./styles.css";

const navItems = [
  {
    path: "/sources",
    label: "Source",
    description: "M2/M3/M4 입력 연결",
    icon: Database,
  },
  {
    path: "/schema-preview",
    label: "Schema Preview",
    description: "M3 스키마 추론/보정",
    icon: FileJson,
  },
  {
    path: "/runs",
    label: "Run Status",
    description: "M5 실행 상태와 증거",
    icon: ListChecks,
  },
  {
    path: "/catalog",
    label: "Catalog",
    description: "M5 CatalogMetadata",
    icon: LayoutDashboard,
  },
  {
    path: "/ask",
    label: "AI Query",
    description: "M6 AIQueryResult",
    icon: MessageSquareText,
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

function normalizePath(pathname) {
  if (pathname === "/" || pathname === "") return "/sources";
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
    window.history.pushState({}, "", nextPath);
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
          <div className="brand-mark">AL</div>
          <div>
            <p className="brand-kicker">AskLake</p>
            <h1>M1 UI Shell</h1>
          </div>
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

        <section className="sidebar-note">
          <ShieldCheck size={18} />
          <div>
            <strong>Demo effects removed</strong>
            <span>전역 mock, 자동 로그인, 자동 완료 없이 연결 대기 상태만 표시합니다.</span>
          </div>
        </section>
      </aside>

      <section className="shell-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Week 2 Platform Core</p>
            <h2>{activeItem.label}</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="refresh-button" onClick={refreshHealth}>
              <RefreshCw size={16} />
              Health
            </button>
            <StatusPill health={health} />
          </div>
        </header>

        <section className="page-surface">
          {activePath === "/sources" ? <SourcesPage /> : null}
          {activePath === "/schema-preview" ? <SchemaPreviewPage /> : null}
          {activePath === "/runs" ? <RunStatusPage /> : null}
          {activePath === "/catalog" ? <CatalogPage /> : null}
          {activePath === "/ask" ? <AiQueryPage /> : null}
        </section>
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
      <PageIntro
        icon={Database}
        status="API 연결 대기"
        title="Source 등록 Shell"
        body="M2, M3, M4가 각 source connector를 붙일 수 있도록 SourceConfig 계약을 먼저 보여줍니다."
      />
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

function SchemaPreviewPage() {
  return (
    <div className="page-stack">
      <PageIntro
        icon={FileJson}
        status="M3 연결 예정"
        title="Schema Preview / Override Shell"
        body="Amazon Reviews JSON의 추론 스키마와 사용자 보정 결과를 렌더링할 위치입니다."
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
      <PageIntro
        icon={GitBranch}
        status="실행 결과 없음"
        title="Workflow / Run Status Shell"
        body="M5가 WorkflowDefinition, ExecutionResult, 로그, retry 상태를 연결할 화면입니다."
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
      <PageIntro
        icon={LayoutDashboard}
        status="CatalogMetadata 연결 대기"
        title="Catalog Shell"
        body="M5가 생성한 dataset metadata와 lineage를 M6가 소비할 수 있게 보여주는 화면입니다."
      />
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
      <PageIntro
        icon={MessageSquareText}
        status="M6 연결 대기"
        title="AI Query Shell"
        body="검증 질문, selected dataset, evidence, SQL, chart spec을 표시할 위치입니다."
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
