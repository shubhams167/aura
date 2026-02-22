import { NextRequest, NextResponse } from "next/server";

const MARKET_DATA_API = process.env.AURA_PULSE_API_URL || "http://localhost:8000";

/**
 * GET /api/stocks/trending
 * Proxies to aura-pulse for trending tickers and fetches their quotes.
 */
export async function GET() {
  try {
    // 1. Fetch trending tickers
    const trendingRes = await fetch(`${MARKET_DATA_API}/api/v1/trending`, {
      next: { revalidate: 300 }, // Cache trending list for 5 mins
    });

    if (!trendingRes.ok) {
      return NextResponse.json({ error: "Failed to fetch trending tickers" }, { status: 502 });
    }

    const trendingData = await trendingRes.json();
    if (!Array.isArray(trendingData) || trendingData.length === 0) {
      return NextResponse.json([]);
    }

    const symbols = trendingData.map((s: { symbol: string }) => s.symbol).slice(0, 10);

    // 2. Fetch quotes for these symbols in parallel
    const quotes = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const res = await fetch(`${MARKET_DATA_API}/api/v1/quote/${symbol}`, {
          next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return res.json();
      })
    );

    const results = quotes
      .map((q) => (q.status === "fulfilled" ? q.value : null))
      .filter(Boolean);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in trending endpoint:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
