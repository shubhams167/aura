"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrichedHolding } from "@/lib/api/groww";

interface PortfolioChartProps {
  holdings: EnrichedHolding[];
}

export function PortfolioChart({ holdings }: PortfolioChartProps) {
  const chartData = holdings.map((h) => ({
    symbol: h.trading_symbol,
    invested: h.invested_value,
    current: h.current_value,
  }));

  if (holdings.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Holdings Comparison
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

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
          Invested vs Current Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.2}
              />
              <XAxis
                dataKey="symbol"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.9)",
                  border: "1px solid rgba(63, 63, 70, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  `₹${value?.toLocaleString("en-IN")}`,
                ]}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-zinc-600 dark:text-zinc-400 text-sm capitalize">
                    {value === "invested" ? "Invested" : "Current Value"}
                  </span>
                )}
              />
              <Bar dataKey="invested" fill="#3B82F6" radius={[4, 4, 0, 0]} name="invested" />
              <Bar dataKey="current" fill="#10B981" radius={[4, 4, 0, 0]} name="current" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
