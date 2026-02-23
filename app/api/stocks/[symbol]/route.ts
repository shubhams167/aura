import { NextRequest, NextResponse } from "next/server";

const MARKET_DATA_API = process.env.AURA_PULSE_API_URL || "http://localhost:8000";

/**
 * GET /api/stocks/AAPL
 * Fetches a single stock quote.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const symbol = decodeURIComponent((await params).symbol);

  try {
    const res = await fetch(`${MARKET_DATA_API}/api/v1/quote/${symbol.toUpperCase()}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Symbol not found" }));
      return NextResponse.json(error, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 502 });
  }
}
