import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  GitBranch,
  Eye,
  Calendar,
  Clock,
  Zap,
  LayoutDashboard,
  Cog,
  Shield,
  X,
  Search,
  Sparkles,
} from "lucide-react";
import { useToast } from "../../components/common/Toast";
import { useAuth } from "../../context/AuthContext";
import { getSourceDataset } from "../domain/api/domainApi";
import { getRoles, addDatasetToRoles } from "../../services/adminApi";
import SchedulesPanel from "../../components/etl/SchedulesPanel";
import SchemaTransformEditor from "../../components/etl/SchemaTransformEditor";
import S3LogParsingConfig from "../../components/targets/S3LogParsingConfig";
import S3LogProcessEditor from "../../components/targets/S3LogProcessEditor";
import TimestampColumnWarning from "../../components/targets/TimestampColumnWarning";
import { aiApi } from "../../services/aiApi";
import { API_BASE_URL } from "../../config/api";

const STEPS = [
  { id: 1, name: "기본 정보", icon: LayoutDashboard },
  { id: 2, name: "소스 선택", icon: Database },
  { id: 3, name: "가공 설정", icon: Cog },
  { id: 4, name: "스케줄", icon: Calendar },
  { id: 5, name: "권한", icon: Shield },
  { id: 6, name: "검토", icon: Eye },
];

export default function TargetWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { sessionId, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDatasetId, setEditingDatasetId] = useState(null);

  // Step 1: Job Selection
  const [sourceTab, setSourceTab] = useState("source"); // 'source' or 'target'
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [selectedTargetIds, setSelectedTargetIds] = useState([]); // For target tab
  const [isLoading, setIsLoading] = useState(false);
  const [sourceSearchTerm, setSourceSearchTerm] = useState("");
  const [sourceDatasets, setSourceDatasets] = useState([]);
  const [focusedDataset, setFocusedDataset] = useState(null);

  // Step 2: Configuration
  const [config, setConfig] = useState({
    name: "",
    description: "",
    tags: [],
  });
  const toGlueTableName = (value) => {
    const normalized = (value || "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_()]/g, "_")
      .replace(/_+/g, "_");

    if (!normalized) return "";
    if (!/^[a-zA-Z_]/.test(normalized)) return `t_${normalized}`;
    return normalized;
  };
  const [tagInput, setTagInput] = useState("");
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);
  const [detailPanelTab, setDetailPanelTab] = useState("details"); // 'details' or 'schema'
  const [s3RegexPatterns, setS3RegexPatterns] = useState({}); // Store regex patterns by dataset ID

  // Step 3: Transformation
  const [sourceNodes, setSourceNodes] = useState([]); // Store source nodes for schema
  const [activeSourceTab, setActiveSourceTab] = useState(0); // Active tab index for multiple sources
  const [targetSchema, setTargetSchema] = useState([]); // Single shared target schema for all sources
  const [initialTargetSchema, setInitialTargetSchema] = useState([]); // For edit mode
  const [isTestPassed, setIsTestPassed] = useState(false); // Single test status for the combined schema
  const [customSql, setCustomSql] = useState(""); // Custom SQL from SQL Transform tab
  const [s3ProcessConfig, setS3ProcessConfig] = useState({
    selected_fields: [],
    filters: {},
  });

  // Step 4: Schedule
  const [jobType, setJobType] = useState("batch");
  const [schedules, setSchedules] = useState([]);

  // Step 5: Permission
  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Destination settings
  const [partitionColumns, setPartitionColumns] = useState([]);
  const [showPartitionAI, setShowPartitionAI] = useState(false);
  const [isLoadingPartitionAI, setIsLoadingPartitionAI] = useState(false);
  const [destinationSubPath, setDestinationSubPath] = useState(""); // Path after bucket, e.g., "nyc-taxi/yellow"

  const steps =
    jobType === "streaming" ? STEPS.filter((step) => step.id !== 4) : STEPS;
  const activeStepId = steps[currentStep - 1]?.id;
  const scheduleSourceDatasets =
    sourceNodes.length > 0
      ? sourceNodes.map((node) => node.data || {})
      : (sourceTab === "source" ? selectedJobIds : selectedTargetIds)
          .map((id) => sourceDatasets.find((ds) => ds.id === id))
          .filter(Boolean);
  // Fetch roles for Permission step
  useEffect(() => {
    const fetchRoles = async () => {
      if (currentStep === 5 && sessionId) {
        setRolesLoading(true);
        try {
          const allRoles = await getRoles(sessionId);
          // Filter out user's own role and admin roles
          const filteredRoles = allRoles.filter((role) => {
            // Exclude user's own role (auto-granted)
            if (role.id === user?.role_id) return false;
            // Exclude admin and master roles (they have all access anyway)
            const roleName = role.name?.toLowerCase();
            if (roleName?.includes("admin") || roleName?.includes("master"))
              return false;
            return true;
          });
          setRoles(filteredRoles);
        } catch (err) {
          console.error("Failed to fetch roles:", err);
          showToast("역할 목록을 불러오지 못했습니다", "error");
        } finally {
          setRolesLoading(false);
        }
      }
    };
    fetchRoles();
  }, [currentStep, sessionId, user]);

  // Load existing job data in edit mode
  useEffect(() => {
    const loadExistingJob = async () => {
      const { jobId, editMode } = location.state || {};
      if (!editMode || !jobId) return;

      setIsEditMode(true);
      setIsLoading(true);

      try {
        // Fetch job details
        const jobResponse = await fetch(
          `${API_BASE_URL}/api/datasets/${jobId}`
        );
        if (!jobResponse.ok) throw new Error("작업 정보를 불러오지 못했습니다");
        const job = await jobResponse.json();

        // Set config
        setEditingDatasetId(job.id);
        setConfig({
          name: job.name || "",
          description: job.description || "",
          tags: job.tags || [],
        });

        // Set job type and schedules
        setJobType(job.job_type || "batch");
        if (job.schedules && job.schedules.length > 0) {
          setSchedules(job.schedules);
        } else if (job.schedule_frequency) {
          // Reconstruct schedule object from backend fields for UI
          setSchedules([
            {
              id: Date.now().toString(),
              name: `${job.schedule_frequency}-schedule`,
              frequency: job.schedule_frequency,
              cron: job.schedule,
              enabled: true,
              uiParams: job.ui_params,
              createdAt: job.created_at || new Date().toISOString(),
            },
          ]);
        }

        // Restore source nodes and schema
        if (job.nodes && job.nodes.length > 0) {
          const sources = job.nodes.filter(
            (n) => n.data?.nodeCategory === "source"
          );
          setSourceNodes(sources);

          // Restore combined target schema from transform node
          // Find the combined transform node (not per-source to avoid duplicates)
          const transformNode = job.nodes.find(
            (n) =>
              n.data?.nodeCategory === "transform" &&
              n.data?.transformType === "sql"
          );

          if (transformNode?.data?.outputSchema) {
            setTargetSchema(transformNode.data.outputSchema);
            setInitialTargetSchema(transformNode.data.outputSchema);
          }

          // Also restore customSql if it exists
          if (transformNode?.data?.query) {
            setCustomSql(transformNode.data.query);
          }
        }

        // Skip to Transform step in edit mode
        setCurrentStep(3);

        showToast("작업 정보를 불러왔습니다", "success");
      } catch (err) {
        console.error("Failed to load job:", err);
        showToast(`작업 정보를 불러오지 못했습니다: ${err.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingJob();
  }, [location.state]);

  // Load all datasets for Step 2 table
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        // Get session ID for permission filtering
        const sessionId = sessionStorage.getItem("sessionId");
        const sessionParam = sessionId ? `?session_id=${sessionId}` : "";

        // Fetch source datasets with permission filtering
        const sourceResponse = await fetch(
          `${API_BASE_URL}/api/source-datasets${sessionParam}`
        );
        const sourceData = sourceResponse.ok ? await sourceResponse.json() : [];

        // Fetch target datasets (catalog) with permission filtering
        const targetResponse = await fetch(
          `${API_BASE_URL}/api/catalog${sessionParam}`
        );
        const targetData = targetResponse.ok ? await targetResponse.json() : [];

        // Combine and normalize datasets
        const combinedDatasets = [
          ...sourceData.map((ds) => ({
            ...ds,
            datasetType: "source",
            columnCount: ds.columns?.length || 0,
          })),
          ...targetData
            .filter((d) => d.is_active)
            .map((ds) => {
              // Use backend-provided columns (from DuckDB extraction) if available
              let schema = ds.columns || [];

              // Fallback: Extract schema from target or transform node if backend didn't provide
              if (!schema || schema.length === 0) {
                schema = ds.targets?.[0]?.schema || [];
                if ((!schema || schema.length === 0) && ds.nodes) {
                  const transformNode = ds.nodes.find(
                    (n) =>
                      n.data?.nodeCategory === "transform" ||
                      n.data?.transformType
                  );
                  if (transformNode && transformNode.data?.outputSchema) {
                    schema = transformNode.data.outputSchema;
                  }
                }
              }

              return {
                ...ds,
                datasetType: "target",
                sourceType: "s3",
                columns: schema, // Use backend columns or fallback
                columnCount: schema.length || 0,
              };
            }),
        ];

        setSourceDatasets(combinedDatasets);
      } catch (err) {
        console.error("Failed to load datasets:", err);
        setSourceDatasets([]);
      }
    };

    loadDatasets();
  }, []);

  // Check for duplicate dataset name (using already loaded datasets)
  useEffect(() => {
    if (!config.name.trim()) {
      setIsNameDuplicate(false);
      return;
    }

    // Skip check in edit mode
    if (isEditMode) {
      setIsNameDuplicate(false);
      return;
    }

    // Extract all dataset names from already loaded sourceDatasets
    const allNames = sourceDatasets
      .map((d) => d.name?.toLowerCase())
      .filter(Boolean);

    // Check for duplicate (instant, no API call needed!)
    const isDuplicate = allNames.includes(config.name.trim().toLowerCase());
    setIsNameDuplicate(isDuplicate);
  }, [config.name, isEditMode, sourceDatasets]);

  const glueTableName = toGlueTableName(config.name);

  const handleToggleJob = (jobId) => {
    // Clear target selections when selecting from source
    setSelectedTargetIds([]);

    setSelectedJobIds((prev) => {
      // For Source tab: only allow single selection
      // If clicked item is already selected, deselect it
      if (prev.includes(jobId)) {
        return [];
      }
      // Otherwise, replace with new selection
      return [jobId];
    });
  };

  const handleImportSources = async () => {
    // Check which tab is active
    if (sourceTab === "source") {
      // Source Datasets tab
      if (selectedJobIds.length === 0) {
        showToast("원본 데이터셋을 하나 이상 선택해주세요", "error");
        return;
      }

      setIsLoading(true);
      try {
        // Get source datasets from state (includes regex-extracted columns)
        const sources = selectedJobIds
          .map((id) => sourceDatasets.find((ds) => ds.id === id))
          .filter(Boolean);

        if (sources.length === 0) {
          showToast("원본 데이터셋을 찾을 수 없습니다", "warning");
          setIsLoading(false);
          return;
        }

        const hasKafkaSource = sources.some(
          (source) => source.source_type === "kafka"
        );
        if (hasKafkaSource) {
          setJobType("streaming");
          setSchedules([]);
        } else if (jobType === "streaming") {
          setJobType("batch");
        }

        // Convert source datasets to lineage nodes
        const nodes = [];

        sources.forEach((source) => {
          const columns = source.columns || [];
          const nodeData = {
            label: source.name,
            name: source.name,
            platform: source.source_type || "PostgreSQL",
            sourceType: source.source_type || "rdb",
            columns: columns.map((col) => ({
              name: col.name,
              type: col.type,
              description: col.description || "",
            })),
            expanded: true,
            nodeCategory: "source",
            sourceDatasetId: source.id,
          };

          // S3 source인 경우 format, customRegex, bucket, path, connection_id 추가
          if (source.source_type === "s3") {
            nodeData.format = source.format || "log";
            nodeData.bucket = source.bucket;
            nodeData.path = source.path;
            nodeData.connection_id = source.connection_id;
            nodeData.source_type = source.source_type;

            const sourceCustomRegex =
              source.custom_regex ||
              source.customRegex ||
              s3RegexPatterns[source.id];
            if (sourceCustomRegex) {
              nodeData.customRegex = sourceCustomRegex;
            }
          }

          // 자동으로 timestamp 컬럼 감지하여 증분 로드 설정
          // updated_at과 created_at을 구분하여 처리
          const updatedAtNames = [
            "updated_at",
            "modified_at",
            "last_modified",
            "date_modified",
          ];
          const createdAtNames = ["created_at", "date_created", "timestamp"];

          let updatedAtColumn = null;
          let createdAtColumn = null;

          // updated_at 계열 컬럼 찾기
          for (const name of updatedAtNames) {
            updatedAtColumn = columns.find(
              (col) => (col.name || col.field || "").toLowerCase() === name
            );
            if (updatedAtColumn) {
              console.log(
                `[Incremental Load] Found updated_at column: ${
                  updatedAtColumn.name || updatedAtColumn.field
                }`
              );
              break;
            }
          }

          // created_at 계열 컬럼 찾기
          for (const name of createdAtNames) {
            createdAtColumn = columns.find(
              (col) => (col.name || col.field || "").toLowerCase() === name
            );
            if (createdAtColumn) {
              console.log(
                `[Incremental Load] Found created_at column: ${
                  createdAtColumn.name || createdAtColumn.field
                }`
              );
              break;
            }
          }

          // Incremental config 설정
          if (updatedAtColumn || createdAtColumn) {
            nodeData.incrementalConfig = {
              enabled: true,
              updated_at_column: updatedAtColumn
                ? updatedAtColumn.name || updatedAtColumn.field
                : null,
              created_at_column: createdAtColumn
                ? createdAtColumn.name || createdAtColumn.field
                : null,
            };

            if (updatedAtColumn) {
              console.log(
                `[Incremental Load] Will use SCD Type 2 with updated_at: ${
                  updatedAtColumn.name || updatedAtColumn.field
                }`
              );
            } else if (createdAtColumn) {
              console.log(
                `[Incremental Load] Will use Append with created_at: ${
                  createdAtColumn.name || createdAtColumn.field
                }`
              );
            }
          } else {
            // timestamp 컬럼이 없으면 증분 로드 비활성화 (Full Load)
            nodeData.incrementalConfig = {
              enabled: false,
              updated_at_column: null,
              created_at_column: null,
            };
            console.log(
              `[Incremental Load] No timestamp column found for source ${source.name}, using full load`
            );
          }

          nodes.push({
            id: `source-${source.id}`,
            type: "custom",
            position: { x: 100, y: 100 },
            data: nodeData,
          });
        });

        if (nodes.length === 0) {
          showToast("가져올 원본 데이터가 없습니다", "warning");
          return;
        }

        setSourceNodes(nodes);

        // Set default name from first source
        if (sources[0]?.name && !config.name) {
          setConfig((prev) => ({ ...prev, name: `${sources[0].name}_target` }));
        }

        showToast(`원본 데이터셋 ${nodes.length}개를 가져왔습니다`, "success");
      } catch (err) {
        console.error("Failed to import sources:", err);
        showToast(`원본 데이터를 가져오지 못했습니다: ${err.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Target Datasets (Catalog) tab
      if (selectedTargetIds.length === 0) {
        showToast("타겟 데이터셋을 하나 이상 선택해주세요", "error");
        return;
      }

      setIsLoading(true);
      try {
        const nodes = [];

        for (const datasetId of selectedTargetIds) {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/catalog/${datasetId}`
            );
            if (!response.ok) continue;

            const dataset = await response.json();
            const target = dataset.targets?.[0];
            let schema = [];
            let format = "parquet";
            let s3Path = "";

            // 1. Try to get schema from Target definition (Catalog)
            if (target && target.schema) {
              schema = target.schema;
              format = target.config?.format || "parquet";
            }

            // 2. Fallback: Try to get schema from Transform Node (Wizard-created datasets)
            if (
              (!schema || schema.length === 0) &&
              dataset.nodes &&
              dataset.nodes.length > 0
            ) {
              const transformNode = dataset.nodes.find(
                (n) =>
                  n.data?.nodeCategory === "transform" || n.data?.transformType
              );
              if (transformNode && transformNode.data?.outputSchema) {
                schema = transformNode.data.outputSchema;
              }
            }

            // Get actual S3 path: destination.path + dataset.name (Spark adds job name to path)

            if (dataset.destination?.path) {
              const basePath = dataset.destination.path;
              const datasetName = dataset.name || "";
              const normalizedPath = basePath.endsWith("/")
                ? basePath
                : `${basePath}/`;
              s3Path = `${normalizedPath}${datasetName}`;
            } else if (target.urn) {
              const urnParts = target.urn.split(":");
              if (
                urnParts[0] === "urn" &&
                urnParts[1] === "s3" &&
                urnParts.length >= 3
              ) {
                const bucket = urnParts[2];
                const key = urnParts.slice(3).join(":") || dataset.name;
                s3Path = `s3a://${bucket}/${key}`;
              }
            }

            if (!s3Path) {
              console.error(
                "Could not determine S3 path for dataset:",
                dataset.name
              );
              continue;
            }

            // 자동으로 timestamp 컬럼 감지하여 증분 로드 설정
            // 우선순위: updated_at > modified_at > last_modified > created_at > timestamp
            const timestampColumnNames = [
              "updated_at",
              "modified_at",
              "last_modified",
              "date_modified",
              "created_at",
              "timestamp",
            ];
            let timestampColumn = null;
            for (const preferredName of timestampColumnNames) {
              timestampColumn = schema.find(
                (col) =>
                  (col.name || col.field || "").toLowerCase() === preferredName
              );
              if (timestampColumn) break;
            }

            const incrementalConfig = timestampColumn
              ? {
                  enabled: true,
                  timestamp_column:
                    timestampColumn.name || timestampColumn.field,
                }
              : {
                  enabled: false,
                  timestamp_column: null,
                };

            if (timestampColumn) {
              console.log(
                `[Incremental Load] Auto-detected timestamp column: ${
                  timestampColumn.name || timestampColumn.field
                } for catalog dataset ${dataset.name}`
              );
            } else {
              console.log(
                `[Incremental Load] No timestamp column found for catalog dataset ${dataset.name}, using full load`
              );
            }

            nodes.push({
              id: `source-catalog-${datasetId}`,
              type: "custom",
              position: { x: 100, y: 100 },
              data: {
                label: dataset.name,
                name: dataset.name,
                platform: "S3",
                sourceType: "s3",
                columns: schema.map((col) => ({
                  name: col.name || col.field,
                  type: col.type || "string",
                  description: col.description || "",
                })),
                schema: schema.map((col) => ({
                  name: col.name || col.field,
                  type: col.type || "string",
                })),
                expanded: true,
                nodeCategory: "source",
                catalogDatasetId: datasetId,
                s3Location: s3Path,
                path: s3Path,
                format:
                  dataset.destination?.format ||
                  target?.config?.format ||
                  "parquet",
                incrementalConfig: incrementalConfig,
                // Note: s3_config is not needed here
                // Spark ETL runner will use environment-specific credentials:
                // - LocalStack: credentials from Airflow DAG
                // - Production: IAM role (IRSA)
                // onDelete: handleDeleteNode, // Removed as function is not defined here
              },
            });
          } catch (err) {
            console.error(`Failed to fetch catalog dataset ${datasetId}:`, err);
          }
        }

        if (nodes.length === 0) {
          showToast("카탈로그 데이터를 찾을 수 없습니다", "warning");
          return;
        }

        setSourceNodes(nodes);

        // Set default name from first dataset
        if (nodes[0]?.data?.name && !config.name) {
          setConfig((prev) => ({
            ...prev,
            name: `${nodes[0].data.name}_target`,
          }));
        }

        showToast(`카탈로그 데이터셋 ${nodes.length}개를 가져왔습니다`, "success");
      } catch (err) {
        console.error("Failed to import catalog datasets:", err);
        showToast(
          `카탈로그 데이터셋을 가져오지 못했습니다: ${err.message}`,
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNext = async () => {
    if (activeStepId === 2) {
      // Import source datasets before moving to step 3
      await handleImportSources();
      if (sourceNodes.length > 0 || selectedJobIds.length > 0) {
        // Re-import if we have selections but no nodes yet
        if (sourceNodes.length === 0) {
          await handleImportSources();
        }
      }
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate SQL from targetSchema
  const generateSql = (schema) => {
    // If custom SQL is provided (from SQL Transform tab), use it
    if (customSql && customSql.trim()) {
      return customSql.trim();
    }

    // Otherwise generate SQL from schema (Visual Transform tab)
    if (!schema || schema.length === 0) return "SELECT * FROM input";

    const selectClauses = schema.map((col) => {
      if (col.transform) {
        return `${col.transform} AS ${col.name}`;
      }
      return col.originalName === col.name
        ? col.name
        : `${col.originalName} AS ${col.name}`;
    });

    return `SELECT ${selectClauses.join(", ")} FROM input`;
  };

  const handleCreate = async () => {
    if (sourceNodes.length === 0) {
      showToast("오류: 사용할 수 있는 원본 노드가 없습니다", "error");
      return;
    }

    try {
      const isS3LogSource =
        sourceNodes[0]?.data?.customRegex &&
        (sourceNodes[0]?.data?.sourceType === "s3" ||
          sourceNodes[0]?.data?.platform?.toLowerCase() === "s3");

      let edges = [];
      let allNodes = [];

      if (isS3LogSource) {
        const nodeSuffix = Date.now();
        const selectNodeId = `transform-s3-select-${nodeSuffix}`;
        const filterNodeId = `transform-s3-filter-${nodeSuffix}`;

        const selectTransformNode = {
          id: selectNodeId,
          type: "custom",
          position: { x: 500, y: 200 },
          data: {
            label: "가공: 필드 선택",
            name: "가공: 필드 선택",
            platform: "S3 Log Transform",
            nodeCategory: "transform",
            transformType: "s3-select-fields",
            transformConfig: {
              selected_fields: s3ProcessConfig.selected_fields || [],
            },
            outputSchema: targetSchema,
            sourceNodeIds: sourceNodes.map((n) => n.id),
          },
        };

        const filterTransformNode = {
          id: filterNodeId,
          type: "custom",
          position: { x: 700, y: 200 },
          data: {
            label: "가공: 필터 적용",
            name: "가공: 필터 적용",
            platform: "S3 Log Transform",
            nodeCategory: "transform",
            transformType: "s3-filter",
            transformConfig: {
              filters: s3ProcessConfig.filters || {},
            },
            outputSchema: targetSchema,
            sourceNodeIds: sourceNodes.map((n) => n.id),
          },
        };

        edges = [
          ...sourceNodes.map((source) => ({
            id: `edge-${source.id}-${selectNodeId}`,
            source: source.id,
            target: selectNodeId,
            type: "default",
          })),
          {
            id: `edge-${selectNodeId}-${filterNodeId}`,
            source: selectNodeId,
            target: filterNodeId,
            type: "default",
          },
        ];

        allNodes = [...sourceNodes, selectTransformNode, filterTransformNode];
      } else {
        // Generate a single transform node with the combined schema
        const sql = generateSql(targetSchema);
        const transformNodeId = `transform-combined-${Date.now()}`;

        const transformNode = {
          id: transformNodeId,
          type: "custom",
          position: { x: 500, y: 200 },
          data: {
            label: `가공: 통합`,
            name: `가공: 통합`,
            platform: "SQL Transform",
            nodeCategory: "transform",
            transformType: "sql",
            query: sql,
            outputSchema: targetSchema,
            sourceNodeIds: sourceNodes.map((n) => n.id),
          },
        };

        // Create edges from all sources to the single transform node
        edges = sourceNodes.map((source) => ({
          id: `edge-${source.id}-${transformNodeId}`,
          source: source.id,
          target: transformNodeId,
          type: "default",
        }));

        // Combine all nodes
        allNodes = [...sourceNodes, transformNode];
      }

      // Extract incremental config from first source node
      const firstSourceNode = sourceNodes[0];
      const incrementalConfig = firstSourceNode?.data?.incrementalConfig;

      const payload = {
        name: config.name,
        description: config.description,
        tags: config.tags,
        dataset_type: "target",
        job_type: jobType,
        nodes: allNodes, // Save simplified DAG
        edges: edges,
        // Map first schedule to backend format (backend currently supports single schedule)
        schedule_frequency: schedules.length > 0 ? schedules[0].frequency : "",
        ui_params: schedules.length > 0 ? schedules[0].uiParams : null,
        // Add incremental load config for automatic sync timestamp tracking
        incremental_config: incrementalConfig || { enabled: false },
        destination: {
          type: "s3",
          path: destinationSubPath
            ? `s3a://xflows-output/${destinationSubPath.replace(
                /^\/+|\/+$/g,
                ""
              )}/`
            : "s3a://xflows-output/",
          format: "delta",
          glue_table_name: glueTableName,
          options: {
            partitionBy:
              partitionColumns.length > 0 ? partitionColumns : undefined,
          },
          // s3_config is injected by Airflow DAG based on environment
        },
      };

      const url = isEditMode
        ? `${API_BASE_URL}/api/datasets/${editingDatasetId}`
        : `${API_BASE_URL}/api/datasets${
            sessionId ? `?session_id=${sessionId}` : ""
          }`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            `타겟 데이터셋 저장에 실패했습니다 (${response.status})`
        );
      }

      const createdDataset = await response.json();

      // Add dataset to selected roles (only for new datasets, not edits)
      if (!isEditMode && selectedRoleIds.length > 0 && createdDataset.id) {
        try {
          await addDatasetToRoles(
            sessionId,
            createdDataset.id,
            selectedRoleIds
          );
          console.log(`Dataset added to ${selectedRoleIds.length} role(s)`);
        } catch (roleError) {
          console.error("Failed to add dataset to roles:", roleError);
          // Don't block dataset creation if role update fails
        }
      }

      showToast(
        isEditMode
          ? "타겟 데이터셋을 수정했습니다"
          : "타겟 데이터셋을 생성했습니다",
        "success"
      );
      navigate("/dataset");
    } catch (error) {
      console.error("Failed to save target dataset:", error);
      showToast(`저장에 실패했습니다: ${error.message}`, "error");
    }
  };

  const canProceed = () => {
    switch (activeStepId) {
      case 1:
        // Overview step - need unique name
        return config.name.trim() !== "" && !isNameDuplicate;
      case 2:
        // Source step - check both Source and Target tabs
        return selectedJobIds.length > 0 || selectedTargetIds.length > 0;
      case 3:
        // Process/Transform step
        // Visual Transform: need schema with test passed
        // SQL Transform: need customSql (schema inferred at runtime)
        const hasVisualTransform = targetSchema.length > 0 && isTestPassed;
        const hasSqlTransform = customSql && customSql.trim() && isTestPassed;
        return hasVisualTransform || hasSqlTransform;
      case 4:
        return true; // Schedule step - always can proceed
      case 5:
        return true; // Permission step - always can proceed
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header + Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (currentStep === 1) {
                    navigate("/dataset");
                  } else {
                    handleBack();
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? "타겟 데이터셋 수정" : "타겟 데이터셋 생성"}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEditMode ? "타겟 데이터셋 설정을 수정합니다" : ""}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-colors ${
                    canProceed() && !isLoading
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      불러오는 중...
                    </>
                  ) : (
                    <>
                      다음
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {isEditMode ? "변경사항 저장" : "생성"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-start">
            {steps.map((step, index) => {
              const stepIndex = index + 1;
              return (
                <div
                  key={step.id}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        currentStep > stepIndex
                          ? "bg-orange-500 text-white"
                          : currentStep === stepIndex
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > stepIndex ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium whitespace-nowrap ${
                        currentStep >= stepIndex
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded self-center -mt-6 ${
                        currentStep > stepIndex
                          ? "bg-orange-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Step 1: Overview */}
        {activeStepId === 1 && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                기본 정보
              </h2>
              <p className="text-gray-500 mb-6">
                타겟 데이터셋의 기본 정보를 설정합니다
              </p>

              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      데이터셋 이름 *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={config.name}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            name: toGlueTableName(e.target.value),
                          })
                        }
                        placeholder="데이터셋 이름 입력"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          isNameDuplicate
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-orange-500"
                        }`}
                      />
                    </div>
                    {config.name && (
                      <p className="mt-1 text-xs text-gray-500">
                        Glue/S3 식별자:{" "}
                        <span className="font-mono">{glueTableName}</span>
                      </p>
                    )}
                    {isNameDuplicate && (
                      <p className="mt-1 text-sm text-red-500">
                        이미 존재하는 데이터셋 이름입니다. 다른 이름을
                        입력해주세요.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      태그
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          e.preventDefault();
                          if (!config.tags.includes(tagInput.trim())) {
                            setConfig({
                              ...config,
                              tags: [...config.tags, tagInput.trim()],
                            });
                          }
                          setTagInput("");
                        }
                      }}
                      placeholder="입력 후 Enter"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {config.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {config.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs"
                          >
                            {tag}
                            <button
                              onClick={() =>
                                setConfig({
                                  ...config,
                                  tags: config.tags.filter(
                                    (_, i) => i !== index
                                  ),
                                })
                              }
                              className="hover:text-orange-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) =>
                      setConfig({ ...config, description: e.target.value })
                    }
                    placeholder="설명 입력 (선택)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Source Selection */}
        {activeStepId === 2 && (
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex">
              {/* Left: Table */}
              <div className="w-2/3 flex flex-col border-r border-gray-200 bg-white">
                {/* Search and Filter Bar */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="데이터셋 검색..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        value={sourceSearchTerm}
                        onChange={(e) => setSourceSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSourceTab("source")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          sourceTab === "source"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        원본 데이터
                      </button>
                      <button
                        onClick={() => setSourceTab("target")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          sourceTab === "target"
                            ? "bg-orange-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        타겟 데이터
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="w-10 px-3 py-2"></th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                          이름
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                          담당자
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                          원본 유형
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                          패턴
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sourceDatasets
                        .filter((ds) => {
                          const matchesSearch =
                            ds.name
                              ?.toLowerCase()
                              .includes(sourceSearchTerm.toLowerCase()) ||
                            ds.description
                              ?.toLowerCase()
                              .includes(sourceSearchTerm.toLowerCase());
                          const matchesType = ds.datasetType === sourceTab;
                          return matchesSearch && matchesType;
                        })
                        .map((dataset) => {
                          const isSelected =
                            dataset.datasetType === "source"
                              ? selectedJobIds.includes(dataset.id)
                              : selectedTargetIds.includes(dataset.id);
                          const isFocused = focusedDataset?.id === dataset.id;

                          return (
                            <tr
                              key={dataset.id}
                              onClick={() => {
                                setFocusedDataset(dataset);
                                if (dataset.datasetType === "source") {
                                  handleToggleJob(dataset.id);
                                } else {
                                  // Clear source selections when selecting from target
                                  setSelectedJobIds([]);

                                  setSelectedTargetIds((prev) =>
                                    prev.includes(dataset.id)
                                      ? prev.filter(
                                          (item) => item !== dataset.id
                                        )
                                      : [...prev, dataset.id]
                                  );
                                }
                              }}
                              className={`cursor-pointer transition-colors ${
                                isFocused
                                  ? "bg-orange-50"
                                  : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <td className="px-3 py-2">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? "bg-orange-600 border-orange-600"
                                      : "border-gray-300 bg-white hover:border-gray-400"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                                  {dataset.name}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-600 truncate max-w-[100px]">
                                {dataset.owner || "-"}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                    dataset.source_type === "postgresql" ||
                                    dataset.source_type === "postgres"
                                      ? "bg-blue-100 text-blue-700"
                                      : dataset.source_type === "mongodb"
                                      ? "bg-green-100 text-green-700"
                                      : dataset.source_type === "s3" ||
                                        dataset.sourceType === "s3"
                                      ? "bg-orange-100 text-orange-700"
                                      : dataset.source_type === "api"
                                      ? "bg-purple-100 text-purple-700"
                                      : dataset.source_type === "kafka"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {dataset.source_type ||
                                    dataset.sourceType ||
                                    "-"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-[120px]">
                                {dataset.pattern || dataset.path || "-"}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>

                  {sourceDatasets.filter((ds) => {
                    const matchesSearch =
                      ds.name
                        ?.toLowerCase()
                        .includes(sourceSearchTerm.toLowerCase()) ||
                      ds.description
                        ?.toLowerCase()
                        .includes(sourceSearchTerm.toLowerCase());
                    const matchesType = ds.datasetType === sourceTab;
                    return matchesSearch && matchesType;
                  }).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Database className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">데이터셋이 없습니다</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <span className="text-xs text-gray-600">
                    {selectedJobIds.length + selectedTargetIds.length}개 선택됨
                  </span>
                </div>
              </div>

              {/* Right: Detail Panel */}
              <div className="w-1/3 flex flex-col bg-white">
                {/* Tabs Header */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setDetailPanelTab("details")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      detailPanelTab === "details"
                        ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    상세 정보
                  </button>
                  <button
                    onClick={() => setDetailPanelTab("schema")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      detailPanelTab === "schema"
                        ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    스키마
                  </button>
                </div>

                {!focusedDataset ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
                    <Database className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm text-center">
                      상세 정보를 보려면 데이터셋을 선택하세요
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-4">
                    {/* Details Tab */}
                    {detailPanelTab === "details" && (
                      <>
                        <div className="pb-4 mb-4 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">
                            {focusedDataset.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {focusedDataset.source_type ||
                              focusedDataset.datasetType}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              설명
                            </h4>
                            <p className="text-sm text-gray-700">
                              {focusedDataset.description || "-"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              유형
                            </h4>
                            <p className="text-sm text-gray-700 capitalize">
                              {focusedDataset.datasetType || "-"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              원본
                            </h4>
                            <p className="text-sm text-gray-700">
                              {focusedDataset.source_type ||
                                focusedDataset.sourceType ||
                                "-"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              컬럼
                            </h4>
                            {focusedDataset.destination?.type === "s3" &&
                            !focusedDataset.columns ? (
                              <p className="text-sm text-gray-500 italic">
                                S3에서 스키마를 불러오는 중...
                              </p>
                            ) : focusedDataset.destination?.type === "s3" &&
                              focusedDataset.columns?.length === 0 ? (
                              <p className="text-sm text-red-600">
                                스키마를 불러오지 못했습니다
                              </p>
                            ) : (
                              <p className="text-sm text-gray-700">
                                {focusedDataset.columns?.length || 0}
                              </p>
                            )}
                          </div>
                          {focusedDataset.updated_at && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                최근 수정일
                              </h4>
                              <p className="text-sm text-gray-700">
                                {new Date(
                                  focusedDataset.updated_at
                                ).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Schema Tab */}
                    {detailPanelTab === "schema" && (
                      <div>
                        {/* Show Schema Table for all sources */}
                        <>
                          {focusedDataset.source_type === "s3" &&
                            (!focusedDataset.format ||
                              focusedDataset.format === "log") &&
                            !focusedDataset.columns?.length && (
                              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs text-amber-800">
                                  <strong>S3 Logs 스키마가 없습니다.</strong>
                                  <br />
                                  원본 데이터셋 생성/수정 시 "로그 파싱 테스트"
                                  섹션에서 정규식 패턴을 테스트하여 스키마를
                                  먼저 가져와주세요.
                                </p>
                              </div>
                            )}
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">
                              컬럼
                            </h4>
                            <span className="text-xs text-gray-400">
                              컬럼 {focusedDataset.columns?.length || 0}개
                            </span>
                          </div>
                          {focusedDataset.destination?.type === "s3" &&
                          !focusedDataset.columns ? (
                            <div className="text-center py-8 text-gray-500">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
                              <p className="text-sm">
                                S3에서 스키마를 불러오는 중...
                              </p>
                            </div>
                          ) : focusedDataset.destination?.type === "s3" &&
                            focusedDataset.columns?.length === 0 ? (
                            <div className="text-center py-8 text-red-600">
                              <X className="w-8 h-8 mx-auto mb-3" />
                              <p className="text-sm font-medium">
                                스키마를 불러오지 못했습니다
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                S3 경로와 인증 정보를 확인하세요
                              </p>
                            </div>
                          ) : focusedDataset.columns?.length > 0 ? (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                      컬럼
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                      유형
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {focusedDataset.columns.map((col, idx) => (
                                    <tr key={idx}>
                                      <td className="px-3 py-2 text-sm text-gray-800">
                                        {col.key || col.name}{" "}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                          {col.type}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              <p className="text-sm">사용 가능한 스키마가 없습니다</p>
                            </div>
                          )}
                        </>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Transform/Process */}
        {activeStepId === 3 && (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-[100%] mx-auto w-full min-h-full flex flex-col">
              <div className="flex-1">
                {/* ================= S3 Log Source ================= */}
                {(sourceNodes[0]?.data?.source_type === "s3" ||
                  sourceNodes[0]?.data?.sourceType === "s3" ||
                  sourceNodes[0]?.data?.platform?.toLowerCase() === "s3") &&
                (!sourceNodes[0]?.data?.format ||
                  sourceNodes[0]?.data?.format === "log") ? (
                  <S3LogProcessEditor
                    sourceSchema={sourceNodes.flatMap(
                      (n) => n.data?.columns || []
                    )}
                    sourceDatasetId={sourceNodes[0]?.data?.sourceDatasetId}
                    customRegex={sourceNodes[0]?.data?.customRegex}
                    onConfigChange={(config) => {
                      setS3ProcessConfig(config);
                      setTargetSchema(
                        config.selected_fields.map((field) => ({
                          name: field,
                          type: "string",
                          originalName: field,
                        }))
                      );
                    }}
                    onTestStatusChange={setIsTestPassed}
                  />
                ) : /* ================= API Source ================= */
                sourceNodes[0]?.data?.source_type === "api" ||
                  sourceNodes[0]?.data?.sourceType === "api" ? (
                  sourceNodes[activeSourceTab]?.data?.columns?.length ? (
                    <SchemaTransformEditor
                      sourceSchema={
                        sourceNodes[activeSourceTab].data?.columns || []
                      }
                      sourceName={
                        sourceNodes[activeSourceTab].data?.name ||
                        `Source ${activeSourceTab + 1}`
                      }
                      sourceId={sourceNodes[activeSourceTab].id}
                      sourceDatasetId={
                        sourceNodes[activeSourceTab].data?.sourceDatasetId ||
                        sourceNodes[activeSourceTab].data?.catalogDatasetId
                      }
                      targetSchema={targetSchema}
                      initialTargetSchema={initialTargetSchema}
                      initialCustomSql={customSql}
                      onSchemaChange={setTargetSchema}
                      onTestStatusChange={setIsTestPassed}
                      onSqlChange={setCustomSql}
                      allSources={sourceNodes.map((node) => ({
                        id: node.id,
                        datasetId:
                          node.data?.sourceDatasetId ||
                          node.data?.catalogDatasetId,
                        name: node.data?.name,
                        schema: node.data?.columns || [],
                      }))}
                      sourceTabs={
                        sourceNodes.length > 1 ? (
                          <div className="flex gap-1 flex-wrap">
                            {sourceNodes.map((source, idx) => (
                              <button
                                key={source.id}
                                onClick={() => setActiveSourceTab(idx)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                  activeSourceTab === idx
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: [
                                      "#3b82f6",
                                      "#10b981",
                                      "#f59e0b",
                                      "#8b5cf6",
                                    ][idx % 4],
                                  }}
                                />
                                원본 {idx + 1}: {source.data?.name}
                              </button>
                            ))}
                          </div>
                        ) : null
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="max-w-md text-center text-gray-500">
                        <p className="text-sm">
                          API 스키마가 아직 없습니다. 소스 선택 단계에서
                          미리보기/스키마를 먼저 가져와주세요.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  /* ================= RDB / Mongo / API (With Schema) Source ================= */
                  sourceNodes[activeSourceTab] && (
                    <SchemaTransformEditor
                      sourceSchema={
                        sourceNodes[activeSourceTab].data?.columns || []
                      }
                      sourceName={
                        sourceNodes[activeSourceTab].data?.name ||
                        `원본 ${activeSourceTab + 1}`
                      }
                      sourceId={sourceNodes[activeSourceTab].id}
                      sourceDatasetId={
                        sourceNodes[activeSourceTab].data?.sourceDatasetId ||
                        sourceNodes[activeSourceTab].data?.catalogDatasetId
                      }
                      targetSchema={targetSchema}
                      initialTargetSchema={initialTargetSchema}
                      initialCustomSql={customSql}
                      onSchemaChange={setTargetSchema}
                      onTestStatusChange={setIsTestPassed}
                      onSqlChange={setCustomSql}
                      allSources={sourceNodes.map((node) => ({
                        id: node.id,
                        datasetId:
                          node.data?.sourceDatasetId ||
                          node.data?.catalogDatasetId,
                        name: node.data?.name,
                        schema: node.data?.columns || [], // Add schema/columns
                      }))}
                      sourceTabs={
                        sourceNodes.length > 1 ? (
                          <div className="flex gap-1 flex-wrap">
                            {sourceNodes.map((source, idx) => (
                              <button
                                key={source.id}
                                onClick={() => setActiveSourceTab(idx)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                  activeSourceTab === idx
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: [
                                      "#3b82f6",
                                      "#10b981",
                                      "#f59e0b",
                                      "#8b5cf6",
                                    ][idx % 4],
                                  }}
                                />
                                원본 {idx + 1}: {source.data?.name}
                              </button>
                            ))}
                          </div>
                        ) : null
                      }
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {activeStepId === 4 && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                스케줄 설정
              </h2>

              <TimestampColumnWarning
                sourceDatasets={scheduleSourceDatasets}
                schedules={schedules}
                s3ProcessConfig={s3ProcessConfig}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <SchedulesPanel
                  schedules={schedules}
                  onUpdate={(newSchedules) => setSchedules(newSchedules)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Permission */}
        {activeStepId === 5 && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                권한
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                이 데이터셋에 접근할 수 있는 역할을 선택합니다
              </p>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    데이터셋 접근 권한
                  </h3>
                  <p className="text-xs text-gray-500">
                    선택한 역할의 사용자는 이 데이터셋을 조회하고 SQL 분석에
                    사용할 수 있습니다
                  </p>
                </div>

                {rolesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-sm text-gray-500">
                      역할을 불러오는 중...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* User's own role - auto-selected and disabled */}
                    {user?.role_id && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          내 역할 (자동 부여)
                        </p>
                        <div className="flex items-center p-3 border-2 border-green-200 bg-green-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={true}
                            disabled={true}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 opacity-60 cursor-not-allowed"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {user.role_name || "내 역할"}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                자동 부여
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              내가 만든 데이터셋에는 자동으로 접근 권한이
                              부여됩니다
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other roles */}
                    {roles.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                          추가로 선택할 역할이 없습니다
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          추가 역할
                        </p>
                        <div className="space-y-2">
                          {roles.map((role) => (
                            <label
                              key={role.id}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRoleIds.includes(role.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRoleIds([
                                      ...selectedRoleIds,
                                      role.id,
                                    ]);
                                  } else {
                                    setSelectedRoleIds(
                                      selectedRoleIds.filter(
                                        (id) => id !== role.id
                                      )
                                    );
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="ml-3 flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {role.name}
                                </span>
                                {role.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {role.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {selectedRoleIds.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700">
                      추가 역할 <strong>{selectedRoleIds.length}</strong>개가
                      선택되었습니다. 해당 역할의 사용자는 이 데이터셋에
                      접근할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {activeStepId === 6 && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                검토
              </h2>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-orange-500" />
                    기본 정보
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex items-center gap-3">
                      <dt className="text-sm text-gray-500 w-24">ID</dt>
                      <dd className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                        {glueTableName}
                      </dd>
                    </div>
                    {isEditMode && editingDatasetId && (
                      <div className="flex items-center gap-3">
                        <dt className="text-sm text-gray-500 w-24">
                          데이터셋 ID
                        </dt>
                        <dd className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                          {editingDatasetId}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <dt className="text-sm text-gray-500 w-24">이름</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {config.name}
                      </dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <dt className="text-sm text-gray-500 w-24">
                        설명
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {config.description || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
                {/* Schema Summary */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-blue-500" />
                      출력 스키마
                    </h3>
                  </div>

                  {/* Detailed Column List */}
                  <div className="bg-white">
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        타겟 컬럼
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium border border-blue-100">
                        필드 {targetSchema.length}개
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                      {targetSchema.map((col, idx) => (
                        <div
                          key={idx}
                          className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-gray-400 w-4">
                              {idx + 1}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-800">
                                {col.name}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 italic">
                                {col.expression || "직접 매핑"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-200 uppercase">
                            {col.type || "string"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Destination Settings */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-green-500" />
                      저장 위치 설정
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-2">
                        출력 경로 (S3)
                      </label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm font-mono text-gray-600">
                          s3a://xflows-output/
                        </span>
                        <input
                          type="text"
                          value={destinationSubPath}
                          onChange={(e) =>
                            setDestinationSubPath(e.target.value)
                          }
                          placeholder="path/to/data"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        선택 입력입니다. 데이터셋 이름은 자동으로 뒤에
                        붙습니다.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          저장 형식
                        </label>
                        <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                          Delta Lake
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          Glue 테이블 이름
                        </label>
                        <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-600">
                          {glueTableName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partition Settings */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Cog className="w-4 h-4 text-purple-500" />
                        파티션 설정
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        출력 데이터를 나눌 파티션 컬럼을 선택합니다. 큰
                        데이터셋에서는 파티션이 SQL 조회 성능을 높여줍니다.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (targetSchema.length === 0) {
                          showToast(
                            "파티션에 사용할 수 있는 컬럼이 없습니다",
                            "error"
                          );
                          return;
                        }

                        setIsLoadingPartitionAI(true);
                        try {
                          const response = await aiApi.generateSQL(
                            "파티션 컬럼 추천",
                            {
                              columns: targetSchema.map((col) => ({
                                name: col.name,
                                type: col.type,
                              })),
                            },
                            "partition"
                          );

                          // Parse AI suggestion and apply to partitionColumns
                          const suggestion = response.sql || "";
                          console.log("AI partition suggestion:", suggestion);
                          console.log(
                            "Available columns:",
                            targetSchema.map((col) => col.name)
                          );

                          // Extract column names - handle various formats
                          let cleanedSuggestion = suggestion
                            .replace(/SELECT|FROM|WHERE|;/gi, "")
                            .replace(/["'`]/g, "")
                            .trim();

                          const columnNames = cleanedSuggestion
                            .split(/[,\n]/)
                            .map((name) => name.trim())
                            .filter((name) => name.length > 0)
                            .filter((name) =>
                              targetSchema.some((col) => col.name === name)
                            );

                          if (columnNames.length > 0) {
                            setPartitionColumns(columnNames);
                            showToast(
                              `AI 추천 컬럼: ${columnNames.join(", ")}`,
                              "success"
                            );
                          } else {
                            showToast(
                              "AI가 파티션 컬럼을 추천하지 못했습니다",
                              "error"
                            );
                          }
                        } catch (error) {
                          console.error(
                            "AI partition recommendation failed:",
                            error
                          );
                          showToast("AI 추천을 가져오지 못했습니다", "error");
                        } finally {
                          setIsLoadingPartitionAI(false);
                        }
                      }}
                      disabled={
                        isLoadingPartitionAI || targetSchema.length === 0
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                          bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600
                          hover:from-indigo-100 hover:to-purple-100 transition-all
                          border border-indigo-200/50
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      title="AI 파티션 추천"
                    >
                      {isLoadingPartitionAI ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-600"></div>
                          <span>추천 중...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>AI 추천</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-6">
                    {targetSchema.length > 0 ? (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 block mb-3">
                          파티션 컬럼 선택 (선택)
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {targetSchema.map((col) => (
                            <label
                              key={col.name}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                                partitionColumns.includes(col.name)
                                  ? "bg-purple-50 border-purple-300"
                                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={partitionColumns.includes(col.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPartitionColumns([
                                      ...partitionColumns,
                                      col.name,
                                    ]);
                                  } else {
                                    setPartitionColumns(
                                      partitionColumns.filter(
                                        (c) => c !== col.name
                                      )
                                    );
                                  }
                                }}
                                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700 truncate">
                                {col.name}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 ml-auto">
                                {col.type || "string"}
                              </span>
                            </label>
                          ))}
                        </div>
                        {partitionColumns.length > 0 && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <p className="text-xs text-purple-700 font-medium mb-1">
                              선택한 파티션 컬럼:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {partitionColumns.map((col, idx) => (
                                <span
                                  key={col}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs"
                                >
                                  <span className="text-purple-400 text-[10px]">
                                    {idx + 1}.
                                  </span>
                                  {col}
                                  <button
                                    onClick={() =>
                                      setPartitionColumns(
                                        partitionColumns.filter(
                                          (c) => c !== col
                                        )
                                      )
                                    }
                                    className="hover:text-purple-900 ml-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        사용할 수 있는 컬럼이 없습니다. 가공 설정 단계에서 출력
                        스키마를 먼저 정의해주세요.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
