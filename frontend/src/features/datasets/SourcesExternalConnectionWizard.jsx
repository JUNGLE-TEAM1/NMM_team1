import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Network,
  Search,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import {
  EmptyState,
  InfoCard,
} from "../../design-system";
import { formatBytes } from "../../app/formatters";

import { safeRuntimeSummary } from "./DatasetComponents";

import {
  defaultDiscoveryScopeForConnectionType,
  externalConnectionTypes,
  formatConnectionResourceLabel,
  isRuntimeConnectionType,
  runtimeConnectionCheckLabel,
  runtimeConnectionPassed,
} from "./datasetConfig";

export function ExternalConnectionWizard(props) {
  const {
    setIsDatasetTypeModalOpen, setDatasetCreationMode,
    connectionWizardStepIndex, selectedConnectionType,
    connectionName, setConnectionName,
    connectionResource, connectionSecretRefs,
    connectionDiscoveryScope, connectionInspected,
    connectionInspectState, connectionRuntimeCheckState,
    connectionSaveState, setConnectionSaveState,
    connectionWizardSteps, currentConnectionStep,
    isRuntimeConnection, selectedConnectionPresets,
    isConnectionReadyForReview, canGoNextConnection,
    selectConnectionType, setConnectionResourceValue,
    setConnectionSecretRefValue, setConnectionDiscoveryScopeValue,
    selectConnectionPreset, inspectConnectionSource,
    testConnectionRuntimeFromWizard, saveExternalConnectionDraft,
    goNextConnection, goBackConnection,
  } = props;

  function renderExternalConnectionWizard() {
    return (
      <section className="pipeline-table-card data-wizard-card external-connection-wizard">
        <div className="table-card-header">
          <div className="table-title-line">
            <ServerCog size={20} />
            <div>
              <strong>Create External Connection</strong>
              <p>로컬 파일/폴더는 schema inspect, DB/S3/Kafka는 실제 runtime connection test로 Source Dataset 입력을 준비합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <button type="button" className="ghost-action" onClick={() => setIsDatasetTypeModalOpen(true)}>
              생성 유형 변경
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
              <button type="button" className="ghost-action" onClick={connectionWizardStepIndex === 0 ? () => setDatasetCreationMode(null) : goBackConnection}>
                <ArrowLeft size={16} />
                {connectionWizardStepIndex === 0 ? "목록으로" : "뒤로가기"}
              </button>
              {connectionWizardStepIndex < connectionWizardSteps.length - 1 ? (
                <button type="button" className="primary-action" onClick={goNextConnection} disabled={!canGoNextConnection}>
                  다음
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-action"
                  onClick={saveExternalConnectionDraft}
                  disabled={
                    !connectionName.trim() ||
                    !connectionResource.trim() ||
                    !isConnectionReadyForReview ||
                    connectionSaveState.status === "saving"
                  }
                >
                  {connectionSaveState.status === "saving" ? "저장 중" : "External connection 저장"}
                  {connectionSaveState.status === "saving" ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}
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
              <p>Connector Type은 데이터셋 종류가 아니라 가져오는 방식입니다. 데이터셋 의미는 다음 단계에서 판정합니다.</p>
            </div>
          </div>
          <div className="connection-type-grid" aria-label="External connector type choices">
            {externalConnectionTypes.map((connectionType) => (
              <button
                key={connectionType.id}
                type="button"
                className={`${selectedConnectionType?.id === connectionType.id ? "selected" : ""} ${connectionType.disabled ? "disabled" : ""}`}
                disabled={connectionType.disabled}
                onClick={() => selectConnectionType(connectionType)}
              >
                <span className="connection-card-icon">
                  <ServerCog size={18} />
                </span>
                <strong>{connectionType.label}</strong>
                <p>{connectionType.description}</p>
                <small>{connectionType.modeLabel} · {formatConnectionResourceLabel(connectionType.resourceLabel)}</small>
              </button>
            ))}
          </div>
          <div className="wizard-placeholder compact">
            <CheckCircle2 size={22} />
            <strong>
              {selectedConnectionType.label} 방식이 선택되었습니다. 다음 단계에서{" "}
              {isRuntimeConnectionType(selectedConnectionType) ? "실제 연결 테스트" : "소스 검사"}를 실행합니다.
            </strong>
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
              <h3>Configure & Inspect</h3>
              <p>
                {isRuntimeConnection
                  ? "연결 리소스와 secret reference를 정한 뒤 실제 런타임 접속을 확인합니다."
                  : "연결 위치를 정한 뒤 소스 검사를 실행하면 sample/schema 기준으로 데이터셋 의미를 판정합니다."}
              </p>
            </div>
          </div>
          <div className="source-config-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>연결 정보</strong>
                  <p>어디서 어떻게 가져올지 정하는 connector 설정입니다.</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>연결 이름</span>
                <input
                  type="text"
                  value={connectionName}
                  onChange={(event) => {
                    setConnectionName(event.target.value);
                    setConnectionSaveState({ status: "idle", record: null, error: "" });
                  }}
                  placeholder="conn_product_health_reviews_file"
                />
              </label>
              <label className="target-name-field">
                <span>{formatConnectionResourceLabel(selectedConnectionType.resourceLabel)}</span>
                <input
                  type="text"
                  value={connectionResource}
                  onChange={(event) => setConnectionResourceValue(event.target.value)}
                  placeholder={selectedConnectionType.placeholder}
                />
              </label>
              {selectedConnectionPresets.length ? (
                <div className="source-location-actions" aria-label="Source location selection shortcuts">
                  {selectedConnectionPresets.map((preset) => (
                    <button type="button" key={preset.id} onClick={() => selectConnectionPreset(preset.id)}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {isRuntimeConnection && selectedConnectionType.secretRefFields?.length ? (
                <div className="secret-ref-grid" aria-label="Secret reference fields">
                  {selectedConnectionType.secretRefFields.map((field) => (
                    <label className="target-name-field" key={field.key}>
                      <span>{field.label}</span>
                      <input
                        type="text"
                        value={connectionSecretRefs[field.key] || ""}
                        onChange={(event) => setConnectionSecretRefValue(field.key, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
              {isRuntimeConnection ? (
                <label className="target-name-field">
                  <span>Schema discovery scope</span>
                  <input
                    type="text"
                    value={connectionDiscoveryScope}
                    onChange={(event) => setConnectionDiscoveryScopeValue(event.target.value)}
                    placeholder={defaultDiscoveryScopeForConnectionType(selectedConnectionType)}
                  />
                </label>
              ) : null}
              <div className="target-summary-strip">
                <span>Auth mode</span>
                <strong>{selectedConnectionType.authMode}</strong>
                <p>{selectedConnectionType.contractHint}</p>
              </div>
              <button
                type="button"
                className="primary-action inspect-source-action"
                onClick={isRuntimeConnection ? testConnectionRuntimeFromWizard : inspectConnectionSource}
                disabled={
                  !connectionName.trim() ||
                  !connectionResource.trim() ||
                  connectionInspectState.status === "inspecting" ||
                  connectionRuntimeCheckState.status === "checking"
                }
              >
                {isRuntimeConnection
                  ? connectionRuntimeCheckState.status === "checking"
                    ? "연결 확인 중"
                    : connectionInspectState.status === "inspecting"
                      ? "Discovery 중"
                      : "연결 테스트 + Schema discovery"
                  : connectionInspectState.status === "inspecting"
                    ? "검사 중"
                    : "소스 검사"}
                {connectionInspectState.status === "inspecting" || connectionRuntimeCheckState.status === "checking" ? (
                  <Loader2 className="spin" size={16} />
                ) : isRuntimeConnection ? (
                  <Network size={16} />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ShieldCheck size={18} />
                <div>
                  <strong>{isRuntimeConnection ? "Connection test result" : "Inspect result"}</strong>
                  <p>
                    {isRuntimeConnection
                      ? runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType)
                        ? "실제 런타임 접속과 schema discovery 결과가 함께 표시됩니다."
                        : "실제 연결 테스트를 실행하면 결과가 표시됩니다."
                      : connectionInspected
                        ? "실제 local path에서 읽은 schema discovery 결과입니다."
                        : "소스 검사를 실행하면 결과가 표시됩니다."}
                  </p>
                </div>
              </div>
              {isRuntimeConnection && connectionRuntimeCheckState.status === "failed" ? (
                <EmptyState
                  icon={AlertCircle}
                  title="연결 테스트 실패"
                  body={connectionRuntimeCheckState.error || "런타임 서버, 리소스, secret reference를 확인하세요."}
                />
              ) : isRuntimeConnection && runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType) ? (
                <>
                  <div className="source-config-summary connection-config-summary">
                    <InfoCard title="Connector" value={selectedConnectionType.label} detail={selectedConnectionType.description} />
                    <InfoCard
                      title="Runtime check"
                      value={connectionRuntimeCheckState.result.status}
                      detail={runtimeConnectionCheckLabel(selectedConnectionType)}
                    />
                    <InfoCard
                      title="Capabilities"
                      value={connectionRuntimeCheckState.result.checked_capabilities.join(", ")}
                      detail="실제 driver/broker/client check"
                    />
                    <InfoCard
                      title="Credential policy"
                      value={connectionRuntimeCheckState.result.secret_values_exposed ? "exposed" : "not exposed"}
                      detail="secret ref 이름만 사용"
                    />
                    <InfoCard
                      title="Schema discovery"
                      value={
                        connectionInspectState.status === "discovered"
                          ? `${connectionInspectState.result.schema_preview.length} fields`
                          : connectionInspectState.status === "inspecting"
                            ? "running"
                            : connectionInspectState.status === "error"
                              ? "failed"
                              : "not started"
                      }
                      detail={connectionDiscoveryScope || "discovery scope 필요"}
                    />
                  </div>
                  {connectionInspectState.status === "error" ? (
                    <div className="wizard-placeholder compact danger">
                      <AlertCircle size={22} />
                      <strong>Schema discovery 실패</strong>
                      <p>{connectionInspectState.error}</p>
                    </div>
                  ) : null}
                  {connectionInspectState.status === "inspecting" ? (
                    <div className="wizard-placeholder compact">
                      <Loader2 className="spin" size={22} />
                      <strong>Schema discovery 실행 중</strong>
                      <p>{connectionDiscoveryScope} scope에서 sample/schema를 확인하고 있습니다.</p>
                    </div>
                  ) : null}
                  {connectionInspectState.status === "discovered" && connectionInspectState.result ? (
                    <>
                      <div className="source-config-summary connection-config-summary">
                        <InfoCard
                          title="Format"
                          value={connectionInspectState.result.detected_format}
                          detail={`${formatBytes(connectionInspectState.result.bytes)} · ${connectionInspectState.result.row_count_status}`}
                        />
                        <InfoCard
                          title="Dataset scope"
                          value={connectionInspectState.result.detected_dataset}
                          detail={connectionInspectState.result.message}
                        />
                        <InfoCard
                          title="Schema fields"
                          value={`${connectionInspectState.result.schema_preview.length}`}
                          detail={connectionInspectState.result.schema_preview.slice(0, 4).map((field) => field.name).join(", ")}
                        />
                      </div>
                      <div className="schema-preview-table" aria-label="Runtime connection schema preview">
                        <div className="schema-preview-head">
                          <span>Field</span>
                          <span>Type</span>
                          <span>Sample</span>
                        </div>
                        {connectionInspectState.result.schema_preview.slice(0, 8).map((field) => (
                          <div className="schema-preview-row" key={field.name}>
                            <strong>{field.name}</strong>
                            <span>{field.type}</span>
                            <code>discovered</code>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                  <div className="target-summary-strip">
                    <span>Runtime note</span>
                    <strong>{connectionRuntimeCheckState.result.message}</strong>
                    <p>{safeRuntimeSummary(connectionRuntimeCheckState.result.safe_summary)}</p>
                  </div>
                </>
              ) : connectionInspectState.status === "error" ? (
                <EmptyState
                  icon={AlertCircle}
                  title="검사 실패"
                  body={connectionInspectState.error || "경로 또는 파일 형식을 확인하세요."}
                />
              ) : connectionInspected && connectionInspectState.result ? (
                <>
                  <div className="source-config-summary connection-config-summary">
                    <InfoCard title="Connector" value={selectedConnectionType.label} detail={selectedConnectionType.description} />
                    <InfoCard
                      title="Format"
                      value={connectionInspectState.result.detected_format}
                      detail={`${formatBytes(connectionInspectState.result.bytes)} · ${connectionInspectState.result.file_count || 1} file`}
                    />
                    <InfoCard
                      title="Detected dataset"
                      value={connectionInspectState.result.detected_dataset}
                      detail={`${connectionInspectState.result.confidence} confidence`}
                    />
                    <InfoCard
                      title="Schema"
                      value={`${connectionInspectState.result.schema_preview.length} fields`}
                      detail={connectionInspectState.result.schema_preview.slice(0, 3).map((field) => field.name).join(", ")}
                    />
                    <InfoCard
                      title="Rows"
                      value={connectionInspectState.result.row_count ?? "미측정"}
                      detail={connectionInspectState.result.row_count_status}
                    />
                  </div>
                  <div className="target-summary-strip">
                    <span>Inspect note</span>
                    <strong>{connectionInspectState.result.recommended_role}</strong>
                    <p>{connectionInspectState.result.message}</p>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={isRuntimeConnection ? Network : Search}
                  title={isRuntimeConnection ? "연결 테스트 대기" : "검사 대기"}
                  body={
                    isRuntimeConnection
                      ? "리소스와 secret reference를 입력한 뒤 실제 연결 테스트를 실행합니다."
                      : "파일 또는 폴더를 지정한 뒤 소스 검사를 실행합니다."
                  }
                />
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
            <p>External Connection draft로 준비할 내용을 최종 확인합니다.</p>
          </div>
        </div>
        <div className="review-summary-grid">
          <article>
            <span>Connection</span>
            <strong>{connectionName.trim() || "연결 이름 필요"}</strong>
            <p>demo external connection draft</p>
          </article>
          <article>
            <span>Connector type</span>
            <strong>{selectedConnectionType.label}</strong>
            <p>{selectedConnectionType.description}</p>
          </article>
          <article>
            <span>{formatConnectionResourceLabel(selectedConnectionType.resourceLabel)}</span>
            <strong>{connectionResource.trim() || selectedConnectionType.placeholder}</strong>
            <p>{selectedConnectionType.modeLabel} · {selectedConnectionType.authMode}</p>
          </article>
          <article>
            <span>Detected dataset</span>
            <strong>
              {connectionInspectState.result?.detected_dataset ||
                (runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType)
                  ? selectedConnectionType.detectedDataset
                  : "검사 대기")}
            </strong>
            <p>
              {connectionInspectState.result
                ? `${connectionInspectState.result.detected_format} · ${connectionInspectState.result.confidence} confidence`
                : runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType)
                  ? `${connectionRuntimeCheckState.result.connector_type} · ${connectionRuntimeCheckState.result.status}`
                  : "Configure & Inspect에서 소스 검사 또는 실제 연결 테스트를 먼저 실행합니다."}
            </p>
          </article>
          {isRuntimeConnection ? (
            <article>
              <span>Runtime check</span>
              <strong>{runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType) ? "passed" : "대기"}</strong>
              <p>
                {runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType)
                  ? safeRuntimeSummary(connectionRuntimeCheckState.result.safe_summary)
                  : runtimeConnectionCheckLabel(selectedConnectionType)}
              </p>
            </article>
          ) : null}
          {isRuntimeConnection ? (
            <article>
              <span>Schema discovery</span>
              <strong>{connectionInspectState.result ? `${connectionInspectState.result.schema_preview.length} fields` : "대기"}</strong>
              <p>{connectionInspectState.result ? connectionInspectState.result.detected_dataset : connectionDiscoveryScope}</p>
            </article>
          ) : null}
          <article>
            <span>Sync schedule</span>
            <strong>{selectedConnectionType.syncMode}</strong>
            <p>{selectedConnectionType.syncSchedule}</p>
          </article>
        </div>
        <div className="wizard-placeholder compact">
          {connectionSaveState.status === "saved" ? <CheckCircle2 size={22} /> : <ServerCog size={22} />}
          <strong>
            {connectionSaveState.status === "saved"
              ? `저장됨: ${connectionSaveState.record?.id}`
              : isRuntimeConnection
                ? "실제 접속 확인 결과를 External Connection metadata로 저장합니다. 원문 credential은 저장하지 않습니다."
                : "소스 검사 결과를 External Connection metadata로 저장합니다"}
          </strong>
          {connectionSaveState.status === "error" ? <p>{connectionSaveState.error}</p> : null}
        </div>
      </section>
    );
  }

  return renderExternalConnectionWizard();
}
