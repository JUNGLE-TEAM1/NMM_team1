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
  ListChecks,
  Loader2,
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
  getWeek2Catalog,
  getWeek2Run,
  getWeek2SparkReadiness,
  triggerWeek2Run,
} from "../../api/asklakeClient";
import { getCatalogDatasetManagementPolicy, listCatalogDatasets } from "../../api/catalogApi";
import { getKafkaReplayHealth, getKafkaReplayRun, listKafkaReplayRuns } from "../../api/kafkaReplayApi";
import {
  executeTargetDatasetJobRun,
  listTargetDatasetJobRuns,
  publishTargetDatasetJobRunToCatalog,
} from "../../api/targetDatasetDraftApi";
import { DataTable, EmptyState, InfoCard, PageHeader } from "../../design-system";
import { OperationalList } from "../../features/datasets/DatasetComponents";
import { formatBytes, formatMetric } from "../formatters";
import {
  m1AiQueryPlaceholder,
  m1CatalogPlaceholder,
  m1IntegrationRows,
  m1WorkflowPlaceholder,
} from "../m1StaticShellData";
import { WEEK2_DEFAULT_CATALOG_DETAIL_URL } from "../routes";

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

export function CatalogPage({ navigate, focusedCatalogDatasetId = "" }) {
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

export function CatalogDetailShell({ navigate }) {
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
