import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type { ZipfPoint } from "../lib/zipf";

interface ZipfChartProps {
  data: ZipfPoint[];
}

type ChartMode = "standard" | "log";

const chartLimit = 50;

export function ZipfChart({ data }: ZipfChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>("standard");

  if (data.length === 0) {
    return null;
  }

  const chartData = data.slice(0, chartLimit).map((point) => ({
    ...point,
    logRank: Math.log10(point.rank),
    logActual: point.actual > 0 ? Math.log10(point.actual) : null,
    logExpected: point.expected > 0 ? Math.log10(point.expected) : null,
  }));

  const isLogMode = chartMode === "log";

  return (
    <div className="zipf-chart">
      <div className="chart-header">
        <div className="chart-title-group">
          <h2>Zipf Plot</h2>

          <span className="chart-mode-label">
            {isLogMode ? "Log-Log View" : "Standard View"}
          </span>
        </div>

        <div className="chart-mode-toggle">
          <button
            type="button"
            onClick={() => setChartMode("standard")}
            className={!isLogMode ? "active" : ""}
          >
            Standard
          </button>

          <button
            type="button"
            onClick={() => setChartMode("log")}
            className={isLogMode ? "active" : ""}
          >
            Log-Log
          </button>
        </div>
      </div>

      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey={isLogMode ? "logRank" : "rank"}
            label={{
              value: isLogMode ? "log10(rank)" : "Rank",
              position: "insideBottom",
              offset: -5,
            }}
          />

          <YAxis
            label={{
              value: isLogMode ? "log10(frequency)" : "Frequency",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip
            labelFormatter={(value) => {
              if (isLogMode) {
                return `Rank ${Math.round(Math.pow(10, Number(value)))}`;
              }

              return `Rank ${value}`;
            }}
          />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ top: 0 }} />

          <Line
            type="monotone"
            dataKey={isLogMode ? "logActual" : "actual"}
            name="Actual"
            dot={false}
            stroke="var(--chart-actual)"
            strokeWidth={2}
            connectNulls={false}
          />

          <Line
            type="monotone"
            dataKey={isLogMode ? "logExpected" : "expected"}
            name="Expected Zipf"
            dot={false}
            stroke="var(--chart-expected)"
            strokeWidth={1}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
