import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  FileJson,
  GitBranch,
  Layers3,
  Loader2,
  Network,
  Play,
  ServerCog,
  Table2,
  Workflow,
} from "lucide-react";

import { EmptyState } from "../../design-system";

import {
  targetExecutorOptions,
  targetProcessingRecipes,
} from "./datasetConfig";

export function TargetDatasetWizard(props) {
  const {
    setIsDatasetTypeModalOpen, setDatasetCreationMode,
    targetSilverIds, selectedRecipeIds,
    targetName, setTargetName,
    targetDescription, setTargetDescription,
    targetScheduleMode, setTargetScheduleMode,
    targetScheduleNote, setTargetScheduleNote,
    targetExecutorMode, setTargetExecutorMode,
    targetDraftSaveState, setTargetDraftSaveState,
    currentStepIndex, savedSilverDatasets,
    normalizedTargetName, normalizedTargetDescription,
    selectedTargetSilvers, baseTargetSilver,
    enrichmentTargetSilvers, selectedProcessRecipes,
    selectedFieldSummary, selectedOutputSchema,
    wizardSteps, currentStep,
    canGoNext, toggleTargetSilver,
    selectBaseTargetSilver, toggleProcessingRecipe,
    saveTargetDatasetDraft, goNext,
    goBack, startSourceCreationForGoldInput,
    startSilverCreationForGoldInput,
  } = props;

  function renderTargetDatasetWizard() {
    return (
      <section className="pipeline-table-card data-wizard-card">
        <div className="table-card-header">
          <div className="table-title-line">
            <Workflow size={20} />
            <div>
              <strong>Create Gold Dataset</strong>
              <p>Silver Dataset을 조합해 Gold Dataset과 Build Job 설정을 준비합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <button type="button" className="ghost-action" onClick={() => setIsDatasetTypeModalOpen(true)}>
              생성 유형 변경
            </button>
            <span className="badge slate">{currentStepIndex + 1}/{wizardSteps.length} 단계</span>
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
              <button type="button" className="ghost-action" onClick={currentStepIndex === 0 ? () => setDatasetCreationMode(null) : goBack}>
                <ArrowLeft size={16} />
                {currentStepIndex === 0 ? "목록으로" : "뒤로가기"}
              </button>
              {currentStepIndex < wizardSteps.length - 1 ? (
                <button type="button" className="primary-action" onClick={goNext} disabled={!canGoNext}>
                  다음
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-action"
                  onClick={saveTargetDatasetDraft}
                  disabled={
                    !normalizedTargetName ||
                    selectedTargetSilvers.length < 2 ||
                    selectedProcessRecipes.length === 0 ||
                    targetDraftSaveState.status === "saving"
                  }
                >
                  {targetDraftSaveState.status === "saving" ? "저장 중" : "Gold Dataset 저장"}
                  {targetDraftSaveState.status === "saving" ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}
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
              <h3>Gold Dataset 개요</h3>
              <p>Build Job이 생성하거나 갱신할 Gold Dataset의 이름과 목적을 먼저 정합니다.</p>
            </div>
          </div>
          <section className="wizard-inline-panel target-setup-panel">
            <div className="table-title-line">
              <Table2 size={18} />
              <div>
                <strong>Gold Dataset 설정</strong>
                <p>Silver Dataset과 processing rule이 붙을 최종 분석용 데이터셋 정보입니다.</p>
              </div>
            </div>
            <label className="target-name-field">
              <span>Gold Dataset 이름</span>
              <input
                type="text"
                value={targetName}
                onChange={(event) => {
                  setTargetName(event.target.value);
                  setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                }}
                placeholder="dataset_product_health_gold"
              />
            </label>
            <label className="target-name-field">
              <span>생성 목적</span>
              <input
                type="text"
                value={targetDescription}
                onChange={(event) => {
                  setTargetDescription(event.target.value);
                  setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                }}
                placeholder="제품 상태 분석용 Gold Dataset"
              />
            </label>
            <div className="target-summary-strip">
              <span>Gold output</span>
              <strong>{normalizedTargetName || "Gold Dataset 이름 필요"}</strong>
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
              <h3>Silver 선택</h3>
              <p>Gold Dataset을 만들 여러 Silver Dataset을 선택하고 row 기준이 되는 Base silver를 정합니다.</p>
            </div>
            <div className="handoff-actions">
              <button type="button" className="ghost-action" onClick={startSourceCreationForGoldInput}>
                Source Dataset 생성
                <Database size={16} />
              </button>
              <button type="button" className="primary-action" onClick={startSilverCreationForGoldInput}>
                Silver Dataset 생성
                <Layers3 size={16} />
              </button>
            </div>
          </div>
          <div className="wizard-source-layout">
            <div className="target-source-card-grid" aria-label="Target dataset silver choices">
              {savedSilverDatasets.map((silverDataset) => {
                const isSelected = targetSilverIds.includes(silverDataset.id);
                const isBase = baseTargetSilver?.id === silverDataset.id;

                return (
                  <article className={`target-source-card ${isSelected ? "selected" : ""}`} key={silverDataset.id}>
                    <button type="button" onClick={() => toggleTargetSilver(silverDataset)}>
                      <span className="source-card-icon">
                        <Layers3 size={18} aria-hidden="true" />
                      </span>
                      <span className="source-card-badge">Silver Dataset</span>
                      <strong>{silverDataset.name}</strong>
                      <p>{silverDataset.purpose}</p>
                      <small>{silverDataset.schema_preview?.length || 0} fields · from {silverDataset.source_dataset_name}</small>
                    </button>
                    {isSelected ? (
                      <button
                        type="button"
                        className={`source-role-toggle ${isBase ? "base" : ""}`}
                        onClick={() => selectBaseTargetSilver(silverDataset.id)}
                      >
                        {isBase ? "Base silver" : "Enrichment silver"}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <FileJson size={18} />
                <div>
                  <strong>Multi-silver preview</strong>
                  <p>{selectedTargetSilvers.length > 0 ? "선택한 Silver Dataset들이 Processing 단계의 join/enrich 입력으로 사용됩니다." : "2개 이상의 Silver Dataset을 선택합니다."}</p>
                </div>
              </div>
              {selectedTargetSilvers.length > 0 ? (
                <div className="multi-source-preview-list">
                  {selectedTargetSilvers.map((silverDataset) => (
                    <div className="multi-source-preview-item" key={silverDataset.id}>
                      <div>
                        <strong>{silverDataset.name}</strong>
                        <p>{baseTargetSilver?.id === silverDataset.id ? "Base silver" : "Enrichment"} · from {silverDataset.source_dataset_name}</p>
                      </div>
                      <span>{(silverDataset.schema_preview || []).map((field) => field.name).slice(0, 4).join(", ")}</span>
                    </div>
                  ))}
                  <div className="target-summary-strip">
                    <span>Target grain</span>
                    <strong>{baseTargetSilver ? "product_id 단위 gold dataset" : "base silver 필요"}</strong>
                    <p>{baseTargetSilver ? `${baseTargetSilver.name}를 기준으로 상품별 row를 만들고 enrichment silver를 붙입니다.` : "Base silver를 고르면 join 기준과 output row 단위가 명확해집니다."}</p>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Layers3}
                  title="아직 선택된 Silver Dataset이 없습니다"
                  body="Silver Dataset을 2개 이상 만든 뒤 Gold Dataset 입력으로 선택합니다."
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
              <p>{selectedTargetSilvers.length >= 2 ? "선택한 Silver Dataset들을 어떤 방식으로 합칠지 processing recipe를 정합니다." : "Silver Dataset을 2개 이상 먼저 선택합니다."}</p>
            </div>
          </div>
          <section className={`transform-panel wizard-inline-panel ${selectedTargetSilvers.length >= 2 ? "" : "disabled"}`}>
            <div className="table-title-line">
              <GitBranch size={18} />
              <div>
                <strong>Recommended processing recipe</strong>
                <p>데모에서는 SQL을 직접 쓰기보다 join, aggregate, enrich, score 방법을 선택해 job draft로 남깁니다.</p>
              </div>
            </div>
            {selectedTargetSilvers.length >= 2 ? (
              <>
                <div className="processing-recipe-grid" aria-label="Target processing recipe choices">
                  {targetProcessingRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      className={selectedRecipeIds.includes(recipe.id) ? "selected" : ""}
                      onClick={() => toggleProcessingRecipe(recipe.id)}
                    >
                      <span>{recipe.kind}</span>
                      <strong>{recipe.title}</strong>
                      <p>{recipe.detail}</p>
                      <small>Output · {recipe.output.join(", ")}</small>
                    </button>
                  ))}
                </div>
                <section className="silver-lineage-preview" aria-label="Silver to gold lineage preview">
                  <div className="table-title-line">
                    <Workflow size={18} />
                    <div>
                      <strong>Processing diagram</strong>
                      <p>Base Silver를 기준으로 enrichment Silver를 붙이고 recipe 순서대로 Gold Dataset을 만듭니다.</p>
                    </div>
                  </div>
                  <div className="process-diagram">
                    <section className="process-diagram-column process-input-column">
                      <span>Inputs</span>
                      <div className="process-node base-node">
                        <strong>{baseTargetSilver?.name || "Base Silver Dataset"}</strong>
                        <small>기준 grain · product_id</small>
                      </div>
                      {enrichmentTargetSilvers.length ? (
                        enrichmentTargetSilvers.map((silverDataset) => (
                          <div className="process-node enrichment-node" key={silverDataset.id}>
                            <strong>{silverDataset.name}</strong>
                            <small>enrichment · {silverDataset.source_dataset_name}</small>
                          </div>
                        ))
                      ) : (
                        <div className="process-node muted-node">
                          <strong>Enrichment Silver</strong>
                          <small>추가 Silver Dataset을 선택하면 join 입력으로 표시됩니다.</small>
                        </div>
                      )}
                    </section>
                    <div className="process-arrow" aria-hidden="true">
                      <ArrowRight size={22} />
                    </div>
                    <section className="process-diagram-column process-recipe-column">
                      <span>Processing</span>
                      <div className="process-recipe-lane">
                        {selectedProcessRecipes.map((recipe, index) => (
                          <article className="process-recipe-node" key={recipe.id}>
                            <span>{index + 1}</span>
                            <div>
                              <strong>{recipe.title}</strong>
                              <small>{recipe.kind} output · {recipe.output.slice(0, 2).join(", ")}</small>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                    <div className="process-arrow" aria-hidden="true">
                      <ArrowRight size={22} />
                    </div>
                    <section className="process-diagram-column process-output-column">
                      <span>Output</span>
                      <div className="process-node gold-node">
                        <strong>{normalizedTargetName || "dataset_product_health_gold"}</strong>
                        <small>{selectedOutputSchema.length} fields · Gold Dataset</small>
                      </div>
                      <div className="process-node catalog-node">
                        <strong>Catalog / AI Query</strong>
                        <small>실행 성공 후 schema, lineage, SQL context로 등록</small>
                      </div>
                    </section>
                  </div>
                </section>
                <div className="target-lineage-strip">
                  <span>{baseTargetSilver?.name || "Base silver"}</span>
                  <ArrowRight size={16} />
                  <span>{selectedTargetSilvers.length} Silver Datasets</span>
                  <ArrowRight size={16} />
                  <span>{enrichmentTargetSilvers.length} enrichment silvers</span>
                  <ArrowRight size={16} />
                  <span>{selectedProcessRecipes.length} recipes</span>
                  <ArrowRight size={16} />
                  <strong>{normalizedTargetName || "Gold Dataset"}</strong>
                </div>
                <div className="transform-output-preview">
                  <div className="table-title-line">
                    <Table2 size={18} />
                    <div>
                      <strong>Gold schema preview</strong>
                      <p>선택한 recipe들이 만들 Gold Dataset schema preview입니다.</p>
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
                      title="Gold schema가 비어 있습니다"
                      body="Gold Dataset에 남길 필드를 하나 이상 선택합니다."
                    />
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={GitBranch}
                title="Process 설정 대기"
                body="뒤로가기로 돌아가 Silver Dataset을 2개 이상 선택합니다."
              />
            )}
          </section>
          <div className="wizard-placeholder compact">
            <CheckCircle2 size={22} />
            <strong>다음 단계에서 Build Job 실행 방식을 확인합니다</strong>
          </div>
        </section>
      );
    }

    if (currentStep.id === "handoff") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>4단계</span>
            <div>
              <h3>Build 실행 준비</h3>
              <p>Gold Dataset을 갱신할 Build Job이 어떤 실행 방식으로 준비되는지 정합니다. 실제 실행 연결은 다음 Phase에서 붙입니다.</p>
            </div>
          </div>
          <section className="wizard-inline-panel target-handoff-panel">
            <div className="table-title-line">
              <Play size={18} />
              <div>
                <strong>Build Job 실행 방식</strong>
                <p>저장될 Build Job의 실행 대상을 고릅니다. Airflow DAG trigger, run id, status polling은 아직 호출하지 않습니다.</p>
              </div>
            </div>
            <div className="target-executor-grid" aria-label="Target dataset executor handoff">
              {targetExecutorOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={targetExecutorMode === option.id ? "selected" : ""}
                  onClick={() => {
                    setTargetExecutorMode(option.id);
                    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                  }}
                >
                  <Network size={18} />
                  <strong>{option.label}</strong>
                  <p>{option.detail}</p>
                </button>
              ))}
            </div>
            <div className="target-summary-strip">
              <span>실행 방식</span>
              <strong>{targetExecutorMode}</strong>
              <p>
                {targetExecutorMode === "airflow"
                  ? "Airflow 실행 준비 metadata만 저장합니다. DAG trigger와 run status는 다음 Phase에서 붙입니다."
                  : targetExecutorMode === "spark_runner"
                    ? "Spark runner 실행 준비 metadata만 저장합니다. 실제 materialization은 다음 실행 Phase에서 붙입니다."
                    : "Local runner 실행 준비 metadata만 저장합니다. 실제 Silver/Gold 생성은 다음 실행 Phase에서 붙입니다."}
              </p>
            </div>
          </section>
        </section>
      );
    }

    if (currentStep.id === "scheduling") {
      return (
        <section className="wizard-step-body">
          <div className="wizard-step-heading">
            <span>5단계</span>
            <div>
              <h3>Scheduling</h3>
              <p>Gold Dataset을 갱신할 Build Job의 실행 시점을 정합니다.</p>
            </div>
          </div>
          <section className="wizard-inline-panel target-schedule-panel">
            <div className="table-title-line">
              <Clock3 size={18} />
              <div>
                <strong>Schedule policy</strong>
                <p>데모 기본값은 manual입니다. schedule placeholder는 저장 의미만 있고 실제 스케줄러 등록은 하지 않습니다.</p>
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
                    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                  }}
                />
                <span>
                  <strong>Manual</strong>
                  <small>데모 기본값. 실행 기록에서 사용자가 실행할 때만 output evidence가 생성됩니다.</small>
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
                    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                  }}
                />
                <span>
                  <strong>Schedule placeholder</strong>
                  <small>스케줄 의도만 저장합니다. cron 등록, DAG trigger, 자동 output 생성은 하지 않습니다.</small>
                </span>
              </label>
            </div>
            <label className="target-name-field">
              <span>스케줄 메모</span>
              <input
                type="text"
                value={targetScheduleNote}
                onChange={(event) => {
                  setTargetScheduleNote(event.target.value);
                  setTargetDraftSaveState({ status: "idle", record: null, error: "" });
                }}
                placeholder="데모에서는 수동 실행으로만 준비합니다."
              />
            </label>
            <div className="target-summary-strip">
              <span>Schedule summary</span>
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
            <span>6단계</span>
            <div>
              <h3>Review</h3>
              <p>Gold Dataset과 Build Job 설정을 최종 확인합니다.</p>
            </div>
          </div>
          <div className="review-summary-grid dataset-review-grid target-review-grid">
            <article className="review-primary">
              <span>Gold Dataset</span>
              <strong>{normalizedTargetName || "Gold Dataset 이름 필요"}</strong>
              <p>{normalizedTargetDescription || "생성 목적 없음"}</p>
            </article>
            <article className="review-output">
              <span>Job input</span>
              <strong>{selectedTargetSilvers.length} Silver Datasets</strong>
              <p>{baseTargetSilver ? `Base silver · ${baseTargetSilver.name} · Target grain product_id` : "Silver 선택 단계에서 고릅니다."}</p>
            </article>
            <article>
              <span>ETL process</span>
              <strong>{selectedProcessRecipes.length} recipes</strong>
              <p>{selectedFieldSummary}{selectedProcessRecipes.length > 3 ? "..." : ""}</p>
            </article>
            <article>
              <span>Silver outputs</span>
              <strong>{selectedTargetSilvers.length} persisted inputs</strong>
              <p>{selectedTargetSilvers.map((silverDataset) => silverDataset.name).slice(0, 3).join(", ") || "silver 없음"}{selectedTargetSilvers.length > 3 ? "..." : ""}</p>
            </article>
            <article>
              <span>Gold schema</span>
              <strong>{selectedOutputSchema.length} fields</strong>
              <p>{selectedOutputSchema.map((field) => field.name).slice(0, 4).join(", ") || "schema 없음"}</p>
            </article>
            <article>
              <span>실행 준비</span>
              <strong>{targetExecutorMode}</strong>
              <p>실제 DAG trigger/run status는 다음 Phase에서 연결합니다.</p>
            </article>
            <article>
              <span>Schedule</span>
              <strong>{targetScheduleMode === "manual" ? "Manual trigger" : "Schedule placeholder"}</strong>
              <p>{targetScheduleNote.trim() || "schedule note 없음"}</p>
            </article>
          </div>
          <div className="target-lineage-strip review-lineage-strip">
            <span>External Connections</span>
            <ArrowRight size={16} />
            <span>Source Datasets</span>
            <ArrowRight size={16} />
            <span>{selectedTargetSilvers.length} Silver Datasets</span>
            <ArrowRight size={16} />
            <span>{selectedProcessRecipes.length} Processing recipes</span>
            <ArrowRight size={16} />
            <span>{targetExecutorMode}</span>
            <ArrowRight size={16} />
            <strong>{normalizedTargetName || "Gold Dataset"}</strong>
          </div>
          <div className="wizard-placeholder compact">
            {targetDraftSaveState.status === "saved" ? <CheckCircle2 size={22} /> : <ServerCog size={22} />}
            <strong>
              {targetDraftSaveState.status === "saved"
                ? `저장됨: ${targetDraftSaveState.record?.id}`
                : "Gold Dataset과 Build Job 설정을 metadata로 저장합니다. 실제 trigger는 다음 Phase에서 연결합니다."}
            </strong>
            {targetDraftSaveState.status === "error" ? <p>{targetDraftSaveState.error}</p> : null}
          </div>
        </section>
      );
    }

    return (
      <section className="wizard-step-body">
        <EmptyState icon={AlertCircle} title="알 수 없는 단계입니다" body="wizard step 설정을 확인합니다." />
      </section>
    );
  }

  return renderTargetDatasetWizard();
}
