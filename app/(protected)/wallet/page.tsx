import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundEffects } from "@/components/background-effects";
import { auth } from "@/lib/auth";
import { getWallet } from "@/lib/actions/wallet";
import { WalletBalanceCard } from "@/components/portfolio/wallet-balance-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function WalletPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "User";

  const wallet = await getWallet();
  const walletBalance = parseFloat(wallet?.balance as string || "0");
  const transactions = (wallet as any)?.transactions || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black transition-colors duration-300">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Virtual Wallet
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage your virtual funds and view past transactions, {firstName}.
            </p>
          </div>

          <WalletBalanceCard balance={walletBalance} />

          <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {transactions.map((tx: any) => (
                    <div key={tx.id} className="py-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tx.type === "BUY" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                            {tx.type}
                          </span>
                          <span className="font-semibold text-zinc-900 dark:text-white">{tx.symbol}</span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {tx.quantity} shares @ {formatCurrency(parseFloat(tx.price), tx.currency || "USD")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${tx.type === "BUY" ? "text-zinc-900 dark:text-white" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {tx.type === "BUY" ? "-" : "+"}{formatCurrency(parseFloat(tx.price) * parseFloat(tx.quantity), tx.currency || "USD")}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No transactions yet. Start trading!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
