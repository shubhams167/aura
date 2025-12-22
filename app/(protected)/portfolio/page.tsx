import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundEffects } from "@/components/background-effects";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { AllocationChart } from "@/components/portfolio/allocation-chart";
import { HoldingsList } from "@/components/portfolio/holdings-list";
import { auth } from "@/lib/auth";

export default async function PortfolioPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "User";

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

          {/* Summary Cards */}
          <div className="mb-8">
            <PortfolioSummary />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <PortfolioChart />
            </div>
            <div>
              <AllocationChart />
            </div>
          </div>

          {/* Holdings List */}
          <HoldingsList />
        </div>
      </main>

      <Footer />
    </div>
  );
}
