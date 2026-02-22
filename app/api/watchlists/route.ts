import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { watchlists, watchlistItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWatchlists = await db.query.watchlists.findMany({
      where: eq(watchlists.userId, session.user.id),
      with: {
        // Unfortunately standard Drizzle relations required configuring `relations` in schema.
        // Let's implement this manually if relations aren't setup:
      },
    });

    // Fetch items for each watchlist manually if relations block isn't in schema
    const watchlistsWithItems = await Promise.all(
      userWatchlists.map(async (list) => {
        const items = await db.query.watchlistItems.findMany({
          where: eq(watchlistItems.watchlistId, list.id),
        });

        // Sort items by lexicographical sortOrder
        items.sort((a, b) => a.sortOrder.localeCompare(b.sortOrder));

        return { ...list, items };
      })
    );

    return NextResponse.json(watchlistsWithItems);
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const [newWatchlist] = await db
      .insert(watchlists)
      .values({
        userId: session.user.id,
        name,
      })
      .returning();

    return NextResponse.json(newWatchlist);
  } catch (error) {
    console.error("Error creating watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
