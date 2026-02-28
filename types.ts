
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'vip';
  joinedDate: string;
  freeUsageCount?: number;
  vipExpiry?: string;
  balance?: number;
  assets?: { [symbol: string]: number };
}

export interface TradingBot {
  id: string;
  name: string;
  description: string;
  strategy: string;
  market: 'Spot' | 'Futures';
  exchange: 'Binance';
  status: 'active' | 'inactive' | 'paused';
  performance: {
    roi: number;
    winRate: number;
    totalTrades: number;
    profit: number;
    history: { date: string; roi: number; winRate: number }[];
  };
  config: {
    pair: string;
    leverage?: number;
    amount: number;
  };
  advancedConfig?: {
    gridSize?: number;
    stopLoss?: number;
    takeProfit?: number;
    dcaStep?: number;
    marketType: 'Full' | 'Specific';
    investmentAmount: number;
  };
}

export interface IndicatorConfig {
  period?: number;
  stdDev?: number;
  source?: 'close' | 'open' | 'high' | 'low';
  signalPeriod?: number;
  fastPeriod?: number;
  slowPeriod?: number;
}

export interface IndicatorSettings {
  [key: string]: IndicatorConfig;
}

export interface CryptoTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  timeframe: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  winRate: string;
  profitFactor: string;
  maxDrawdown: string;
  avgDuration: string;
  complexity: 'Beginner' | 'Intermediate' | 'Professional';
  indicatorLogic: string;
  bestMarketCondition: string;
}

export interface Alert {
  id: string;
  symbol: string;
  type: 'Price' | 'RSI' | 'MACD' | 'Pattern' | 'Change';
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
}

export interface TechnicalIndicator {
  name: string;
  value: string;
  status: 'bullish' | 'bearish' | 'neutral';
}

export interface IndicatorHistory {
  name: string;
  values: number[];
  winRate?: number;
  accuracy?: number;
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface SmartWallet {
  address: string;
  label: string;
  balance: string;
  pnlTotal: string;
  winRate: string;
  lastActivity: string;
  recentTrades: WalletActivity[];
  riskProfile: 'Conservative' | 'Aggressive' | 'Degen';
}

export interface WalletActivity {
  type: 'Buy' | 'Sell';
  asset: string;
  amount: string;
  time: string;
  price: string;
}

export interface SmartWalletAlert {
  id: string;
  walletLabel: string;
  type: 'Accumulation' | 'Dump' | 'New Entry' | 'High Risk';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  sentiment: string;
  sentimentScore: number;
  recommendation: 'Buy' | 'Sell' | 'Hold';
  reasoning: string;
  targets: string[];
  stopLoss: string;
  indicators: TechnicalIndicator[];
  indicatorHistory: IndicatorHistory[];
  groundingLinks?: GroundingLink[];
  macd: {
    line: string;
    signal: string;
    histogram: string;
    lineStatus: 'bullish' | 'bearish' | 'neutral';
    signalStatus: 'bullish' | 'bearish' | 'neutral';
    histogramStatus: 'bullish' | 'bearish' | 'neutral';
  };
  liquidity: {
    strength: number;
    description: string;
    status: 'high' | 'medium' | 'low';
    trend: 'rising' | 'falling' | 'stable';
    history: number[]; // البيانات التاريخية للرسم البياني
  };
  openInterest: {
    trend: 'rising' | 'falling' | 'stable';
    sentiment: string;
    estimatedValue: string;
    history: number[]; // البيانات التاريخية للرسم البياني
  };
  smartMoney: {
    flow: 'inflow' | 'outflow' | 'neutral';
    whaleConcentration: number;
    recentInsight: string;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  category: 'Crypto' | 'Market' | 'Tech' | 'Regulation';
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  tags: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  verified?: boolean;
}

export interface CommunityUser {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  bio: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
  verified?: boolean;
  joinDate: string;
  coverImage?: string;
}
