import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
    return (
        <div className="text-center max-w-4xl mx-auto">
            <Badge
                variant="outline"
                className="mb-4 sm:mb-6 border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-zinc-400 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm"
            >
                ✨ Real-time market data powered by AI
            </Badge>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-zinc-900 dark:text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                Track Your{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Investments
                </span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Like Never Before
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                Aura gives you the power to monitor markets, analyze trends, and make
                smarter investment decisions with real-time insights and beautiful
                visualizations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Button
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg rounded-full shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-105"
                >
                    Launch Dashboard
                    <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                    </svg>
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/5 px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg rounded-full"
                >
                    View Demo
                </Button>
            </div>
        </div>
    );
}
