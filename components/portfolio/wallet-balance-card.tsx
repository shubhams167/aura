import { Card, CardContent } from "@/components/ui/card";

export function WalletBalanceCard({ balance, currency }: { balance: number; currency: string }) {
  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              Virtual Wallet Balance (Purchasing Power)
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(balance)}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Use this balance to buy stocks globally.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
