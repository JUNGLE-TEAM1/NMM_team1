import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Database,
  Loader2,
  Plus,
  RefreshCw,
  Table2,
  X,
} from "lucide-react";
import ConnectionForm from "../../components/sources/ConnectionForm";
import { connectionApi } from "../../services/connectionApi";

const getTypeLabel = (type) => {
  const labels = {
    postgres: "PostgreSQL",
    mysql: "MySQL",
    mariadb: "MariaDB",
    mongodb: "MongoDB",
    s3: "Amazon S3",
    api: "REST API",
    kafka: "Kafka",
  };

  return labels[type] || type?.toUpperCase() || "Unknown";
};

const getConnectionDetail = (connection) => {
  if (!connection) return "-";
  if (connection.type === "s3") return connection.config?.bucket || "S3 bucket";
  if (connection.type === "api") return connection.config?.base_url || "API endpoint";
  if (connection.type === "kafka") return connection.config?.bootstrap_servers || "Kafka brokers";
  if (connection.type === "mongodb") return connection.config?.database || connection.config?.uri || "MongoDB";
  return [connection.config?.host, connection.config?.database || connection.config?.database_name]
    .filter(Boolean)
    .join(" / ") || "Database";
};

const fallbackAssets = (connection) => {
  if (!connection) return [];

  const assetsByType = {
    postgres: [
      { name: "order_transactions", kind: "Table", description: "주문 거래 원본 테이블" },
      { name: "customers", kind: "Table", description: "고객 마스터 테이블" },
      { name: "products", kind: "Table", description: "상품 마스터 테이블" },
    ],
    mysql: [
      { name: "orders", kind: "Table", description: "운영 주문 테이블" },
      { name: "order_items", kind: "Table", description: "주문 상품 상세 테이블" },
    ],
    mariadb: [
      { name: "orders", kind: "Table", description: "운영 주문 테이블" },
      { name: "order_items", kind: "Table", description: "주문 상품 상세 테이블" },
    ],
    mongodb: [
      { name: "customer_profiles", kind: "Collection", description: "고객 프로필 문서" },
      { name: "product_catalog", kind: "Collection", description: "상품 카탈로그 문서" },
    ],
    s3: [
      { name: "bronze/customer_order_raw/", kind: "Path", description: "고객/주문 원본 경로" },
      { name: "silver/customer_order_silver/", kind: "Path", description: "정제된 고객 주문 경로" },
      { name: "gold/monthly_product_sales/", kind: "Path", description: "월별 상품 매출 경로" },
    ],
    api: [
      { name: "/orders", kind: "Endpoint", description: "주문 상태 API" },
      { name: "/events", kind: "Endpoint", description: "서비스 이벤트 API" },
    ],
    kafka: [
      { name: "commerce.order.events", kind: "Topic", description: "실시간 주문 이벤트" },
      { name: "commerce.payment.events", kind: "Topic", description: "실시간 결제 이벤트" },
    ],
  };

  return assetsByType[connection.type] || [
    { name: "source_dataset", kind: "Dataset", description: "원본 데이터" },
  ];
};

const normalizeAssets = (payload, connection) => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload?.tables || payload?.collections || payload?.topics || payload?.paths || payload?.items || [];

  const fallbackKind = {
    mongodb: "Collection",
    kafka: "Topic",
    s3: "Path",
    api: "Endpoint",
  }[connection?.type] || "Table";

  return rawItems.map((item) => {
    if (typeof item === "string") {
      return {
        name: item,
        kind: fallbackKind,
        description: `${getTypeLabel(connection?.type)} 원본 항목`,
      };
    }

    return {
      name: item.name || item.table_name || item.collection || item.path || item.topic || "source",
      kind: item.kind || fallbackKind,
      description: item.description || `${getTypeLabel(connection?.type)} 원본 항목`,
    };
  });
};

export default function NewPipelineStartModal({ isOpen, onClose, onProceed, onManageConnections }) {
  const [connections, setConnections] = useState([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [mode, setMode] = useState("select");
  const [testState, setTestState] = useState("idle");
  const [assets, setAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [selectedAssetName, setSelectedAssetName] = useState("");

  const selectedConnection = useMemo(
    () => connections.find((connection) => connection.id === selectedConnectionId) || null,
    [connections, selectedConnectionId]
  );

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.name === selectedAssetName) || null,
    [assets, selectedAssetName]
  );

  useEffect(() => {
    if (!isOpen) return;

    const loadConnections = async () => {
      setIsLoadingConnections(true);
      setConnectionError(null);

      try {
        const data = await connectionApi.fetchConnections();
        setConnections(data);
        setSelectedConnectionId((current) => current || data[0]?.id || null);
      } catch (error) {
        setConnectionError(error.message);
        setConnections([]);
      } finally {
        setIsLoadingConnections(false);
      }
    };

    setMode("select");
    setTestState("idle");
    setAssets([]);
    setSelectedAssetName("");
    loadConnections();
  }, [isOpen]);

  useEffect(() => {
    setTestState("idle");
    setAssets([]);
    setSelectedAssetName("");
  }, [selectedConnectionId]);

  const loadAssets = async (connection) => {
    if (!connection) return;

    setIsLoadingAssets(true);
    setAssets([]);
    setSelectedAssetName("");

    try {
      const payload =
        connection.type === "mongodb"
          ? await connectionApi.fetchMongoDBCollections(connection.id)
          : await connectionApi.fetchSourceTables(connection.id);
      const normalized = normalizeAssets(payload, connection);
      const nextAssets = normalized.length > 0 ? normalized : fallbackAssets(connection);
      setAssets(nextAssets);
      setSelectedAssetName(nextAssets[0]?.name || "");
    } catch (error) {
      const fallback = fallbackAssets(connection);
      setAssets(fallback);
      setSelectedAssetName(fallback[0]?.name || "");
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedConnection) return;

    setTestState("testing");
    window.setTimeout(() => {
      setTestState("success");
      loadAssets(selectedConnection);
    }, 650);
  };

  const handleConnectionCreated = (newConnection) => {
    setConnections((current) => {
      const withoutDuplicate = current.filter((connection) => connection.id !== newConnection.id);
      return [newConnection, ...withoutDuplicate];
    });
    setSelectedConnectionId(newConnection.id);
    setMode("select");
    setTestState("success");
    loadAssets(newConnection);
  };

  const canProceed = selectedConnection && selectedAsset && testState === "success";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-gray-900/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              새 파이프라인 만들기
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              먼저 소스 연결과 원본 데이터를 선택하세요
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="border-b border-gray-200 bg-gray-50 p-4 lg:border-b-0 lg:border-r">
            <div className="space-y-3">
              {[
                ["1", "소스 연결", "기존 연결 선택 또는 새 연결 생성"],
                ["2", "원본 선택", "테이블, 컬렉션, 토픽, 경로 지정"],
                ["3", "캔버스 구성", "선택한 소스로 빌더 시작"],
              ].map(([step, title, detail], index) => (
                <div key={step} className="flex gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 || (index === 1 && testState === "success")
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-500 ring-1 ring-gray-200"
                    }`}
                  >
                    {step}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-gray-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto p-5">
            {mode === "create" ? (
              <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">새 연결 만들기</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      생성한 연결은 바로 이 파이프라인의 소스로 선택됩니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode("select")}
                    className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    기존 연결 선택
                  </button>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <ConnectionForm onSuccess={handleConnectionCreated} onCancel={() => setMode("select")} />
                </div>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <section className="min-w-0">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">소스 연결 선택</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        연결을 고른 뒤 확인하면 사용할 원본 목록이 표시됩니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode("create")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4" />
                      새 연결 만들기
                    </button>
                  </div>

                  {isLoadingConnections ? (
                    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-12 text-sm text-gray-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      연결을 불러오는 중
                    </div>
                  ) : connectionError ? (
                    <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                      {connectionError}
                    </div>
                  ) : connections.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                      <Database className="mx-auto h-10 w-10 text-gray-300" />
                      <h4 className="mt-3 text-sm font-semibold text-gray-900">아직 연결이 없습니다</h4>
                      <button
                        type="button"
                        onClick={() => setMode("create")}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        첫 연결 만들기
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connections.map((connection) => {
                        const isSelected = connection.id === selectedConnectionId;

                        return (
                          <button
                            key={connection.id}
                            type="button"
                            onClick={() => setSelectedConnectionId(connection.id)}
                            className={`w-full rounded-lg border p-4 text-left transition-colors ${
                              isSelected
                                ? "border-blue-300 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                    {getTypeLabel(connection.type)}
                                  </span>
                                  {connection.status === "connected" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      연결됨
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 truncate text-sm font-bold text-gray-900">
                                  {connection.name}
                                </p>
                                <p className="mt-1 truncate text-xs text-gray-500">
                                  {getConnectionDetail(connection)}
                                </p>
                              </div>
                              <span
                                className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
                                  isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={!selectedConnection || testState === "testing"}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${testState === "testing" ? "animate-spin" : ""}`} />
                      {testState === "testing" ? "확인 중" : "연결 확인"}
                    </button>
                    {testState === "success" && (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        원본을 선택할 수 있습니다
                      </span>
                    )}
                  </div>
                </section>

                <section className="min-w-0 rounded-lg border border-gray-200 bg-white">
                  <div className="border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Table2 className="h-4 w-4 text-gray-400" />
                      <h3 className="text-sm font-bold text-gray-900">원본 데이터 선택</h3>
                    </div>
                  </div>

                  {testState !== "success" ? (
                    <div className="p-5 text-sm leading-6 text-gray-500">
                      연결 확인 후 사용할 원본 데이터가 표시됩니다.
                    </div>
                  ) : isLoadingAssets ? (
                    <div className="flex items-center justify-center p-8 text-sm text-gray-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      원본을 불러오는 중
                    </div>
                  ) : assets.length === 0 ? (
                    <div className="p-5 text-sm text-gray-500">선택 가능한 원본이 없습니다.</div>
                  ) : (
                    <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">
                      {assets.map((asset) => {
                        const isSelected = selectedAssetName === asset.name;

                        return (
                          <button
                            key={asset.name}
                            type="button"
                            onClick={() => setSelectedAssetName(asset.name)}
                            className={`w-full rounded-lg border p-3 text-left transition-colors ${
                              isSelected
                                ? "border-blue-300 bg-blue-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words text-sm font-semibold text-gray-900">
                                  {asset.name}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  {asset.description}
                                </p>
                              </div>
                              <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                                {asset.kind}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onManageConnections}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <AlertCircle className="h-4 w-4" />
            전체 연결 관리로 이동
          </button>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canProceed}
              onClick={() =>
                onProceed({
                  connection: selectedConnection,
                  asset: selectedAsset,
                  sourceType: selectedConnection?.type,
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              파이프라인 캔버스로 이동
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
