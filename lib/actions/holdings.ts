"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brokerCredentials } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { decryptCredentials, decryptAccessToken } from "@/lib/crypto";
import {
  getGrowwAccessToken,
  getGrowwHoldings as fetchGrowwHoldings,
  getGrowwLTP,
  GrowwHolding,
} from "@/lib/api/groww";
import {
  getZerodhaHoldings as fetchZerodhaHoldings,
  normalizeZerodhaHoldings,
  isZerodhaTokenExpired,
} from "@/lib/api/zerodha";
import {
  UnifiedHolding,
  MergedHoldingsResponse,
} from "@/lib/types/holdings";
import { BrokerType } from "@/lib/actions/broker";

/**
 * Convert Groww holdings to unified format
 */
function normalizeGrowwHoldings(
  holdings: GrowwHolding[],
  prices: Record<string, number>
): UnifiedHolding[] {
  return holdings.map((holding) => {
    const currentPrice = prices[holding.trading_symbol] || holding.average_price;
    const investedValue = holding.quantity * holding.average_price;
    const currentValue = holding.quantity * currentPrice;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return {
      isin: holding.isin,
      trading_symbol: holding.trading_symbol,
      quantity: holding.quantity,
      average_price: holding.average_price,
      current_price: currentPrice,
      invested_value: investedValue,
      current_value: currentValue,
      pnl,
      pnl_percent: pnlPercent,
      brokers: ["groww"],
      exchange: "NSE", // Groww primarily uses NSE
    };
  });
}

/**
 * Merge holdings from multiple brokers
 * - Same ISIN stocks are combined
 * - Weighted average price is calculated
 * - Brokers array tracks which brokers hold the stock
 */
function mergeHoldings(allHoldings: UnifiedHolding[]): UnifiedHolding[] {
  const holdingsByIsin = new Map<string, UnifiedHolding>();

  for (const holding of allHoldings) {
    const existing = holdingsByIsin.get(holding.isin);

    if (existing) {
      // Merge holdings with same ISIN
      const totalQuantity = existing.quantity + holding.quantity;
      const totalInvested = existing.invested_value + holding.invested_value;

      // Weighted average price
      const weightedAvgPrice = totalInvested / totalQuantity;

      // Use the latest current price (prefer LTP from any broker)
      const currentPrice = holding.current_price || existing.current_price;
      const currentValue = totalQuantity * currentPrice;
      const pnl = currentValue - totalInvested;
      const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

      holdingsByIsin.set(holding.isin, {
        ...existing,
        quantity: totalQuantity,
        average_price: weightedAvgPrice,
        current_price: currentPrice,
        invested_value: totalInvested,
        current_value: currentValue,
        pnl,
        pnl_percent: pnlPercent,
        brokers: [...new Set([...existing.brokers, ...holding.brokers])],
        // Keep day change from whichever has it
        day_change: holding.day_change ?? existing.day_change,
        day_change_percent: holding.day_change_percent ?? existing.day_change_percent,
      });
    } else {
      holdingsByIsin.set(holding.isin, { ...holding });
    }
  }

  return Array.from(holdingsByIsin.values());
}

/**
 * Fetch Groww holdings for current user
 */
async function fetchGrowwHoldingsForUser(): Promise<{
  success: true;
  holdings: UnifiedHolding[];
} | {
  success: false;
  error: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const connection = await db.query.brokerCredentials.findFirst({
      where: and(
        eq(brokerCredentials.userId, session.user.id),
        eq(brokerCredentials.broker, "groww")
      ),
    });

    if (!connection) {
      return { success: false, error: "Groww not connected" };
    }

    const { apiKey, apiSecret } = decryptCredentials(
      connection.encryptedApiKey,
      connection.encryptedApiSecret,
      connection.iv,
      connection.ivSecret
    );

    const accessToken = await getGrowwAccessToken(apiKey, apiSecret);
    const holdings = await fetchGrowwHoldings(accessToken);

    // Fetch live prices
    let prices: Record<string, number> = {};
    if (holdings.length > 0) {
      const symbols = holdings.map((h) => h.trading_symbol);
      try {
        prices = await getGrowwLTP(accessToken, symbols);
      } catch (ltpError) {
        console.warn("Failed to fetch Groww LTP:", ltpError);
      }
    }

    return {
      success: true,
      holdings: normalizeGrowwHoldings(holdings, prices),
    };
  } catch (error) {
    console.error("Error fetching Groww holdings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch Groww holdings",
    };
  }
}

/**
 * Fetch Zerodha holdings for current user
 */
async function fetchZerodhaHoldingsForUser(): Promise<{
  success: true;
  holdings: UnifiedHolding[];
} | {
  success: false;
  error: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const connection = await db.query.brokerCredentials.findFirst({
      where: and(
        eq(brokerCredentials.userId, session.user.id),
        eq(brokerCredentials.broker, "zerodha")
      ),
    });

    if (!connection) {
      return { success: false, error: "Zerodha not connected" };
    }

    // Check if access token exists and is not expired
    if (!connection.encryptedAccessToken || !connection.accessTokenIv) {
      return { success: false, error: "Zerodha requires re-authentication" };
    }

    if (isZerodhaTokenExpired(connection.accessTokenExpiry)) {
      return { success: false, error: "Zerodha session expired. Please re-authenticate." };
    }

    const { apiKey } = decryptCredentials(
      connection.encryptedApiKey,
      connection.encryptedApiSecret,
      connection.iv,
      connection.ivSecret
    );

    const accessToken = decryptAccessToken(
      connection.encryptedAccessToken,
      connection.accessTokenIv
    );

    const holdings = await fetchZerodhaHoldings(apiKey, accessToken);

    return {
      success: true,
      holdings: normalizeZerodhaHoldings(holdings),
    };
  } catch (error) {
    console.error("Error fetching Zerodha holdings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch Zerodha holdings",
    };
  }
}

import { getPortfolio } from "./wallet";

/**
 * Fetch Virtual Wallet holdings for current user
 */
async function fetchVirtualHoldingsForUser(): Promise<{
  success: true;
  holdings: UnifiedHolding[];
} | {
  success: false;
  error: string;
}> {
  try {
    const portfolio = await getPortfolio();
    if (!portfolio || portfolio.holdings.length === 0) {
      return { success: true, holdings: [] };
    }

    const holdings: UnifiedHolding[] = portfolio.holdings.map((h: any) => ({
      isin: h.symbol, // Use symbol as a placeholder ISIN for virtual holdings
      trading_symbol: h.symbol,
      quantity: h.shares,
      average_price: h.avgCost,
      current_price: h.currentPrice,
      invested_value: h.shares * h.avgCost,
      current_value: h.value,
      pnl: h.gain,
      pnl_percent: h.gainPercent,
      brokers: ["virtual"],
      exchange: "VIRTUAL",
      currency: h.currency || "USD",
      day_change: h.change * h.shares,
      day_change_percent: h.changePercent,
    }));

    return { success: true, holdings };
  } catch (error) {
    console.error("Error fetching Virtual Wallet holdings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch Virtual Wallet",
    };
  }
}

/**
 * Get merged holdings from all connected brokers + virtual wallet
 * Returns unified holdings with broker source information
 */
export async function getMergedHoldings(): Promise<MergedHoldingsResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Get all broker connections for the user
    const connections = await db.query.brokerCredentials.findMany({
      where: eq(brokerCredentials.userId, session.user.id),
    });

    const connectedBrokers = connections.map((c) => c.broker as BrokerType);
    const allHoldings: UnifiedHolding[] = [];
    const errors: { broker: BrokerType; error: string }[] = [];
    const successfulSources: BrokerType[] = [];

    // Fetch holdings from each connected broker + virtual wallet in parallel
    const fetchPromises: Promise<void>[] = [];

    // Always fetch virtual wallet
    fetchPromises.push(
      fetchVirtualHoldingsForUser().then((result) => {
        if (result.success) {
          if (result.holdings.length > 0) {
            allHoldings.push(...result.holdings);
            successfulSources.push("virtual");
          }
        } else {
          errors.push({ broker: "virtual", error: result.error });
        }
      })
    );

    if (connectedBrokers.includes("groww")) {
      fetchPromises.push(
        fetchGrowwHoldingsForUser().then((result) => {
          if (result.success) {
            allHoldings.push(...result.holdings);
            successfulSources.push("groww");
          } else {
            errors.push({ broker: "groww", error: result.error });
          }
        })
      );
    }

    if (connectedBrokers.includes("zerodha")) {
      fetchPromises.push(
        fetchZerodhaHoldingsForUser().then((result) => {
          if (result.success) {
            allHoldings.push(...result.holdings);
            successfulSources.push("zerodha");
          } else {
            errors.push({ broker: "zerodha", error: result.error });
          }
        })
      );
    }

    await Promise.all(fetchPromises);

    // If no holdings fetched from any broker and there are errors (ignoring virtual if it just has no holdings)
    if (allHoldings.length === 0 && errors.length > 0) {
      // All brokers failed
      const errorMessages = errors.map((e) => `${e.broker}: ${e.error}`).join("; ");
      return { success: false, error: errorMessages };
    }

    // Explicitly handle when user has NO connections AND NO virtual holdings
    if (allHoldings.length === 0 && connections.length === 0) {
      // Just return empty array, don't throw error to allow empty state to render
      return {
        success: true,
        holdings: [],
        sources: [],
      };
    }

    // Merge holdings by ISIN
    const mergedHoldings = mergeHoldings(allHoldings);

    return {
      success: true,
      holdings: mergedHoldings,
      sources: successfulSources,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error fetching merged holdings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch holdings",
    };
  }
}
