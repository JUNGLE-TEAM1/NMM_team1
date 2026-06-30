import { useEffect } from "react";

import {
  createExternalConnection,
  deleteExternalConnection,
  inspectExternalConnection,
  testExternalConnection,
  updateExternalConnection,
} from "../../api/externalConnectionApi";
import {
  createSilverDataset,
  createSilverDatasetMaterialization,
  deleteSilverDataset,
  listSilverDatasetMaterializations,
  updateSilverDataset,
  updateSilverDatasetSchedule,
} from "../../api/silverDatasetApi";
import {
  createSourceDataset,
  createSourceDatasetSnapshot,
  deleteSourceDataset,
  listSourceDatasetSnapshots,
  runProductHealthPresetSynthesis,
  updateSourceDataset,
} from "../../api/sourceDatasetApi";
import {
  createTargetDatasetDraft,
  createTargetDatasetJobRun,
  deleteTargetDatasetDraft,
  updateTargetDatasetDraft,
  updateTargetDatasetDraftSchedule,
} from "../../api/targetDatasetDraftApi";
import { useDatasetDraftData } from "./useDatasetDraftData";
import { useSourcesPageState } from "./useSourcesPageState";
import { buildSourcesPageModel } from "./sourcesPageModel";
import { SourcesPageView } from "./SourcesPageView";

import {
  connectionSchemaPreview,
  defaultConnectionSecretRefs,
  defaultDiscoveryScopeForConnectionType,
  defaultSourceScopeForConnection,
  externalConnectionPresets,
  externalConnectionTypes,
  isLocalDiscoveryConnection,
  mapExternalConnectionRecord,
  mapProductHealthInventoryItemToConnection,
  secretRefsForConnection,
  silverOutputForSource,
  sourceDatasetNameForConnection,
  targetSilverRefPayload,
} from "./datasetConfig";

export function SourcesPage({ navigate, setNotice, dataView = "datasets-source", pendingDatasetEdit, onPendingDatasetEditConsumed }) {
  const {
    isDatasetTypeModalOpen, setIsDatasetTypeModalOpen,
    datasetCreationMode, setDatasetCreationMode,
    isSourceModalOpen, setIsSourceModalOpen,
    sourceModalPurpose, setSourceModalPurpose,
    connectionWizardStepIndex, setConnectionWizardStepIndex,
    selectedConnectionType, setSelectedConnectionType,
    connectionName, setConnectionName,
    connectionResource, setConnectionResource,
    connectionSecretRefs, setConnectionSecretRefs,
    connectionDiscoveryScope, setConnectionDiscoveryScope,
    connectionInspected, setConnectionInspected,
    connectionInspectState, setConnectionInspectState,
    connectionRuntimeCheckState, setConnectionRuntimeCheckState,
    connectionSaveState, setConnectionSaveState,
    productHealthPresetState, setProductHealthPresetState,
    jobRunCreateState, setJobRunCreateState,
    sourceWizardStepIndex, setSourceWizardStepIndex,
    sourceDraft, setSourceDraft,
    sourceDiscoveryState, setSourceDiscoveryState,
    sourceDatasetName, setSourceDatasetName,
    sourceRawScope, setSourceRawScope,
    sourceDatasetSaveState, setSourceDatasetSaveState,
    managedSourceDataset, setManagedSourceDataset,
    managedSourceForm, setManagedSourceForm,
    managedSourceMode, setManagedSourceMode,
    managedSourceState, setManagedSourceState,
    managedSourceSnapshotState, setManagedSourceSnapshotState,
    managedConnection, setManagedConnection,
    managedConnectionForm, setManagedConnectionForm,
    managedConnectionMode, setManagedConnectionMode,
    managedConnectionState, setManagedConnectionState,
    managedSilverDataset, setManagedSilverDataset,
    managedSilverForm, setManagedSilverForm,
    managedSilverMode, setManagedSilverMode,
    managedSilverState, setManagedSilverState,
    managedSilverMaterializationState, setManagedSilverMaterializationState,
    managedTargetDraft, setManagedTargetDraft,
    managedTargetForm, setManagedTargetForm,
    managedTargetMode, setManagedTargetMode,
    managedTargetState, setManagedTargetState,
    silverWizardStepIndex, setSilverWizardStepIndex,
    selectedSilverSourceId, setSelectedSilverSourceId,
    silverDatasetName, setSilverDatasetName,
    silverPurpose, setSilverPurpose,
    selectedSilverStandardizeRules, setSelectedSilverStandardizeRules,
    selectedSilverValidationRules, setSelectedSilverValidationRules,
    silverDatasetSaveState, setSilverDatasetSaveState,
    datasetReturnFlow, setDatasetReturnFlow,
    selectedSource, setSelectedSource,
    selectedFields, setSelectedFields,
    targetSilverIds, setTargetSilverIds,
    baseTargetSilverId, setBaseTargetSilverId,
    selectedRecipeIds, setSelectedRecipeIds,
    targetName, setTargetName,
    targetDescription, setTargetDescription,
    targetScheduleMode, setTargetScheduleMode,
    targetScheduleNote, setTargetScheduleNote,
    targetExecutorMode, setTargetExecutorMode,
    targetDraftSaveState, setTargetDraftSaveState,
    scheduleEditorJob, setScheduleEditorJob,
    scheduleEditorForm, setScheduleEditorForm,
    scheduleEditorState, setScheduleEditorState,
    currentStepIndex, setCurrentStepIndex,
  } = useSourcesPageState();
  const {
    savedExternalConnections,
    setSavedExternalConnections,
    credentialPolicy,
    productHealthSourceInventory,
    savedSourceDatasets,
    setSavedSourceDatasets,
    savedSilverDatasets,
    setSavedSilverDatasets,
    savedTargetDatasetDrafts,
    setSavedTargetDatasetDrafts,
    savedTargetJobRuns,
    setSavedTargetJobRuns,
    publishedCatalogDatasets,
    catalogDatasetPolicy,
    datasetDraftListState,
    refreshDatasetDraftLists,
  } = useDatasetDraftData({ setNotice, mapExternalConnectionRecord });
  const {
    normalizedTargetName, normalizedTargetDescription,
    selectedTargetSilvers, baseTargetSilver,
    enrichmentTargetSilvers, selectedProcessRecipes,
    selectedSilverOutputs, selectedFieldSummary,
    selectedOutputSchema, targetSourceSummary,
    wizardSteps, sourceWizardSteps,
    connectionWizardSteps, currentStep,
    currentSourceStep, currentConnectionStep,
    isRuntimeConnection, selectedConnectionPresets,
    isConnectionReadyForReview, sourceDiscovery,
    sourceSchemaPreview, silverWizardSteps,
    currentSilverStep, selectedSilverSource,
    selectedSilverStandardizeRuleDetails, selectedSilverValidationRuleDetails,
    canGoNext, canGoNextSource,
    canGoNextConnection, canGoNextSilver,
    sourceConnectionOptions, silverDatasetRecords,
    goldDatasetRecords, connectionJobRecords,
    silverJobRecords, goldJobRecords,
  } = buildSourcesPageModel({
    targetName,
    targetDescription,
    savedSilverDatasets,
    targetSilverIds,
    baseTargetSilverId,
    selectedRecipeIds,
    currentStepIndex,
    targetExecutorMode,
    targetScheduleMode,
    sourceDraft,
    sourceWizardStepIndex,
    sourceDatasetName,
    sourceRawScope,
    selectedConnectionType,
    connectionName,
    connectionWizardStepIndex,
    connectionResource,
    connectionRuntimeCheckState,
    connectionInspectState,
    connectionInspected,
    sourceDiscoveryState,
    silverWizardStepIndex,
    savedSourceDatasets,
    selectedSilverSourceId,
    selectedSilverStandardizeRules,
    selectedSilverValidationRules,
    silverDatasetName,
    silverPurpose,
    savedExternalConnections,
    savedTargetDatasetDrafts,
    publishedCatalogDatasets,
  });

  async function runProductHealthPreset() {
    setProductHealthPresetState({ status: "running", result: null, error: "" });
    try {
      const result = await runProductHealthPresetSynthesis();
      setProductHealthPresetState({ status: "succeeded", result, error: "" });
      setNotice(`${result.gold_output?.path || "Product Health Gold"} preset synthesis가 완료됐습니다.`);
      await refreshDatasetDraftLists();
    } catch (error) {
      setProductHealthPresetState({ status: "error", result: null, error: error.message });
      setNotice(`Product Health preset synthesis 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    if (!pendingDatasetEdit || datasetDraftListState.loading) return;
    if (pendingDatasetEdit.type === "silver" && dataView === "datasets-silver") {
      const silverDataset = savedSilverDatasets.find((dataset) => dataset.id === pendingDatasetEdit.id);
      if (silverDataset) {
        openSilverDatasetDetail(silverDataset, "edit");
        onPendingDatasetEditConsumed?.();
      }
    }
    if (pendingDatasetEdit.type === "gold" && dataView === "datasets-gold") {
      const targetDraft = savedTargetDatasetDrafts.find((draft) => draft.id === pendingDatasetEdit.id);
      if (targetDraft) {
        openTargetDraftDetail(targetDraft, "edit");
        onPendingDatasetEditConsumed?.();
      }
    }
  }, [pendingDatasetEdit, dataView, datasetDraftListState.loading, savedSilverDatasets, savedTargetDatasetDrafts]);

  function handleSourceSelect(source) {
    setSelectedSource(source);
    setSelectedFields(source.columns);
    setNotice(`${source.name} source를 선택했습니다.`);
    setIsSourceModalOpen(false);
  }

  function selectSourceConnection(connection) {
    setSourceDraft(connection);
    setSourceDiscoveryState({ status: "idle", result: null, error: "" });
    setSourceDatasetName(sourceDatasetNameForConnection(connection));
    setSourceRawScope(defaultSourceScopeForConnection(connection));
    setSourceDatasetSaveState({ status: "idle", record: null, error: "" });
    setNotice(`${connection.name} external connection을 선택했습니다.`);
  }

  function selectProductHealthInventorySource(item) {
    if (!item.can_create_source_dataset) {
      setNotice(`${item.label} source는 아직 Source Dataset으로 저장할 수 없습니다: ${item.message}`);
      return;
    }
    const connection = mapProductHealthInventoryItemToConnection(item);
    setSourceDraft(connection);
    setSourceDatasetName(item.source_dataset_name);
    setSourceRawScope(item.path);
    setSourceDiscoveryState({
      status: "discovered",
      result: {
        detected_format: connection.detectedFormat,
        detected_dataset: item.label,
        confidence: connection.confidence,
        recommended_role: "Source Dataset",
        schema_preview: item.schema_preview || [],
        bytes: item.bytes || 0,
        file_count: 1,
        row_count: item.row_count,
        row_count_status: item.row_count_status,
        message: item.message,
      },
      error: "",
    });
    setSourceDatasetSaveState({ status: "idle", record: null, error: "" });
    setNotice(`${item.label} Product Health source 후보를 선택했습니다.`);
  }

  async function discoverSelectedSourceConnection(connection = sourceDraft) {
    if (!connection) {
      setNotice("External Connection을 먼저 선택하세요.");
      return;
    }
    if (!isLocalDiscoveryConnection(connection) && !sourceRawScope.trim()) {
      setSourceDiscoveryState({
        status: "error",
        result: null,
        error: `${connection.typeLabel} schema discovery에는 table/collection/object/topic raw scope가 필요합니다.`,
      });
      setNotice("raw scope를 먼저 입력하세요.");
      return;
    }
    setSourceDiscoveryState({ status: "inspecting", result: null, error: "" });
    setSourceDatasetSaveState({ status: "idle", record: null, error: "" });
    try {
      const result = await inspectExternalConnection({
        connector_type: connection.connectorId,
        resource: connection.resource,
        resource_label: connection.resourceLabel,
        secret_refs: secretRefsForConnection(connection),
        options: isLocalDiscoveryConnection(connection) ? {} : { scope: sourceRawScope.trim() },
      });
      const schema = result.schema_preview.map((field) => ({
        name: field.name,
        type: field.type,
        sample: field.sample || "discovered",
      }));
      setSourceDraft({
        ...connection,
        detectedFormat: result.detected_format,
        detectedDataset: result.detected_dataset,
        confidence: result.confidence,
        recommendedRole: result.recommended_role,
        columns: schema.map((field) => field.name),
        schema,
      });
      setSourceDiscoveryState({ status: "discovered", result, error: "" });
      setNotice(`${connection.name} schema discovery를 확인했습니다.`);
    } catch (error) {
      setSourceDiscoveryState({ status: "error", result: null, error: error.message });
      setNotice(`Source Dataset discovery 실패: ${error.message}`);
    }
  }

  function selectSilverSourceDataset(sourceDataset) {
    setSelectedSilverSourceId(sourceDataset.id);
    setSilverDatasetName(`silver_${sourceDataset.name.replace(/^source_/, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`);
    setSilverPurpose(`${sourceDataset.name}를 표준화/검증한 Silver Dataset metadata`);
    setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
  }

  function toggleSilverRule(kind, ruleId) {
    const setter = kind === "standardize" ? setSelectedSilverStandardizeRules : setSelectedSilverValidationRules;
    setter((currentRules) =>
      currentRules.includes(ruleId)
        ? currentRules.filter((currentRule) => currentRule !== ruleId)
        : [...currentRules, ruleId],
    );
    setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
  }

  async function saveSilverDatasetDraft() {
    if (
      !selectedSilverSource ||
      !silverDatasetName.trim() ||
      !silverPurpose.trim() ||
      selectedSilverStandardizeRuleDetails.length === 0 ||
      selectedSilverValidationRuleDetails.length === 0
    ) {
      setNotice("source dataset, silver name, rule을 먼저 확인하세요.");
      return;
    }

    setSilverDatasetSaveState({ status: "saving", record: null, error: "" });
    try {
      const record = await createSilverDataset({
        source_dataset_id: selectedSilverSource.id,
        source_dataset_name: selectedSilverSource.name,
        name: silverDatasetName.trim(),
        purpose: silverPurpose.trim(),
        standardize_rules: selectedSilverStandardizeRuleDetails.map((rule) => rule.id),
        validation_rules: selectedSilverValidationRuleDetails.map((rule) => rule.id),
        schema_preview: (selectedSilverSource.schema_preview || []).map((field) => ({
          name: field.name,
          type: field.type,
        })),
      });
      setSilverDatasetSaveState({ status: "saved", record, error: "" });
      setSavedSilverDatasets((records) => [record, ...records.filter((silverRecord) => silverRecord.id !== record.id)]);
      setNotice(`${record.name} silver dataset metadata를 저장했습니다.`);
      if (datasetReturnFlow?.target === "gold") {
        setTargetSilverIds((ids) => (ids.includes(record.id) ? ids : [record.id, ...ids]));
        setBaseTargetSilverId((currentId) => currentId || record.id);
        setCurrentStepIndex(1);
        setDatasetCreationMode("target");
        setDatasetReturnFlow(null);
        setNotice(`${record.name} 저장 후 Gold Dataset 입력 선택으로 돌아왔습니다.`);
      } else {
        setDatasetCreationMode(null);
      }
    } catch (error) {
      setSilverDatasetSaveState({ status: "error", record: null, error: error.message });
      setNotice(`Silver Dataset 저장 실패: ${error.message}`);
    }
  }

  async function saveSourceDatasetDraft() {
    if (!sourceDraft || !sourceDatasetName.trim() || !sourceRawScope.trim()) {
      setNotice("connection, source dataset name, source scope를 먼저 확인하세요.");
      return;
    }
    if (!sourceDiscovery.canCreate || sourceSchemaPreview.length === 0) {
      setNotice("Source Dataset schema discovery가 가능한 connection만 저장할 수 있습니다.");
      return;
    }

    setSourceDatasetSaveState({ status: "saving", record: null, error: "" });
    try {
      const record = await createSourceDataset({
        connection_id: sourceDraft.id,
        connection_name: sourceDraft.name,
        connection_type: sourceDraft.connectorId,
        name: sourceDatasetName.trim(),
        raw_scope: sourceRawScope.trim(),
        resource_label: sourceDraft.resourceLabel,
        schema_preview: sourceSchemaPreview.map((field) => ({
          name: field.name,
          type: field.type,
        })),
      });
      setSourceDatasetSaveState({ status: "saved", record, error: "" });
      setSavedSourceDatasets((records) => [record, ...records.filter((sourceRecord) => sourceRecord.id !== record.id)]);
      setNotice(`${record.name} source dataset metadata를 저장했습니다.`);
      if (datasetReturnFlow?.target === "silver") {
        selectSilverSourceDataset(record);
        setSilverWizardStepIndex(1);
        setDatasetCreationMode("silver");
        setDatasetReturnFlow({ target: "gold" });
        setNotice(`${record.name} 저장 후 Silver Dataset rules 설정으로 이동했습니다.`);
      } else {
        setDatasetCreationMode(null);
      }
    } catch (error) {
      setSourceDatasetSaveState({ status: "error", record: null, error: error.message });
      setNotice(`Source Dataset 저장 실패: ${error.message}`);
    }
  }

  function openSourceDatasetDetail(sourceDataset, mode = "detail") {
    setManagedSourceDataset(sourceDataset);
    setManagedSourceForm({
      name: sourceDataset.name,
      raw_scope: sourceDataset.raw_scope,
      resource_label: sourceDataset.resource_label,
    });
    setManagedSourceMode(mode);
    setManagedSourceState({ status: "idle", error: "" });
    setManagedSourceSnapshotState({ status: "loading", snapshots: [], error: "" });
    listSourceDatasetSnapshots(sourceDataset.id)
      .then((snapshots) => {
        setManagedSourceSnapshotState({ status: "idle", snapshots, error: "" });
      })
      .catch((error) => {
        setManagedSourceSnapshotState({ status: "error", snapshots: [], error: error.message });
      });
  }

  function closeSourceDatasetDetail() {
    setManagedSourceDataset(null);
    setManagedSourceMode("detail");
    setManagedSourceState({ status: "idle", error: "" });
    setManagedSourceSnapshotState({ status: "idle", snapshots: [], error: "" });
  }

  function openConnectionDetail(connection, mode = "detail") {
    setManagedConnection(connection);
    setManagedConnectionForm({
      name: connection.name,
      resource: connection.resource,
      resource_label: connection.resourceLabel,
      sync_mode: connection.syncMode,
      sync_schedule: connection.syncSchedule,
    });
    setManagedConnectionMode(mode);
    setManagedConnectionState({ status: "idle", error: "" });
  }

  function closeConnectionDetail() {
    setManagedConnection(null);
    setManagedConnectionMode("detail");
    setManagedConnectionState({ status: "idle", error: "" });
  }

  async function saveManagedConnection() {
    if (!managedConnection) return;
    if (!managedConnectionForm.name.trim() || !managedConnectionForm.resource.trim() || !managedConnectionForm.resource_label.trim()) {
      setManagedConnectionState({ status: "error", error: "name, resource, resource label을 확인하세요." });
      return;
    }

    setManagedConnectionState({ status: "saving", error: "" });
    try {
      const updated = await updateExternalConnection(managedConnection.id, {
        name: managedConnectionForm.name.trim(),
        resource: managedConnectionForm.resource.trim(),
        resource_label: managedConnectionForm.resource_label.trim(),
        sync_mode: managedConnectionForm.sync_mode,
        sync_schedule: managedConnectionForm.sync_schedule.trim(),
      });
      const mappedConnection = mapExternalConnectionRecord(updated);
      setSavedExternalConnections((records) => records.map((record) => (record.id === mappedConnection.id ? mappedConnection : record)));
      setManagedConnection(mappedConnection);
      setManagedConnectionMode("detail");
      setManagedConnectionState({ status: "saved", error: "" });
      setNotice(`${mappedConnection.name} external connection metadata를 수정했습니다.`);
    } catch (error) {
      setManagedConnectionState({ status: "error", error: error.message });
      setNotice(`External Connection 수정 실패: ${error.message}`);
    }
  }

  async function removeManagedConnection() {
    if (!managedConnection) return;
    setManagedConnectionState({ status: "deleting", error: "" });
    try {
      await deleteExternalConnection(managedConnection.id);
      setSavedExternalConnections((records) => records.filter((record) => record.id !== managedConnection.id));
      setNotice(`${managedConnection.name} external connection metadata를 삭제했습니다.`);
      closeConnectionDetail();
    } catch (error) {
      setManagedConnectionState({ status: "error", error: error.message });
      setNotice(`External Connection 삭제 실패: ${error.message}`);
    }
  }

  function openSilverDatasetDetail(silverDataset, mode = "detail") {
    setManagedSilverDataset(silverDataset);
    setManagedSilverForm({
      name: silverDataset.name,
      purpose: silverDataset.purpose,
      standardize_rules: (silverDataset.standardize_rules || []).join("\n"),
      validation_rules: (silverDataset.validation_rules || []).join("\n"),
    });
    setManagedSilverMode(mode);
    setManagedSilverState({ status: "idle", error: "" });
    setManagedSilverMaterializationState({ status: "loading", materializations: [], error: "" });
    listSilverDatasetMaterializations(silverDataset.id)
      .then((materializations) => {
        setManagedSilverMaterializationState({ status: "idle", materializations, error: "" });
      })
      .catch((error) => {
        setManagedSilverMaterializationState({ status: "error", materializations: [], error: error.message });
      });
  }

  function closeSilverDatasetDetail() {
    setManagedSilverDataset(null);
    setManagedSilverMode("detail");
    setManagedSilverState({ status: "idle", error: "" });
    setManagedSilverMaterializationState({ status: "idle", materializations: [], error: "" });
  }

  async function saveManagedSilverDataset() {
    if (!managedSilverDataset) return;
    const standardizeRules = managedSilverForm.standardize_rules.split("\n").map((rule) => rule.trim()).filter(Boolean);
    const validationRules = managedSilverForm.validation_rules.split("\n").map((rule) => rule.trim()).filter(Boolean);
    if (!managedSilverForm.name.trim() || !managedSilverForm.purpose.trim() || standardizeRules.length === 0 || validationRules.length === 0) {
      setManagedSilverState({ status: "error", error: "name, purpose, rules를 확인하세요." });
      return;
    }

    setManagedSilverState({ status: "saving", error: "" });
    try {
      const updated = await updateSilverDataset(managedSilverDataset.id, {
        name: managedSilverForm.name.trim(),
        purpose: managedSilverForm.purpose.trim(),
        standardize_rules: standardizeRules,
        validation_rules: validationRules,
      });
      setSavedSilverDatasets((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      setManagedSilverDataset(updated);
      setManagedSilverMode("detail");
      setManagedSilverState({ status: "saved", error: "" });
      setNotice(`${updated.name} silver dataset metadata를 수정했습니다.`);
    } catch (error) {
      setManagedSilverState({ status: "error", error: error.message });
      setNotice(`Silver Dataset 수정 실패: ${error.message}`);
    }
  }

  async function removeManagedSilverDataset() {
    if (!managedSilverDataset) return;
    setManagedSilverState({ status: "deleting", error: "" });
    try {
      await deleteSilverDataset(managedSilverDataset.id);
      setSavedSilverDatasets((records) => records.filter((record) => record.id !== managedSilverDataset.id));
      setNotice(`${managedSilverDataset.name} silver dataset metadata를 삭제했습니다.`);
      closeSilverDatasetDetail();
    } catch (error) {
      setManagedSilverState({ status: "error", error: error.message });
      setNotice(`Silver Dataset 삭제 실패: ${error.message}`);
    }
  }

  async function runManagedSilverMaterialization() {
    if (!managedSilverDataset) return;
    setManagedSilverMaterializationState((current) => ({ ...current, status: "running", error: "" }));
    try {
      const materialization = await createSilverDatasetMaterialization(managedSilverDataset.id, {
        sample_size: 10000,
        prefer_latest_source_snapshot: true,
      });
      const refreshed = await updateSilverDataset(managedSilverDataset.id, { status: "materialized" });
      setSavedSilverDatasets((records) => records.map((record) => (record.id === refreshed.id ? refreshed : record)));
      setManagedSilverDataset(refreshed);
      setManagedSilverMaterializationState((current) => ({
        status: "idle",
        materializations: [materialization, ...current.materializations.filter((record) => record.id !== materialization.id)],
        error: "",
      }));
      setNotice(`${managedSilverDataset.name} Silver output을 생성했습니다.`);
    } catch (error) {
      setManagedSilverMaterializationState((current) => ({ ...current, status: "error", error: error.message }));
      setNotice(`Silver output 생성 실패: ${error.message}`);
    }
  }

  function openTargetDraftDetail(targetDraft, mode = "detail") {
    setManagedTargetDraft(targetDraft);
    setManagedTargetForm({
      target_dataset_name: targetDraft.target_dataset_name,
      description: targetDraft.description,
      target_grain: targetDraft.target_grain,
      processing_recipes: (targetDraft.processing_recipes || []).join("\n"),
      executor_handoff: targetDraft.executor_handoff,
    });
    setManagedTargetMode(mode);
    setManagedTargetState({ status: "idle", error: "" });
  }

  function closeTargetDraftDetail() {
    setManagedTargetDraft(null);
    setManagedTargetMode("detail");
    setManagedTargetState({ status: "idle", error: "" });
  }

  async function saveManagedTargetDraft() {
    if (!managedTargetDraft) return;
    const processingRecipes = managedTargetForm.processing_recipes.split("\n").map((recipe) => recipe.trim()).filter(Boolean);
    if (!managedTargetForm.target_dataset_name.trim() || !managedTargetForm.description.trim() || processingRecipes.length === 0) {
      setManagedTargetState({ status: "error", error: "target name, description, processing recipe를 확인하세요." });
      return;
    }

    setManagedTargetState({ status: "saving", error: "" });
    try {
      const updated = await updateTargetDatasetDraft(managedTargetDraft.id, {
        target_dataset_name: managedTargetForm.target_dataset_name.trim(),
        description: managedTargetForm.description.trim(),
        target_grain: managedTargetForm.target_grain.trim(),
        processing_recipes: processingRecipes,
        gold_output: managedTargetForm.target_dataset_name.trim(),
        executor_handoff: managedTargetForm.executor_handoff,
      });
      setSavedTargetDatasetDrafts((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      setManagedTargetDraft(updated);
      setManagedTargetMode("detail");
      setManagedTargetState({ status: "saved", error: "" });
      setNotice(`${updated.target_dataset_name} Gold Dataset 설정을 수정했습니다.`);
    } catch (error) {
      setManagedTargetState({ status: "error", error: error.message });
      setNotice(`Gold Dataset 수정 실패: ${error.message}`);
    }
  }

  async function removeManagedTargetDraft() {
    if (!managedTargetDraft) return;
    setManagedTargetState({ status: "deleting", error: "" });
    try {
      await deleteTargetDatasetDraft(managedTargetDraft.id);
      setSavedTargetDatasetDrafts((records) => records.filter((record) => record.id !== managedTargetDraft.id));
      setNotice(`${managedTargetDraft.target_dataset_name} Gold Dataset 설정을 삭제했습니다.`);
      closeTargetDraftDetail();
    } catch (error) {
      setManagedTargetState({ status: "error", error: error.message });
      setNotice(`Gold Dataset 삭제 실패: ${error.message}`);
    }
  }

  async function saveManagedSourceDataset() {
    if (!managedSourceDataset) return;
    if (!managedSourceForm.name.trim() || !managedSourceForm.raw_scope.trim() || !managedSourceForm.resource_label.trim()) {
      setManagedSourceState({ status: "error", error: "name, raw scope, resource label을 확인하세요." });
      return;
    }

    setManagedSourceState({ status: "saving", error: "" });
    try {
      const updated = await updateSourceDataset(managedSourceDataset.id, {
        name: managedSourceForm.name.trim(),
        raw_scope: managedSourceForm.raw_scope.trim(),
        resource_label: managedSourceForm.resource_label.trim(),
      });
      setSavedSourceDatasets((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      setManagedSourceDataset(updated);
      setManagedSourceForm({
        name: updated.name,
        raw_scope: updated.raw_scope,
        resource_label: updated.resource_label,
      });
      setManagedSourceMode("detail");
      setManagedSourceState({ status: "saved", error: "" });
      setNotice(`${updated.name} source dataset metadata를 수정했습니다.`);
    } catch (error) {
      setManagedSourceState({ status: "error", error: error.message });
      setNotice(`Source Dataset 수정 실패: ${error.message}`);
    }
  }

  async function removeManagedSourceDataset() {
    if (!managedSourceDataset) return;
    setManagedSourceState({ status: "deleting", error: "" });
    try {
      await deleteSourceDataset(managedSourceDataset.id);
      setSavedSourceDatasets((records) => records.filter((record) => record.id !== managedSourceDataset.id));
      setNotice(`${managedSourceDataset.name} source dataset metadata를 삭제했습니다.`);
      closeSourceDatasetDetail();
    } catch (error) {
      setManagedSourceState({ status: "error", error: error.message });
      setNotice(`Source Dataset 삭제 실패: ${error.message}`);
    }
  }

  async function runManagedSourceSnapshot() {
    if (!managedSourceDataset) return;
    setManagedSourceSnapshotState((current) => ({ ...current, status: "running", error: "" }));
    try {
      const snapshot = await createSourceDatasetSnapshot(managedSourceDataset.id, { sample_size: 100 });
      const refreshedDataset = await updateSourceDataset(managedSourceDataset.id, { status: "snapshot_ready" });
      setManagedSourceDataset(refreshedDataset);
      setSavedSourceDatasets((records) => records.map((record) => (record.id === refreshedDataset.id ? refreshedDataset : record)));
      setManagedSourceSnapshotState((current) => ({
        status: "idle",
        snapshots: [snapshot, ...current.snapshots.filter((record) => record.id !== snapshot.id)],
        error: "",
      }));
      setNotice(`${managedSourceDataset.name} raw snapshot을 생성했습니다.`);
    } catch (error) {
      setManagedSourceSnapshotState((current) => ({ ...current, status: "error", error: error.message }));
      setNotice(`Raw snapshot 생성 실패: ${error.message}`);
    }
  }

  function toggleField(column) {
    setSelectedFields((currentFields) =>
      currentFields.includes(column)
        ? currentFields.filter((field) => field !== column)
        : [...currentFields, column],
    );
  }

  function selectAllFields() {
    if (selectedSource) {
      setSelectedFields(selectedSource.columns);
    }
  }

  function clearFields() {
    setSelectedFields([]);
  }

  function toggleTargetSilver(silverDataset) {
    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
    setTargetSilverIds((currentIds) => {
      if (currentIds.includes(silverDataset.id)) {
        const nextIds = currentIds.filter((silverId) => silverId !== silverDataset.id);
        if (baseTargetSilverId === silverDataset.id) {
          setBaseTargetSilverId(nextIds[0] || "");
        }
        return nextIds;
      }

      if (!baseTargetSilverId) {
        setBaseTargetSilverId(silverDataset.id);
      }
      return [...currentIds, silverDataset.id];
    });
  }

  function selectBaseTargetSilver(silverId) {
    if (!targetSilverIds.includes(silverId)) return;
    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
    setBaseTargetSilverId(silverId);
  }

  function toggleProcessingRecipe(recipeId) {
    setTargetDraftSaveState({ status: "idle", record: null, error: "" });
    setSelectedRecipeIds((currentRecipeIds) =>
      currentRecipeIds.includes(recipeId)
        ? currentRecipeIds.filter((selectedRecipeId) => selectedRecipeId !== recipeId)
        : [...currentRecipeIds, recipeId],
    );
  }

  async function saveTargetDatasetDraft() {
    if (!normalizedTargetName || selectedTargetSilvers.length < 2 || selectedProcessRecipes.length === 0 || !baseTargetSilver) {
      setNotice("target name, base silver dataset, processing recipe를 먼저 확인하세요.");
      return;
    }

    setTargetDraftSaveState({ status: "saving", record: null, error: "" });
    try {
      const record = await createTargetDatasetDraft({
        target_dataset_name: normalizedTargetName,
        description: normalizedTargetDescription || "Gold Dataset 설정",
        base_source_ref: targetSilverRefPayload(baseTargetSilver, "base"),
        target_grain: "product_id",
        source_refs: selectedTargetSilvers.map((silverDataset) =>
          targetSilverRefPayload(silverDataset, silverDataset.id === baseTargetSilver.id ? "base" : "enrichment"),
        ),
        silver_outputs: selectedSilverOutputs,
        processing_recipes: selectedProcessRecipes.map((recipe) => recipe.id),
        gold_output: normalizedTargetName,
        executor_handoff: targetExecutorMode,
        schedule: {
          mode: targetScheduleMode,
          note: targetScheduleNote.trim(),
        },
        schema_preview: selectedOutputSchema.map((field) => ({
          name: field.name,
          type: field.type,
        })),
      });
      setTargetDraftSaveState({ status: "saved", record, error: "" });
      setSavedTargetDatasetDrafts((records) => [record, ...records.filter((targetRecord) => targetRecord.id !== record.id)]);
      setNotice(`${record.target_dataset_name} Gold Dataset 설정을 저장했습니다.`);
      setDatasetCreationMode(null);
    } catch (error) {
      setTargetDraftSaveState({ status: "error", record: null, error: error.message });
      setNotice(`Gold Dataset 저장 실패: ${error.message}`);
    }
  }

  function requestManualJobRun(job) {
    if (job.type === "gold") {
      createGoldBuildRun(job.id);
      return;
    }

    const runnerLabel = job.type === "connection" ? "Connection Sync runner" : "Silver Transform runner";
    setNotice(`${job.name} 수동 실행 요청을 확인했습니다. ${runnerLabel} 실제 실행 연결은 후속 Phase에서 붙입니다.`);
  }

  async function createGoldBuildRun(targetDraftId) {
    setJobRunCreateState({ status: "creating", draftId: targetDraftId, error: "" });
    try {
      const run = await createTargetDatasetJobRun({
        target_dataset_draft_id: targetDraftId,
        job_type: "gold_build",
        triggered_by: "demo_user",
      });
      setSavedTargetJobRuns((records) => [run, ...records.filter((record) => record.id !== run.id)]);
      setJobRunCreateState({ status: "created", draftId: targetDraftId, error: "" });
      setNotice(`${run.gold_output} Gold Build 수동 실행을 queued 상태로 만들었습니다.`);
    } catch (error) {
      setJobRunCreateState({ status: "error", draftId: targetDraftId, error: error.message });
      setNotice(`수동 실행 요청 실패: ${error.message}`);
    }
  }

  function openScheduleEditor(job) {
    setScheduleEditorJob(job);
    setScheduleEditorForm({
      mode: job.schedule === "manual" ? "manual" : "placeholder",
      note: job.scheduleNote || "",
    });
    setScheduleEditorState({ status: "idle", error: "" });
  }

  function closeScheduleEditor() {
    setScheduleEditorJob(null);
    setScheduleEditorForm({ mode: "manual", note: "" });
    setScheduleEditorState({ status: "idle", error: "" });
  }

  async function saveJobSchedule() {
    if (!scheduleEditorJob) return;

    const schedule = {
      mode: scheduleEditorForm.mode,
      note: scheduleEditorForm.note.trim(),
    };
    setScheduleEditorState({ status: "saving", error: "" });

    try {
      if (scheduleEditorJob.type === "connection") {
        const updated = await updateExternalConnection(scheduleEditorJob.connectionId, {
          sync_mode: schedule.mode === "manual" ? "manual" : "scheduled",
          sync_schedule: schedule.note || "manual on demand",
        });
        setSavedExternalConnections((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      } else if (scheduleEditorJob.type === "silver") {
        const updated = await updateSilverDatasetSchedule(scheduleEditorJob.datasetId, schedule);
        setSavedSilverDatasets((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      } else {
        const updated = await updateTargetDatasetDraftSchedule(scheduleEditorJob.datasetId, schedule);
        setSavedTargetDatasetDrafts((records) => records.map((record) => (record.id === updated.id ? updated : record)));
      }
      setNotice(`${scheduleEditorJob.name} schedule metadata를 수정했습니다.`);
      closeScheduleEditor();
    } catch (error) {
      setScheduleEditorState({ status: "error", error: error.message });
      setNotice(`Schedule 수정 실패: ${error.message}`);
    }
  }

  function goNext() {
    if (canGoNext && currentStepIndex < wizardSteps.length - 1) {
      setCurrentStepIndex((index) => index + 1);
    }
  }

  function goBack() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((index) => index - 1);
    }
  }

  function goNextSilver() {
    if (canGoNextSilver && silverWizardStepIndex < silverWizardSteps.length - 1) {
      setSilverWizardStepIndex((index) => index + 1);
    }
  }

  function goBackSilver() {
    if (silverWizardStepIndex > 0) {
      setSilverWizardStepIndex((index) => index - 1);
    }
  }

  function startDatasetCreation(mode) {
    setDatasetCreationMode(mode);
    setIsDatasetTypeModalOpen(false);
    setCurrentStepIndex(0);
    if (mode === "connection") {
      setConnectionWizardStepIndex(0);
    }
    if (mode === "source") {
      setSourceWizardStepIndex(0);
      if (!sourceDraft) {
        setSourceRawScope("");
      }
    }
    if (mode === "silver") {
      setSilverWizardStepIndex(0);
      setSilverDatasetSaveState({ status: "idle", record: null, error: "" });
    }
  }

  function startSourceCreationForGoldInput() {
    setDatasetReturnFlow({ target: "silver" });
    startDatasetCreation("source");
  }

  function startSilverCreationForGoldInput() {
    setDatasetReturnFlow({ target: "gold" });
    startDatasetCreation("silver");
  }

  function selectConnectionType(connectionType) {
    if (connectionType.disabled) {
      setNotice(`${connectionType.label} connector는 후속 Phase에서 실제화합니다.`);
      return;
    }
    setSelectedConnectionType(connectionType);
    setConnectionName(`conn_${connectionType.id}_demo`);
    setConnectionResource(connectionType.placeholder);
    setConnectionSecretRefs(defaultConnectionSecretRefs(connectionType));
    setConnectionDiscoveryScope(defaultDiscoveryScopeForConnectionType(connectionType));
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
    setNotice(`${connectionType.label} external connection type을 선택했습니다.`);
  }

  function setConnectionResourceValue(value) {
    setConnectionResource(value);
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
  }

  function setConnectionSecretRefValue(key, value) {
    setConnectionSecretRefs((refs) => ({ ...refs, [key]: value }));
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
  }

  function setConnectionDiscoveryScopeValue(value) {
    setConnectionDiscoveryScope(value);
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
  }

  function selectConnectionPreset(presetId) {
    const preset = externalConnectionPresets.find((candidate) => candidate.id === presetId);
    const connectionType = externalConnectionTypes.find((type) => type.id === preset?.connectionTypeId);
    if (!connectionType || connectionType.disabled) return;
    setSelectedConnectionType(connectionType);
    setConnectionName(preset.name);
    setConnectionResource(preset.resource);
    setConnectionSecretRefs(defaultConnectionSecretRefs(connectionType));
    setConnectionDiscoveryScope(defaultDiscoveryScopeForConnectionType(connectionType));
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "idle", checkId: "", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
    setNotice(`${preset.label} source location을 선택했습니다.`);
  }

  async function inspectConnectionSource() {
    if (!connectionName.trim() || !connectionResource.trim()) {
      setNotice("connection name과 source location을 먼저 입력하세요.");
      return;
    }
    setConnectionInspected(false);
    setConnectionInspectState({ status: "inspecting", result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
    try {
      const result = await inspectExternalConnection({
        connector_type: selectedConnectionType.id,
        resource: connectionResource.trim(),
        resource_label: selectedConnectionType.resourceLabel,
      });
      setConnectionInspected(true);
      setConnectionInspectState({ status: "discovered", result, error: "" });
      setNotice(`${selectedConnectionType.label} source schema를 확인했습니다.`);
    } catch (error) {
      setConnectionInspectState({ status: "error", result: null, error: error.message });
      setNotice(`소스 검사 실패: ${error.message}`);
    }
  }

  async function testConnectionRuntimeFromWizard() {
    if (!connectionName.trim() || !connectionResource.trim()) {
      setNotice("connection name과 연결 리소스를 먼저 입력하세요.");
      return;
    }
    if (!connectionDiscoveryScope.trim()) {
      setNotice("schema discovery scope를 먼저 입력하세요.");
      return;
    }
    const secretRefs = Object.fromEntries(
      Object.entries(connectionSecretRefs)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => Boolean(value)),
    );
    setConnectionInspected(false);
    setConnectionInspectState({ status: "idle", result: null, error: "" });
    setConnectionRuntimeCheckState({ status: "checking", checkId: selectedConnectionType.id, result: null, error: "" });
    setConnectionSaveState({ status: "idle", record: null, error: "" });
    try {
      const runtimeResult = await testExternalConnection({
        connector_type: selectedConnectionType.runtimeConnectorType || selectedConnectionType.id,
        resource: connectionResource.trim(),
        resource_label: selectedConnectionType.resourceLabel,
        secret_refs: secretRefs,
      });
      setConnectionRuntimeCheckState({ status: "passed", checkId: selectedConnectionType.id, result: runtimeResult, error: "" });
      setConnectionInspectState({ status: "inspecting", result: null, error: "" });
      let discoveryResult;
      try {
        discoveryResult = await inspectExternalConnection({
          connector_type: selectedConnectionType.id,
          resource: connectionResource.trim(),
          resource_label: selectedConnectionType.resourceLabel,
          secret_refs: secretRefs,
          options: { scope: connectionDiscoveryScope.trim() },
        });
      } catch (error) {
        setConnectionInspectState({ status: "error", result: null, error: error.message });
        setNotice(`${selectedConnectionType.label} schema discovery 실패: ${error.message}`);
        return;
      }
      setConnectionInspected(true);
      setConnectionInspectState({ status: "discovered", result: discoveryResult, error: "" });
      setNotice(`${selectedConnectionType.label} 연결 테스트와 schema discovery가 통과했습니다.`);
    } catch (error) {
      setConnectionRuntimeCheckState({ status: "failed", checkId: selectedConnectionType.id, result: null, error: error.message });
      setConnectionInspectState({ status: "idle", result: null, error: "" });
      setNotice(`${selectedConnectionType.label} 실제 연결 테스트 실패: ${error.message}`);
    }
  }

  async function saveExternalConnectionDraft() {
    if (!connectionName.trim() || !connectionResource.trim() || !isConnectionReadyForReview) {
      setNotice(isRuntimeConnection ? "실제 연결 테스트까지 완료한 뒤 connection을 저장하세요." : "소스 검사까지 완료한 뒤 connection을 저장하세요.");
      return;
    }

    const discoveredConnection = connectionInspectState.result;
    const runtimeResult = connectionRuntimeCheckState.result;
    setConnectionSaveState({ status: "saving", record: null, error: "" });
    try {
      const record = await createExternalConnection({
        name: connectionName.trim(),
        connector_type: selectedConnectionType.id,
        resource: connectionResource.trim(),
        resource_label: selectedConnectionType.resourceLabel,
        auth_mode: selectedConnectionType.authMode,
        mode_label: selectedConnectionType.modeLabel,
        contract_hint: selectedConnectionType.contractHint,
        detected_format: discoveredConnection?.detected_format || selectedConnectionType.detectedFormat,
        detected_dataset: discoveredConnection?.detected_dataset || runtimeResult?.connector_type || selectedConnectionType.detectedDataset,
        confidence: discoveredConnection?.confidence || selectedConnectionType.confidence,
        recommended_role: discoveredConnection?.recommended_role || selectedConnectionType.recommendedRole,
        sync_mode: selectedConnectionType.syncMode,
        sync_schedule: selectedConnectionType.syncSchedule,
        schema_preview: discoveredConnection?.schema_preview || connectionSchemaPreview(selectedConnectionType),
      });
      const mappedConnection = mapExternalConnectionRecord(record);
      setSavedExternalConnections((connections) => [mappedConnection, ...connections.filter((connection) => connection.id !== mappedConnection.id)]);
      setConnectionSaveState({ status: "saved", record, error: "" });
      setNotice(`${record.name} external connection을 저장했습니다.`);
      setDatasetCreationMode(null);
    } catch (error) {
      setConnectionSaveState({ status: "error", record: null, error: error.message });
      setNotice(`External Connection 저장 실패: ${error.message}`);
    }
  }

  function goNextConnection() {
    if (canGoNextConnection && connectionWizardStepIndex < connectionWizardSteps.length - 1) {
      setConnectionWizardStepIndex((index) => index + 1);
    }
  }

  function goBackConnection() {
    if (connectionWizardStepIndex > 0) {
      setConnectionWizardStepIndex((index) => index - 1);
    }
  }

  function openSourcePicker(purpose) {
    setSourceModalPurpose(purpose);
    setIsSourceModalOpen(true);
  }

  function goNextSource() {
    if (canGoNextSource && sourceWizardStepIndex < sourceWizardSteps.length - 1) {
      setSourceWizardStepIndex((index) => index + 1);
    }
  }

  function goBackSource() {
    if (sourceWizardStepIndex > 0) {
      setSourceWizardStepIndex((index) => index - 1);
    }
  }

  return (
    <SourcesPageView
      {...{
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
      }}
    />
  );
}
