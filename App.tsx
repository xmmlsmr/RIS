
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchTickers, fetchFuturesTickers, fetchKlines, fetchFuturesKlines } from './services/cryptoService';
import { performLocalAnalysis } from './services/localAnalysisService';
import { analyzeSymbol } from './services/geminiService';
import { getSmartWallets, getSmartWalletAlerts } from './services/walletService';
import { CryptoTicker, Strategy, AnalysisResult, GroundingLink, SmartWallet, SmartWalletAlert } from './types';
import { AlertSidebar } from './components/AlertSidebar';
import { AlertModal } from './components/AlertModal';
import { Sparkline } from './components/Sparkline';
import { IndicatorChart } from './components/IndicatorChart';
import { MatrixHeatmap } from './components/MatrixHeatmap';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Search, RefreshCw, Cpu, TrendingUp, Settings, Play, Activity, 
  Rocket, Compass, BrainCircuit, Target, ShieldCheck, 
  Workflow, Zap, TrendingUp as TrendingUpIcon,
  Radar, Flame, BarChart3, ChevronUp, ChevronDown, ListFilter, Timer, Layers,
  Droplets, BarChart, MoveUpRight, MoveDownRight, Stars, Radio, TriangleAlert, ShieldAlert,
  LayoutGrid, Eye, EyeOff, LineChart, BarChart2, Boxes, Share2, Info, X, AlertTriangle,
  Globe, ExternalLink, Newspaper, Microscope, Landmark, Waypoints, History, ArrowDownToLine, ArrowUpFromLine,
  Sun, Moon, Crown, Wallet, Lock, Settings2, Check, Bot, Menu
} from 'lucide-react';

import { SubscriptionModal } from './components/SubscriptionModal';
import { DepositPage } from './components/DepositPage';
import { ProfilePage } from './components/ProfilePage';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { ReferralProgram } from './components/ReferralProgram';
import { WalletPage } from './components/WalletPage';
import { WithdrawPage } from './components/WithdrawPage';
import { TradingBotsPage } from './components/TradingBotsPage';
import { CommunityPage } from './components/CommunityPage';
import { DashboardPage } from './components/DashboardPage';
import { NewsPage } from './components/NewsPage';

const STRATEGIES: Strategy[] = [
  { 
    id: '1', 
    name: 'اختراق RSI المتقدم', 
    description: 'رصد تشبعات البيع والشراء مع تأكيد الزخم السعري القوي.', 
    indicators: ['RSI', 'Volume'], 
    timeframe: '1h', 
    riskLevel: 'Medium', 
    winRate: '68', 
    profitFactor: '1.8', 
    maxDrawdown: '12%', 
    avgDuration: '14h', 
    complexity: 'Intermediate', 
    indicatorLogic: 'RSI(14) breakout logic', 
    bestMarketCondition: 'Trending' 
  },
  { 
    id: '2', 
    name: 'التقاطع الذهبي المؤسسي', 
    description: 'تحليل تقاطع المتوسطات المتحركة الكبرى (50/200) لرصد بداية الاتجاهات.', 
    indicators: ['SMA 50', 'SMA 200'], 
    timeframe: '4h', 
    riskLevel: 'Low', 
    winRate: '75', 
    profitFactor: '2.4', 
    maxDrawdown: '8%', 
    avgDuration: '3d', 
    complexity: 'Professional', 
    indicatorLogic: 'Golden Cross (50/200)', 
    bestMarketCondition: 'Bullish' 
  },
  { 
    id: '3', 
    name: 'سكالبينج الزخم السريع', 
    description: 'صيد الصفقات السريعة بناءً على تذبذب MACD في الفريمات الصغيرة.', 
    indicators: ['MACD', 'EMA 9'], 
    timeframe: '15m', 
    riskLevel: 'High', 
    winRate: '62', 
    profitFactor: '1.5', 
    maxDrawdown: '18%', 
    avgDuration: '45m', 
    complexity: 'Intermediate', 
    indicatorLogic: 'EMA Cross with MACD Histogram', 
    bestMarketCondition: 'High Volatility' 
  },
  {
    id: '4',
    name: 'Bollinger Squeeze Breakout',
    description: 'اقتناص الانفجارات السعرية بعد فترات انخفاض التقلب (Squeeze).',
    indicators: ['Bollinger Bands', 'Volume'],
    timeframe: '1h',
    riskLevel: 'Medium',
    winRate: '70',
    profitFactor: '2.1',
    maxDrawdown: '10%',
    avgDuration: '6h',
    complexity: 'Intermediate',
    indicatorLogic: 'Band Squeeze + Volume Spike',
    bestMarketCondition: 'Consolidation to Trend'
  },
  {
    id: '5',
    name: 'Ichimoku Cloud Trend',
    description: 'تتبع الاتجاهات القوية باستخدام سحابة إيشيموكو لتحديد الدعم والمقاومة الديناميكية.',
    indicators: ['Ichimoku Cloud'],
    timeframe: '4h',
    riskLevel: 'Low',
    winRate: '65',
    profitFactor: '1.9',
    maxDrawdown: '15%',
    avgDuration: '2d',
    complexity: 'Professional',
    indicatorLogic: 'Price > Cloud + Tenkan/Kijun Cross',
    bestMarketCondition: 'Strong Trend'
  },
  {
    id: '6',
    name: 'VWAP Mean Reversion',
    description: 'المتادولة عكس الاتجاه عند الابتعاد المفرط عن متوسط السعر المرجح بالحجم.',
    indicators: ['VWAP', 'RSI'],
    timeframe: '15m',
    riskLevel: 'High',
    winRate: '58',
    profitFactor: '1.6',
    maxDrawdown: '20%',
    avgDuration: '30m',
    complexity: 'Professional',
    indicatorLogic: 'Price deviation from VWAP + RSI Divergence',
    bestMarketCondition: 'Ranging'
  }
];

import { IndicatorSettingsModal } from './components/IndicatorSettingsModal';
import { IndicatorSettings } from './types';

const AVAILABLE_INDICATORS = [
  'RSI (14)',
  'MACD',
  'MACD Hist',
  'MA (50)',
  'MA (200)',
  'Volume Flow',
  'Volatility',
  'Bollinger Bands',
  'Stoch RSI',
  'ATR',
  'OBV',
  'Ichimoku',
  'EMA (9)',
  'EMA (21)',
  'EMA (50)',
  'EMA (200)',
  'VWAP'
];

const INDICATOR_DESCRIPTIONS: Record<string, string> = {
  'RSI (14)': 'Relative Strength Index: Measures the speed and change of price movements. Values > 70 indicate overbought, < 30 indicate oversold.',
  'MACD': 'Moving Average Convergence Divergence: A trend-following momentum indicator that shows the relationship between two moving averages of a security’s price.',
  'MACD Hist': 'Moving Average Convergence Divergence Histogram: Shows the relationship between two moving averages of a security’s price.',
  'MA (50)': '50-Day Moving Average: A trend-following indicator that smooths out price data to identify the direction of the trend over 50 periods.',
  'MA (200)': '200-Day Moving Average: A key long-term trend indicator. Price above 200 MA suggests a long-term uptrend.',
  'Volume Flow': 'Volume Flow Indicator: Combines price and volume to measure buying and selling pressure.',
  'Volatility': 'Volatility: Measures the rate of fluctuations in the price of a security over time.',
  'Bollinger Bands': 'Bollinger Bands: A volatility indicator consisting of a middle band (SMA) and two outer bands (standard deviations).',
  'Stoch RSI': 'Stochastic RSI: Applies the Stochastic formula to RSI values to generate a more sensitive overbought/oversold indicator.',
  'ATR': 'Average True Range: A volatility indicator that decomposes the entire range of an asset price for that period.',
  'OBV': 'On-Balance Volume: Uses volume flow to predict changes in stock price.',
  'Ichimoku': 'Ichimoku Cloud: A collection of technical indicators that show support and resistance levels, as well as momentum and trend direction.',
  'EMA (9)': '9-Period Exponential Moving Average: Reacts more significantly to recent price changes than a simple moving average.',
  'EMA (21)': '21-Period Exponential Moving Average: Used for short-term trend identification.',
  'EMA (50)': '50-Period Exponential Moving Average: Used for medium-term trend identification.',
  'EMA (200)': '200-Period Exponential Moving Average: Used for long-term trend identification.',
  'VWAP': 'Volume Weighted Average Price: The average price a security has traded at throughout the day, based on both volume and price.'
};

import { useAuth } from './context/AuthContext';

import { useSettings } from './context/SettingsContext';

const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  'RSI (14)': { period: 14 },
  'MACD': { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  'MACD Hist': { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  'MA (50)': { period: 50, source: 'close' },
  'MA (200)': { period: 200, source: 'close' },
  'EMA (9)': { period: 9, source: 'close' },
  'EMA (21)': { period: 21, source: 'close' },
  'EMA (50)': { period: 50, source: 'close' },
  'EMA (200)': { period: 200, source: 'close' },
  'Bollinger Bands': { period: 20, stdDev: 2 },
  'Stoch RSI': { period: 14, fastPeriod: 3, slowPeriod: 3 },
  'ATR': { period: 14 },
  'VWAP': { source: 'close' },
  'Volume Flow': { period: 14 },
  'Volatility': { period: 10 },
  'OBV': { source: 'close' },
  'Ichimoku': { fastPeriod: 9, slowPeriod: 26, signalPeriod: 52 }
};

export default function App() {
  const { siteSettings } = useSettings();
  const { isAuthenticated, user, logout, isAdmin, updateUser } = useAuth();
  const [tickers, setTickers] = useState<CryptoTicker[]>([]);
  const [futuresTickers, setFuturesTickers] = useState<CryptoTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<'spot' | 'futures'>('spot');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<'local' | 'deep'>('local');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'screener' | 'explosions' | 'ai' | 'matrix' | 'strategies' | 'bots' | 'community' | 'news'>('dashboard');
  const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null);
  const [smartWallets, setSmartWallets] = useState<SmartWallet[]>([]);
  const [walletAlerts, setWalletAlerts] = useState<SmartWalletAlert[]>([]);
  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>(DEFAULT_INDICATOR_SETTINGS);
  const [showIndicatorSettings, setShowIndicatorSettings] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([
    { id: '1', symbol: 'BTC', type: 'Price', message: 'Bitcoin crossed $65,000', timestamp: new Date(), severity: 'info' },
    { id: '2', symbol: 'ETH', type: 'RSI', message: 'RSI Overbought (85)', timestamp: new Date(), severity: 'warning' },
    { id: '3', symbol: 'SOL', type: 'Change', message: 'Price dropped 5% in 1h', timestamp: new Date(), severity: 'critical' }
  ]);
  const [walletFilter, setWalletFilter] = useState<'All' | 'Conservative' | 'Aggressive' | 'Degen'>('All');
  const [showLanding, setShowLanding] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    }
    return 'dark';
  });

  // Subscription State
  const isVip = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.vipExpiry) {
      return new Date(user.vipExpiry) > new Date();
    }
    return false;
  }, [user]);

  const freeUsageCount = user?.freeUsageCount || 0;

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unlockedFeature, setUnlockedFeature] = useState(false);

  useEffect(() => {
    setUnlockedFeature(false);
  }, [activeTab]);

  // Effect to handle admin access based on role
  useEffect(() => {
    if (isAdmin) {
      // Optional: Automatically show admin dashboard or just enable the button
      // For now, let's just allow access via the button or hotkey
    }
  }, [isAdmin]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Keep the manual override for now as a fallback or "God Mode"
    if (adminPassword === 'samamohamed010') {
      setShowAdminLogin(false);
      setShowAdmin(true);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('كلمة المرور غير صحيحة');
    }
  };

  useEffect(() => {
    const handleOpenAdmin = () => {
      setShowAdmin(true);
      setShowLanding(false);
    };
    window.addEventListener('openAdmin', handleOpenAdmin);
    return () => window.removeEventListener('openAdmin', handleOpenAdmin);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleDismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const [editingAlert, setEditingAlert] = useState<any | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleEditAlert = useCallback((alert: any) => {
    setEditingAlert(alert);
    setShowAlertModal(true);
  }, []);

  const handleSaveAlert = (alertData: any) => {
    if (editingAlert) {
      setAlerts(prev => prev.map(a => a.id === editingAlert.id ? { ...a, ...alertData } : a));
    } else {
      setAlerts(prev => [
        { 
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          ...alertData 
        }, 
        ...prev
      ]);
    }
    setShowAlertModal(false);
    setEditingAlert(null);
  };
  
  const [visibleIndicators, setVisibleIndicators] = useState<string[]>(() => {
    const saved = localStorage.getItem('visibleIndicators');
    return saved ? JSON.parse(saved) : AVAILABLE_INDICATORS;
  });
  const [showIndicatorSelector, setShowIndicatorSelector] = useState(false);
  const [showSparklines, setShowSparklines] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [strategyToConfirm, setStrategyToConfirm] = useState<Strategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const [tickerData, futuresData, walletData, alertData] = await Promise.all([
      fetchTickers(),
      fetchFuturesTickers(),
      getSmartWallets(),
      getSmartWalletAlerts()
    ]);
    setTickers(tickerData);
    setFuturesTickers(futuresData);
    setSmartWallets(walletData);
    setWalletAlerts(alertData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 20000); 
    return () => clearInterval(interval);
  }, [loadData]);

  const explosiveCoins = useMemo(() => {
    return futuresTickers
      .map(t => {
        const priceChange = Math.abs(parseFloat(t.priceChangePercent));
        const volume = parseFloat(t.quoteVolume);
        const score = (priceChange * 2) + (volume / 20000000); 
        return { ...t, explosionScore: score };
      })
      .filter(t => t.explosionScore > 15) 
      .sort((a, b) => b.explosionScore - a.explosionScore)
      .slice(0, 16);
  }, [futuresTickers]);

  const handleAnalyze = useCallback(async (symbol: string, strategy: Strategy | null = null, type: 'local' | 'deep' = 'local', market: 'spot' | 'futures' = 'spot') => {
    // Check subscription status
    if (!isVip) {
      if (freeUsageCount >= 1) {
        setShowSubscriptionModal(true);
        return;
      }
    }

    const tickerList = market === 'futures' ? futuresTickers : tickers;
    const ticker = tickerList.find(t => t.symbol === symbol);
    if (!ticker) return;
    
    setIsAnalyzing(true);
    setError(null);
    setSelectedSymbol(symbol);
    setSelectedMarket(market);
    setActiveStrategy(strategy);
    setAnalysisType(type);
    
    // Increment free usage if not VIP
    if (!isVip) {
      updateUser({ freeUsageCount: freeUsageCount + 1 });
    }
    
    if (activeTab !== 'ai' && activeTab !== 'matrix') {
      setActiveTab('ai');
    }
    
    setAnalysis(null);
    
    try {
      if (type === 'local') {
        await new Promise(r => setTimeout(r, 800)); 
        const result = performLocalAnalysis(symbol, ticker, strategy || undefined, indicatorSettings);
        setAnalysis(result);
      } else {
        const result = await analyzeSymbol(symbol, ticker, true, strategy || undefined);
        setAnalysis(result);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء التحليل.");
      const fallback = performLocalAnalysis(symbol, ticker, strategy || undefined, indicatorSettings);
      setAnalysis(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  }, [tickers, futuresTickers, activeTab, isVip, freeUsageCount]);

  const initiateStrategy = (strategy: Strategy) => {
    if (selectedSymbol) {
      setStrategyToConfirm(strategy);
    } else {
      setActiveTab('screener');
    }
  };

  const confirmAndAnalyze = () => {
    if (strategyToConfirm && selectedSymbol) {
      handleAnalyze(selectedSymbol, strategyToConfirm, 'local', selectedMarket);
      setStrategyToConfirm(null);
    }
  };

  const toggleIndicator = (name: string) => {
    setVisibleIndicators(prev => {
      const newIndicators = prev.includes(name) 
        ? prev.filter(n => n !== name) 
        : [...prev, name];
      localStorage.setItem('visibleIndicators', JSON.stringify(newIndicators));
      return newIndicators;
    });
  };

  const filteredTickers = useMemo(() => {
    let result = [...tickers];
    if (searchTerm) result = result.filter(t => t.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [tickers, searchTerm]);

  const displayedIndicators = useMemo(() => {
    if (!analysis) return [];
    return analysis.indicators.filter(ind => visibleIndicators.includes(ind.name));
  }, [analysis, visibleIndicators]);

  const [selectedPlan, setSelectedPlan] = useState<{id: string, price: number, duration: number} | null>(null);

  const handleSubscribe = (planId: string, price: number, duration: number) => {
    setSelectedPlan({ id: planId, price, duration });
    setShowSubscriptionModal(false);
    setShowDeposit(true);
  };

  const handleDepositSuccess = () => {
    const duration = selectedPlan?.duration || 10; // Default to 10 if no plan selected (fallback)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);
    
    setShowDeposit(false);
    if (user) {
      updateUser({ role: 'vip', vipExpiry: expiryDate.toISOString() });
    }
    setSelectedPlan(null);
  };

  const rsiHistory = useMemo(() => {
    if (!analysis) return null;
    return analysis.indicatorHistory.find(h => h.name === 'RSI (14)');
  }, [analysis]);

  if (showAdmin) {
    return <AdminDashboard onClose={() => setShowAdmin(false)} />;
  }

  // Maintenance Mode Check
  if (siteSettings.maintenanceMode && !isAdmin) {
    return (
      <>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4" dir="rtl">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle size={48} className="text-amber-500" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">الموقع تحت الصيانة</h1>
          <p className="text-gray-400 mb-8 max-w-md text-lg">
            نحن نعمل حالياً على تحسين وتطوير المنصة لتقديم تجربة أفضل. سنعود للعمل قريباً.
          </p>
          <button 
            onClick={() => setShowAdminLogin(true)} 
            className="text-gray-600 hover:text-white text-sm font-bold transition-colors flex items-center gap-2"
          >
            <Lock size={14} />
            دخول المسؤولين
          </button>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0e1116] p-8 rounded-3xl border border-cyan-500/20 w-full max-w-md shadow-[0_0_50px_rgba(0,243,255,0.1)] relative">
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-4 left-4 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>
              <h3 className="text-2xl font-black mb-6 text-center font-tech uppercase tracking-wider text-white">System Override</h3>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-cyan-500 mb-2 font-tech tracking-widest uppercase">Access Code</label>
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-center tracking-[0.5em] focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                {adminError && <p className="text-rose-500 text-xs text-center font-bold">{adminError}</p>}
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]">
                  ACCESS SYSTEM
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden text-sm bg-gray-50 dark:bg-[#07090b] text-gray-900 dark:text-white font-sans selection:bg-cyan-500/30 transition-colors duration-300">
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
        onSubscribe={handleSubscribe} 
      />
      <ReferralProgram 
        isOpen={showReferral} 
        onClose={() => setShowReferral(false)} 
      />
      {showWallet && (
        <WalletPage 
          onClose={() => setShowWallet(false)} 
          onDeposit={() => {
            setShowWallet(false);
            setShowDeposit(true);
          }}
          onWithdraw={() => {
            setShowWallet(false);
            setShowWithdraw(true);
          }}
        />
      )}
      {showWithdraw && (
        <WithdrawPage 
          onClose={() => setShowWithdraw(false)} 
          onSuccess={() => setShowWithdraw(false)}
        />
      )}
      {showDeposit && (
        <DepositPage 
          onClose={() => setShowDeposit(false)} 
          onDepositSuccess={handleDepositSuccess} 
        />
      )}
      {showProfile && (
        <ProfilePage 
          onClose={() => setShowProfile(false)} 
          onLogout={() => {
            logout();
            setShowProfile(false);
          }}
          isVip={isVip}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenReferral={() => setShowReferral(true)}
        />
      )}
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0e1116] p-8 rounded-3xl border border-cyan-500/20 w-full max-w-md shadow-[0_0_50px_rgba(0,243,255,0.1)] relative">
            <button 
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 left-4 text-gray-500 hover:text-white"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black mb-6 text-center font-tech uppercase tracking-wider text-white">System Override</h3>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-cyan-500 mb-2 font-tech tracking-widest uppercase">Access Code</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] font-tech tracking-widest text-center text-lg"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              {adminError && (
                <div className="text-rose-500 text-xs font-bold text-center font-tech tracking-wider">{adminError}</div>
              )}
              <button 
                type="submit"
                className="w-full py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 font-black rounded-xl hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all font-tech tracking-wider uppercase"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal 
        isOpen={showAlertModal} 
        onClose={() => setShowAlertModal(false)} 
        onSave={handleSaveAlert} 
        alert={editingAlert} 
      />

      {/* Confirmation Dialog Modal */}
      {strategyToConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-lg rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_100px_rgba(6,182,212,0.2)] animate-in zoom-in-95 duration-500 text-right">
             <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <button onClick={() => setStrategyToConfirm(null)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <X size={20} />
               </button>
               <h3 className="text-xl font-black text-white flex items-center gap-3">
                  تأكيد تفعيل الاستراتيجية
                  <ShieldCheck size={24} className="text-cyan-400" />
               </h3>
             </div>

             <div className="space-y-6 mb-8">
                <div className="p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                   <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-1">اسم الخوارزمية المختارة</span>
                   <h4 className="text-2xl font-black text-cyan-400">{strategyToConfirm.name}</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-2">مستوى المخاطرة</span>
                      <span className={`text-lg font-black ${strategyToConfirm.riskLevel === 'High' ? 'text-rose-500' : strategyToConfirm.riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {strategyToConfirm.riskLevel} Risk
                      </span>
                   </div>
                   <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-2">نسبة النجاح المتوقعة</span>
                      <span className="text-lg font-mono font-black text-white">%{strategyToConfirm.winRate}</span>
                   </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                   <AlertTriangle size={24} className="text-amber-500 shrink-0" />
                   <p className="text-gray-300 text-xs font-bold leading-relaxed">
                      سيقوم المحرك العصبي بتحليل عملة <span className="text-white underline">{selectedSymbol}</span> بناءً على هذه المعطيات. هل ترغب في المتابعة؟
                   </p>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={confirmAndAnalyze}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-2xl font-black text-base shadow-2xl transition-all border-b-4 border-cyan-900 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-3"
                >
                  <Play size={20} fill="currentColor" /> تأكيد وتفعيل
                </button>
                <button 
                  onClick={() => setStrategyToConfirm(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-2xl font-black text-base transition-all border border-white/10"
                >
                  إلغاء الأمر
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-[#0a0f18]/80 backdrop-blur-xl border-b border-cyan-500/10 flex items-center justify-between px-4 md:px-6 shrink-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 relative">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-10 h-10 bg-[#0a0f18] rounded-xl flex items-center justify-center border border-cyan-500/30 shadow-2xl">
              <span className="font-tech text-cyan-400 font-black text-xl">A</span>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-white leading-none font-tech uppercase flex items-center gap-2">
              ALPHA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 neon-text-cyan">RADAR</span>
            </h1>
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-0.5 font-tech flex items-center gap-2">
              v4.0.2 <span className="w-1 h-1 rounded-full bg-cyan-500"></span> NEON_CORE
            </span>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl px-8 hidden md:block">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-[#05080c] border border-white/5 rounded-xl overflow-hidden group-focus-within:border-cyan-500/50 transition-colors">
              <Search className="absolute right-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH ASSETS / PAIRS..." 
                className="w-full bg-transparent py-2.5 pr-12 pl-4 text-xs focus:outline-none text-right placeholder-gray-700 font-bold text-white font-tech tracking-wider uppercase" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <div className="absolute left-2 flex gap-1">
                <span className="text-[9px] font-mono text-gray-700 border border-white/5 px-1.5 py-0.5 rounded">CMD+K</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden lg:flex flex-col items-end mr-4 border-r border-white/5 pr-4">
              <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] font-tech mb-0.5">SYSTEM STATUS</span>
              <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1.5 font-tech tracking-wider">
                <div className="relative w-1.5 h-1.5">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
                ONLINE
              </span>
           </div>

           <button 
             onClick={() => setShowSubscriptionModal(true)}
             className={`h-9 px-3 sm:px-4 rounded-xl text-[10px] font-black transition-all border flex items-center gap-2 font-tech tracking-wider group ${
               isVip 
                 ? 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                 : 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
             }`}
           >
             {isVip ? (
               <>
                 <Crown size={14} className="group-hover:rotate-12 transition-transform" />
                 <span className="hidden sm:inline">VIP ACTIVE</span>
               </>
             ) : (
               <>
                 <Crown size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                 <span className="hidden sm:inline">UPGRADE VIP</span>
               </>
             )}
           </button>

           <div className="h-8 w-[1px] bg-white/5 mx-1"></div>

           <button 
             onClick={() => setShowWallet(true)}
             className="w-9 h-9 rounded-xl bg-[#0a0f18] flex items-center justify-center hover:bg-cyan-500/10 cursor-pointer transition-all border border-white/5 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 group relative overflow-hidden"
             title="Wallet"
           >
              <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Wallet size={16} className="relative z-10" />
           </button>
           
           <button 
             onClick={toggleTheme}
             className="w-9 h-9 rounded-xl bg-[#0a0f18] flex items-center justify-center hover:bg-purple-500/10 cursor-pointer transition-all border border-white/5 hover:border-purple-500/30 text-gray-400 hover:text-purple-400 group relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-purple-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {theme === 'dark' ? <Sun size={16} className="relative z-10" /> : <Moon size={16} className="relative z-10" />}
           </button>
           
           <button 
             onClick={() => setShowProfile(true)}
             className="w-9 h-9 rounded-xl bg-[#0a0f18] flex items-center justify-center hover:bg-rose-500/10 cursor-pointer transition-all border border-white/5 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 group relative overflow-hidden"
             title="Settings"
           >
              <div className="absolute inset-0 bg-rose-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Settings size={16} className="relative z-10 group-hover:rotate-90 transition-transform duration-500" />
           </button>
           
           <button 
             onClick={() => logout()}
             className="w-9 h-9 rounded-xl bg-[#0a0f18] flex items-center justify-center hover:bg-red-500/10 cursor-pointer transition-all border border-white/5 hover:border-red-500/30 text-gray-400 hover:text-red-400 group relative overflow-hidden"
             title="Logout"
           >
              <div className="absolute inset-0 bg-red-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <ArrowUpFromLine size={16} className="relative z-10 rotate-90" />
           </button>
        </div>
      </header>

      {/* Free Usage Banner */}
      {!isVip && (
        <div 
          className={`w-full py-1.5 text-center text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer relative overflow-hidden group ${
            freeUsageCount === 0 
              ? 'bg-cyan-900/20 text-cyan-400 border-b border-cyan-500/20' 
              : 'bg-rose-900/20 text-rose-400 border-b border-rose-500/20'
          }`}
          onClick={() => freeUsageCount >= 1 && setShowSubscriptionModal(true)}
        >
          <div className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity ${freeUsageCount === 0 ? 'bg-cyan-500' : 'bg-rose-500'}`}></div>
          <span className="relative z-10 flex items-center justify-center gap-2 font-tech">
            {freeUsageCount === 0 
              ? <><Zap size={12} className="animate-pulse"/> 1 FREE ANALYSIS AVAILABLE // DEPLOY WISELY</>
              : <><Lock size={12} /> FREE TIER EXHAUSTED // UPGRADE FOR UNLIMITED ACCESS</>}
          </span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative" dir="rtl">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`fixed inset-y-0 right-0 z-50 h-full transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <AlertSidebar 
            alerts={alerts} 
            onAddAlert={() => {
              setEditingAlert(null);
              setShowAlertModal(true);
            }} 
            onDismissAlert={handleDismissAlert} 
            onEditAlert={handleEditAlert}
          />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#020408] transition-colors duration-300 w-full">
          {/* Navigation */}
          <nav className="bg-[#0a0f18]/60 backdrop-blur-md border-b border-white/5 px-6 flex items-center gap-2 h-12 shrink-0 z-40 overflow-x-auto no-scrollbar transition-colors duration-300">
            {[
              { id: 'dashboard', icon: LayoutGrid, label: 'DASHBOARD' },
              { id: 'screener', icon: ListFilter, label: 'MARKET RADAR' },
              { id: 'explosions', icon: Radio, label: 'PRICE EXPLOSIONS', highlight: true },
              { id: 'ai', icon: BrainCircuit, label: 'NEURAL ENGINE' },
              { id: 'matrix', icon: Boxes, label: 'ON-CHAIN MATRIX' },
              { id: 'strategies', icon: Workflow, label: 'STRATEGIES' },
              { id: 'bots', icon: Bot, label: 'TRADING BOTS' },
              { id: 'news', icon: Newspaper, label: 'NEWS' },
              { id: 'community', icon: Share2, label: 'COMMUNITY' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id as any);
                }} 
                className={`relative h-8 px-4 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 whitespace-nowrap tracking-wider font-tech uppercase group overflow-hidden ${
                  activeTab === tab.id 
                    ? 'text-white bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                )}
                <tab.icon size={14} className={`transition-colors ${activeTab === tab.id ? (tab.highlight ? 'text-rose-500 animate-pulse' : 'text-cyan-400') : 'group-hover:text-white'}`} /> 
                {tab.label}
                {tab.highlight && <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-rose-500 rounded-full animate-ping"></span>}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
            
            {activeTab === 'dashboard' && (
              <DashboardPage 
                user={user}
                tickers={tickers}
                onNavigate={setActiveTab}
                onAnalyze={(symbol) => {
                  setSelectedSymbol(symbol);
                  setActiveTab('ai');
                }}
                onShowWallet={() => setShowWallet(true)}
                onShowReferral={() => setShowReferral(true)}
                isVip={isVip}
                onShowSubscription={() => setShowSubscriptionModal(true)}
              />
            )}

            {activeTab === 'screener' && (
              <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Market Volatility', val: 'HIGH', icon: Activity, color: 'text-cyan-400', border: 'border-cyan-500/30', shadow: 'shadow-[0_0_20px_rgba(0,243,255,0.1)]' },
                    { label: 'Active Pairs', val: `${tickers.length} ASSETS`, icon: BarChart3, color: 'text-purple-400', border: 'border-purple-500/30', shadow: 'shadow-[0_0_20px_rgba(189,0,255,0.1)]' },
                    { label: 'Engine Latency', val: '0.04ms', icon: Cpu, color: 'text-emerald-400', border: 'border-emerald-500/30', shadow: 'shadow-[0_0_20px_rgba(0,255,157,0.1)]' }
                  ].map((stat, i) => (
                    <div key={i} className={`glass-panel p-4 rounded-2xl flex items-center justify-between hover:translate-y-[-2px] transition-transform duration-300 border ${stat.border} ${stat.shadow} bg-[#0a0f18]/60`}>
                      <div>
                        <p className="text-[8px] text-gray-500 font-black uppercase mb-0.5 tracking-widest font-tech">{stat.label}</p>
                        <h4 className={`text-xl font-black ${stat.color} font-tech tracking-wider`}>{stat.val}</h4>
                      </div>
                      <stat.icon size={20} className={`${stat.color} opacity-50`} />
                    </div>
                  ))}
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5 bg-[#0a0f18]/40 backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[600px]">
                      <thead className="bg-[#0a0f18] text-gray-500 text-[9px] uppercase font-black tracking-widest font-tech border-b border-white/5">
                        <tr>
                          <th className="px-4 py-3 text-cyan-400/50 whitespace-nowrap">ASSET</th>
                          <th className="px-4 py-3 text-cyan-400/50 whitespace-nowrap">PRICE</th>
                          <th className="px-4 py-3 text-cyan-400/50 whitespace-nowrap">24H CHANGE</th>
                          <th className="px-4 py-3 text-cyan-400/50 whitespace-nowrap">VOLUME</th>
                          <th className="px-4 py-3 text-center text-cyan-400/50 whitespace-nowrap">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {filteredTickers.map(t => {
                          const isPos = parseFloat(t.priceChangePercent) >= 0;
                          return (
                            <tr key={t.symbol} className="hover:bg-white/[0.02] transition-all group cursor-pointer" onClick={() => handleAnalyze(t.symbol, null, 'local', 'spot')}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-black/40 rounded-lg flex items-center justify-center font-black text-[9px] text-cyan-400 border border-white/5 shadow-inner">{t.symbol.substring(0, 3)}</div>
                                  <span className="font-black text-xs text-white group-hover:text-cyan-400 transition-colors">{t.symbol}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-mono text-gray-100 font-black text-xs whitespace-nowrap">${parseFloat(t.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                              <td className={`px-4 py-3 font-black text-xs whitespace-nowrap ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <div className="flex items-center gap-1">
                                  {isPos ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                  {t.priceChangePercent}%
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-500 font-mono text-[10px] tracking-tighter whitespace-nowrap">${(parseFloat(t.quoteVolume)/1000000).toFixed(1)}M</td>
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button className="bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-white p-2 rounded-lg transition-all border border-cyan-500/20 active:scale-90 shadow-lg">
                                  <Zap size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'explosions' && (
              <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-700 pb-20 relative min-h-[600px]">
                {!isVip && !unlockedFeature && (
                  <div className="absolute inset-0 z-50 bg-[#020408]/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 rounded-[2rem] border border-white/5">
                    {freeUsageCount >= 1 ? (
                      <>
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                          <Lock size={40} className="text-rose-500" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">Premium Feature</h3>
                        <p className="text-gray-400 mb-8 max-w-md font-medium text-base leading-relaxed">
                          This advanced market analysis tool is available exclusively for VIP members. Upgrade now to unlock unlimited access.
                        </p>
                        <button 
                          onClick={() => setShowSubscriptionModal(true)}
                          className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black rounded-xl shadow-xl shadow-rose-500/20 transition-all transform hover:scale-105 flex items-center gap-3"
                        >
                          <Crown size={20} fill="currentColor" /> UPGRADE TO VIP
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                          <Zap size={40} className="text-cyan-400" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">Unlock Free Trial</h3>
                        <p className="text-gray-400 mb-8 max-w-md font-medium text-base leading-relaxed">
                          You have 1 free usage available. Unlock this feature to access real-time market data?
                        </p>
                        <button 
                          onClick={() => {
                            updateUser({ freeUsageCount: freeUsageCount + 1 });
                            setUnlockedFeature(true);
                          }}
                          className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl shadow-xl shadow-cyan-500/20 transition-all transform hover:scale-105 flex items-center gap-3"
                        >
                          <Zap size={20} fill="currentColor" /> UNLOCK ACCESS
                        </button>
                      </>
                    )}
                  </div>
                )}
                <div className="relative h-[200px] w-full flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[#0e1116]/40 shadow-xl group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.1)_0%,_transparent_70%)] animate-pulse"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-cyan-600/10 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/30 shadow-lg">
                      <Radio size={24} className="text-cyan-400 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-1 tracking-tighter glow-text-cyan">رادار ALPHA</h2>
                    <p className="text-cyan-400/60 text-xs font-black uppercase tracking-widest">Pulse Detection System v4</p>
                    <div className="mt-4 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 font-black text-[9px] flex items-center gap-1.5">
                      <TriangleAlert size={12}/> {explosiveCoins.length} عملات في منطقة الخطر العالية
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {explosiveCoins.map((t) => {
                     const isHigh = t.explosionScore > 30;
                     return (
                       <div key={t.symbol} onClick={() => handleAnalyze(t.symbol, null, 'local', 'futures')} className={`p-4 rounded-2xl glass-panel border transition-all flex flex-col justify-between h-[240px] shadow-lg relative cursor-pointer group hover:translate-y-[-4px] ${isHigh ? 'border-rose-500/30' : 'border-cyan-500/10 hover:border-cyan-500/40'}`}>
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isHigh ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
                                  {isHigh ? <Flame size={16} className="animate-bounce" /> : <Rocket size={16}/>}
                                </div>
                                <h3 className="text-lg font-black text-white tracking-tight">{t.symbol}</h3>
                             </div>
                             <span className={`text-lg font-black font-mono leading-none ${parseFloat(t.priceChangePercent) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>%{t.priceChangePercent}</span>
                          </div>
                          
                          <div className="space-y-3 pt-4">
                             <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <div>
                                   <span className="text-[7px] text-gray-500 font-black block mb-0.5 uppercase tracking-widest">Live Price</span>
                                   <span className="text-lg font-mono font-black text-gray-100">${parseFloat(t.lastPrice).toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                   <span className="text-[7px] text-gray-500 font-black block mb-0.5 uppercase tracking-widest">Shock XP</span>
                                   <span className={`text-lg font-mono font-black ${isHigh ? 'text-rose-400' : 'text-cyan-400'}`}>{t.explosionScore.toFixed(0)}</span>
                                </div>
                             </div>
                             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-[2000ms] ${isHigh ? 'bg-rose-500' : 'bg-cyan-400'}`} style={{ width: `${Math.min(t.explosionScore * 2, 100)}%` }}></div>
                             </div>
                          </div>
                          
                          <button className={`w-full py-2.5 rounded-lg font-black text-[10px] tracking-widest transition-all border-b-2 shadow-lg flex items-center justify-center gap-1.5 mt-3 ${isHigh ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-900' : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-900'}`}>
                             <Cpu size={14} /> تشريح الهدف
                          </button>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-700 pb-20 text-right">
                {!selectedSymbol ? (
                  <div className="text-center py-40 flex flex-col items-center opacity-20">
                    <Compass size={60} className="text-cyan-400 mb-4" />
                    <h2 className="text-2xl font-black text-gray-400 tracking-tighter">بانتظار تحديد الهدف الرقمي...</h2>
                  </div>
                ) : (
                  <>
                    <div className="glass-panel p-6 rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                       <div className="flex items-center gap-4 z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-xl flex items-center justify-center font-black text-3xl text-white shadow-lg border border-white/20">
                            {selectedSymbol[0]}
                          </div>
                          <div>
                            <h2 className="text-4xl font-black tracking-tighter text-white glow-text-cyan">{selectedSymbol}</h2>
                            <div className="flex gap-2 mt-2">
                              <span className="bg-cyan-600/10 text-cyan-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase border border-cyan-500/20 flex items-center gap-1.5">
                                  <Zap size={12}/> {analysisType === 'deep' ? 'Gemini AI Deep Link' : 'Neural Local Engine'}
                              </span>
                              {activeStrategy && (
                                <span className="bg-amber-600/10 text-amber-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase border border-amber-500/20">
                                  {activeStrategy.name}
                                </span>
                              )}
                            </div>
                          </div>
                       </div>
                       
                       <div className="flex gap-2 z-10">
                         <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-md ${showSettings ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                          >
                            <LayoutGrid size={18} />
                         </button>
                         <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => handleAnalyze(selectedSymbol, activeStrategy, 'deep', selectedMarket)} 
                              disabled={isAnalyzing}
                              className={`w-full px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-black text-[9px] shadow-lg flex items-center justify-center gap-1.5 hover:scale-105 transition-all disabled:opacity-50`}
                            >
                              <BrainCircuit size={12} /> تحليل AI عميق
                            </button>
                            <button 
                              onClick={() => handleAnalyze(selectedSymbol, activeStrategy, 'local', selectedMarket)} 
                              disabled={isAnalyzing}
                              className={`w-full px-4 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg font-black text-[9px] hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50`}
                            >
                              <Zap size={12} /> تحليل محلي سريع
                            </button>
                         </div>
                       </div>
                    </div>

                    {isAnalyzing ? (
                      <div className="py-20 flex flex-col items-center gap-8">
                        <div className="relative">
                           <div className="w-24 h-24 border-[8px] border-cyan-600/10 border-t-cyan-500 rounded-full animate-spin"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                              {analysisType === 'deep' ? <Microscope size={24} className="text-indigo-400 animate-pulse" /> : <Cpu size={24} className="text-cyan-400 animate-pulse" />}
                           </div>
                        </div>
                        <div className="text-center space-y-1">
                           <p className="text-2xl font-black text-white animate-pulse tracking-tighter">
                             {analysisType === 'deep' ? 'جاري استجواب الذكاء الاصطناعي...' : 'جاري معالجة المصفوفات المحلية...'}
                           </p>
                        </div>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-8 animate-in fade-in duration-700 pb-20">
                        {/* Recommendation Card */}
                        <div className={`relative p-1 rounded-[2.5rem] overflow-hidden shadow-2xl ${
                          analysis.recommendation === 'Buy' ? 'bg-emerald-500/20' : analysis.recommendation === 'Sell' ? 'bg-rose-500/20' : 'bg-amber-500/20'
                        }`}>
                           <div className="absolute inset-0 bg-[#0e1116] m-1 rounded-[2.4rem]"></div>
                           <div className="relative grid grid-cols-1 lg:grid-cols-5 items-stretch min-h-[240px]">
                              <div className="lg:col-span-3 p-8 flex flex-col items-center justify-center text-center relative border-l border-white/5">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4">Verdict</span>
                                 <h3 className={`text-6xl font-black leading-none tracking-tighter drop-shadow-lg ${
                                   analysis.recommendation === 'Buy' ? 'text-emerald-400 glow-text-emerald' : 
                                   analysis.recommendation === 'Sell' ? 'text-rose-400 glow-text-rose' : 'text-amber-400'
                                 }`}>
                                   {analysis.recommendation === 'Buy' ? 'شراء' : analysis.recommendation === 'Sell' ? 'بيع' : 'ترقب'}
                                 </h3>
                              </div>

                              <div className="lg:col-span-2 p-8 flex flex-col items-center justify-center text-center bg-black/30 relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                 
                                 <div className="grid grid-cols-2 gap-4 w-full items-center">
                                    {/* Confidence Score */}
                                    <div className="flex flex-col items-center">
                                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-3">AI Confidence</span>
                                       <div className="relative group">
                                          <svg className="w-20 h-20 transform -rotate-90">
                                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                            <circle 
                                              cx="40" cy="40" r="36" 
                                              stroke="currentColor" strokeWidth="6" fill="transparent" 
                                              strokeDasharray={226} 
                                              strokeDashoffset={226 - (226 * analysis.sentimentScore) / 100} 
                                              className={`${analysis.sentimentScore > 75 ? 'text-emerald-400' : 'text-cyan-400'} transition-all duration-[2000ms]`} 
                                              strokeLinecap="round" 
                                            />
                                          </svg>
                                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                                             <span className="text-xl font-black font-mono leading-none text-white">{analysis.sentimentScore}%</span>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Market Sentiment */}
                                    <div className="flex flex-col items-center justify-center">
                                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-3">Market Sentiment</span>
                                       <div className={`px-3 py-2 rounded-xl border flex items-center justify-center w-full ${
                                          analysis.sentiment === 'إيجابي' || analysis.sentiment === 'Bullish' || analysis.sentiment.includes('Bull') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                          analysis.sentiment === 'سلبي' || analysis.sentiment === 'Bearish' || analysis.sentiment.includes('Bear') ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                          'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                       }`}>
                                          <span className="text-base font-black">
                                             {analysis.sentiment === 'إيجابي' ? 'Bullish' : 
                                              analysis.sentiment === 'سلبي' ? 'Bearish' : 
                                              analysis.sentiment === 'محايد' ? 'Neutral' : 
                                              analysis.sentiment}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* RSI History Section */}
                        {rsiHistory && (
                          <div className="glass-panel p-6 rounded-[2rem] shadow-xl border border-white/5 relative overflow-hidden group">
                             <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xl font-black text-cyan-400 flex items-center gap-3 tracking-tight">
                                  <Activity size={24} /> تحليل زخم RSI التاريخي (7 أيام)
                                </h4>
                             </div>
                             
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/60 p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center min-h-[180px] relative">
                                  <IndicatorChart history={rsiHistory} color="#06b6d4" type="area" height={140} />
                                </div>
                                {analysis.indicatorHistory.filter(h => h.name !== 'RSI (14)').slice(0, 3).map((hist, idx) => (
                                  <div key={idx} className="bg-black/60 p-4 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center min-h-[180px] relative">
                                    <IndicatorChart 
                                      history={hist} 
                                      color={['#10b981', '#f59e0b', '#8b5cf6'][idx % 3]} 
                                      type={hist.name.includes('Hist') ? 'area' : 'line'} 
                                      height={140} 
                                    />
                                  </div>
                                ))}
                              </div>
                             
                             <div className="mt-6 p-4 bg-cyan-600/5 rounded-xl border border-cyan-500/10 flex items-start gap-3">
                                <Info size={20} className="text-cyan-400 shrink-0" />
                                <p className="text-xs font-bold text-gray-300 leading-relaxed">
                                  يوضح المخطط أعلاه القوة النسبية التاريخية للأصل. يلاحظ {rsiHistory.values[rsiHistory.values.length-1] > 60 ? 'زخم شرائي متصاعد' : rsiHistory.values[rsiHistory.values.length-1] < 40 ? 'ضغط بيعي مستمر' : 'حالة من التوازن النسبي'}.
                                </p>
                             </div>
                          </div>
                        )}

                        {/* Technical Indicators Grid */}
                        <div className="glass-panel p-6 rounded-[2rem] shadow-xl border border-white/5">
                           <div className="flex flex-col gap-3 mb-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-black text-white flex items-center gap-2">
                                  <ListFilter size={18} className="text-cyan-400" /> المؤشرات الفنية
                                </h4>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setShowIndicatorSettings(true)}
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 border bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                                  >
                                    <Settings size={14} /> إعدادات المؤشرات
                                  </button>
                                  <button 
                                    onClick={() => setShowIndicatorSelector(!showIndicatorSelector)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 border ${showIndicatorSelector ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                                  >
                                    <Settings2 size={14} /> تخصيص العرض
                                  </button>
                                </div>
                              </div>
                              
                              {showIndicatorSelector && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-4 bg-black/40 rounded-2xl border border-white/5 mb-2 animate-in slide-in-from-top-2">
                                  {AVAILABLE_INDICATORS.map(ind => (
                                    <button 
                                      key={ind}
                                      onClick={() => toggleIndicator(ind)}
                                      title={INDICATOR_DESCRIPTIONS[ind]}
                                      className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border flex items-center justify-between group ${
                                        visibleIndicators.includes(ind) 
                                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                                          : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        {ind}
                                        {INDICATOR_DESCRIPTIONS[ind] && <Info size={10} className="opacity-50 group-hover:opacity-100" />}
                                      </div>
                                      {visibleIndicators.includes(ind) && <Check size={12} className="text-cyan-400" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                           </div>
                           
                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {displayedIndicators.map((ind, i) => (
                                 <div key={i} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:border-cyan-500/30 transition-all group hover:-translate-y-1 duration-300 relative overflow-visible">
                                    <div className="flex items-center gap-1.5 mb-2 relative z-10">
                                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{ind.name}</span>
                                      {INDICATOR_DESCRIPTIONS[ind.name] && (
                                        <div className="group/info relative flex items-center">
                                          <Info size={10} className="text-gray-600 hover:text-cyan-400 cursor-help transition-colors" />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#0e1116] border border-cyan-500/20 rounded-xl shadow-2xl text-[10px] text-gray-300 leading-relaxed opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-md">
                                            <div className="font-black text-cyan-400 mb-1 text-[9px] uppercase tracking-wider">{ind.name}</div>
                                            {INDICATOR_DESCRIPTIONS[ind.name]}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0e1116]"></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-base font-mono font-black text-white group-hover:text-cyan-400 transition-colors break-all">{ind.value}</span>
                                    <span className={`text-[9px] font-black uppercase mt-2 px-2 py-0.5 rounded-md border ${
                                       ind.status === 'bullish' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                       ind.status === 'bearish' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                    }`}>
                                       {ind.status}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Reasoning */}
                        <div className="glass-panel p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-2 h-full bg-cyan-600/20 group-hover:bg-cyan-500 transition-colors duration-1000"></div>
                           <h4 className="text-3xl font-black text-cyan-400 mb-8 flex items-center gap-4 tracking-tighter">
                             <TrendingUpIcon size={32} className="opacity-40" /> التقرير الفني المعمق
                           </h4>
                           <p className="text-lg leading-relaxed text-gray-200 font-bold whitespace-pre-wrap">
                             {analysis.reasoning}
                           </p>
                        </div>
                        
                        {/* Targets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-emerald-500/5 p-10 rounded-[4rem] border-2 border-emerald-500/10 shadow-xl">
                              <h4 className="text-2xl font-black text-emerald-400 mb-8 flex items-center gap-4">
                                <Target size={32} className="opacity-30" /> مستويات الأهداف (TP)
                              </h4>
                              <div className="space-y-6">
                                 {analysis.targets.map((t, i) => (
                                    <div key={i} className="bg-black/60 p-8 rounded-[2rem] flex justify-between items-center group/target hover:border-emerald-500/50 transition-all border border-white/5">
                                       <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Goal {i+1}</span>
                                       <span className="text-3xl font-mono font-black text-white group-hover/target:text-emerald-400 transition-colors">${t}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                           
                           <div className="bg-rose-500/5 p-10 rounded-[4rem] border-2 border-rose-500/10 text-center flex flex-col justify-center items-center shadow-xl">
                              <ShieldAlert size={80} className="text-rose-500/10 mb-8" />
                              <span className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Safety Stop Loss</span>
                              <span className="text-5xl font-mono font-black text-white drop-shadow-lg glow-text-rose">${analysis.stopLoss}</span>
                              <p className="text-gray-600 font-black text-[10px] mt-8 tracking-widest uppercase">Liquidation Protection</p>
                           </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )}

            {activeTab === 'matrix' && (
              <div className="max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom-5 duration-700 pb-20 text-right relative min-h-[600px]">
                {!isVip && !unlockedFeature && (
                  <div className="absolute inset-0 z-50 bg-[#020408]/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 rounded-[3rem] border border-white/5">
                    {freeUsageCount >= 1 ? (
                      <>
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                          <Lock size={40} className="text-rose-500" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">Premium Feature</h3>
                        <p className="text-gray-400 mb-8 max-w-md font-medium text-base leading-relaxed">
                          This advanced market analysis tool is available exclusively for VIP members. Upgrade now to unlock unlimited access.
                        </p>
                        <button 
                          onClick={() => setShowSubscriptionModal(true)}
                          className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black rounded-xl shadow-xl shadow-rose-500/20 transition-all transform hover:scale-105 flex items-center gap-3"
                        >
                          <Crown size={20} fill="currentColor" /> UPGRADE TO VIP
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                          <Zap size={40} className="text-cyan-400" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">Unlock Free Trial</h3>
                        <p className="text-gray-400 mb-8 max-w-md font-medium text-base leading-relaxed">
                          You have 1 free usage available. Unlock this feature to access real-time market data?
                        </p>
                        <button 
                          onClick={() => {
                            updateUser({ freeUsageCount: freeUsageCount + 1 });
                            setUnlockedFeature(true);
                          }}
                          className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl shadow-xl shadow-cyan-500/20 transition-all transform hover:scale-105 flex items-center gap-3"
                        >
                          <Zap size={20} fill="currentColor" /> UNLOCK ACCESS
                        </button>
                      </>
                    )}
                  </div>
                )}
                {!selectedSymbol ? (
                   <div className="text-center py-40 flex flex-col items-center opacity-20">
                    <Boxes size={80} className="text-blue-400 mb-6" />
                    <h2 className="text-3xl font-black text-gray-400 tracking-tighter">بانتظار تحليل مصفوفة البيانات...</h2>
                  </div>
                ) : analysis ? (
                  <div className="space-y-10">
                     {/* Matrix Header Card */}
                     <div className="bg-gradient-to-br from-[#1e2329] to-black p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:rotate-12 transition-transform">
                             <Waypoints size={36} />
                           </div>
                           <div>
                              <h2 className="text-3xl font-black text-white tracking-tighter">رادار المصفوفة (On-Chain Matrix)</h2>
                              <p className="text-gray-500 font-black text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} /> Institutional Real-time Data Flux
                              </p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-center">
                              <span className="text-[8px] text-gray-500 font-black uppercase block mb-0.5">Network Node</span>
                              <span className="text-base font-mono font-black text-emerald-400">SYNCED</span>
                           </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] pointer-events-none"></div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Liquidity Flux */}
                        <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem] shadow-xl border border-white/5">
                           <div className="flex justify-between items-center mb-8">
                              <h4 className="text-xl font-black text-cyan-400 flex items-center gap-4 tracking-tight">
                                <Droplets size={24} /> تدفقات السيولة المؤسسية
                              </h4>
                              <div className="flex flex-col items-end">
                                 <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Global Health</span>
                                 <span className="text-xl font-mono font-black text-white">%{analysis.liquidity.strength}</span>
                              </div>
                           </div>
                           <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-h-[260px]">
                              <div className="w-full h-[150px] md:h-[200px]">
                                <Sparkline values={analysis.liquidity.history} color="#06b6d4" />
                              </div>
                           </div>
                           <div className="mt-8 grid grid-cols-2 gap-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                                 <div className="flex items-center gap-2">
                                    <ArrowDownToLine size={16} className="text-emerald-400" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Inflow (24h)</span>
                                 </div>
                                 <span className="font-mono font-black text-emerald-400">+$24.2M</span>
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                                 <div className="flex items-center gap-2">
                                    <ArrowUpFromLine size={16} className="text-rose-400" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Outflow (24h)</span>
                                 </div>
                                 <span className="font-mono font-black text-rose-400">-$12.8M</span>
                              </div>
                           </div>
                        </div>

                        {/* Correlation Matrix */}
                        <div className="glass-panel p-8 rounded-[2.5rem] shadow-xl border border-white/5 flex flex-col justify-between">
                           <h4 className="text-xl font-black text-amber-400 mb-8 flex items-center gap-4 tracking-tight">
                             <Stars size={24} /> مصفوفة ارتباط الأصول
                           </h4>
                           <MatrixHeatmap />
                           <p className="text-[10px] font-bold text-gray-500 mt-6 leading-relaxed bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 italic">
                             * يتم حساب معامل الارتباط (Correlation Coefficient) بشكل لحظي بين الأصول الرئيسية لتحديد تحركات "القطيع" المؤسسية.
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Smart Wallet Alerts */}
                        <div className="glass-panel p-8 rounded-[2.5rem] shadow-xl border border-white/5">
                           <div className="flex justify-between items-center mb-6">
                              <h4 className="text-xl font-black text-amber-400 flex items-center gap-4 tracking-tight">
                                <AlertTriangle size={24} /> تنبيهات المحافظ النشطة
                              </h4>
                              <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-amber-500/20 animate-pulse">
                                Live Feed
                              </span>
                           </div>
                           <div className="space-y-4">
                              {walletAlerts.map((alert) => (
                                 <div key={alert.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-start gap-4 hover:bg-white/5 transition-colors">
                                    <div className={`p-3 rounded-xl ${
                                       alert.severity === 'high' ? 'bg-rose-500/10 text-rose-500' :
                                       alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                       'bg-blue-500/10 text-blue-500'
                                    }`}>
                                       <Activity size={18} />
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-black text-white">{alert.walletLabel}</span>
                                          <span className="text-[9px] text-gray-500">{alert.timestamp}</span>
                                       </div>
                                       <p className="text-[11px] text-gray-400 leading-relaxed font-bold">{alert.message}</p>
                                       <div className="mt-2 flex items-center gap-2">
                                          <span className={`text-[9px] px-2 py-0.5 rounded border ${
                                             alert.type === 'Accumulation' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                             alert.type === 'Dump' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                             'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                          }`}>
                                             {alert.type}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Open Interest */}
                        <div className="glass-panel p-8 rounded-[2.5rem] shadow-xl border border-white/5">
                           <div className="flex justify-between items-center mb-8">
                              <h4 className="text-xl font-black text-indigo-400 flex items-center gap-4 tracking-tight">
                                <BarChart2 size={24} /> زخم العقود (Open Interest)
                              </h4>
                              <div className="flex flex-col items-end">
                                 <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">OI Value</span>
                                 <span className="text-xl font-mono font-black text-white">${analysis.openInterest.estimatedValue}</span>
                              </div>
                           </div>
                           <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 flex items-center justify-center min-h-[200px]">
                              <div className="w-full h-[120px] md:h-[160px]">
                                <Sparkline values={analysis.openInterest.history} color="#6366f1" />
                              </div>
                           </div>
                           <div className="mt-6 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                              <p className="text-xs font-bold text-gray-300">{analysis.openInterest.sentiment}</p>
                           </div>
                        </div>

                        {/* Smart Wallets Tracking */}
                        <div className="lg:col-span-2 glass-panel p-6 rounded-[2rem] shadow-xl border border-white/5">
                           <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                              <h4 className="text-lg font-black text-emerald-400 flex items-center gap-3 tracking-tight">
                                <Landmark size={20} /> مراقبة المحافظ الذكية (Smart Wallets)
                              </h4>
                              <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
                                {(['All', 'Conservative', 'Aggressive', 'Degen'] as const).map((filter) => (
                                  <button
                                    key={filter}
                                    onClick={() => setWalletFilter(filter)}
                                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                                      walletFilter === filter 
                                        ? 'bg-emerald-500 text-white shadow-lg' 
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                                  >
                                    {filter}
                                  </button>
                                ))}
                              </div>
                           </div>
                           
                           <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                              {smartWallets
                                .filter(w => walletFilter === 'All' || w.riskProfile === walletFilter)
                                .map((wallet, idx) => (
                                  <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all group">
                                     <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black ${
                                              wallet.riskProfile === 'Degen' ? 'bg-rose-500/20 text-rose-400' :
                                              wallet.riskProfile === 'Aggressive' ? 'bg-amber-500/20 text-amber-400' :
                                              'bg-emerald-500/20 text-emerald-400'
                                           }`}>
                                              {wallet.riskProfile === 'Degen' ? <Flame size={16}/> : wallet.riskProfile === 'Aggressive' ? <Zap size={16}/> : <ShieldCheck size={16}/>}
                                           </div>
                                           <div>
                                              <h5 className="font-black text-white text-xs">{wallet.label}</h5>
                                              <span className="text-[9px] text-gray-500 font-mono">{wallet.address}</span>
                                           </div>
                                        </div>
                                        <div className="text-right">
                                           <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                              wallet.riskProfile === 'Degen' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                              wallet.riskProfile === 'Aggressive' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                           }`}>
                                              {wallet.riskProfile}
                                           </span>
                                        </div>
                                     </div>
                                     
                                     <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div className="bg-black/40 p-2 rounded-lg text-center">
                                           <span className="text-[8px] text-gray-500 uppercase block mb-0.5">Win Rate</span>
                                           <span className="text-emerald-400 font-mono font-black text-xs">{wallet.winRate}</span>
                                        </div>
                                        <div className="bg-black/40 p-2 rounded-lg text-center">
                                           <span className="text-[8px] text-gray-500 uppercase block mb-0.5">PnL</span>
                                           <span className="text-white font-mono font-black text-xs">{wallet.pnlTotal}</span>
                                        </div>
                                        <div className="bg-black/40 p-2 rounded-lg text-center">
                                           <span className="text-[8px] text-gray-500 uppercase block mb-0.5">Balance</span>
                                           <span className="text-gray-300 font-mono font-black text-xs">{wallet.balance}</span>
                                        </div>
                                     </div>

                                     <div className="space-y-1.5">
                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-1">Recent Activity</span>
                                        {wallet.recentTrades.map((trade, i) => (
                                           <div key={i} className="flex justify-between items-center text-[10px] p-1.5 rounded-md bg-black/20">
                                              <span className={`${trade.type === 'Buy' ? 'text-emerald-400' : 'text-rose-400'} font-black`}>
                                                 {trade.type} {trade.asset}
                                              </span>
                                              <span className="text-gray-400 font-mono">{trade.amount} @ {trade.price}</span>
                                              <span className="text-gray-600 text-[8px]">{trade.time}</span>
                                           </div>
                                        ))}
                                     </div>
                                  </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === 'strategies' && (
              <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-700 pb-20 text-right">
                 <div className="bg-gradient-to-br from-cyan-900/40 to-black p-8 rounded-[2rem] border border-cyan-500/20 shadow-xl relative overflow-hidden group">
                    <Workflow size={48} className="text-cyan-400 mb-4 opacity-20" />
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">مصفوفة الاستراتيجيات</h2>
                    <p className="text-gray-400 font-bold text-base max-w-3xl leading-relaxed">اختر خوارزمية التداول التي تناسب شخصيتك الاستثمارية ليقوم المحرك بتحليل الأهداف بناءً عليها.</p>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {STRATEGIES.map(s => (
                     <div key={s.id} className="glass-panel p-6 rounded-[2rem] border border-white/5 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-xl group border-t-4 border-t-cyan-500/30">
                        <div className="space-y-6">
                          <div className="flex justify-between items-start">
                             <div className="p-4 bg-cyan-600/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                               {s.id === '3' ? <Zap size={24}/> : <Layers size={24}/>}
                             </div>
                             <div className="flex flex-col items-end gap-1.5">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${s.riskLevel === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{s.riskLevel} Risk</span>
                                <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{s.timeframe} Duration</div>
                             </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter">{s.name}</h3>
                            <p className="text-gray-400 font-bold text-sm leading-relaxed">{s.description}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                             <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center shadow-inner">
                                <span className="text-[8px] text-gray-600 uppercase font-black block mb-1 tracking-widest">Win Prob.</span>
                                <span className="text-xl font-mono font-black text-emerald-400">%{s.winRate}</span>
                             </div>
                             <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center shadow-inner">
                                <span className="text-[8px] text-gray-600 uppercase font-black block mb-1 tracking-widest">Profit X</span>
                                <span className="text-xl font-mono font-black text-white">{s.profitFactor}</span>
                             </div>
                             <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center shadow-inner">
                                <span className="text-[8px] text-gray-600 uppercase font-black block mb-1 tracking-widest">Drawdown</span>
                                <span className="text-xl font-mono font-black text-rose-400">{s.maxDrawdown}</span>
                             </div>
                          </div>
                        </div>
                        
                        <button 
                           onClick={() => initiateStrategy(s)} 
                           className="mt-8 w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-[1.5rem] font-black text-sm shadow-xl transition-all border-b-4 border-cyan-900 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-3"
                        >
                           <Play size={20} fill="currentColor" /> تفعيل الخوارزمية
                        </button>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {activeTab === 'bots' && (
              <div className="max-w-6xl mx-auto">
                <TradingBotsPage 
                  isVip={isVip}
                  freeUsageCount={freeUsageCount}
                  onConsumeFreeUsage={() => {
                    if (!isVip) {
                      updateUser({ freeUsageCount: freeUsageCount + 1 });
                    }
                  }}
                  onShowSubscription={() => setShowSubscriptionModal(true)}
                />
              </div>
            )}

            {activeTab === 'community' && (
              <div className="h-full">
                <CommunityPage />
              </div>
            )}

            {activeTab === 'news' && (
              <div className="h-full">
                <NewsPage />
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="h-8 bg-[#0a0f18] border-t border-cyan-500/20 flex items-center justify-between px-6 shrink-0 z-50 text-[9px] text-gray-500 font-tech uppercase tracking-wider shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
         <div className="flex items-center gap-3">
            <span className="text-cyan-500/50">ALPHA RADAR v4.0.2</span>
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
              SYSTEM: ONLINE
            </span>
         </div>
      </footer>

      <IndicatorSettingsModal
        isOpen={showIndicatorSettings}
        onClose={() => setShowIndicatorSettings(false)}
        currentSettings={indicatorSettings}
        onSave={setIndicatorSettings}
        availableIndicators={AVAILABLE_INDICATORS}
      />
    </div>
  );
}
