"use server";

import { db } from "@/lib/db";
import { wallets, walletTransactions, walletHoldings } from "@/lib/db/schema";
import { eq, and, ilike } from "drizzle-orm";
import { auth } from "@/lib/auth";

// Replace with local server depending on env or just use a fixed URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function initializeWallet() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existingWallet = await db.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
  });

  if (existingWallet) {
    return existingWallet;
  }

  const [newWallet] = await db.insert(wallets).values({
    userId,
    balance: "100000",
  }).returning();

  return newWallet;
}

export async function getWallet() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
    with: {
      holdings: true,
      transactions: {
        orderBy: (transactions, { desc }) => [desc(transactions.timestamp)],
        limit: 50,
      }
    }
  });

  if (!wallet) {
    return await initializeWallet();
  }

  return wallet;
}

export async function buyStock(symbol: string, quantity: number) {
  if (quantity <= 0) throw new Error("Quantity must be greater than zero");

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let wallet = await getWallet();
  if (!wallet) throw new Error("Wallet not found");

  // Fetch real-time price
  const res = await fetch(`${API_URL}/api/v1/quote/${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch current stock price");
  const quote = await res.json();
  const currentPrice = quote.price;
  const quoteCurrency = quote.currency || "USD";

  const totalCost = currentPrice * quantity;
  const currentBalance = parseFloat(wallet.balance as string || "0");

  if (currentBalance < totalCost) {
    throw new Error("Insufficient funds");
  }

  // 1. Deduct balance
  const newBalance = currentBalance - totalCost;
  await db.update(wallets)
    .set({ balance: newBalance.toString() })
    .where(eq(wallets.id, wallet.id));

  // 2. Add transaction
  await db.insert(walletTransactions).values({
    walletId: wallet.id,
    symbol,
    type: "BUY",
    quantity: quantity.toString(),
    price: currentPrice.toString(),
    currency: quoteCurrency,
  });

  // 3. Update holdings
  const existingHolding = await db.query.walletHoldings.findFirst({
    where: and(eq(walletHoldings.walletId, wallet.id), ilike(walletHoldings.symbol, symbol))
  });

  if (existingHolding) {
    const existingQty = parseFloat(existingHolding.quantity as string);
    const existingAvg = parseFloat(existingHolding.averageCost as string);

    const newQty = existingQty + quantity;
    const newTotalCost = (existingQty * existingAvg) + totalCost;
    const newAvgCost = newTotalCost / newQty;

    await db.update(walletHoldings)
      .set({
        quantity: newQty.toString(),
        averageCost: newAvgCost.toString()
      })
      .where(eq(walletHoldings.id, existingHolding.id));
  } else {
    await db.insert(walletHoldings).values({
      walletId: wallet.id,
      symbol: symbol.toUpperCase(),
      quantity: quantity.toString(),
      averageCost: currentPrice.toString(),
      currency: quoteCurrency,
    });
  }

  return { success: true, message: `Successfully bought ${quantity} shares of ${symbol}`, newBalance: currentBalance - totalCost };
}

export async function sellStock(symbol: string, quantity: number) {
  if (quantity <= 0) throw new Error("Quantity must be greater than zero");

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let wallet = await getWallet();
  if (!wallet) throw new Error("Wallet not found");

  // Fetch real-time price
  const res = await fetch(`${API_URL}/api/v1/quote/${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch current stock price");
  const quote = await res.json();
  const currentPrice = quote.price;
  const quoteCurrency = quote.currency || "USD";

  const totalRevenue = currentPrice * quantity;
  const currentBalance = parseFloat(wallet.balance as string || "0");

  const existingHolding = await db.query.walletHoldings.findFirst({
    where: and(eq(walletHoldings.walletId, wallet.id), ilike(walletHoldings.symbol, symbol))
  });

  if (!existingHolding) {
    throw new Error("You do not own any shares of this stock");
  }

  const existingQty = parseFloat(existingHolding.quantity as string);

  if (existingQty < quantity) {
    throw new Error("Insufficient shares to sell");
  }

  // 1. Add balance
  const newBalance = currentBalance + totalRevenue;
  await db.update(wallets)
    .set({ balance: newBalance.toString() })
    .where(eq(wallets.id, wallet.id));

  // 2. Add transaction
  await db.insert(walletTransactions).values({
    walletId: wallet.id,
    symbol,
    type: "SELL",
    quantity: quantity.toString(),
    price: currentPrice.toString(),
    currency: quoteCurrency,
  });

  // 3. Update or remove holdings
  const newQty = existingQty - quantity;

  if (newQty <= 0) {
    await db.delete(walletHoldings).where(eq(walletHoldings.id, existingHolding.id));
  } else {
    await db.update(walletHoldings)
      .set({ quantity: newQty.toString() })
      .where(eq(walletHoldings.id, existingHolding.id));
  }

  return { success: true, message: `Successfully sold ${quantity} shares of ${symbol}`, newBalance: currentBalance + totalRevenue };
}

export async function getPortfolio() {
  const wallet = await getWallet();
  if (!wallet) return null;

  const currentBalance = parseFloat(wallet.balance as string || "0");
  const holdings = (wallet as any).holdings || [];
  const transactions = (wallet as any).transactions || [];

  // Fetch live quotes for all holdings
  const holdingsPromises = holdings.map(async (holding: any) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/quote/${holding.symbol}`);
      if (!res.ok) throw new Error("Failed");
      const quote = await res.json();

      const qty = parseFloat(holding.quantity as string);
      const avgCost = parseFloat(holding.averageCost as string);
      const currentPrice = quote.price;

      const value = qty * currentPrice;
      const totalCost = qty * avgCost;
      const gain = value - totalCost;
      const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;

      return {
        id: holding.id,
        symbol: holding.symbol,
        name: quote.name || holding.symbol,
        shares: qty,
        avgCost,
        currentPrice,
        change: quote.change,
        changePercent: quote.change_percent,
        value,
        gain,
        gainPercent,
        color: gain >= 0 ? "#10B981" : "#EF4444", // Use green or red based on gain
        currency: quote.currency || "USD",
      };
    } catch (e) {
      // Return a fallback if fetch fails
      const qty = parseFloat(holding.quantity as string);
      const avgCost = parseFloat(holding.averageCost as string);
      return {
        id: holding.id,
        symbol: holding.symbol,
        name: holding.symbol,
        shares: qty,
        avgCost,
        currentPrice: avgCost,
        change: 0,
        changePercent: 0,
        value: qty * avgCost,
        gain: 0,
        gainPercent: 0,
        color: "#9CA3AF",
        currency: "USD",
      };
    }
  });

  const processedHoldings = await Promise.all(holdingsPromises);

  const totalHoldingsValue = processedHoldings.reduce((sum: number, h: any) => sum + h.value, 0);
  const totalHoldingsCost = processedHoldings.reduce((sum: number, h: any) => sum + (h.avgCost * h.shares), 0);

  const totalValue = currentBalance + totalHoldingsValue;
  const totalGain = totalHoldingsValue - totalHoldingsCost;
  const totalGainPercent = totalHoldingsCost > 0 ? (totalGain / totalHoldingsCost) * 100 : 0;

  // Simple day change metric, aggregating the day's changes (very crude but functional for demo)
  const dayChange = processedHoldings.reduce((sum: number, h: any) => sum + (h.change * h.shares), 0);
  const totalPrevValue = totalHoldingsValue - dayChange;
  const dayChangePercent = totalPrevValue > 0 ? (dayChange / totalPrevValue) * 100 : 0;

  return {
    wallet: {
      id: wallet.id,
      balance: currentBalance,
      transactions: transactions,
    },
    holdings: processedHoldings,
    summary: {
      totalValue,
      totalGain,
      totalGainPercent,
      dayChange,
      dayChangePercent,
      purchasingPower: currentBalance,
    }
  };
}

export async function getHoldingForSymbol(symbol: string) {
  const session = await auth();
  if (!session?.user?.id) return { shares: 0 };

  const wallet = await getWallet();
  if (!wallet) return { shares: 0 };

  const existingHolding = await db.query.walletHoldings.findFirst({
    where: and(eq(walletHoldings.walletId, wallet.id), ilike(walletHoldings.symbol, symbol))
  });

  if (!existingHolding) return { shares: 0 };

  return { shares: parseFloat(existingHolding.quantity as string) };
}
