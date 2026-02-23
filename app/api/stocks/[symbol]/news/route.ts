import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const symbol = decodeURIComponent((await params).symbol);
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";

    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(
      `${backendUrl}/api/v1/news/${symbol}?limit=${limit}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch news data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in news API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
