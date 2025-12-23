import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { EnrichedHolding } from "@/lib/api/groww";

interface PortfolioSummaryProps {
  holdings: EnrichedHolding[];
}

export function PortfolioSummary({ holdings }: PortfolioSummaryProps) {
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested_value, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const isProfitable = totalPnL >= 0;

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Current Value - Main Focus */}
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              Current Value
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              ₹{totalCurrentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>

          {/* Invested & P&L */}
          <div className="flex flex-col sm:items-end gap-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Invested: <span className="text-zinc-700 dark:text-zinc-300 font-medium">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </p>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full",
                isProfitable
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {isProfitable ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {isProfitable ? "+" : ""}₹{totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
              <span className="text-sm">
                ({isProfitable ? "+" : ""}{totalPnLPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
