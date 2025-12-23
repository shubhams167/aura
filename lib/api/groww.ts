import crypto from "crypto";

const GROWW_API_BASE = "https://api.groww.in";

// Types for Groww API responses
export interface GrowwHolding {
  isin: string;
  trading_symbol: string;
  quantity: number;
  average_price: number;
  pledge_quantity: number;
  demat_locked_quantity: number;
  groww_locked_quantity: number;
  repledge_quantity: number;
  t1_quantity: number;
  demat_free_quantity: number;
  corporate_action_additional_quantity: number;
  active_demat_transfer_quantity: number;
}

export interface GrowwHoldingsResponse {
  status: "SUCCESS" | "FAILURE";
  payload?: {
    holdings: GrowwHolding[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface GrowwTokenResponse {
  token: string;
  tokenRefId: string;
  sessionName: string;
  expiry: string;
  isActive: boolean;
}

/**
 * Generate SHA256 checksum for Groww API authentication
 * checksum = SHA256(apiSecret + timestamp)
 */
export function generateChecksum(apiSecret: string, timestamp: number): string {
  const data = `${apiSecret}${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Get access token from Groww API using API key and secret
 */
export async function getGrowwAccessToken(
  apiKey: string,
  apiSecret: string
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const checksum = generateChecksum(apiSecret, timestamp);

  const response = await fetch(`${GROWW_API_BASE}/v1/token/api/access`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      key_type: "approval",
      checksum,
      timestamp: timestamp.toString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Groww access token: ${errorText}`);
  }

  const data = (await response.json()) as GrowwTokenResponse;
  return data.token;
}

/**
 * Fetch user holdings from Groww API
 */
export async function getGrowwHoldings(
  accessToken: string
): Promise<GrowwHolding[]> {
  const response = await fetch(`${GROWW_API_BASE}/v1/holdings/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "X-API-VERSION": "1.0",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Groww holdings: ${errorText}`);
  }

  const data = (await response.json()) as GrowwHoldingsResponse;

  if (data.status === "FAILURE") {
    throw new Error(data.error?.message || "Failed to fetch holdings");
  }

  return data.payload?.holdings || [];
}

// Types for Groww Positions API
export interface GrowwPosition {
  trading_symbol: string;
  credit_quantity: number;
  credit_price: number;
  debit_quantity: number;
  debit_price: number;
  carry_forward_credit_quantity: number;
  carry_forward_credit_price: number;
  carry_forward_debit_quantity: number;
  carry_forward_debit_price: number;
  exchange: string;
  symbol_isin: string;
  quantity: number;
  product: string;
  net_carry_forward_quantity: number;
  net_price: number;
  net_carry_forward_price: number;
  realised_pnl: number;
}

export interface GrowwPositionsResponse {
  status: "SUCCESS" | "FAILURE";
  payload?: {
    positions: GrowwPosition[];
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetch user positions from Groww API
 */
export async function getGrowwPositions(
  accessToken: string,
  segment: "CASH" | "FNO" | "COMMODITY" = "CASH"
): Promise<GrowwPosition[]> {
  const response = await fetch(
    `${GROWW_API_BASE}/v1/positions/user?segment=${segment}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "X-API-VERSION": "1.0",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Groww positions: ${errorText}`);
  }

  const data = (await response.json()) as GrowwPositionsResponse;

  if (data.status === "FAILURE") {
    throw new Error(data.error?.message || "Failed to fetch positions");
  }

  return data.payload?.positions || [];
}

// Types for LTP API
export interface GrowwLTPResponse {
  status: "SUCCESS" | "FAILURE";
  payload?: Record<string, number>; // e.g., { "NSE_RELIANCE": 2334.2 }
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetch Last Traded Price (LTP) for multiple symbols
 * @param accessToken - Groww access token
 * @param symbols - Array of trading symbols (e.g., ["RELIANCE", "TCS"])
 * @param exchange - Exchange prefix (NSE or BSE)
 */
export async function getGrowwLTP(
  accessToken: string,
  symbols: string[],
  exchange: "NSE" | "BSE" = "NSE"
): Promise<Record<string, number>> {
  // Format symbols with exchange prefix: NSE_RELIANCE, NSE_TCS
  const exchangeSymbols = encodeURIComponent(symbols.map((s) => `${exchange}_${s}`).join(","));

  const response = await fetch(
    `${GROWW_API_BASE}/v1/live-data/ltp?segment=CASH&exchange_symbols=${exchangeSymbols}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "X-API-VERSION": "1.0",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch LTP: ${errorText}`);
  }

  const data = (await response.json()) as GrowwLTPResponse;

  if (data.status === "FAILURE") {
    throw new Error(data.error?.message || "Failed to fetch LTP");
  }

  // Convert response keys back to plain symbols
  const prices: Record<string, number> = {};
  if (data.payload) {
    for (const [key, value] of Object.entries(data.payload)) {
      // Remove exchange prefix: NSE_RELIANCE -> RELIANCE
      const symbol = key.replace(`${exchange}_`, "");
      prices[symbol] = value;
    }
  }

  return prices;
}

// Extended holding with live price data
export interface EnrichedHolding extends GrowwHolding {
  current_price: number;
  current_value: number;
  invested_value: number;
  pnl: number;
  pnl_percent: number;
}

/**
 * Enrich holdings with live price data
 */
export function enrichHoldings(
  holdings: GrowwHolding[],
  prices: Record<string, number>
): EnrichedHolding[] {
  return holdings.map((holding) => {
    const currentPrice = prices[holding.trading_symbol] || holding.average_price;
    const investedValue = holding.quantity * holding.average_price;
    const currentValue = holding.quantity * currentPrice;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return {
      ...holding,
      current_price: currentPrice,
      current_value: currentValue,
      invested_value: investedValue,
      pnl,
      pnl_percent: pnlPercent,
    };
  });
}

