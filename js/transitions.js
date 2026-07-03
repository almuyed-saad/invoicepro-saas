// ============================================
// SMOOTH PAGE TRANSITIONS — WORKING VERSION
// ============================================

(function() {
  
  // ===== 1. PAGE ENTER ANIMATION =====
  function animatePageIn() {
    // Remove any lingering overlays
    document.querySelectorAll('.page-transition-overlay').forEach(el => el.remove());
    
    // Reset body styles
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    document.body.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    
    // Trigger entrance after a tiny delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
      });
    });
  }

  // ===== 2. CREATE TRANSITION OVERLAY =====
  function showOverlay() {
    // Check if overlay already exists
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary, #F8FAFC);
        z-index: 99999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
      `;
      
      // Spinner
      const spinner = document.createElement('div');
      spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid #E2E8F0;
        border-top: 3px solid #4F46E5;
        animation: spin 0.8s linear infinite;
      `;
      overlay.appendChild(spinner);
      
      // Loading text
      const text = document.createElement('span');
      text.textContent = 'Loading...';
      text.style.cssText = `
        color: var(--text-secondary, #475569);
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.05em;
      `;
      overlay.appendChild(text);
      
      document.body.appendChild(overlay);
    }
    
    // Show overlay
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
    });
    
    return overlay;
  }

  // ===== 3. HIDE OVERLAY =====
  function hideOverlay() {
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => overlay.remove(), 500);
    }
  }

  // ===== 4. HANDLE INTERNAL LINK CLICKS =====
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    
    if (!link) return;
    if (!link.href) return;
    if (link.target === '_blank') return;
    if (link.href.startsWith('#')) return;
    if (link.href.startsWith('mailto:')) return;
    if (link.href.startsWith('tel:')) return;
    
    // Check internal link
    const currentOrigin = window.location.origin;
    let linkOrigin;
    try {
      linkOrigin = new URL(link.href).origin;
    } catch {
      return;
    }
    
    if (currentOrigin !== linkOrigin) return;
    
    // Check if HTML page
    const url = new URL(link.href);
    const path = url.pathname;
    if (path.includes('.') && !path.endsWith('.html') && !path.endsWith('/')) return;
    
    e.preventDefault();
    const targetUrl = link.href;
    
    // Show overlay
    showOverlay();
    
    // Fade out body
    document.body.style.transition = 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(-10px)';
    
    // Navigate
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 500);
  });

  // ===== 5. INITIALIZE =====
  function init() {
    // Remove overlays
    document.querySelectorAll('.page-transition-overlay').forEach(el => el.remove());
    
    // Set initial state
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    document.body.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    
    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
      });
    });
    
    console.log('✅ Page transitions initialized!');
  }

  // ===== 6. HANDLE BACK/FORWARD =====
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      document.querySelectorAll('.page-transition-overlay').forEach(el => el.remove());
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.style.opacity = '1';
          document.body.style.transform = 'translateY(0)';
        });
      });
    }
  });

  // ===== 7. RUN =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();