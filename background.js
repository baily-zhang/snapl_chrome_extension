// Background service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CASHBACK_SITE_DETECTED':
      handleCashbackSiteDetected(message);
      break;
    case 'CASHBACK_EARNED':
      handleCashbackEarned(message);
      break;
  }
});

async function handleCashbackSiteDetected(message) {
  console.log(`Cashback site detected: ${message.domain} - ${message.rate}%`);
  
  // Store site detection for analytics
  const siteVisits = await chrome.storage.local.get(['siteVisits']) || { siteVisits: {} };
  const visits = siteVisits.siteVisits || {};
  visits[message.domain] = (visits[message.domain] || 0) + 1;
  
  await chrome.storage.local.set({ siteVisits: visits });
}

async function handleCashbackEarned(message) {
  console.log(`Cashback earned: $${message.amount} from ${message.domain}`);
  
  // Get current total cashback
  const result = await chrome.storage.local.get(['totalCashback', 'transactions']);
  const currentTotal = result.totalCashback || 0;
  const transactions = result.transactions || [];
  
  // Add new transaction
  const newTransaction = {
    id: Date.now(),
    domain: message.domain,
    amount: message.amount,
    purchaseAmount: message.purchaseAmount,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString()
  };
  
  transactions.unshift(newTransaction);
  
  // Update total
  const newTotal = currentTotal + message.amount;
  
  // Save to storage
  await chrome.storage.local.set({
    totalCashback: newTotal,
    transactions: transactions.slice(0, 50) // Keep last 50 transactions
  });
  
  // Show badge with new total
  chrome.action.setBadgeText({
    text: `$${newTotal.toFixed(0)}`
  });
  
  chrome.action.setBadgeBackgroundColor({
    color: '#4ade80'
  });
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Snaplii Extension installed');
  
  // Initialize storage with demo data
  const result = await chrome.storage.local.get(['totalCashback']);
  if (!result.totalCashback) {
    await chrome.storage.local.set({
      totalCashback: 127.45, // Demo starting amount
      transactions: [
        {
          id: Date.now() - 86400000,
          domain: 'walmart.ca',
          amount: 3.25,
          purchaseAmount: 162.50,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          date: new Date(Date.now() - 86400000).toLocaleDateString()
        },
        {
          id: Date.now() - 172800000,
          domain: 'gap.ca',
          amount: 12.50,
          purchaseAmount: 250.00,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          date: new Date(Date.now() - 172800000).toLocaleDateString()
        }
      ]
    });
  }
  
  // Set initial badge
  const totalCashback = result.totalCashback || 127.45;
  chrome.action.setBadgeText({
    text: `$${totalCashback.toFixed(0)}`
  });
  
  chrome.action.setBadgeBackgroundColor({
    color: '#4ade80'
  });
});