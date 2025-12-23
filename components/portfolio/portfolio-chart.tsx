"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrichedHolding } from "@/lib/api/groww";

// Generate colors - green for profit, red for loss
function getPnLColor(pnl: number): string {
  return pnl >= 0 ? "#10B981" : "#EF4444";
}

interface PortfolioChartProps {
  holdings: EnrichedHolding[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { symbol: string; invested: number; current: number; pnl: number; pnlPercent: number } }> }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isProfitable = data.pnl >= 0;

  return (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-4 shadow-xl">
      <p className="font-semibold text-white mb-2">{data.symbol}</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-zinc-400">Invested</span>
          <span className="text-zinc-200 font-medium">₹{data.invested.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-zinc-400">Current</span>
          <span className="text-zinc-200 font-medium">₹{data.current.toLocaleString("en-IN")}</span>
        </div>
        <div className="border-t border-zinc-700 pt-1.5 mt-1.5 flex justify-between gap-4">
          <span className="text-zinc-400">P&L</span>
          <span className={`font-semibold ${isProfitable ? "text-emerald-400" : "text-red-400"}`}>
            {isProfitable ? "+" : ""}₹{data.pnl.toLocaleString("en-IN")} ({isProfitable ? "+" : ""}{data.pnlPercent.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export function PortfolioChart({ holdings }: PortfolioChartProps) {
  const chartData = holdings.map((h) => ({
    symbol: h.trading_symbol,
    invested: h.invested_value,
    current: h.current_value,
    pnl: h.pnl,
    pnlPercent: h.pnl_percent,
  }));

  // Sort by current value descending for better visualization
  chartData.sort((a, b) => b.current - a.current);

  if (holdings.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-zinc-500">
            No holdings to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...chartData.map((d) => Math.max(d.invested, d.current)));

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Portfolio Overview
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Invested</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Loss</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                stroke="#71717A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                domain={[0, maxValue * 1.1]}
              />
              <YAxis
                type="category"
                dataKey="symbol"
                stroke="#71717A"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fill: "#A1A1AA" }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              {/* Invested amount - base bar (gray) */}
              <Bar
                dataKey="invested"
                fill="#52525B"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
              {/* Current value bar with P&L color */}
              <Bar
                dataKey="current"
                radius={[0, 6, 6, 0]}
                barSize={24}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPnLColor(entry.pnl)}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
