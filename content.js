// Vortex Pro: Ultimate Balance Engine
// Version 4.0.0 (Global Shield + Surgical YouTube)

const GLOBAL_SELECTORS = [
  '[id^="google_ads"]', '[id^="ad-unit"]', '.ad-box', '.ad-banner', '.ad-container',
  '.sponsored-content', '.promoted-post', '.sponsored-link', '.outbrain-ad', 
  '.taboola-ad', '.ad-unit', '.ad-label', '.ad-sidebar', '.ad-placement',
  '.fixed-ad', '.sticky-ad', '.banner-wrapper', '.adsbygoogle', 
  '.iklan-atas', '.klik-disini', '#pop-under', '.ad-layer', '#floating-ad',
  '[class*="popunder"]', '[id*="popunder"]', '.m-ads', '.top-ads', '.bottom-ads',
  '.popup-container', '.modal-content', '.close-ad', '.floating-ad-close',
  'a[href*="bettogel"]', 'a[href*="arwanagaming"]', 'a[href*="katsu5"]', 'a[href*="wongsobet"]',
  'div#fixed-footer-ad', '.pop-ads', '.overlay-ads'
];

const YOUTUBE_SURGICAL_SELECTORS = [
  '.ad-showing', '.ad-interrupting', '.ytp-ad-overlay-container',
  '.ytp-ad-message-container', '.ytp-ad-player-overlay', '.ytp-ad-image-overlay',
  '.ytp-ad-skip-button', '.ytp-ad-skip-button-modern'
];

// 1. BOOT ENGINE
chrome.storage.local.get(['isEnabled', 'whitelist'], (data) => {
    const isEnabled = data.isEnabled !== false;
    const currentDomain = window.location.hostname;
    const isWhitelisted = data.whitelist?.includes(currentDomain);
    
    if (isEnabled && !isWhitelisted) {
        initUltimateBalance();
    }
});

function initUltimateBalance() {
    console.log('[Vortex Pro] Ultimate Balance Engaged');
    const isYT = window.location.host.includes('youtube.com');

    const runEngine = () => {
        if (isYT) {
            handleYouTubeSurgical();
        } else {
            handleGlobalSweep();
        }
    };

    // Fast-Loop for YouTube (100ms) for ultra-smooth skip
    // Regular-Loop for Global (1000ms) for performance
    setInterval(runEngine, isYT ? 100 : 1000);
    
    const observer = new MutationObserver(runEngine);
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

// 2. SURGICAL YOUTUBE ENGINE (Safe & Smooth)
function handleYouTubeSurgical() {
    const video = document.querySelector('video');
    const player = document.querySelector('#movie_player') || document.querySelector('.html5-video-player');
    const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button-slot');

    if (!video || !player) return;

    // Detect AD
    const isAdShowing = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');

    if (isAdShowing) {
        if (video.playbackRate !== 16) {
            video.muted = true;
            video.playbackRate = 16;
            chrome.runtime.sendMessage({ type: 'AD_BLOCKED' });
        }
        if (skipBtn) skipBtn.click();
        if (isFinite(video.duration) && video.duration > 0) video.currentTime = video.duration - 0.1;
    } else {
        if (video.playbackRate === 16) {
            video.playbackRate = 1;
            video.muted = false;
        }
    }

    // Surgical CSS hide (Safe)
    document.querySelectorAll(YOUTUBE_SURGICAL_SELECTORS.join(', ')).forEach(el => {
        el.style.display = 'none';
        el.style.opacity = '0';
    });
}

// 3. GLOBAL SWEEP ENGINE (For IDLIX, Blogs, etc.)
function handleGlobalSweep() {
    document.querySelectorAll(GLOBAL_SELECTORS.join(', ')).forEach(el => {
        if (!el.hasAttribute('data-vortex-blocked')) {
            el.setAttribute('data-vortex-blocked', 'true');
            el.style.display = 'none';
            chrome.runtime.sendMessage({ type: 'AD_BLOCKED' });
        }
    });

    // Sanitize non-YT videos
    document.querySelectorAll('video').forEach(v => {
        if (v.duration < 150 && (!v.controls || v.closest('[class*="ad"]'))) {
            v.muted = true;
            v.playbackRate = 16;
            if (isFinite(v.duration)) v.currentTime = v.duration - 0.1;
        }
    });

    // Sanitize redirects
    document.querySelectorAll('[onclick*="window.open"]').forEach(el => {
        if (!el.hasAttribute('data-vortex-sanitized')) {
            el.removeAttribute('onclick');
            el.setAttribute('data-vortex-sanitized', 'true');
        }
    });
}
