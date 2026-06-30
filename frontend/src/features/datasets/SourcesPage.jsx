import { useEffect } from "react";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Boxes,
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
import { DataTable, EmptyState, InfoCard, PageHeader } from "../../design-system";
import { formatBytes, formatMetric } from "../../app/formatters";
import { useDatasetDraftData } from "./useDatasetDraftData";
import { useSourcesPageState } from "./useSourcesPageState";
import { buildSourcesPageModel } from "./sourcesPageModel";
import {
  ConnectionManageModal,
  CredentialSecretPolicyPanel,
  DatasetTypeChoiceModal,
  DraftColumn,
  JobScheduleEditorModal,
  OperationalList,
  ProductHealthPresetPanel,
  SilverDatasetManageModal,
  SourceDatasetManageModal,
  SourceStartModal,
  TargetDraftManageModal,
  fileEvidenceLabel,
  safeRuntimeSummary,
} from "./DatasetComponents";

import {
  connectionSchemaPreview,
  defaultConnectionSecretRefs,
  defaultDiscoveryScopeForConnectionType,
  defaultSourceScopeForConnection,
  demoSourceDatasets,
  externalConnectionPresets,
  externalConnectionTypes,
  formatConnectionResourceLabel,
  isLocalDiscoveryConnection,
  isRuntimeConnectionType,
  mapExternalConnectionRecord,
  mapProductHealthInventoryItemToConnection,
  productHealthBindingLabel,
  productHealthStatusLabel,
  runtimeConnectionCheckLabel,
  runtimeConnectionPassed,
  secretRefsForConnection,
  silverOutputPayload,
  silverOutputForSource,
  silverStandardizeRuleOptions,
  silverValidationRuleOptions,
  sourceDatasetNameForConnection,
  sourceDiscoveryStatus,
  sourceSortOptions,
  sourceTypeOptions,
  targetExecutorOptions,
  targetGoldSchemaPreview,
  targetProcessingRecipes,
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
                  <small>데모 기본값. Gold Dataset 갱신 job을 수동 실행 대상으로 표시합니다.</small>
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
                  <small>cron UI 자리만 확인합니다. job schedule 저장은 하지 않습니다.</small>
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

  function renderSavedDraftOverview() {
    const connectionCount = savedExternalConnections.length;
    const sourceCount = savedSourceDatasets.length;
    const targetCount = savedTargetDatasetDrafts.length;

    return (
      <section className="pipeline-table-card dataset-draft-overview" aria-label="Saved dataset draft overview">
        <div className="table-card-header">
          <div className="table-title-line">
            <ListChecks size={20} />
            <div>
              <strong>저장된 설정 현황</strong>
              <p>External Connection, Source Dataset, Gold Dataset 설정을 한 화면에서 확인합니다.</p>
            </div>
          </div>
          <div className="table-card-actions">
            <span className={`badge ${datasetDraftListState.error ? "danger" : "slate"}`}>
              {datasetDraftListState.loading ? "조회 중" : datasetDraftListState.error ? "조회 실패" : `${connectionCount + sourceCount + targetCount} drafts`}
            </span>
            <button type="button" className="ghost-action" onClick={refreshDatasetDraftLists}>
              <RefreshCw size={16} />
              새로고침
            </button>
          </div>
        </div>
        {datasetDraftListState.error ? (
          <div className="wizard-placeholder compact">
            <AlertCircle size={22} />
            <strong>{datasetDraftListState.error}</strong>
          </div>
        ) : (
          <div className="dataset-draft-board">
            <DraftColumn
              title="External Connection"
              count={connectionCount}
              empty="저장된 external connection이 없습니다."
              records={savedExternalConnections.slice(0, 3).map((connection) => ({
                id: connection.id,
                title: connection.name,
                meta: `${connection.typeLabel} · ${connection.status}`,
                detail: connection.resource,
              }))}
            />
            <DraftColumn
              title="Source Dataset"
              count={sourceCount}
              empty="저장된 source dataset이 없습니다."
              records={savedSourceDatasets.slice(0, 3).map((sourceDataset) => ({
                id: sourceDataset.id,
                title: sourceDataset.name,
                meta: `${sourceDataset.connection_type} · ${sourceDataset.status}`,
                detail: sourceDataset.raw_scope,
              }))}
            />
            <DraftColumn
              title="Gold Dataset"
              count={targetCount}
              empty="저장된 Gold Dataset 설정이 없습니다."
              records={savedTargetDatasetDrafts.slice(0, 3).map((targetDraft) => ({
                id: targetDraft.id,
                title: targetDraft.target_dataset_name,
                meta: `${targetDraft.executor_handoff} · ${targetDraft.status}`,
                detail: `${targetDraft.source_refs?.length || 0} inputs · ${targetDraft.silver_outputs?.length || 0} silver datasets`,
              }))}
            />
          </div>
        )}
      </section>
    );
  }

  function renderNavigationView() {
    if (dataView === "connections") {
      return (
        <>
          <PageHeader
            title="연결"
            body="외부 데이터 위치와 접속 설정을 관리합니다. 데이터셋 생성 전 먼저 등록되는 입력 지점입니다."
            actionLabel="연결 생성"
            onAction={() => startDatasetCreation("connection")}
          />
          <OperationalList
            icon={ServerCog}
            title="External Connections"
            body="Local File, Local Folder, Kafka Topic 같은 외부 연결 설정입니다. 데모 원천은 개별 preset으로 선택합니다."
            records={savedExternalConnections.map((connection) => ({
              id: connection.id,
              title: connection.name,
              meta: `${connection.typeLabel} · ${connection.status} · ${connection.syncMode}`,
              detail: `${connection.resource} · ${connection.syncSchedule}`,
              actions: [
                {
                  label: "상세",
                  icon: Search,
                  onClick: () => openConnectionDetail(connection, "detail"),
                },
                {
                  label: "수정",
                  icon: Wrench,
                  onClick: () => openConnectionDetail(connection, "edit"),
                },
                {
                  label: "삭제",
                  icon: Trash2,
                  danger: true,
                  onClick: () => openConnectionDetail(connection, "delete"),
                },
              ],
            }))}
            empty="저장된 External Connection이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
          <details className="catalog-policy-details">
            <summary>DB/S3 보안 정책 보기</summary>
            <CredentialSecretPolicyPanel policy={credentialPolicy} />
          </details>
        </>
      );
    }

    if (dataView === "datasets-source") {
      return (
        <>
          <PageHeader
            title="Source Datasets"
            body="External Connection에서 만든 Raw/Bronze 성격의 원본/준원본 데이터셋입니다."
            actionLabel="Source Dataset 생성"
            onAction={() => startDatasetCreation("source")}
          />
          <OperationalList
            icon={Database}
            title="Source Dataset"
            body="데이터 레이크 안에서 원천 데이터셋으로 참조될 metadata입니다."
            records={savedSourceDatasets.map((sourceDataset) => ({
              id: sourceDataset.id,
              title: sourceDataset.name,
              meta: `${sourceDataset.connection_type} · ${sourceDataset.status}`,
              detail: `${fileEvidenceLabel(sourceDataset.file_evidence)} · ${sourceDataset.raw_scope}`,
              variant: "source-dataset",
              facts: [
                ["Connection", sourceDataset.connection_name || sourceDataset.connection_type],
                ["Raw scope", sourceDataset.raw_scope],
                ["Schema", `${sourceDataset.schema_preview?.length || 0} fields`],
                ["Evidence", fileEvidenceLabel(sourceDataset.file_evidence)],
              ],
              actions: [
                {
                  label: "상세",
                  icon: Search,
                  onClick: () => openSourceDatasetDetail(sourceDataset, "detail"),
                },
                {
                  label: "수정",
                  icon: Wrench,
                  onClick: () => openSourceDatasetDetail(sourceDataset, "edit"),
                },
                {
                  label: "삭제",
                  icon: Trash2,
                  danger: true,
                  onClick: () => openSourceDatasetDetail(sourceDataset, "delete"),
                },
              ],
            }))}
            empty="저장된 Source Dataset이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "datasets-silver") {
      return (
        <>
          <PageHeader
            title="Silver Datasets"
            body="Source Dataset을 표준화하고 검증한 중간 데이터셋입니다."
            actionLabel="Silver Dataset 생성"
            onAction={() => startDatasetCreation("silver")}
          />
          <OperationalList
            icon={Layers3}
            title="Silver Dataset"
            body="Source Dataset에서 독립 생성된 persisted Silver Dataset metadata입니다."
            records={silverDatasetRecords.map((silverDataset) => ({
              id: silverDataset.id,
              title: silverDataset.name,
              meta: `${silverDataset.status} · from ${silverDataset.source || "source 미지정"}`,
              detail: `${fileEvidenceLabel(silverDataset.fileEvidence)} · ${silverDataset.purpose || "표준화 목적 없음"} · ${silverDataset.rules.length} rules`,
              variant: "silver-dataset",
              facts: [
                ["Source", silverDataset.source || "source 미지정"],
                ["Purpose", silverDataset.purpose || "표준화 목적 없음"],
                ["Rules", `${silverDataset.rules.length} rules`],
                ["Evidence", fileEvidenceLabel(silverDataset.fileEvidence)],
              ],
              actions: [
                {
                  label: "상세",
                  icon: Search,
                  onClick: () => openSilverDatasetDetail(savedSilverDatasets.find((dataset) => dataset.id === silverDataset.id), "detail"),
                },
                {
                  label: "수정",
                  icon: Wrench,
                  onClick: () => openSilverDatasetDetail(savedSilverDatasets.find((dataset) => dataset.id === silverDataset.id), "edit"),
                },
                {
                  label: "삭제",
                  icon: Trash2,
                  danger: true,
                  onClick: () => openSilverDatasetDetail(savedSilverDatasets.find((dataset) => dataset.id === silverDataset.id), "delete"),
                },
              ],
            }))}
            empty="저장된 Silver Dataset이 없습니다. Source Dataset에서 Silver Dataset을 먼저 생성합니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "datasets-gold") {
      return (
        <>
          <PageHeader
            title="Gold Datasets"
            body="여러 Silver Dataset을 조합해 분석 목적에 맞게 만드는 최종 데이터셋입니다."
            actionLabel="Gold Dataset 생성"
            onAction={() => startDatasetCreation("target")}
          />
          <ProductHealthPresetPanel
            state={productHealthPresetState}
            onRun={runProductHealthPreset}
          />
          <OperationalList
            icon={Table2}
            title="Gold Dataset"
            body="Gold Dataset 생성 설정에서 파생되는 최종 output dataset입니다."
            records={goldDatasetRecords.map((goldDataset) => ({
              id: goldDataset.id,
              title: goldDataset.name,
              meta: `${goldDataset.status} · ${goldDataset.sources} sources`,
              detail:
                goldDataset.status === "registered"
                  ? `${goldDataset.silverOutputs} silver outputs · rows ${goldDataset.rows} · bytes ${goldDataset.bytes} · ${goldDataset.path}`
                  : `${fileEvidenceLabel(goldDataset.draft?.file_evidence)} · ${goldDataset.silverOutputs} silver outputs · definition ${goldDataset.target}`,
              variant: "gold-dataset",
              facts:
                goldDataset.status === "registered"
                  ? [
                      ["Silver outputs", `${goldDataset.silverOutputs}`],
                      ["Rows", formatMetric(goldDataset.rows)],
                      ["Bytes", formatBytes(goldDataset.bytes)],
                      ["Path", goldDataset.path || "path 없음"],
                    ]
                  : [
                      ["Definition", goldDataset.target],
                      ["Silver inputs", `${goldDataset.silverOutputs}`],
                      ["Evidence", fileEvidenceLabel(goldDataset.draft?.file_evidence)],
                      ["Status", goldDataset.status],
                    ],
              actions:
                goldDataset.recordType === "registered"
                  ? [
                      {
                        label: "상세",
                        icon: Search,
                        onClick: () => setNotice(`${goldDataset.name} registered CatalogDataset은 이번 Phase에서 상세 보기만 지원합니다.`),
                      },
                    ]
                  : [
                      {
                        label: "상세",
                        icon: Search,
                        onClick: () => openTargetDraftDetail(goldDataset.draft, "detail"),
                      },
                      {
                        label: "수정",
                        icon: Wrench,
                        onClick: () => openTargetDraftDetail(goldDataset.draft, "edit"),
                      },
                      {
                        label: "삭제",
                        icon: Trash2,
                        danger: true,
                        onClick: () => openTargetDraftDetail(goldDataset.draft, "delete"),
                      },
                    ],
            }))}
            empty="저장된 Gold Dataset 정의가 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "jobs-connection") {
      return (
        <>
          <PageHeader
            title="Connection Sync Jobs"
            body="External Connection에서 원천 데이터를 가져오거나 스캔해 Source Dataset/raw 영역을 갱신하는 작업입니다."
          />
          <OperationalList
            icon={ServerCog}
            title="Connection Sync Jobs"
            body="저장된 External Connection에서 파생됩니다. 실제 file scan, Kafka replay, DB/S3 sync runner는 후속 Phase에서 연결합니다."
            records={connectionJobRecords.map((job) => ({
              id: job.id,
              title: job.name,
              meta: `${job.status} · ${job.schedule}`,
              detail: "External Connection sync job",
              facts: [
                ["Input", job.input || "connection resource 미지정"],
                ["Output", job.output],
                ["Schedule", job.scheduleNote || job.schedule],
              ],
              actions: [
                {
                  label: "수동 실행",
                  icon: Play,
                  onClick: () => requestManualJobRun(job),
                },
                {
                  label: "Schedule 수정",
                  icon: Clock3,
                  onClick: () => openScheduleEditor(job),
                },
                {
                  label: "Connection 편집",
                  icon: ServerCog,
                  onClick: () => openConnectionDetail(job.connection, "edit"),
                },
              ],
            }))}
            empty="계획된 Connection Sync Job이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "jobs-silver") {
      return (
        <>
          <PageHeader
            title="Silver Transform Jobs"
            body="Source Dataset을 Silver Dataset으로 표준화/검증하는 생성 작업입니다. 스케줄러 또는 수동 실행 요청으로 실행됩니다."
          />
          <OperationalList
            icon={GitBranch}
            title="Silver Transform Jobs"
            body="Persisted Silver Dataset metadata에서 planned 작업으로 파생됩니다. 현재 Silver runner는 후속 Phase에서 연결합니다."
            records={silverJobRecords.map((job) => ({
              id: job.id,
              title: job.name,
              meta: `${job.status} · ${job.schedule} · output ${job.output}`,
              detail: "Source to Silver transform job",
              facts: [
                ["Input", job.input || "source 미지정"],
                ["Output", job.output],
                ["Rules", job.rules || "rule 없음"],
                ["Schedule", job.scheduleNote || job.schedule],
              ],
              actions: [
                {
                  label: "수동 실행",
                  icon: Play,
                  onClick: () => requestManualJobRun(job),
                },
                {
                  label: "Schedule 수정",
                  icon: Clock3,
                  onClick: () => openScheduleEditor(job),
                },
                {
                  label: "Dataset 편집",
                  icon: Layers3,
                  onClick: () => navigate("/datasets/silver", { pendingDatasetEdit: { type: "silver", id: job.datasetId } }),
                },
              ],
            }))}
            empty="계획된 Silver Transform Job이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    if (dataView === "jobs-gold") {
      return (
        <>
          <PageHeader
            title="Gold Build Jobs"
            body="Silver Dataset을 조합해 Gold Dataset을 만들거나 갱신하는 작업입니다. 스케줄러 또는 수동 실행 요청으로 실행됩니다."
          />
          <OperationalList
            icon={Workflow}
            title="Gold Build Jobs"
            body="Gold Dataset 설정에서 파생됩니다. 수동 실행은 실행 기록에 queued run을 만들고, 실제 local runner 실행은 실행 기록에서 진행합니다."
            records={goldJobRecords.map((job) => ({
              id: job.id,
              title: job.name,
              meta: `${job.status} · ${job.runner} · ${job.schedule}`,
              detail: "Silver to Gold build job",
              facts: [
                ["Input", job.input],
                ["Output", job.output],
                ["Rules", job.rules],
                ["Schedule", job.scheduleNote || job.schedule],
              ],
              actions: [
                {
                  label: jobRunCreateState.status === "creating" && jobRunCreateState.draftId === job.id ? "실행 요청 중" : "수동 실행",
                  icon: Play,
                  disabled: jobRunCreateState.status === "creating",
                  onClick: () => requestManualJobRun(job),
                },
                {
                  label: "Schedule 수정",
                  icon: Clock3,
                  onClick: () => openScheduleEditor(job),
                },
                {
                  label: "Dataset 편집",
                  icon: Table2,
                  onClick: () => navigate("/datasets/gold", { pendingDatasetEdit: { type: "gold", id: job.datasetId } }),
                },
              ],
            }))}
            empty="실행 준비된 Gold Build Job이 없습니다."
            onRefresh={refreshDatasetDraftLists}
            loading={datasetDraftListState.loading}
          />
        </>
      );
    }

    return null;
  }

  return (
    <div className="page-stack">
      {!datasetCreationMode ? renderNavigationView() : null}
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
      {datasetCreationMode === "connection" ? renderExternalConnectionWizard() : null}
      {datasetCreationMode === "source" ? renderSourceDatasetShell() : null}
      {datasetCreationMode === "silver" ? renderSilverDatasetWizard() : null}
      {datasetCreationMode === "target" ? renderTargetDatasetWizard() : null}
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
