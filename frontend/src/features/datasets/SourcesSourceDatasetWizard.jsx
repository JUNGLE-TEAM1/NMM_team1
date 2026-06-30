import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  FileJson,
  Loader2,
  Search,
  ServerCog,
  Sparkles,
} from "lucide-react";

import {
  EmptyState,
  InfoCard,
} from "../../design-system";
import { formatBytes } from "../../app/formatters";

import {
  formatConnectionResourceLabel,
  isLocalDiscoveryConnection,
  productHealthBindingLabel,
  productHealthStatusLabel,
} from "./datasetConfig";

export function SourceDatasetWizard(props) {
  const {
    setDatasetCreationMode, sourceWizardStepIndex,
    sourceDraft, sourceDiscoveryState,
    setSourceDiscoveryState, sourceDatasetName,
    setSourceDatasetName, sourceRawScope,
    setSourceRawScope, sourceDatasetSaveState,
    setSourceDatasetSaveState, productHealthSourceInventory,
    sourceWizardSteps, currentSourceStep,
    sourceDiscovery, sourceSchemaPreview,
    canGoNextSource, sourceConnectionOptions,
    selectSourceConnection, selectProductHealthInventorySource,
    discoverSelectedSourceConnection, saveSourceDatasetDraft,
    goNextSource, goBackSource,
  } = props;

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

  return renderSourceDatasetShell();
}
