"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brokerCredentials } from "@/lib/db/schema";
import { encryptCredentials, decryptCredentials } from "@/lib/crypto";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
