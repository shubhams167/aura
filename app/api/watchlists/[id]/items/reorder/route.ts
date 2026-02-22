import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { watchlists, watchlistItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { items } = await request.json(); // { id: string, sortOrder: string }[]

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
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

    // Perform bulk updates in a transaction for items
    await db.transaction(async (tx) => {
      for (const item of items) {
        if (!item.id || !item.sortOrder) continue;

        await tx.update(watchlistItems)
          .set({ sortOrder: item.sortOrder })
          .where(and(
            eq(watchlistItems.id, item.id),
            eq(watchlistItems.watchlistId, id)
          ));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering watchlist items:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
