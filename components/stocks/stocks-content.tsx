"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp } from "lucide-react";
import { StockCard } from "@/components/stocks/stock-card";

const POPULAR_STOCKS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
  "META", "TSLA", "BRK-B", "JPM", "V",
];

export function StocksContent() {
  const { data: stocks, isLoading, error } = useQuery({
    queryKey: ["stocks", "popular"],
    queryFn: async () => {
      const res = await fetch(`/api/stocks?symbols=${POPULAR_STOCKS.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch stocks");
      return res.json();
    },
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {/* Popular Stocks */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Popular Stocks
          </h2>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 text-center">
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              Unable to load stock data. Make sure the market data server is running.
            </p>
          </div>
        )}

        {stocks && stocks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {stocks.map((stock: { symbol: string; name?: string; price: number; change: number; change_percent: number; volume?: number; market_cap?: number }) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}

        {stocks && stocks.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400">
              No stock data available. Please ensure the market data server is running.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
