import { useState } from "react";
import {
  Globe,
  ChevronDown,
  Check,
  Clock,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { apiSourceApi } from "../../services/apiSourceApi";

export default function APISourceConfig({
  connectionId,
  endpoint = "",
  method = "GET",
  queryParams = {},
  paginationType = "none",
  paginationConfig = {},
  responsePath = "",
  incrementalEnabled = false,
  timestampParam = "",
  startFromDate = "",
  sourceDatasetId = null,
  onEndpointChange,
  onMethodChange,
  onQueryParamsChange,
  onPaginationChange,
  onResponsePathChange,
  onIncrementalChange,
  onColumnsChange,
}) {
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [isPaginationOpen, setIsPaginationOpen] = useState(false);

  // Preview state
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);

  const methodOptions = [{ value: "GET", label: "GET" }];

  const paginationTypes = [
    {
      value: "none",
      label: "페이지네이션 없음",
      description: "단일 요청으로 가져오기",
    },
    {
      value: "offset_limit",
      label: "오프셋/제한",
      description: "offset=0&limit=100",
    },
    { value: "page", label: "페이지 번호", description: "page=1&per_page=100" },
    {
      value: "cursor",
      label: "커서 기반",
      description: "cursor=next_token",
    },
  ];

  const selectedMethod =
    methodOptions.find((m) => m.value === method) || methodOptions[0];
  const selectedPagination =
    paginationTypes.find((p) => p.value === paginationType) ||
    paginationTypes[0];

  const handlePaginationTypeChange = (newType) => {
    onPaginationChange({
      type: newType,
      config: getDefaultPaginationConfig(newType),
    });
  };

  const getDefaultPaginationConfig = (type) => {
    switch (type) {
      case "offset_limit":
        return {
          offset_param: "offset",
          limit_param: "limit",
          page_size: 100,
          start_offset: 0,
        };
      case "page":
        return {
          page_param: "page",
          per_page_param: "per_page",
          page_size: 100,
          start_page: 1,
        };
      case "cursor":
        return {
          cursor_param: "cursor",
          next_cursor_path: "",
          start_cursor: "",
        };
      default:
        return {};
    }
  };

  const updatePaginationConfig = (key, value) => {
    onPaginationChange({
      type: paginationType,
      config: {
        ...paginationConfig,
        [key]: value,
      },
    });
  };

  const handleFetchPreview = async () => {
    if (!connectionId) {
      setPreviewError("먼저 연결을 선택해주세요");
      return;
    }

    if (!endpoint) {
      setPreviewError("API 엔드포인트를 입력해주세요");
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);

    try {
      // Always use testConnection - only needs connection + endpoint
      const result = await apiSourceApi.testConnection({
        connectionId,
        endpoint,
        method,
        queryParams,
        pagination: {
          type: paginationType,
          config: paginationConfig,
        },
        responsePath,
        limit: 10,
      });

      setPreviewData(result.data);

      // Update columns with inferred schema
      if (onColumnsChange) {
        onColumnsChange(result.schema);
      }
    } catch (err) {
      console.error("미리보기 가져오기 실패:", err);
      setPreviewError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (!connectionId) {
    return (
      <div className="flex items-center gap-3 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Globe className="w-5 h-5 text-yellow-600" />
        <p className="text-sm text-yellow-700">
          API 소스를 설정하려면 먼저 연결을 선택해주세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Endpoint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          엔드포인트 경로 *
        </label>
        <input
          type="text"
          value={endpoint}
          onChange={(e) => onEndpointChange(e.target.value)}
          placeholder="/api/users or /v1/data"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          API 엔드포인트 경로입니다. 기본 URL은 연결 설정에서 관리됩니다.
        </p>
      </div>

      {/* HTTP Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HTTP 메서드
        </label>
        <div className="relative">
          <button
            onClick={() => setIsMethodOpen(!isMethodOpen)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-left"
          >
            <span className="text-gray-900">{selectedMethod.label}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isMethodOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isMethodOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-auto py-1">
              {methodOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (!option.disabled) {
                      onMethodChange(option.value);
                      setIsMethodOpen(false);
                    }
                  }}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between ${
                    option.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-emerald-50 transition-colors"
                  } ${
                    method === option.value
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>{option.label}</span>
                  {method === option.value && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Response Data Path (JSONPath) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          응답 데이터 경로 (JSONPath)
        </label>
        <input
          type="text"
          value={responsePath}
          onChange={(e) => onResponsePathChange(e.target.value)}
          placeholder="data or results or $.data[*]"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          응답에서 데이터를 추출할 JSONPath입니다. 응답 자체가 배열이면 비워두세요.
        </p>
      </div>

      {/* Pagination Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          페이지네이션 방식
        </label>
        <div className="relative">
          <button
            onClick={() => setIsPaginationOpen(!isPaginationOpen)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-left"
          >
            <div>
              <div className="text-gray-900 font-medium">
                {selectedPagination.label}
              </div>
              <div className="text-xs text-gray-500">
                {selectedPagination.description}
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isPaginationOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isPaginationOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-auto py-1">
              {paginationTypes.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    handlePaginationTypeChange(option.value);
                    setIsPaginationOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-emerald-50 transition-colors ${
                    paginationType === option.value
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination Config Fields */}
      {paginationType === "offset_limit" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            오프셋/제한 설정
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                오프셋 파라미터명
              </label>
              <input
                type="text"
                value={paginationConfig.offset_param || "offset"}
                onChange={(e) =>
                  updatePaginationConfig("offset_param", e.target.value)
                }
                placeholder="offset"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                제한 파라미터명
              </label>
              <input
                type="text"
                value={paginationConfig.limit_param || "limit"}
                onChange={(e) =>
                  updatePaginationConfig("limit_param", e.target.value)
                }
                placeholder="limit"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                페이지 크기
              </label>
              <input
                type="number"
                value={paginationConfig.page_size || 100}
                onChange={(e) =>
                  updatePaginationConfig(
                    "page_size",
                    parseInt(e.target.value) || 100
                  )
                }
                min="1"
                max="1000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                시작 오프셋
              </label>
              <input
                type="number"
                value={paginationConfig.start_offset || 0}
                onChange={(e) =>
                  updatePaginationConfig(
                    "start_offset",
                    parseInt(e.target.value) || 0
                  )
                }
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {paginationType === "page" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            페이지 번호 설정
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                페이지 파라미터명
              </label>
              <input
                type="text"
                value={paginationConfig.page_param || "page"}
                onChange={(e) =>
                  updatePaginationConfig("page_param", e.target.value)
                }
                placeholder="page"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                페이지당 개수 파라미터명
              </label>
              <input
                type="text"
                value={paginationConfig.per_page_param || "per_page"}
                onChange={(e) =>
                  updatePaginationConfig("per_page_param", e.target.value)
                }
                placeholder="per_page"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                페이지 크기
              </label>
              <input
                type="number"
                value={paginationConfig.page_size || 100}
                onChange={(e) =>
                  updatePaginationConfig(
                    "page_size",
                    parseInt(e.target.value) || 100
                  )
                }
                min="1"
                max="1000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                시작 페이지
              </label>
              <input
                type="number"
                value={paginationConfig.start_page || 1}
                onChange={(e) =>
                  updatePaginationConfig(
                    "start_page",
                    parseInt(e.target.value) || 1
                  )
                }
                min="1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {paginationType === "cursor" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            커서 기반 설정
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                커서 파라미터명
              </label>
              <input
                type="text"
                value={paginationConfig.cursor_param || "cursor"}
                onChange={(e) =>
                  updatePaginationConfig("cursor_param", e.target.value)
                }
                placeholder="cursor"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                다음 커서 JSONPath
              </label>
              <input
                type="text"
                value={paginationConfig.next_cursor_path || ""}
                onChange={(e) =>
                  updatePaginationConfig("next_cursor_path", e.target.value)
                }
                placeholder="metadata.next_cursor or $.pagination.next"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                응답에서 다음 커서를 추출할 경로입니다.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                시작 커서 (선택)
              </label>
              <input
                type="text"
                value={paginationConfig.start_cursor || ""}
                onChange={(e) =>
                  updatePaginationConfig("start_cursor", e.target.value)
                }
                placeholder="처음부터 시작하려면 비워두세요"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Incremental Load Settings */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              증분 적재
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={incrementalEnabled}
              onChange={(e) =>
                onIncrementalChange({
                  enabled: e.target.checked,
                  timestampParam,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          타임스탬프 쿼리 파라미터를 사용해 신규 또는 수정 레코드만 가져옵니다.
          API 호출 수를 줄이고 성능을 개선할 수 있습니다.
        </p>

        {incrementalEnabled && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-emerald-900 mb-2">
                타임스탬프 쿼리 파라미터 *
              </label>
              <input
                type="text"
                value={timestampParam}
                onChange={(e) =>
                  onIncrementalChange({
                    enabled: incrementalEnabled,
                    timestampParam: e.target.value,
                    startFromDate,
                  })
                }
                placeholder="since, updated_after, from_date, etc."
                className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="mt-2 text-xs text-emerald-700">
                API에서 타임스탬프 기준 필터링에 사용하는 파라미터명입니다. 예:{" "}
                <code className="px-1 py-0.5 bg-emerald-100 rounded">
                  since
                </code>{" "}
                (GitHub),{" "}
                <code className="px-1 py-0.5 bg-emerald-100 rounded">
                  updated_after
                </code>{" "}
                (기타 API)
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-900 mb-2">
                시작 기준일 (선택)
              </label>
              <input
                type="datetime-local"
                value={startFromDate}
                onChange={(e) =>
                  onIncrementalChange({
                    enabled: incrementalEnabled,
                    timestampParam,
                    startFromDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="mt-2 text-xs text-emerald-700">
                첫 실행 시 전체 과거 데이터 대신 이 날짜 이후 데이터부터 가져옵니다.
                전체를 가져오려면 비워두세요.
              </p>
            </div>

            <div className="bg-white border border-emerald-200 rounded-lg p-3">
              <p className="text-xs font-medium text-emerald-900 mb-1">
                동작 방식:
              </p>
              <ul className="text-xs text-emerald-700 space-y-1 list-disc list-inside">
                <li>
                  첫 실행:{" "}
                  {startFromDate
                    ? `${new Date(
                        startFromDate
                      ).toLocaleDateString()} 이후 데이터 가져오기`
                    : "전체 과거 데이터 가져오기"}
                </li>
                <li>
                  이후 실행: 마지막 동기화 시각 이후 데이터만 가져오기
                </li>
                <li>
                  예시:{" "}
                  <code className="px-1 py-0.5 bg-emerald-100 rounded">
                    ?{timestampParam || "since"}=
                    {startFromDate
                      ? new Date(startFromDate).toISOString()
                      : "2026-01-10T12:00:00"}
                  </code>
                </li>
              </ul>
            </div>
          </div>
        )}

        {!incrementalEnabled && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>전체 적재 방식:</strong> 실행할 때마다 API에서 전체 데이터를 가져옵니다.
              신규/수정 레코드만 가져오려면 증분 적재를 켜세요.
            </p>
          </div>
        )}
      </div>

      {/* API Preview Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              API 연결 테스트
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              API 설정을 바로 테스트하고 스키마를 자동으로 추론합니다
            </p>
          </div>
          {!previewData && (
            <button
              onClick={handleFetchPreview}
              disabled={previewLoading || !connectionId || !endpoint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title={
                !connectionId
                  ? "먼저 연결을 선택하세요"
                  : !endpoint
                  ? "엔드포인트를 입력하세요"
                  : "API 연결 테스트"
              }
            >
              {previewLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  불러오는 중...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  미리보기 가져오기
                </>
              )}
            </button>
          )}
        </div>

        {/* Error State */}
        {previewError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800">
                  미리보기 가져오기 실패
                </h4>
                <p className="text-sm text-red-600 mt-1">{previewError}</p>
                <button
                  onClick={handleFetchPreview}
                  disabled={previewLoading}
                  className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {previewData && (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800">
                  미리보기를 불러왔습니다
                </h4>
                <p className="text-sm text-green-600 mt-1">
                  API에서 가져온 샘플 {previewData.length}건을 표시합니다.
                  스키마가 추론되어 저장되었습니다.
                </p>
              </div>
              <button
                onClick={handleFetchPreview}
                disabled={previewLoading}
                className="text-sm font-medium text-green-700 hover:text-green-800 underline"
              >
                새로고침
              </button>
            </div>

            {/* Data Preview */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <div className="p-4">
                <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Schema Info */}
            <div className="text-sm text-gray-500">
              <strong>{Object.keys(previewData[0] || {}).length}</strong>{" "}
              개 컬럼 감지 및 저장
            </div>
          </div>
        )}

        {/* Initial State */}
        {!previewData && !previewError && !previewLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                {!connectionId || !endpoint
                  ? '위에서 API 연결과 엔드포인트를 설정한 뒤 "미리보기 가져오기"로 테스트하세요'
                  : '"미리보기 가져오기"를 눌러 API 설정을 테스트하고 스키마를 추론하세요'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
