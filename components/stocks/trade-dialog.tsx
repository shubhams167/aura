"use client";

import { useState, useEffect, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { buyStock, sellStock, getHoldingForSymbol } from "@/lib/actions/wallet";
import { useRouter } from "next/navigation";

interface TradeDialogProps {
  symbol: string;
  price: number;
  currency?: string;
  initialType?: "BUY" | "SELL";
  children?: ReactNode;
}

export function TradeDialog({ symbol, price, currency = "USD", initialType = "BUY", children }: TradeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"BUY" | "SELL">(initialType);
  const [quantity, setQuantity] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableShares, setAvailableShares] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      getHoldingForSymbol(symbol)
        .then(data => setAvailableShares(data.shares))
        .catch(() => setAvailableShares(0));
    }
  }, [isOpen, initialType, symbol]);

  const handleTrade = async () => {
    try {
      setLoading(true);
      setError(null);
      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        throw new Error("Invalid quantity");
      }

      if (type === "SELL" && availableShares !== null && qty > availableShares) {
        throw new Error("Insufficient shares to sell");
      }

      const res = type === "BUY"
        ? await buyStock(symbol, qty)
        : await sellStock(symbol, qty);

      if (res.success) {
        setIsOpen(false);
        setQuantity("1");
        router.push("/portfolio");
      } else {
        setError("Trade failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const costOrRevenue = parseFloat(quantity) * price;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setError(null);
        setQuantity("1");
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button className="ml-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            Trade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl">Trade {symbol}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
          <Button
            className={`flex-1 rounded-md ${type === "BUY" ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm" : "bg-transparent text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"}`}
            variant="ghost"
            onClick={() => setType("BUY")}
          >
            Buy
          </Button>
          <Button
            className={`flex-1 rounded-md ${type === "SELL" ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm" : "bg-transparent text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"}`}
            variant="ghost"
            onClick={() => setType("SELL")}
          >
            Sell
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <label>Quantity (Shares)</label>
              {type === "SELL" && availableShares !== null && (
                <span className="text-zinc-500 dark:text-zinc-400 font-normal">Available: {availableShares}</span>
              )}
            </div>
            <Input
              type="number"
              min="1"
              max={type === "SELL" ? (availableShares || undefined) : undefined}
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center py-3 border-y border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Current Price</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(price, currency)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Estimated {type === "BUY" ? "Cost" : "Revenue"}</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {!isNaN(costOrRevenue) ? formatCurrency(costOrRevenue, currency) : "-"}
            </span>
          </div>

          {error && (
            <div className="p-3 mt-4 text-sm text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <Button
            className={`w-full mt-4 text-white ${type === "BUY" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-red-500 hover:bg-red-600 shadow-red-500/20"}`}
            size="lg"
            onClick={handleTrade}
            disabled={loading || isNaN(costOrRevenue) || costOrRevenue <= 0 || (type === "SELL" && (availableShares === 0 || availableShares === null))}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Confirm ${type}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
