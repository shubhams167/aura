import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { portfolioInsights } from "@/lib/data/ai-recommendations";
import { cn } from "@/lib/utils";

export function PortfolioInsights() {
  const getCategoryColor = (
    category: "diversification" | "performance" | "risk" | "opportunity"
  ) => {
    switch (category) {
      case "diversification":
        return "border-l-blue-500";
      case "performance":
        return "border-l-emerald-500";
      case "risk":
        return "border-l-amber-500";
      case "opportunity":
        return "border-l-purple-500";
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">💡</span>
          Portfolio Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {portfolioInsights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              "p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border-l-4 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
              getCategoryColor(insight.category)
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-zinc-900 dark:text-white mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {insight.insight}
                </p>
                {insight.actionable && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    Action recommended
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
