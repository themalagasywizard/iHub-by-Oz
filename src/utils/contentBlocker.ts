// Content blocker utility functions
const blockAds = () => {
  // Block common ad elements
  const adSelectors = [
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="google-analytics.com"]',
    'iframe[src*="googleadservices.com"]',
    'div[class*="ad-"]',
    'div[class*="ads-"]',
    'div[id*="ad-"]',
    'div[id*="ads-"]',
    'ins.adsbygoogle',
    '[class*="sponsored"]',
    '[id*="sponsored"]',
    'iframe[src*="nexusbloom.xyz"]',
    'a[href*="nexusbloom.xyz"]',
    'iframe[src*="clickid"]',
    'a[href*="clickid"]',
    // Video player specific selectors
    'div[class*="player-ads"]',
    'div[class*="video-ad"]',
    '.overlay-ad',
    '#player-advertising',
    '[class*="preroll"]',
    '[class*="midroll"]',
    '[id*="adContainer"]',
    // Additional overlay and popup selectors
    '[class*="overlay"]',
    '[class*="popup"]',
    '[id*="overlay"]',
    '[id*="popup"]'
  ];

  const removeAds = () => {
    adSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.remove();
      });
    });
  };

  // Run initially and observe DOM changes
  removeAds();
  const observer = new MutationObserver(removeAds);
  observer.observe(document.body, { childList: true, subtree: true });
};

// Enhanced redirect blocking
const blockRedirects = () => {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  const originalAssign = window.location.assign;
  const originalReplace = window.location.replace;

  // Block all redirects except for trusted domains
  const isBlockedDomain = (url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.origin);
      const trustedDomains = [
        'api.themoviedb.org',
        'vidsrc.me',
        'image.tmdb.org'
      ];
      return !trustedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return true; // Block invalid URLs
    }
  };

  // Override pushState
  history.pushState = function(...args) {
    const newUrl = args[2]?.toString();
    if (newUrl && !isBlockedDomain(newUrl)) {
      originalPushState.apply(this, args);
    } else {
      console.warn('Blocked redirect attempt:', newUrl);
    }
  };

  // Override replaceState
  history.replaceState = function(...args) {
    const newUrl = args[2]?.toString();
    if (newUrl && !isBlockedDomain(newUrl)) {
      originalReplaceState.apply(this, args);
    } else {
      console.warn('Blocked replace attempt:', newUrl);
    }
  };

  // Override location.assign
  window.location.assign = function(url: string) {
    if (!isBlockedDomain(url)) {
      originalAssign.call(window.location, url);
    } else {
      console.warn('Blocked assign attempt:', url);
    }
  };

  // Override location.replace
  window.location.replace = function(url: string) {
    if (!isBlockedDomain(url)) {
      originalReplace.call(window.location, url);
    } else {
      console.warn('Blocked replace attempt:', url);
    }
  };

  // Block all clicks site-wide
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Check if the click is within an iframe
    if (target.closest('iframe')) {
      event.stopPropagation();
      return;
    }

    // Block any link clicks to untrusted domains
    const link = target.closest('a');
    if (link && isBlockedDomain(link.href)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Blocked link click:', link.href);
    }
  }, true);

  // Block all form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    if (form && isBlockedDomain(form.action)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Blocked form submission:', form.action);
    }
  }, true);

  // Block window.open
  const originalOpen = window.open;
  window.open = function(...args) {
    const url = args[0]?.toString();
    if (url && !isBlockedDomain(url)) {
      return originalOpen.apply(this, args);
    }
    console.warn('Blocked popup:', url);
    return null;
  };

  // Prevent default on all iframe interactions
  document.addEventListener('mousedown', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('iframe')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Block postMessage redirects
  window.addEventListener('message', (event) => {
    if (isBlockedDomain(event.origin)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Blocked postMessage from:', event.origin);
    }
  }, true);

  // Prevent iframe navigation
  const iframes = document.getElementsByTagName('iframe');
  for (let i = 0; i < iframes.length; i++) {
    try {
      const frame = iframes[i];
      frame.addEventListener('load', () => {
        try {
          const frameDoc = frame.contentDocument || frame.contentWindow?.document;
          if (frameDoc) {
            frameDoc.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
            }, true);
          }
        } catch (e) {
          // Cross-origin restrictions may prevent access
        }
      });
    } catch (e) {
      // Cross-origin restrictions may prevent access
    }
  }
};

// Initialize all blockers
export const initializeBlockers = () => {
  blockAds();
  blockRedirects();
  console.log('Enhanced content blockers initialized');
};