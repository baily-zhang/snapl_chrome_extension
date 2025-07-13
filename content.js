// Content script for website detection and interaction
class SnapliiExtension {
  constructor() {
    this.scrollThreshold = 300; // pixels
    this.hasShownScrollPopup = false;
    this.lastScrollY = 0;
    this.init();
  }

  init() {
    this.detectWebsite();
    this.addCashbackIndicator();
    this.trackPurchases();
    // Setup scroll listener after a small delay to ensure domain detection is complete
    setTimeout(() => {
      this.setupScrollListener();
    }, 500);
  }

  detectWebsite() {
    const domain = window.location.hostname;
    const cashbackRate = this.getCashbackRate(domain);
    
    if (cashbackRate > 0) {
      // Store domain info for scroll popup
      this.currentDomain = domain;
      this.currentRate = cashbackRate;
      
      this.showCashbackNotification(cashbackRate);
      this.sendToBackground({ type: 'CASHBACK_SITE_DETECTED', domain, rate: cashbackRate });
    }
  }

  getCashbackRate(domain) {
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
      'thebay.com': 4,
      // Test domains for any site
      'google.com': 3,
      'github.com': 2,
      'stackoverflow.com': 1.5,
      'localhost': 5
    };
    
    console.log('Checking cashback rate for domain:', domain);
    const rate = cashbackRates[domain] || 0;
    console.log('Found rate:', rate);
    return rate;
  }

  showCashbackNotification(rate) {
    // Remove existing notification
    const existing = document.getElementById('snaplii-cashback-notification');
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'snaplii-cashback-notification';
    notification.innerHTML = `
      <div class="snaplii-notification-content">
        <div class="snaplii-logo">💰 Snaplii</div>
        <div class="snaplii-message">
          Get <strong>${rate}% cashback</strong> on this site!
        </div>
        <button class="snaplii-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  addCashbackIndicator() {
    const domain = window.location.hostname;
    const rate = this.getCashbackRate(domain);
    
    if (rate > 0) {
      // Add floating cashback indicator
      const indicator = document.createElement('div');
      indicator.id = 'snaplii-cashback-indicator';
      indicator.innerHTML = `
        <div class="snaplii-indicator-content">
          <div class="snaplii-rate">${rate}%</div>
          <div class="snaplii-text">Cashback</div>
        </div>
      `;
      
      document.body.appendChild(indicator);
    }
  }

  trackPurchases() {
    // Monitor for purchase-related keywords and patterns
    const purchaseKeywords = ['checkout', 'purchase', 'buy now', 'add to cart', 'order'];
    
    document.addEventListener('click', (event) => {
      const element = event.target;
      const text = element.textContent.toLowerCase();
      
      if (purchaseKeywords.some(keyword => text.includes(keyword))) {
        this.simulateCashbackEarned();
      }
    });
  }

  simulateCashbackEarned() {
    // Simulate earning cashback for demo purposes
    const domain = window.location.hostname;
    const rate = this.getCashbackRate(domain);
    
    if (rate > 0) {
      const randomAmount = (Math.random() * 50 + 5).toFixed(2); // $5-$55
      const cashback = (randomAmount * rate / 100).toFixed(2);
      
      this.sendToBackground({ 
        type: 'CASHBACK_EARNED', 
        amount: parseFloat(cashback),
        domain,
        purchaseAmount: randomAmount
      });
      
      this.showCashbackEarned(cashback);
    }
  }

  showCashbackEarned(amount) {
    const popup = document.createElement('div');
    popup.id = 'snaplii-cashback-earned';
    popup.innerHTML = `
      <div class="snaplii-earned-content">
        <div class="snaplii-earned-title">🎉 Cashback Earned!</div>
        <div class="snaplii-earned-amount">$${amount}</div>
        <div class="snaplii-earned-subtitle">Added to your Snaplii wallet</div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 3000);
  }

  sendToBackground(message) {
    chrome.runtime.sendMessage(message).catch(error => {
      console.error('Error sending message to background:', error);
    });
  }

  setupScrollListener() {
    console.log('Setting up scroll listener. Current rate:', this.currentRate, 'Domain:', this.currentDomain);
    
    if (!this.currentRate || this.currentRate <= 0) {
      console.log('No scroll listener setup - no cashback rate detected');
      return;
    }

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
      }, 100);
    });
    
    console.log('Scroll listener setup complete for domain:', this.currentDomain);
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    console.log('Scroll detected:', currentScrollY, 'Threshold:', this.scrollThreshold, 'Has shown:', this.hasShownScrollPopup);
    
    // Only show popup if user has scrolled down significantly and hasn't seen it yet
    if (currentScrollY > this.scrollThreshold && 
        !this.hasShownScrollPopup && 
        currentScrollY > this.lastScrollY) {
      
      console.log('Showing scroll triggered popup');
      this.showScrollTriggeredPopup();
      this.hasShownScrollPopup = true;
    }
    
    this.lastScrollY = currentScrollY;
  }

  showScrollTriggeredPopup() {
    // Remove any existing scroll popup
    const existing = document.getElementById('snaplii-scroll-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'snaplii-scroll-popup';
    popup.innerHTML = `
      <div class="snaplii-scroll-content">
        <div class="snaplii-scroll-header">
          <span class="snaplii-scroll-icon">🛍️</span>
          <span class="snaplii-scroll-title">Don't forget your cashback!</span>
          <button class="snaplii-scroll-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="snaplii-scroll-body">
          <div class="snaplii-scroll-rate">${this.currentRate}% cashback</div>
          <div class="snaplii-scroll-subtitle">on ${this.currentDomain}</div>
          <div class="snaplii-scroll-cta">Shop through Snaplii to earn rewards!</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (popup.parentElement) {
        popup.classList.add('snaplii-scroll-fade-out');
        setTimeout(() => popup.remove(), 300);
      }
    }, 8000);
  }
}

// Initialize extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SnapliiExtension());
} else {
  new SnapliiExtension();
}