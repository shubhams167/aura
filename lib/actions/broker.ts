"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brokerCredentials } from "@/lib/db/schema";
import { encryptCredentials, decryptCredentials } from "@/lib/crypto";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  getGrowwAccessToken,
  getGrowwHoldings as fetchGrowwHoldings,
  getGrowwPositions as fetchGrowwPositions,
  getGrowwLTP,
  enrichHoldings,
  EnrichedHolding
} from "@/lib/api/groww";

export type BrokerType = "groww" | "upstox" | "zerodha";

export interface ConnectBrokerResult {
  success: boolean;
  error?: string;
}

export interface BrokerConnection {
  broker: BrokerType;
  connected: boolean;
  connectedAt?: Date;
}

/**
 * Connect a broker account by storing encrypted credentials
 */
export async function connectBroker(
  broker: BrokerType,
  apiKey: string,
  apiSecret: string
): Promise<ConnectBrokerResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;

    // Encrypt credentials
    const encrypted = encryptCredentials(apiKey, apiSecret);

    // Check if connection already exists
    const existing = await db.query.brokerCredentials.findFirst({
      where: and(
        eq(brokerCredentials.userId, userId),
        eq(brokerCredentials.broker, broker)
      ),
    });

    if (existing) {
      // Update existing connection
      await db
        .update(brokerCredentials)
        .set({
          encryptedApiKey: encrypted.encryptedApiKey,
          encryptedApiSecret: encrypted.encryptedApiSecret,
          iv: encrypted.iv,
          ivSecret: encrypted.ivSecret,
        })
        .where(eq(brokerCredentials.id, existing.id));
    } else {
      // Create new connection
      await db.insert(brokerCredentials).values({
        userId,
        broker,
        encryptedApiKey: encrypted.encryptedApiKey,
        encryptedApiSecret: encrypted.encryptedApiSecret,
        iv: encrypted.iv,
        ivSecret: encrypted.ivSecret,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error connecting broker:", error);
    return { success: false, error: "Failed to connect broker" };
  }
}

/**
 * Get all broker connections for the current user
 */
export async function getBrokerConnections(): Promise<BrokerConnection[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const connections = await db.query.brokerCredentials.findMany({
      where: eq(brokerCredentials.userId, session.user.id),
    });

    const brokers: BrokerType[] = ["groww", "upstox", "zerodha"];

    return brokers.map((broker) => {
      const connection = connections.find((c) => c.broker === broker);
      return {
        broker,
        connected: !!connection,
        connectedAt: connection?.createdAt,
      };
    });
  } catch (error) {
    console.error("Error getting broker connections:", error);
    return [];
  }
}

/**
 * Disconnect a broker account
 */
export async function disconnectBroker(
  broker: BrokerType
): Promise<ConnectBrokerResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    await db
      .delete(brokerCredentials)
      .where(
        and(
          eq(brokerCredentials.userId, session.user.id),
          eq(brokerCredentials.broker, broker)
        )
      );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error disconnecting broker:", error);
    return { success: false, error: "Failed to disconnect broker" };
  }
}

/**
 * Get decrypted credentials for a broker (for internal use only)
 */
export async function getBrokerCredentials(
  broker: BrokerType
): Promise<{ apiKey: string; apiSecret: string } | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const connection = await db.query.brokerCredentials.findFirst({
      where: and(
        eq(brokerCredentials.userId, session.user.id),
        eq(brokerCredentials.broker, broker)
      ),
    });

    if (!connection) {
      return null;
    }

    return decryptCredentials(
      connection.encryptedApiKey,
      connection.encryptedApiSecret,
      connection.iv,
      connection.ivSecret
    );
  } catch (error) {
    console.error("Error getting broker credentials:", error);
    return null;
  }
}

/**
 * Fetch Groww holdings with live prices using user's stored credentials
 */
export async function getGrowwHoldings(): Promise<{
  success: true;
  holdings: EnrichedHolding[];
} | {
  success: false;
  error: string;
}> {
  try {
    const userCreds = await getBrokerCredentials("groww");

    if (!userCreds) {
      return { success: false, error: "Groww account not connected. Please connect your Groww account first." };
    }

    const accessToken = await getGrowwAccessToken(userCreds.apiKey, userCreds.apiSecret);
    const holdings = await fetchGrowwHoldings(accessToken);

    // Fetch live prices for all holdings
    let prices: Record<string, number> = {};
    if (holdings.length > 0) {
      const symbols = holdings.map((h) => h.trading_symbol);
      try {
        prices = await getGrowwLTP(accessToken, symbols);
      } catch (ltpError) {
        console.warn("Failed to fetch LTP, using average prices:", ltpError);
      }
    }

    // Enrich holdings with live prices and P&L
    const enrichedHoldings = enrichHoldings(holdings, prices);

    return { success: true, holdings: enrichedHoldings };
  } catch (error) {
    console.error("Error fetching Groww holdings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch holdings",
    };
  }
}

/**
 * Fetch Groww positions using user's stored credentials from database
 */
export async function getGrowwPortfolioPositions(segment: "CASH" | "FNO" | "COMMODITY" = "CASH") {
  try {
    const userCreds = await getBrokerCredentials("groww");

    if (!userCreds) {
      return { success: false as const, error: "Groww account not connected. Please connect your Groww account first." };
    }

    const accessToken = await getGrowwAccessToken(userCreds.apiKey, userCreds.apiSecret);
    const positions = await fetchGrowwPositions(accessToken, segment);

    return { success: true as const, positions };
  } catch (error) {
    console.error("Error fetching Groww positions:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch positions",
    };
  }
}
