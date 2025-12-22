import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { holdings, type Holding } from "@/lib/data/portfolio";
import { cn } from "@/lib/utils";

function HoldingRow({ holding }: { holding: Holding }) {
  const isPositive = holding.change >= 0;
  const isGainPositive = holding.gain >= 0;

  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: holding.color }}
        >
          {holding.symbol.slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-zinc-900 dark:text-white">
            {holding.symbol}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {holding.shares} shares · ${holding.avgCost.toFixed(2)} avg
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-medium text-zinc-900 dark:text-white">
          ${holding.value.toLocaleString()}
        </p>
        <div className="flex items-center gap-2 justify-end">
          <span
            className={cn(
              "text-sm",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {isPositive ? "+" : ""}
            {holding.changePercent.toFixed(2)}%
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              isGainPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {isGainPositive ? "+" : ""}${holding.gain.toLocaleString()}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function HoldingsList() {
  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
          Holdings
        </CardTitle>
        <Badge variant="outline" className="text-zinc-500">
          {holdings.length} positions
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {holdings.map((holding) => (
            <HoldingRow key={holding.id} holding={holding} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
