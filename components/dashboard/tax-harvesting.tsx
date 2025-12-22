import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { taxHarvestOpportunities } from "@/lib/data/ai-recommendations";
import { cn } from "@/lib/utils";

export function TaxHarvesting() {
  const totalSavings = taxHarvestOpportunities.reduce(
    (sum, opp) => sum + opp.potentialTaxSavings,
    0
  );

  return (
    <Card className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="text-xl">💸</span>
            Tax-Loss Harvesting
          </CardTitle>
          {totalSavings > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              Save up to ${totalSavings.toLocaleString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {taxHarvestOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className={cn(
              "p-4 rounded-xl border transition-colors",
              opportunity.potentialTaxSavings > 0
                ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                : "bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {opportunity.symbol}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {opportunity.name}
                  </span>
                </div>
              </div>
              {opportunity.potentialTaxSavings > 0 ? (
                <div className="text-right">
                  <p className="text-sm text-zinc-500">Potential savings</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${opportunity.potentialTaxSavings.toLocaleString()}
                  </p>
                </div>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                >
                  In Profit
                </Badge>
              )}
            </div>

            {opportunity.currentLoss > 0 && (
              <p className="text-sm text-red-500 mb-2">
                Unrealized Loss: -${opportunity.currentLoss.toLocaleString()}
              </p>
            )}

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {opportunity.recommendation}
            </p>

            {opportunity.alternativeSymbol && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  Suggested alternative:
                </span>
                <Badge
                  variant="outline"
                  className="text-xs border-blue-500/30 text-blue-600 dark:text-blue-400"
                >
                  {opportunity.alternativeSymbol}
                </Badge>
              </div>
            )}
          </div>
        ))}

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4">
          * Tax savings estimates assume a 30% marginal tax rate. Consult a tax
          professional for personalized advice.
        </p>
      </CardContent>
    </Card>
  );
}
