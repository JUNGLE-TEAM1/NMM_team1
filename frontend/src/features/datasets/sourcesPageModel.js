import {
  externalConnectionPresets,
  isRuntimeConnectionType,
  runtimeConnectionPassed,
  silverOutputPayload,
  silverStandardizeRuleOptions,
  silverValidationRuleOptions,
  sourceDiscoveryStatus,
  targetGoldSchemaPreview,
  targetProcessingRecipes,
} from "./datasetConfig";

export function buildSourcesPageModel({
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
}) {
const normalizedTargetName = targetName.trim();
const normalizedTargetDescription = targetDescription.trim();
const selectedTargetSilvers = savedSilverDatasets.filter((silverDataset) => targetSilverIds.includes(silverDataset.id));
const baseTargetSilver =
  selectedTargetSilvers.find((silverDataset) => silverDataset.id === baseTargetSilverId) || selectedTargetSilvers[0] || null;
const enrichmentTargetSilvers = selectedTargetSilvers.filter((silverDataset) => silverDataset.id !== baseTargetSilver?.id);
const selectedProcessRecipes = targetProcessingRecipes.filter((recipe) => selectedRecipeIds.includes(recipe.id));
const selectedSilverOutputs = selectedTargetSilvers.map(silverOutputPayload);
const selectedFieldSummary =
  selectedProcessRecipes.length > 0 ? selectedProcessRecipes.slice(0, 3).map((recipe) => recipe.kind).join(", ") : "선택된 처리 방법이 없습니다.";
const selectedOutputSchema = selectedProcessRecipes.length > 0 ? targetGoldSchemaPreview : [];
const targetSourceSummary =
  selectedTargetSilvers.length > 0
    ? `${selectedTargetSilvers.length} silver datasets · base ${baseTargetSilver?.name || "미지정"}`
    : "2개 이상의 Silver Dataset을 선택합니다.";
const wizardSteps = [
  {
    id: "overview",
    title: "Overview",
    summary: normalizedTargetName || "Gold Dataset 이름을 입력합니다.",
    isComplete: Boolean(normalizedTargetName),
  },
  {
    id: "source",
    title: "Silver 선택",
    summary: targetSourceSummary,
    isComplete: currentStepIndex > 1 && selectedTargetSilvers.length >= 2,
  },
  {
    id: "process",
    title: "Process",
    summary: selectedProcessRecipes.length > 0 ? `${selectedProcessRecipes.length} processing recipes` : "target 갱신 처리 방법을 설정합니다.",
    isComplete: currentStepIndex > 3 && selectedProcessRecipes.length > 0,
  },
  {
    id: "handoff",
    title: "Build 실행 준비",
    summary: `${targetExecutorMode} 실행 경계`,
    isComplete: currentStepIndex > 4,
  },
  {
    id: "scheduling",
    title: "Scheduling",
    summary: targetScheduleMode === "manual" ? "Job manual trigger" : "Job schedule placeholder",
    isComplete: currentStepIndex > 5,
  },
  {
    id: "review",
    title: "Review",
    summary: "생성 준비 확인",
    isComplete: false,
  },
];
const sourceWizardSteps = [
  {
    id: "connection",
    title: "Connection 선택",
    isComplete: Boolean(sourceDraft),
  },
  {
    id: "raw-config",
    title: "Raw Dataset 설정",
    isComplete: sourceWizardStepIndex > 1 && Boolean(sourceDatasetName.trim() && sourceRawScope.trim()),
  },
  {
    id: "review",
    title: "Review",
    isComplete: false,
  },
];
const connectionWizardSteps = [
  {
    id: "connector-type",
    title: "Connector Type",
    summary: selectedConnectionType ? selectedConnectionType.label : "connector를 선택합니다.",
    isComplete: Boolean(selectedConnectionType),
  },
  {
    id: "configure",
    title: "Configure & Inspect",
    summary: connectionName.trim() || "connection 이름을 입력합니다.",
    isComplete: connectionWizardStepIndex > 1 && Boolean(connectionName.trim() && connectionResource.trim()),
  },
  {
    id: "review",
    title: "Review",
    summary: "연결 draft 확인",
    isComplete: false,
  },
];
const currentStep = wizardSteps[currentStepIndex];
const currentSourceStep = sourceWizardSteps[sourceWizardStepIndex];
const currentConnectionStep = connectionWizardSteps[connectionWizardStepIndex];
const isRuntimeConnection = isRuntimeConnectionType(selectedConnectionType);
const selectedConnectionPresets = externalConnectionPresets.filter((preset) => preset.connectionTypeId === selectedConnectionType.id);
const isConnectionReadyForReview = isRuntimeConnection
  ? runtimeConnectionPassed(connectionRuntimeCheckState, selectedConnectionType) && Boolean(connectionInspectState.result?.schema_preview?.length)
  : Boolean(connectionInspected && connectionInspectState.result);
const sourceDiscovery = sourceDiscoveryStatus(sourceDraft, sourceDiscoveryState);
const sourceSchemaPreview = sourceDiscoveryState.result?.schema_preview?.length
  ? sourceDiscoveryState.result.schema_preview.map((field) => ({
      name: field.name,
      type: field.type,
      sample: field.sample || "discovered",
    }))
  : sourceDraft?.schema || [];
const silverWizardSteps = [
  { id: "source", title: "Source 선택" },
  { id: "rules", title: "Rules 설정" },
  { id: "review", title: "Review" },
];
const currentSilverStep = silverWizardSteps[silverWizardStepIndex];
const selectedSilverSource = savedSourceDatasets.find((sourceDataset) => sourceDataset.id === selectedSilverSourceId) || null;
const selectedSilverStandardizeRuleDetails = silverStandardizeRuleOptions.filter((rule) =>
  selectedSilverStandardizeRules.includes(rule.id),
);
const selectedSilverValidationRuleDetails = silverValidationRuleOptions.filter((rule) =>
  selectedSilverValidationRules.includes(rule.id),
);
const canGoNext =
  (currentStep.id === "overview" && Boolean(normalizedTargetName)) ||
  (currentStep.id === "source" && selectedTargetSilvers.length >= 2) ||
  (currentStep.id === "process" && selectedProcessRecipes.length > 0) ||
  currentStep.id === "handoff" ||
  currentStep.id === "scheduling";
const canGoNextSource =
  (currentSourceStep.id === "connection" && Boolean(sourceDraft)) ||
  (currentSourceStep.id === "raw-config" && Boolean(sourceDatasetName.trim() && sourceRawScope.trim()) && sourceDiscovery.canCreate);
const canGoNextConnection =
  (currentConnectionStep.id === "connector-type" && Boolean(selectedConnectionType)) ||
  (currentConnectionStep.id === "configure" &&
    Boolean(connectionName.trim() && connectionResource.trim() && isConnectionReadyForReview));
const canGoNextSilver =
  (currentSilverStep.id === "source" && Boolean(selectedSilverSource)) ||
  (currentSilverStep.id === "rules" &&
    Boolean(silverDatasetName.trim() && silverPurpose.trim()) &&
    selectedSilverStandardizeRules.length > 0 &&
    selectedSilverValidationRules.length > 0);
const sourceConnectionOptions = savedExternalConnections;

  return {
    normalizedTargetName,
    normalizedTargetDescription,
    selectedTargetSilvers,
    baseTargetSilver,
    enrichmentTargetSilvers,
    selectedProcessRecipes,
    selectedSilverOutputs,
    selectedFieldSummary,
    selectedOutputSchema,
    targetSourceSummary,
    wizardSteps,
    sourceWizardSteps,
    connectionWizardSteps,
    currentStep,
    currentSourceStep,
    currentConnectionStep,
    isRuntimeConnection,
    selectedConnectionPresets,
    isConnectionReadyForReview,
    sourceDiscovery,
    sourceSchemaPreview,
    silverWizardSteps,
    currentSilverStep,
    selectedSilverSource,
    selectedSilverStandardizeRuleDetails,
    selectedSilverValidationRuleDetails,
    canGoNext,
    canGoNextSource,
    canGoNextConnection,
    canGoNextSilver,
    sourceConnectionOptions,
  };
}
