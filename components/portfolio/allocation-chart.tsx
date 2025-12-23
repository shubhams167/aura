"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrichedHolding } from "@/lib/api/groww";

// Generate colors based on symbol
function getSymbolColor(symbol: string, index: number): string {
  const colors = [
    "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444",
    "#06B6D4", "#EC4899", "#14B8A6", "#F97316", "#6366F1",
  ];
  return colors[index % colors.length];
}

interface AllocationChartProps {
  holdings: EnrichedHolding[];
}

export function AllocationChart({ holdings }: AllocationChartProps) {
  const allocationData = holdings.map((h, index) => ({
    name: h.trading_symbol,
    value: h.current_value,
    color: getSymbolColor(h.trading_symbol, index),
  }));

  if (holdings.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-zinc-500">
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
          Asset Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.9)",
                  border: "1px solid rgba(63, 63, 70, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  `₹${Number(value)?.toLocaleString("en-IN")}`,
                  "Current Value",
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-zinc-600 dark:text-zinc-400 text-sm">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
