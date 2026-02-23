import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundEffects } from "@/components/background-effects";
import { StocksContent } from "@/components/stocks/stocks-content";
import { WatchlistManager } from "@/components/watchlists/watchlist-manager";
import { MarketIndices } from "@/components/stocks/market-indices";
import { BarChart3 } from "lucide-react";

export default function StocksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black transition-colors duration-300">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-[1400px] mx-auto gap-8 grid grid-cols-1 lg:grid-cols-5">
          {/* Left Column (60%) - Trending Stocks */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
            <MarketIndices />

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                  Markets & Trending
                </h1>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Search real-time stock data or explore today&apos;s most heavily traded names.
              </p>
            </div>

            <StocksContent />
          </div>

          {/* Right Column (40%) - Watchlists */}
          <div className="lg:col-span-2 xl:col-span-2 flex flex-col">
            <div className="sticky top-24 pt-4 lg:pt-0">
              <WatchlistManager />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
