import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Database,
  GitBranch,
  Calendar,
  Clock,
  ArrowRight,
  Layers,
  RefreshCw,
  CheckCircle,
  Sparkles,
  Lock,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { formatFileSize } from "../../utils/formatters";

const ASKLAKE_DEMO_DATASET_ID = "ds-commerce-revenue-gold";

const isAskLakeDemoDataset = (item) =>
  item?.id === ASKLAKE_DEMO_DATASET_ID ||
  item?.name === "월별 상품 매출 Gold Dataset" ||
  item?.created_from_pipeline_demo ||
  (item?.layer === "gold" && item?.tags?.includes("revenue"));


export default function CatalogPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      // Get session ID for permission filtering
      const sessionId = sessionStorage.getItem('sessionId');
      const sessionParam = sessionId ? `?session_id=${sessionId}` : '';

      // Fetch from catalog API which includes size_bytes, row_count, format
      const response = await fetch(`${API_BASE_URL}/api/catalog${sessionParam}`);
      if (response.ok) {
        const data = await response.json();
        // Sort by updated_at descending (newest first)
        const sortedData = data.sort((a, b) => {
          const aIsDemo = isAskLakeDemoDataset(a);
          const bIsDemo = isAskLakeDemoDataset(b);
          if (aIsDemo && bIsDemo) {
            return new Date(b.updated_at) - new Date(a.updated_at);
          }
          if (aIsDemo) return -1;
          if (bIsDemo) return 1;
          return new Date(b.updated_at) - new Date(a.updated_at);
        });
        setCatalog(sortedData);
      } else {
        setCatalog([]);
      }
    } catch (error) {
      console.error("Failed to fetch catalog:", error);
      setCatalog([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep filter chips focused on the data layer, not every technical tag.
  const allTags = ["bronze", "silver", "gold"].filter((tag) =>
    catalog.some((item) => item.tags?.includes(tag) || item.layer === tag)
  );

  // Filter catalog items
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || item.tags?.includes(selectedTag);

    return matchesSearch && matchesTag;
  });



  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">데이터 카탈로그</h1>
          <p className="text-gray-500 mt-1">타겟 데이터셋을 찾고 구조를 확인합니다</p>
        </div>
        <button
          onClick={fetchCatalog}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="이름, 설명, 태그로 카탈로그 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!selectedTag
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            전체
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTag === tag
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center text-gray-500">
          불러오는 중...
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>카탈로그 항목이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map((item) => {
            const isDemo = isAskLakeDemoDataset(item);
            const qualityScore = item.quality_score ?? item.quality?.score;
            return (
            <div
              key={item.id}
              onClick={() => navigate(`/catalog/${item.id}`, { state: { catalogItem: item } })}
              className={`bg-white rounded-lg shadow border transition-all cursor-pointer group ${
                isDemo
                  ? "border-blue-300 ring-2 ring-blue-50 hover:shadow-xl"
                  : "border-gray-200 hover:shadow-lg hover:border-blue-300"
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`shrink-0 rounded-lg p-2 ${isDemo ? "bg-blue-100" : "bg-orange-100"}`}>
                      {isDemo ? (
                        <Sparkles className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Database className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">{item.owner}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                {isDemo && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                      NEW
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      품질 {qualityScore ?? 100}%
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      <Lock className="h-3 w-3" />
                      마케터 권한 적용
                    </span>
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Sources */}
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">원본 데이터</p>
                    <div className="flex flex-wrap gap-1">
                      {item.sources?.slice(0, 3).map((source, idx) => {
                        const sourceName = typeof source === "string"
                          ? source.split(".").pop()
                          : source?.table || source?.name || "원본";
                        return (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                          >
                            {sourceName}
                          </span>
                        );
                      })}
                      {item.sources?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          외 {item.sources.length - 3}개
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target */}
                <div className="flex items-start gap-2">
                  <GitBranch className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">타겟 데이터</p>
                    <p className="text-xs text-gray-700 font-mono truncate">
                      {(() => {
                        let path = typeof item.target === "string"
                          ? item.target
                          : item.destination?.path || item.target?.path || "S3";

                        if (path !== "S3" && item.name && !path.endsWith(item.name)) {
                          if (!path.endsWith("/")) path += "/";
                          path += item.name;
                        }
                        return path;
                      })()}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatFileSize(item.size_bytes)}
                    </p>
                    <p className="text-xs text-gray-500">크기</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{item.format}</p>
                    <p className="text-xs text-gray-500">형식</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 rounded-b-lg flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{item.schedule}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
