import { Card, CardContent } from "@/components/ui/card";
import { portfolioSummary } from "@/lib/data/portfolio";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  change?: string;
  changePercent?: number;
  icon: React.ReactNode;
}

function SummaryCard({
  title,
  value,
  change,
  changePercent,
  icon,
}: SummaryCardProps) {
  const isPositive = changePercent === undefined || changePercent >= 0;

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              {title}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {value}
            </p>
            {change && (
              <p
                className={cn(
                  "text-sm mt-1",
                  isPositive ? "text-emerald-500" : "text-red-500"
                )}
              >
                {isPositive ? "+" : ""}
                {change} ({isPositive ? "+" : ""}
                {changePercent?.toFixed(2)}%)
              </p>
            )}
          </div>
          <div
            className={cn(
              "p-2 rounded-lg",
              isPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioSummary() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Value"
        value={`$${portfolioSummary.totalValue.toLocaleString()}`}
        icon={<DollarSign className="w-5 h-5" />}
      />
      <SummaryCard
        title="Total Gain/Loss"
        value={`$${portfolioSummary.totalGain.toLocaleString()}`}
        change={`$${portfolioSummary.totalGain.toLocaleString()}`}
        changePercent={portfolioSummary.totalGainPercent}
        icon={
          portfolioSummary.totalGain >= 0 ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )
        }
      />
      <SummaryCard
        title="Today's Change"
        value={`$${portfolioSummary.dayChange.toLocaleString()}`}
        change={`$${portfolioSummary.dayChange.toLocaleString()}`}
        changePercent={portfolioSummary.dayChangePercent}
        icon={
          portfolioSummary.dayChange >= 0 ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )
        }
      />
      <SummaryCard
        title="Total Return"
        value={`${portfolioSummary.totalGainPercent.toFixed(2)}%`}
        change={`${portfolioSummary.totalGainPercent.toFixed(2)}%`}
        changePercent={portfolioSummary.totalGainPercent}
        icon={<Activity className="w-5 h-5" />}
      />
    </div>
  );
}
