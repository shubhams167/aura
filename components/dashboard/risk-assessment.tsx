"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { riskMetrics, overallRiskScore } from "@/lib/data/ai-recommendations";
import { cn } from "@/lib/utils";

export function RiskAssessment() {
  const getStatusColor = (status: "low" | "moderate" | "high") => {
    switch (status) {
      case "low":
        return "text-emerald-500 bg-emerald-500/10";
      case "moderate":
        return "text-amber-500 bg-amber-500/10";
      case "high":
        return "text-red-500 bg-red-500/10";
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-zinc-200 dark:text-zinc-700"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke={overallRiskScore.color}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(overallRiskScore.score / 100) * 220} 220`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                {overallRiskScore.score}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-zinc-900 dark:text-white">
              {overallRiskScore.label} Risk
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {overallRiskScore.description}
            </p>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="space-y-3">
          {riskMetrics.map((metric) => (
            <div
              key={metric.name}
              className="flex items-start justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900 dark:text-white text-sm">
                    {metric.name}
                  </p>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      getStatusColor(metric.status)
                    )}
                  >
                    {metric.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {metric.description}
                </p>
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white ml-4">
                {typeof metric.value === "number" && metric.value < 10
                  ? metric.value.toFixed(2)
                  : metric.value}
                {metric.name.includes("%") || metric.name.includes("Risk")
                  ? "%"
                  : ""}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
