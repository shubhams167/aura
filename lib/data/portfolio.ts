// Mock portfolio data for demonstration

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  value: number;
  gain: number;
  gainPercent: number;
  color: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface HistoricalData {
  date: string;
  value: number;
}

export const holdings: Holding[] = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 50,
    avgCost: 145.0,
    currentPrice: 189.95,
    change: 2.35,
    changePercent: 1.25,
    value: 9497.5,
    gain: 2247.5,
    gainPercent: 31.0,
    color: "#10B981",
  },
  {
    id: "2",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 30,
    avgCost: 280.0,
    currentPrice: 374.58,
    change: -1.42,
    changePercent: -0.38,
    value: 11237.4,
    gain: 2837.4,
    gainPercent: 33.77,
    color: "#3B82F6",
  },
  {
    id: "3",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 25,
    avgCost: 105.0,
    currentPrice: 140.23,
    change: 1.87,
    changePercent: 1.35,
    value: 3505.75,
    gain: 880.75,
    gainPercent: 33.55,
    color: "#F59E0B",
  },
  {
    id: "4",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    shares: 40,
    avgCost: 125.0,
    currentPrice: 153.42,
    change: 0.98,
    changePercent: 0.64,
    value: 6136.8,
    gain: 1136.8,
    gainPercent: 22.74,
    color: "#8B5CF6",
  },
  {
    id: "5",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    shares: 20,
    avgCost: 415.0,
    currentPrice: 495.22,
    change: 8.45,
    changePercent: 1.73,
    value: 9904.4,
    gain: 1604.4,
    gainPercent: 19.33,
    color: "#EC4899",
  },
  {
    id: "6",
    symbol: "TSLA",
    name: "Tesla Inc.",
    shares: 15,
    avgCost: 200.0,
    currentPrice: 252.08,
    change: -3.12,
    changePercent: -1.22,
    value: 3781.2,
    gain: 781.2,
    gainPercent: 26.04,
    color: "#EF4444",
  },
];

export const portfolioSummary: PortfolioSummary = {
  totalValue: holdings.reduce((sum, h) => sum + h.value, 0),
  totalGain: holdings.reduce((sum, h) => sum + h.gain, 0),
  totalGainPercent: 28.42,
  dayChange: 287.65,
  dayChangePercent: 0.65,
};

export const historicalData: HistoricalData[] = [
  { date: "Jan", value: 32000 },
  { date: "Feb", value: 34500 },
  { date: "Mar", value: 33200 },
  { date: "Apr", value: 36800 },
  { date: "May", value: 35400 },
  { date: "Jun", value: 38200 },
  { date: "Jul", value: 39800 },
  { date: "Aug", value: 37500 },
  { date: "Sep", value: 40200 },
  { date: "Oct", value: 42100 },
  { date: "Nov", value: 41500 },
  { date: "Dec", value: 44063 },
];

export const allocationData = holdings.map((h) => ({
  name: h.symbol,
  value: h.value,
  color: h.color,
}));
