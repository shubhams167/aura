"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency, formatCompactCurrency } from "@/lib/utils";
import { AddToWatchlistMenu } from "@/components/watchlists/add-to-watchlist-menu";
import { useRouter } from "next/navigation";
import { StockLogo } from "./stock-logo";

interface StockQuote {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
  market_cap?: number;
  currency?: string;
  logo_url?: string;
  domain_url?: string;
}

interface StockCardProps {
  stock: StockQuote;
}

export function StockCard({ stock }: StockCardProps) {
  const router = useRouter();
  const isPositive = stock.change >= 0;

  const formatMarketCap = (cap?: number) => {
    if (!cap) return "—";
    return formatCompactCurrency(cap, stock.currency);
  };

  const formatVolume = (vol?: number) => {
    if (!vol) return "—";
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
    return vol.toLocaleString();
  };

  return (
    <div
      onClick={() => router.push(`/stocks/${stock.symbol}`)}
      className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-5 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header: Symbol + Change indicator */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 dark:from-emerald-500/30 dark:to-emerald-600/20 flex items-center justify-center shrink-0">
              <StockLogo symbol={stock.symbol} logoUrl={stock.logo_url} domainUrl={stock.domain_url} size={40} />
            </div>
            <div className="min-w-0 pr-2">
              <p className="font-semibold text-zinc-900 dark:text-white text-sm line-clamp-1">
                {stock.symbol}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[100px] sm:max-w-[120px]">
                {stock.name || "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 pt-0.5">
            <div className="flex items-center justify-end gap-1.5">
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shrink-0",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 flex-shrink-0" />
                )}
                {isPositive ? "+" : ""}
                {stock.change_percent.toFixed(2)}%
              </div>
              <div onClick={(e) => e.stopPropagation()} className="shrink-0 -mr-2">
                <AddToWatchlistMenu symbol={stock.symbol} className="h-7 w-7 p-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {formatCurrency(stock.price, stock.currency)}
          </p>
          <p
            className={cn(
              "text-sm font-medium",
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {isPositive ? "+" : ""}
            {stock.change.toFixed(2)} today
          </p>
        </div>

        {/* Footer: Volume + Market cap */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Volume
            </p>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {formatVolume(stock.volume)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Mkt Cap
            </p>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {formatMarketCap(stock.market_cap)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
