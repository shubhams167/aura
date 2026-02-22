import { BrokerType } from "@/lib/actions/broker";

/**
 * Unified holding interface that normalizes data from different brokers.
 * This allows displaying merged holdings from multiple brokers in a consistent format.
 */
export interface UnifiedHolding {
  /** ISIN code - unique identifier for the security across exchanges */
  isin: string;
  /** Trading symbol (e.g., RELIANCE, TCS) */
  trading_symbol: string;
  /** Total quantity held */
  quantity: number;
  /** Average purchase price */
  average_price: number;
  /** Current market price (LTP) */
  current_price: number;
  /** Total invested value (quantity * average_price) */
  invested_value: number;
  /** Current market value (quantity * current_price) */
  current_value: number;
  /** Profit/Loss in absolute terms */
  pnl: number;
  /** Profit/Loss as percentage */
  pnl_percent: number;
  /** Source broker(s) - single broker or multiple if merged */
  brokers: BrokerType[];
  /** Exchange (NSE/BSE) - may vary by broker */
  exchange?: string;
  /** Day's change in price */
  day_change?: number;
  /** Day's change as percentage */
  day_change_percent?: number;
}

/**
 * Result of merged holdings fetch operation
 */
export interface MergedHoldingsResult {
  success: true;
  holdings: UnifiedHolding[];
  /** Which brokers contributed to the data */
  sources: BrokerType[];
  /** Any errors from individual brokers (partial success) */
  errors?: { broker: BrokerType; error: string }[];
}

export interface MergedHoldingsError {
  success: false;
  error: string;
}

export type MergedHoldingsResponse = MergedHoldingsResult | MergedHoldingsError;
