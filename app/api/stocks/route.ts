import { NextRequest, NextResponse } from "next/server";

const MARKET_DATA_API = process.env.MARKET_DATA_API_URL || "http://localhost:8000";

/**
 * GET /api/stocks?symbols=AAPL,MSFT,GOOGL,...
 * Fetches quotes for multiple symbols in parallel.
 */
export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get("symbols");

  if (!symbols) {
    return NextResponse.json({ error: "Missing 'symbols' query parameter" }, { status: 400 });
  }

  const symbolList = symbols.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

  try {
    const quotes = await Promise.allSettled(
      symbolList.map(async (symbol) => {
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
  } catch {
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 502 });
  }
}
