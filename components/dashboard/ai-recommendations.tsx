import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aiRecommendations } from "@/lib/data/ai-recommendations";
import { cn } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Pause } from "lucide-react";

export function AIRecommendations() {
  const getTypeConfig = (type: "buy" | "sell" | "hold" | "rebalance") => {
    switch (type) {
      case "buy":
        return {
          icon: <ArrowUpCircle className="w-5 h-5" />,
          color: "text-emerald-500 bg-emerald-500/10",
          label: "Buy",
        };
      case "sell":
        return {
          icon: <ArrowDownCircle className="w-5 h-5" />,
          color: "text-red-500 bg-red-500/10",
          label: "Sell",
        };
      case "hold":
        return {
          icon: <Pause className="w-5 h-5" />,
          color: "text-blue-500 bg-blue-500/10",
          label: "Hold",
        };
      case "rebalance":
        return {
          icon: <RefreshCw className="w-5 h-5" />,
          color: "text-amber-500 bg-amber-500/10",
          label: "Rebalance",
        };
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">🤖</span>
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiRecommendations.map((rec) => {
          const typeConfig = getTypeConfig(rec.type);

          return (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", typeConfig.color)}>
                    {typeConfig.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-white">
                        {rec.title}
                      </h4>
                      {rec.symbol && (
                        <Badge
                          variant="outline"
                          className="text-xs font-mono"
                        >
                          {rec.symbol}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getPriorityColor(rec.priority))}
                      >
                        {rec.priority} priority
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        {Math.round(rec.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                {rec.description}
              </p>

              {/* Reasoning */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-zinc-500 mb-1">AI Reasoning:</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {rec.reasoning}
                </p>
              </div>

              {/* Potential Impact */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Potential Impact:</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                  {rec.potentialImpact}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
