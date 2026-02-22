import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundEffects } from "@/components/background-effects";
import { StocksContent } from "@/components/stocks/stocks-content";
import { StockSearch } from "@/components/stocks/stock-search";
import { BarChart3 } from "lucide-react";

export default function StocksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black transition-colors duration-300">
      <BackgroundEffects />
      <Navbar searchSlot={<StockSearch compact />} />

      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                Explore Stocks
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
              Search and explore real-time stock data, historical charts, and
              company fundamentals.
            </p>
          </div>

          <StocksContent />
        </div>
      </main>

      <Footer />
    </div>
  );
}
