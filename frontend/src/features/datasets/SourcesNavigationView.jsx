import {
  AlertCircle,
  Clock3,
  Database,
  GitBranch,
  Layers3,
  ListChecks,
  Play,
  RefreshCw,
  Search,
  ServerCog,
  Table2,
  Trash2,
  Workflow,
  Wrench,
} from "lucide-react";

import { PageHeader } from "../../design-system";
import {
  formatBytes,
  formatMetric,
} from "../../app/formatters";

import {
  CredentialSecretPolicyPanel,
  DraftColumn,
  OperationalList,
  ProductHealthPresetPanel,
  fileEvidenceLabel,
} from "./DatasetComponents";

export function SourcesNavigationView(props) {
  const {
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
  } = props;

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
            body="External Connection에서 파생되는 sync 작업 정의입니다. schedule은 의도 metadata이며 자동 실행은 아직 연결하지 않습니다."
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
            body="Source Dataset을 Silver Dataset으로 표준화/검증하는 작업 정의입니다. schedule은 의도 metadata이며 자동 실행은 아직 연결하지 않습니다."
          />
          <OperationalList
            icon={GitBranch}
            title="Silver Transform Jobs"
            body="Persisted Silver Dataset metadata에서 planned 작업으로 파생됩니다. 현재 Silver runner와 자동 scheduler는 후속 Phase에서 연결합니다."
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
            body="Silver Dataset을 조합해 Gold Dataset을 만들거나 갱신하는 작업 정의입니다. schedule은 의도 metadata이며 자동 실행은 아직 연결하지 않습니다."
          />
          <OperationalList
            icon={Workflow}
            title="Gold Build Jobs"
            body="Gold Dataset 설정에서 파생됩니다. 수동 실행은 실행 기록에 queued run을 만들고, 실제 local runner 실행은 실행 기록에서 사용자가 눌렀을 때만 진행합니다."
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

  return renderNavigationView();
}
