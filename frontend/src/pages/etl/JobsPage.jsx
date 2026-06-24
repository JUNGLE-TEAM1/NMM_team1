import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Search,
  RefreshCw,
  GitBranch,
  Calendar,
  X,
  Clock,
  Zap,
  Play,
  Copy,
  Check,
  CheckCircle2,
  Filter,
  FileText,
  History,
  Settings2,
  Timer,
  XCircle,
  Pause,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import SchedulesPanel from "../../components/etl/SchedulesPanel";
import { useToast } from "../../components/common/Toast/ToastContext";
import Combobox from "../../components/common/Combobox";

const JOB_TYPE_LABELS = {
  all: "전체 유형",
  batch: "정기 처리",
  cdc: "CDC",
  streaming: "실시간 스트리밍",
};

const STATUS_LABELS = {
  Running: "실행 중",
  Scheduled: "예약됨",
  Unscheduled: "예약 없음",
  Paused: "일시 중지",
};

const ACTIVE_STATE_LABELS = {
  all: "전체 상태",
  active: "활성",
  inactive: "비활성",
};

const IS_FRONTEND_ONLY = import.meta.env.VITE_FRONTEND_ONLY !== "false";

const RUN_STATUS_LABELS = {
  success: "성공",
  succeeded: "성공",
  failed: "실패",
  failure: "실패",
  running: "실행 중",
  pending: "대기 중",
};

// Schedule Edit Modal Component
function ScheduleModal({ isOpen, onClose, job, onSave }) {
  const [jobType, setJobType] = useState(job?.job_type || "batch");
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (job) {
      setJobType(job.job_type || "batch");
      // Convert existing schedule to schedules array format if needed
      if (job.schedule) {
        setSchedules([
          {
            id: Date.now(),
            name: "스케줄 1",
            cron: job.schedule,
            frequency: job.schedule_frequency,
          },
        ]);
      } else {
        setSchedules([]);
      }
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleSave = () => {
    onSave(job.id, { jobType, schedules });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                스케줄 수정
              </h3>
              <p className="text-sm text-gray-500">{job.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Job Type Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">작업 유형</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setJobType("batch")}
                className={`relative p-4 rounded-lg border-2 text-left transition-all ${jobType === "batch"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock
                    className={`w-4 h-4 ${jobType === "batch" ? "text-blue-600" : "text-gray-400"
                      }`}
                  />
                  <span
                    className={`font-medium ${jobType === "batch" ? "text-blue-700" : "text-gray-700"
                      }`}
                  >
                    정기 처리
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  스케줄 또는 수동 실행으로 처리합니다
                </p>
              </button>

              <button
                onClick={() => setJobType("cdc")}
                className={`relative p-4 rounded-lg border-2 text-left transition-all ${jobType === "cdc"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap
                    className={`w-4 h-4 ${jobType === "cdc" ? "text-purple-600" : "text-gray-400"
                      }`}
                  />
                  <span
                    className={`font-medium ${jobType === "cdc" ? "text-purple-700" : "text-gray-700"
                      }`}
                  >
                    변경 데이터 캡처 (CDC)
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  변경 데이터를 실시간으로 동기화합니다
                </p>
              </button>
            </div>
          </div>

          {/* Schedule Configuration - Only for Batch */}
          {jobType === "batch" ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <SchedulesPanel
                schedules={schedules}
                onUpdate={(newSchedules) => setSchedules(newSchedules)}
              />
            </div>
          ) : (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">
                    CDC 실시간 모드
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    CDC 모드는 변경 데이터를 실시간으로 계속 동기화합니다.
                    별도의 스케줄 설정은 필요하지 않습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  );
}

// Schedule Display Badge
function ScheduleBadge({ job }) {
  if (job.job_type === "cdc") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
        <Zap className="w-3 h-3" />
        CDC
      </span>
    );
  }

  if (!job.schedule) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
        <Calendar className="w-3 h-3" />
        정기 처리
      </span>
    );
  }

  const getScheduleLabel = () => {
    switch (job.schedule_frequency) {
      case "daily":
        return "매일";
      case "hourly":
        return "매시간";
      case "weekly":
        return "매주";
      case "monthly":
        return "매월";
      case "interval":
        return "반복";
      default:
        return job.schedule;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
      <Clock className="w-3 h-3" />
      {getScheduleLabel()}
    </span>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [jobRuns, setJobRuns] = useState({}); // Store runs for each job by job ID
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamingStates, setStreamingStates] = useState({});
  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    job: null,
  });
  const [copiedId, setCopiedId] = useState(null);

  // Filter states
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const streamingJobs = jobs.filter((job) => job.job_type === "streaming");
    if (streamingJobs.length === 0) {
      setStreamingStates({});
      return;
    }

    let isCancelled = false;
    const fetchStatuses = async () => {
      try {
        const results = await Promise.all(
          streamingJobs.map(async (job) => {
            const response = await fetch(
              `${API_BASE_URL}/api/streaming/jobs/${job.id}/status`,
              { credentials: "include" }
            );
            if (!response.ok) {
              return { id: job.id, active: false };
            }
            const data = await response.json();
            return { id: job.id, active: data.status === "running" };
          })
        );

        if (isCancelled) return;
        const nextStates = {};
        results.forEach((item) => {
          nextStates[item.id] = item.active;
        });
        setStreamingStates(nextStates);
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch streaming status:", error);
        }
      }
    };

    fetchStatuses();
    return () => {
      isCancelled = true;
    };
  }, [jobs]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // Get session ID for permission filtering
      const sessionId = sessionStorage.getItem('sessionId');
      const sessionParam = sessionId ? `?session_id=${sessionId}` : '';

      const response = await fetch(`${API_BASE_URL}/api/datasets${sessionParam}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Filter only target datasets
        const targetJobs = data.filter((job) => job.dataset_type === "target");
        // Sort by updated_at descending (newest first)
        const sortedJobs = targetJobs.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setJobs(sortedJobs);
        // Fetch all runs in ONE bulk request (instead of N requests)
        if (sortedJobs.length > 0) {
          const datasetIds = sortedJobs.map((job) => job.id).join(",");
          try {
            const runsResponse = await fetch(
              `${API_BASE_URL}/api/job-runs/bulk?dataset_ids=${datasetIds}&limit=10`
            );
            if (runsResponse.ok) {
              const runsData = await runsResponse.json();
              setJobRuns(runsData); // Already grouped by dataset_id
            }
          } catch (error) {
            console.error("Failed to fetch job runs:", error);
          }
        }
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSave = (jobId, { jobType, schedules }) => {
    // Update local state (in real app, would call API)
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            job_type: jobType,
            schedule: schedules[0]?.cron || null,
            schedule_frequency: schedules[0]?.frequency || null,
          };
        }
        return job;
      })
    );
    console.log("Schedule saved:", { jobId, jobType, schedules });
  };

  const createDemoRun = (jobId, status) => ({
    id: `demo-run-${jobId}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    dataset_id: jobId,
    status,
    started_at: new Date().toISOString(),
    finished_at: status === "running" ? null : new Date().toISOString(),
    duration_seconds: status === "running" ? null : 138,
    airflow_run_id: `frontend_demo_${Date.now()}`,
  });

  const prependDemoRun = (jobId, run) => {
    setJobRuns((prev) => ({
      ...prev,
      [jobId]: [run, ...(prev[jobId] || [])].slice(0, 10),
    }));
  };

  const completeDemoRun = (jobId, runId) => {
    setJobRuns((prev) => ({
      ...prev,
      [jobId]: (prev[jobId] || []).map((run) =>
        run.id === runId
          ? {
              ...run,
              status: "success",
              finished_at: new Date().toISOString(),
              duration_seconds: 138,
            }
          : run
      ),
    }));
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, updated_at: new Date().toISOString() } : job
      )
    );
  };

  const handleToggle = async (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    if (job.job_type === "streaming") return;

    const newActiveState = !job.is_active;

    if (IS_FRONTEND_ONLY) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, is_active: newActiveState } : j
        )
      );
      showToast(
        newActiveState ? "스케줄을 활성화했습니다" : "스케줄을 중지했습니다",
        "success"
      );
      return;
    }

    try {
      // If job has a schedule, use activate/deactivate API
      if (job.schedule) {
        const endpoint = newActiveState ? "activate" : "deactivate";
        const response = await fetch(
          `${API_BASE_URL}/api/datasets/${jobId}/${endpoint}`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          setJobs((prev) =>
            prev.map((j) => {
              if (j.id === jobId) {
                return { ...j, is_active: newActiveState };
              }
              return j;
            })
          );

          // Show toast
          showToast(
            newActiveState ? "작업을 활성화했습니다" : "작업을 비활성화했습니다",
            "success"
          );
        } else {
          console.error("Failed to toggle job status");
          showToast("스케줄 상태를 변경하지 못했습니다", "error");
        }
      } else {
        // Manual job: update Dataset's is_active field
        // First, find the dataset by job_id
        const datasetsResponse = await fetch(`${API_BASE_URL}/api/catalog`);
        if (datasetsResponse.ok) {
          const datasets = await datasetsResponse.json();
          const dataset = datasets.find((d) => d.job_id === jobId);

          if (dataset) {
            // Update dataset's is_active
            const updateResponse = await fetch(
              `${API_BASE_URL}/api/catalog/${dataset.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: newActiveState }),
              }
            );

            if (updateResponse.ok) {
              setJobs((prev) =>
                prev.map((j) => {
                  if (j.id === jobId) {
                    return { ...j, is_active: newActiveState };
                  }
                  return j;
                })
              );
              showToast(
                newActiveState ? "작업을 활성화했습니다" : "작업을 비활성화했습니다",
                "success"
              );
            } else {
              console.error("Failed to update dataset status");
              showToast("작업 상태를 업데이트하지 못했습니다", "error");
            }
          } else {
            // No dataset found, just update local state
            setJobs((prev) =>
              prev.map((j) => {
                if (j.id === jobId) {
                  return { ...j, is_active: newActiveState };
                }
                return j;
              })
            );
            showToast(
              newActiveState ? "작업을 활성화했습니다" : "작업을 비활성화했습니다",
              "success"
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle job:", error);
      showToast("네트워크 오류: 스케줄 상태를 변경하지 못했습니다", "error");
    }
  };

  const handleRun = async (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    if (IS_FRONTEND_ONLY) {
      if (job.job_type === "streaming") {
        const isActive = !!streamingStates[jobId];
        setStreamingStates((prev) => ({ ...prev, [jobId]: !isActive }));

        if (isActive) {
          setJobRuns((prev) => ({
            ...prev,
            [jobId]: (prev[jobId] || []).map((run, index) =>
              index === 0 && run.status === "running"
                ? {
                    ...run,
                    status: "success",
                    finished_at: new Date().toISOString(),
                    duration_seconds: 138,
                  }
                : run
            ),
          }));
          showToast("스트리밍을 중지했습니다", "success");
        } else {
          prependDemoRun(jobId, createDemoRun(jobId, "running"));
          showToast("스트리밍을 시작했습니다", "success");
        }
        return;
      }

      const runningRun = createDemoRun(jobId, "running");
      prependDemoRun(jobId, runningRun);
      showToast("파이프라인 실행을 시작했습니다", "success");

      window.setTimeout(() => {
        completeDemoRun(jobId, runningRun.id);
        showToast("파이프라인 실행이 완료되었습니다", "success");
      }, 1600);
      return;
    }

    try {
      if (job?.job_type === "streaming") {
        const isActive = !!streamingStates[jobId];
        const endpoint = isActive ? "stop" : "start";
        const response = await fetch(
          `${API_BASE_URL}/api/streaming/jobs/${jobId}/${endpoint}`,
          { method: "POST" }
        );

        if (response.ok) {
          setStreamingStates((prev) => ({ ...prev, [jobId]: !isActive }));
          showToast(
            isActive
              ? "실시간 스트리밍 작업을 일시 중지했습니다"
              : "실시간 스트리밍 작업을 시작했습니다",
            "success"
          );
        } else {
          showToast("실시간 스트리밍 작업을 업데이트하지 못했습니다", "error");
        }
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/datasets/${jobId}/run`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Job triggered:", result);
        showToast("작업을 시작했습니다", "success");
        // Refresh jobs to update status
        fetchJobs();
      } else {
        console.error("Failed to run job");
        showToast("작업을 시작하지 못했습니다", "error");
      }
    } catch (error) {
      console.error("Failed to run job:", error);
      showToast("네트워크 오류: 작업을 시작하지 못했습니다", "error");
    }
  };

  const handleCopyId = async (id, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "-";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}시간 ${mins}분`;
    } else if (mins > 0) {
      return `${mins}분 ${secs}초`;
    }
    return `${secs}초`;
  };

  const getLatestRun = (job) => jobRuns[job.id]?.[0] || null;

  const getRunDuration = (run) => {
    if (!run) return "-";
    if (run.duration_seconds !== undefined && run.duration_seconds !== null) {
      return formatDuration(run.duration_seconds);
    }
    if (!run.started_at) return "-";

    const startTime = new Date(
      run.started_at + (run.started_at.endsWith("Z") ? "" : "Z")
    );
    let endTime;

    if (run.status === "running" || run.status === "pending") {
      endTime = new Date();
    } else if (run.ended_at || run.finished_at) {
      const endStr = run.ended_at || run.finished_at;
      endTime = new Date(endStr + (endStr.endsWith("Z") ? "" : "Z"));
    } else {
      return "-";
    }

    const diffSec = Math.max(0, Math.floor((endTime - startTime) / 1000));
    return formatDuration(diffSec);
  };

  const getRelativeRunTime = (run) => {
    if (!run?.started_at) return "-";
    const startedAt = new Date(
      run.started_at + (run.started_at.endsWith("Z") ? "" : "Z")
    );
    const diffMs = Date.now() - startedAt.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) return "방금 전";
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${Math.floor(diffHours / 24)}일 전`;
  };

  const getRunStatusTone = (status) => {
    if (status === "success" || status === "succeeded") return "green";
    if (status === "failed" || status === "failure") return "red";
    if (status === "running") return "blue";
    if (status === "pending") return "yellow";
    return "gray";
  };

  const getRunStatusClass = (tone) => {
    if (tone === "green") return "bg-green-100 text-green-800";
    if (tone === "red") return "bg-red-100 text-red-800";
    if (tone === "blue") return "bg-blue-100 text-blue-800";
    if (tone === "yellow") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-600";
  };

  const getNextRunLabel = (job) => {
    if (job.job_type === "streaming") {
      return streamingStates[job.id] ? "계속 실행 중" : "중지됨";
    }
    if (!job.is_active) return "중지됨";
    if (!job.schedule) return "수동 실행";

    switch (job.schedule_frequency) {
      case "daily":
        return "내일 같은 시간";
      case "hourly":
        return "다음 1시간 내";
      case "weekly":
        return "다음 주";
      case "monthly":
        return "다음 달";
      case "manual":
        return "수동 실행";
      default:
        return "예약됨";
    }
  };

  const getRunHistory = (job) => {
    const runs = jobRuns[job.id] || [];
    const fallback = job.is_active
      ? ["success", "success", "running"]
      : ["success", "success", "paused"];
    return (runs.length > 0 ? runs.map((run) => run.status) : fallback).slice(0, 5);
  };

  const formatRowCount = (value) => {
    if (!value && value !== 0) return "1.2억 건";
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1).replace(".0", "")}억 건`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1).replace(".0", "")}만 건`;
    }
    return `${value.toLocaleString()}건`;
  };

  const getProcessedRowsLabel = (job) => {
    if (job?.row_count) return formatRowCount(job.row_count);
    if (job?.name === "월별 상품 매출 Gold Dataset" || job?.id === "ds-commerce-revenue-gold") {
      return "248만 건";
    }
    return "-";
  };

  const getFreshness = (job) => {
    const latestRun = getLatestRun(job);
    const status = latestRun?.status;

    if (status === "failed" || status === "failure") {
      return { label: "지연", detail: "마지막 실행 실패", className: "bg-red-50 text-red-700 border-red-100" };
    }
    if (job.job_type === "streaming") {
      return streamingStates[job.id]
        ? { label: "실시간", detail: "이벤트 수신 중", className: "bg-blue-50 text-blue-700 border-blue-100" }
        : { label: "중지", detail: "스트림 정지", className: "bg-gray-50 text-gray-600 border-gray-200" };
    }
    if (!latestRun?.started_at) {
      return { label: "미확인", detail: "실행 기록 없음", className: "bg-gray-50 text-gray-600 border-gray-200" };
    }

    const startedAt = new Date(
      latestRun.started_at + (latestRun.started_at.endsWith("Z") ? "" : "Z")
    );
    const diffMinutes = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 60000));

    if (diffMinutes <= 15) {
      return { label: "정상", detail: "15분 이내 갱신", className: "bg-green-50 text-green-700 border-green-100" };
    }
    if (diffMinutes <= 60) {
      return { label: "주의", detail: "1시간 이내 갱신", className: "bg-amber-50 text-amber-700 border-amber-100" };
    }
    return { label: "지연", detail: "1시간 이상 미갱신", className: "bg-red-50 text-red-700 border-red-100" };
  };

  const getPipelineSteps = (run) => {
    const status = run?.status || "success";
    const baseSteps = ["소스 읽기", "변환", "품질 검사", "카탈로그 등록"];

    if (status === "failed" || status === "failure") {
      return baseSteps.map((label, index) => ({
        label,
        state: index === 0 ? "done" : index === 1 ? "error" : "waiting",
      }));
    }

    if (status === "running" || status === "pending") {
      return baseSteps.map((label, index) => ({
        label,
        state: index === 0 ? "done" : index === 1 ? "running" : "waiting",
      }));
    }

    return baseSteps.map((label) => ({ label, state: "done" }));
  };

  const getStepClasses = (state) => {
    if (state === "done") return "border-green-200 bg-green-50 text-green-700";
    if (state === "running") return "border-blue-200 bg-blue-50 text-blue-700";
    if (state === "error") return "border-red-200 bg-red-50 text-red-700";
    return "border-gray-200 bg-gray-50 text-gray-500";
  };

  const getFailureReasonItems = () => {
    if (failedJobs.length > 0) {
      return failedJobs.slice(0, 3).map((job, index) => ({
        title: ["스키마 불일치", "소스 연결 실패", "권한 오류"][index] || "실행 실패",
        description: job.name,
      }));
    }

    return [
      { title: "스키마 불일치", description: "현재 감지된 항목 없음" },
      { title: "소스 연결 실패", description: "현재 감지된 항목 없음" },
      { title: "권한 오류", description: "현재 감지된 항목 없음" },
    ];
  };

  const getJobStatus = (job, runs) => {
    // CDC job
    if (job.job_type === "cdc") {
      if (!job.is_active) {
        return { label: "Paused", color: "yellow" };
      }
      // Check if there's an active run
      const hasActiveRun =
        runs &&
        runs.length > 0 &&
        (runs[0].status === "running" || runs[0].status === "pending");
      return hasActiveRun
        ? { label: "Running", color: "green" }
        : { label: "Scheduled", color: "blue" };
    }

    // Streaming job
    if (job.job_type === "streaming") {
      return streamingStates[job.id]
        ? { label: "Running", color: "green" }
        : { label: "Paused", color: "yellow" };
    }

    // Batch job with schedule
    if (job.schedule) {
      if (!job.is_active) {
        return { label: "Paused", color: "yellow" };
      }

      // Toggle is ON - check if there's an active run
      const hasActiveRun =
        runs &&
        runs.length > 0 &&
        (runs[0].status === "running" || runs[0].status === "pending");

      return hasActiveRun
        ? { label: "Running", color: "green" }
        : { label: "Scheduled", color: "blue" };
    }

    // No schedule (manual job)
    return { label: "Unscheduled", color: "gray" };
  };

  const filteredJobs = jobs.filter((job) => {
    // Search filter
    const matchesSearch =
      job.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Job type filter
    const matchesJobType =
      jobTypeFilter === "all" ||
      (jobTypeFilter === "batch" && job.job_type === "batch") ||
      (jobTypeFilter === "cdc" && job.job_type === "cdc") ||
      (jobTypeFilter === "streaming" && job.job_type === "streaming");

    // Status filter
    const jobStatus = getJobStatus(job, jobRuns[job.id]);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "running" && jobStatus.label === "Running") ||
      (statusFilter === "scheduled" && jobStatus.label === "Scheduled") ||
      (statusFilter === "unscheduled" && jobStatus.label === "Unscheduled") ||
      (statusFilter === "paused" && jobStatus.label === "Paused");

    // Active filter
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && job.is_active) ||
      (activeFilter === "inactive" && !job.is_active);

    return matchesSearch && matchesJobType && matchesStatus && matchesActive;
  });

  const runningCount = jobs.filter(
    (job) => getJobStatus(job, jobRuns[job.id]).label === "Running"
  ).length;
  const scheduledCount = jobs.filter(
    (job) => getJobStatus(job, jobRuns[job.id]).label === "Scheduled"
  ).length;
  const pausedCount = jobs.filter(
    (job) => getJobStatus(job, jobRuns[job.id]).label === "Paused"
  ).length;
  const successCount = jobs.filter((job) => {
    const status = getLatestRun(job)?.status;
    return status === "success" || status === "succeeded";
  }).length;
  const failedJobs = jobs.filter((job) => {
    const status = getLatestRun(job)?.status;
    return status === "failed" || status === "failure";
  });
  const unscheduledJobs = jobs.filter(
    (job) => getJobStatus(job, jobRuns[job.id]).label === "Unscheduled"
  );
  const featuredJob =
    jobs.find((job) => job.id === "ds-commerce-revenue-gold") ||
    jobs.find((job) => job.name === "월별 상품 매출 Gold Dataset") ||
    jobs[0] ||
    null;
  const featuredRun =
    (featuredJob && getLatestRun(featuredJob)) ||
    (featuredJob
      ? {
          status: "success",
          started_at: new Date(Date.now() - 3 * 60000).toISOString(),
          duration_seconds: 138,
        }
      : null);
  const featuredRunTone = getRunStatusTone(featuredRun?.status);
  const featuredFreshness = featuredJob
    ? getFreshness(featuredJob)
    : { label: "정상", detail: "15분 이내 갱신", className: "bg-green-50 text-green-700 border-green-100" };
  const pipelineSteps = getPipelineSteps(featuredRun);
  const failureReasonItems = getFailureReasonItems();

  const operationsSummary = [
    {
      label: "실행 중",
      value: runningCount,
      description: "현재 처리 중",
      icon: Activity,
      className: "border-blue-100 bg-blue-50 text-blue-700",
    },
    {
      label: "최근 성공",
      value: successCount,
      description: "마지막 실행 성공",
      icon: CheckCircle2,
      className: "border-green-100 bg-green-50 text-green-700",
    },
    {
      label: "실패/확인 필요",
      value: failedJobs.length,
      description: "조치가 필요한 실행",
      icon: AlertTriangle,
      className: "border-red-100 bg-red-50 text-red-700",
    },
    {
      label: "예약됨",
      value: scheduledCount,
      description: "스케줄 활성",
      icon: Calendar,
      className: "border-indigo-100 bg-indigo-50 text-indigo-700",
    },
    {
      label: "중지됨",
      value: pausedCount,
      description: "비활성/일시 중지",
      icon: Pause,
      className: "border-gray-200 bg-gray-50 text-gray-700",
    },
  ];

  const attentionItems = [
    {
      title: "실패한 실행",
      count: failedJobs.length,
      description: failedJobs[0]?.name || "실패한 파이프라인이 없습니다.",
      tone: failedJobs.length > 0 ? "text-red-700 bg-red-50 border-red-100" : "text-gray-600 bg-gray-50 border-gray-200",
    },
    {
      title: "스케줄 없음",
      count: unscheduledJobs.length,
      description: unscheduledJobs[0]?.name || "스케줄 미설정 작업이 없습니다.",
      tone: unscheduledJobs.length > 0 ? "text-amber-700 bg-amber-50 border-amber-100" : "text-gray-600 bg-gray-50 border-gray-200",
    },
    {
      title: "중지된 작업",
      count: pausedCount,
      description: jobs.find((job) => getJobStatus(job, jobRuns[job.id]).label === "Paused")?.name || "중지된 파이프라인이 없습니다.",
      tone: pausedCount > 0 ? "text-slate-700 bg-slate-50 border-slate-200" : "text-gray-600 bg-gray-50 border-gray-200",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">실행/모니터링</h1>
          <p className="text-gray-500 mt-1">
            파이프라인 실행 상태, 실패, 로그, 스케줄을 확인합니다.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {operationsSummary.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`rounded-lg border p-4 ${item.className}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs opacity-80">{item.description}</p>
                </div>
                <Icon className="h-5 w-5 shrink-0" />
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Activity className="h-3.5 w-3.5" />
                최근 실행
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {featuredJob?.name || "월별 상품 매출 Gold Dataset"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                데이터 구축에서 만든 파이프라인의 마지막 실행 상태를 확인하고 바로 조치합니다.
              </p>
            </div>
            <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${getRunStatusClass(featuredRunTone)}`}>
              {RUN_STATUS_LABELS[featuredRun?.status] || featuredRun?.status || "대기"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500">최근 실행</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{getRelativeRunTime(featuredRun)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500">소요 시간</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{getRunDuration(featuredRun)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500">처리량</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {featuredJob ? getProcessedRowsLabel(featuredJob) : "1.2억 건"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500">데이터 최신성</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {featuredFreshness.label}
              </p>
              <p className="mt-1 text-xs text-gray-500">{featuredFreshness.detail}</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">단계별 진행 상태</p>
              <span className="text-xs text-gray-500">소스 읽기 → 변환 → 품질 검사 → 카탈로그 등록</span>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {pipelineSteps.map((step, index) => (
                <div key={step.label} className={`rounded-lg border px-3 py-2 ${getStepClasses(step.state)}`}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="truncate text-sm font-semibold">{step.label}</span>
                  </div>
                  <p className="mt-1 text-xs opacity-80">
                    {step.state === "done"
                      ? "완료"
                      : step.state === "running"
                        ? "진행 중"
                        : step.state === "error"
                          ? "오류"
                          : "대기"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => featuredJob && handleRun(featuredJob.id)}
              disabled={!featuredJob}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <Play className="h-4 w-4" />
              다시 실행
            </button>
            <button
              onClick={() => featuredJob && navigate(`/etl/job/${featuredJob.id}/runs`)}
              disabled={!featuredJob}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <History className="h-4 w-4" />
              실행 기록
            </button>
            <button
              onClick={() => featuredJob && setScheduleModal({ isOpen: true, job: featuredJob })}
              disabled={!featuredJob}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Settings2 className="h-4 w-4" />
              스케줄 수정
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">확인 필요</h2>
          </div>
          <div className="mt-4 space-y-3">
            {attentionItems.map((item) => (
              <div key={item.title} className={`rounded-lg border p-3 ${item.tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold">{item.count}</span>
                </div>
                <p className="mt-1 truncate text-xs opacity-80" title={item.description}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-gray-200 pt-4">
            <p className="text-sm font-semibold text-gray-900">실패 원인 Top 3</p>
            <div className="mt-3 space-y-2">
              {failureReasonItems.map((item) => (
                <div key={item.title} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 truncate text-xs text-gray-500" title={item.description}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative min-w-[240px] flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="파이프라인 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">필터</span>
            </div>

            <div className="h-5 w-px bg-gray-300" />

            <div className="flex items-center gap-3">
              {/* Job Type Filter */}
              <div className="w-40">
                <Combobox
                  options={[
                    { id: "all", name: "전체 유형" },
                    { id: "batch", name: "정기 처리" },
                    { id: "cdc", name: "CDC" },
                    { id: "streaming", name: "실시간 스트리밍" },
                  ]}
                  value={jobTypeFilter}
                  onChange={(option) => setJobTypeFilter(option.id)}
                  placeholder="유형 선택"
                  classNames={{
                    button: "text-sm py-1.5",
                    label: "text-sm",
                  }}
                />
              </div>

              {/* Status Filter */}
              <div className="w-44">
                <Combobox
                  options={[
                    { id: "all", name: "전체 상태" },
                    { id: "running", name: "실행 중" },
                    { id: "scheduled", name: "예약됨" },
                    { id: "unscheduled", name: "예약 없음" },
                    { id: "paused", name: "일시 중지" },
                  ]}
                  value={statusFilter}
                  onChange={(option) => setStatusFilter(option.id)}
                  placeholder="상태 선택"
                  classNames={{
                    button: "text-sm py-1.5",
                    label: "text-sm",
                  }}
                />
              </div>

              {/* Active Filter */}
              <div className="w-40">
                <Combobox
                  options={[
                    { id: "all", name: "전체 상태" },
                    { id: "active", name: "활성" },
                    { id: "inactive", name: "비활성" },
                  ]}
                  value={activeFilter}
                  onChange={(option) => setActiveFilter(option.id)}
                  placeholder="활성 상태 선택"
                  classNames={{
                    button: "text-sm py-1.5",
                    label: "text-sm",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active Filters & Clear Button */}
          <div className="flex items-center gap-2">
            {jobTypeFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                유형: {JOB_TYPE_LABELS[jobTypeFilter]}
                <button
                  onClick={() => setJobTypeFilter("all")}
                  className="hover:bg-blue-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                상태: {STATUS_LABELS[statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)] || statusFilter}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="hover:bg-green-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                활성 상태: {ACTIVE_STATE_LABELS[activeFilter]}
                <button
                  onClick={() => setActiveFilter("all")}
                  className="hover:bg-purple-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(jobTypeFilter !== "all" ||
              statusFilter !== "all" ||
              activeFilter !== "all") && (
                <button
                  onClick={() => {
                    setJobTypeFilter("all");
                    setStatusFilter("all");
                    setActiveFilter("all");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  전체 해제
                </button>
              )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">불러오는 중...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>데이터셋이 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1420px] w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    파이프라인
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    현재 상태
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    실행 방식
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    최근 실행 결과
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    소요 시간
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    처리량
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    데이터 최신성
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    다음 실행
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    최근 히스토리
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    빠른 작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map((job) => {
                  const status = getJobStatus(job, jobRuns[job.id]);
                  const latestRun = getLatestRun(job);
                  const runTone = getRunStatusTone(latestRun?.status);
                  const freshness = getFreshness(job);
                  const statusColorClass =
                    status.color === "green"
                      ? "bg-green-100 text-green-800"
                      : status.color === "blue"
                        ? "bg-blue-100 text-blue-800"
                        : status.color === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-500";

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/etl/job/${job.id}/runs`)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="max-w-[260px] truncate font-medium text-gray-900" title={job.name}>
                                {job.name}
                              </p>
                              <button
                                onClick={(e) => handleCopyId(job.name, e)}
                                className="shrink-0 rounded p-1 transition-colors hover:bg-gray-200"
                                title="파이프라인 ID 복사"
                              >
                                {copiedId === job.name ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">{job.owner || "담당자 없음"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}
                        >
                          {STATUS_LABELS[status.label] || status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {job.job_type === "streaming" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                            <Activity className="h-3 w-3" />
                            스트리밍
                          </span>
                        ) : (
                          <ScheduleBadge job={job} />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {latestRun ? (
                          <div className="text-sm">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getRunStatusClass(runTone)}`}>
                              {RUN_STATUS_LABELS[latestRun.status] || latestRun.status}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">{getRelativeRunTime(latestRun)}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">실행 기록 없음</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1">
                          <Timer className="h-3.5 w-3.5 text-gray-400" />
                          {getRunDuration(latestRun)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">
                        {getProcessedRowsLabel(job)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${freshness.className}`}>
                          {freshness.label}
                        </span>
                        <p className="mt-1 text-xs text-gray-500">{freshness.detail}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {getNextRunLabel(job)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {getRunHistory(job).map((statusItem, index) => {
                            const tone = getRunStatusTone(statusItem);
                            const dotClass =
                              tone === "green"
                                ? "bg-green-500"
                                : tone === "red"
                                  ? "bg-red-500"
                                  : tone === "blue"
                                    ? "bg-blue-500"
                                    : tone === "yellow"
                                      ? "bg-yellow-400"
                                      : statusItem === "paused"
                                        ? "bg-gray-300"
                                        : "bg-gray-400";
                            return (
                              <button
                                key={`${job.id}-history-${index}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/etl/job/${job.id}/runs`);
                                }}
                                className={`h-2.5 w-8 rounded-full ${dotClass}`}
                                title={RUN_STATUS_LABELS[statusItem] || statusItem}
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.job_type !== "cdc" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRun(job.id);
                              }}
                              className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${job.job_type === "streaming" && streamingStates[job.id]
                                  ? "text-orange-600 bg-orange-50 hover:bg-orange-100"
                                  : job.job_type === "streaming"
                                    ? "text-green-600 bg-green-50 hover:bg-green-100"
                                    : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                }`}
                              title={
                                job.job_type === "streaming"
                                  ? (streamingStates[job.id] ? "중지" : "시작")
                                  : "수동 실행"
                              }
                            >
                              {job.job_type === "streaming" && streamingStates[job.id] ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {job.job_type !== "streaming" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(job.id);
                              }}
                              className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
                                job.is_active
                                  ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                              title={job.is_active ? "스케줄 중지" : "스케줄 활성화"}
                            >
                              {job.is_active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/etl/job/${job.id}/runs`);
                            }}
                            className="inline-flex items-center justify-center rounded-lg bg-gray-50 p-2 text-gray-600 transition-colors hover:bg-gray-100"
                            title="실행 기록"
                          >
                            <History className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setScheduleModal({ isOpen: true, job });
                            }}
                            className="inline-flex items-center justify-center rounded-lg bg-gray-50 p-2 text-gray-600 transition-colors hover:bg-gray-100"
                            title="스케줄 수정"
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/etl/job/${job.id}/runs`);
                            }}
                            className="inline-flex items-center justify-center rounded-lg bg-gray-50 p-2 text-gray-600 transition-colors hover:bg-gray-100"
                            title="로그 보기"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Edit Modal */}
      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, job: null })}
        job={scheduleModal.job}
        onSave={handleScheduleSave}
      />
    </div>
  );
}
