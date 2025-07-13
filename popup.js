// Popup functionality
document.addEventListener('DOMContentLoaded', async () => {
  // Load stored cashback data
  loadCashbackData();
  
  // Get current tab info
  getCurrentTabInfo();
  
  // Generate QR code
  generateQRCode();
});

async function loadCashbackData() {
  try {
    const result = await chrome.storage.local.get(['totalCashback', 'transactions']);
    const totalCashback = result.totalCashback || 0;
    document.getElementById('totalCashback').textContent = `$${totalCashback.toFixed(2)}`;
  } catch (error) {
    console.error('Error loading cashback data:', error);
  }
}

async function getCurrentTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    // Update site name
    document.getElementById('siteName').textContent = domain;
    
    // Get and display favicon
    const faviconElement = document.getElementById('siteFavicon');
    
    // Try to use the tab's favicon first, then fallback to favicon service
    let faviconUrl = tab.favIconUrl;
    if (!faviconUrl || faviconUrl === '') {
      faviconUrl = getFaviconUrl(tab.url, domain);
    }
    
    if (faviconUrl) {
      faviconElement.src = faviconUrl;
      faviconElement.style.display = 'block';
      
      // Handle favicon load error - fallback to favicon service
      faviconElement.onerror = () => {
        const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        if (faviconElement.src !== fallbackUrl) {
          faviconElement.src = fallbackUrl;
        } else {
          faviconElement.style.display = 'none';
        }
      };
    }
    
    // Check if site has cashback offers
    const cashbackRate = getCashbackRate(domain);
    if (cashbackRate > 0) {
      const rateElement = document.getElementById('cashbackRate');
      rateElement.textContent = `${cashbackRate}%`;
      rateElement.style.display = 'block';
    }
  } catch (error) {
    console.error('Error getting tab info:', error);
    document.getElementById('siteName').textContent = 'Unknown site';
  }
}

function getFaviconUrl(tabUrl, domain) {
  try {
    const url = new URL(tabUrl);
    
    // Try multiple favicon sources in order of preference
    const faviconSources = [
      `${url.protocol}//${url.hostname}/favicon.ico`,
      `${url.protocol}//${url.hostname}/favicon.png`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      `https://favicon.yandex.net/favicon/${domain}`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`
    ];
    
    // Return the Google favicon service as primary option (most reliable)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (error) {
    console.error('Error getting favicon URL:', error);
    return null;
  }
}

function getCashbackRate(domain) {
  // Mock cashback rates for demo purposes
  const cashbackRates = {
    'walmart.ca': 2,
    'gap.ca': 5,
    'oldnavy.ca': 4,
    'bostenpizza.com': 3,
    'swisschalet.com': 2.5,
    'uber.com': 1,
    'doordash.com': 3,
    'airbnb.ca': 4,
    'amazon.ca': 1.5,
    'bestbuy.ca': 2,
    'canadiantire.ca': 3,
    'hudson.ca': 6,
    'thebay.com': 4
  };
  
  return cashbackRates[domain] || 0;
}

function generateQRCode() {
  // For demo purposes, we'll create a simple QR code placeholder
  // In production, this would generate actual QR codes
  const qrElement = document.getElementById('qrCode');
  
  // Create a simple visual QR code pattern
  qrElement.innerHTML = `
    <div style="width: 100%; height: 100%; display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr); gap: 1px;">
      ${Array(64).fill().map((_, i) => 
        `<div style="background: ${Math.random() > 0.5 ? '#000' : '#fff'}; width: 100%; height: 100%;"></div>`
      ).join('')}
    </div>
  `;
}