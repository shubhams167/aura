"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Globe,
  Building2,
  Users,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { cn, formatCurrency, formatCompactCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AddToWatchlistMenu } from "@/components/watchlists/add-to-watchlist-menu";
import { StockLogo } from "./stock-logo";

interface StockDetailContentProps {
  symbol: string;
}

const PERIODS = [
  { label: "1W", value: "5d", interval: "1d" },
  { label: "1M", value: "1mo", interval: "1d" },
  { label: "3M", value: "3mo", interval: "1d" },
  { label: "6M", value: "6mo", interval: "1wk" },
  { label: "1Y", value: "1y", interval: "1wk" },
  { label: "5Y", value: "5y", interval: "1mo" },
];

export function StockDetailContent({ symbol }: StockDetailContentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[1]); // default: 1M

  // Fetch quote
  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: ["stock", symbol, "quote"],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${symbol}`);
      if (!res.ok) throw new Error("Failed to fetch quote");
      return res.json();
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["stock", symbol, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${symbol}/profile`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    staleTime: 3600_000,
  });

  // Fetch history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["stock", symbol, "history", selectedPeriod.value],
    queryFn: async () => {
      const res = await fetch(
        `/api/stocks/${symbol}/history?period=${selectedPeriod.value}&interval=${selectedPeriod.interval}`
      );
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    staleTime: 300_000,
  });

  const isPositive = quote?.change >= 0;
  const chartData =
    history?.bars?.map((bar: { date: string; close: number; volume: number }) => ({
      date: bar.date,
      price: bar.close,
      volume: bar.volume,
    })) || [];

  const formatLargeNumber = (n?: number) => {
    if (!n) return "—";
    return formatCompactCurrency(n, profile?.currency || quote?.currency);
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/stocks"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Stocks
      </Link>

      {/* Stock header */}
      {quoteLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : quote ? (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 dark:from-emerald-500/30 dark:to-emerald-600/20 flex items-center justify-center shrink-0">
                <StockLogo symbol={symbol} logoUrl={quote.logo_url} domainUrl={quote.domain_url} size={48} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  {quote.name || symbol}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <span>{symbol}</span>
                  {quote.exchange && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {quote.exchange}
                    </span>
                  )}
                  <AddToWatchlistMenu symbol={symbol} className="p-1 -ml-1 text-zinc-400 hover:text-emerald-500" />
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              {quote.price ? formatCurrency(quote.price, quote.currency) : "—"}
            </p>
            <div className="flex items-center gap-2 sm:justify-end">
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? "+" : ""}
                {quote.change?.toFixed(2)} ({isPositive ? "+" : ""}
                {quote.change_percent?.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">Unable to load stock data.</p>
        </div>
      )}

      {/* Historical chart */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-6">
        {/* Period selector */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Price History
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  selectedPeriod.value === period.value
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => {
                  const date = new Date(d);
                  if (selectedPeriod.value === "5d" || selectedPeriod.value === "1mo") {
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }
                  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                }}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                axisLine={{ stroke: "currentColor", strokeWidth: 1, className: "text-zinc-200 dark:text-zinc-800" }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                axisLine={{ stroke: "currentColor", strokeWidth: 1, className: "text-zinc-200 dark:text-zinc-800" }}
                tickLine={false}
                tickFormatter={(v) => formatCompactCurrency(v, quote?.currency || history?.currency)}
                width={60}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-lg">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(d.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                          {formatCurrency(d.price, quote?.currency || history?.currency)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-zinc-400">
            No chart data available
          </div>
        )}
      </div>

      {/* Company overview + Key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company overview — left 2 cols */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            About
          </h2>

          {profileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : profile ? (
            <div className="space-y-4">
              {/* Sector / Industry badges */}
              <div className="flex flex-wrap gap-2">
                {profile.sector && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {profile.sector}
                  </span>
                )}
                {profile.industry && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {profile.industry}
                  </span>
                )}
              </div>

              {/* Description */}
              {profile.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-6">
                  {profile.description}
                </p>
              )}

              {/* Quick facts */}
              <div className="flex flex-wrap gap-4 pt-2">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.country && (
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <Globe className="w-3.5 h-3.5" />
                    {profile.country}
                  </span>
                )}
                {profile.employees && (
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <Users className="w-3.5 h-3.5" />
                    {profile.employees.toLocaleString()} employees
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Company data unavailable.
            </p>
          )}
        </div>

        {/* Key metrics — right col */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Key Metrics
          </h2>

          {profileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : profile ? (
            <div className="space-y-3">
              <MetricRow label="Market Cap" value={formatLargeNumber(profile.market_cap)} />
              <MetricRow label="P/E Ratio" value={profile.pe_ratio?.toFixed(2) || "—"} />
              <MetricRow label="Forward P/E" value={profile.forward_pe?.toFixed(2) || "—"} />
              <MetricRow
                label="Dividend Yield"
                value={profile.dividend_yield ? `${(profile.dividend_yield * 100).toFixed(2)}%` : "—"}
              />
              <MetricRow label="Beta" value={profile.beta?.toFixed(2) || "—"} />
              <MetricRow
                label="52W High"
                value={profile.fifty_two_week_high ? formatCurrency(profile.fifty_two_week_high, profile.currency) : "—"}
              />
              <MetricRow
                label="52W Low"
                value={profile.fifty_two_week_low ? formatCurrency(profile.fifty_two_week_low, profile.currency) : "—"}
              />
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Metrics unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-900 dark:text-white">{value}</span>
    </div>
  );
}
