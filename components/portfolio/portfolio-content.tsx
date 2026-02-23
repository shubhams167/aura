"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { HoldingsList } from "@/components/portfolio/holdings-list";
import { getMergedHoldings } from "@/lib/actions/holdings";
import { AlertCircle, Link2, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UnifiedHolding, MergedHoldingsResult } from "@/lib/types/holdings";
import { BrokerType } from "@/lib/actions/broker";

interface PortfolioContentProps {
  initialHoldings: UnifiedHolding[];
}

export function PortfolioContent({
  initialHoldings,
}: PortfolioContentProps) {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [displayTime, setDisplayTime] = useState<string>("just now");

  // Holdings query
  const {
    data: holdingsResult,
    isFetching,
    refetch: refetchHoldings,
    error: queryError,
    dataUpdatedAt: holdingsUpdatedAt,
  } = useQuery({
    queryKey: ["holdings", "merged"],
    queryFn: async () => {
      const result = await getMergedHoldings();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result as MergedHoldingsResult;
    },
    initialData: initialHoldings.length > 0 ? {
      success: true as const,
      holdings: initialHoldings,
      sources: [],
    } : undefined,
    refetchInterval: autoRefresh ? 10000 : false, // 10 seconds when enabled
    refetchOnWindowFocus: false,
  });

  // Update display time every second when auto-refresh is on
  useEffect(() => {
    const updateDisplayTime = () => {
      if (holdingsUpdatedAt) {
        const diff = Math.floor((Date.now() - holdingsUpdatedAt) / 1000);
        if (diff < 5) {
          setDisplayTime("just now");
        } else if (diff < 60) {
          setDisplayTime(`${diff}s ago`);
        } else if (diff < 3600) {
          setDisplayTime(`${Math.floor(diff / 60)}m ago`);
        } else {
          setDisplayTime(new Date(holdingsUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        }
      }
    };

    updateDisplayTime();
    const interval = setInterval(updateDisplayTime, 1000);
    return () => clearInterval(interval);
  }, [holdingsUpdatedAt]);

  const holdings = holdingsResult?.holdings || [];

  const handleManualRefresh = () => {
    refetchHoldings();
  };

  return (
    <>
      {/* Controls Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
              Auto-refresh
            </Label>
          </div>

          {/* Manual refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isFetching}
            className="gap-2"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>

        {/* Last updated */}
        <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
          <span>Last updated: {displayTime}</span>
          {autoRefresh && (
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs">
              Live
            </span>
          )}
        </div>
      </div>



      {/* Summary Cards */}
      {holdings.length > 0 && (
        <>
          <div className="mb-8">
            <PortfolioSummary holdings={holdings} />
          </div>

          {/* Chart - Full Width */}
          <div className="mb-8">
            <PortfolioChart holdings={holdings} />
          </div>
        </>
      )}

      {/* Holdings List */}
      <HoldingsList holdings={holdings} />
    </>
  );
}
