import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { watchlists, watchlistItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { symbol } = await request.json();

    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    // Verify watchlist ownership
    const list = await db.query.watchlists.findFirst({
      where: and(
        eq(watchlists.id, id),
        eq(watchlists.userId, session.user.id)
      ),
    });

    if (!list) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    // Check if it already exists
    const existing = await db.query.watchlistItems.findFirst({
      where: and(
        eq(watchlistItems.watchlistId, id),
        eq(watchlistItems.symbol, symbol)
      )
    });

    if (existing) {
      return NextResponse.json({ error: "Symbol already in watchlist" }, { status: 400 });
    }

    // Get current items to determine sortOrder (append to end)
    // We'll use LexoRank-like logic. For simplicity, we just use a numeric string padded.
    const currentItems = await db.query.watchlistItems.findMany({
      where: eq(watchlistItems.watchlistId, id),
    });

    const newOrder = String(currentItems.length * 1024).padStart(10, "0");

    const [newItem] = await db
      .insert(watchlistItems)
      .values({
        watchlistId: id,
        symbol,
        sortOrder: newOrder,
      })
      .returning();

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error adding watchlist item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
