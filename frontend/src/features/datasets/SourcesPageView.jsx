import {
  ConnectionManageModal,
  DatasetTypeChoiceModal,
  JobScheduleEditorModal,
  SilverDatasetManageModal,
  SourceDatasetManageModal,
  SourceStartModal,
  TargetDraftManageModal,
} from "./DatasetComponents";

import { demoSourceDatasets } from "./datasetConfig";

import { ExternalConnectionWizard } from "./SourcesExternalConnectionWizard";
import { SourceDatasetWizard } from "./SourcesSourceDatasetWizard";
import { SilverDatasetWizard } from "./SourcesSilverDatasetWizard";
import { TargetDatasetWizard } from "./SourcesTargetDatasetWizard";
import { SourcesNavigationView } from "./SourcesNavigationView";

export function SourcesPageView(props) {
  const {
    navigate, setNotice,
    dataView, isDatasetTypeModalOpen,
    setIsDatasetTypeModalOpen, datasetCreationMode,
    setDatasetCreationMode, isSourceModalOpen,
    setIsSourceModalOpen, connectionWizardStepIndex,
    selectedConnectionType, connectionName,
    setConnectionName, connectionResource,
    connectionSecretRefs, connectionDiscoveryScope,
    connectionInspected, connectionInspectState,
    connectionRuntimeCheckState, connectionSaveState,
    setConnectionSaveState, productHealthPresetState,
    jobRunCreateState, sourceWizardStepIndex,
    sourceDraft, sourceDiscoveryState,
    setSourceDiscoveryState, sourceDatasetName,
    setSourceDatasetName, sourceRawScope,
    setSourceRawScope, sourceDatasetSaveState,
    setSourceDatasetSaveState, managedSourceDataset,
    managedSourceForm, setManagedSourceForm,
    managedSourceMode, setManagedSourceMode,
    managedSourceState, setManagedSourceState,
    managedSourceSnapshotState, managedConnection,
    managedConnectionForm, setManagedConnectionForm,
    managedConnectionMode, setManagedConnectionMode,
    managedConnectionState, setManagedConnectionState,
    managedSilverDataset, managedSilverForm,
    setManagedSilverForm, managedSilverMode,
    setManagedSilverMode, managedSilverState,
    setManagedSilverState, managedSilverMaterializationState,
    managedTargetDraft, managedTargetForm,
    setManagedTargetForm, managedTargetMode,
    setManagedTargetMode, managedTargetState,
    setManagedTargetState, silverWizardStepIndex,
    selectedSilverSourceId, silverDatasetName,
    setSilverDatasetName, silverPurpose,
    setSilverPurpose, selectedSilverStandardizeRules,
    selectedSilverValidationRules, silverDatasetSaveState,
    setSilverDatasetSaveState, setDatasetReturnFlow,
    targetSilverIds, selectedRecipeIds,
    targetName, setTargetName,
    targetDescription, setTargetDescription,
    targetScheduleMode, setTargetScheduleMode,
    targetScheduleNote, setTargetScheduleNote,
    targetExecutorMode, setTargetExecutorMode,
    targetDraftSaveState, setTargetDraftSaveState,
    scheduleEditorJob, scheduleEditorForm,
    setScheduleEditorForm, scheduleEditorState,
    currentStepIndex, savedExternalConnections,
    credentialPolicy, productHealthSourceInventory,
    savedSourceDatasets, savedSilverDatasets,
    savedTargetDatasetDrafts, datasetDraftListState,
    refreshDatasetDraftLists, normalizedTargetName,
    normalizedTargetDescription, selectedTargetSilvers,
    baseTargetSilver, enrichmentTargetSilvers,
    selectedProcessRecipes, selectedFieldSummary,
    selectedOutputSchema, wizardSteps,
    sourceWizardSteps, connectionWizardSteps,
    currentStep, currentSourceStep,
    currentConnectionStep, isRuntimeConnection,
    selectedConnectionPresets, isConnectionReadyForReview,
    sourceDiscovery, sourceSchemaPreview,
    silverWizardSteps, currentSilverStep,
    selectedSilverSource, selectedSilverStandardizeRuleDetails,
    selectedSilverValidationRuleDetails, canGoNext,
    canGoNextSource, canGoNextConnection,
    canGoNextSilver, sourceConnectionOptions,
    silverDatasetRecords, goldDatasetRecords,
    connectionJobRecords, silverJobRecords,
    goldJobRecords, runProductHealthPreset,
    handleSourceSelect, selectSourceConnection,
    selectProductHealthInventorySource, discoverSelectedSourceConnection,
    selectSilverSourceDataset, toggleSilverRule,
    saveSilverDatasetDraft, saveSourceDatasetDraft,
    openSourceDatasetDetail, closeSourceDatasetDetail,
    openConnectionDetail, closeConnectionDetail,
    saveManagedConnection, removeManagedConnection,
    openSilverDatasetDetail, closeSilverDatasetDetail,
    saveManagedSilverDataset, removeManagedSilverDataset,
    runManagedSilverMaterialization, openTargetDraftDetail,
    closeTargetDraftDetail, saveManagedTargetDraft,
    removeManagedTargetDraft, saveManagedSourceDataset,
    removeManagedSourceDataset, runManagedSourceSnapshot,
    toggleTargetSilver, selectBaseTargetSilver,
    toggleProcessingRecipe, saveTargetDatasetDraft,
    requestManualJobRun, openScheduleEditor,
    closeScheduleEditor, saveJobSchedule,
    goNext, goBack,
    goNextSilver, goBackSilver,
    startDatasetCreation, startSourceCreationForGoldInput,
    startSilverCreationForGoldInput, selectConnectionType,
    setConnectionResourceValue, setConnectionSecretRefValue,
    setConnectionDiscoveryScopeValue, selectConnectionPreset,
    inspectConnectionSource, testConnectionRuntimeFromWizard,
    saveExternalConnectionDraft, goNextConnection,
    goBackConnection, goNextSource,
    goBackSource,
  } = props;

  return (
    <div className="page-stack">
      {!datasetCreationMode ? <SourcesNavigationView
      {...{
        navigate, setNotice,
        dataView, productHealthPresetState,
        jobRunCreateState, savedExternalConnections,
        credentialPolicy, savedSourceDatasets,
        savedSilverDatasets, savedTargetDatasetDrafts,
        datasetDraftListState, refreshDatasetDraftLists,
        silverDatasetRecords, goldDatasetRecords,
        connectionJobRecords, silverJobRecords,
        goldJobRecords, runProductHealthPreset,
        openSourceDatasetDetail, openConnectionDetail,
        openSilverDatasetDetail, openTargetDraftDetail,
        requestManualJobRun, openScheduleEditor,
        startDatasetCreation,
      }}
    /> : null}
      {datasetCreationMode ? (
        <div className="dataset-mode-strip" aria-label="Current dataset creation mode">
          <span>현재 생성 유형</span>
          <strong>
            {datasetCreationMode === "connection"
              ? "External Connection"
              : datasetCreationMode === "source"
                ? "Source Dataset"
                : datasetCreationMode === "silver"
                  ? "Silver Dataset"
                  : "Gold Dataset"}
          </strong>
          <p>
            {datasetCreationMode === "connection"
              ? "Local File, Local Folder, Kafka Topic 연결 설정을 준비하는 흐름입니다."
              : datasetCreationMode === "source"
                ? "등록된 External Connection에서 raw/source dataset을 만드는 흐름입니다."
                : datasetCreationMode === "silver"
                  ? "Source Dataset을 표준화/검증한 Silver Dataset metadata를 만드는 흐름입니다."
                  : "Silver Dataset을 조합해 Gold Dataset과 Build Job 설정을 준비하는 흐름입니다."}
          </p>
        </div>
      ) : null}
      {datasetCreationMode === "connection" ? <ExternalConnectionWizard
      {...{
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
      }}
    /> : null}
      {datasetCreationMode === "source" ? <SourceDatasetWizard
      {...{
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
      }}
    /> : null}
      {datasetCreationMode === "silver" ? <SilverDatasetWizard
      {...{
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
      }}
    /> : null}
      {datasetCreationMode === "target" ? <TargetDatasetWizard
      {...{
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
      }}
    /> : null}
      {isDatasetTypeModalOpen ? (
        <DatasetTypeChoiceModal
          onClose={() => setIsDatasetTypeModalOpen(false)}
          onSelect={startDatasetCreation}
        />
      ) : null}
      {isSourceModalOpen ? (
        <SourceStartModal
          sources={demoSourceDatasets}
          onClose={() => setIsSourceModalOpen(false)}
          onSelect={handleSourceSelect}
          onCreateNew={() => {
            setIsSourceModalOpen(false);
            setDatasetReturnFlow({ target: "silver" });
            startDatasetCreation("source");
            setNotice("Source Dataset 생성 화면으로 이동했습니다.");
          }}
        />
      ) : null}
      {managedSourceDataset ? (
        <SourceDatasetManageModal
          dataset={managedSourceDataset}
          form={managedSourceForm}
          mode={managedSourceMode}
          state={managedSourceState}
          onClose={closeSourceDatasetDetail}
          onModeChange={(mode) => {
            setManagedSourceMode(mode);
            setManagedSourceState({ status: "idle", error: "" });
          }}
          onFormChange={setManagedSourceForm}
          onSave={saveManagedSourceDataset}
          onDelete={removeManagedSourceDataset}
          snapshotState={managedSourceSnapshotState}
          onRunSnapshot={runManagedSourceSnapshot}
        />
      ) : null}
      {managedConnection ? (
        <ConnectionManageModal
          connection={managedConnection}
          form={managedConnectionForm}
          mode={managedConnectionMode}
          state={managedConnectionState}
          onClose={closeConnectionDetail}
          onModeChange={(mode) => {
            setManagedConnectionMode(mode);
            setManagedConnectionState({ status: "idle", error: "" });
          }}
          onFormChange={setManagedConnectionForm}
          onSave={saveManagedConnection}
          onDelete={removeManagedConnection}
        />
      ) : null}
      {managedSilverDataset ? (
        <SilverDatasetManageModal
          dataset={managedSilverDataset}
          form={managedSilverForm}
          mode={managedSilverMode}
          state={managedSilverState}
          onClose={closeSilverDatasetDetail}
          onModeChange={(mode) => {
            setManagedSilverMode(mode);
            setManagedSilverState({ status: "idle", error: "" });
          }}
          onFormChange={setManagedSilverForm}
          onSave={saveManagedSilverDataset}
          onDelete={removeManagedSilverDataset}
          materializationState={managedSilverMaterializationState}
          onRunMaterialization={runManagedSilverMaterialization}
        />
      ) : null}
      {managedTargetDraft ? (
        <TargetDraftManageModal
          draft={managedTargetDraft}
          form={managedTargetForm}
          mode={managedTargetMode}
          state={managedTargetState}
          onClose={closeTargetDraftDetail}
          onModeChange={(mode) => {
            setManagedTargetMode(mode);
            setManagedTargetState({ status: "idle", error: "" });
          }}
          onFormChange={setManagedTargetForm}
          onSave={saveManagedTargetDraft}
          onDelete={removeManagedTargetDraft}
        />
      ) : null}
      {scheduleEditorJob ? (
        <JobScheduleEditorModal
          job={scheduleEditorJob}
          form={scheduleEditorForm}
          state={scheduleEditorState}
          onFormChange={setScheduleEditorForm}
          onSave={saveJobSchedule}
          onClose={closeScheduleEditor}
        />
      ) : null}
    </div>
  );
}
