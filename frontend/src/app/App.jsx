import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  FileJson,
  GitBranch,
  GitMerge,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  MessageSquareText,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { getHealth } from "../api/asklakeClient";
import asklakeLogo from "../assets/asklake-logo.png";
import { StatusPill } from "../components/StatusPill";
import {
  m1AiQueryPlaceholder,
  m1CatalogPlaceholder,
  m1ConnectionPlaceholders,
  m1IntegrationRows,
  m1PipelinePlaceholders,
  m1SchemaPreviewPlaceholder,
  m1SourceConfigPlaceholder,
  m1StartSteps,
  m1WorkflowPlaceholder,
} from "./m1StaticShellData";
import "./styles.css";

const navItems = [
  {
    path: "/sources",
    label: "데이터 통합",
    description: "소스 연결",
    icon: GitMerge,
  },
  {
    path: "/runs",
    label: "실행/모니터링",
    description: "Run 상태",
    icon: ListChecks,
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

const stepIcons = {
  source: Database,
  schema: FileJson,
  workflow: GitBranch,
};

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
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [notice, setNotice] = useState("");

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
    const displayPath = routeToUrl(nextPath);
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
            <span>데이터셋, source, pipeline 검색...</span>
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
          {notice ? <ToastNotice message={notice} onClose={() => setNotice("")} /> : null}
          {activePath === "/sources" ? <SourcesPage navigate={navigate} setNotice={setNotice} /> : null}
          {activePath === "/etl-visual" ? <VisualEditorPage navigate={navigate} setNotice={setNotice} /> : null}
          {activePath === "/runs" ? <RunStatusPage navigate={navigate} /> : null}
          {activePath === "/catalog" ? <CatalogPage navigate={navigate} /> : null}
          {activePath === "/catalog-detail" ? <CatalogDetailShell navigate={navigate} /> : null}
          {activePath === "/ask" ? <AiQueryPage setNotice={setNotice} /> : null}
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
  if (path === "/catalog-detail") return "/catalog/dataset_reviews_gold";
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
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isManagingConnections, setIsManagingConnections] = useState(() =>
    new URLSearchParams(window.location.search).get("manage") === "connections",
  );

  function openConnectionManager() {
    window.history.pushState({}, "", "/dataset?manage=connections");
    setIsManagingConnections(true);
  }

  function closeConnectionManager() {
    window.history.pushState({}, "", "/dataset");
    setIsManagingConnections(false);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="데이터 통합"
        body="파이프라인을 만들고, 필요한 경우 연결을 보조 관리합니다."
        actionLabel={isManagingConnections ? "파이프라인 목록" : "연결 관리"}
        onAction={isManagingConnections ? closeConnectionManager : openConnectionManager}
      />
      {isManagingConnections ? (
        <ConnectionManagerShell onBack={closeConnectionManager} setNotice={setNotice} />
      ) : (
        <>
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
          {m1StartSteps.map(([title, description, iconKey], index) => {
            const Icon = stepIcons[iconKey];
            return (
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
            );
          })}
        </div>
        <div className="start-actions">
          <button type="button" className="primary-action" onClick={() => setIsStartOpen(true)}>
            소스 선택하고 시작
            <ArrowRight size={16} />
          </button>
          <button type="button" className="ghost-action" onClick={openConnectionManager} aria-label="새 파이프라인 영역에서 연결 관리 열기">
            <Database size={16} />
            연결 관리
          </button>
        </div>
      </section>
      <PipelineTable navigate={navigate} setNotice={setNotice} />
      <SchemaPreviewSection />
      <div className="grid two">
        <InfoCard title="Contract" value={m1SourceConfigPlaceholder.contract} detail="Producer: M1 / Consumers: M2, M3, M4, M5" />
        <InfoCard title="Tenant" value={m1SourceConfigPlaceholder.tenant_id} detail="실제 로그인/RBAC 없이 tenant_id 구조만 유지" />
        <InfoCard title="Source ID" value={m1SourceConfigPlaceholder.source_id} detail={m1SourceConfigPlaceholder.source_type} />
        <InfoCard title="Connection" value={m1SourceConfigPlaceholder.connection_ref.kind} detail={m1SourceConfigPlaceholder.connection_ref.path_status} />
      </div>
      <EmptyState
        icon={Boxes}
        title="아직 등록된 실제 source가 없습니다"
        body="M3 JSON sample reader 또는 M2/M4 connector가 붙으면 이 영역이 source 목록과 connection test 결과로 바뀝니다."
      />
        </>
      )}
      {isStartOpen ? (
        <SourceStartModal
          onClose={() => setIsStartOpen(false)}
          onManageConnections={() => {
            setIsStartOpen(false);
            openConnectionManager();
          }}
          onProceed={() => {
            setIsStartOpen(false);
            navigate("/etl-visual");
          }}
        />
      ) : null}
    </div>
  );
}

function PipelineTable({ navigate, setNotice }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filteredRows = m1PipelinePlaceholders.filter((row) =>
    `${row.name} ${row.owner} ${row.purpose}`.toLowerCase().includes(query.toLowerCase()),
  );

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
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="파이프라인 검색..." />
        </label>
      </div>
      <div className="wide-table-wrap">
        <table className="shell-table">
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
            {filteredRows.map((row) => (
              <tr key={row.name}>
                <td className="table-link" onClick={() => navigate("/catalog-detail")}>{row.name}</td>
                <td>{row.owner}</td>
                <td>
                  <span className={`badge ${row.type === "결과 데이터셋" ? "orange" : "gray"}`}>{row.type}</span>
                </td>
                <td>
                  <span className="badge slate">{row.status}</span>
                </td>
                <td>
                  <span className="badge blue">{row.mode}</span>
                </td>
                <td className="purpose-cell">{row.purpose}</td>
                <td>{row.updated}</td>
                <td>
                  <button
                    type="button"
                    className="icon-danger"
                    aria-label="삭제 비활성"
                    onClick={() => setNotice("M1에서는 삭제 API를 호출하지 않습니다. M5 연결 후 실제 권한/삭제 정책을 붙입니다.")}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        <span>전체 {filteredRows.length}개 중 {filteredRows.length ? "1-" + filteredRows.length : "0"} 표시</span>
        <div>
          <button type="button" onClick={() => setPage(1)}>이전</button>
          <button type="button" className="active-page">1</button>
          <button type="button" onClick={() => setPage(page + 1)}>다음</button>
        </div>
      </footer>
    </section>
  );
}

function ConnectionManagerShell({ onBack, setNotice }) {
  return (
    <section className="management-shell">
      <div className="management-header">
        <button type="button" className="ghost-action" onClick={onBack} aria-label="연결 관리에서 파이프라인 목록으로 돌아가기">
          <ArrowLeft size={16} />
          파이프라인 목록
        </button>
        <button
          type="button"
          className="primary-action"
          onClick={() => setNotice("새 연결 생성은 M2/M3/M4 connector 구현 후 연결됩니다.")}
        >
          <Plus size={16} />
          새 연결
        </button>
      </div>
      <DataTable
        columns={["connection", "resource", "status", "owner module"]}
        rows={m1ConnectionPlaceholders}
      />
    </section>
  );
}

function SourceStartModal({ onClose, onManageConnections, onProceed }) {
  const [selected, setSelected] = useState(m1ConnectionPlaceholders[0][0]);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal" role="dialog" aria-modal="true" aria-labelledby="source-modal-title">
        <header>
          <div>
            <h2 id="source-modal-title">소스 선택하고 시작</h2>
            <p>실제 connection test 없이 M1에서는 선택 flow만 확인합니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-options">
          {m1ConnectionPlaceholders.map(([name, resource, status]) => (
            <button
              key={name}
              type="button"
              className={selected === name ? "selected" : ""}
              onClick={() => setSelected(name)}
            >
              <Database size={18} />
              <span>
                <strong>{name}</strong>
                <small>{resource} · {status}</small>
              </span>
            </button>
          ))}
        </div>
        <footer>
          <button type="button" className="ghost-action" onClick={onManageConnections}>
            연결 관리
          </button>
          <button type="button" className="primary-action" onClick={onProceed}>
            파이프라인 캔버스 열기
            <ArrowRight size={16} />
          </button>
        </footer>
      </section>
    </div>
  );
}

function SchemaPreviewSection() {
  return (
    <section className="schema-preview-block">
      <div className="table-card-header">
        <div className="table-title-line">
          <FileJson size={20} />
          <div>
            <strong>스키마 미리보기 / 보정</strong>
            <p>M3 JSON sample reader가 붙으면 source 선택 다음 단계에서 실제 추론 결과를 표시합니다.</p>
          </div>
        </div>
        <span className="badge slate">M3 연결 예정</span>
      </div>
      <DataTable
        columns={["field path", "type", "nullable", "override"]}
        rows={m1SchemaPreviewPlaceholder.fields}
      />
      <EmptyState
        icon={AlertCircle}
        title="sample size와 실제 파일 경로는 아직 확정 전입니다"
        body="계약 fixture의 TODO 값을 실제 M3 구현 결과로 교체해야 합니다."
      />
    </section>
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
          데이터 통합
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

function RunStatusPage({ navigate }) {
  const [query, setQuery] = useState("");
  const rows = m1PipelinePlaceholders.filter((row) => row.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="page-stack">
      <PageHeader
        title="실행/모니터링"
        body="M5가 WorkflowDefinition, ExecutionResult, 로그, retry 상태를 연결할 화면입니다."
        actionLabel="실행 결과 없음"
      />
      <section className="pipeline-table-card">
        <div className="table-card-header">
          <div className="table-title-line">
            <ListChecks size={20} />
            <div>
              <strong>Job Runs</strong>
              <p>기준 데모의 실행/모니터링 목록 shell입니다.</p>
            </div>
          </div>
          <label className="table-search">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="job 검색..." />
          </label>
        </div>
        <div className="wide-table-wrap">
          <table className="shell-table">
            <thead>
              <tr>
                <th>job</th>
                <th>status</th>
                <th>mode</th>
                <th>last updated</th>
                <th>detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td className="table-link" onClick={() => navigate("/etl-visual")}>{row.name}</td>
                  <td><span className="badge slate">연결 대기</span></td>
                  <td><span className="badge blue">{row.mode}</span></td>
                  <td>{row.updated}</td>
                  <td>{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="pipeline-strip">
        {m1WorkflowPlaceholder.nodes.map(([type, label, detail], index) => (
          <div className="pipeline-node" key={type}>
            <span>{index + 1}</span>
            <strong>{type}</strong>
            <p>{label}</p>
            <small>{detail}</small>
            {index < m1WorkflowPlaceholder.nodes.length - 1 ? <ChevronRight size={18} /> : null}
          </div>
        ))}
      </div>
      <EmptyState
        icon={Loader2}
        title="실행 버튼과 자동 결과 연출은 없습니다"
        body="실제 run 상태는 M5 ExecutionResult가 붙은 뒤 대기, 실행 중, 실패 등으로 표시됩니다."
      />
    </div>
  );
}

function CatalogPage({ navigate }) {
  const [selectedTag, setSelectedTag] = useState("전체");
  const tags = ["전체", "bronze", "silver", "gold"];

  return (
    <div className="page-stack">
      <PageHeader
        title="데이터 카탈로그"
        body="M5가 생성한 dataset metadata와 lineage를 M6가 소비할 수 있게 보여주는 화면입니다."
        actionLabel="CatalogMetadata 연결 대기"
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
      <section className="catalog-feature">
        <div className="dataset-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="catalog-title-row">
            <h3>{m1CatalogPlaceholder.name}</h3>
            <span>placeholder</span>
            <span>품질 확인 대기</span>
          </div>
          <p>타겟 데이터셋을 찾고 구조를 확인하는 카탈로그 카드 스타일을 M1 shell에 맞춰 보존했습니다.</p>
        </div>
        <button type="button" className="icon-link" onClick={() => navigate("/catalog-detail")} aria-label="catalog detail">
          <ArrowRight size={18} />
        </button>
      </section>
      <div className="grid three">
        <InfoCard title="Dataset" value={m1CatalogPlaceholder.dataset_id} detail={m1CatalogPlaceholder.name} />
        <InfoCard title="Layer" value={m1CatalogPlaceholder.layer} detail="신뢰 게이트 연결 전 placeholder" />
        <InfoCard title="Query table" value={m1CatalogPlaceholder.query_table} detail="M6 allowlist context" />
      </div>
      <section className="contract-panel">
        <div>
          <p className="eyebrow">Storage contract</p>
          <code>{m1CatalogPlaceholder.s3_uri}</code>
        </div>
        <p>{m1CatalogPlaceholder.quality}</p>
      </section>
    </div>
  );
}

function CatalogDetailShell({ navigate }) {
  const [tab, setTab] = useState("lineage");
  const tabs = [
    ["lineage", "리니지(데이터 계보)", GitBranch],
    ["quality", "품질 검사 리포트", ShieldCheck],
    ["governance", "거버넌스 설정", Wrench],
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title={m1CatalogPlaceholder.name}
        body="Catalog detail과 lineage/quality/governance tab shell입니다."
        actionLabel="목록으로"
        onAction={() => navigate("/catalog")}
      />
      <section className="detail-tabs">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </section>
      {tab === "lineage" ? <LineageShell /> : null}
      {tab === "quality" ? (
        <div className="grid three">
          <InfoCard title="missing rate" value="연결 대기" detail="M5 quality output 필요" />
          <InfoCard title="duplicate count" value="연결 대기" detail="ExecutionResult quality metric" />
          <InfoCard title="schema status" value="연결 대기" detail="SchemaDefinition 비교" />
        </div>
      ) : null}
      {tab === "governance" ? (
        <DataTable
          columns={["policy", "state", "owner"]}
          rows={[
            ["mask customer identifiers", "연결 대기", "M6/RBAC"],
            ["monthly aggregate only", "연결 대기", "M5/M6"],
            ["allow preview export", "disabled", "security"],
          ]}
        />
      ) : null}
    </div>
  );
}

function LineageShell() {
  return (
    <section className="lineage-shell">
      {["Source", "Raw placeholder", "Prepared placeholder", "Quality Gate", "Output placeholder"].map((item, index) => (
        <article key={item}>
          <span>{index + 1}</span>
          <strong>{item}</strong>
          <p>{item === "Output placeholder" ? m1CatalogPlaceholder.dataset_id : "M5 연결 대기"}</p>
        </article>
      ))}
    </section>
  );
}

function AiQueryPage({ setNotice }) {
  const [queryText, setQueryText] = useState("");
  const [viewMode, setViewMode] = useState("table");

  return (
    <div className="page-stack">
      <PageHeader
        title="AI Query"
        body="검증 질문, selected dataset, evidence, SQL, chart spec을 표시할 위치입니다."
        actionLabel="M6 연결 대기"
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
            onClick={() => setNotice("M6 AI Query 연결 전에는 SQL 실행 결과를 생성하지 않습니다.")}
          >
            <Play size={16} />
            실행 대기
          </button>
        </div>
        <div className="contract-panel">
          <p className="eyebrow">{m1AiQueryPlaceholder.contract}</p>
          <h3>{m1AiQueryPlaceholder.status}</h3>
          <code>{m1AiQueryPlaceholder.sql}</code>
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
          <p>Chart spec: {m1AiQueryPlaceholder.chart_spec}</p>
        </div>
      </section>
      <DataTable
        columns={["module", "M1 surface", "contract"]}
        rows={m1IntegrationRows}
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
      <button type="button" className="ghost-action" onClick={onAction}>
        {actionLabel}
      </button>
    </header>
  );
}

function ToastNotice({ message, onClose }) {
  return (
    <div className="toast-notice" role="status">
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
