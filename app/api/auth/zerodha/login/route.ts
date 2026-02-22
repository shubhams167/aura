import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getZerodhaLoginUrl } from "@/lib/api/zerodha";
import { db } from "@/lib/db";
import { brokerCredentials } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Initiates Zerodha OAuth login flow
 * Redirects user to Zerodha login page
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Get user's stored API key for Zerodha
    const connection = await db.query.brokerCredentials.findFirst({
      where: and(
        eq(brokerCredentials.userId, session.user.id),
        eq(brokerCredentials.broker, "zerodha")
      ),
    });

    if (!connection) {
      // User hasn't set up Zerodha credentials yet
      return NextResponse.redirect(
        new URL("/?error=zerodha_not_configured", request.url)
      );
    }

    // Decrypt API key (not the secret - we need the key for the login URL)
    const { decryptCredentials } = await import("@/lib/crypto");
    const { apiKey } = decryptCredentials(
      connection.encryptedApiKey,
      connection.encryptedApiSecret,
      connection.iv,
      connection.ivSecret
    );

    // Generate Zerodha login URL with user ID to track the session
    const loginUrl = getZerodhaLoginUrl(apiKey);

    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("Error initiating Zerodha login:", error);
    return NextResponse.redirect(
      new URL("/?error=zerodha_login_failed", request.url)
    );
  }
}
