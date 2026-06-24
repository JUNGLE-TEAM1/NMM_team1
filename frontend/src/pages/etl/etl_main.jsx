import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  ListChecks,
  Workflow,
} from "lucide-react";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import TargetImportModal from "../../components/etl/TargetImportModal";
import { useToast } from "../../components/common/Toast";
import { API_BASE_URL } from "../../config/api";
const ITEMS_PER_PAGE = 10;
const ASKLAKE_DEMO_DATASET_ID = "ds-commerce-revenue-gold";

const isGoldDataset = (job) =>
  job?.id === ASKLAKE_DEMO_DATASET_ID ||
  job?.layer === "gold" ||
  job?.name === "월별 상품 매출 Gold Dataset";

export default function ETLMain() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    jobId: null,
    jobName: "",
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const openFreshPipeline = () =>
    navigate("/etl/visual", { state: { startFromScratch: true } });

  // Filter jobs by search query
  const filteredJobs = jobs.filter(
    (job) =>
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description &&
        job.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations (based on filtered jobs)
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Fetch jobs when page is visited (location.key changes on each navigation)
  useEffect(() => {
    fetchJobs();
  }, [location.key]);

  // Check for openImport query parameter
  useEffect(() => {
    if (searchParams.get("openImport") === "true") {
      setShowImportModal(true);
      // Remove the query parameter
      searchParams.delete("openImport");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // Get session ID for permission filtering
      const sessionId = sessionStorage.getItem("sessionId");
      const sessionParam = sessionId ? `?session_id=${sessionId}` : "";

      // Fetch both datasets and source datasets with session_id for permission filtering
      const [etlResponse, sourceResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/datasets${sessionParam}`),
        fetch(`${API_BASE_URL}/api/source-datasets${sessionParam}`),
      ]);

      let allJobs = [];

      // Get ETL jobs
      if (etlResponse.ok) {
        const etlData = await etlResponse.json();
        allJobs = [...etlData];
      }

      // Get source datasets and add dataset_type marker
      if (sourceResponse.ok) {
        const sourceData = await sourceResponse.json();
        const markedSources = sourceData.map((src) => ({
          ...src,
          dataset_type: "source", // Mark as source dataset
        }));
        allJobs = [...allJobs, ...markedSources];
      }

      // Sort by updated_at descending (newest first)
      const sortedData = allJobs.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );
      setJobs(sortedData);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const { jobId, dataset_type } = deleteModal;

    try {
      // Determine which API to call based on dataset type
      const url =
        dataset_type === "source"
          ? `${API_BASE_URL}/api/source-datasets/${jobId}`
          : `${API_BASE_URL}/api/datasets/${jobId}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "데이터셋 삭제에 실패했습니다");
      }

      // Refresh the list after deletion
      fetchJobs();
      setCurrentPage(1);
      showToast("데이터셋을 삭제했습니다", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast(`삭제 실패: ${error.message}`, "error");
    }
  };

  const openDeleteModal = (jobId, jobName, dataset_type) => {
    setDeleteModal({ isOpen: true, jobId, jobName, dataset_type });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, jobId: null, jobName: "" });
  };

  return (
    <div className="min-h-screen max-w-full overflow-hidden bg-gray-50 px-4 pt-2 pb-6 sm:px-6">
      {/* Header with Create Button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="min-w-0 text-xl font-bold text-gray-900 sm:text-2xl">
            데이터 구축
          </h1>
        </div>
        <button
          onClick={openFreshPipeline}
          className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          새 파이프라인 만들기
        </button>
      </div>

      {/* Datasets Table */}
      <div className="max-w-full overflow-hidden rounded-lg bg-white shadow">
        {/* Header with Actions */}
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900">구축 중인 파이프라인</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              소스, 변환, 결과 데이터셋이 연결된 작업을 확인합니다.
            </p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="파이프라인 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>

        {/* Table or Empty State */}
        {jobs.length === 0 ? (
          /* Empty State */
          <div className="px-6 py-12 text-center">
            <div className="max-w-md mx-auto">
              <Workflow className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                구축 중인 파이프라인이 없습니다
              </h3>
              <p className="text-gray-600">
                새 파이프라인을 만들어 소스, 변환, 결과 데이터셋을 연결하세요.
              </p>
            </div>
          </div>
        ) : (
          /* Jobs Table */
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-[1040px] w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[17%] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    파이프라인 이름
                  </th>
                  <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    담당자
                  </th>
                  <th className="w-[11%] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    결과 유형
                  </th>
                  <th className="w-[8%] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    구축 상태
                  </th>
                  <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    실행 방식
                  </th>
                  <th className="w-[18%] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    목적
                  </th>
                  <th className="w-[17%] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    최근 수정일
                  </th>
                  <th className="w-[7%] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td
                      className="px-3 py-3 text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                      onClick={() => {
                        const datasetType = job.dataset_type || "source";
                        if (datasetType === "target") {
                          navigate(`/etl/job/${job.id}`);
                        } else {
                          navigate(`/source`, {
                            state: { jobId: job.id, editMode: true },
                          });
                        }
                      }}
                    >
                      <span className="block truncate" title={job.name}>
                        {job.name}
                      </span>
                      {isGoldDataset(job) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                            NEW
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            품질 100%
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                            <ShieldCheck className="h-3 w-3" />
                            권한 적용
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">
                      <span className="block truncate" title={job.owner || "-"}>
                        {job.owner || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {isGoldDataset(job) ? (
                        <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 whitespace-nowrap">
                          <Sparkles className="h-3 w-3" />
                          Gold Dataset
                        </span>
                      ) : (
                        <span
                          className={`inline-flex max-w-full items-center rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                            (job.dataset_type || "source") === "source"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {(job.dataset_type || "source") === "source"
                            ? "수집 대상"
                            : "결과 데이터셋"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span
                        className={`inline-flex max-w-full items-center rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                          job.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {job.is_active ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {job.job_type === "cdc" ? (
                        <span
                          className={`inline-flex max-w-full items-center rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                            job.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {job.is_active ? "CDC 활성" : "CDC 중지"}
                        </span>
                      ) : job.job_type === "streaming" ? (
                        <span className="inline-flex max-w-full items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800 whitespace-nowrap">
                          스트리밍
                        </span>
                      ) : (
                        <span className="inline-flex max-w-full items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 whitespace-nowrap">
                          배치
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">
                      <span className="block truncate" title={job.description || "-"}>
                        {job.description || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">
                      <span className="block truncate" title={(() => {
                        // Backend sends UTC time, ensure it's parsed correctly
                        const utcDate = new Date(job.updated_at + (job.updated_at.endsWith('Z') ? '' : 'Z'));
                        // Convert to KST (UTC+9)
                        return utcDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
                      })()}>
                        {(() => {
                          const utcDate = new Date(job.updated_at + (job.updated_at.endsWith('Z') ? '' : 'Z'));
                          return utcDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
                        })()}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(job.id, job.name, job.dataset_type);
                        }}
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination (if jobs exist) */}
        {jobs.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 text-sm text-gray-700">
              전체 {filteredJobs.length}개 중 {startIndex + 1}-
              {Math.min(endIndex, filteredJobs.length)} 표시
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                {currentPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="파이프라인 삭제"
        message={`"${deleteModal.jobName}" 파이프라인을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />

      {/* Target Import Modal */}
      <TargetImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}
