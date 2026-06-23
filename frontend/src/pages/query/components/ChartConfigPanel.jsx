import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";
import Combobox from "../../../components/common/Combobox";

export default function ChartConfigPanel({
    columns,
    chartType,
    setChartType,
    xAxis,
    setXAxis,
    yAxes,
    setYAxes,
    calculatedMetrics,
    setCalculatedMetrics,
    breakdownBy,
    setBreakdownBy,
    isStacked,
    setIsStacked,
    aggregation,
    setAggregation,
    timeGrain,
    setTimeGrain,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
}) {
    const limitOptions = [10, 20, 50, 100, 200, 500, 1000, 'All'];
    const aggregationOptions = ['SUM', 'COUNT', 'AVG', 'MAX', 'MIN'];
    const timeGrainOptions = ['', 'day', 'week', 'month', 'quarter', 'year'];

    const addMetric = () => {
        if (yAxes.length < 5) { // Max 5 metrics
            setYAxes([...yAxes, { column: columns[0] || '', aggregation: 'COUNT' }]);
        }
    };

    const removeMetric = (index) => {
        setYAxes(yAxes.filter((_, i) => i !== index));
    };

    const updateMetric = (index, field, value) => {
        const newYAxes = [...yAxes];
        newYAxes[index][field] = value;
        setYAxes(newYAxes);
    };

    return (
        <div className="p-4 space-y-6">
            {/* Chart Type */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">차트 유형</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setChartType('bar')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${chartType === 'bar'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-xs font-medium">막대</span>
                    </button>
                    <button
                        onClick={() => setChartType('line')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${chartType === 'line'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-xs font-medium">선</span>
                    </button>
                    <button
                        onClick={() => setChartType('area')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${chartType === 'area'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Activity className="w-5 h-5" />
                        <span className="text-xs font-medium">영역</span>
                    </button>
                    <button
                        onClick={() => setChartType('pie')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${chartType === 'pie'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <PieChartIcon className="w-5 h-5" />
                        <span className="text-xs font-medium">파이</span>
                    </button>
                </div>
            </div>

            {/* Dimensions */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">차원</h3>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            X축 (범주)
                        </label>
                        <Combobox
                            options={['', ...columns]}
                            value={xAxis}
                            onChange={setXAxis}
                            getKey={(col) => col}
                            getLabel={(col) => col || '없음'}
                            placeholder="컬럼 선택"
                        />
                    </div>

                    {/* Time Granularity (show only if x-axis looks like a date) */}
                    {xAxis && (xAxis.toLowerCase().includes('date') || xAxis.toLowerCase().includes('time')) && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                시간 단위
                            </label>
                            <select
                                value={timeGrain}
                                onChange={(e) => setTimeGrain(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">원본</option>
                                <option value="day">일</option>
                                <option value="week">주</option>
                                <option value="month">월</option>
                                <option value="quarter">분기</option>
                                <option value="year">연</option>
                            </select>
                        </div>
                    )}

                    {chartType === 'bar' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    색상 기준 분리 (누적 막대용)
                                </label>
                                <Combobox
                                    options={['', ...columns]}
                                    value={breakdownBy}
                                    onChange={setBreakdownBy}
                                    getKey={(col) => col}
                                    getLabel={(col) => col || '없음'}
                                    placeholder="없음"
                                />
                            </div>
                            {!breakdownBy && yAxes.length > 1 && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="stack-bars"
                                        checked={isStacked}
                                        onChange={(e) => setIsStacked(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="stack-bars" className="text-xs font-medium text-gray-700 cursor-pointer">
                                        막대 누적
                                    </label>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Metrics (Multiple Y-Axes) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">지표 (Y축)</h3>
                    <button
                        onClick={addMetric}
                        disabled={yAxes.length >= 5}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                    >
                        + 지표 추가
                    </button>
                </div>

                <div className="space-y-3">
                    {yAxes.length === 0 ? (
                        <p className="text-xs text-gray-500">아직 추가한 지표가 없습니다</p>
                    ) : (
                        yAxes.map((metric, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700">
                                        지표 {index + 1}
                                    </span>
                                    <button
                                        onClick={() => removeMetric(index)}
                                        className="text-xs text-red-600 hover:text-red-700"
                                    >
                                        제거
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">집계 방식</label>
                                    <select
                                        value={metric.aggregation}
                                        onChange={(e) => updateMetric(index, 'aggregation', e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                                    >
                                        {aggregationOptions.map(agg => (
                                            <option key={agg} value={agg}>{agg}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">컬럼</label>
                                    <Combobox
                                        options={columns}
                                        value={metric.column}
                                        onChange={(val) => updateMetric(index, 'column', val)}
                                        getKey={(col) => col}
                                        getLabel={(col) => col}
                                        placeholder="컬럼 선택"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Calculated Metrics */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">계산 지표</h3>
                    <button
                        onClick={() => {
                            setCalculatedMetrics([...calculatedMetrics, {
                                metricA: yAxes[0]?.column || '',
                                operation: 'subtract',
                                metricB: yAxes[1]?.column || '',
                                label: '계산값'
                            }]);
                        }}
                        disabled={yAxes.length < 2}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                    >
                        + 계산식 추가
                    </button>
                </div>

                {calculatedMetrics.length === 0 ? (
                    <p className="text-xs text-gray-500">계산 지표를 만들려면 지표를 2개 이상 추가하세요</p>
                ) : (
                    <div className="space-y-3">
                        {calculatedMetrics.map((calc, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700">계산식 {index + 1}</span>
                                    <button
                                        onClick={() => {
                                            setCalculatedMetrics(calculatedMetrics.filter((_, i) => i !== index));
                                        }}
                                        className="text-xs text-red-600 hover:text-red-700"
                                    >
                                        제거
                                    </button>
                                </div>

                                {/* Metric A */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">지표 A</label>
                                    <select
                                        value={calc.metricA}
                                        onChange={(e) => {
                                            const newCalcs = [...calculatedMetrics];
                                            newCalcs[index].metricA = e.target.value;
                                            setCalculatedMetrics(newCalcs);
                                        }}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                                    >
                                        {yAxes.map((metric, idx) => (
                                            <option key={idx} value={metric.column}>
                                                {metric.aggregation}({metric.column})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Operation */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">연산</label>
                                    <select
                                        value={calc.operation}
                                        onChange={(e) => {
                                            const newCalcs = [...calculatedMetrics];
                                            newCalcs[index].operation = e.target.value;
                                            setCalculatedMetrics(newCalcs);
                                        }}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                                    >
                                        <option value="add">더하기 (A + B)</option>
                                        <option value="subtract">빼기 (A - B)</option>
                                        <option value="multiply">곱하기 (A x B)</option>
                                        <option value="divide">나누기 (A / B)</option>
                                        <option value="percentage">비율 (A/B x 100)</option>
                                    </select>
                                </div>

                                {/* Metric B */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">지표 B</label>
                                    <select
                                        value={calc.metricB}
                                        onChange={(e) => {
                                            const newCalcs = [...calculatedMetrics];
                                            newCalcs[index].metricB = e.target.value;
                                            setCalculatedMetrics(newCalcs);
                                        }}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                                    >
                                        {yAxes.map((metric, idx) => (
                                            <option key={idx} value={metric.column}>
                                                {metric.aggregation}({metric.column})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Label */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">라벨</label>
                                    <input
                                        type="text"
                                        value={calc.label}
                                        onChange={(e) => {
                                            const newCalcs = [...calculatedMetrics];
                                            newCalcs[index].label = e.target.value;
                                            setCalculatedMetrics(newCalcs);
                                        }}
                                        placeholder="예: 이익"
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chart Options */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">차트 옵션</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            정렬 기준
                        </label>
                        <Combobox
                            options={['', xAxis, ...yAxes.map(m => `${m.aggregation}(${m.column})`)]}
                            value={sortBy}
                            onChange={setSortBy}
                            getKey={(opt) => opt}
                            getLabel={(opt) => opt || '기본값 (첫 번째 지표)'}
                            placeholder="정렬 기준 선택"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            정렬 순서
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSortOrder('asc')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${sortOrder === 'asc'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                오름차순
                            </button>
                            <button
                                onClick={() => setSortOrder('desc')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${sortOrder === 'desc'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                내림차순
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            상위 N개 표시
                        </label>
                        <Combobox
                            options={limitOptions}
                            value={limit}
                            onChange={setLimit}
                            getKey={(n) => n}
                            getLabel={(n) => n === 'All' ? '전체 표시' : `상위 ${n}개`}
                            placeholder="표시 개수 선택"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
