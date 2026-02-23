"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";

const INDICES = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "Nasdaq" },
  { symbol: "^NSEI", name: "Nifty 50" },
  { symbol: "^BSESN", name: "Sensex" },
];

export function MarketIndices() {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {INDICES.map((index) => (
          <IndexCard key={index.symbol} symbol={index.symbol} name={index.name} />
        ))}
      </div>
    </div>
  );
}

function IndexCard({ symbol, name }: { symbol: string; name: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["quote", symbol],
    queryFn: async () => {
      const res = await fetch(`/api/stocks/${symbol}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-4 h-[104px]">
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
            <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-4 h-[104px]">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Failed to load</p>
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <Link
      href={`/stocks/${symbol}`}
      className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-4 transition-all duration-300 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 overflow-hidden block"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col gap-1">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {name}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-zinc-900 dark:text-white">
            {formatCurrency(data.price, data.currency, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <div
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium",
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
            {data.change_percent.toFixed(2)}%
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              isPositive ? "text-emerald-600/70 dark:text-emerald-400/70" : "text-red-600/70 dark:text-red-400/70"
            )}
          >
            {isPositive ? "+" : ""}
            {data.change.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
