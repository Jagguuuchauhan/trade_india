// --- Global Data and Configuration ---
const FX_PAIRS = {
    'EURUSD': { name: 'Euro / US Dollar', base: 'EUR', quote: 'USD', pips: 0.0001, lotValue: 100000, marginRate: 0.01, anchorPrice: 1.0985 },
    'USDJPY': { name: 'US Dollar / Japanese Yen', base: 'USD', quote: 'JPY', pips: 0.01, lotValue: 100000, marginRate: 0.01, anchorPrice: 148.55 },
    'GBPUSD': { name: 'British Pound / US Dollar', base: 'GBP', quote: 'USD', pips: 0.0001, lotValue: 100000, marginRate: 0.01, anchorPrice: 1.2580 },
    'AUDUSD': { name: 'Australian Dollar / US Dollar', base: 'AUD', quote: 'USD', pips: 0.0001, lotValue: 100000, marginRate: 0.01, anchorPrice: 0.6540 },
    'USDCAD': { name: 'US Dollar / Canadian Dollar', base: 'USD', quote: 'CAD', pips: 0.0001, lotValue: 100000, marginRate: 0.01, anchorPrice: 1.3450 }
};

let fxPrices = {}; // Actual price used for trading/PnL (fluctuates around anchor)

let virtualBalance = 1000000; 
let portfolio = []; // Active/Pending trades
let tradeHistory = []; // Closed trades
let tradeIdCounter = 1;

// --- DEEP KNOWLEDGE LEARNING CONTENT (Kept the same) ---
const learningDetails = {
    'what-is-forex': { title: 'What is Forex? Your Global Money Playground', details: 'Imagine a giant digital marketplace where banks, companies, and governments trade different currencies...', image: 'https://images.unsplash.com/photo-1601758071855-325d2b6b55e6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'currency-pairs': { title: 'Currency Pairs: The Trading Partners', details: 'You can\'t just buy "US Dollars" in Forex; you have to buy one currency *with* another...', image: 'https://images.unsplash.com/photo-1590485966453-294025b9075e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'pips': { title: 'Pips: The Tiny Unit of Price Change', details: 'A **Pip** (Percentage in Point) is the smallest unit of movement a currency pair can make...', image: 'https://images.unsplash.com/photo-1590283603417-640b798e6c7c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'lots': { title: 'Lots (Trade Size): How Big is Your Bet?', details: 'A **Lot** is the standardized unit of volume for a Forex trade...', image: 'https://images.unsplash.com/photo-1544717305-ad17c8052d9a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
    'leverage': { title: 'Leverage: Borrowing Power (Use with Caution!)', details: 'Leverage is like a loan from your broker that lets you control a much larger trade size...', image: 'https://images.unsplash.com/photo-1554224749-0d2e82b79a0b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'sr': { title: 'Support & Resistance: Market Floors and Ceilings', details: '**Support** is a price level where the price has stopped falling and turned back up...', image: 'https://images.unsplash.com/photo-1550209219-c0c5c363dc0b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'trendlines': { title: 'Trend Lines: Mapping the Market\'s Path', details: 'A **Trend Line** is a straight line drawn on a chart to connect two or more swing highs or swing lows...', image: 'https://images.unsplash.com/photo-1611944211119-9132104337b0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'ma': { title: 'Moving Averages: Smoothing Out the Noise', details: 'A **Moving Average (MA)** is a line that shows the average closing price of a currency pair...', image: 'https://images.unsplash.com/photo-1551288258-f801657c919d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'rsi': { title: 'RSI: Is the Market Tired?', details: 'The **Relative Strength Index (RSI)** is a popular momentum indicator that shows how quickly prices have changed...', image: 'https://images.unsplash.com/photo-1582046424560-6b3a0f9a2d2f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'engulfing': { title: 'Candlestick Patterns: Engulfing (The Reversal Signal)', details: 'Candlesticks show the open, high, low, and close price for a period...', image: 'https://images.unsplash.com/photo-1507949319830-9b5030239433?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'stop-loss': { title: 'Stop Loss (SL): Your Capital\'s Best Friend', details: 'A **Stop-Loss** order is an automated instruction to your broker to immediately close your trade...', image: 'https://images.unsplash.com/photo-1620216167883-e187f5492d2f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'take-profit': { title: 'Take Profit (TP): Securing Your Winning Cash', details: 'A **Take-Profit** order is an automated instruction to close your trade when the price reaches a level...', image: 'https://images.unsplash.com/photo-1558507817-2104037803eb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    'position-sizing': { title: 'Position Sizing: The Secret to Long-Term Success', details: 'This is how you calculate the correct **Lot Size** (0.01, 0.1, 1.0) for every trade you take...', image: 'https://images.unsplash.com/photo-1596181971714-386f68579468?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
};

const economicEventDetails = {
    'fomc': { title: 'Federal Open Market Committee (FOMC) Minutes Analysis', details: 'The minutes from the last FOMC meeting revealed a stronger-than-expected hawkish stance on inflation, leading to immediate **USD strength**. Analysts predict a higher chance of a rate hike in the next quarter. Traders should monitor long-term US Treasury yields as a proxy for market sentiment.', animationText: 'Deep Dive: Fed Signals Higher Rates, USD Rallies' },
    'gdp': { title: 'UK Consumer Price Index (CPI) Data Release', details: 'The CPI data is a key measure of inflation in the UK. A reading above expectations (e.g., > 3.5%) will likely cause the Bank of England (BoE) to raise rates, strengthening **GBP**. A lower-than-expected reading will weaken the GBP. Today’s focus is on the core inflation figure, excluding energy and food.', animationText: 'Live Data Drop: UK Inflation Surprises Market, GBP Volatility Expected' },
    'nfp': { title: 'Australian Employment Change and Unemployment Rate', details: 'This high-impact report shows how many people were employed in Australia in the past month. A big increase in jobs typically strengthens the **AUD**, as it points to a healthy economy. Today’s report is crucial for the RBA\'s policy outlook, as unemployment is a primary factor in their rate decisions.', animationText: 'Real-Time Scan: AUD Jobless Claims Better Than Forecast' }
};

// --- DOM Elements ---
const tradingPlatform = document.getElementById('trading-platform');
const heroSection = document.getElementById('hero-section');
const marketSituationSection = document.getElementById('market-situation-section');
const learningCenterSection = document.getElementById('learning-center-section');
const dynamicLearningArea = document.getElementById('dynamic-learning-area'); 

const navLinks = document.querySelectorAll('.nav-link');
const currentPairTitle = document.getElementById('current-pair-title');

const virtualBalanceText = document.getElementById('virtual-balance-text');
const virtualEquityText = document.getElementById('virtual-equity-text'); 
const portfolioBody = document.getElementById('portfolio-body');
const portfolioEmptyState = document.getElementById('portfolio-empty-state');
const notificationPopup = document.getElementById('notification-popup');
const chartSearchInput = document.getElementById('chart-search-input');
const searchResults = document.getElementById('search-results');
const forexPairSelect = document.getElementById('forex-pair-select');
const priceQuote = document.getElementById('price-quote');
const marginRequiredQuote = document.getElementById('margin-required-quote'); 
const limitPriceInput = document.getElementById('limit-price');
const marketOrderBtn = document.getElementById('market-order-btn');
const limitOrderBtn = document.getElementById('limit-order-btn');

// NEW Price Sync Elements
const manualAnchorPriceInput = document.getElementById('manual-anchor-price');
const syncPriceBtn = document.getElementById('sync-price-btn');

// Learning Modal
const modal = document.getElementById('content-modal');
const modalTitle = document.getElementById('modal-title');
const modalDetails = document.getElementById('modal-details');
const modalImageContainer = document.getElementById('modal-image-container');
const modalCloseButton = modal.querySelector('.close-button');

// History Elements
const showHistoryBtn = document.getElementById('show-history-btn');
const hideHistoryBtn = document.getElementById('hide-history-btn');
const tradeHistorySection = document.getElementById('trade-history-section');
const portfolioSection = document.getElementById('portfolio-section');
const historyBody = document.getElementById('history-body');
const historyEmptyState = document.getElementById('history-empty-state');

// Market Event Modal
const marketDetailModal = document.getElementById('market-detail-modal');
const marketModalTitle = document.getElementById('market-modal-title');
const marketModalDetails = document.getElementById('market-modal-details');
const marketModalAnimationArea = document.getElementById('market-modal-animation-area');
const marketModalCloseButton = marketDetailModal.querySelector('.close-button');


// --- Utility Functions ---

function showNotification(message, isError = false) {
    notificationPopup.textContent = message;
    notificationPopup.classList.remove('error', 'success');
    if (isError) {
        notificationPopup.classList.add('error');
    } else {
        notificationPopup.classList.add('success'); 
    }
    notificationPopup.classList.add('show');
    
    setTimeout(() => {
        notificationPopup.classList.remove('show');
    }, 3000);
}

function formatPrice(pair, price) {
    const pips = FX_PAIRS[pair]?.pips || 0.0001;
    let decimals = pips.toString().split('.')[1]?.length || 4;
    if (pips === 0.01) decimals = 2; // JPY pairs
    return price.toFixed(decimals);
}

// --- Price Simulation & Sync Logic (FIXED/REWORKED) ---

function initializeAnchorPrices() {
    for (const pair in FX_PAIRS) {
        fxPrices[pair] = FX_PAIRS[pair].anchorPrice;
    }
}

function simulatePriceChange() {
    for (const pair in fxPrices) {
        const anchorPrice = FX_PAIRS[pair].anchorPrice;
        const pips = FX_PAIRS[pair].pips;
        
        // Simulates fluctuation of up to 10 pips around the anchor price
        const maxPipsChange = 10 * pips; 
        const randomFluctuation = (Math.random() * maxPipsChange * 2) - maxPipsChange; 
        
        // The current price is the anchor plus a small, random fluctuation
        let newPrice = anchorPrice + randomFluctuation;
        
        // Ensure new price is kept within the bounds of the anchor for stability
        newPrice = Math.min(anchorPrice + maxPipsChange * 1.5, Math.max(anchorPrice - maxPipsChange * 1.5, newPrice));
        
        fxPrices[pair] = parseFloat(formatPrice(pair, newPrice));
    }
    updatePortfolioDisplay();
    updatePriceQuote();
    checkLimitOrders();
    updateHomeFXWatch(); 
    updateMarketOverview(); 
}

// Handler for the Manual Sync Button
function handlePriceSync() {
    const pair = forexPairSelect.value;
    if (!pair) {
        showNotification('Please select a currency pair first.', true);
        return;
    }

    const newAnchorPrice = parseFloat(manualAnchorPriceInput.value);
    const pairData = FX_PAIRS[pair];

    // Simple validation
    if (isNaN(newAnchorPrice) || newAnchorPrice <= 0) {
        showNotification('Invalid price. Please enter a valid number.', true);
        return;
    }

    // Set the new anchor price and update the current price
    pairData.anchorPrice = newAnchorPrice;
    fxPrices[pair] = newAnchorPrice; 
    
    // Update the UI immediately
    updatePriceQuote();
    
    // Update the placeholder/step for the new price
    manualAnchorPriceInput.placeholder = `Sync Price (e.g., ${formatPrice(pair, newAnchorPrice)})`;
    manualAnchorPriceInput.step = pairData.pips;
    
    // Reset the manual input field
    manualAnchorPriceInput.value = '';
    
    showNotification(`Virtual Price for ${pair} synchronized to ${formatPrice(pair, newAnchorPrice)}. P&L will now be calculated from this point.`);
}

setInterval(simulatePriceChange, 1000); 
setInterval(updateMarketOverview, 5000); 

function updateHomeFXWatch() {
    const fxWatchList = document.getElementById('fx-watch-list');
    if (!fxWatchList) return;

    let tempContainer = document.createElement('div');
    fxWatchList.innerHTML = '';
    
    for (const pair in fxPrices) {
        // Use the simulated price for the home screen now
        const price = fxPrices[pair];
        const pips = FX_PAIRS[pair].pips;
        
        // Use a simple, larger random change for the home screen visual only
        const visualChange = (Math.random() * (0.0050 * 0.5) - 0.0050 * 0.25) * 10; 
        const visualNewPrice = price + visualChange;

        const formattedPrice = formatPrice(pair, price); // Use the actual trading price
        const formattedChange = visualChange.toFixed(pips === 0.01 ? 2 : 4);
        const changeClass = visualChange >= 0 ? 'price-up' : 'price-down';
        
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${pair}: </span>
            <span class="${changeClass}">${formattedPrice} (${visualChange >= 0 ? '+' : ''}${formattedChange})</span>
            <i class="fas fa-chart-line"></i>
        `;
        
        listItem.dataset.pair = pair; 
        
        // Simple visual pulse for the home screen
        listItem.classList.add(visualChange >= 0 ? 'price-flash-up' : 'price-flash-down');
        
        fxWatchList.appendChild(listItem);
    }
    
    // Add event listeners for the new "Go to Trading Chart" button/list items
    document.querySelectorAll('#fx-watch-list li').forEach(li => {
        li.addEventListener('click', function() {
            const pair = this.dataset.pair;
            if (pair) {
                document.getElementById('nav-virtual-trading').click();
                selectChartPair(pair);
            }
        });
    });
    
    document.querySelectorAll('.go-to-chart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('nav-virtual-trading').click();
            selectChartPair(this.dataset.pair);
        });
    });
}

function updateMarketOverview() {
    // NASDAQ Update (logic remains the same)
    const nasdaqIndex = document.getElementById('nasdaq-index');
    const nasdaqChange = document.getElementById('nasdaq-change');
    const nasdaqCard = nasdaqIndex.closest('.summary-card');
    
    const randomNasdaqChange = (Math.random() * 0.5 - 0.25); 
    const isUp = randomNasdaqChange >= 0;
    
    const newNasdaqIndex = parseFloat(nasdaqIndex.textContent.replace(/,/g, '')) * (1 + randomNasdaqChange / 100);
    const pointChange = Math.abs(newNasdaqIndex - parseFloat(nasdaqIndex.textContent.replace(/,/g, '')));

    nasdaqIndex.textContent = newNasdaqIndex.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    nasdaqChange.textContent = `${isUp ? '+' : ''}${randomNasdaqChange.toFixed(2)}% (${isUp ? '+' : ''}${pointChange.toFixed(2)})`;
    nasdaqChange.className = `market-change ${isUp ? 'price-up' : 'price-down'}`;

    nasdaqCard.classList.remove('market-pulse-up', 'market-pulse-down');
    void nasdaqCard.offsetWidth; 
    nasdaqCard.classList.add(isUp ? 'market-pulse-up' : 'market-pulse-down');
}


// --- TradingView Chart Logic ---
let chartWidget;

function initializeChart(symbol = "FX_IDC:EURUSD") {
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    
    const container = document.getElementById("tradingview_chart");
    if (container) {
        container.innerHTML = '';
    }
    
    let displaySymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
    currentPairTitle.textContent = FX_PAIRS[displaySymbol] ? FX_PAIRS[displaySymbol].name : displaySymbol;

    if (typeof TradingView !== 'undefined') {
        chartWidget = new TradingView.widget({
            "width": "100%",
            "height": 600,
            "symbol": symbol, 
            "interval": "60", 
            "timezone": "Etc/UTC",
            "theme": theme,
            "style": "1",
            "locale": "en",
            "toolbar_bg": theme === 'dark' ? "#1f2733" : "#f1f3f6", 
            "enable_publishing": false,
            "withdateranges": true,
            "hide_side_toolbar": false,
            "allow_symbol_change": true,
            "container_id": "tradingview_chart"
        });
    }
}

// Chart Search logic
function selectChartPair(symbol) {
    chartSearchInput.value = symbol;
    searchResults.style.display = 'none';
    
    let fullSymbol = FX_PAIRS[symbol] ? `FX_IDC:${symbol}` : symbol;
    
    if (FX_PAIRS[symbol]) {
        forexPairSelect.value = symbol;
        priceQuote.classList.remove('hidden');
        marginRequiredQuote.classList.remove('hidden');
        
        // Set up the manual price sync input for the selected pair
        const pairData = FX_PAIRS[symbol];
        manualAnchorPriceInput.step = pairData.pips;
        manualAnchorPriceInput.placeholder = `Sync Price (e.g., ${formatPrice(symbol, fxPrices[symbol])})`;
        
        updatePriceQuote();
    } else {
        forexPairSelect.value = ''; 
        priceQuote.textContent = `Chart for: ${symbol}`;
        priceQuote.classList.remove('hidden');
        marginRequiredQuote.classList.add('hidden');
        // Hide the manual price sync for non-tradable assets
        document.getElementById('manual-price-sync').classList.add('hidden');
    }
    
    initializeChart(fullSymbol);
}

chartSearchInput.addEventListener('input', function() {
    const query = this.value.toUpperCase();
    searchResults.innerHTML = '';
    
    if (query.length < 1) {
        searchResults.style.display = 'none';
        return;
    }
    
    const mockSuggestions = [
        'EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCAD', // FX Pairs
        'AAPL', 'GOOGL', 'MSFT', // Stocks
        'XAUUSD', 'BTCUSD', // Commodities/Crypto
    ].filter(s => s.includes(query)).slice(0, 5);
    
    if (mockSuggestions.length > 0) {
        mockSuggestions.forEach(symbol => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.textContent = symbol;
            resultItem.addEventListener('click', () => selectChartPair(symbol));
            searchResults.appendChild(resultItem);
        });
        searchResults.style.display = 'block';
    } else {
        searchResults.style.display = 'none';
    }
});

document.addEventListener('click', function(e) {
    if (!chartSearchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});


// --- Virtual Trading Logic ---

function calculateEquity() {
    let unrealizedPnL = 0;
    portfolio.filter(p => p.status === 'Open').forEach(position => {
        unrealizedPnL += calculatePnL(position, fxPrices[position.pair]);
    });
    return virtualBalance + unrealizedPnL;
}

function updatePriceQuote() {
    const pair = forexPairSelect.value;
    const pairData = FX_PAIRS[pair];

    if (!pair || !pairData) {
        priceQuote.textContent = "Please select an FX Pair to trade.";
        marginRequiredQuote.classList.add('hidden');
        document.getElementById('manual-price-sync').classList.add('hidden');
        return;
    }

    document.getElementById('manual-price-sync').classList.remove('hidden');

    // Get the current simulated price
    const price = fxPrices[pair] || 'N/A';
    const formattedPrice = price !== 'N/A' ? formatPrice(pair, price) : 'N/A';
    priceQuote.textContent = `Current Price: ${pair} @ ${formattedPrice}`;

    // Update the decimal steps on the limit/SL/TP inputs
    const decimalCount = pairData.pips.toString().split('.')[1]?.length || 4;
    const stepValue = pairData.pips; 
    limitPriceInput.step = stepValue;
    document.getElementById('stop-loss-price').step = stepValue;
    document.getElementById('take-profit-price').step = stepValue;
    
    // Update Margin Quote (FIXED: The margin calculation must use the current price)
    const lotSize = parseFloat(document.getElementById('lot-size').value) || 0;
    
    // Margin = Lot Size * Contract Size * Price * Margin Rate (1/Leverage)
    const marginRequired = lotSize * pairData.lotValue * price * pairData.marginRate;
    
    marginRequiredQuote.textContent = `Margin Required: $${marginRequired.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    marginRequiredQuote.classList.remove('hidden');
}

forexPairSelect.addEventListener('change', updatePriceQuote);
document.getElementById('lot-size').addEventListener('input', updatePriceQuote);
forexPairSelect.addEventListener('change', () => {
    // Also update chart when changing dropdown
    initializeChart(`FX_IDC:${forexPairSelect.value}`);
    
    // Update manual sync input based on new pair's anchor
    const selectedPair = forexPairSelect.value;
    if (selectedPair && FX_PAIRS[selectedPair]) {
        manualAnchorPriceInput.placeholder = `Sync Price (e.g., ${formatPrice(selectedPair, FX_PAIRS[selectedPair].anchorPrice)})`;
    }
}); 
syncPriceBtn.addEventListener('click', handlePriceSync); // NEW handler for sync button

function setupOrderTypeToggle() {
    marketOrderBtn.addEventListener('click', () => {
        marketOrderBtn.classList.add('active');
        limitOrderBtn.classList.remove('active');
        limitPriceInput.classList.add('hidden');
    });

    limitOrderBtn.addEventListener('click', () => {
        limitOrderBtn.classList.add('active');
        marketOrderBtn.classList.remove('active');
        limitPriceInput.classList.remove('hidden');
    });
}

function calculatePnL(position, currentPrice) {
    const { type, size, entryPrice, pair } = position;
    const pairData = FX_PAIRS[pair];
    
    // Pips Change calculation is correct
    const pipsChange = type === 'BUY' ? (currentPrice - entryPrice) : (entryPrice - currentPrice);
    
    // Determine the value of a single pip for the base currency (which is usually $10 for a standard lot)
    // For USD-quoted pairs (like EURUSD, GBPUSD, AUDUSD), the pip value is fixed at $10 per standard lot.
    // For JPY pairs (like USDJPY), the value is more complex: 10 * size * (1 / currentPrice) * currentPrice
    
    // Simpler method used in most virtual platforms: 
    // Pip Value per Lot = Lot Value (100000) * Pip Size (0.0001) = 10 (for USD quoted pairs)
    // For USDJPY (Quote is JPY), the value is typically also fixed at $10 for a standard lot.
    
    // Pip value (in quote currency) per lot = 100,000 * pips
    // e.g. 100,000 * 0.0001 = 10 (USD)
    // e.g. 100,000 * 0.01 = 1,000 (JPY)
    
    let pipsValueInUSD;
    
    if (pairData.quote === 'USD') {
        pipsValueInUSD = 10; // $10 per standard lot for USD-quoted pairs
    } else if (pairData.quote === 'JPY') {
        // For JPY pairs, $10 * (1 / currentPrice) * price of a single unit of quote (JPY) - which simplifies to 10
        // We'll use the fixed rate for simplicity in a virtual environment
        pipsValueInUSD = 10; 
    } else {
        // For other quote currencies, we'd need a cross-rate (e.g., EURCAD PnL needs EURUSD rate)
        // Since we only trade USD/JPY/GBP/AUD/CAD and assume fixed $10 pips for simplicity
        pipsValueInUSD = 10; 
    }
    
    // PnL in USD = (Pips Change / Pip Size) * Pip Value per Standard Lot * Lot Size (in standard lots)
    const pnlUSD = (pipsChange / pairData.pips) * pipsValueInUSD * size;

    return pnlUSD;
}

function executeTrade(type) {
    const pair = forexPairSelect.value;
    const lotSize = parseFloat(document.getElementById('lot-size').value);
    const stopLossPrice = document.getElementById('stop-loss-price').value ? parseFloat(document.getElementById('stop-loss-price').value) : null;
    const takeProfitPrice = document.getElementById('take-profit-price').value ? parseFloat(document.getElementById('take-profit-price').value) : null;
    const isLimitOrder = limitOrderBtn.classList.contains('active');
    
    const pairData = FX_PAIRS[pair];
    let entryPrice = fxPrices[pair];
    let executionType = 'Market';

    // 1. Validation
    if (!pairData) {
        showNotification('Invalid currency pair selected.', true);
        return;
    }
    if (!lotSize || lotSize < 0.01) {
        showNotification('Invalid Lot Size. Minimum is 0.01 (Micro Lot).', true);
        return;
    }
    
    // Price Validation based on pips
    const priceValidator = (price) => {
        const decimals = pairData.pips.toString().split('.')[1]?.length || 4;
        return (parseFloat(price).toFixed(decimals) === price.toString());
    };

    if (isLimitOrder) {
        entryPrice = parseFloat(limitPriceInput.value);
        executionType = 'Limit';
        if (isNaN(entryPrice) || entryPrice <= 0 || !priceValidator(entryPrice)) {
            showNotification(`Invalid Limit Price format. Must use ${pairData.pips === 0.01 ? '2' : '4'} decimal places.`, true);
            return;
        }
        if ((type === 'BUY' && entryPrice >= fxPrices[pair]) || (type === 'SELL' && entryPrice <= fxPrices[pair])) {
            showNotification(`${type} Limit must be set ${type === 'BUY' ? 'BELOW' : 'ABOVE'} the current market price.`, true);
            return;
        }
    } else {
        // Market order: ensure market price is valid
        if (isNaN(entryPrice) || entryPrice <= 0) {
            showNotification('Current market price is not available. Please sync the price first.', true);
            return;
        }
    }
    
    // Stop Loss / Take Profit validation
    if (stopLossPrice && !priceValidator(stopLossPrice)) {
        showNotification(`Invalid Stop Loss Price format. Must use ${pairData.pips === 0.01 ? '2' : '4'} decimal places.`, true);
        return;
    }
    if (takeProfitPrice && !priceValidator(takeProfitPrice)) {
        showNotification(`Invalid Take Profit Price format. Must use ${pairData.pips === 0.01 ? '2' : '4'} decimal places.`, true);
        return;
    }
    
    
    // Simple margin calculation and check
    const marginRequired = lotSize * pairData.lotValue * entryPrice * pairData.marginRate;
    
    // Only check margin if it's a market order or the pending order has a margin reserve requirement
    if (virtualBalance - portfolio.filter(p => p.status === 'Open' || p.status === 'Pending').reduce((sum, p) => sum + p.margin, 0) - marginRequired < 0) {
        showNotification('Insufficient virtual margin/balance. Require approx $' + marginRequired.toFixed(2), true);
        return;
    }
    
    // 2. Add to Portfolio & Deduct Margin
    const newPosition = {
        id: tradeIdCounter++,
        pair: pair,
        type: type,
        size: lotSize,
        entryPrice: entryPrice,
        sl: stopLossPrice,
        tp: takeProfitPrice,
        status: executionType === 'Limit' ? 'Pending' : 'Open',
        margin: marginRequired, // Store margin
        openTime: new Date().toLocaleTimeString(),
        closeTime: null,
        pnl: 0 
    };

    portfolio.push(newPosition);
    
    if (newPosition.status === 'Open') {
        // NOTE: We're not "deducting" from balance, but using the margin to calculate equity.
        // For a simple virtual platform, the margin is simply part of the equity calculation.
    }
    
    updateVirtualBalanceDisplay();
    updatePortfolioDisplay();
    
    // 3. Notification and Reset
    showNotification(`${type} ${executionType} Order placed for ${pair} @ ${formatPrice(pair, entryPrice)}!`);
    
    // Optional: Reset form fields
    document.getElementById('lot-size').value = 0.1;
    document.getElementById('stop-loss-price').value = '';
    document.getElementById('take-profit-price').value = '';
    if (isLimitOrder) {
        document.getElementById('limit-price').value = '';
        marketOrderBtn.click();
    }
    updatePriceQuote(); // Re-calculate margin with default lot size
}

document.getElementById('buy-btn').addEventListener('click', () => executeTrade('BUY'));
document.getElementById('sell-btn').addEventListener('click', () => executeTrade('SELL'));

function closePosition(id) {
    const index = portfolio.findIndex(p => p.id === id && (p.status === 'Open' || p.status === 'Pending'));
    if (index === -1) return;
    
    const position = portfolio[index];
    
    if (position.status === 'Pending') {
        // Cancel a pending order
        portfolio.splice(index, 1);
        showNotification(`Pending Order Cancelled: ${position.pair}`);
    } else {
        // Close an open position
        const currentPrice = fxPrices[position.pair];
        const pnl = calculatePnL(position, currentPrice);

        // 1. Add P&L to Balance
        virtualBalance += pnl;

        // 2. Move to History
        position.pnl = pnl;
        position.closePrice = currentPrice;
        position.closeTime = new Date().toLocaleTimeString();
        tradeHistory.push(position);
        
        // 3. Remove from Portfolio
        portfolio.splice(index, 1);
        
        const pnlMessage = pnl >= 0 ? `+ $${pnl.toFixed(2)} Profit` : `- $${Math.abs(pnl).toFixed(2)} Loss`;
        showNotification(`Trade Closed: ${position.pair} with ${pnlMessage}`);
    }
    
    updateVirtualBalanceDisplay();
    updatePortfolioDisplay();
    updateHistoryDisplay();
}

function checkLimitOrders() {
    let tradesToClose = [];

    // Check Open positions for SL/TP
    portfolio.filter(p => p.status === 'Open').forEach(position => {
        const currentPrice = fxPrices[position.pair];
        let closed = false;

        if (position.tp) {
            if (position.type === 'BUY' && currentPrice >= position.tp) { closed = true; tradesToClose.push({ id: position.id, reason: 'Take Profit Hit', pnl: calculatePnL(position, currentPrice), closePrice: currentPrice }); } 
            else if (position.type === 'SELL' && currentPrice <= position.tp) { closed = true; tradesToClose.push({ id: position.id, reason: 'Take Profit Hit', pnl: calculatePnL(position, currentPrice), closePrice: currentPrice }); }
        }
        if (!closed && position.sl) {
            if (position.type === 'BUY' && currentPrice <= position.sl) { closed = true; tradesToClose.push({ id: position.id, reason: 'Stop Loss Hit', pnl: calculatePnL(position, currentPrice), closePrice: currentPrice }); } 
            else if (position.type === 'SELL' && currentPrice >= position.sl) { closed = true; tradesToClose.push({ id: position.id, reason: 'Stop Loss Hit', pnl: calculatePnL(position, currentPrice), closePrice: currentPrice }); }
        }
    });

    // Execute Pending Limit Orders
    portfolio.filter(p => p.status === 'Pending').forEach(order => {
        const currentPrice = fxPrices[order.pair];
        let execute = false;

        if (order.type === 'BUY' && currentPrice <= order.entryPrice) { execute = true; } 
        else if (order.type === 'SELL' && currentPrice >= order.entryPrice) { execute = true; }

        if (execute) {
            order.status = 'Open';
            showNotification(`🚀 Limit Order Executed: ${order.type} ${order.pair} @ ${formatPrice(order.pair, order.entryPrice)}`);
        }
    });
    
    tradesToClose.forEach(trade => {
        const index = portfolio.findIndex(p => p.id === trade.id);
        if (index !== -1) {
            const position = portfolio[index];
            
            // Add P&L to Balance
            virtualBalance += trade.pnl;
            
            // Move to History
            position.pnl = trade.pnl;
            position.closePrice = trade.closePrice;
            position.closeTime = new Date().toLocaleTimeString();
            tradeHistory.push(position);
            
            portfolio.splice(index, 1);
            
            const pnlMessage = trade.pnl >= 0 ? `+ $${trade.pnl.toFixed(2)} Profit` : `- $${Math.abs(trade.pnl).toFixed(2)} Loss`;
            showNotification(`Auto Closed: ${position.pair} (${trade.reason}) with ${pnlMessage}`);
        }
    });

    if (tradesToClose.length > 0 || portfolio.some(p => p.status === 'Open')) {
        updateVirtualBalanceDisplay();
        updatePortfolioDisplay();
        updateHistoryDisplay();
    }
}


// --- Portfolio and Balance Display ---

function updateVirtualBalanceDisplay() {
    const equity = calculateEquity();
    virtualBalanceText.textContent = `Balance: $${virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    virtualEquityText.textContent = `Equity: $${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updatePortfolioDisplay() {
    portfolioBody.innerHTML = '';
    
    const openPositions = portfolio.filter(p => p.status === 'Open');
    const pendingOrders = portfolio.filter(p => p.status === 'Pending');
    
    portfolioEmptyState.style.display = (openPositions.length + pendingOrders.length) === 0 ? 'block' : 'none';

    // Display Open Positions
    openPositions.forEach(position => {
        const currentPrice = fxPrices[position.pair] || position.entryPrice;
        const pnl = calculatePnL(position, currentPrice);
        
        const pnlClass = pnl >= 0 ? 'profit' : 'loss';
        const formattedPnl = pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        const row = document.createElement('tr');
        if (row.dataset.lastPnl && Math.abs(parseFloat(row.dataset.lastPnl) - pnl) > 0.01) {
             row.classList.add(pnl > parseFloat(row.dataset.lastPnl) ? 'price-flash-up' : 'price-flash-down');
        }
        row.dataset.lastPnl = pnl.toFixed(2);
        
        row.innerHTML = `
            <td>${position.pair}</td>
            <td class="${position.type === 'BUY' ? 'profit' : 'loss'}">${position.type}</td>
            <td>${position.size.toFixed(2)}</td>
            <td>${formatPrice(position.pair, position.entryPrice)}</td>
            <td>${formatPrice(position.pair, currentPrice)}</td>
            <td class="${pnlClass}">${pnl >= 0 ? '+' : ''}${formattedPnl}</td>
            <td><button class="close-position-btn" data-id="${position.id}">Close</button></td>
        `;
        portfolioBody.appendChild(row);
    });
    
    // Display Pending Orders
    pendingOrders.forEach(order => {
        const row = document.createElement('tr');
        row.style.opacity = 0.6; // Visual cue for pending
        row.innerHTML = `
            <td>${order.pair}</td>
            <td style="color: var(--secondary);">${order.type} Limit</td>
            <td>${order.size.toFixed(2)}</td>
            <td>${formatPrice(order.pair, order.entryPrice)}</td>
            <td>*Pending*</td>
            <td>Margin: $${order.margin.toFixed(2)}</td>
            <td><button class="close-position-btn" data-id="${order.id}" style="background-color: var(--sell);">Cancel</button></td>
        `;
        portfolioBody.appendChild(row);
    });
    
    document.querySelectorAll('.close-position-btn').forEach(button => {
        button.addEventListener('click', function() {
            closePosition(parseInt(this.dataset.id));
        });
    });
}

function updateHistoryDisplay() {
    historyBody.innerHTML = '';
    
    historyEmptyState.style.display = tradeHistory.length === 0 ? 'block' : 'none';
    
    // Display history in reverse chronological order
    tradeHistory.slice().reverse().forEach(trade => {
        const pnlClass = trade.pnl >= 0 ? 'profit' : 'loss';
        const formattedPnl = trade.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${trade.id}</td>
            <td>${trade.pair}</td>
            <td class="${trade.type === 'BUY' ? 'profit' : 'loss'}">${trade.type}</td>
            <td>${formatPrice(trade.pair, trade.entryPrice)} (${trade.openTime})</td>
            <td>${formatPrice(trade.pair, trade.closePrice)} (${trade.closeTime})</td>
            <td class="${pnlClass}">${trade.pnl >= 0 ? '+' : ''}${formattedPnl}</td>
        `;
        historyBody.appendChild(row);
    });
}

// History Toggle Logic
showHistoryBtn.addEventListener('click', () => {
    portfolioSection.classList.add('hidden');
    tradeHistorySection.classList.remove('hidden');
});

hideHistoryBtn.addEventListener('click', () => {
    tradeHistorySection.classList.add('hidden');
    portfolioSection.classList.remove('hidden');
});


// --- Learning Center Logic (Modal and Filtering) ---
function setupLearningCards() {
    document.querySelectorAll('.content-card').forEach(card => {
        card.addEventListener('click', function() {
            const contentId = this.dataset.id;
            const detail = learningDetails[contentId];
            
            if (detail) {
                modalTitle.textContent = detail.title;
                modalDetails.textContent = detail.details;

                modalImageContainer.innerHTML = '';
                if (detail.image) {
                    const img = document.createElement('img');
                    img.src = detail.image;
                    img.alt = detail.title;
                    modalImageContainer.appendChild(img);
                }
                
                modal.style.display = "block";
            } else {
                showNotification('Content not yet available.', true);
            }
        });
    });
    
    modalCloseButton.onclick = function() { modal.style.display = "none"; }
    window.onclick = function(event) { 
        if (event.target === modal) { modal.style.display = "none"; }
        if (event.target === marketDetailModal) { marketDetailModal.style.display = "none"; }
    }
    
    // Feature box filters: Only show content related to the clicked box (remains the same)
    document.querySelectorAll('.feature-box').forEach(box => {
        box.addEventListener('click', function() {
            const filter = this.dataset.filter;
            dynamicLearningArea.classList.remove('hidden'); 

            document.querySelectorAll('#dynamic-learning-area > *').forEach(el => {
                const contentType = el.dataset.contentType;
                if (!contentType || contentType === filter) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });
            learningCenterSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// --- Market Events Logic ---
function setupMarketEvents() {
    document.querySelectorAll('#economic-calendar-list li').forEach(li => {
        li.addEventListener('click', function() {
            const eventId = this.dataset.eventId;
            const detail = economicEventDetails[eventId];

            if (detail) {
                marketModalTitle.textContent = detail.title;
                marketModalDetails.textContent = detail.details;
                marketDetailModal.style.display = "block";
                
                marketModalAnimationArea.innerHTML = `<i class="fas fa-spinner fa-spin fa-2x"></i> Scanning live feed...`;
                setTimeout(() => {
                    marketModalAnimationArea.innerHTML = `
                        <i class="fas fa-satellite-dish fa-2x"></i>
                        <p>${detail.animationText}</p>
                    `;
                    marketModalAnimationArea.style.border = '2px solid var(--buy)';
                }, 1500);
            }
        });
    });
    
    marketModalCloseButton.onclick = function() { 
        marketDetailModal.style.display = "none"; 
        marketModalAnimationArea.style.border = 'none'; 
    }
}


// --- NAVIGATION LOGIC ---
function hideAllSections() {
    heroSection.classList.add('hidden-section');
    tradingPlatform.classList.add('hidden-section');
    marketSituationSection.classList.add('hidden-section');
    learningCenterSection.classList.add('hidden-section');
}

function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            navLinks.forEach(l => l.classList.remove('active-nav'));
            this.classList.add('active-nav');

            hideAllSections();

            if (targetElement) {
                targetElement.classList.remove('hidden-section');
            }

            if (targetId === 'trading-platform') {
                const selectedPair = forexPairSelect.value || 'EURUSD';
                initializeChart(`FX_IDC:${selectedPair}`);
                tradeHistorySection.classList.add('hidden');
                portfolioSection.classList.remove('hidden');
                updatePriceQuote(); // Ensure price and margin are updated on section switch
            } else if (targetId === 'learning-center-section') {
                dynamicLearningArea.classList.add('hidden');
            }

            targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const heroButton = document.getElementById('hero-button');
    heroButton.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('nav-virtual-trading').click(); 
    });

    // Initial state
    document.getElementById('nav-home').classList.add('active-nav');
    tradingPlatform.classList.add('hidden-section');
    marketSituationSection.classList.add('hidden-section');
    learningCenterSection.classList.add('hidden-section');
}


// --- Initialization on DOM Load ---

document.addEventListener('DOMContentLoaded', function() {
    initializeAnchorPrices(); // FIRST STEP: Set initial prices
    
    setupNavigation();
    setupOrderTypeToggle();
    updateVirtualBalanceDisplay();
    updatePortfolioDisplay();
    updateHistoryDisplay(); 
    setupLearningCards();
    setupMarketEvents(); 
    updatePriceQuote(); // Initial price/margin display
    updateHomeFXWatch(); 
    updateMarketOverview();

    // Dark Mode Toggle
    document.getElementById('dark-mode-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
        
        if (!tradingPlatform.classList.contains('hidden-section')) {
            initializeChart(chartSearchInput.value || `FX_IDC:${forexPairSelect.value}`);
        }
    });
    
    // Logout
    document.getElementById('nav-logout').addEventListener('click', () => {
    showNotification("Logged out successfully!", false);
    
    // Direct redirect
    window.location.href = "login.html";
  
    });

    // Initialize TradingView Ticker Tape (must be run after TradingView script is loaded)
    if (typeof TradingView !== 'undefined') {
        new TradingView.widget(
            {
                "proName": "TradingView",
                "colorTheme": "dark",
                "istransparent": true,
                "displayMode": "adaptive",
                "locale": "en",
                "symbols": [
                    { "description": "EUR/USD", "proName": "FX_IDC:EURUSD" },
                    { "description": "S&P 500", "proName": "FX_IDC:SPX" },
                    { "description": "Gold", "proName": "FX_IDC:XAUUSD" },
                    { "description": "Bitcoin", "proName": "BINANCE:BTCUSDT" }
                ],
                "container_id": "ticker-tape-widget"
            }
        );
    }
});

