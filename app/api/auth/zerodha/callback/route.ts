import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brokerCredentials } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { exchangeZerodhaToken, getZerodhaTokenExpiry } from "@/lib/api/zerodha";
import { decryptCredentials, encryptAccessToken } from "@/lib/crypto";

/**
 * Handles Zerodha OAuth callback
 * Exchanges request_token for access_token and stores it
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const requestToken = searchParams.get("request_token");
    const status = searchParams.get("status");

    // Check for login failure
    if (status === "cancelled" || !requestToken) {
      return NextResponse.redirect(
        new URL("/?error=zerodha_login_cancelled", request.url)
      );
    }

    // Get user's stored API credentials
    const connection = await db.query.brokerCredentials.findFirst({
      where: and(
        eq(brokerCredentials.userId, session.user.id),
        eq(brokerCredentials.broker, "zerodha")
      ),
    });

    if (!connection) {
      return NextResponse.redirect(
        new URL("/?error=zerodha_not_configured", request.url)
      );
    }

    // Decrypt API credentials
    const { apiKey, apiSecret } = decryptCredentials(
      connection.encryptedApiKey,
      connection.encryptedApiSecret,
      connection.iv,
      connection.ivSecret
    );

    // Exchange request_token for access_token
    const { accessToken } = await exchangeZerodhaToken(
      apiKey,
      requestToken,
      apiSecret
    );

    // Encrypt and store access token
    const { encryptedAccessToken, accessTokenIv } = encryptAccessToken(accessToken);
    const tokenExpiry = getZerodhaTokenExpiry();

    await db
      .update(brokerCredentials)
      .set({
        encryptedAccessToken,
        accessTokenIv,
        accessTokenExpiry: tokenExpiry,
      })
      .where(eq(brokerCredentials.id, connection.id));

    // Redirect to portfolio page on success
    return NextResponse.redirect(
      new URL("/portfolio?zerodha=connected", request.url)
    );
  } catch (error) {
    console.error("Error completing Zerodha auth:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(
      new URL(`/?error=zerodha_auth_failed&message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
