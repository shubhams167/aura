// Mock AI recommendations data

export interface AIRecommendation {
  id: string;
  type: "buy" | "sell" | "hold" | "rebalance";
  priority: "high" | "medium" | "low";
  symbol?: string;
  title: string;
  description: string;
  reasoning: string;
  potentialImpact: string;
  confidence: number;
}

export interface RiskMetric {
  name: string;
  value: number;
  status: "low" | "moderate" | "high";
  description: string;
}

export interface TaxHarvestOpportunity {
  id: string;
  symbol: string;
  name: string;
  currentLoss: number;
  potentialTaxSavings: number;
  recommendation: string;
  alternativeSymbol?: string;
}

export interface PortfolioInsight {
  id: string;
  category: "diversification" | "performance" | "risk" | "opportunity";
  title: string;
  insight: string;
  actionable: boolean;
  icon: string;
}

export const aiRecommendations: AIRecommendation[] = [
  {
    id: "1",
    type: "rebalance",
    priority: "high",
    title: "Rebalance Technology Sector",
    description:
      "Your technology allocation is 15% above target. Consider rebalancing to reduce concentration risk.",
    reasoning:
      "Tech stocks represent 65% of your portfolio, exceeding the recommended 50% for your risk profile.",
    potentialImpact: "Reduce portfolio volatility by ~12%",
    confidence: 0.89,
  },
  {
    id: "2",
    type: "buy",
    priority: "medium",
    symbol: "VTI",
    title: "Add Broad Market Exposure",
    description:
      "Consider adding a total market ETF to improve diversification across sectors.",
    reasoning:
      "Your portfolio lacks exposure to healthcare, utilities, and consumer staples sectors.",
    potentialImpact: "Improve Sharpe ratio by ~0.15",
    confidence: 0.76,
  },
  {
    id: "3",
    type: "sell",
    priority: "low",
    symbol: "TSLA",
    title: "Trim Volatile Position",
    description:
      "TSLA has high volatility relative to your risk tolerance. Consider reducing position size.",
    reasoning:
      "Position contributes 35% of portfolio volatility while only 8.5% of value.",
    potentialImpact: "Reduce max drawdown risk by ~8%",
    confidence: 0.68,
  },
];

export const riskMetrics: RiskMetric[] = [
  {
    name: "Portfolio Beta",
    value: 1.28,
    status: "moderate",
    description: "Your portfolio moves 28% more than the market on average.",
  },
  {
    name: "Value at Risk (95%)",
    value: 4.2,
    status: "moderate",
    description: "5% chance of losing more than 4.2% in a single day.",
  },
  {
    name: "Sharpe Ratio",
    value: 1.45,
    status: "low",
    description:
      "Good risk-adjusted returns. Above 1.0 is generally considered positive.",
  },
  {
    name: "Concentration Risk",
    value: 68,
    status: "high",
    description: "Top 3 holdings represent 68% of portfolio value.",
  },
];

export const taxHarvestOpportunities: TaxHarvestOpportunity[] = [
  {
    id: "1",
    symbol: "TSLA",
    name: "Tesla Inc.",
    currentLoss: 0, // No loss currently
    potentialTaxSavings: 0,
    recommendation: "No tax loss harvesting opportunity. Position is in profit.",
  },
  {
    id: "2",
    symbol: "META",
    name: "Meta Platforms (Hypothetical)",
    currentLoss: 2340,
    potentialTaxSavings: 702,
    recommendation:
      "Consider selling to realize loss and buying similar social media ETF after 30 days.",
    alternativeSymbol: "SOCL",
  },
  {
    id: "3",
    symbol: "DIS",
    name: "Walt Disney Co. (Hypothetical)",
    currentLoss: 1850,
    potentialTaxSavings: 555,
    recommendation:
      "Harvest loss and consider VCR (Consumer Discretionary ETF) as a replacement.",
    alternativeSymbol: "VCR",
  },
];

export const portfolioInsights: PortfolioInsight[] = [
  {
    id: "1",
    category: "diversification",
    title: "Sector Imbalance Detected",
    insight:
      "Technology represents 65% of your holdings. Consider adding healthcare or consumer staples for better diversification.",
    actionable: true,
    icon: "🎯",
  },
  {
    id: "2",
    category: "performance",
    title: "Outperforming S&P 500",
    insight:
      "Your portfolio has returned 28.4% YTD, beating the S&P 500 by 6.2 percentage points.",
    actionable: false,
    icon: "📈",
  },
  {
    id: "3",
    category: "risk",
    title: "High Correlation Alert",
    insight:
      "AAPL, MSFT, and GOOGL have 0.85+ correlation. Market downturns may impact all three simultaneously.",
    actionable: true,
    icon: "⚠️",
  },
  {
    id: "4",
    category: "opportunity",
    title: "Dividend Growth Potential",
    insight:
      "Adding dividend aristocrats could provide 2-3% annual income while maintaining growth exposure.",
    actionable: true,
    icon: "💰",
  },
];

export const overallRiskScore = {
  score: 72,
  label: "Moderate-High",
  color: "#F59E0B",
  description:
    "Your portfolio has above-average risk due to tech concentration and high-beta positions.",
};
