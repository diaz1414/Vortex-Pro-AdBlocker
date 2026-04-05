// Vortex Pro: Modern Vintage - Intelligence Service Worker
// Version 3.1.1 (High-Performance Engine)

let memCounter = 0;
let lastSynced = 0;

// 1. INITIALIZE & RESTORE
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['totalAdsBlocked', 'isEnabled', 'whitelist'], (result) => {
    memCounter = result.totalAdsBlocked || 0;
    if (result.isEnabled === undefined) chrome.storage.local.set({ isEnabled: true });
    if (result.whitelist === undefined) chrome.storage.local.set({ whitelist: [] });
  });

  chrome.declarativeNetRequest.setExtensionActionOptions({
    displayActionCountAsBadgeText: true
  });
});

// Restore on start
chrome.storage.local.get(['totalAdsBlocked'], (data) => {
    memCounter = data.totalAdsBlocked || 0;
});

// 2. BROADCAST ENGINE
function broadcastCount() {
    chrome.runtime.sendMessage({ type: 'UPDATE_COUNTER', value: memCounter }).catch(() => {
        // No popup open, ignore error
    });
    
    // Low frequency sync to storage (every 2.5 seconds or 50 blocks)
    const now = Date.now();
    if (now - lastSynced > 2500) {
        chrome.storage.local.set({ totalAdsBlocked: memCounter });
        lastSynced = now;
    }
}

// 3. NETWORK TRACKER (Unpacked Mode Only)
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(() => {
        chrome.storage.local.get(['isEnabled'], (data) => {
            if (data.isEnabled !== false) {
                memCounter++;
                broadcastCount();
            }
        });
    });
}

// 4. MESSAGE LISTENER
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AD_BLOCKED') {
      memCounter++;
      broadcastCount();
  }
  
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['isEnabled', 'whitelist'], (result) => {
      sendResponse({
          isEnabled: result.isEnabled,
          totalAdsBlocked: memCounter,
          whitelist: result.whitelist
      });
    });
    return true; 
  }
});
