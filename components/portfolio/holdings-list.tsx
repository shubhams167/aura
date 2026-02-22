"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedHolding } from "@/lib/types/holdings";
import { cn } from "@/lib/utils";
import { ArrowUpDown, TrendingUp, Wallet, BarChart3 } from "lucide-react";

type SortField = "invested" | "current" | "pnl";
type SortOrder = "asc" | "desc";

// Generate a color based on the symbol
function getSymbolColor(symbol: string): string {
  const colors = [
    "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444",
    "#06B6D4", "#EC4899", "#14B8A6", "#F97316", "#6366F1",
  ];
  const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Broker badge colors
const brokerColors: Record<string, { bg: string; text: string }> = {
  groww: { bg: "bg-[#00D09C]/10", text: "text-[#00D09C]" },
  zerodha: { bg: "bg-[#387ED1]/10", text: "text-[#387ED1]" },
  upstox: { bg: "bg-purple-500/10", text: "text-purple-500" },
};

function BrokerBadges({ brokers }: { brokers: string[] }) {
  return (
    <div className="flex gap-1 mt-1">
      {brokers.map((broker) => {
        const colors = brokerColors[broker] || { bg: "bg-zinc-500/10", text: "text-zinc-500" };
        return (
          <Badge
            key={broker}
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 h-4 font-normal border-0", colors.bg, colors.text)}
          >
            {broker.charAt(0).toUpperCase() + broker.slice(1)}
          </Badge>
        );
      })}
    </div>
  );
}

function HoldingRow({ holding }: { holding: UnifiedHolding }) {
  const isProfitable = holding.pnl >= 0;
  const showMultipleBrokers = holding.brokers.length > 1;

  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: getSymbolColor(holding.trading_symbol) }}
        >
          {holding.trading_symbol.slice(0, 2)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-zinc-900 dark:text-white">
              {holding.trading_symbol}
            </p>
            {showMultipleBrokers && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Merged
              </Badge>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {holding.quantity} shares · ₹{holding.average_price.toFixed(2)} avg
          </p>
          <BrokerBadges brokers={holding.brokers} />
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-2 justify-end mb-1">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            LTP: ₹{holding.current_price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
          <p className="font-medium text-zinc-900 dark:text-white">
            ₹{holding.current_value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              isProfitable
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {isProfitable ? "+" : ""}₹{holding.pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({isProfitable ? "+" : ""}{holding.pnl_percent.toFixed(2)}%)
          </Badge>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-zinc-500 dark:text-zinc-400">
        No holdings found. Connect your broker accounts to see your portfolio.
      </p>
    </div>
  );
}

interface HoldingsListProps {
  holdings: UnifiedHolding[];
  sources?: string[];
}

export function HoldingsList({ holdings, sources }: HoldingsListProps) {
  const [sortField, setSortField] = useState<SortField>("pnl");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case "invested":
          aValue = a.invested_value;
          bValue = b.invested_value;
          break;
        case "current":
          aValue = a.current_value;
          bValue = b.current_value;
          break;
        case "pnl":
          aValue = a.pnl;
          bValue = b.pnl;
          break;
      }

      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });
  }, [holdings, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);
  const isProfitable = totalPnL >= 0;

  const sortButtons: { field: SortField; label: string; icon: React.ReactNode }[] = [
    { field: "invested", label: "Invested", icon: <Wallet className="w-3.5 h-3.5" /> },
    { field: "current", label: "Current", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { field: "pnl", label: "P&L", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
            Holdings
          </CardTitle>
          {holdings.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  isProfitable
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                P&L: {isProfitable ? "+" : ""}₹{totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Badge>
              <Badge variant="outline" className="text-zinc-500">
                {holdings.length}
              </Badge>
              {sources && sources.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 ml-2">
                  {sources.map((source) => {
                    const colors = brokerColors[source] || { bg: "bg-zinc-500/10", text: "text-zinc-500" };
                    return (
                      <Badge
                        key={source}
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0 h-4 font-normal border-0", colors.bg, colors.text)}
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sort Controls */}
        {holdings.length > 1 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">Sort by:</span>
            {sortButtons.map(({ field, label, icon }) => (
              <Button
                key={field}
                variant={sortField === field ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleSort(field)}
                className={cn(
                  "h-7 px-2 text-xs gap-1",
                  sortField === field && "bg-zinc-200 dark:bg-zinc-700"
                )}
              >
                {icon}
                {label}
                {sortField === field && (
                  <ArrowUpDown className={cn(
                    "w-3 h-3 ml-0.5",
                    sortOrder === "asc" && "rotate-180"
                  )} />
                )}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {holdings.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sortedHoldings.map((holding) => (
              <HoldingRow key={holding.isin} holding={holding} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}
