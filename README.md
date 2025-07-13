# Snaplii Browser Extension - Interview Demo

A local Chrome extension for Snaplii that provides cashback tracking, website detection, and QR code functionality.

## Features

- **💰 Cashback Tracking**: Displays total earned cashback and tracks transactions
- **🌐 Website Detection**: Automatically detects partner websites and shows available cashback rates
- **📱 QR Code Display**: Shows QR codes for scanning with the Snaplii mobile app
- **🔔 Real-time Notifications**: Alerts users when they visit cashback-eligible sites
- **📊 Purchase Simulation**: Demonstrates cashback earning when interacting with purchase buttons

## Installation (Local Development)

1. Clone or download this extension
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Supported Demo Sites

The extension includes demo cashback rates for:
- Walmart Canada (2%)
- Gap Canada (5%) 
- Old Navy Canada (4%)
- Boston Pizza (3%)
- Swiss Chalet (2.5%)
- Uber (1%)
- DoorDash (3%)
- Airbnb Canada (4%)
- Amazon Canada (1.5%)
- Best Buy Canada (2%)
- Canadian Tire (3%)
- Hudson's Bay (4%)

## Usage

1. **View Cashback**: Click the extension icon to see your total cashback and current site info
2. **Website Detection**: Visit any supported site to see cashback notifications
3. **Earn Cashback**: Click purchase-related buttons to simulate earning cashback
4. **QR Code**: Use the QR code in the popup for mobile app integration

## Technical Details

- **Manifest V3** compatible
- Uses Chrome Storage API for data persistence
- Content scripts for website interaction
- Service worker for background processing
- Real-time badge updates showing cashback total

## Files Structure

- `manifest.json` - Extension configuration
- `popup.html/js` - Extension popup interface
- `content.js` - Website interaction and detection
- `background.js` - Service worker for data management
- `styles.css` - Styling for notifications and indicators

## Interview Demo Features

This extension demonstrates:
- Browser extension development skills
- Chrome Extension APIs usage
- Real-time data tracking and storage
- User interface design
- Website interaction and DOM manipulation
- Local development without app store submission