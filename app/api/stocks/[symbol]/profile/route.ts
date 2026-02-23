import { NextRequest, NextResponse } from "next/server";

const MARKET_DATA_API = process.env.AURA_PULSE_API_URL || "http://localhost:8000";

/**
 * GET /api/stocks/AAPL/profile
 * Proxies to the market-data profile endpoint.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const symbol = decodeURIComponent((await params).symbol);

  try {
    const res = await fetch(`${MARKET_DATA_API}/api/v1/profile/${symbol.toUpperCase()}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Failed to fetch profile" }));
      return NextResponse.json(error, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 502 });
  }
}
