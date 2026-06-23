import { useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Database,
  LayoutDashboard,
  Trash2,
  X,
} from "lucide-react";
import DemoInsightChart from "./DemoInsightChart";
import {
  formatDateLabel,
  formatMetricValue,
  getInsightMetricKeys,
  getInsightMetricLabels,
} from "../demoAiQueryData";

export default function InsightDetailModal({
  insight,
  onClose,
  onAddToDashboard,
  onRemoveFromDashboard,
  isDashboardAdded = false,
  showRemove = false,
  onCopySql,
  onViewDashboard,
}) {
  const [confirmingAdd, setConfirmingAdd] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!insight) return null;
  const metricKeys = getInsightMetricKeys(insight);
  const metricLabels = getInsightMetricLabels(insight);
  const latestRow = insight.chartData[insight.chartData.length - 1];

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(insight.sql);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
      onCopySql?.();
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-gray-900/45 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-gray-900">
                  {insight.title}
                </h2>
                <p className="text-sm text-gray-500">{insight.description}</p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onAddToDashboard && !showRemove && (
              <>
                <button
                  onClick={() => setConfirmingAdd(true)}
                  disabled={isDashboardAdded}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    isDashboardAdded
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {isDashboardAdded ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <LayoutDashboard className="h-4 w-4" />
                  )}
                  {isDashboardAdded ? "대시보드에 추가됨" : "대시보드에 추가"}
                </button>
                {isDashboardAdded && onViewDashboard && (
                  <button
                    onClick={onViewDashboard}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    대시보드에서 보기
                  </button>
                )}
              </>
            )}

            {showRemove && onRemoveFromDashboard && (
              <button
                onClick={() => setConfirmingRemove(true)}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                대시보드에서 제거
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {confirmingAdd && (
          <div className="mx-5 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-blue-950">
                이 분석 결과를 Dashboard 분석 기록에 추가할까요?
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setConfirmingAdd(false)}
                  className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    onAddToDashboard?.(insight);
                    setConfirmingAdd(false);
                  }}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Dashboard에 추가
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmingRemove && (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-red-950">
                이 분석 자료를 대시보드에서 제거할까요?
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setConfirmingRemove(false)}
                  className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    onRemoveFromDashboard?.(insight.id);
                    setConfirmingRemove(false);
                  }}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  제거
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-y-auto px-5 py-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {metricLabels.primary}은 막대, {metricLabels.secondary}은 선으로 표시됩니다.
                  </p>
                </div>
                <span className="w-fit rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  최근 {metricLabels.primary}{" "}
                  {formatMetricValue(metricKeys.primary, latestRow[metricKeys.primary])}
                </span>
              </div>
              <DemoInsightChart data={insight.chartData} insight={insight} />
            </section>

            <aside className="space-y-3">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-950">LLM 분석 요약</p>
                <p className="mt-2 text-sm leading-6 text-blue-900">
                  {insight.llmAnswer}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Database className="h-4 w-4 text-blue-600" />
                  데이터 소스 정보
                </div>
                <dl className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">소스</dt>
                    <dd className="text-right font-medium text-gray-900">
                      {insight.source}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">생성 날짜</dt>
                    <dd className="text-right text-gray-900">
                      {formatDateLabel(insight.createdAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">프롬프트</dt>
                    <dd className="text-right text-gray-900">자연어 분석</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>

          <section className="mt-4 rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">
                차트에 사용된 원본 데이터
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600">
                      월
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-600">
                      {metricLabels.primary}
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-600">
                      {metricLabels.secondary}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {insight.chartData.map((row) => (
                    <tr key={row.month}>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                        {row.month}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                        {formatMetricValue(metricKeys.primary, row[metricKeys.primary])}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                        {formatMetricValue(metricKeys.secondary, row[metricKeys.secondary])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-950">
            <button
              onClick={() => setShowSql((value) => !value)}
              className="flex w-full items-center justify-between gap-3 border-b border-gray-800 px-4 py-3 text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-white">실행된 SQL</h3>
                <p className="mt-1 text-xs text-gray-400">
                  차트와 데이터 조회에 사용된 읽기 전용 쿼리입니다.
                </p>
              </div>
              {showSql ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {showSql && (
              <div>
                <div className="flex justify-end border-b border-gray-800 px-4 py-2">
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-900"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    {copied ? "복사됨" : "Copy SQL"}
                  </button>
                </div>
                <pre className="max-h-72 overflow-auto p-4 text-xs leading-6 text-blue-100">
                  <code>{insight.sql}</code>
                </pre>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
