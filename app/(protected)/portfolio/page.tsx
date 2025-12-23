import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundEffects } from "@/components/background-effects";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { AllocationChart } from "@/components/portfolio/allocation-chart";
import { HoldingsList } from "@/components/portfolio/holdings-list";
import { PositionsList } from "@/components/portfolio/positions-list";
import { auth } from "@/lib/auth";
import { getGrowwHoldings, getGrowwPortfolioPositions } from "@/lib/actions/broker";
import { AlertCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PortfolioPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "User";

  // Fetch holdings and positions in parallel
  const [holdingsResult, positionsResult] = await Promise.all([
    getGrowwHoldings(),
    getGrowwPortfolioPositions(),
  ]);

  const holdings = holdingsResult.success ? holdingsResult.holdings : [];
  const positions = positionsResult.success ? positionsResult.positions : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black transition-colors duration-300">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Your Portfolio
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Welcome back, {firstName}. Here&apos;s how your investments are
              performing.
            </p>
          </div>

          {/* Error State */}
          {!holdingsResult.success && (
            <div className="mb-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    Connect Your Broker
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    {holdingsResult.error}
                  </p>
                  <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Link href="/">
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect Broker
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          {holdingsResult.success && holdings && holdings.length > 0 && (
            <>
              <div className="mb-8">
                <PortfolioSummary holdings={holdings} />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <PortfolioChart holdings={holdings} />
                </div>
                <div>
                  <AllocationChart holdings={holdings} />
                </div>
              </div>
            </>
          )}

          {/* Positions List - Only show if there are positions */}
          {positions && positions.length > 0 && (
            <div className="mb-8">
              <PositionsList positions={positions} />
            </div>
          )}

          {/* Holdings List */}
          <HoldingsList holdings={holdings || []} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
