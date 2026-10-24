/**
 * HtoEAU × Burnley FC Partnership - Matchday Programme Redesign
 * Precise Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initFanCodeCopy();
  initSmoothScroll();
  initScrollReveal();
  initNewsletterForm();
  initBackToTop();
  initProductButtons();
});

/**
 * 1. Fan Code Copy Action
 * Copies CLARET15 to clipboard.
 * Changes button text to 'COPIED.' for exactly 1.5 seconds, then restores 'COPY CODE'.
 * No toasts, popups, or bouncing overlays.
 */
function initFanCodeCopy() {
  const btnCopy = document.getElementById('btn-copy-code');
  if (!btnCopy) return;

  const codeToCopy = 'CLARET15';
  let resetTimer = null;

  btnCopy.addEventListener('click', async () => {
    let success = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(codeToCopy);
        success = true;
      } catch (err) {
        success = fallbackCopyText(codeToCopy);
      }
    } else {
      success = fallbackCopyText(codeToCopy);
    }

    if (success) {
      btnCopy.textContent = 'COPIED.';
      btnCopy.setAttribute('aria-label', 'Code CLARET15 copied to clipboard');

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        btnCopy.textContent = 'COPY CODE';
        btnCopy.setAttribute('aria-label', 'Copy Fan Code CLARET15');
      }, 1500);
    }
  });
}

function fallbackCopyText(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  } catch (e) {
    return false;
  }
}

/**
 * 2. Smooth Scrolling for Anchor Links with Header Offset
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const header = document.getElementById('site-header');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });
}

/**
 * 3. Restrained IntersectionObserver Reveal (One per section)
 */
function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 4. Newsletter Form Handling
 */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-email');
  const message = document.getElementById('newsletter-message');
  if (!form || !input) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!emailRegex.test(email)) {
      input.focus();
      input.style.borderColor = '#ef4444';
      setTimeout(() => {
        input.style.borderColor = '';
      }, 2000);
      return;
    }

    input.value = '';
    if (message) {
      message.classList.add('active');
    }
  });
}

/**
 * 5. Back to Top Button
 */
function initBackToTop() {
  const backBtn = document.getElementById('back-to-top');
  if (!backBtn) return;

  const toggleBackBtn = () => {
    if (window.scrollY > 400) {
      backBtn.style.opacity = '1';
      backBtn.style.pointerEvents = 'auto';
    } else {
      backBtn.style.opacity = '0';
      backBtn.style.pointerEvents = 'none';
    }
  };

  window.addEventListener('scroll', toggleBackBtn, { passive: true });
  toggleBackBtn();

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 6. Product CTA Clicks
 */
function initProductButtons() {
  const productBtns = document.querySelectorAll('.btn-product-view');
  productBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productName = btn.getAttribute('data-product') || 'Product';
      // Smooth scroll to fan offer or open product shop link
      const fanOffer = document.getElementById('fan-offer');
      if (fanOffer) {
        const header = document.getElementById('site-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = fanOffer.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}
