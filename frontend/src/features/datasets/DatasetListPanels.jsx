import {
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  Database,
  Layers3,
  ListChecks,
  Loader2,
  Play,
  PlayCircle,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Table2,
  X,
} from "lucide-react";

import { EmptyState } from "../../design-system";
import { formatMetric } from "../../app/formatters";
import {
  sourceSortOptions,
  sourceTypeOptions,
} from "./datasetConfig";

export function DraftColumn({ title, count, records, empty }) {
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

export function OperationalList({ icon: Icon, title, body, records, empty, onRefresh, loading, layout = "grid" }) {
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

export function ProductHealthPresetPanel({ state, onRun }) {
  const result = state.result;
  const artifactCount = result?.artifacts?.filter((artifact) => artifact.status === "ready").length || 0;
  const seedArtifact = result?.artifacts?.find((artifact) => artifact.role === "seed_product_mapping");
  const isRunning = state.status === "running";

  return (
    <section className="wizard-inline-panel product-health-preset-panel">
      <div className="table-title-line">
        <Sparkles size={18} />
        <div>
          <strong>Product Health Demo preset</strong>
          <p>기존 합성 로직으로 seed mapping, Silver parquet, Gold parquet, catalog/evidence 준비 파일을 재생성합니다.</p>
        </div>
      </div>
      <div className="fact-card-grid preset-fact-grid">
        <div className="fact-card-item wide">
          <span>Gold output</span>
          <strong>{result?.gold_output?.path || "data/local_sources/product_health/gold/gold_product_health.parquet"}</strong>
        </div>
        <div className="fact-card-item">
          <span>Rows</span>
          <strong>{formatMetric(result?.gold_output?.row_count || "ready after run")}</strong>
        </div>
        <div className="fact-card-item">
          <span>Artifacts</span>
          <strong>{artifactCount ? `${artifactCount} ready` : "not run"}</strong>
        </div>
        <div className="fact-card-item wide">
          <span>Seed mapping</span>
          <strong>{seedArtifact?.path || "data/local_sources/product_health/silver/seed_product_mapping.parquet"}</strong>
        </div>
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {result ? (
        <p className="runtime-note">
          {result.run_id} · {result.mode} · SQL smoke {formatMetric(result.sql_smoke?.row_count)} rows
        </p>
      ) : null}
      <div className="operational-list-actions">
        <button type="button" className="primary-action" onClick={onRun} disabled={isRunning}>
          {isRunning ? <Loader2 size={16} className="spin" /> : <PlayCircle size={16} />}
          {isRunning ? "합성 실행 중" : "Product Health preset 실행"}
        </button>
      </div>
    </section>
  );
}

export function CredentialSecretPolicyPanel({ policy }) {
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

export function DatasetTypeChoiceModal({ onClose, onSelect }) {
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

export function SourceStartModal({ sources, onClose, onSelect, onCreateNew }) {
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
