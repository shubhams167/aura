import { db } from "./lib/db";
import { wallets, walletHoldings } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const allHoldings = await db.select().from(walletHoldings);
  console.log("All Holdings in DB:", allHoldings);
}

run().catch(console.error);
