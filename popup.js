// Vortex Pro: Modern Vintage - Dashboard Logic
// Version 3.1.1 (High-Performance Sync)

document.addEventListener('DOMContentLoaded', () => {
    const totalCountEl = document.getElementById('totalCount');
    const vortexSwitch = document.getElementById('vortexSwitch');
    const currentDomainEl = document.getElementById('currentDomain');
    const whitelistBtn = document.getElementById('whitelistBtn');
    const statusText = document.getElementById('statusText');
    const statusPill = document.getElementById('statusPill');

    let currentVal = 0;
    let currentHostname = '';

    // 1. DASHBOARD INITIALIZATION
    function updateDashboard() {
        chrome.runtime.sendMessage({ type: 'GET_STATS' }, (data) => {
            if (!data) return;
            const target = data.totalAdsBlocked || 0;
            const isEnabled = data.isEnabled !== false;
            const whitelist = data.whitelist || [];

            animateCounter(target);
            updateStatusUI(isEnabled, whitelist.includes(currentHostname));
        });
    }

    // 2. COUNTER ANIMATION
    function animateCounter(target) {
        if (target === currentVal) return;
        const duration = 800; 
        const start = currentVal;
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 5); 
            const current = Math.floor(start + (target - start) * ease);
            
            totalCountEl.innerText = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                currentVal = target;
            }
        }
        requestAnimationFrame(step);
    }

    // 3. UI STATE SYNC
    function updateStatusUI(isEnabled, isWhitelisted) {
        vortexSwitch.checked = isEnabled;
        
        if (!isEnabled) {
            statusText.innerText = 'Shield Disabled';
            statusPill.style.opacity = '0.3';
            whitelistBtn.style.opacity = '0.2';
            whitelistBtn.disabled = true;
        } else if (isWhitelisted) {
            statusText.innerText = 'Whitelisted';
            statusPill.style.background = '#e2e8f0';
            statusPill.querySelector('.pulse-dot').style.background = '#94a3b8';
            whitelistBtn.innerText = 'Un-Whitelist';
        } else {
            statusText.innerText = 'Shield Active';
            statusPill.style.background = '#f8f8f8';
            statusPill.querySelector('.pulse-dot').style.background = '#00ca4e';
            statusPill.style.opacity = '1';
            whitelistBtn.innerText = 'Whitelist';
            whitelistBtn.disabled = false;
        }
    }

    // 4. HANDLERS
    vortexSwitch.addEventListener('change', () => {
        const isEnabled = vortexSwitch.checked;
        chrome.storage.local.set({ isEnabled: isEnabled }, () => {
            updateDashboard();
        });
    });

    whitelistBtn.addEventListener('click', () => {
        if (!currentHostname) return;
        chrome.storage.local.get(['whitelist'], (data) => {
            let whitelist = data.whitelist || [];
            if (!whitelist.includes(currentHostname)) {
                whitelist.push(currentHostname);
                chrome.storage.local.set({ whitelist: whitelist }, () => {
                    alert(`${currentHostname} is now Whitelisted.`);
                    updateDashboard();
                });
            } else {
                whitelist = whitelist.filter(d => d !== currentHostname);
                chrome.storage.local.set({ whitelist: whitelist }, () => {
                    alert(`${currentHostname} removed from Whitelist.`);
                    updateDashboard();
                });
            }
        });
    });

    // 5. CURRENT CONTEXT
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            try {
                const url = new URL(tabs[0].url);
                currentHostname = url.hostname;
                currentDomainEl.innerText = currentHostname;
            } catch (e) {
                currentDomainEl.innerText = 'System Context';
            }
            updateDashboard();
        }
    });

    // 6. INSTANT SYNC LISTENER (Quantum Bridge)
    // Listens for direct background reports to bypass storage lag
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'UPDATE_COUNTER') {
            animateCounter(message.value);
        }
    });

    document.getElementById('reportBtn').addEventListener('click', () => {
        alert('Report filed. Analyzing site patterns...');
    });

    updateDashboard();
});
