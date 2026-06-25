import { useCallback, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Play,
  Pause,
  Plus,
  Columns,
  Filter,
  ArrowRightLeft,
  GitMerge,
  BarChart3,
  ArrowUpDown,
  Combine,
  Archive,
  Download,
  Loader2,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { DeletionEdge } from "../domain/components/CustomEdges";
import { SiPostgresql, SiMongodb, SiApachekafka } from "@icons-pack/react-simple-icons";
import { useToast } from "../../components/common/Toast";
import "./etl_job.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import RDBSourcePropertiesPanel from "../../components/etl/RDBSourcePropertiesPanel";
import MongoDBSourcePropertiesPanel from "../../components/etl/MongoDBSourcePropertiesPanel";
import TransformPropertiesPanel from "../../components/etl/TransformPropertiesPanel";
import S3TransformPanel from "../../components/etl/S3TransformPanel";
import S3TargetPropertiesPanel from "../../components/etl/S3TargetPropertiesPanel";
import JobDetailsPanel from "../../components/etl/JobDetailsPanel";
import SchedulesPanel from "../../components/etl/SchedulesPanel";
import { applyTransformToSchema } from "../../utils/schemaTransforms";
import DatasetNode from "../../components/common/nodes/DatasetNode";
import { SchemaNode } from "../domain/components/schema-node/SchemaNode";
import DomainImportModal from "../domain/components/DomainImportModal";
import { RightSidebar } from "../domain/components/RightSideBar/RightSidebar";
import { SidebarToggle } from "../domain/components/RightSideBar/SidebarToggle";
import { useMetadataUpdate } from "../../hooks/useMetadataUpdate";
import { saveScheduleToBackend, convertNodesToApiFormat, utcToLocalDatetimeString } from "../../utils/etl_job";

const initialNodes = [];

const initialEdges = [];

const ASKLAKE_DEMO_DATASET_ID = "ds-commerce-revenue-gold";
const IS_FRONTEND_ONLY = import.meta.env.VITE_FRONTEND_ONLY !== "false";

const askLakeDemoSchemas = {
  orders: [
    { key: "order_id", name: "order_id", type: "VARCHAR" },
    { key: "user_id", name: "user_id", type: "VARCHAR" },
    { key: "product_id", name: "product_id", type: "VARCHAR" },
    { key: "order_amount", name: "order_amount", type: "NUMERIC" },
    { key: "order_status", name: "order_status", type: "VARCHAR" },
    { key: "ordered_at", name: "ordered_at", type: "TIMESTAMP" },
  ],
  productCatalog: [
    { key: "product_id", name: "product_id", type: "VARCHAR" },
    { key: "product_name", name: "product_name", type: "VARCHAR" },
    { key: "category", name: "category", type: "VARCHAR" },
    { key: "brand", name: "brand", type: "VARCHAR" },
    { key: "list_price", name: "list_price", type: "NUMERIC" },
    { key: "updated_at", name: "updated_at", type: "TIMESTAMP" },
  ],
  s3Events: [
    { key: "event_id", name: "event_id", type: "VARCHAR" },
    { key: "order_id", name: "order_id", type: "VARCHAR" },
    { key: "product_id", name: "product_id", type: "VARCHAR" },
    { key: "event_type", name: "event_type", type: "VARCHAR" },
    { key: "adjustment_amount", name: "adjustment_amount", type: "NUMERIC" },
    { key: "event_time", name: "event_time", type: "TIMESTAMP" },
  ],
  gold: [
    { key: "month", name: "month", type: "VARCHAR" },
    { key: "product_id", name: "product_id", type: "VARCHAR" },
    { key: "product_name", name: "product_name", type: "VARCHAR" },
    { key: "category", name: "category", type: "VARCHAR" },
    { key: "revenue", name: "revenue", type: "NUMERIC" },
    { key: "order_count", name: "order_count", type: "INTEGER" },
    { key: "avg_order_amount", name: "avg_order_amount", type: "NUMERIC" },
  ],
};

const askLakeDemoEdges = [
  {
    id: "asklake-edge-postgres-bronze",
    source: "asklake-source-postgres",
    target: "asklake-bronze-orders",
    type: "deletion",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-mongodb-bronze",
    source: "asklake-source-mongodb",
    target: "asklake-bronze-products",
    type: "deletion",
    animated: true,
    style: { stroke: "#47a248", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-bronze-orders-silver",
    source: "asklake-bronze-orders",
    target: "asklake-silver-orders",
    type: "deletion",
    animated: true,
    style: { stroke: "#60a5fa", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-bronze-products-silver",
    source: "asklake-bronze-products",
    target: "asklake-silver-products",
    type: "deletion",
    animated: true,
    style: { stroke: "#22c55e", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-s3-bronze",
    source: "asklake-source-s3",
    target: "asklake-bronze-events",
    type: "deletion",
    animated: true,
    style: { stroke: "#f97316", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-bronze-events-silver",
    source: "asklake-bronze-events",
    target: "asklake-silver-events",
    type: "deletion",
    animated: true,
    style: { stroke: "#fb923c", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-silver-orders-join",
    source: "asklake-silver-orders",
    target: "asklake-transform-product-join",
    type: "deletion",
    animated: true,
    style: { stroke: "#2563eb", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-silver-products-join",
    source: "asklake-silver-products",
    target: "asklake-transform-product-join",
    type: "deletion",
    animated: true,
    style: { stroke: "#16a34a", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-silver-events-join",
    source: "asklake-silver-events",
    target: "asklake-transform-product-join",
    type: "deletion",
    animated: true,
    style: { stroke: "#f97316", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-join-aggregate",
    source: "asklake-transform-product-join",
    target: "asklake-transform-monthly-aggregate",
    type: "deletion",
    animated: true,
    style: { stroke: "#7c3aed", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-aggregate-quality",
    source: "asklake-transform-monthly-aggregate",
    target: "asklake-transform-quality-check",
    type: "deletion",
    animated: true,
    style: { stroke: "#0f766e", strokeWidth: 2 },
  },
  {
    id: "asklake-edge-quality-gold",
    source: "asklake-transform-quality-check",
    target: "asklake-target-gold",
    type: "deletion",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 3 },
  },
];

const getDemoSourceDefaults = (sourceType) => {
  if (sourceType === "kafka") {
    return {
      sourceId: "conn-kafka",
      sourceName: "Kafka 주문 이벤트",
      subtitle: "실시간 주문 이벤트",
      tableName: "commerce.order.events",
      schema: askLakeDemoSchemas.orders,
      config: { topic: "commerce.order.events" },
    };
  }

  if (sourceType === "s3") {
    return {
      sourceId: "conn-s3",
      sourceName: "AskLake S3 Lake",
      subtitle: "order_events_raw",
      tableName: "order_events_raw",
      schema: askLakeDemoSchemas.s3Events,
      config: { bucket: "asklake", path: "bronze/order_events/" },
    };
  }

  if (sourceType === "mongodb") {
    return {
      sourceId: "conn-mongodb",
      sourceName: "커머스 MongoDB",
      subtitle: "product_catalog",
      tableName: "product_catalog",
      collectionName: "product_catalog",
      schema: askLakeDemoSchemas.productCatalog,
      config: { database: "commerce", collection: "product_catalog" },
    };
  }

  return {
    sourceId: "conn-postgres",
    sourceName: "주문 거래 PostgreSQL",
    subtitle: "orders",
    tableName: "orders",
    schema: askLakeDemoSchemas.orders,
    config: { database: "commerce", table: "orders" },
  };
};

const buildDemoSourcePayload = (source, index) => {
  const type = source?.type || (index === 1 ? "kafka" : "postgres");
  const defaults = getDemoSourceDefaults(type);

  return {
    nodeId: source?.nodeId || defaults.sourceName || `demo-source-${index + 1}`,
    type,
    connection_id: source?.connection_id || defaults.sourceId,
    config: Object.keys(source?.config || {}).length > 0 ? source.config : defaults.config,
    table: source?.table || defaults.tableName,
    collection: source?.collection || defaults.collectionName || "",
    customRegex: source?.customRegex || null,
  };
};

const defaultDemoSources = [
  buildDemoSourcePayload({ nodeId: "asklake-source-postgres", type: "postgres" }, 0),
  buildDemoSourcePayload({ nodeId: "asklake-source-mongodb", type: "mongodb" }, 1),
  buildDemoSourcePayload({ nodeId: "asklake-source-s3", type: "s3" }, 2),
];

const defaultDemoDestination = {
  nodeId: "asklake-target-gold",
  type: "s3",
  path: "s3://asklake/gold/monthly_product_sales",
  format: "parquet",
  options: { compression: "snappy" },
};

const defaultDemoTransform = {
  nodeId: "asklake-transform-product-join",
  type: "join",
  config: {
    joinKey: "product_id",
    rules: [
      { label: "product_id 기준 조인", tone: "success" },
      { label: "결제 완료 주문만 필터", tone: "success" },
      { label: "월별 매출/주문 수 집계", tone: "success" },
    ],
  },
  inputNodeIds: ["asklake-source-postgres", "asklake-source-mongodb"],
};

// 커스텀 노드 타입 정의
const nodeTypes = {
  datasetNode: DatasetNode,
  custom: SchemaNode,  // Domain style node for lineage view
  Table: SchemaNode,
  Topic: SchemaNode,
};

// Custom edge type for deletion with hover effect
const edgeTypes = {
  deletion: DeletionEdge,
};

const normalizeSourceType = (value) => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "amazon s3") return "s3";
  if (normalized === "postgresql") return "postgres";
  return normalized;
};

const getNodeSourceType = (node) => {
  return normalizeSourceType(node?.data?.sourceType || node?.data?.label);
};

const normalizeTransformTypeForSource = (sourceType, transformType) => {
  if (!sourceType || !transformType) return transformType;
  if (sourceType === "s3") {
    if (transformType === "select-fields") return "s3-select-fields";
    if (transformType === "filter") return "s3-filter";
  }
  return transformType;
};

const resolveSourceTypesForNode = (nodeId, nodes, edges) => {
  const types = new Set();
  const queue = [nodeId];
  const visited = new Set();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;
    visited.add(currentId);

    const incomingEdges = edges.filter((e) => e.target === currentId);
    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) continue;

      if (sourceNode.data?.nodeCategory === "source") {
        const sourceType = getNodeSourceType(sourceNode);
        if (sourceType) types.add(sourceType);
      } else {
        const sourceType = getNodeSourceType(sourceNode);
        if (sourceType) {
          types.add(sourceType);
        } else {
          queue.push(sourceNode.id);
        }
      }
    }
  }

  return types;
};

export default function ETLJobPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId: urlJobId } = useParams();
  const initialDatasetType = location.state?.datasetType || "source";
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [jobName, setJobName] = useState("Untitled Job");
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("source");
  const [mainTab, setMainTab] = useState("Visual"); // Top level tabs: Visual, Job details, Schedules
  const [selectedNode, setSelectedNode] = useState(null);
  const [jobDetails, setJobDetails] = useState({
    description: "",
    jobType: "batch",
    datasetType: initialDatasetType,
    glueVersion: "4.0",
    workerType: "G.1X",
    numberOfWorkers: 2,
    jobTimeout: 2880,
    maxRetries: 0,
  });
  const [schedules, setSchedules] = useState([]);
  const [jobId, setJobId] = useState(urlJobId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!urlJobId);
  const reactFlowInstance = useRef(null);
  // Track if a metadata item was clicked (to prevent clearing selection)
  const isMetadataClickRef = useRef(false);
  // 오른쪽 패널 하단에 표시할 메타데이터 아이템 (table 또는 column)
  const [selectedMetadataItem, setSelectedMetadataItem] = useState(null);
  const [isCdcActive, setIsCdcActive] = useState(false);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [streamingGroupId, setStreamingGroupId] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLineageMode, setIsLineageMode] = useState(false);
  const [lineageNodes, setLineageNodes] = useState([]);
  const [lineageEdges, setLineageEdges] = useState([]);
  // Lineage sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("summary");
  const [selectedLineageNode, setSelectedLineageNode] = useState(null);
  const [showLineageMenu, setShowLineageMenu] = useState(false);
  const [lineageActiveTab, setLineageActiveTab] = useState("transform");
  const { showToast } = useToast();
  const [demoRunState, setDemoRunState] = useState("idle"); // idle | running | complete

  // Check for target import from navigation state
  const fromTargetImport = location.state?.fromTargetImport || false;
  const startFromScratch = location.state?.startFromScratch === true;
  const pipelineStart = location.state?.pipelineStart || null;
  const isAskLakeDemo = nodes.some((node) => node.id === "asklake-source-postgres");
  const builderSections = [
    {
      title: "데이터 소스",
      description: "구축에 사용할 원본",
      stage: "sources",
      tone: "emerald",
      icon: Archive,
      items: [
        { label: "주문 거래 PostgreSQL", detail: "orders", nodeId: "asklake-source-postgres" },
        { label: "커머스 MongoDB", detail: "product_catalog", nodeId: "asklake-source-mongodb" },
        { label: "AskLake S3 Lake", detail: "order_events_raw", nodeId: "asklake-source-s3" },
      ],
    },
    {
      title: "변환 규칙",
      description: "데이터를 만드는 규칙",
      stage: "transform",
      tone: "purple",
      icon: GitMerge,
      items: [
        { label: "주문 Bronze 적재", detail: "orders 원본 보존", nodeId: "asklake-bronze-orders" },
        { label: "상품 Bronze 적재", detail: "product_catalog 원본 보존", nodeId: "asklake-bronze-products" },
        { label: "이벤트 Bronze 적재", detail: "order_events_raw 원본 보존", nodeId: "asklake-bronze-events" },
        { label: "주문 Silver 정제", detail: "결제 완료 주문 필터", nodeId: "asklake-silver-orders" },
        { label: "상품 Silver 정제", detail: "상품 마스터 컬럼 표준화", nodeId: "asklake-silver-products" },
        { label: "이벤트 Silver 정제", detail: "정산/취소 이벤트 표준화", nodeId: "asklake-silver-events" },
        { label: "product_id 기준 조인", detail: "주문 + 상품 카탈로그", nodeId: "asklake-transform-product-join" },
        { label: "월별 상품 매출 집계", detail: "매출, 주문 수, 평균 주문액 계산", nodeId: "asklake-transform-monthly-aggregate" },
      ],
    },
    {
      title: "결과 데이터셋",
      description: "카탈로그에 등록될 산출물",
      stage: "target",
      tone: "blue",
      icon: ShieldCheck,
      items: [
        { label: "월별 상품 매출 Gold Dataset", detail: "품질 검증 후 카탈로그 등록", nodeId: "asklake-target-gold" },
      ],
    },
  ];
  const builderToneClasses = {
    emerald: {
      section: "border-emerald-100 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      active: "border-emerald-300 bg-white text-emerald-800",
    },
    purple: {
      section: "border-purple-100 bg-purple-50",
      icon: "bg-purple-100 text-purple-700",
      active: "border-purple-300 bg-white text-purple-800",
    },
    blue: {
      section: "border-blue-100 bg-blue-50",
      icon: "bg-blue-100 text-blue-700",
      active: "border-blue-300 bg-white text-blue-800",
    },
  };

  const focusBuilderNode = (nodeId) => {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) return;

    setSelectedNode(node);
    setSelectedMetadataItem(null);

    setTimeout(() => {
      reactFlowInstance.current?.setCenter(node.position.x + 120, node.position.y + 80, {
        zoom: 1.05,
        duration: 220,
      });
    }, 20);
  };

  const createAskLakeDemoNodes = useCallback(() => {
    const metadataSelect = (item) => {
      isMetadataClickRef.current = true;
      setSelectedMetadataItem(item);
    };
    const deleteNode = (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
        setSelectedMetadataItem(null);
      }
    };

    return [
      {
        id: "asklake-source-postgres",
        type: "datasetNode",
        position: { x: 70, y: 95 },
        data: {
          label: "주문 거래 PostgreSQL",
          icon: SiPostgresql,
          color: "#4169E1",
          nodeCategory: "source",
          sourceType: "postgres",
          sourceId: "conn-postgres",
          sourceName: "주문 거래 PostgreSQL",
          subtitle: "orders",
          tableName: "orders",
          schema: askLakeDemoSchemas.orders,
          config: { database: "commerce", table: "orders" },
          nodeId: "asklake-source-postgres",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-source-mongodb",
        type: "datasetNode",
        position: { x: 70, y: 255 },
        data: {
          label: "커머스 MongoDB",
          icon: SiMongodb,
          color: "#47a248",
          nodeCategory: "source",
          sourceType: "mongodb",
          sourceId: "conn-mongodb",
          sourceName: "커머스 MongoDB",
          subtitle: "product_catalog",
          tableName: "product_catalog",
          collectionName: "product_catalog",
          schema: askLakeDemoSchemas.productCatalog,
          config: { database: "commerce", collection: "product_catalog" },
          nodeId: "asklake-source-mongodb",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-source-s3",
        type: "datasetNode",
        position: { x: 70, y: 415 },
        data: {
          label: "AskLake S3 Lake",
          icon: FileText,
          color: "#f97316",
          nodeCategory: "source",
          sourceType: "s3",
          sourceId: "conn-s3",
          sourceName: "AskLake S3 Lake",
          subtitle: "order_events_raw",
          tableName: "order_events_raw",
          schema: askLakeDemoSchemas.s3Events,
          config: { bucket: "asklake", path: "bronze/order_events/" },
          nodeId: "asklake-source-s3",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-bronze-orders",
        type: "datasetNode",
        position: { x: 390, y: 80 },
        data: {
          label: "주문 원본 Bronze",
          icon: Archive,
          color: "#3b82f6",
          nodeCategory: "transform",
          transformType: "landing",
          sourceType: "postgres",
          inputSchemas: [askLakeDemoSchemas.orders],
          inputSchema: askLakeDemoSchemas.orders,
          schema: askLakeDemoSchemas.orders,
          subtitle: "Raw landing",
          rules: [
            { label: "orders 원본 스냅샷 보존", tone: "success" },
            { label: "partition_date 기준 적재", tone: "success" },
          ],
          nodeId: "asklake-bronze-orders",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-bronze-products",
        type: "datasetNode",
        position: { x: 390, y: 255 },
        data: {
          label: "상품 원본 Bronze",
          icon: Archive,
          color: "#47a248",
          nodeCategory: "transform",
          transformType: "landing",
          sourceType: "mongodb",
          inputSchemas: [askLakeDemoSchemas.productCatalog],
          inputSchema: askLakeDemoSchemas.productCatalog,
          schema: askLakeDemoSchemas.productCatalog,
          subtitle: "Raw landing",
          rules: [
            { label: "product_catalog 원본 문서 보존", tone: "success" },
            { label: "스키마 변경 이력 기록", tone: "success" },
          ],
          nodeId: "asklake-bronze-products",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-bronze-events",
        type: "datasetNode",
        position: { x: 390, y: 430 },
        data: {
          label: "이벤트 원본 Bronze",
          icon: Archive,
          color: "#f97316",
          nodeCategory: "transform",
          transformType: "landing",
          sourceType: "s3",
          inputSchemas: [askLakeDemoSchemas.s3Events],
          inputSchema: askLakeDemoSchemas.s3Events,
          schema: askLakeDemoSchemas.s3Events,
          subtitle: "Raw landing",
          rules: [
            { label: "order_events_raw 원본 보존", tone: "success" },
            { label: "이벤트 파티션 적재", tone: "success" },
          ],
          nodeId: "asklake-bronze-events",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-silver-orders",
        type: "datasetNode",
        position: { x: 700, y: 80 },
        data: {
          label: "주문 거래 Silver",
          icon: Filter,
          color: "#2563eb",
          nodeCategory: "transform",
          transformType: "filter",
          sourceType: "postgres",
          inputSchemas: [askLakeDemoSchemas.orders],
          inputSchema: askLakeDemoSchemas.orders,
          schema: askLakeDemoSchemas.orders,
          subtitle: "Clean orders",
          rules: [
            { label: "paid 주문만 필터", tone: "success" },
            { label: "order_amount 숫자형 검증", tone: "success" },
          ],
          nodeId: "asklake-silver-orders",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-silver-products",
        type: "datasetNode",
        position: { x: 700, y: 255 },
        data: {
          label: "상품 마스터 Silver",
          icon: Columns,
          color: "#16a34a",
          nodeCategory: "transform",
          transformType: "select",
          sourceType: "mongodb",
          inputSchemas: [askLakeDemoSchemas.productCatalog],
          inputSchema: askLakeDemoSchemas.productCatalog,
          schema: askLakeDemoSchemas.productCatalog,
          subtitle: "Clean products",
          rules: [
            { label: "상품명/카테고리 표준화", tone: "success" },
            { label: "product_id 중복 제거", tone: "success" },
          ],
          nodeId: "asklake-silver-products",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-silver-events",
        type: "datasetNode",
        position: { x: 700, y: 430 },
        data: {
          label: "정산 이벤트 Silver",
          icon: Filter,
          color: "#f97316",
          nodeCategory: "transform",
          transformType: "filter",
          sourceType: "s3",
          inputSchemas: [askLakeDemoSchemas.s3Events],
          inputSchema: askLakeDemoSchemas.s3Events,
          schema: askLakeDemoSchemas.s3Events,
          subtitle: "Clean events",
          rules: [
            { label: "취소/정산 이벤트 표준화", tone: "success" },
            { label: "order_id 기준 보정 금액 검증", tone: "success" },
          ],
          nodeId: "asklake-silver-events",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-transform-product-join",
        type: "datasetNode",
        position: { x: 1030, y: 255 },
        data: {
          label: "product_id 조인",
          icon: GitMerge,
          color: "#7c3aed",
          nodeCategory: "transform",
          transformType: "join",
          sourceType: "mixed",
          inputSchemas: [askLakeDemoSchemas.orders, askLakeDemoSchemas.productCatalog, askLakeDemoSchemas.s3Events],
          inputSchema: askLakeDemoSchemas.orders,
          schema: askLakeDemoSchemas.gold,
          subtitle: "Transform",
          rules: [
            { label: "주문/상품/이벤트 Silver 조인", tone: "success" },
            { label: "정산 이벤트로 매출 보정", tone: "success" },
          ],
          transformConfig: {
            joinKey: "product_id",
            rules: [
              { label: "주문/상품/이벤트 Silver 조인", tone: "success" },
              { label: "정산 이벤트로 매출 보정", tone: "success" },
            ],
          },
          nodeId: "asklake-transform-product-join",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-transform-monthly-aggregate",
        type: "datasetNode",
        position: { x: 1340, y: 255 },
        data: {
          label: "월별 상품 매출 집계",
          icon: BarChart3,
          color: "#0f766e",
          nodeCategory: "transform",
          transformType: "aggregate",
          sourceType: "mixed",
          inputSchemas: [askLakeDemoSchemas.gold],
          inputSchema: askLakeDemoSchemas.gold,
          schema: askLakeDemoSchemas.gold,
          subtitle: "Aggregate",
          rules: [
            { label: "월별 revenue 합계", tone: "success" },
            { label: "상품별 order_count 계산", tone: "success" },
            { label: "avg_order_amount 산출", tone: "success" },
          ],
          transformConfig: {
            groupBy: ["month", "product_id", "product_name", "category"],
            rules: [
              { label: "월별 revenue 합계", tone: "success" },
              { label: "상품별 order_count 계산", tone: "success" },
              { label: "avg_order_amount 산출", tone: "success" },
            ],
          },
          nodeId: "asklake-transform-monthly-aggregate",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-transform-quality-check",
        type: "datasetNode",
        position: { x: 1650, y: 255 },
        data: {
          label: "품질 검증",
          icon: ShieldCheck,
          color: "#059669",
          nodeCategory: "transform",
          transformType: "quality",
          sourceType: "s3",
          inputSchemas: [askLakeDemoSchemas.gold],
          inputSchema: askLakeDemoSchemas.gold,
          schema: askLakeDemoSchemas.gold,
          subtitle: "Quality gate",
          rules: [
            { label: "결측률 0.00%", tone: "success" },
            { label: "중복 레코드 0건", tone: "success" },
            { label: "마케터 권한 정책 적용", tone: "success" },
          ],
          nodeId: "asklake-transform-quality-check",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
      {
        id: "asklake-target-gold",
        type: "datasetNode",
        position: { x: 1960, y: 255 },
        data: {
          label: "월별 상품 매출 Gold Dataset",
          icon: ShieldCheck,
          color: "#2563eb",
          nodeCategory: "target",
          sourceType: "s3",
          subtitle: "카탈로그 등록용 Gold 산출물",
          badges: ["Gold", "품질 100%", "마케터 권한 적용"],
          tableName: "gold_monthly_product_sales",
          schema: askLakeDemoSchemas.gold,
          s3Location: "s3://asklake/gold/monthly_product_sales",
          compressionType: "snappy",
          nodeId: "asklake-target-gold",
          onDelete: deleteNode,
          onMetadataSelect: metadataSelect,
        },
      },
    ];
  }, [selectedNode?.id, setNodes]);

  const addGuidedPipelineStep = useCallback(
    (stage) => {
      const templateNodes = createAskLakeDemoNodes();
      const nodeIdsByStage = {
        sources: ["asklake-source-postgres", "asklake-source-mongodb", "asklake-source-s3"],
        transform: [
          "asklake-source-postgres",
          "asklake-source-mongodb",
          "asklake-source-s3",
          "asklake-bronze-orders",
          "asklake-bronze-products",
          "asklake-bronze-events",
          "asklake-silver-orders",
          "asklake-silver-products",
          "asklake-silver-events",
          "asklake-transform-product-join",
          "asklake-transform-monthly-aggregate",
        ],
        target: [
          "asklake-source-postgres",
          "asklake-source-mongodb",
          "asklake-source-s3",
          "asklake-bronze-orders",
          "asklake-bronze-products",
          "asklake-bronze-events",
          "asklake-silver-orders",
          "asklake-silver-products",
          "asklake-silver-events",
          "asklake-transform-product-join",
          "asklake-transform-monthly-aggregate",
          "asklake-transform-quality-check",
          "asklake-target-gold",
        ],
      };
      const edgeIdsByStage = {
        sources: [],
        transform: [
          "asklake-edge-postgres-bronze",
          "asklake-edge-mongodb-bronze",
          "asklake-edge-s3-bronze",
          "asklake-edge-bronze-orders-silver",
          "asklake-edge-bronze-products-silver",
          "asklake-edge-bronze-events-silver",
          "asklake-edge-silver-orders-join",
          "asklake-edge-silver-products-join",
          "asklake-edge-silver-events-join",
          "asklake-edge-join-aggregate",
        ],
        target: [
          "asklake-edge-postgres-bronze",
          "asklake-edge-mongodb-bronze",
          "asklake-edge-s3-bronze",
          "asklake-edge-bronze-orders-silver",
          "asklake-edge-bronze-products-silver",
          "asklake-edge-bronze-events-silver",
          "asklake-edge-silver-orders-join",
          "asklake-edge-silver-products-join",
          "asklake-edge-silver-events-join",
          "asklake-edge-join-aggregate",
          "asklake-edge-aggregate-quality",
          "asklake-edge-quality-gold",
        ],
      };

      const nodeIds = nodeIdsByStage[stage] || nodeIdsByStage.sources;
      const edgeIds = edgeIdsByStage[stage] || [];

      setJobName((prev) =>
        prev === "Untitled Job" || prev === "새_파이프라인"
          ? "월별_상품_매출_Gold_Dataset"
          : prev
      );
      setJobDetails((prev) => ({
        ...prev,
        description:
          prev.description ||
          "PostgreSQL 주문 거래, MongoDB 상품 카탈로그, AskLake S3 이벤트를 Bronze/Silver 단계로 정제한 뒤 월별 상품 매출을 집계하는 Gold Dataset 파이프라인입니다.",
        jobType: "batch",
        datasetType: "target",
      }));
      setSchedules((prev) =>
        prev.length > 0
          ? prev
          : [
              {
                id: "guided-demo-schedule",
                name: "월별 상품 매출 집계 배치",
                cron: "demo",
                frequency: "manual",
                description: "월별 상품 매출 지표를 만드는 수동 실행 파이프라인",
                uiParams: {},
              },
            ]
      );

      setNodes((currentNodes) => {
        const currentIds = new Set(currentNodes.map((node) => node.id));
        const nodesToAdd = templateNodes.filter(
          (node) => nodeIds.includes(node.id) && !currentIds.has(node.id)
        );
        return [...currentNodes, ...nodesToAdd];
      });

      setEdges((currentEdges) => {
        const currentIds = new Set(currentEdges.map((edge) => edge.id));
        const edgesToAdd = askLakeDemoEdges.filter(
          (edge) => edgeIds.includes(edge.id) && !currentIds.has(edge.id)
        );
        return [...currentEdges, ...edgesToAdd];
      });

      const toastByStage = {
        sources: "주문 거래 PostgreSQL, 커머스 MongoDB, AskLake S3 Lake를 캔버스에 올렸습니다.",
        transform: "Bronze 적재, Silver 정제, 조인, 월별 집계 단계를 추가했습니다.",
        target: "품질 검증을 통과한 월별 상품 매출 Gold Dataset을 준비했습니다.",
      };
      showToast(toastByStage[stage] || "단계를 추가했습니다.", "success");

      setTimeout(() => {
        reactFlowInstance.current?.fitView({
          padding: 0.28,
          maxZoom: 1.0,
          duration: 400,
        });
      }, 80);
    },
    [createAskLakeDemoNodes, setEdges, setNodes, showToast]
  );

  useEffect(() => {
    if (jobDetails.jobType === "streaming" && mainTab === "Schedules") {
      setMainTab("Visual");
    }
  }, [jobDetails.jobType, mainTab]);

  useEffect(() => {
    if (!startFromScratch || urlJobId || fromTargetImport) return;

    const sourceType = normalizeSourceType(pipelineStart?.sourceType || pipelineStart?.connection?.type);
    const sourceDefaults = getDemoSourceDefaults(sourceType);
    const sourceName = pipelineStart?.connection?.name || sourceDefaults.sourceName;
    const assetName = pipelineStart?.asset?.name || sourceDefaults.tableName;
    const assetKind = pipelineStart?.asset?.kind || "Table";
    const initialSourceNodeId = `pipeline-source-${Date.now()}`;
    const initialSourceNode = pipelineStart
      ? {
          id: initialSourceNodeId,
          type: "datasetNode",
          position: { x: 250, y: 100 },
          data: {
            label: sourceName,
            icon:
              sourceType === "mongodb"
                ? SiMongodb
                : sourceType === "kafka"
                  ? SiApachekafka
                  : sourceType === "postgres"
                    ? SiPostgresql
                    : Archive,
            color:
              sourceType === "mongodb"
                ? "#47A248"
                : sourceType === "kafka"
                  ? "#f59e0b"
                  : sourceType === "postgres"
                    ? "#4169E1"
                    : "#FF9900",
            nodeCategory: "source",
            sourceType: sourceType || "postgres",
            sourceId: pipelineStart.connection?.id || sourceDefaults.sourceId,
            sourceName,
            subtitle: assetName,
            tableName: assetName,
            collectionName: sourceType === "mongodb" ? assetName : "",
            schema: sourceDefaults.schema,
            config: {
              ...(pipelineStart.connection?.config || sourceDefaults.config),
              selectedAsset: assetName,
              assetKind,
            },
            nodeId: initialSourceNodeId,
            onDelete: (nodeId) => {
              setNodes((nds) => nds.filter((n) => n.id !== nodeId));
              setSelectedNode((current) => (current?.id === nodeId ? null : current));
              setSelectedMetadataItem(null);
            },
            onMetadataSelect: (item) => {
              isMetadataClickRef.current = true;
              setSelectedMetadataItem(item);
            },
          },
        }
      : null;

    const safeAssetName = assetName.replace(/[^\w가-힣]+/g, "_").replace(/^_+|_+$/g, "");
    setJobName(safeAssetName ? `${safeAssetName}_파이프라인` : "새_파이프라인");
    setJobDetails((prev) => ({
      ...prev,
      description: pipelineStart
        ? `${sourceName}의 ${assetName} 원본에서 시작하는 파이프라인입니다.`
        : "",
      jobType: "batch",
      datasetType: "target",
    }));
    setSchedules([]);
    setNodes(initialSourceNode ? [initialSourceNode] : []);
    setEdges([]);
    setSelectedNode(initialSourceNode);
    setSelectedMetadataItem(null);
    setDemoRunState("idle");
    setActiveTab("transform");
  }, [fromTargetImport, pipelineStart, setEdges, setNodes, startFromScratch, urlJobId]);

  useEffect(() => {
    if (startFromScratch || urlJobId || nodes.length > 0 || fromTargetImport) return;

    setJobName("월별_상품_매출_Gold_Dataset");
    setJobDetails((prev) => ({
      ...prev,
      description: "PostgreSQL 주문 거래, MongoDB 상품 카탈로그, AskLake S3 이벤트를 Bronze/Silver 단계로 정제한 뒤 월별 상품 매출을 집계하는 Gold Dataset 파이프라인입니다.",
      jobType: "batch",
      datasetType: "target",
    }));
    setSchedules([
      {
        id: "asklake-demo-schedule",
        name: "월별 상품 매출 집계 배치",
        cron: "demo",
        frequency: "manual",
        description: "월별 상품 매출 지표를 만드는 수동 실행 파이프라인",
        uiParams: {},
      },
    ]);
    setNodes(createAskLakeDemoNodes());
    setEdges(askLakeDemoEdges);

    setTimeout(() => {
      reactFlowInstance.current?.fitView({ padding: 0.28, maxZoom: 1.0, duration: 500 });
    }, 120);
  }, [createAskLakeDemoNodes, fromTargetImport, nodes.length, setEdges, setNodes, urlJobId]);

  useEffect(() => {
    if (!jobId) return;
    if (jobDetails.jobType !== "streaming") {
      setIsStreamingActive(false);
      return;
    }
    fetchStreamingStatus();
  }, [jobId, jobDetails.jobType]);

  // Custom hook for metadata updates (removes duplicate code)
  const handleMetadataUpdate = useMetadataUpdate(
    selectedNode,
    setNodes,
    setSelectedNode,
    setSelectedMetadataItem
  );

  // Icon mappings (defined early so loadJob can use it)
  const iconMap = {
    // Sources
    PostgreSQL: SiPostgresql,
    MongoDB: SiMongodb,
    S3: Archive,
    // Transforms
    "Select Fields": Columns,
    Filter: Filter,
    Union: Combine,
    Map: ArrowRightLeft,
    Join: GitMerge,
    Aggregate: BarChart3,
    Sort: ArrowUpDown,
  };

  // Load job data if jobId is provided in URL
  useEffect(() => {
    if (urlJobId) {
      loadJob(urlJobId);
    }
  }, [urlJobId]);

  // Handle target import from navigation state
  useEffect(() => {
    if (fromTargetImport && location.state?.importedNodes) {
      console.log("[ETLJob] Loading from target import");
      console.log("[ETLJob] Imported nodes:", location.state.importedNodes);
      console.log("[ETLJob] Imported edges:", location.state.importedEdges);

      // Set lineage mode and data
      setIsLineageMode(true);
      setLineageNodes(location.state.importedNodes || []);
      setLineageEdges(location.state.importedEdges || []);
      setMainTab("Lineage");

      // Set job name from imported data
      if (location.state.jobName) {
        setJobName(location.state.jobName);
      }

      // Set dataset type
      if (location.state.datasetType) {
        setJobDetails(prev => ({
          ...prev,
          datasetType: location.state.datasetType
        }));
      }
    }
  }, [fromTargetImport, location.state]);

  const loadJob = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/datasets/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load job");
      }
      const data = await response.json();

      // Restore state from loaded job
      setJobName(data.name);
      setJobId(data.id);
      setJobDetails((prev) => ({
        ...prev,
        description: data.description || "",
        jobType: data.job_type || "batch",
        incremental_config: data.incremental_config || null,
      }));

      if (data.job_type === "cdc") {
        checkCdcStatus(id);
      }

      // Restore nodes and edges if they exist
      if (data.nodes && data.nodes.length > 0) {
        // Hydrate icons and onMetadataSelect callback based on label
        const hydratedNodes = data.nodes.map((node) => {
          const inferredSourceType =
            node.data?.nodeCategory === "source"
              ? getNodeSourceType(node)
              : normalizeSourceType(node.data?.sourceType);

          return {
            ...node,
            data: {
              ...node.data,
              sourceType:
                node.data?.sourceType || inferredSourceType || undefined,
              icon: iconMap[node.data.label] || Archive, // Fallback to Archive
              nodeId: node.id, // Ensure nodeId is set
              // Delete handler
              onDelete: (nodeId) => {
                setNodes((nds) => nds.filter((n) => n.id !== nodeId));
                // Clear selected node if it was deleted
                if (selectedNode?.id === nodeId) {
                  setSelectedNode(null);
                  setSelectedMetadataItem(null);
                }
              },
              // Restore onMetadataSelect callback for metadata editing
              onMetadataSelect: (item, clickedNodeId) => {
                isMetadataClickRef.current = true; // Mark as metadata click
                setSelectedMetadataItem(item);
              },
            },
          };
        });
        setNodes(hydratedNodes);
      }

      if (data.edges && data.edges.length > 0) {
        setEdges(data.edges);
      }

      // Restore schedule (only if we have valid schedule data)
      if (data.schedule_frequency && data.ui_params) {
        // Convert UTC startDate to local time for display
        const uiParams = { ...data.ui_params };
        if (uiParams.startDate) {
          uiParams.startDate = utcToLocalDatetimeString(uiParams.startDate);
        }

        setSchedules([{
          id: "1",
          name: data.ui_params.scheduleName || "Main Schedule",
          cron: data.schedule,
          frequency: data.schedule_frequency,
          description: data.ui_params.scheduleDescription || "",
          uiParams: uiParams
        }]);
      } else {
        // No valid schedule data - start with empty
        setSchedules([]);
      }

      console.log("Job loaded:", data);
    } catch (error) {
      console.error("Failed to load job:", error);
      showToast(`Failed to load job: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const nodeOptions = {
    source: [
      { id: "s3", label: "S3", icon: Archive, color: "#FF9900" },
      {
        id: "postgres",
        label: "PostgreSQL",
        icon: SiPostgresql,
        color: "#4169E1",
      },
      {
        id: "kafka",
        label: "Kafka Stream",
        icon: SiApachekafka,
        color: "#f59e0b",
      },
      { id: "mongodb", label: "MongoDB", icon: SiMongodb, color: "#47A248" },
    ],
    transform: [
      // RDB Transforms
      { id: "select-fields", label: "Select Fields", icon: Columns },
      { id: "filter", label: "Filter", icon: Filter },
      { id: "union", label: "Union", icon: Combine },
      { id: "map", label: "Map", icon: ArrowRightLeft },
      { id: "join", label: "Join", icon: GitMerge },
      { id: "aggregate", label: "Aggregate", icon: BarChart3 },
      { id: "sort", label: "Sort", icon: ArrowUpDown },
    ],
    target: [{ id: "s3-target", label: "S3", icon: Archive, color: "#FF9900" }],
  };

  // Helper function to merge schemas from multiple inputs (for Union)
  const mergeSchemas = (schemas) => {
    const columnMap = new Map();
    schemas.forEach((schema) => {
      if (schema) {
        schema.forEach((col) => {
          if (!columnMap.has(col.key)) {
            columnMap.set(col.key, col.type);
          }
        });
      }
    });
    return Array.from(columnMap.entries()).map(([key, type]) => ({
      key,
      type,
    }));
  };

  const onConnect = useCallback(
    (params) => {
      // Create edge with deletion type for hover delete effect
      const newEdge = {
        ...params,
        type: 'deletion',
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Schema propagation: use functional update to access latest state
      setNodes((nds) => {
        const sourceNode = nds.find((n) => n.id === params.source);
        const targetNode = nds.find((n) => n.id === params.target);

        if (!sourceNode || !targetNode) return nds;

        const directSourceType = getNodeSourceType(sourceNode);
        const applySourceType = (data) => {
          if (!directSourceType) return data;
          return { ...data, sourceType: directSourceType };
        };
        const nextTransformType =
          targetNode.data?.nodeCategory === "transform"
            ? normalizeTransformTypeForSource(
              directSourceType,
              targetNode.data?.transformType
            )
            : targetNode.data?.transformType;

        if (!sourceNode?.data?.schema) {
          if (targetNode?.data?.transformType === "union") {
            const allEdgesToTarget = [...edges, params].filter(
              (e) => e.target === params.target
            );
            const inputSourceTypes = new Set(
              allEdgesToTarget
                .map((e) => {
                  const inputNode = nds.find((n) => n.id === e.source);
                  return getNodeSourceType(inputNode);
                })
                .filter(Boolean)
            );
            const unionSourceType =
              inputSourceTypes.size === 1
                ? Array.from(inputSourceTypes)[0]
                : "mixed";

            return nds.map((n) =>
              n.id === params.target
                ? {
                  ...n,
                  data: {
                    ...n.data,
                    sourceType: unionSourceType,
                  },
                }
                : n
            );
          }

          return nds.map((n) =>
            n.id === params.target
              ? {
                ...n,
                data: {
                  ...applySourceType(n.data),
                  transformType: nextTransformType || n.data.transformType,
                },
              }
              : n
          );
        }

        // Special handling for Union transform - collect all input schemas
        if (targetNode?.data?.transformType === "union") {
          // Get all edges leading to this union node (including the new one)
          const allEdgesToTarget = [...edges, params].filter(
            (e) => e.target === params.target
          );
          const inputSchemas = allEdgesToTarget.map((e) => {
            const inputNode = nds.find((n) => n.id === e.source);
            return inputNode?.data?.schema || [];
          });

          // Collect table names from input sources
          const tableNames = allEdgesToTarget
            .map((e) => {
              const inputNode = nds.find((n) => n.id === e.source);
              return inputNode?.data?.tableName || "";
            })
            .filter((name) => name); // Remove empty names

          const combinedTableName = tableNames.join("_");

          // Merge schemas for union - include all columns
          const unionSchema = mergeSchemas(inputSchemas);
          const inputSourceTypes = new Set(
            allEdgesToTarget
              .map((e) => {
                const inputNode = nds.find((n) => n.id === e.source);
                return getNodeSourceType(inputNode);
              })
              .filter(Boolean)
          );
          const unionSourceType =
            inputSourceTypes.size === 1
              ? Array.from(inputSourceTypes)[0]
              : "mixed";

          return nds.map((n) =>
            n.id === params.target
              ? {
                ...n,
                data: {
                  ...n.data,
                  inputSchemas: inputSchemas, // Store array of schemas for Union config
                  schema: unionSchema,
                  tableName: combinedTableName, // Set combined table name
                  sourceType: unionSourceType,
                },
              }
              : n
          );
        }

        // Default single-input behavior
        return nds.map((n) =>
          n.id === params.target
            ? {
              ...n,
              data: {
                ...n.data,
                transformType: nextTransformType || n.data.transformType,
                inputSchema: sourceNode.data.schema,
                tableName: sourceNode.data.tableName, // RDB 테이블명 전파
                collectionName: sourceNode.data.collectionName, // MongoDB 컬렉션명 전파
                // If transform has config, apply it; otherwise use input as output
                schema: n.data.transformConfig
                  ? applyTransformToSchema(
                    sourceNode.data.schema,
                    nextTransformType || n.data.transformType,
                    n.data.transformConfig
                  )
                  : sourceNode.data.schema,
                sourceType: directSourceType || n.data.sourceType,
              },
            }
            : n
        );
      });

      // Update selectedNode to keep panel open (if either source or target is selected)
      if (selectedNode) {
        setNodes((nds) => {
          const sourceNode = nds.find((n) => n.id === params.source);
          const targetNode = nds.find((n) => n.id === params.target);

          if (selectedNode.id === params.target && sourceNode?.data?.schema) {
            // Target node is selected - update its data
            if (targetNode?.data?.transformType === "union") {
              // Union: update with merged schemas
              const allEdgesToTarget = [...edges, params].filter(
                (e) => e.target === params.target
              );
              const inputSchemas = allEdgesToTarget.map((e) => {
                const inputNode = nds.find((n) => n.id === e.source);
                return inputNode?.data?.schema || [];
              });

              // Collect table names from input sources
              const tableNames = allEdgesToTarget
                .map((e) => {
                  const inputNode = nds.find((n) => n.id === e.source);
                  return inputNode?.data?.tableName || "";
                })
                .filter((name) => name);

              const combinedTableName = tableNames.join("_");
              const unionSchema = mergeSchemas(inputSchemas);
              const inputSourceTypes = new Set(
                allEdgesToTarget
                  .map((e) => {
                    const inputNode = nds.find((n) => n.id === e.source);
                    return getNodeSourceType(inputNode);
                  })
                  .filter(Boolean)
              );
              const unionSourceType =
                inputSourceTypes.size === 1
                  ? Array.from(inputSourceTypes)[0]
                  : "mixed";

              setSelectedNode((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  inputSchemas: inputSchemas,
                  schema: unionSchema,
                  tableName: combinedTableName,
                  sourceType: unionSourceType,
                },
              }));
            } else {
              const directSourceType = getNodeSourceType(sourceNode);
              const nextTransformType = normalizeTransformTypeForSource(
                directSourceType,
                targetNode?.data?.transformType
              );
              setSelectedNode((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  transformType: nextTransformType || prev.data.transformType,
                  inputSchema: sourceNode.data.schema,
                  tableName: sourceNode.data.tableName, // RDB 테이블명 전파
                  collectionName: sourceNode.data.collectionName, // MongoDB 컬렉션명 전파
                  schema: prev.data.transformConfig
                    ? applyTransformToSchema(
                      sourceNode.data.schema,
                      nextTransformType || prev.data.transformType,
                      prev.data.transformConfig
                    )
                    : sourceNode.data.schema,
                  sourceType: directSourceType || prev.data.sourceType,
                },
              }));
            }
          } else if (
            selectedNode.id === params.target &&
            !sourceNode?.data?.schema
          ) {
            const directSourceType = getNodeSourceType(sourceNode);
            if (directSourceType) {
              setSelectedNode((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  sourceType: directSourceType,
                },
              }));
            }
          } else if (selectedNode.id === params.source) {
            // Source node is selected - keep panel open
            setSelectedNode({ ...sourceNode });
          }

          return nds; // No changes, just reading state
        });
      }
    },
    [setNodes, setEdges, selectedNode, edges]
  );

  // Note: convertNodesToApiFormat is now imported from utils/etl_job.js

  const getDemoDatasetDisplayName = () => {
    const normalizedName = jobName.replace(/_/g, " ").trim();
    return normalizedName || "월별 상품 매출 Gold Dataset";
  };

  const buildFrontendDemoCatalogPayload = () => {
    const apiFormat = convertNodesToApiFormat(nodes, edges);
    const sourcePayloads =
      apiFormat.sources.length > 0
        ? apiFormat.sources.map((source, index) => buildDemoSourcePayload(source, index))
        : defaultDemoSources;
    const transformPayloads =
      apiFormat.transforms.length > 0 ? apiFormat.transforms : [defaultDemoTransform];
    const destinationPayload = apiFormat.destination?.path
      ? apiFormat.destination
      : defaultDemoDestination;
    const displayName = getDemoDatasetDisplayName();
    const nowIso = new Date().toISOString();

    return {
      name: displayName,
      description:
        jobDetails.description ||
        "PostgreSQL 주문 거래, MongoDB 상품 카탈로그, AskLake S3 이벤트를 조인해 월별 상품 매출을 집계하는 Gold Dataset 파이프라인입니다.",
      owner: "데이터 엔지니어링 팀",
      dataset_type: "target",
      job_type: jobDetails.jobType || "batch",
      layer: "gold",
      catalog_status: "new",
      created_from_pipeline_demo: true,
      quality_score: 100,
      sources: sourcePayloads.map((source, index) => ({
        nodeId: source.nodeId,
        type: source.type,
        table: source.table || source.config?.topic || source.collection,
        name:
          source.type === "mongodb"
            ? "커머스 MongoDB"
            : source.type === "s3"
              ? "AskLake S3 Lake"
            : index === 0
              ? "주문 거래 PostgreSQL"
              : "원본 데이터",
      })),
      transforms: transformPayloads,
      targets: [
        {
          nodeId: destinationPayload.nodeId || "asklake-target-gold",
          type: "s3",
          config: {
            path: destinationPayload.path,
            format: destinationPayload.format || "parquet",
          },
        },
      ],
      destination: destinationPayload,
      target: { type: "s3", path: destinationPayload.path },
      schema: askLakeDemoSchemas.gold,
      columns: askLakeDemoSchemas.gold,
      nodes: nodes.length > 0 ? nodes : createAskLakeDemoNodes(),
      edges: edges.length > 0 ? edges : askLakeDemoEdges,
      schedule: "Batch 실행",
      schedule_frequency: schedules.length > 0 ? schedules[0].frequency : "manual",
      ui_params:
        schedules.length > 0
          ? {
              ...schedules[0].uiParams,
              scheduleName: schedules[0].name,
              scheduleDescription: schedules[0].description,
            }
          : null,
      incremental_config: jobDetails.incremental_config || null,
      status: "active",
      is_active: true,
      import_ready: true,
      size_bytes: 824633720,
      actual_size_bytes: 824633720,
      row_count: 2480000,
      format: "PARQUET",
      tags: ["gold", "commerce", "revenue", "orders", "quality-100", "pipeline-demo"],
      preview_rows: [
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
      ],
      quality: {
        missing_rate: "0.00%",
        duplicate_count: 0,
        schema_status: "안정적",
      },
      updated_at: nowIso,
    };
  };

  const persistFrontendDemoCatalog = async ({ forceCreate = false } = {}) => {
    const payload = buildFrontendDemoCatalogPayload();
    const shouldUpdate = jobId && !forceCreate;
    const response = await fetch(
      shouldUpdate
        ? `${API_BASE_URL}/api/datasets/${jobId}`
        : `${API_BASE_URL}/api/datasets`,
      {
        method: shouldUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create frontend demo catalog item");
    }

    const data = await response.json();
    setJobId(data.id);
    return data;
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    if (IS_FRONTEND_ONLY) {
      try {
        const data = await persistFrontendDemoCatalog();
        console.log("Frontend demo pipeline saved:", data);
        showToast("새 파이프라인과 Gold Dataset을 만들었습니다.", "success");
      } catch (error) {
        console.error("Frontend demo save failed:", error);
        showToast(`저장 실패: ${error.message}`, "error");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const apiFormat = convertNodesToApiFormat(nodes, edges);
    let { sources, transforms, destination } = apiFormat;

    if (IS_FRONTEND_ONLY) {
      sources =
        sources.length > 0
          ? sources.map((source, index) => buildDemoSourcePayload(source, index))
          : defaultDemoSources;

      transforms = transforms.length > 0 ? transforms : [defaultDemoTransform];
      destination = destination?.path ? destination : defaultDemoDestination;
    }

    // Validate required fields
    if (!IS_FRONTEND_ONLY && (!sources || sources.length === 0 || !sources[0]?.connection_id)) {
      showToast("먼저 원본 연결을 선택해주세요.", "error");
      setIsSaving(false);
      return;
    }
    if (!IS_FRONTEND_ONLY && !destination?.path) {
      showToast("먼저 S3 타겟 경로를 설정해주세요.", "error");
      setIsSaving(false);
      return;
    }

    const payload = {
      name: jobName,
      description: jobDetails.description || "",
      job_type: jobDetails.jobType || "batch",
      dataset_type: jobDetails.datasetType || "source",
      sources,
      transforms,
      destination,
      // Don't send schedule directly - let backend generate it from frequency & ui_params
      schedule_frequency: schedules.length > 0 ? schedules[0].frequency : "", // Send empty string to clear schedule
      ui_params: schedules.length > 0 ? {
        ...schedules[0].uiParams,
        // Persist schedule name and description in ui_params since they don't have dedicated backend fields
        scheduleName: schedules[0].name,
        scheduleDescription: schedules[0].description
      } : null,
      incremental_config: jobDetails.incremental_config || null,
      nodes: nodes,
      edges: edges,
    };

    try {
      let response;
      if (jobId) {
        response = await fetch(`${API_BASE_URL}/api/datasets/${jobId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/datasets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to save job");
      }

      const data = await response.json();
      setJobId(data.id);
      console.log("Job saved:", data);
      showToast(
        IS_FRONTEND_ONLY
          ? "파이프라인을 연결했습니다."
          : "작업이 저장되었습니다.",
        "success"
      );
    } catch (error) {
      console.error("Save failed:", error);
      showToast(`저장 실패: ${error.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Run job - Batch 또는 CDC 실행
  const handleRun = async () => {
    if (IS_FRONTEND_ONLY) {
      if (demoRunState === "running") return;
      setDemoRunState("running");
      showToast("새 파이프라인을 가동합니다", "success");

      window.setTimeout(async () => {
        try {
          const catalogDataset = await persistFrontendDemoCatalog({
            forceCreate: !jobId,
          });
          setDemoRunState("complete");
          showToast("새 Gold Dataset이 카탈로그에 등록되었습니다", "success");
          navigate(`/catalog/${catalogDataset.id}`, {
            state: { catalogItem: catalogDataset },
          });
        } catch (error) {
          console.error("Frontend demo run failed:", error);
          setDemoRunState("idle");
          showToast(`실행 실패: ${error.message}`, "error");
        }
      }, isAskLakeDemo ? 2400 : 1800);
      return;
    }

    if (isAskLakeDemo) {
      if (demoRunState === "running") return;
      setDemoRunState("running");
      showToast("데이터 파이프라인을 가동합니다", "success");

      window.setTimeout(() => {
        setDemoRunState("complete");
        showToast("Gold Dataset이 카탈로그에 등록되었습니다", "success");
        navigate(`/catalog/${ASKLAKE_DEMO_DATASET_ID}`);
      }, 2400);
      return;
    }

    if (!jobId) {
      if (IS_FRONTEND_ONLY) {
        const demoJobId = `frontend-demo-${Date.now()}`;
        setJobId(demoJobId);
        setDemoRunState("running");
        showToast("파이프라인을 가동합니다", "success");

        window.setTimeout(() => {
          setDemoRunState("complete");
          showToast("Gold Dataset이 카탈로그에 등록되었습니다", "success");
          navigate(`/catalog/${ASKLAKE_DEMO_DATASET_ID}`);
        }, 1800);
        return;
      }

      showToast("먼저 작업을 저장해주세요.", "error");
      return;
    }

    try {
      if (jobDetails.jobType === 'cdc') {
        // CDC 타입: CDC 활성화
        const response = await fetch(`${API_BASE_URL}/api/cdc/job/${jobId}/activate`, {
          method: "POST",
        });

        if (response.ok) {
          showToast("CDC 파이프라인이 활성화되었습니다. 실시간 동기화를 시작합니다.", "success");
          setIsCdcActive(true);
        } else {
          const error = await response.json();
          showToast(`CDC 활성화 실패: ${error.detail || '알 수 없는 오류'}`, "error");
        }
      } else if (jobDetails.jobType === "streaming") {
        const response = await fetch(`${API_BASE_URL}/api/streaming/jobs/${jobId}/start`, {
          method: "POST",
        });

        if (response.ok) {
          showToast("스트리밍 작업을 시작했습니다.", "success");
          setIsStreamingActive(true);
        } else {
          const error = await response.json();
          showToast(`스트리밍 시작 실패: ${error.detail || '알 수 없는 오류'}`, "error");
        }
      } else {
        // Batch 타입: 기존 배치 실행
        const response = await fetch(`${API_BASE_URL}/api/datasets/${jobId}/run`, {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();
          showToast(`배치 작업을 시작했습니다. 실행 ID: ${data.run_id}`, "success");
        } else {
          const error = await response.json();
          showToast(`실행 실패: ${error.detail || '알 수 없는 오류'}`, "error");
        }
      }
    } catch (error) {
      console.error("실행 실패:", error);
      showToast(`실행 실패: ${error.message}`, "error");
    }
  };

  const handleStop = async () => {
    if (!jobId) return;

    if (jobDetails.jobType === "streaming") {
      if (!confirm("Stop streaming job?")) return;
      try {
        const stopRes = await fetch(
          `${API_BASE_URL}/api/streaming/jobs/${jobId}/stop`,
          { method: "POST" }
        );
        if (!stopRes.ok) {
          const errorData = await stopRes.json();
          throw new Error(errorData.detail || "Failed to stop streaming");
        }
        showToast("Streaming job stopped.", "success");
        setIsStreamingActive(false);
      } catch (error) {
        console.error("Streaming Stop Error:", error);
        showToast(`Failed to stop streaming: ${error.message}`, "error");
      }
      return;
    }

    if (confirm("Stop CDC pipeline? (Connector and Job will be terminated)")) {
      try {
        const stopRes = await fetch(
          `${API_BASE_URL}/api/cdc/job/${jobId}/deactivate`,
          { method: "POST" }
        );
        if (!stopRes.ok) {
          const errorData = await stopRes.json();
          throw new Error(errorData.detail || "Failed to stop CDC");
        }
        showToast("CDC pipeline stopped.", "success");
        setIsCdcActive(false);
      } catch (error) {
        console.error("CDC Stop Error:", error);
        showToast(`Failed to stop CDC: ${error.message}`, "error");
      }
    }
  };

  const checkCdcStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cdc/job/${id}/status`);
      if (res.ok) {
        const data = await res.json();
        setIsCdcActive(data.is_active);
      }
    } catch (error) {
      console.error("Failed to check CDC status:", error);
    }
  };

  const fetchStreamingStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/streaming/jobs/${jobId}/status`,
        { credentials: "include" }
      );
      if (!response.ok) {
        setIsStreamingActive(false);
        setStreamingGroupId("");
        return;
      }
      const data = await response.json();
      setIsStreamingActive(data.status === "running");
      setStreamingGroupId(data.group_id || "");
    } catch (error) {
      console.error("Failed to fetch streaming status:", error);
      setIsStreamingActive(false);
      setStreamingGroupId("");
    }
  };

  const addNode = (category, nodeOption) => {
    // 스마트 위치 계산: 기존 노드들 중 가장 아래에 있는 노드 찾기
    let position;
    if (nodes.length > 0) {
      // 가장 아래에 있는 노드 찾기
      const bottomNode = nodes.reduce((bottom, node) => {
        return node.position.x > bottom.position.x ? node : bottom;
      }, nodes[0]);

      // 그 노드 아래에 배치
      position = {
        x: bottomNode.position.x + 300,
        y: bottomNode.position.y,
      };
    } else {
      // 첫 번째 노드는 화면 상단 중앙에 배치
      position = { x: 250, y: 100 };
    }

    // Generate unique ID using timestamp + random number
    const uniqueId = `node_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const normalizedSourceType =
      category === "source" ? normalizeSourceType(nodeOption.id) : undefined;
    const demoSourceDefaults =
      IS_FRONTEND_ONLY && category === "source"
        ? getDemoSourceDefaults(normalizedSourceType)
        : {};
    const demoTargetDefaults =
      IS_FRONTEND_ONLY && category === "target"
        ? {
            sourceType: "s3",
            subtitle: "카탈로그 등록용 Gold 산출물",
            tableName: "gold_monthly_product_sales",
            schema: askLakeDemoSchemas.gold,
            s3Location: "s3://asklake/gold/monthly_product_sales",
            compressionType: "snappy",
            badges: ["Gold", "품질 100%", "마케터 권한 적용"],
          }
        : {};
    const demoTransformDefaults =
      IS_FRONTEND_ONLY && category === "transform"
        ? {
            inputSchema: askLakeDemoSchemas.orders,
            schema:
              nodeOption.id === "join" || nodeOption.id === "aggregate"
                ? askLakeDemoSchemas.gold
                : askLakeDemoSchemas.orders,
            sourceType: "postgres",
            transformConfig:
              nodeOption.id === "join"
                ? {
                    joinKey: "product_id",
                    rules: [
                      { label: "product_id 기준 조인", tone: "success" },
                      { label: "월별 매출/주문 수 집계", tone: "success" },
                    ],
                  }
                : {},
          }
        : {};

    const newNode = {
      id: uniqueId,
      type: "datasetNode", // 커스텀 노드 사용
      data: {
        label: nodeOption.label,
        icon: nodeOption.icon,
        color: nodeOption.color,
        nodeCategory: category, // source, transform, target
        transformType: category === "transform" ? nodeOption.id : undefined,
        sourceType:
          category === "source"
            ? normalizedSourceType
            : demoTargetDefaults.sourceType || demoTransformDefaults.sourceType,

        ...demoSourceDefaults,
        ...demoTransformDefaults,
        ...demoTargetDefaults,

        nodeId: uniqueId, // 노드 ID 전달

        // Delete handler
        onDelete: (nodeId) => {
          setNodes((nds) => nds.filter((n) => n.id !== nodeId));
          // Clear selected node if it was deleted
          if (selectedNode?.id === nodeId) {
            setSelectedNode(null);
            setSelectedMetadataItem(null);
          }
        },

        // Table 또는 Column 클릭 시 노드 선택 + 메타데이터 편집
        onMetadataSelect: (item, clickedNodeId) => {
          isMetadataClickRef.current = true; // Mark as metadata click
          setSelectedMetadataItem(item);
          // 노드 선택은 propagation을 통해 React Flow가 처리함
        },
      },
      position,
    };
    setNodes((nds) => [...nds, newNode]);
    setShowMenu(false);

    // 새 노드 위치로 부드럽게 이동
    setTimeout(() => {
      if (reactFlowInstance.current) {
        reactFlowInstance.current.setCenter(position.x + 75, position.y + 25, {
          zoom: 1.2,
          duration: 200,
        });
      }
    }, 50);
  };

  const handleNodeClick = (event, node) => {
    // 메타데이터(테이블/컬럼) 클릭이 아닐 때만 메타데이터 선택 초기화
    // Use ref instead of event property (React event properties may not propagate through ReactFlow)
    if (!isMetadataClickRef.current && selectedNode?.id !== node.id) {
      setSelectedMetadataItem(null);
    }
    // Reset the ref for next click
    isMetadataClickRef.current = false;
    setSelectedNode(node);
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
    setSelectedMetadataItem(null);
  };

  const handleNodesDelete = (deleted) => {
    if (!deleted || deleted.length === 0) return;
    setNodes((nds) => nds.filter((n) => !deleted.some((d) => d.id === n.id)));
    // Clear selected node if it was deleted
    if (selectedNode && deleted.some((d) => d.id === selectedNode.id)) {
      setSelectedNode(null);
      setSelectedMetadataItem(null);
    }
  };

  const handleEdgesDelete = (deleted) => {
    if (!deleted || deleted.length === 0) return;
    setEdges((eds) => eds.filter((e) => !deleted.some((d) => d.id === e.id)));
  };

  // Lineage tab handlers
  const handleLineageNodeClick = (event, node) => {
    setSelectedLineageNode(node);
  };

  const handleLineagePaneClick = () => {
    setSelectedLineageNode(null);
  };

  const handleSidebarTabClick = (tabId) => {
    if (sidebarTab === tabId && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else {
      setSidebarTab(tabId);
      setIsSidebarOpen(true);
    }
  };

  // Get sidebar dataset (selected node or domain-level data)
  const getSidebarDataset = () => {
    if (selectedLineageNode) {
      return {
        id: selectedLineageNode.id,
        name: selectedLineageNode.data?.label || selectedLineageNode.data?.name,
        description: selectedLineageNode.data?.description,
        columns: selectedLineageNode.data?.columns || [],
        platform: selectedLineageNode.data?.platform,
        ...selectedLineageNode.data
      };
    }
    // Return domain-level data when no node selected
    return {
      id: 'lineage-root',
      name: jobName,
      description: jobDetails.description,
      nodes: lineageNodes,
      edges: lineageEdges
    };
  };

  // Add node to lineage
  const addLineageNode = (category, nodeOption) => {
    // Calculate position
    let position = { x: 400, y: 200 };
    if (lineageNodes.length > 0) {
      const rightMostNode = lineageNodes.reduce((right, node) =>
        node.position.x > right.position.x ? node : right
        , lineageNodes[0]);
      position = {
        x: rightMostNode.position.x + 350,
        y: rightMostNode.position.y
      };
    }

    const uniqueId = `lineage-${category}-${Date.now()}`;

    const newNode = {
      id: uniqueId,
      type: "custom", // Use SchemaNode
      position,
      data: {
        label: nodeOption.label,
        name: nodeOption.label,
        platform: nodeOption.label,
        columns: [],
        expanded: true,
        nodeCategory: category,
        transformType: category === "transform" ? nodeOption.id : undefined,
      }
    };

    setLineageNodes(prev => [...prev, newNode]);
    setShowLineageMenu(false);
  };

  // Lineage node options (transform + target)
  const lineageNodeOptions = {
    transform: [
      { id: "select-fields", label: "Select Fields", icon: Columns },
      { id: "filter", label: "Filter", icon: Filter },
      { id: "union", label: "Union", icon: Combine },
      { id: "map", label: "Map", icon: ArrowRightLeft },
      { id: "join", label: "Join", icon: GitMerge },
      { id: "aggregate", label: "Aggregate", icon: BarChart3 },
      { id: "sort", label: "Sort", icon: ArrowUpDown },
    ],
    target: [
      { id: "s3-target", label: "S3", icon: Archive, color: "#FF9900" }
    ],
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={() => navigate("/dataset")}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value.replace(/ /g, '_'))}
            className="min-w-0 max-w-full text-lg sm:text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            placeholder="작업 이름"
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {/* Import Button - shown in lineage mode */}
          {isLineageMode && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              가져오기
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
          <button
            onClick={
              (jobDetails.jobType === "cdc" && isCdcActive) ||
              (jobDetails.jobType === "streaming" && isStreamingActive)
                ? handleStop
                : handleRun
            }
            disabled={(!IS_FRONTEND_ONLY && !jobId && !isAskLakeDemo) || isSaving || demoRunState === "running"}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${(!IS_FRONTEND_ONLY && !jobId) || isSaving
              ? isAskLakeDemo && !isSaving
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : (jobDetails.jobType === "cdc" && isCdcActive) ||
                (jobDetails.jobType === "streaming" && isStreamingActive)
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
              }`}
          >
            {(jobDetails.jobType === "cdc" && isCdcActive) ||
            (jobDetails.jobType === "streaming" && isStreamingActive) ? (
              <>
                <Pause className="w-4 h-4" />
                중지
              </>
            ) : demoRunState === "running" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {isAskLakeDemo
                  ? "파이프라인 실행"
                  : jobDetails.jobType === "streaming"
                    ? "시작"
                    : "실행"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tabs (Visual / Lineage / Job details / Schedules) */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center gap-6 overflow-x-auto">
        {(() => {
          const baseTabs = isLineageMode
            ? ["Lineage", "Visual", "Job details", "Schedules"]
            : ["Visual", "Job details", "Schedules"];
          const visibleTabs =
            jobDetails.jobType === "streaming"
              ? baseTabs.filter((tab) => tab !== "Schedules")
              : baseTabs;

          return visibleTabs.map((tab) => {
            const isDisabled = !IS_FRONTEND_ONLY && !jobId && tab === "Schedules";
            const tabLabels = {
              Visual: "파이프라인",
              Lineage: "리니지",
              "Job details": "작업 설정",
              Schedules: "스케줄",
            };
            return (
              <button
                key={tab}
                onClick={() => !isDisabled && setMainTab(tab)}
                disabled={isDisabled}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${mainTab === tab
                  ? "text-blue-600 border-blue-600"
                  : isDisabled
                    ? "text-gray-400 border-transparent cursor-not-allowed"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                title={isDisabled ? "먼저 작업을 저장해주세요" : ""}
              >
                {tabLabels[tab] || tab}
              </button>
            );
          });
        })()}
      </div>

      {/* Main Content: Canvas + Properties Panel (Shown only when 'Visual' is active) */}
      {mainTab === "Visual" ? (
        <>
          <div className="flex-1 flex overflow-hidden min-h-0">
            <aside className="hidden w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4 xl:block">
              <div className="mb-4">
                <p className="text-xs font-semibold text-blue-600">파이프라인 작업대</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">구축 블록</h2>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  소스, 변환 규칙, 결과 데이터셋을 선택해 중앙 흐름을 확인합니다.
                </p>
              </div>

              <div className="space-y-4">
                {builderSections.map((section) => {
                  const Icon = section.icon;
                  const tone = builderToneClasses[section.tone];
                  const stageNodeIds = section.items.map((item) => item.nodeId);
                  const completedCount = stageNodeIds.filter((nodeId) =>
                    nodes.some((node) => node.id === nodeId)
                  ).length;
                  const isSectionComplete = completedCount === stageNodeIds.length;

                  return (
                    <section key={section.title} className={`rounded-lg border p-3 ${tone.section}`}>
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                            <p className="mt-0.5 text-xs text-gray-500">{section.description}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          isSectionComplete
                            ? "bg-green-100 text-green-700"
                            : "bg-white text-gray-500"
                        }`}>
                          {isSectionComplete ? "완료" : "추가"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {section.items.map((item) => {
                          const isActive = selectedNode?.id === item.nodeId;
                          const nodeExists = nodes.some((node) => node.id === item.nodeId);

                          return (
                            <button
                              key={`${section.title}-${item.label}`}
                              onClick={() =>
                                nodeExists
                                  ? focusBuilderNode(item.nodeId)
                                  : addGuidedPipelineStep(section.stage)
                              }
                              className={`w-full rounded-lg border bg-white px-3 py-2 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 ${
                                isActive ? tone.active : "border-gray-200 text-gray-700"
                              }`}
                            >
                              <span className="flex items-center justify-between gap-2">
                                <span className="block truncate text-sm font-semibold" title={item.label}>
                                  {item.label}
                                </span>
                                {!nodeExists && (
                                  <Plus className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                )}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-gray-500" title={item.detail}>
                                {item.detail}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {!isSectionComplete && (
                        <button
                          onClick={() => addGuidedPipelineStep(section.stage)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {section.title} 추가
                        </button>
                      )}
                    </section>
                  );
                })}
              </div>

              <button
                onClick={() => setShowMenu(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                직접 블록 추가
              </button>
            </aside>

            {/* ReactFlow Canvas + Bottom Panel Wrapper */}
            <div className="flex-1 relative flex flex-col">
              {startFromScratch && nodes.length === 0 && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
                  <div className="pointer-events-auto w-[min(720px,100%)] rounded-2xl border border-blue-100 bg-white/95 p-6 shadow-xl backdrop-blur">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-blue-600">
                        새 파이프라인 만들기
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-gray-900">
                        원본 데이터부터 직접 연결하세요
                      </h2>
                      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600">
                        아래 순서대로 추가하면 소스, 변환, 결과 Gold Dataset 흐름이 캔버스에 만들어집니다.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                      <button
                        onClick={() => addGuidedPipelineStep("sources")}
                        className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
                            1
                          </span>
                          <Archive className="h-5 w-5 text-emerald-700" />
                        </div>
                        <p className="mt-3 text-sm font-bold text-gray-900">원본 데이터 추가</p>
                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          주문 거래 PostgreSQL과 커머스 MongoDB를 올립니다.
                        </p>
                      </button>

                      <button
                        onClick={() => addGuidedPipelineStep("transform")}
                        className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-100"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
                            2
                          </span>
                          <GitMerge className="h-5 w-5 text-purple-700" />
                        </div>
                        <p className="mt-3 text-sm font-bold text-gray-900">변환 규칙 추가</p>
                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          Bronze 적재, Silver 정제, product_id 조인, 월별 집계를 연결합니다.
                        </p>
                      </button>

                      <button
                        onClick={() => addGuidedPipelineStep("target")}
                        className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-100"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                            3
                          </span>
                          <ShieldCheck className="h-5 w-5 text-blue-700" />
                        </div>
                        <p className="mt-3 text-sm font-bold text-gray-900">결과 데이터셋 추가</p>
                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          Gold Dataset 타겟까지 연결해 카탈로그 등록 준비를 끝냅니다.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isAskLakeDemo && (
                <div className="absolute left-4 top-4 z-10 max-w-[min(520px,calc(100%-2rem))] rounded-xl border border-blue-100 bg-white/95 p-4 shadow-lg backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-600">
                        Step 1-3. Bronze/Silver/Gold 파이프라인
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900">
                        월별 상품 매출 Gold Dataset 준비
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        주문 거래, 상품 카탈로그, S3 이벤트를 Bronze/Silver 단계로 정제하고,
                        product_id 조인과 월별 집계를 거쳐 카탈로그에 등록할 Gold Dataset을 준비합니다.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Gold
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">주문 거래 PostgreSQL</span>
                    <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">커머스 MongoDB</span>
                    <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700">AskLake S3 Lake</span>
                    <span className="rounded-full bg-purple-50 px-2 py-1 text-purple-700">Bronze/Silver 정제</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">월별 상품 매출 집계</span>
                  </div>
                </div>
              )}

              {demoRunState === "running" && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/75 backdrop-blur-sm">
                  <div className="w-[min(480px,calc(100%-2rem))] rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-2xl">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                      <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      데이터 파이프라인 가동 중...
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      주문 거래, 상품 카탈로그, S3 이벤트를 정제하고 월별 상품 매출 Gold Dataset을 만들고 있습니다.
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <span className="rounded-lg bg-gray-50 px-2 py-2">소스 읽기</span>
                      <span className="rounded-lg bg-blue-50 px-2 py-2 text-blue-700">Silver 정제</span>
                      <span className="rounded-lg bg-emerald-50 px-2 py-2 text-emerald-700">Gold 집계</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Node Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                  title="노드 추가"
                >
                  <Plus className="w-6 h-6" />
                </button>

                {/* Node Type Menu with Tabs */}
                {showMenu && (
                  <div className="absolute top-14 right-0 bg-white rounded-lg shadow-xl border border-gray-200 w-80">
                    {/* Tabs */}
                    {/* ... (Menu content omitted for brevity, keeping existing logic) ... */}
                    <div className="flex border-b border-gray-200">
                      <button
                        onClick={() => setActiveTab("source")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "source"
                          ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        원본
                      </button>
                      <button
                        onClick={() => setActiveTab("transform")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "transform"
                          ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        변환
                      </button>
                      <button
                        onClick={() => setActiveTab("target")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "target"
                          ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        타겟
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {nodeOptions[activeTab].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => addNode(activeTab, option)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-md flex items-center gap-3 transition-colors"
                        >
                          <option.icon
                            className="w-5 h-5"
                            style={{ color: option.color || "#4b5563" }}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodesDelete={handleNodesDelete}
                onEdgesDelete={handleEdgesDelete}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                onInit={(instance) => {
                  reactFlowInstance.current = instance;
                }}
                fitView
                fitViewOptions={{ maxZoom: 1.2, padding: 0.4 }}
                nodesDraggable
                nodesConnectable
                elementsSelectable
                className="bg-gray-50 flex-1"
              >
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    switch (node.data?.nodeCategory) {
                      case "source":
                        return "#3b82f6";
                      case "target":
                        return "#10b981";
                      case "transform":
                        return "#8b5cf6";
                      default:
                        return "#6b7280";
                    }
                  }}
                  nodeComponent={({ x, y, width, color }) => (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={30}
                      fill={color}
                      rx={4}
                      ry={4}
                    />
                  )}
                  className="bg-white border border-gray-200"
                />
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={12}
                  size={1}
                />
              </ReactFlow>
            </div>

            {/* Properties Panel - Source */}
            {selectedNode && selectedNode.data?.nodeCategory === "source" && (
              <>
                {/* MongoDB Source Panel */}
                {selectedNode.data?.label === "MongoDB" ? (
                  <MongoDBSourcePropertiesPanel
                    node={selectedNode}
                    selectedMetadataItem={selectedMetadataItem}
                    onClose={() => {
                      setSelectedNode(null);
                      setSelectedMetadataItem(null);
                    }}
                    onUpdate={(data) => {
                      console.log("MongoDB Source updated:", data);
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, ...data } }
                            : n
                        )
                      );
                      setSelectedNode((prev) => ({
                        ...prev,
                        data: { ...prev.data, ...data },
                      }));
                    }}
                    onMetadataUpdate={(updatedItem) => {
                      console.log("Metadata updated:", updatedItem);
                      handleMetadataUpdate(updatedItem);
                    }}
                  />
                ) : (
                  /* RDB Source Panel */
                  <RDBSourcePropertiesPanel
                    node={selectedNode}
                    selectedMetadataItem={selectedMetadataItem}
                    onClose={() => {
                      setSelectedNode(null);
                      setSelectedMetadataItem(null);
                    }}
                    onUpdate={(data) => {
                      console.log("Source updated:", data);
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, ...data } }
                            : n
                        )
                      );
                      setSelectedNode((prev) => ({
                        ...prev,
                        data: { ...prev.data, ...data },
                      }));
                    }}
                    onMetadataUpdate={(updatedItem) => {
                      console.log("Metadata updated:", updatedItem);
                      handleMetadataUpdate(updatedItem);
                    }}
                  />
                )}
              </>
            )}

            {/* Properties Panel - Transform */}
            {selectedNode &&
              selectedNode.data?.nodeCategory === "transform" &&
              selectedNode.data?.transformType &&
              (() => {
                const nodeSourceType =
                  normalizeSourceType(selectedNode.data?.sourceType) || null;
                const sourceTypes = nodeSourceType
                  ? new Set([nodeSourceType])
                  : resolveSourceTypesForNode(selectedNode.id, nodes, edges);

                // Check if source is S3
                const isS3Source = sourceTypes.has("s3");

                // Render appropriate panel based on source type
                if (isS3Source) {
                  // Find incoming node to get schema and source info
                  const incomingEdge = edges.find(
                    (e) => e.target === selectedNode.id
                  );
                  const incomingNode = incomingEdge
                    ? nodes.find((n) => n.id === incomingEdge.source)
                    : null;

                  // For Select Fields: get source bucket/path
                  // For Filter: get schema from previous transform
                  const sourceBucket =
                    incomingNode?.data?.config?.bucket || null;
                  const sourcePath = incomingNode?.data?.config?.path || null;

                  return (
                    <S3TransformPanel
                      node={selectedNode}
                      sourceBucket={sourceBucket}
                      sourcePath={sourcePath}
                      onClose={() => {
                        setSelectedNode(null);
                        setSelectedMetadataItem(null);
                      }}
                      onUpdate={(data) => {
                        console.log("S3 Transform updated:", data);

                        // Update schema based on selected fields
                        let updatedSchema = selectedNode.data.schema;
                        if (
                          data.selectedFields &&
                          selectedNode.data.transformType === "s3-select-fields"
                        ) {
                          // Find source node to get schema
                          const edge = edges.find(
                            (e) => e.target === selectedNode.id
                          );
                          const sourceN = edge
                            ? nodes.find((n) => n.id === edge.source)
                            : null;
                          const sourceSchema = sourceN?.data?.schema || [];
                          // Filter to only selected fields
                          updatedSchema = sourceSchema.filter((s) =>
                            data.selectedFields.includes(s.key)
                          );
                        }

                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  ...data,
                                  schema: updatedSchema,
                                },
                              }
                              : n
                          )
                        );
                        setSelectedNode((prev) => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            ...data,
                            schema: updatedSchema,
                          },
                        }));
                      }}
                    />
                  );
                } else {
                  return (
                    <TransformPropertiesPanel
                      node={selectedNode}
                      selectedMetadataItem={selectedMetadataItem}
                      onClose={() => {
                        setSelectedNode(null);
                        setSelectedMetadataItem(null);
                      }}
                      onUpdate={(data) => {
                        console.log("Transform updated:", data);
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, ...data } }
                              : n
                          )
                        );
                        setSelectedNode((prev) => ({
                          ...prev,
                          data: { ...prev.data, ...data },
                        }));
                      }}
                      onMetadataUpdate={handleMetadataUpdate}
                    />
                  );
                }
              })()}

            {/* S3 Target Properties Panel */}
            {selectedNode && selectedNode.data?.nodeCategory === "target" && (
              <S3TargetPropertiesPanel
                node={selectedNode}
                selectedMetadataItem={selectedMetadataItem}
                nodes={nodes}
                onClose={() => {
                  setSelectedNode(null);
                  setSelectedMetadataItem(null);
                }}
                onUpdate={(data) => {
                  console.log("Target updated:", data);
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, ...data } }
                        : n
                    )
                  );
                  setSelectedNode((prev) => ({
                    ...prev,
                    data: { ...prev.data, ...data },
                  }));
                }}
                onMetadataUpdate={handleMetadataUpdate}
              />
            )}
          </div>

          {/* Info Panel */}
          <div className="bg-white border-t border-gray-200 px-6 py-3 text-sm text-gray-600">
            <p>
              <span className="font-medium">안내:</span> 노드를 드래그해 위치를 조정하고,
              노드 가장자리 핸들을 끌어 원본·변환·타겟을 연결할 수 있습니다.
            </p>
          </div>
        </>
      ) : mainTab === "Lineage" ? (
        /* Lineage Tab - Shows imported ETL lineage with SchemaNode */
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Main Canvas Area */}
          <div className="flex-1 relative overflow-hidden bg-gray-50">
            {/* Add Node Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowLineageMenu(!showLineageMenu)}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                title="노드 추가"
              >
                <Plus className="w-6 h-6" />
              </button>

              {/* Node Type Menu */}
              {showLineageMenu && (
                <div className="absolute top-14 right-0 bg-white rounded-lg shadow-xl border border-gray-200 w-64">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setLineageActiveTab("transform")}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${lineageActiveTab === "transform"
                        ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                      변환
                    </button>
                    <button
                      onClick={() => setLineageActiveTab("target")}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${lineageActiveTab === "target"
                        ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                      타겟
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {lineageNodeOptions[lineageActiveTab].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => addLineageNode(lineageActiveTab, option)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-md flex items-center gap-3 transition-colors"
                      >
                        <option.icon
                          className="w-5 h-5"
                          style={{ color: option.color || "#4b5563" }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ReactFlow
              nodes={lineageNodes}
              edges={lineageEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={(changes) => {
                setLineageNodes((nds) => {
                  const updatedNodes = [...nds];
                  changes.forEach((change) => {
                    if (change.type === 'position' && change.position) {
                      const nodeIndex = updatedNodes.findIndex(n => n.id === change.id);
                      if (nodeIndex !== -1) {
                        updatedNodes[nodeIndex] = {
                          ...updatedNodes[nodeIndex],
                          position: change.position
                        };
                      }
                    }
                  });
                  return updatedNodes;
                });
              }}
              onEdgesChange={(changes) => {
                setLineageEdges((eds) => {
                  let updatedEdges = [...eds];
                  changes.forEach((change) => {
                    if (change.type === 'remove') {
                      updatedEdges = updatedEdges.filter(e => e.id !== change.id);
                    }
                  });
                  return updatedEdges;
                });
              }}
              onConnect={(params) => {
                // Add edge with deletion type
                const newEdge = {
                  ...params,
                  id: `edge-${params.source}-${params.target}`,
                  type: 'deletion',
                };
                setLineageEdges(prev => [...prev, newEdge]);

                // Propagate schema from source to target
                setLineageNodes(nds => {
                  const sourceNode = nds.find(n => n.id === params.source);
                  const targetNode = nds.find(n => n.id === params.target);

                  if (!sourceNode || !targetNode) return nds;

                  // Get source schema (from columns or schema)
                  const sourceSchema = sourceNode.data?.columns || sourceNode.data?.schema || [];

                  return nds.map(n => {
                    if (n.id === params.target) {
                      return {
                        ...n,
                        data: {
                          ...n.data,
                          inputSchema: sourceSchema,
                          schema: n.data.schema || sourceSchema,
                          columns: n.data.columns?.length > 0 ? n.data.columns : sourceSchema,
                        }
                      };
                    }
                    return n;
                  });
                });
              }}
              onNodeClick={handleLineageNodeClick}
              onPaneClick={handleLineagePaneClick}
              fitView
              fitViewOptions={{ maxZoom: 1, padding: 0.3 }}
              nodesDraggable
              nodesConnectable
              className="bg-gray-50"
            >
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  const platform = node.data?.platform?.toLowerCase() || "";
                  if (platform.includes("s3") || platform.includes("archive")) return "#F59E0B";
                  if (platform.includes("postgres")) return "#3B82F6";
                  if (platform.includes("mongo")) return "#10B981";
                  if (platform.includes("mysql")) return "#0EA5E9";
                  if (platform.includes("kafka")) return "#1F2937";
                  return "#64748B";
                }}
                className="bg-white border border-gray-200"
              />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>

          {/* Sidebar Toggle Button - Only show when not displaying property panels */}
          {(!selectedLineageNode || selectedLineageNode?.data?.jobs?.length > 0) && (
            <SidebarToggle
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          )}

          {/* Right Panel - Conditional based on selected node type */}
          {selectedLineageNode?.data?.nodeCategory === "transform" ? (
            /* Transform Properties Panel */
            <TransformPropertiesPanel
              node={{
                ...selectedLineageNode,
                data: {
                  ...selectedLineageNode.data,
                  // Find input schema from connected source node
                  inputSchema: (() => {
                    const incomingEdge = lineageEdges.find(e => e.target === selectedLineageNode.id);
                    if (incomingEdge) {
                      const sourceNode = lineageNodes.find(n => n.id === incomingEdge.source);
                      return sourceNode?.data?.columns || sourceNode?.data?.schema || [];
                    }
                    return selectedLineageNode.data?.inputSchema || [];
                  })(),
                }
              }}
              selectedMetadataItem={null}
              onClose={() => setSelectedLineageNode(null)}
              onUpdate={(data) => {
                setLineageNodes(prev => prev.map(n =>
                  n.id === selectedLineageNode.id
                    ? { ...n, data: { ...n.data, ...data } }
                    : n
                ));
                setSelectedLineageNode(prev => ({
                  ...prev,
                  data: { ...prev.data, ...data }
                }));
              }}
              onMetadataUpdate={() => { }}
            />
          ) : selectedLineageNode?.data?.nodeCategory === "target" ? (
            /* Target Properties Panel */
            <S3TargetPropertiesPanel
              node={selectedLineageNode}
              selectedMetadataItem={null}
              nodes={lineageNodes}
              onClose={() => setSelectedLineageNode(null)}
              onUpdate={(data) => {
                setLineageNodes(prev => prev.map(n =>
                  n.id === selectedLineageNode.id
                    ? { ...n, data: { ...n.data, ...data } }
                    : n
                ));
                setSelectedLineageNode(prev => ({
                  ...prev,
                  data: { ...prev.data, ...data }
                }));
              }}
              onMetadataUpdate={() => { }}
            />
          ) : (
            /* Right Sidebar - For job nodes or no selection */
            <RightSidebar
              isSidebarOpen={isSidebarOpen}
              sidebarTab={sidebarTab}
              handleSidebarTabClick={handleSidebarTabClick}
              streamData={null}
              dataset={getSidebarDataset()}
              domain={{ nodes: lineageNodes, edges: lineageEdges }}
              onNodeSelect={(node) => {
                const targetNode = lineageNodes.find(n => n.id === node.id);
                if (targetNode) setSelectedLineageNode(targetNode);
              }}
              onUpdate={(entityId, updateData) => {
                setLineageNodes(prev => prev.map(n =>
                  n.id === entityId
                    ? { ...n, data: { ...n.data, ...updateData } }
                    : n
                ));
              }}
              nodePermissions={{}}
              canEditDomain={true}
            />
          )}
        </div>
      ) : mainTab === "Job details" ? (
        <JobDetailsPanel
          jobDetails={jobDetails}
          jobId={jobId}
          streamingGroupId={streamingGroupId}
          onUpdate={(details) => {
            console.log("Job details updated:", details);
            setJobDetails(details);
          }}
        />
      ) : mainTab === "Schedules" ? (
        <SchedulesPanel
          schedules={schedules}
          onUpdate={async (newSchedules) => {
            console.log("Schedules updated:", newSchedules);
            setSchedules(newSchedules);

            // Auto-save schedule to backend
            const result = await saveScheduleToBackend(
              jobId,
              jobName,
              jobDetails,
              newSchedules,
              nodes,
              edges
            );

            if (result.success) {
              console.log("✅ Schedule saved to backend");
            } else {
              console.error("❌ Failed to save schedule:", result.error);
            }
          }}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {mainTab}
            </h3>
            <p className="text-gray-500">This feature is coming soon.</p>
          </div>
        </div>
      )}

      {/* Import Modal for adding more ETL jobs to lineage */}
      {showImportModal && (
        <DomainImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          datasetId={jobId}
          initialPos={() => ({ x: 400, y: 100 })}
          onImport={(newNodes, newEdges) => {
            console.log("[ETLJob] Importing nodes:", newNodes);
            console.log("[ETLJob] Importing edges:", newEdges);
            setLineageNodes(prev => [...prev, ...newNodes]);
            setLineageEdges(prev => [...prev, ...newEdges]);
            showToast(`Imported ${newNodes.length} nodes`, "success");
          }}
        />
      )}
    </div>
  );
}
