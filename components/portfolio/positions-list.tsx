import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrowwPosition } from "@/lib/api/groww";
import { cn } from "@/lib/utils";

// Generate a color based on the symbol
function getSymbolColor(symbol: string): string {
  const colors = [
    "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444",
    "#06B6D4", "#EC4899", "#14B8A6", "#F97316", "#6366F1",
  ];
  const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function PositionRow({ position }: { position: GrowwPosition }) {
  const netValue = position.quantity * position.net_price;
  const isProfitable = position.realised_pnl >= 0;

  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: getSymbolColor(position.trading_symbol) }}
        >
          {position.trading_symbol.slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-zinc-900 dark:text-white">
            {position.trading_symbol}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {position.quantity} qty · {position.exchange} · {position.product}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-medium text-zinc-900 dark:text-white">
          ₹{netValue.toLocaleString("en-IN")}
        </p>
        <div className="flex items-center gap-2 justify-end">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              isProfitable
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {isProfitable ? "+" : ""}₹{position.realised_pnl.toLocaleString("en-IN")}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-zinc-500 dark:text-zinc-400">
        No open positions. Positions will appear here when you have active trades.
      </p>
    </div>
  );
}

interface PositionsListProps {
  positions: GrowwPosition[];
}

export function PositionsList({ positions }: PositionsListProps) {
  const totalPnL = positions.reduce((sum, p) => sum + p.realised_pnl, 0);
  const isProfitable = totalPnL >= 0;

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
          Open Positions
        </CardTitle>
        <div className="flex items-center gap-2">
          {positions.length > 0 && (
            <>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  isProfitable
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                P&L: {isProfitable ? "+" : ""}₹{totalPnL.toLocaleString("en-IN")}
              </Badge>
              <Badge variant="outline" className="text-zinc-500">
                {positions.length} positions
              </Badge>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {positions.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {positions.map((position) => (
              <PositionRow key={position.symbol_isin} position={position} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}
