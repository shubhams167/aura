import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { UnifiedHolding } from "@/lib/types/holdings";

interface PortfolioSummaryProps {
  holdings: UnifiedHolding[];
}

export function PortfolioSummary({ holdings }: PortfolioSummaryProps) {
  const holdingsByCurrency = holdings.reduce((acc, h) => {
    const currency = h.currency || "USD";
    if (!acc[currency]) {
      acc[currency] = { invested: 0, current: 0, pnl: 0 };
    }
    acc[currency].invested += h.invested_value;
    acc[currency].current += h.current_value;
    acc[currency].pnl += h.pnl;
    return acc;
  }, {} as Record<string, { invested: number; current: number; pnl: number }>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(holdingsByCurrency).map(([currency, totals]) => {
        const totalPnLPercent = totals.invested > 0 ? (totals.pnl / totals.invested) * 100 : 0;
        const isProfitable = totals.pnl >= 0;

        return (
          <Card key={currency} className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Current Value - Main Focus */}
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    Current Value ({currency})
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(totals.current, currency, { maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* Invested & P&L */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Invested: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{formatCurrency(totals.invested, currency, { maximumFractionDigits: 0 })}</span>
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full self-start",
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
                      {isProfitable ? "+" : ""}{formatCurrency(totals.pnl, currency, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-sm border-l border-zinc-400/30 pl-2">
                      {isProfitable ? "+" : ""}{totalPnLPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
