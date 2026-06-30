import { useState } from "react";

import {
  defaultConnectionSecretRefs,
  defaultDiscoveryScopeForConnectionType,
  externalConnectionTypes,
  targetProcessingRecipes,
} from "./datasetConfig";

export function useSourcesPageState() {
  const [isDatasetTypeModalOpen, setIsDatasetTypeModalOpen] = useState(false);
  const [datasetCreationMode, setDatasetCreationMode] = useState(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceModalPurpose, setSourceModalPurpose] = useState("target");
  const [connectionWizardStepIndex, setConnectionWizardStepIndex] = useState(0);
  const [selectedConnectionType, setSelectedConnectionType] = useState(externalConnectionTypes[0]);
  const [connectionName, setConnectionName] = useState("conn_product_health_reviews_file");
  const [connectionResource, setConnectionResource] = useState(externalConnectionTypes[0].placeholder);
  const [connectionSecretRefs, setConnectionSecretRefs] = useState(defaultConnectionSecretRefs(externalConnectionTypes[0]));
  const [connectionDiscoveryScope, setConnectionDiscoveryScope] = useState(defaultDiscoveryScopeForConnectionType(externalConnectionTypes[0]));
  const [connectionInspected, setConnectionInspected] = useState(false);
  const [connectionInspectState, setConnectionInspectState] = useState({ status: "idle", result: null, error: "" });
  const [connectionRuntimeCheckState, setConnectionRuntimeCheckState] = useState({ status: "idle", checkId: "", result: null, error: "" });
  const [connectionSaveState, setConnectionSaveState] = useState({ status: "idle", record: null, error: "" });
  const [productHealthPresetState, setProductHealthPresetState] = useState({ status: "idle", result: null, error: "" });
  const [jobRunCreateState, setJobRunCreateState] = useState({ status: "idle", draftId: "", error: "" });
  const [sourceWizardStepIndex, setSourceWizardStepIndex] = useState(0);
  const [sourceDraft, setSourceDraft] = useState(null);
  const [sourceDiscoveryState, setSourceDiscoveryState] = useState({ status: "idle", result: null, error: "" });
  const [sourceDatasetName, setSourceDatasetName] = useState("source_product_health_reviews");
  const [sourceRawScope, setSourceRawScope] = useState("");
  const [sourceDatasetSaveState, setSourceDatasetSaveState] = useState({ status: "idle", record: null, error: "" });
  const [managedSourceDataset, setManagedSourceDataset] = useState(null);
  const [managedSourceForm, setManagedSourceForm] = useState({ name: "", raw_scope: "", resource_label: "" });
  const [managedSourceMode, setManagedSourceMode] = useState("detail");
  const [managedSourceState, setManagedSourceState] = useState({ status: "idle", error: "" });
  const [managedSourceSnapshotState, setManagedSourceSnapshotState] = useState({ status: "idle", snapshots: [], error: "" });
  const [managedConnection, setManagedConnection] = useState(null);
  const [managedConnectionForm, setManagedConnectionForm] = useState({
    name: "",
    resource: "",
    resource_label: "",
    sync_mode: "manual",
    sync_schedule: "manual on demand",
  });
  const [managedConnectionMode, setManagedConnectionMode] = useState("detail");
  const [managedConnectionState, setManagedConnectionState] = useState({ status: "idle", error: "" });
  const [managedSilverDataset, setManagedSilverDataset] = useState(null);
  const [managedSilverForm, setManagedSilverForm] = useState({
    name: "",
    purpose: "",
    standardize_rules: "",
    validation_rules: "",
  });
  const [managedSilverMode, setManagedSilverMode] = useState("detail");
  const [managedSilverState, setManagedSilverState] = useState({ status: "idle", error: "" });
  const [managedSilverMaterializationState, setManagedSilverMaterializationState] = useState({ status: "idle", materializations: [], error: "" });
  const [managedTargetDraft, setManagedTargetDraft] = useState(null);
  const [managedTargetForm, setManagedTargetForm] = useState({
    target_dataset_name: "",
    description: "",
    target_grain: "",
    processing_recipes: "",
    executor_handoff: "local_runner",
  });
  const [managedTargetMode, setManagedTargetMode] = useState("detail");
  const [managedTargetState, setManagedTargetState] = useState({ status: "idle", error: "" });
  const [silverWizardStepIndex, setSilverWizardStepIndex] = useState(0);
  const [selectedSilverSourceId, setSelectedSilverSourceId] = useState("");
  const [silverDatasetName, setSilverDatasetName] = useState("silver_product_health_reviews");
  const [silverPurpose, setSilverPurpose] = useState("Source Dataset을 표준화/검증한 Silver Dataset metadata");
  const [selectedSilverStandardizeRules, setSelectedSilverStandardizeRules] = useState(["normalize_ids", "cast_types"]);
  const [selectedSilverValidationRules, setSelectedSilverValidationRules] = useState(["required_keys", "schema_drift"]);
  const [silverDatasetSaveState, setSilverDatasetSaveState] = useState({ status: "idle", record: null, error: "" });
  const [datasetReturnFlow, setDatasetReturnFlow] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [targetSilverIds, setTargetSilverIds] = useState([]);
  const [baseTargetSilverId, setBaseTargetSilverId] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(targetProcessingRecipes.map((recipe) => recipe.id));
  const [targetName, setTargetName] = useState("dataset_product_health_gold");
  const [targetDescription, setTargetDescription] = useState("제품 상태 분석용 Gold Dataset");
  const [targetScheduleMode, setTargetScheduleMode] = useState("manual");
  const [targetScheduleNote, setTargetScheduleNote] = useState("데모에서는 수동 실행으로만 준비합니다.");
  const [targetExecutorMode, setTargetExecutorMode] = useState("local_runner");
  const [targetDraftSaveState, setTargetDraftSaveState] = useState({ status: "idle", record: null, error: "" });
  const [scheduleEditorJob, setScheduleEditorJob] = useState(null);
  const [scheduleEditorForm, setScheduleEditorForm] = useState({ mode: "manual", note: "" });
  const [scheduleEditorState, setScheduleEditorState] = useState({ status: "idle", error: "" });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  return {
    isDatasetTypeModalOpen,
    setIsDatasetTypeModalOpen,
    datasetCreationMode,
    setDatasetCreationMode,
    isSourceModalOpen,
    setIsSourceModalOpen,
    sourceModalPurpose,
    setSourceModalPurpose,
    connectionWizardStepIndex,
    setConnectionWizardStepIndex,
    selectedConnectionType,
    setSelectedConnectionType,
    connectionName,
    setConnectionName,
    connectionResource,
    setConnectionResource,
    connectionSecretRefs,
    setConnectionSecretRefs,
    connectionDiscoveryScope,
    setConnectionDiscoveryScope,
    connectionInspected,
    setConnectionInspected,
    connectionInspectState,
    setConnectionInspectState,
    connectionRuntimeCheckState,
    setConnectionRuntimeCheckState,
    connectionSaveState,
    setConnectionSaveState,
    productHealthPresetState,
    setProductHealthPresetState,
    jobRunCreateState,
    setJobRunCreateState,
    sourceWizardStepIndex,
    setSourceWizardStepIndex,
    sourceDraft,
    setSourceDraft,
    sourceDiscoveryState,
    setSourceDiscoveryState,
    sourceDatasetName,
    setSourceDatasetName,
    sourceRawScope,
    setSourceRawScope,
    sourceDatasetSaveState,
    setSourceDatasetSaveState,
    managedSourceDataset,
    setManagedSourceDataset,
    managedSourceForm,
    setManagedSourceForm,
    managedSourceMode,
    setManagedSourceMode,
    managedSourceState,
    setManagedSourceState,
    managedSourceSnapshotState,
    setManagedSourceSnapshotState,
    managedConnection,
    setManagedConnection,
    managedConnectionForm,
    setManagedConnectionForm,
    managedConnectionMode,
    setManagedConnectionMode,
    managedConnectionState,
    setManagedConnectionState,
    managedSilverDataset,
    setManagedSilverDataset,
    managedSilverForm,
    setManagedSilverForm,
    managedSilverMode,
    setManagedSilverMode,
    managedSilverState,
    setManagedSilverState,
    managedSilverMaterializationState,
    setManagedSilverMaterializationState,
    managedTargetDraft,
    setManagedTargetDraft,
    managedTargetForm,
    setManagedTargetForm,
    managedTargetMode,
    setManagedTargetMode,
    managedTargetState,
    setManagedTargetState,
    silverWizardStepIndex,
    setSilverWizardStepIndex,
    selectedSilverSourceId,
    setSelectedSilverSourceId,
    silverDatasetName,
    setSilverDatasetName,
    silverPurpose,
    setSilverPurpose,
    selectedSilverStandardizeRules,
    setSelectedSilverStandardizeRules,
    selectedSilverValidationRules,
    setSelectedSilverValidationRules,
    silverDatasetSaveState,
    setSilverDatasetSaveState,
    datasetReturnFlow,
    setDatasetReturnFlow,
    selectedSource,
    setSelectedSource,
    selectedFields,
    setSelectedFields,
    targetSilverIds,
    setTargetSilverIds,
    baseTargetSilverId,
    setBaseTargetSilverId,
    selectedRecipeIds,
    setSelectedRecipeIds,
    targetName,
    setTargetName,
    targetDescription,
    setTargetDescription,
    targetScheduleMode,
    setTargetScheduleMode,
    targetScheduleNote,
    setTargetScheduleNote,
    targetExecutorMode,
    setTargetExecutorMode,
    targetDraftSaveState,
    setTargetDraftSaveState,
    scheduleEditorJob,
    setScheduleEditorJob,
    scheduleEditorForm,
    setScheduleEditorForm,
    scheduleEditorState,
    setScheduleEditorState,
    currentStepIndex,
    setCurrentStepIndex,
  };
}
