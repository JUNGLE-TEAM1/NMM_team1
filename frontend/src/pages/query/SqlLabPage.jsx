import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Database,
    Download,
    FileText,
    GitBranch,
    Loader2,
    Play,
    Send,
    Sparkles,
    User,
    XCircle,
} from "lucide-react";
import { executeQuery as runDuckDBQuery } from "../../services/apiDuckDB";
import { executeQuery as runTrinoQuery, executeQueryPaginated as runTrinoQueryPaginated } from "../../services/apiTrino";
import { useToast } from "../../components/common/Toast";
import InlineAIInput from "../../components/ai/InlineAIInput";
import TableColumnSidebar from "./components/TableColumnSidebar";
import QueryExplorer from "./components/QueryExplorer";
import Combobox from "../../components/common/Combobox";
import InsightDetailModal from "./components/InsightDetailModal";
import {
    buildDemoQueryResults,
    demoAiQueryStepDurations,
    demoAiQuerySteps,
    demoGeneratedInsight,
    getDemoInsightForPrompt,
    isInsightInDashboard,
    recommendedPrompts,
    saveDashboardInsight,
} from "./demoAiQueryData";

const QUERY_STORAGE_KEY = 'sqllab_current_query';
const RESULTS_STORAGE_KEY = 'sqllab_last_results';
const ENGINE_STORAGE_KEY = 'sqllab_query_engine';

const ENGINE_PLACEHOLDERS = {
    duckdb: "SQL 쿼리를 입력하세요...\n예: SELECT * FROM read_parquet('s3://bucket/path/*.parquet') LIMIT 10",
    trino: "SQL 쿼리를 입력하세요...\n예: SELECT * FROM lakehouse.default.my_table "
};

export default function SqlLabPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const [selectedTable, setSelectedTable] = useState(null);
    const [query, setQuery] = useState("");
    const [executing, setExecuting] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'chart'
    const [engine, setEngine] = useState(() => {
        return sessionStorage.getItem(ENGINE_STORAGE_KEY) || 'trino';
    }); // 'duckdb' | 'trino'

    // Chart configuration state
    const [chartType, setChartType] = useState('bar');
    const [xAxis, setXAxis] = useState('');
    const [yAxes, setYAxes] = useState([]);
    const [calculatedMetrics, setCalculatedMetrics] = useState([]);
    const [breakdownBy, setBreakdownBy] = useState('');
    const [isStacked, setIsStacked] = useState(false);
    const [aggregation, setAggregation] = useState('SUM');
    const [timeGrain, setTimeGrain] = useState('');
    const [limit, setLimit] = useState(20);
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    // Query limit state
    const [queryLimit, setQueryLimit] = useState(30);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewPage, setViewPage] = useState(1); // 현재 보고 있는 페이지

    // AI state
    const [showAI, setShowAI] = useState(false);
    const [demoPrompt, setDemoPrompt] = useState("");
    const [demoStatus, setDemoStatus] = useState("idle"); // idle | running | done
    const [demoStep, setDemoStep] = useState(0);
    const [messages, setMessages] = useState([]);
    const [currentInsight, setCurrentInsight] = useState(demoGeneratedInsight);
    const [activeInsight, setActiveInsight] = useState(null);
    const [dashboardAdded, setDashboardAdded] = useState(false);
    const demoTimersRef = useRef([]);

    const generatedInsight = currentInsight;

    const clearDemoTimers = () => {
        demoTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
        demoTimersRef.current = [];
    };

    useEffect(() => {
        setDashboardAdded(isInsightInDashboard(demoGeneratedInsight.id));

        return () => clearDemoTimers();
    }, []);

    // Load query and results from multiple sources (priority order)
    useEffect(() => {
        // 1. From navigation state (Edit Query button)
        if (location.state?.query) {
            setQuery(location.state.query);
            // Clear the state to prevent re-applying on refresh
            window.history.replaceState({}, document.title);

            // Also restore the last results since user is coming back from Explore
            const savedResults = sessionStorage.getItem(RESULTS_STORAGE_KEY);
            if (savedResults) {
                try {
                    setResults(JSON.parse(savedResults));
                } catch (err) {
                    console.error('Failed to parse saved results:', err);
                }
            }
            return;
        }

        // 2. From sessionStorage (page refresh)
        const savedQuery = sessionStorage.getItem(QUERY_STORAGE_KEY);
        if (savedQuery) {
            setQuery(savedQuery);
        }

        // Also try to restore results on page refresh
        const savedResults = sessionStorage.getItem(RESULTS_STORAGE_KEY);
        if (savedResults) {
            try {
                setResults(JSON.parse(savedResults));
            } catch (err) {
                console.error('Failed to parse saved results:', err);
            }
        }
    }, [location]);

    // Save query to sessionStorage whenever it changes
    useEffect(() => {
        if (query) {
            sessionStorage.setItem(QUERY_STORAGE_KEY, query);
        }
    }, [query]);

    // Save results to sessionStorage whenever they change
    useEffect(() => {
        if (results) {
            sessionStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
        }
    }, [results]);

    // Save engine selection to sessionStorage
    useEffect(() => {
        sessionStorage.setItem(ENGINE_STORAGE_KEY, engine);
    }, [engine]);

    const executeQuery = async (page = 1) => {
        if (!query.trim()) {
            setError("쿼리를 입력해주세요");
            return;
        }

        const isInitialQuery = page === 1;
        if (isInitialQuery) {
            setExecuting(true);
            setError(null);
            setCurrentPage(1);
            setViewPage(1); // 첫 페이지로 리셋
        }

        try {
            let finalQuery = query.trim();

            if (engine === 'trino') {
                // Trino: Use pagination API or direct limit
                if (queryLimit === 'All') {
                    // ALL: Use pagination (1000 rows at a time)
                    const result = await runTrinoQueryPaginated(finalQuery, page, 1000);
                    const columns = result.data.length > 0 ? Object.keys(result.data[0]) : [];

                    if (page === 1) {
                        // 첫 페이지 - 새로운 결과
                        setResults({
                            data: result.data,
                            columns,
                            row_count: result.row_count,
                            was_limited: false,
                            applied_limit: 'All',
                            query: finalQuery,
                        });
                    } else {
                        // 추가 페이지 - 누적
                        setResults(prev => ({
                            ...prev,
                            data: [...prev.data, ...result.data],
                            row_count: prev.row_count + result.row_count,
                        }));
                    }

                    setHasMore(result.has_more);
                    setCurrentPage(page);
                } else {
                    // Specific limit: Apply limit and don't paginate
                    if (!/\bLIMIT\b/i.test(finalQuery)) {
                        finalQuery = `${finalQuery.replace(/;$/, "")} LIMIT ${queryLimit}`;
                    }

                    const response = await runTrinoQuery(finalQuery);
                    const columns = response.data.length > 0 ? Object.keys(response.data[0]) : [];
                    const wasLimited = !/\bLIMIT\b/i.test(query.trim());
                    setResults({
                        data: response.data,
                        columns,
                        row_count: response.row_count,
                        was_limited: wasLimited,
                        applied_limit: wasLimited ? queryLimit : null,
                        query: finalQuery,
                    });
                    setHasMore(false); // No pagination for specific limits
                }
            } else {
                // DuckDB: Original way with limit
                if (!/\bLIMIT\b/i.test(finalQuery)) {
                    const limitValue = queryLimit === 'All' ? 1000000 : queryLimit;
                    finalQuery = `${finalQuery.replace(/;$/, "")} LIMIT ${limitValue}`;
                }

                const response = await runDuckDBQuery(finalQuery);
                const columns = response.data.length > 0 ? Object.keys(response.data[0]) : [];
                const wasLimited = !/\bLIMIT\b/i.test(query.trim());
                setResults({
                    data: response.data,
                    columns,
                    row_count: response.row_count,
                    was_limited: wasLimited,
                    applied_limit: wasLimited ? queryLimit : null,
                    query: finalQuery,
                });
                setHasMore(false);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            if (isInitialQuery) {
                setExecuting(false);
            }
        }
    };

    const loadMoreResults = async () => {
        if (!hasMore || loadingMore) return;

        setLoadingMore(true);
        try {
            await executeQuery(currentPage + 1);
            // Load More 후 새로 로드된 페이지로 자동 이동
            setViewPage(currentPage + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingMore(false);
        }
    };

    // 화면에 표시할 페이지 데이터 계산
    const getPageData = () => {
        if (!results || queryLimit !== 'All' || engine !== 'trino') {
            return results?.data || [];
        }

        const rowsPerPage = 1000;
        const startIndex = (viewPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return results.data.slice(startIndex, endIndex);
    };

    const downloadCSV = () => {
        if (!results) return;

        try {
            const header = results.columns.join(",");
            const rows = results.data.map((row) =>
                results.columns
                    .map((col) => {
                        const value = row[col];
                        if (value === null || value === undefined) return "";
                        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                        const str = String(value);
                        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                            return `"${str.replace(/"/g, '""')}"`;
                        }
                        return str;
                    })
                    .join(",")
            );
            const csv = [header, ...rows].join("\n");

            const bom = "\uFEFF";
            const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `query_result_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            showToast(`${results.row_count}개 행을 다운로드했습니다`, 'success');
        } catch (err) {
            console.error('CSV download failed:', err);
            showToast('CSV 다운로드에 실패했습니다', 'error');
        }
    };

    const applyDemoPrompt = (prompt = demoGeneratedInsight.userPrompt) => {
        setDemoPrompt(prompt);
        showToast("예시 질문을 입력했습니다", "success");
    };

    const runDemoAnalysis = () => {
        const prompt = demoPrompt.trim() || demoGeneratedInsight.userPrompt;
        const insightTemplate = getDemoInsightForPrompt(prompt);
        const nextInsight = {
            ...insightTemplate,
            userPrompt: prompt,
            createdAt: new Date().toISOString(),
        };

        clearDemoTimers();
        setError(null);
        setShowAI(false);
        setExecuting(false);
        setDemoStatus("running");
        setDemoStep(0);
        setCurrentInsight(nextInsight);
        setMessages((prev) => [
            ...prev,
            { id: `user-${Date.now()}`, role: "user", content: prompt },
        ]);
        setDemoPrompt("");
        setResults(null);
        setHasMore(false);
        setCurrentPage(1);
        setViewPage(1);
        setViewMode("table");
        setEngine("trino");
        setSelectedTable({
            name: nextInsight.sourceTable,
            display_name: nextInsight.source,
        });
        setQuery(nextInsight.sql);

        let elapsedMs = 0;
        demoAiQuerySteps.forEach((_, index) => {
            const timerId = window.setTimeout(() => {
                setDemoStep(index);
            }, elapsedMs);
            demoTimersRef.current.push(timerId);
            elapsedMs += demoAiQueryStepDurations[index] ?? 1500;
        });

        const doneTimerId = window.setTimeout(() => {
            setDemoStatus("done");
            setDemoStep(demoAiQuerySteps.length - 1);
            setResults(buildDemoQueryResults(nextInsight));
            setMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: nextInsight.llmAnswer,
                    insight: nextInsight,
                },
            ]);
            showToast("LLM 답변과 분석 카드가 생성되었습니다", "success");
        }, elapsedMs);
        demoTimersRef.current.push(doneTimerId);
    };

    const handlePromptKeyDown = (event) => {
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        if (demoStatus !== "running") runDemoAnalysis();
    };

    const handleAddToDashboard = (insight) => {
        saveDashboardInsight(insight);
        setDashboardAdded(true);
        showToast("Dashboard 분석 기록에 추가했습니다", "success");
    };


    return (
        <div className="flex h-full min-h-0 flex-col bg-gray-50">
            <div className="border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">AI Query</h2>
                        <p className="mt-1 text-xs text-gray-500">
                            SQL 집계와 RAG 원문 근거를 함께 사용해 분석 차트를 생성합니다.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
                <div className="mx-auto flex max-w-4xl flex-col gap-4">
                    {messages.length === 0 && (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-5">
                            <div className="flex items-start gap-3">
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                                    <Sparkles className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        RAG가 반영된 분석 질문을 실행해보세요
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        추천 프롬프트를 선택하면 SQL 집계, 원문 chunk 검색, 청킹 근거 재랭킹이 함께 실행됩니다.
                                    </p>
                                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                        {[
                                            ["SQL 집계", "정형 지표 계산", Database],
                                            ["RAG 검색", "고객 원문 chunk 검색", FileText],
                                            ["차트 반영", "수치와 근거를 함께 시각화", GitBranch],
                                        ].map(([title, body, Icon]) => (
                                            <div key={title} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                                <Icon className="h-4 w-4 text-blue-600" />
                                                <p className="mt-2 text-xs font-semibold text-gray-900">{title}</p>
                                                <p className="mt-1 text-xs text-gray-500">{body}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {recommendedPrompts.map((prompt) => (
                                            <button
                                                key={prompt}
                                                onClick={() => applyDemoPrompt(prompt)}
                                                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "assistant" && (
                                <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                            )}

                            <div
                                className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                                    message.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "border border-gray-200 bg-white text-gray-800"
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>

                                {message.insight && (
                                    <button
                                        onClick={() => {
                                            setActiveInsight(message.insight);
                                            setDashboardAdded(isInsightInDashboard(message.insight.id));
                                        }}
                                        className="mt-4 flex w-full max-w-md items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50"
                                    >
                                        <span className="grid h-10 w-10 shrink-0 grid-cols-3 items-end gap-0.5 rounded-md border border-gray-200 bg-white p-1.5">
                                            <span className="h-3 rounded-sm bg-blue-500" />
                                            <span className="h-5 rounded-sm bg-blue-500" />
                                            <span className="h-7 rounded-sm bg-green-500" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-gray-900">
                                                {message.insight.title}
                                            </span>
                                            <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <BarChart3 className="h-3.5 w-3.5" />
                                                    AI 분석 차트
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Database className="h-3.5 w-3.5" />
                                                    {message.insight.source}
                                                </span>
                                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                                                    SQL + RAG
                                                </span>
                                                {message.insight.ragEvidence?.length > 0 && (
                                                    <span className="rounded-full bg-orange-50 px-2 py-0.5 font-medium text-orange-700">
                                                        근거 chunk {message.insight.ragEvidence.length}개
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600">
                                            열기
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </button>
                                )}
                            </div>

                            {message.role === "user" && (
                                <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                                    <User className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    ))}

                    {demoStatus === "running" && (
                        <div className="flex justify-start gap-3">
                            <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <div className="max-w-xl rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    처리 중
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {demoAiQuerySteps.map((step, index) => {
                                        const isComplete = demoStep > index;
                                        const isActive = demoStep === index;
                                        return (
                                            <span
                                                key={step}
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    isComplete
                                                        ? "bg-green-50 text-green-700"
                                                        : isActive
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {step}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-200 bg-white px-4 py-4">
                <div className="mx-auto max-w-4xl">
                    {messages.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                            {recommendedPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => applyDemoPrompt(prompt)}
                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-end gap-2 rounded-lg border border-gray-300 bg-white p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                        <textarea
                            value={demoPrompt}
                            onChange={(event) => setDemoPrompt(event.target.value)}
                            onKeyDown={handlePromptKeyDown}
                            placeholder="데이터에 대해 질문해보세요"
                            rows={2}
                            className="max-h-32 min-h-[44px] flex-1 resize-none border-0 px-2 py-2 text-sm text-gray-900 outline-none"
                        />
                        <button
                            onClick={runDemoAnalysis}
                            disabled={demoStatus === "running" || !demoPrompt.trim()}
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition ${
                                demoStatus === "running" || !demoPrompt.trim()
                                    ? "bg-gray-100 text-gray-400"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                            title="전송"
                        >
                            {demoStatus === "running" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                        Enter로 전송, Shift + Enter로 줄바꿈
                    </p>
                </div>
            </div>

            <InsightDetailModal
                insight={activeInsight}
                onClose={() => setActiveInsight(null)}
                onAddToDashboard={handleAddToDashboard}
                isDashboardAdded={activeInsight ? isInsightInDashboard(activeInsight.id) : false}
                onViewDashboard={(dashboardPath) => {
                    if (dashboardPath) navigate(dashboardPath);
                }}
                onCopySql={() => showToast("SQL을 복사했습니다", "success")}
            />
        </div>
    );


    return (
        <div className="flex h-full overflow-hidden bg-gray-50 min-w-0 max-w-full">
            {/* Schema Browser - Left */}
            <TableColumnSidebar
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
                results={results}
                viewMode={viewMode}
                setViewMode={setViewMode}
                engine={engine}
                chartType={chartType}
                setChartType={setChartType}
                xAxis={xAxis}
                setXAxis={setXAxis}
                yAxes={yAxes}
                setYAxes={setYAxes}
                calculatedMetrics={calculatedMetrics}
                setCalculatedMetrics={setCalculatedMetrics}
                breakdownBy={breakdownBy}
                setBreakdownBy={setBreakdownBy}
                isStacked={isStacked}
                setIsStacked={setIsStacked}
                aggregation={aggregation}
                setAggregation={setAggregation}
                timeGrain={timeGrain}
                setTimeGrain={setTimeGrain}
                limit={limit}
                setLimit={setLimit}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
            />

            {/* Main SQL Lab Area */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 min-w-0">
                    <div className="flex items-center justify-between min-w-0">
                        <div>
                            <h2 className="font-semibold text-gray-900">AI Query</h2>
                            {selectedTable && (
                                <p className="text-xs text-gray-500 mt-1">
                                    xflow_db.{selectedTable.name}
                                </p>
                            )}
                        </div>
                        {/* AI Button */}
                        <button
                            onClick={() => setShowAI(!showAI)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                                bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600
                                hover:from-indigo-100 hover:to-purple-100 transition-all
                                border border-indigo-200/50"
                            title="AI SQL 도우미"
                        >
                            <Sparkles size={14} />
                            <span>AI</span>
                        </button>
                    </div>
                </div>

                {/* Query Editor */}
                <div className="p-4 border-b border-gray-200 min-w-0">
                    {/* AI Input Panel */}
                    {showAI && (
                        <InlineAIInput
                            promptType="query_page"
                            metadata={{}}
                            placeholder="AI에게 SQL 쿼리 생성을 요청하세요..."
                            engine={engine}  // Pass current engine (duckdb or trino)
                            onApply={(sql) => {
                                setQuery(sql);
                                setShowAI(false);
                            }}
                            onCancel={() => setShowAI(false)}
                        />
                    )}

                    <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        추천 질문
                                    </span>
                                    <button
                                        onClick={applyDemoPrompt}
                                        className="min-w-0 rounded-full border border-blue-200 bg-white px-3 py-1 text-left text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                                    >
                                        최근 6개월 월별 매출과 주문 수 추이를 분석해줘
                                    </button>
                                </div>
                                <input
                                    value={demoPrompt}
                                    onChange={(event) => setDemoPrompt(event.target.value)}
                                    placeholder="자연어 질문을 입력하거나 예시 질문을 클릭하세요"
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <button
                                onClick={runDemoAnalysis}
                                disabled={demoStatus === "running" || !(demoPrompt || demoGeneratedInsight.userPrompt).trim()}
                                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                                    demoStatus === "running"
                                        ? "bg-gray-100 text-gray-400"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                {demoStatus === "running" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                분석 실행
                            </button>
                        </div>

                        {(demoStatus === "running" || demoStatus === "done") && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-5">
                                {demoAiQuerySteps.map((step, index) => {
                                    const isComplete = demoStatus === "done" || demoStep > index;
                                    const isActive = demoStatus === "running" && demoStep === index;

                                    return (
                                        <div
                                            key={step}
                                            className={`flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-2 text-xs ${
                                                isComplete
                                                    ? "border-green-200 bg-green-50 text-green-700"
                                                    : isActive
                                                        ? "border-blue-200 bg-blue-50 text-blue-700"
                                                        : "border-gray-200 bg-white text-gray-500"
                                            }`}
                                        >
                                            {isComplete ? (
                                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                            ) : isActive ? (
                                                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                            ) : (
                                                <span className="h-4 w-4 shrink-0 rounded-full border border-current" />
                                            )}
                                            <span className="truncate">{step}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="relative min-w-0">
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={ENGINE_PLACEHOLDERS[engine]}
                            className="w-full h-32 px-4 py-3 pb-12 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        />

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            {/* Left side - LIMIT selector */}
                            <div className="flex items-center gap-2 bg-white/80 px-2 py-1 rounded">
                                <label className="text-xs font-medium text-gray-600">LIMIT:</label>
                                <Combobox
                                    options={[30, 100, 200, 500, 'All']}
                                    value={queryLimit}
                                    onChange={(option) => setQueryLimit(option === 'All' ? 'All' : option)}
                                    getKey={(item) => item}
                                    placeholder="제한 선택"
                                    getLabel={(item) => (item === 'All' ? '전체' : String(item))}
                                    classNames={{
                                        container: 'w-20',
                                        button: 'px-2 py-1 text-xs min-h-0 h-auto',
                                        label: 'text-xs',
                                        icon: 'w-3 h-3',
                                        panel: 'min-w-[80px]',
                                        option: 'px-3 py-1.5'
                                    }}
                                />
                            </div>

                            {/* Right side - Execution Status and Run button */}
                            <div className="flex items-center gap-3">
                                {/* Execution Status */}
                                {executing && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 px-2 py-1 rounded">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <span>실행 중...</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => executeQuery()}
                                    disabled={executing || !query.trim()}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm ${executing || !query.trim()
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                                        }`}
                                >
                                    {executing ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Play className="w-3.5 h-3.5" />
                                    )}
                                    실행
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {demoStatus === "done" && (
                    <section className="border-b border-gray-200 bg-white px-4 py-4">
                        <div className="max-w-4xl rounded-lg border border-blue-100 bg-blue-50 p-4">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-blue-950">
                                        LLM 답변
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-blue-900">
                                        {generatedInsight.llmAnswer}
                                    </p>

                                    <button
                                        onClick={() => setActiveInsight(generatedInsight)}
                                        className="mt-4 flex w-full max-w-md items-center gap-3 rounded-md border border-blue-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                                    >
                                        <span className="grid h-10 w-10 shrink-0 grid-cols-3 items-end gap-0.5 rounded-md border border-gray-200 bg-gray-50 p-1.5">
                                            <span className="h-3 rounded-sm bg-blue-500" />
                                            <span className="h-5 rounded-sm bg-blue-500" />
                                            <span className="h-7 rounded-sm bg-green-500" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-gray-900">
                                                {generatedInsight.title}
                                            </span>
                                            <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <BarChart3 className="h-3.5 w-3.5" />
                                                    AI 분석 차트
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Database className="h-3.5 w-3.5" />
                                                    Supabase / orders
                                                </span>
                                            </span>
                                        </span>
                                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600">
                                            열기
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg min-w-0">
                        <div className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-900">오류</p>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="flex-1 overflow-hidden min-w-0">
                    {results ? (
                        viewMode === 'chart' ? (
                            <QueryExplorer
                                results={results}
                                query={query}
                                chartType={chartType}
                                setChartType={setChartType}
                                xAxis={xAxis}
                                setXAxis={setXAxis}
                                yAxes={yAxes}
                                setYAxes={setYAxes}
                                calculatedMetrics={calculatedMetrics}
                                setCalculatedMetrics={setCalculatedMetrics}
                                breakdownBy={breakdownBy}
                                setBreakdownBy={setBreakdownBy}
                                isStacked={isStacked}
                                setIsStacked={setIsStacked}
                                aggregation={aggregation}
                                setAggregation={setAggregation}
                                timeGrain={timeGrain}
                                setTimeGrain={setTimeGrain}
                                limit={limit}
                                setLimit={setLimit}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                sortOrder={sortOrder}
                                setSortOrder={setSortOrder}
                            />
                        ) : (
                            <div className="p-4 h-full flex flex-col overflow-hidden">
                                {/* Results Header */}
                                <div className="mb-4 flex items-center justify-between shrink-0">
                                    <span className="text-sm font-medium text-gray-900">
                                        결과: 총 {results.row_count}개 행
                                        {engine === 'trino' && queryLimit === 'All' && ` · ${viewPage}페이지 표시 (${getPageData().length}개 행)`}
                                        {results.was_limited && queryLimit !== 'All' && ` · ${results.applied_limit}개로 제한됨`}
                                    </span>
                                    <button
                                        onClick={downloadCSV}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        CSV 다운로드
                                    </button>
                                </div>

                                {/* Results Table - Full Height with Horizontal Scroll */}
                                <div className="flex-1 overflow-auto border border-gray-200 rounded-lg" style={{ width: 0, minWidth: '100%' }}>
                                    <table className="w-full text-sm border-separate border-spacing-0">
                                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                            <tr>
                                                {results.columns.map((column) => (
                                                    <th
                                                        key={column}
                                                        className="px-4 py-3 text-left font-medium text-gray-700 bg-gray-50 whitespace-nowrap"
                                                    >
                                                        {column}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {getPageData().map((row, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    {results.columns.map((column) => (
                                                        <td
                                                            key={column}
                                                            className="px-4 py-3 text-gray-900 whitespace-nowrap"
                                                        >
                                                            {(() => {
                                                                const value = row[column];
                                                                if (value === null || value === undefined) return <span className="text-gray-400">-</span>;
                                                                if (typeof value === "object") return JSON.stringify(value);
                                                                return String(value);
                                                            })()}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Page Navigation + Load More - Only for Trino with ALL limit */}
                                {engine === 'trino' && queryLimit === 'All' && results && (
                                    <div className="mt-4 flex justify-center items-center gap-2 shrink-0">
                                        {/* 로드된 페이지 버튼들 */}
                                        <div className="flex items-center gap-1">
                                            {[...Array(currentPage)].map((_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setViewPage(pageNum)}
                                                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${viewPage === pageNum
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Load More 버튼 */}
                                        {hasMore && (
                                            <button
                                                onClick={loadMoreResults}
                                                disabled={loadingMore}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${loadingMore
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                                    }`}
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        불러오는 중...
                                                    </>
                                                ) : (
                                                    <>
                                                        더 불러오기 (1,000행)
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <p className="text-sm">아직 조회 결과가 없습니다</p>
                                <p className="text-xs mt-1">쿼리를 실행하면 결과가 표시됩니다</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <InsightDetailModal
                insight={activeInsight}
                onClose={() => setActiveInsight(null)}
                onAddToDashboard={handleAddToDashboard}
                isDashboardAdded={dashboardAdded}
                onViewDashboard={(dashboardPath) => {
                    if (dashboardPath) navigate(dashboardPath);
                }}
                onCopySql={() => showToast("SQL을 복사했습니다", "success")}
            />
        </div >
    );
}
