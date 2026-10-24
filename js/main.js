/**
 * HtoEAU × Burnley FC Partnership - Matchday Programme Redesign
 * Precise Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initFanOfferForm();
  initPromoModal();
  initSmoothScroll();
  initScrollReveal();
  initNewsletterForm();
  initBackToTop();
  initProductButtons();
});

/**
 * 1. Fan Offer Email Form Handler
 * Validates the email address via native constraint validation.
 * Opens the promotional modal when valid.
 * Structured to cleanly decouple submission handling from modal presentation.
 */
function initFanOfferForm() {
  const form = document.getElementById('fan-offer-form');
  const emailInput = document.getElementById('fan-offer-email');
  if (!form || !emailInput) return;

  form.addEventListener('submit', (e) => {
    // 1. Prevent default page reload
    e.preventDefault();

    // 2. Check native validity (format and required)
    if (!emailInput.checkValidity()) {
      // 3. Allow native validation bubble/message to display; do not open modal
      emailInput.reportValidity();
      return;
    }

    const emailValue = emailInput.value.trim();

    // =========================================================================
    // FUTURE BACKEND INTEGRATION POINT:
    // Connect backend API, newsletter provider, or dynamic discount generation
    // here (e.g. await submitFanOfferEmail(emailValue);).
    // Note: Do not store email in localStorage/cookies, and do not pretend email
    // has been registered or verified.
    // =========================================================================

    // 4. Open promotional modal upon valid email entry
    openPromoModal();
  });
}

/**
 * 2. Promotional Modal Management
 * Handles accessible opening, closing, keyboard trapping, body scroll locking,
 * and independent discount code copying.
 */
let lastFocusedElement = null;

function openPromoModal() {
  const modal = document.getElementById('promo-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  if (!modal) return;

  // Store current active element to restore focus on close
  lastFocusedElement = document.activeElement;

  // Reveal modal and lock background scrolling
  modal.removeAttribute('hidden');
  modal.classList.add('is-open');
  document.body.classList.add('modal-open');

  // Move keyboard focus inside modal
  if (closeBtn) {
    closeBtn.focus();
  }
}

function closePromoModal() {
  const modal = document.getElementById('promo-modal');
  if (!modal || modal.hasAttribute('hidden')) return;

  modal.classList.remove('is-open');
  modal.setAttribute('hidden', '');
  document.body.classList.remove('modal-open');

  // Restore focus to the GET CODE button (or previous trigger)
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  } else {
    const btnGetCode = document.getElementById('btn-get-code');
    if (btnGetCode) btnGetCode.focus();
  }
}

function initPromoModal() {
  const modal = document.getElementById('promo-modal');
  const dialog = document.getElementById('promo-modal-dialog');
  const closeBtn = document.getElementById('modal-close-btn');
  const copyBtn = document.getElementById('btn-modal-copy-code');
  if (!modal) return;

  // Close modal via close button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closePromoModal();
    });
  }

  // Close modal when clicking outside the dialog content (on backdrop)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePromoModal();
    }
  });

  // Handle keyboard events (Escape to close, Tab trapping)
  document.addEventListener('keydown', (e) => {
    if (modal.hasAttribute('hidden')) return;

    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closePromoModal();
      return;
    }

    if (e.key === 'Tab') {
      trapModalFocus(e, dialog || modal);
    }
  });

  // Modal Discount Code Copy Action
  if (copyBtn) {
    const codeToCopy = 'FAN-N6L75R';
    let resetTimer = null;

    copyBtn.addEventListener('click', async () => {
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
        copyBtn.textContent = 'COPIED.';
        copyBtn.setAttribute('aria-label', `Code ${codeToCopy} copied to clipboard`);

        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          copyBtn.textContent = 'COPY CODE';
          copyBtn.setAttribute('aria-label', `Copy discount code ${codeToCopy}`);
        }, 1500);
      }
    });
  }
}

/**
 * Traps Tab and Shift+Tab keyboard focus within the modal dialog.
 */
function trapModalFocus(e, container) {
  const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = Array.from(container.querySelectorAll(focusableSelector)).filter(
    el => el.offsetParent !== null
  );

  if (focusables.length === 0) return;

  const firstEl = focusables[0];
  const lastEl = focusables[focusables.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    }
  } else {
    if (document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  }
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
