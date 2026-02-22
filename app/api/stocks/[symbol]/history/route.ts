import { NextRequest, NextResponse } from "next/server";

const MARKET_DATA_API = process.env.AURA_PULSE_API_URL || "http://localhost:8000";

/**
 * GET /api/stocks/AAPL/history?period=1mo&interval=1d
 * Proxies to the market-data history endpoint.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const period = request.nextUrl.searchParams.get("period") || "1mo";
  const interval = request.nextUrl.searchParams.get("interval") || "1d";

  try {
    const res = await fetch(
      `${MARKET_DATA_API}/api/v1/history/${symbol.toUpperCase()}?period=${period}&interval=${interval}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Failed to fetch history" }));
      return NextResponse.json(error, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 502 });
  }
}
