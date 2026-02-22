import { NextRequest, NextResponse } from "next/server";

const MARKET_DATA_API = process.env.MARKET_DATA_API_URL || "http://localhost:8000";

/**
 * GET /api/stocks/search?q=apple&max_results=8
 * Proxies to the market-data search endpoint.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const maxResults = request.nextUrl.searchParams.get("max_results") || "8";

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${MARKET_DATA_API}/api/v1/search?q=${encodeURIComponent(q)}&max_results=${maxResults}`
    );

    if (!res.ok) {
      return NextResponse.json([], { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
