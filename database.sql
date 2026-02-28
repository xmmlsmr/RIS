-- Database Schema for Alpha Radar AI
-- Import this file into your MySQL database

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    role ENUM('user', 'admin', 'vip') DEFAULT 'user',
    joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    free_usage_count INT DEFAULT 0,
    vip_expiry DATETIME,
    balance DECIMAL(15, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS strategies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    indicators JSON,
    timeframe VARCHAR(20),
    risk_level ENUM('Low', 'Medium', 'High'),
    win_rate DECIMAL(5, 2),
    profit_factor DECIMAL(5, 2),
    max_drawdown VARCHAR(20),
    avg_duration VARCHAR(50),
    complexity ENUM('Beginner', 'Intermediate', 'Professional'),
    indicator_logic TEXT,
    best_market_condition VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS trading_bots (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    strategy_name VARCHAR(100),
    market ENUM('Spot', 'Futures'),
    exchange VARCHAR(50) DEFAULT 'Binance',
    status ENUM('active', 'inactive', 'paused') DEFAULT 'inactive',
    performance JSON,
    config JSON,
    advanced_config JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS smart_wallets (
    address VARCHAR(100) PRIMARY KEY,
    label VARCHAR(100),
    balance VARCHAR(50),
    pnl_total VARCHAR(50),
    win_rate VARCHAR(20),
    last_activity VARCHAR(50),
    risk_profile ENUM('Conservative', 'Aggressive', 'Degen'),
    recent_trades JSON
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    wallet_address VARCHAR(100),
    wallet_label VARCHAR(100),
    type VARCHAR(50),
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    severity ENUM('low', 'medium', 'high', 'info', 'warning', 'critical'),
    FOREIGN KEY (wallet_address) REFERENCES smart_wallets(address) ON DELETE SET NULL
);

-- Insert Sample Data

INSERT INTO users (id, name, email, role, joined_date, free_usage_count) VALUES
('1', 'Commander', 'user@example.com', 'admin', '2024-01-01 00:00:00', 100);

INSERT INTO strategies (id, name, description, indicators, timeframe, risk_level, win_rate, profit_factor, max_drawdown, avg_duration, complexity, indicator_logic, best_market_condition) VALUES
('1', 'RSI Breakout', 'Detects oversold/overbought conditions with momentum confirmation.', '["RSI", "Volume"]', '1h', 'Medium', 68.00, 1.80, '12%', '14h', 'Intermediate', 'RSI(14) breakout logic', 'Trending'),
('2', 'Golden Cross Institutional', 'Analyzes major moving average crossovers (50/200) for trend inception.', '["SMA 50", "SMA 200"]', '4h', 'Low', 75.00, 2.40, '8%', '3d', 'Professional', 'Golden Cross (50/200)', 'Bullish');

INSERT INTO smart_wallets (address, label, balance, pnl_total, win_rate, last_activity, risk_profile) VALUES
('0x71C765...d897', 'Whale Master Alpha', '$84,500,000', '+$18.4M', '88%', '1m ago', 'Aggressive');
