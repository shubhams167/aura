import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundEffects } from "@/components/background-effects";
import { StockDetailContent } from "@/components/stocks/stock-detail-content";

interface StockDetailPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const { symbol } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black transition-colors duration-300">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <StockDetailContent symbol={symbol.toUpperCase()} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
