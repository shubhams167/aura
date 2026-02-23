import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { watchlists, watchlistItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; symbol: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const symbol = decodeURIComponent((await params).symbol);

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

    const [deleted] = await db
      .delete(watchlistItems)
      .where(
        and(
          eq(watchlistItems.watchlistId, id),
          eq(watchlistItems.symbol, symbol)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Item not found in watchlist" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing watchlist item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
