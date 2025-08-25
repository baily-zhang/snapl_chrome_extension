// Content script for website detection and interaction
class SnapliiExtension {
  constructor() {
    this.scrollThreshold = 300; // pixels
    this.hasShownScrollPopup = false;
    this.lastScrollY = 0;
    this.init();

  }

  init() {
    // Clear any existing Snaplii elements first
    this.clearExistingElements();

    this.detectWebsite();
    this.addCashbackIndicator();
    // Setup scroll listener after a small delay to ensure domain detection is complete
    setTimeout(() => {
      this.setupScrollListener();
    }, 500);
  }

  clearExistingElements() {
    // Remove any existing Snaplii elements to prevent conflicts
    const elementsToRemove = [
      'snaplii-cashback-notification',
      'snaplii-scroll-popup',
      'snaplii-cashback-indicator',
      'snaplii-cashback-earned'
    ];


    elementsToRemove.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
        console.log('Removed existing element:', id);
      }
    });
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
      // Focus only on Amazon and Walmart
      'walmart.ca': 2,
      'amazon.ca': 1.5,
      'amazon.com': 1.5,
      'walmart.com': 2,
      // Test domains for development
      'google.com': 3,
      'github.com': 2,
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

    // Get gift card offers for this domain
    const giftCardOffers = this.getGiftCardOffers(this.currentDomain);

    const popup = document.createElement('div');
    popup.id = 'snaplii-scroll-popup';
    popup.innerHTML = `
      <div class="snaplii-scroll-content">
        <div class="snaplii-scroll-header">
          <span class="snaplii-scroll-icon">🎁</span>
          <span class="snaplii-scroll-title">Special Gift Card Offers!</span>
          <button class="snaplii-scroll-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="snaplii-scroll-body">
          <div class="snaplii-scroll-offers">
            ${giftCardOffers.map(offer => `
              <div class="snaplii-scroll-offer">
                <div class="snaplii-offer-main">${offer.main}</div>
                <div class="snaplii-offer-subtitle">${offer.subtitle}</div>
              </div>
            `).join('')}
          </div>
          <div class="snaplii-scroll-cta">Available exclusively through Snaplii!</div>
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

  getGiftCardOffers(domain) {
    const offers = {
      'amazon.ca': [
        { main: 'Get $50 Amazon gift card for only $40', subtitle: 'Save 20% instantly on your purchase' },
        { main: 'Buy $100 gift card, get $15 bonus', subtitle: 'Extra value for bulk purchases' }
      ],
      'amazon.com': [
        { main: 'Get $50 Amazon gift card for only $40', subtitle: 'Save 20% instantly on your purchase' },
        { main: 'Buy $100 gift card, get $15 bonus', subtitle: 'Extra value for bulk purchases' }
      ],
      'walmart.ca': [
        { main: 'Get $75 Walmart gift card for only $60', subtitle: 'Save 20% on everyday essentials' },
        { main: 'Buy $150 gift card, get $25 bonus', subtitle: 'Perfect for grocery shopping' }
      ],
      'walmart.com': [
        { main: 'Get $75 Walmart gift card for only $60', subtitle: 'Save 20% on everyday essentials' },
        { main: 'Buy $150 gift card, get $25 bonus', subtitle: 'Perfect for grocery shopping' }
      ],
      // Test domains with demo gift card offers
      'github.com': [
        { main: 'Demo: Get $50 gift card for only $40', subtitle: 'This is a test offer for development' },
        { main: 'Demo: Buy $100, get $15 bonus', subtitle: 'Testing gift card functionality' }
      ],
      'google.com': [
        { main: 'Demo: Special gift card promotion', subtitle: 'Test offer - not real' },
        { main: 'Demo: Buy $75, get $10 bonus', subtitle: 'Development testing only' }
      ],
      'localhost': [
        { main: 'Local Dev: $50 for $40 gift card', subtitle: 'Development environment offer' },
        { main: 'Local Dev: Bonus gift card deals', subtitle: 'Testing purposes only' }
      ]
    };

    return offers[domain] || [
      { main: 'Special gift card offers available', subtitle: 'Check Snaplii app for details' }
    ];
  }
}

// Initialize extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SnapliiExtension());
} else {
  new SnapliiExtension();
}
