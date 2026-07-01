import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  Layers3,
  Save,
  ShieldCheck,
} from "lucide-react";

import { EmptyState } from "../../design-system";

import {
  silverStandardizeRuleOptions,
  silverValidationRuleOptions,
} from "./datasetConfig";

export function SilverDatasetWizard(props) {
  const {
    setDatasetCreationMode, silverWizardStepIndex,
    selectedSilverSourceId, silverDatasetName,
    setSilverDatasetName, silverPurpose,
    setSilverPurpose, selectedSilverStandardizeRules,
    selectedSilverValidationRules, silverDatasetSaveState,
    setSilverDatasetSaveState, savedSourceDatasets,
    silverWizardSteps, currentSilverStep,
    selectedSilverSource, selectedSilverStandardizeRuleDetails,
    selectedSilverValidationRuleDetails, canGoNextSilver,
    selectSilverSourceDataset, toggleSilverRule,
    saveSilverDatasetDraft, goNextSilver,
    goBackSilver,
  } = props;

  function renderSilverDatasetWizard() {
    return (
      <section className="pipeline-table-card data-wizard-card">
        <div className="table-card-header">
          <div className="table-title-line">
            <Layers3 size={20} />
            <div>
              <strong>Create Silver Dataset</strong>
              <p>Source Dataset을 표준화/검증한 Silver Dataset metadata로 저장합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <button type="button" className="ghost-action" onClick={() => setDatasetCreationMode(null)}>
              목록으로
            </button>
            <span className="badge slate">{silverWizardStepIndex + 1}/{silverWizardSteps.length} 단계</span>
          </div>
        </div>
        <div className="data-wizard-layout">
          <aside className="wizard-progress target-wizard-progress" aria-label="Silver dataset creation wizard progress">
            {silverWizardSteps.map((step, index) => {
              const isCurrent = index === silverWizardStepIndex;
              const isComplete =
                (step.id === "source" && Boolean(selectedSilverSource)) ||
                (step.id === "rules" &&
                  Boolean(silverDatasetName.trim() && silverPurpose.trim()) &&
                  selectedSilverStandardizeRules.length > 0 &&
                  selectedSilverValidationRules.length > 0);
              const status = isCurrent ? "진행 중" : isComplete ? "완료" : "대기";

              return (
                <article className={`wizard-progress-step ${isCurrent ? "current" : ""} ${isComplete ? "complete" : ""}`} key={step.id}>
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
            {currentSilverStep.id === "source" ? (
              <section className="wizard-step-body">
                <div className="wizard-step-heading">
                  <span>1단계</span>
                  <div>
                    <h3>Source Dataset 선택</h3>
                    <p>Silver Dataset으로 표준화할 persisted Source Dataset을 고릅니다.</p>
                  </div>
                </div>
                {savedSourceDatasets.length > 0 ? (
                  <div className="target-source-card-grid">
                    {savedSourceDatasets.map((sourceDataset) => {
                      const isSelected = selectedSilverSourceId === sourceDataset.id;
                      return (
                        <article className={`target-source-card ${isSelected ? "selected" : ""}`} key={sourceDataset.id}>
                          <button type="button" onClick={() => selectSilverSourceDataset(sourceDataset)}>
                            <div className="target-source-head">
                              <span>{sourceDataset.connection_type}</span>
                              <strong>{sourceDataset.name}</strong>
                            </div>
                            <p>{sourceDataset.raw_scope}</p>
                            <small>{sourceDataset.schema_preview?.length || 0} fields · {sourceDataset.status}</small>
                          </button>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState icon={Database} title="Source Dataset 필요" body="Silver Dataset은 Source Dataset에서만 만들 수 있습니다." />
                )}
              </section>
            ) : null}

            {currentSilverStep.id === "rules" ? (
              <section className="wizard-step-body">
                <div className="wizard-step-heading">
                  <span>2단계</span>
                  <div>
                    <h3>Rules 설정</h3>
                    <p>Silver output 이름과 표준화/검증 규칙 metadata를 설정합니다.</p>
                  </div>
                </div>
                <div className="source-config-grid silver-rules-layout">
                  <section className="wizard-inline-panel silver-draft-panel">
                    <div className="table-title-line">
                      <Layers3 size={18} />
                      <div>
                        <strong>Silver dataset draft</strong>
                        <p>{selectedSilverSource?.name || "Source Dataset 선택 필요"}</p>
                      </div>
                    </div>
                    <label className="target-name-field">
                      <span>silver_dataset_name</span>
                      <input
                        type="text"
                        value={silverDatasetName}
                        onChange={(event) => {
                          setSilverDatasetName(event.target.value);
                          setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
                        }}
                      />
                    </label>
                    <label className="target-name-field">
                      <span>purpose</span>
                      <input
                        type="text"
                        value={silverPurpose}
                        onChange={(event) => {
                          setSilverPurpose(event.target.value);
                          setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
                        }}
                      />
                    </label>
                  </section>
                  <section className="wizard-inline-panel silver-rules-panel">
                    <div className="table-title-line">
                      <ShieldCheck size={18} />
                      <div>
                        <strong>Standardize / Validate</strong>
                        <p>데모용 metadata rule이며 실제 row 변환은 실행하지 않습니다.</p>
                      </div>
                    </div>
                    <div className="processing-recipe-grid silver-rule-grid">
                      {[...silverStandardizeRuleOptions, ...silverValidationRuleOptions].map((rule) => {
                        const kind = silverStandardizeRuleOptions.some((option) => option.id === rule.id) ? "standardize" : "validation";
                        const isSelected =
                          kind === "standardize"
                            ? selectedSilverStandardizeRules.includes(rule.id)
                            : selectedSilverValidationRules.includes(rule.id);
                        return (
                          <button
                            type="button"
                            className={isSelected ? "selected" : ""}
                            onClick={() => toggleSilverRule(kind, rule.id)}
                            key={rule.id}
                          >
                            <span>{kind === "standardize" ? "Standardize" : "Validate"}</span>
                            <strong>{rule.label}</strong>
                            <p>{rule.detail}</p>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </section>
            ) : null}

            {currentSilverStep.id === "review" ? (
              <section className="wizard-step-body">
                <div className="wizard-step-heading">
                  <span>3단계</span>
                  <div>
                    <h3>Review</h3>
                    <p>Silver Dataset metadata로 저장될 내용을 확인합니다.</p>
                  </div>
                </div>
                <div className="review-summary-grid dataset-review-grid silver-review-grid">
                  <article className="review-primary">
                    <span>Source Dataset</span>
                    <strong>{selectedSilverSource?.name || "선택 전"}</strong>
                    <p>{selectedSilverSource?.raw_scope || "Source Dataset을 먼저 선택합니다."}</p>
                  </article>
                  <article className="review-output">
                    <span>Silver Dataset</span>
                    <strong>{silverDatasetName.trim() || "silver name 필요"}</strong>
                    <p>{silverPurpose.trim() || "purpose 필요"}</p>
                  </article>
                  <article>
                    <span>Standardize</span>
                    <strong>{selectedSilverStandardizeRuleDetails.length} rules</strong>
                    <p>{selectedSilverStandardizeRuleDetails.map((rule) => rule.label).join(", ") || "선택 없음"}</p>
                  </article>
                  <article>
                    <span>Validate</span>
                    <strong>{selectedSilverValidationRuleDetails.length} rules</strong>
                    <p>{selectedSilverValidationRuleDetails.map((rule) => rule.label).join(", ") || "선택 없음"}</p>
                  </article>
                </div>
                <div className="target-lineage-strip review-lineage-strip silver-review-lineage">
                  <span>{selectedSilverSource?.name || "Source Dataset"}</span>
                  <ArrowRight size={16} />
                  <span>{selectedSilverStandardizeRuleDetails.length + selectedSilverValidationRuleDetails.length} Rules</span>
                  <ArrowRight size={16} />
                  <strong>{silverDatasetName.trim() || "Silver Dataset"}</strong>
                </div>
                <div className="schema-preview-table" aria-label="Silver dataset schema preview">
                  <div className="schema-preview-head">
                    <span>Field</span>
                    <span>Type</span>
                    <span>Source</span>
                  </div>
                  {(selectedSilverSource?.schema_preview || []).map((field) => (
                    <div className="schema-preview-row" key={field.name}>
                      <strong>{field.name}</strong>
                      <span>{field.type}</span>
                      <code>{selectedSilverSource?.name}</code>
                    </div>
                  ))}
                </div>
                <div className="wizard-placeholder compact">
                  {silverDatasetSaveState.status === "saved" ? <CheckCircle2 size={22} /> : <Layers3 size={22} />}
                  <strong>
                    {silverDatasetSaveState.status === "saved"
                      ? `저장됨: ${silverDatasetSaveState.record?.id}`
                      : "이 draft는 Silver Dataset metadata로 저장됩니다"}
                  </strong>
                  {silverDatasetSaveState.status === "error" ? <p>{silverDatasetSaveState.error}</p> : null}
                </div>
              </section>
            ) : null}
          </main>
        </div>
        <footer className="wizard-navigation">
          <button type="button" className="ghost-action" onClick={silverWizardStepIndex === 0 ? () => setDatasetCreationMode(null) : goBackSilver}>
            <ArrowLeft size={16} />
            {silverWizardStepIndex === 0 ? "목록으로" : "뒤로가기"}
          </button>
          {silverWizardStepIndex < silverWizardSteps.length - 1 ? (
            <button type="button" className="primary-action" onClick={goNextSilver} disabled={!canGoNextSilver}>
              다음
              <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className="primary-action" onClick={saveSilverDatasetDraft} disabled={silverDatasetSaveState.status === "saving"}>
              <Save size={16} />
              {silverDatasetSaveState.status === "saving" ? "저장 중" : "Silver Dataset 저장"}
            </button>
          )}
        </footer>
      </section>
    );
  }

  return renderSilverDatasetWizard();
}
