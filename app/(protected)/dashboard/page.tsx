import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundEffects } from "@/components/background-effects";
import { RiskAssessment } from "@/components/dashboard/risk-assessment";
import { TaxHarvesting } from "@/components/dashboard/tax-harvesting";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { PortfolioInsights } from "@/components/dashboard/portfolio-insights";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default async function DashboardPage() {
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                AI Dashboard
              </h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </Badge>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Hello {firstName}! Here are your personalized AI-powered insights
              and recommendations.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - AI Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              <AIRecommendations />
              <TaxHarvesting />
            </div>

            {/* Right Column - Risk & Insights */}
            <div className="space-y-6">
              <RiskAssessment />
              <PortfolioInsights />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              <strong>Disclaimer:</strong> AI recommendations are for
              informational purposes only and should not be considered as
              financial advice. Past performance does not guarantee future
              results. Please consult with a qualified financial advisor before
              making investment decisions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
