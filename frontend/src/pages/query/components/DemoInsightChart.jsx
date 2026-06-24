import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCurrencyKRW,
  formatMetricValue,
  getInsightMetricKeys,
  getInsightMetricLabels,
  revenueInsight,
} from "../demoAiQueryData";

const RAG_BAR_COLORS = {
  high: "#1d4ed8",
  medium: "#3b82f6",
  low: "#93c5fd",
};

function isMoneyMetric(key = "") {
  return key.includes("revenue") || key.includes("amount");
}

function isRateMetric(key = "") {
  return key.includes("rate");
}

function formatAxisTick(key, value) {
  if (isMoneyMetric(key)) return formatCurrencyKRW(value);
  if (isRateMetric(key)) return `${value}%`;
  if (typeof value === "number" && value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return value;
}

function InsightTooltip({ active, payload, label, insight }) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;
  const metricKeys = getInsightMetricKeys(insight);
  const metricLabels = getInsightMetricLabels(insight);

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="mt-1 text-xs text-gray-600">
        {metricLabels.primary}{" "}
        {formatMetricValue(metricKeys.primary, row[metricKeys.primary])}
      </p>
      <p className="text-xs text-gray-600">
        {metricLabels.secondary}{" "}
        {formatMetricValue(metricKeys.secondary, row[metricKeys.secondary])}
      </p>
      {row.evidenceSummary && (
        <p className="mt-2 max-w-64 border-t border-gray-100 pt-2 text-xs leading-5 text-orange-700">
          RAG 근거: {row.evidenceSummary}
        </p>
      )}
    </div>
  );
}

export default function DemoInsightChart({
  data,
  insight = revenueInsight,
  compact = false,
}) {
  const metricKeys = getInsightMetricKeys(insight);
  const metricLabels = getInsightMetricLabels(insight);
  const secondaryIsRag =
    metricKeys.secondary?.startsWith("rag_") || metricLabels.secondary?.includes("RAG");

  return (
    <div className={compact ? "h-52" : "h-80"}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 14, right: 16, bottom: compact ? 12 : 20, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#4b5563" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="primary"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={compact ? 42 : 54}
            tickFormatter={(value) => formatAxisTick(metricKeys.primary, value)}
          />
          <YAxis
            yAxisId="secondary"
            orientation="right"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={compact ? 34 : 42}
            tickFormatter={(value) => formatAxisTick(metricKeys.secondary, value)}
          />
          <Tooltip
            content={<InsightTooltip insight={insight} />}
            cursor={{ fill: "#eff6ff" }}
          />
          {!compact && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Bar
            yAxisId="primary"
            dataKey={metricKeys.primary}
            name={metricLabels.primary}
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
            barSize={compact ? 22 : 32}
          >
            {data.map((row) => (
              <Cell
                key={`${row.month}-${row.ragSignal || "default"}`}
                fill={RAG_BAR_COLORS[row.ragSignal] || "#2563eb"}
              />
            ))}
          </Bar>
          <Line
            yAxisId="secondary"
            type="monotone"
            dataKey={metricKeys.secondary}
            name={metricLabels.secondary}
            stroke={secondaryIsRag ? "#f97316" : "#16a34a"}
            strokeWidth={compact ? 2 : 3}
            dot={{ r: compact ? 3 : 4, strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
