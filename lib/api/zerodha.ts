import crypto from "crypto";
import { UnifiedHolding } from "@/lib/types/holdings";

const KITE_API_BASE = "https://api.kite.trade";
const KITE_LOGIN_URL = "https://kite.zerodha.com/connect/login";

// Types for Zerodha Kite Connect API responses
export interface ZerodhaHolding {
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  isin: string;
  product: string;
  price: number;
  quantity: number;
  used_quantity: number;
  t1_quantity: number;
  realised_quantity: number;
  authorised_quantity: number;
  authorised_date: string;
  opening_quantity: number;
  short_quantity: number;
  collateral_quantity: number;
  collateral_type: string;
  discrepancy: boolean;
  average_price: number;
  last_price: number;
  close_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
}

export interface ZerodhaHoldingsResponse {
  status: "success" | "error";
  data?: ZerodhaHolding[];
  message?: string;
  error_type?: string;
}

export interface ZerodhaTokenResponse {
  status: "success" | "error";
  data?: {
    user_type: string;
    email: string;
    user_name: string;
    user_shortname: string;
    broker: string;
    exchanges: string[];
    products: string[];
    order_types: string[];
    avatar_url: string;
    user_id: string;
    api_key: string;
    access_token: string;
    public_token: string;
    enctoken: string;
    refresh_token: string;
    login_time: string;
  };
  message?: string;
  error_type?: string;
}

/**
 * Generate the Kite Connect login URL for OAuth
 * @param apiKey - Zerodha Kite Connect API key
 * @param redirectParams - Optional URL-encoded query params to pass back
 */
export function getZerodhaLoginUrl(apiKey: string, redirectParams?: string): string {
  let url = `${KITE_LOGIN_URL}?v=3&api_key=${apiKey}`;
  if (redirectParams) {
    url += `&redirect_params=${encodeURIComponent(redirectParams)}`;
  }
  return url;
}

/**
 * Generate SHA256 checksum for Zerodha token exchange
 * checksum = SHA256(api_key + request_token + api_secret)
 */
export function generateZerodhaChecksum(
  apiKey: string,
  requestToken: string,
  apiSecret: string
): string {
  const data = `${apiKey}${requestToken}${apiSecret}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Exchange request_token for access_token after OAuth callback
 */
export async function exchangeZerodhaToken(
  apiKey: string,
  requestToken: string,
  apiSecret: string
): Promise<{ accessToken: string; userId: string; loginTime: string }> {
  const checksum = generateZerodhaChecksum(apiKey, requestToken, apiSecret);

  const response = await fetch(`${KITE_API_BASE}/session/token`, {
    method: "POST",
    headers: {
      "X-Kite-Version": "3",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      api_key: apiKey,
      request_token: requestToken,
      checksum,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange Zerodha token: ${errorText}`);
  }

  const data = (await response.json()) as ZerodhaTokenResponse;

  if (data.status === "error" || !data.data) {
    throw new Error(data.message || "Failed to exchange token");
  }

  return {
    accessToken: data.data.access_token,
    userId: data.data.user_id,
    loginTime: data.data.login_time,
  };
}

/**
 * Fetch user holdings from Zerodha Kite Connect API
 * @param apiKey - Zerodha API key
 * @param accessToken - Access token obtained from OAuth flow
 */
export async function getZerodhaHoldings(
  apiKey: string,
  accessToken: string
): Promise<ZerodhaHolding[]> {
  const response = await fetch(`${KITE_API_BASE}/portfolio/holdings`, {
    method: "GET",
    headers: {
      "X-Kite-Version": "3",
      Authorization: `token ${apiKey}:${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Zerodha holdings: ${errorText}`);
  }

  const data = (await response.json()) as ZerodhaHoldingsResponse;

  if (data.status === "error") {
    throw new Error(data.message || "Failed to fetch holdings");
  }

  return data.data || [];
}

/**
 * Convert Zerodha holdings to unified format
 */
export function normalizeZerodhaHoldings(
  holdings: ZerodhaHolding[]
): UnifiedHolding[] {
  return holdings.map((holding) => {
    const investedValue = holding.quantity * holding.average_price;
    const currentValue = holding.quantity * holding.last_price;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return {
      isin: holding.isin,
      trading_symbol: holding.tradingsymbol,
      quantity: holding.quantity,
      average_price: holding.average_price,
      current_price: holding.last_price,
      invested_value: investedValue,
      current_value: currentValue,
      pnl,
      pnl_percent: pnlPercent,
      brokers: ["zerodha"],
      exchange: holding.exchange,
      day_change: holding.day_change,
      day_change_percent: holding.day_change_percentage,
    };
  });
}

/**
 * Check if access token has likely expired
 * Zerodha tokens expire at 6 AM IST daily
 */
export function isZerodhaTokenExpired(tokenExpiry: Date | null): boolean {
  if (!tokenExpiry) return true;
  return new Date() > tokenExpiry;
}

/**
 * Calculate next token expiry time (6 AM IST next day)
 */
export function getZerodhaTokenExpiry(): Date {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);

  // Set to 6 AM IST
  const expiry = new Date(nowIST);
  expiry.setHours(6, 0, 0, 0);

  // If it's already past 6 AM, set to next day 6 AM
  if (nowIST.getHours() >= 6) {
    expiry.setDate(expiry.getDate() + 1);
  }

  // Convert back to UTC
  return new Date(expiry.getTime() - istOffset);
}
