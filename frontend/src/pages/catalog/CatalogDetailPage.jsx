import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  Database,
  Save,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Maximize2,
  ShieldCheck,
  Lock,
  GitBranch,
  Eye,
  Table2,
  Layers,
  Clock,
  User,
  Server,
  ArrowRight,
  FileSearch,
} from "lucide-react";

import { SchemaNode } from "../domain/components/schema-node/SchemaNode";
import { catalogAPI } from "../../services/catalog";
import { CatalogHeader } from "./components/CatalogHeader";
import { CatalogSidebar } from "./components/CatalogSidebar";

const nodeTypes = {
  custom: SchemaNode,
  Table: SchemaNode,
  Topic: SchemaNode,
};

const DEFAULT_EDGE_STYLE = { stroke: "#f97316", strokeWidth: 2 };
const DIM_EDGE_STYLE = { opacity: 0.15 };
const HIGHLIGHT_EDGE_STYLE = { stroke: "#f97316", strokeWidth: 3 };
const ASKLAKE_DEMO_DATASET_ID = "ds-commerce-revenue-gold";

const isAskLakeDemoDataset = (item) =>
  item?.id === ASKLAKE_DEMO_DATASET_ID ||
  item?.name === "월별 상품 매출 Gold Dataset" ||
  item?.created_from_pipeline_demo ||
  (item?.layer === "gold" && item?.tags?.includes("revenue"));

const defaultGoldPreviewRows = [
  {
    month: "2026-04",
    product_name: "러닝화 Pro",
    category: "Shoes",
    revenue: "49,000,000",
    order_count: 910,
    avg_order_amount: "53,846",
  },
  {
    month: "2026-05",
    product_name: "트레이닝 셋업",
    category: "Apparel",
    revenue: "58,000,000",
    order_count: 1040,
    avg_order_amount: "55,769",
  },
  {
    month: "2026-06",
    product_name: "러닝화 Pro",
    category: "Shoes",
    revenue: "64,000,000",
    order_count: 1120,
    avg_order_amount: "57,143",
  },
];

function GoldDatasetShowcase({ catalogItem }) {
  const navigate = useNavigate();
  const [showcaseTab, setShowcaseTab] = useState("lineage");
  const previewRows = catalogItem.preview_rows || defaultGoldPreviewRows;
  const quality = catalogItem.quality || {
    missing_rate: "0.00%",
    duplicate_count: 0,
    schema_status: "안정적",
  };

  const tabs = [
    { id: "lineage", label: "리니지(데이터 계보)", icon: GitBranch },
    { id: "quality", label: "품질 검사 리포트", icon: ShieldCheck },
    { id: "preview", label: "데이터 미리보기(보안)", icon: Eye },
  ];

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              onClick={() => navigate("/catalog")}
              className="mt-1 rounded-lg p-2 transition-colors hover:bg-gray-100"
              aria-label="카탈로그로 돌아가기"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div className="flex min-w-0 gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-keep text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                    {catalogItem.name}
                  </h1>
                  <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                    NEW
                  </span>
                </div>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
                  PostgreSQL 주문 거래와 MongoDB 상품 카탈로그를 조인해 만든 커머스 매출 분석용 데이터셋입니다.
                  AI Query와 대시보드에서 월별 매출과 주문 수를 바로 분석할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
              <ShieldCheck className="h-4 w-4" />
              품질 {catalogItem.quality_score ?? 100}%
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              <Lock className="h-4 w-4" />
              {catalogItem.permission_label || "마케터 권한 적용"}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 md:grid-cols-3">
          <div className="flex min-w-0 items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate">소유자 {catalogItem.owner || "데이터 엔지니어링 팀"}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate">마지막 갱신 3분 전 (정상)</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Server className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate">연결 소스 PostgreSQL, MongoDB</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-x-auto border-b border-gray-200">
            <div className="flex min-w-max gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = showcaseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setShowcaseTab(tab.id)}
                    className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-blue-600 text-blue-700"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {showcaseTab === "lineage" && (
            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-900">데이터 흐름 추적</h2>
                <p className="mt-1 text-sm text-gray-500">
                  원본 데이터가 어떤 변환을 거쳐 Gold Dataset으로 등록되는지 보여줍니다.
                </p>
              </div>
              <div className="overflow-x-auto">
                <div className="grid min-w-[820px] grid-cols-[1fr_48px_1fr_48px_1fr] items-center gap-3">
                  <div className="space-y-3">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                        <Database className="h-4 w-4" />
                        PostgreSQL 주문 거래
                      </div>
                      <p className="mt-2 text-xs leading-5 text-blue-800">
                        결제 완료 주문, 상품 ID, 주문 금액, 주문 시각 포함
                      </p>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-green-900">
                        <Layers className="h-4 w-4" />
                        MongoDB 상품 카탈로그
                      </div>
                      <p className="mt-2 text-xs leading-5 text-green-800">
                        상품명, 카테고리, 브랜드, 기준 가격 메타데이터 포함
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="mx-auto h-6 w-6 text-gray-400" />
                  <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
                      <GitBranch className="h-4 w-4" />
                      조인 및 비식별 처리
                    </div>
                    <ul className="mt-3 space-y-2 text-xs leading-5 text-purple-800">
                      <li>product_id 기준으로 주문과 상품 카탈로그 조인</li>
                      <li>결제 완료 주문만 분석 대상으로 필터링</li>
                      <li>월별 매출, 주문 수, 평균 주문액 집계</li>
                    </ul>
                  </div>
                  <ArrowRight className="mx-auto h-6 w-6 text-gray-400" />
                  <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-green-900">
                      <Table2 className="h-4 w-4" />
                      Gold Dataset
                    </div>
                    <p className="mt-2 text-xs leading-5 text-green-800">
                      월별 상품 매출 테이블로 카탈로그에 등록되어 마케터와 분석가가 바로 탐색할 수 있습니다.
                    </p>
                    <p className="mt-3 rounded bg-white/70 px-2 py-1 font-mono text-xs text-green-900">
                      s3://asklake/gold/monthly_product_sales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showcaseTab === "quality" && (
            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-900">파이프라인 품질 검증 결과</h2>
                <p className="mt-1 text-sm text-gray-500">
                  사용자가 이 데이터셋을 분석에 써도 되는지 빠르게 판단할 수 있게 핵심 지표만 보여줍니다.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
                  <Check className="mx-auto h-7 w-7 text-green-600" />
                  <p className="mt-3 text-sm font-semibold text-gray-600">결측률 (Missing Value)</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{quality.missing_rate || "0.00%"}</p>
                  <p className="mt-1 text-xs text-green-700">허용 기준 통과</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
                  <Check className="mx-auto h-7 w-7 text-green-600" />
                  <p className="mt-3 text-sm font-semibold text-gray-600">중복 레코드</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{quality.duplicate_count ?? 0}건</p>
                  <p className="mt-1 text-xs text-green-700">1.2억 건 기준</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
                  <Check className="mx-auto h-7 w-7 text-green-600" />
                  <p className="mt-3 text-sm font-semibold text-gray-600">스키마 변경</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{quality.schema_status || "안정적"}</p>
                  <p className="mt-1 text-xs text-green-700">예상 컬럼 유지</p>
                </div>
              </div>
            </div>
          )}

          {showcaseTab === "preview" && (
            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">데이터 미리보기 (분석가 권한)</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    상품별 월간 매출과 주문 수가 분석 가능한 집계 형태로 표시됩니다.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-gray-600">
                  <FileSearch className="h-4 w-4" />
                  SELECT * FROM gold_monthly_product_sales LIMIT 3;
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-[760px] w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">월</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">상품명</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">카테고리</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">매출</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">주문 수</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">평균 주문액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {previewRows.map((row) => (
                      <tr key={`${row.month}-${row.product_name}`}>
                        <td className="px-4 py-3 font-mono text-gray-600">{row.month}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{row.product_name}</td>
                        <td className="px-4 py-3 text-gray-600">{row.category}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-700">{row.revenue}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{row.order_count}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{row.avg_order_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                원본 주문 단위 데이터는 데이터 소스와 Silver Dataset에서 확인하고, Gold Dataset은 분석용 집계 결과만 제공합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getColumnName = (col) =>
  typeof col === "string"
    ? col
    : col?.name || col?.key || col?.field || "unknown";

const getColumns = (data = {}) =>
  data.columns || data.schema || data.inputSchema || [];

const normalizeNodes = (nodes = []) =>
  nodes.map((node, idx) => {
    const data = node.data || {};
    return {
      ...node,
      type: node.type || "custom",
      position: node.position || { x: 100 + idx * 250, y: 100 },
      data: {
        ...data, // Preserve all existing data fields including description
        columns: data.columns || getColumns(data), // Only set columns if not already present
      },
    };
  });

const buildNodesFromExecution = (execution) => {
  const nodes = [];
  const lanes = { source: 100, transform: 450, target: 800 };
  const yGap = 150;
  const addNodes = (items = [], category) => {
    items.forEach((item, idx) => {
      const nodeColumns = item.schema || item.config?.columns || [];
      nodes.push({
        id: item.nodeId,
        type: "custom",
        position: { x: lanes[category], y: 100 + idx * yGap },
        data: {
          label: item.config?.name || item.type || item.nodeId,
          name: item.config?.name || item.nodeId,
          platform: item.config?.platform || category,
          columns: nodeColumns,
          nodeCategory: category,
          inputSchema: item.config?.inputSchema,
          description: item.config?.description || item.description || null,
        },
      });
    });
  };

  addNodes(execution?.sources, "source");
  addNodes(execution?.transforms, "transform");
  addNodes(execution?.targets, "target");

  return nodes;
};

const buildEdgesFromExecution = (execution) => {
  const edges = [];
  const allNodes = [
    ...(execution?.sources || []),
    ...(execution?.transforms || []),
    ...(execution?.targets || []),
  ];
  allNodes.forEach((node) => {
    (node.inputNodeIds || []).forEach((sourceId) => {
      edges.push({
        id: `edge-${sourceId}-${node.nodeId}`,
        source: sourceId,
        target: node.nodeId,
        type: "default",
        animated: true,
        style: DEFAULT_EDGE_STYLE,
      });
    });
  });
  return edges;
};

// Mark nodes that have no outgoing edges as final targets
const markFinalTargets = (nodes, edges) => {
  const nodesWithOutgoing = new Set(edges.map(e => e.source));
  return nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      isFinalTarget: !nodesWithOutgoing.has(node.id),
    },
  }));
};

const buildColumnEdges = (baseEdges = [], nodesById) => {
  const edges = [];

  // Global tracking: which target columns have been connected with exact match
  // Key: `${targetNodeId}:${columnNameLower}`
  const usedTargetColumns = new Set();

  baseEdges.forEach((edge, edgeIndex) => {
    const sourceNode = nodesById.get(edge.source);
    const targetNode = nodesById.get(edge.target);
    const sourceCols = getColumns(sourceNode?.data || {});
    const targetCols = getColumns(targetNode?.data || {});

    // Build a list of target columns (not a Map, to allow duplicates)
    const targetColList = targetCols.map((col) => ({
      name: getColumnName(col),
      nameLower: getColumnName(col).toLowerCase(),
      col: col,
    }));

    const baseId = edge.id || `edge-${edgeIndex}-${edge.source}-${edge.target}`;
    let matched = 0;

    // Get source node name for pattern matching (e.g., "t_order")
    const sourceNodeName = sourceNode?.data?.name || sourceNode?.data?.label || edge.source;
    const sourcePrefix = sourceNodeName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_';

    sourceCols.forEach((col) => {
      const sourceName = getColumnName(col);
      const sourceNameLower = sourceName.toLowerCase();

      let bestMatch = null;
      let matchType = null; // 'exact' or 'pattern'

      // Find the BEST matching target column for this source column
      // Priority: exact match (if not used) > pattern match
      targetColList.forEach((targetItem, targetIdx) => {
        const targetKey = `${edge.target}:${targetItem.nameLower}`;

        // Exact match - highest priority, but only if not already used by another source
        if (targetItem.nameLower === sourceNameLower) {
          if (!usedTargetColumns.has(targetKey)) {
            if (!bestMatch || matchType !== 'exact') {
              bestMatch = { targetItem, targetIdx };
              matchType = 'exact';
            }
          }
        }
        // Pattern match - lower priority, only if no exact match found
        else if (targetItem.nameLower === `${sourcePrefix}${sourceNameLower}`) {
          if (!bestMatch) {
            bestMatch = { targetItem, targetIdx };
            matchType = 'pattern';
          }
        }
      });

      // Create edge only for the best match
      if (bestMatch) {
        matched += 1;
        const targetName = bestMatch.targetItem.name;
        const targetKey = `${edge.target}:${bestMatch.targetItem.nameLower}`;

        // Mark this target column as used if it's an exact match
        if (matchType === 'exact') {
          usedTargetColumns.add(targetKey);
        }


        edges.push({
          ...edge,
          id: `${baseId}:${sourceName}:${targetName}:${bestMatch.targetIdx}`,
          sourceHandle: `source-col:${edge.source}:${sourceName}`,
          targetHandle: `target-col:${edge.target}:${targetName}`,
          type: edge.type || "default",
          animated: edge.animated ?? true,
          style: edge.style || DEFAULT_EDGE_STYLE,
        });
      }
    });

    if (matched === 0) {
      // Create edge without handles to connect nodes directly (not columns)
      const { sourceHandle, targetHandle, ...edgeWithoutHandles } = edge;
      edges.push({
        ...edgeWithoutHandles,
        id: baseId,
        type: edge.type || "default",
        animated: edge.animated ?? true,
        style: edge.style || DEFAULT_EDGE_STYLE,
      });
    }
  });

  return edges;
};

const parseHandle = (handleId) => {
  if (!handleId) return null;
  const [kind, nodeId, ...rest] = handleId.split(":");
  if (!kind || !nodeId || rest.length === 0) return null;
  return { nodeId, columnName: rest.join(":") };
};

const buildGraph = (lineageData) => {
  if (!lineageData) {
    return { nodes: [], edges: [] };
  }

  let baseNodes = lineageData.nodes || [];
  let baseEdges = lineageData.edges || [];

  if (baseNodes.length === 0 && lineageData.sources) {
    baseNodes = buildNodesFromExecution(lineageData);
    baseEdges = buildEdgesFromExecution(lineageData);
  }

  const normalizedNodes = normalizeNodes(baseNodes);
  const nodesWithTargetFlag = markFinalTargets(normalizedNodes, baseEdges);
  const nodesById = new Map(nodesWithTargetFlag.map((node) => [node.id, node]));
  const edges = buildColumnEdges(baseEdges, nodesById);

  return { nodes: nodesWithTargetFlag, edges };
};

function CatalogDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [catalogItem, setCatalogItem] = useState(
    location.state?.catalogItem || null
  );
  const [lineageData, setLineageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [highlightedColumn, setHighlightedColumn] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, getNode, zoomIn, zoomOut } = useReactFlow();

  // Layout save state
  const [saveStatus, setSaveStatus] = useState("saved"); // "saving" | "saved" | "error"
  const [savedLayout, setSavedLayout] = useState(null); // Store loaded layout
  const saveTimeoutRef = useRef(null);
  const hasLoadedLayoutRef = useRef(false);
  const hasInitialFitViewRef = useRef(false);

  // Navigate to a specific node
  const handleNavigateToNode = useCallback(
    (nodeId) => {
      const node = getNode(nodeId);
      if (node) {
        setSelectedNode(node);
        setSidebarOpen(true);
        setActiveTab("info"); // Switch to Info tab when navigating to a node

        // Mark this node as selected and deselect others
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === nodeId,
          }))
        );

        // Smooth cinematic camera movement to the node
        setTimeout(() => {
          fitView({
            nodes: [{ id: nodeId }],
            duration: 800, // Longer duration for smoother animation
            padding: 0.8, // More padding to zoom in closer
            maxZoom: 1.5, // Allow closer zoom
          });
        }, 50); // Small delay to ensure state updates
      }
    },
    [getNode, fitView, setNodes]
  );

  useEffect(() => {
    let isActive = true;

    const loadCatalog = async () => {
      try {
        const dataset = await catalogAPI.getDataset(id);
        if (!isActive) return;
        setCatalogItem(dataset);
      } catch (error) {
        console.error("Failed to load catalog dataset", error);
      }
    };

    const loadLineage = async () => {
      try {
        const lineage = await catalogAPI.getLineage(id);
        if (!isActive) return;
        setLineageData(lineage);
      } catch (error) {
        console.error("Failed to load catalog lineage", error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadCatalog();
    loadLineage();

    return () => {
      isActive = false;
    };
  }, [id]);

  const graph = useMemo(
    () => buildGraph(lineageData || catalogItem),
    [lineageData, catalogItem]
  );

  // Load saved layout once
  useEffect(() => {
    const loadLayout = async () => {
      if (!id || hasLoadedLayoutRef.current) return;

      try {
        const response = await catalogAPI.getLayout(id);
        if (response.layout && response.layout.nodes) {
          setSavedLayout(response.layout);
        }
        hasLoadedLayoutRef.current = true;
      } catch (error) {
        console.log("No saved layout found or error loading layout:", error);
        hasLoadedLayoutRef.current = true;
      }
    };

    loadLayout();
  }, [id]);

  // Reset fitView flag when dataset changes
  useEffect(() => {
    hasInitialFitViewRef.current = false;
  }, [id]);

  // Apply saved layout to graph nodes
  useEffect(() => {
    // Apply graph nodes with saved positions if available
    if (savedLayout && savedLayout.nodes && savedLayout.nodes.length > 0) {
      const nodesWithSavedPositions = graph.nodes.map((node) => {
        const savedNode = savedLayout.nodes.find((n) => n.id === node.id);
        if (savedNode && savedNode.position) {
          return {
            ...node,
            position: savedNode.position,
          };
        }
        return node;
      });
      setNodes(nodesWithSavedPositions);
    } else {
      // No saved layout, use default positions
      setNodes(graph.nodes);
    }

    setEdges(graph.edges);
  }, [graph, savedLayout, setNodes, setEdges]);

  // Initial fitView after nodes are loaded
  useEffect(() => {
    if (nodes.length > 0 && !hasInitialFitViewRef.current) {
      // Wait a bit for nodes to render, then fit view
      setTimeout(() => {
        fitView({
          padding: 0.2, // 20% padding around nodes
          duration: 800, // Smooth animation
          maxZoom: 1.0, // Don't zoom in too much
        });
        hasInitialFitViewRef.current = true;
      }, 100);
    }
  }, [nodes, fitView]);

  // Save layout with debounce
  const saveLayout = useCallback(
    async (nodesToSave) => {
      if (!id) return;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus("saving");

      // Debounce: wait 1 second after last change before saving
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const layout = {
            nodes: nodesToSave.map((node) => ({
              id: node.id,
              position: node.position,
            })),
          };

          await catalogAPI.saveLayout(id, layout);
          setSavedLayout(layout); // Update saved layout state
          setSaveStatus("saved");

          // Reset to "saved" after 2 seconds
          setTimeout(() => {
            setSaveStatus("saved");
          }, 2000);
        } catch (error) {
          console.error("Failed to save layout:", error);
          setSaveStatus("error");
        }
      }, 1000);
    },
    [id]
  );

  // Custom onNodesChange handler that triggers save
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Check if any position changes occurred
      const hasPositionChange = changes.some(
        (change) => change.type === "position" && change.dragging === false
      );

      if (hasPositionChange && hasLoadedLayoutRef.current) {
        // Get current nodes after change
        setNodes((currentNodes) => {
          saveLayout(currentNodes);
          return currentNodes;
        });
      }
    },
    [onNodesChange, saveLayout, setNodes]
  );

  // Smooth zoom controls
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 400 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 400 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({
      padding: 0.2,
      duration: 600,
      maxZoom: 1.0,
    });
  }, [fitView]);

  const handleColumnClick = useCallback((nodeId, columnName) => {
    setHighlightedColumn((prev) => {
      if (prev && prev.nodeId === nodeId && prev.columnName === columnName) {
        return null;
      }
      return { nodeId, columnName };
    });
  }, []);

  const { displayNodes, displayEdges } = useMemo(() => {
    if (!highlightedColumn) {
      return {
        displayNodes: nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onColumnClick: handleColumnClick,
            dimmed: false,
            highlighted: false,
            activeColumnName: null,
            relatedColumnNames: null,
          },
        })),
        displayEdges: edges,
      };
    }

    const relatedEdgeIds = new Set();
    const relatedNodeIds = new Set([highlightedColumn.nodeId]);
    const relatedColumnsByNode = new Map();

    const registerColumn = (nodeId, columnName) => {
      if (!nodeId || !columnName) return;
      const key = columnName.toLowerCase();
      if (!relatedColumnsByNode.has(nodeId)) {
        relatedColumnsByNode.set(nodeId, new Set());
      }
      relatedColumnsByNode.get(nodeId).add(key);
    };

    const edgesWithIds = edges.map((edge, index) => ({
      edge,
      edgeId:
        edge.id ||
        `edge-${index}-${edge.source}-${edge.target}-${edge.sourceHandle}-${edge.targetHandle}`,
      sourceInfo: parseHandle(edge.sourceHandle),
      targetInfo: parseHandle(edge.targetHandle),
    }));

    const adjacency = new Map();
    const keyFor = (info) =>
      info ? `${info.nodeId}::${info.columnName.toLowerCase()}` : null;
    const addAdjacency = (from, to, edgeId) => {
      if (!from || !to) return;
      if (!adjacency.has(from)) {
        adjacency.set(from, []);
      }
      adjacency.get(from).push({ to, edgeId });
    };

    edgesWithIds.forEach(({ edgeId, sourceInfo, targetInfo }) => {
      const sourceKey = keyFor(sourceInfo);
      const targetKey = keyFor(targetInfo);
      addAdjacency(sourceKey, targetKey, edgeId);
      addAdjacency(targetKey, sourceKey, edgeId);
    });

    const startKey = `${highlightedColumn.nodeId}::${highlightedColumn.columnName.toLowerCase()}`;
    const visited = new Set();
    const queue = [startKey];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current)) {
        continue;
      }
      visited.add(current);
      const [nodeId, columnKey] = current.split("::");
      relatedNodeIds.add(nodeId);
      registerColumn(nodeId, columnKey);

      const neighbors = adjacency.get(current) || [];
      neighbors.forEach(({ to, edgeId }) => {
        relatedEdgeIds.add(edgeId);
        if (to && !visited.has(to)) {
          queue.push(to);
        }
      });
    }

    edgesWithIds.forEach(({ edgeId, edge, sourceInfo, targetInfo }) => {
      if (!relatedEdgeIds.has(edgeId)) {
        return;
      }
      relatedNodeIds.add(edge.source);
      relatedNodeIds.add(edge.target);
      if (sourceInfo) registerColumn(sourceInfo.nodeId, sourceInfo.columnName);
      if (targetInfo) registerColumn(targetInfo.nodeId, targetInfo.columnName);
    });

    if (!relatedColumnsByNode.has(highlightedColumn.nodeId)) {
      registerColumn(highlightedColumn.nodeId, highlightedColumn.columnName);
    }

    const displayNodes = nodes.map((node) => {
      const relatedColumns = relatedColumnsByNode.get(node.id);
      const relatedColumnNames = relatedColumns
        ? Array.from(relatedColumns)
        : null;
      const isRelated = relatedNodeIds.has(node.id);
      const isActive = highlightedColumn.nodeId === node.id;

      return {
        ...node,
        data: {
          ...node.data,
          onColumnClick: handleColumnClick,
          dimmed: !isRelated,
          highlighted: isRelated,
          activeColumnName: isActive ? highlightedColumn.columnName : null,
          relatedColumnNames,
        },
      };
    });

    const displayEdges = edgesWithIds.map(({ edge, edgeId }) => {
      const isRelated = relatedEdgeIds.has(edgeId);
      const edgeStyle = isRelated ? HIGHLIGHT_EDGE_STYLE : DIM_EDGE_STYLE;
      return {
        ...edge,
        id: edgeId,
        style: { ...edge.style, ...edgeStyle },
        animated: isRelated,
      };
    });

    return { displayNodes, displayEdges };
  }, [edges, handleColumnClick, highlightedColumn, nodes]);

  // If no catalog item in state, redirect back
  if (!catalogItem && !loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">카탈로그 항목을 찾을 수 없습니다</p>
          <button
            onClick={() => navigate("/catalog")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            카탈로그로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!catalogItem) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  if (isAskLakeDemoDataset(catalogItem)) {
    return <GoldDatasetShowcase catalogItem={catalogItem} />;
  }

  let targetPath =
    typeof catalogItem.target === "string"
      ? catalogItem.target
      : catalogItem.destination?.path || catalogItem.target?.path || "-";

  if (targetPath !== "-" && catalogItem.name && !targetPath.endsWith(catalogItem.name)) {
    if (!targetPath.endsWith("/")) {
      targetPath += "/";
    }
    targetPath += catalogItem.name;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <CatalogHeader catalogItem={catalogItem} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lineage Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(event, node) => {
              setSelectedNode(node);
              setSidebarOpen(true); // Auto-open sidebar when node is clicked
            }}
            onPaneClick={() => {
              setSelectedNode(null);
              setHighlightedColumn(null);
            }}
            nodeTypes={nodeTypes}
            minZoom={0.1}
            maxZoom={1.0}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            panOnScroll={false}
            className="bg-gray-50"
          >
            {/* Custom Smooth Controls */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
                title="확대"
              >
                <Plus className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
                title="축소"
              >
                <Minus className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={handleFitView}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
                title="화면에 맞추기"
              >
                <Maximize2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            <MiniMap
              nodeColor={(node) => {
                if (node.id.startsWith("source")) return "#3B82F6";
                if (node.id.startsWith("target")) return "#F97316";
                return "#8B5CF6";
              }}
              className="bg-white border border-gray-200 !bottom-4 !right-4"
              style={{ width: 150, height: 100 }}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="#d1d5db"
            />

            {/* Save Status Indicator */}
            <div className="absolute top-4 right-4 z-10">
              {saveStatus === "saving" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700 font-medium">레이아웃 저장 중...</span>
                </div>
              )}
              {saveStatus === "saved" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg shadow-sm animate-fade-in">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">레이아웃 저장됨</span>
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">저장 실패</span>
                </div>
              )}
            </div>
          </ReactFlow>
        </div>

        <CatalogSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          catalogItem={catalogItem}
          targetPath={targetPath}
          selectedNode={selectedNode}
          lineageData={lineageData}
          onNavigateToNode={handleNavigateToNode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}

export default function CatalogDetailPage() {
  return (
    <ReactFlowProvider>
      <CatalogDetailContent />
    </ReactFlowProvider>
  );
}
