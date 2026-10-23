/* ═════════════════════════════════════════════════════════════════
   CRUMBLY — REDESIGN INTERACTIVE LOGIC (2026)
   Handles Nav Transparency, Reviews Filter & Submission,
   Product Customizer, Lightbox, Cart Persistence & Shopify Sync
   ═════════════════════════════════════════════════════════════════ */

(() => {
  // ── 1. GLOBAL CART MANAGEMENT (Shared via localStorage) ──────────
  const STORAGE_KEY = 'crumbly_cart_items';
  let cart = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) cart = JSON.parse(saved);
  } catch (_) { cart = []; }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (_) { }
    updateCartUI();
  }

  window.CrumblyCart = {
    getCart: () => cart,
    addItem: (variantId, qty, price, name, packName, image) => {
      const existing = cart.find(item => item.variantId === variantId);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({ variantId, qty, price, name, packName, image });
      }
      saveCart();
      window.CrumblyCart.openCartModal();
    },
    removeItem: (index) => {
      cart.splice(index, 1);
      saveCart();
    },
    updateQty: (index, delta) => {
      if (!cart[index]) return;
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      saveCart();
    },
    checkout: () => {
      if (cart.length === 0) return;
      const domain = 'crumblyblr.myshopify.com';
      const itemsStr = cart.map(item => `${item.variantId}:${item.qty}`).join(',');
      window.location.href = `https://${domain}/cart/${itemsStr}`;
    },
    openCartModal: () => {
      const modal = document.getElementById('cart-modal');
      if (modal) {
        renderCartModal();
        modal.classList.add('is-visible');
      }
    },
    closeCartModal: () => {
      const modal = document.getElementById('cart-modal');
      if (modal) modal.classList.remove('is-visible');
    }
  };

  function updateCartUI() {
    const floatingCart = document.getElementById('floating-cart');
    const fcCount = document.getElementById('fc-count');
    const fcTotal = document.getElementById('fc-total');
    
    if (floatingCart && fcCount && fcTotal) {
      const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
      const totalValue = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
      
      if (totalItems > 0) {
        fcCount.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''} added`;
        fcTotal.textContent = `₹${totalValue}`;
        floatingCart.classList.add('is-visible');
      } else {
        floatingCart.classList.remove('is-visible');
      }
    }
    renderCartModal();
  }

  function renderCartModal() {
    const itemsEl = document.getElementById('cart-modal-items');
    const totalEl = document.getElementById('cart-modal-total');
    if (!itemsEl || !totalEl) return;

    itemsEl.innerHTML = '';
    const totalValue = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    totalEl.textContent = `₹${totalValue}`;

    if (cart.length === 0) {
      itemsEl.innerHTML = '<p style="text-align:center; padding:30px; color:#5E3B24;">Your cart is empty. Pick a delicious flavour to start!</p>';
      return;
    }

    cart.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #FAF5EE; gap:12px;';
      row.innerHTML = `
        <div style="flex:1;">
          <div style="font-weight:800; font-size:14px; color:#261408;">${item.name}</div>
          <div style="font-size:12px; color:#5E3B24;">${item.packName || ''} · ₹${item.price} each</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="cart-btn-mod" data-cart-delta="-1" data-idx="${idx}" style="width:28px; height:28px; border-radius:50%; border:1px solid #D5BEA7; background:#FFF; cursor:pointer; font-weight:bold;">−</button>
          <span style="font-weight:800; min-width:20px; text-align:center;">${item.qty}</span>
          <button type="button" class="cart-btn-mod" data-cart-delta="1" data-idx="${idx}" style="width:28px; height:28px; border-radius:50%; border:1px solid #D5BEA7; background:#FFF; cursor:pointer; font-weight:bold;">+</button>
          <button type="button" class="cart-btn-del" data-idx="${idx}" style="background:none; border:none; cursor:pointer; font-size:16px; margin-left:6px;" title="Remove">🗑️</button>
        </div>
      `;
      itemsEl.appendChild(row);
    });

    itemsEl.querySelectorAll('.cart-btn-mod').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = +btn.dataset.idx;
        const delta = +btn.dataset.cartDelta;
        window.CrumblyCart.updateQty(idx, delta);
      });
    });

    itemsEl.querySelectorAll('.cart-btn-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = +btn.dataset.idx;
        window.CrumblyCart.removeItem(idx);
      });
    });
  }

  // ── 2. NAVBAR TRANSPARENCY OVER HERO ──────────────────────────────
  const nav = document.querySelector('.nav');
  const heroSec = document.querySelector('.hero-fullbleed') || document.querySelector('.hero');
  
  if (nav && heroSec) {
    document.body.classList.add('has-hero');
    function checkNavScroll() {
      const heroBottom = heroSec.getBoundingClientRect().bottom;
      if (heroBottom > 80) {
        nav.classList.add('nav--transparent');
        nav.classList.remove('nav--scrolled');
      } else {
        nav.classList.remove('nav--transparent');
        nav.classList.add('nav--scrolled');
      }
    }
    window.addEventListener('scroll', checkNavScroll, { passive: true });
    checkNavScroll();
  }

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileClose = document.querySelector('.mobile-menu-close');
  
  if (mobileToggle && mobileOverlay) {
    mobileToggle.addEventListener('click', () => {
      mobileOverlay.classList.add('is-open');
      mobileOverlay.setAttribute('aria-hidden', 'false');
    });
  }
  if (mobileClose && mobileOverlay) {
    mobileClose.addEventListener('click', () => {
      mobileOverlay.classList.remove('is-open');
      mobileOverlay.setAttribute('aria-hidden', 'true');
    });
  }
  if (mobileOverlay) {
    mobileOverlay.querySelectorAll('.mobile-menu-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileOverlay.classList.remove('is-open');
        mobileOverlay.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // ── 3. REVIEWS SYSTEM (FILTERS & SUBMISSION) ───────────────────────
  const reviewCards = document.querySelectorAll('.snacker-review-card');
  const filterBtns = document.querySelectorAll('.reviews-filter-btn');

  if (filterBtns.length > 0 && reviewCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;

        reviewCards.forEach(card => {
          if (filter === 'all') {
            card.style.display = 'flex';
          } else if (filter === 'verified') {
            card.style.display = card.dataset.verified === 'true' ? 'flex' : 'none';
          } else {
            card.style.display = card.dataset.flavour === filter ? 'flex' : 'none';
          }
        });
      });
    });
  }

  // Write Review Modal Logic
  const writeReviewBtn = document.getElementById('open-write-review-btn');
  const reviewModal = document.getElementById('write-review-modal');
  const closeReviewModalBtn = document.getElementById('close-review-modal-btn');
  const reviewForm = document.getElementById('write-review-form');
  const starSpans = document.querySelectorAll('#review-star-picker span');
  const ratingInput = document.getElementById('review-rating-val');
  const reviewSuccessBox = document.getElementById('review-form-success');

  if (writeReviewBtn && reviewModal) {
    writeReviewBtn.addEventListener('click', () => {
      reviewModal.classList.add('is-visible');
    });
  }

  if (closeReviewModalBtn && reviewModal) {
    closeReviewModalBtn.addEventListener('click', () => {
      reviewModal.classList.remove('is-visible');
    });
  }

  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) reviewModal.classList.remove('is-visible');
    });
  }

  // Star Rating Interaction
  if (starSpans.length > 0 && ratingInput) {
    starSpans.forEach(star => {
      star.addEventListener('mouseenter', () => {
        const val = +star.dataset.val;
        starSpans.forEach(s => s.classList.toggle('is-hover', +s.dataset.val <= val));
      });
      star.addEventListener('mouseleave', () => {
        starSpans.forEach(s => s.classList.remove('is-hover'));
      });
      star.addEventListener('click', () => {
        const val = +star.dataset.val;
        ratingInput.value = val;
        starSpans.forEach(s => s.classList.toggle('is-active', +s.dataset.val <= val));
      });
    });
  }

  // Review Form Submit
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('review-author-name').value.trim();
      const flavour = document.getElementById('review-flavour-select').value;
      const text = document.getElementById('review-text-content').value.trim();
      const rating = ratingInput ? ratingInput.value : 5;
      const orderId = document.getElementById('review-order-id') ? document.getElementById('review-order-id').value.trim() : '';

      if (text.length < 10) {
        alert('Please write at least 10 characters for your review.');
        return;
      }

      // Hide form and show thank you
      reviewForm.style.display = 'none';
      if (reviewSuccessBox) reviewSuccessBox.style.display = 'block';

      setTimeout(() => {
        if (reviewModal) reviewModal.classList.remove('is-visible');
        // Reset after close
        setTimeout(() => {
          reviewForm.reset();
          reviewForm.style.display = 'block';
          if (reviewSuccessBox) reviewSuccessBox.style.display = 'none';
        }, 500);
      }, 2500);
    });
  }

  // ── 4. PRODUCT PAGE INTERACTIVITY ─────────────────────────────────
  const boxCards = document.querySelectorAll('.box-size-card');
  const qtyMinus = document.getElementById('p-qty-minus');
  const qtyPlus = document.getElementById('p-qty-plus');
  const qtyVal = document.getElementById('p-qty-val');
  const addCartBtn = document.getElementById('p-add-cart-btn');
  const addCartTotal = document.getElementById('p-add-cart-total');
  const crossSellBtns = document.querySelectorAll('.cross-sell-add-btn');

  let currentPrice = 420;
  let currentPackName = 'Single Box (180g)';
  let currentVariantId = '48011888132245';
  let currentQty = 1;

  if (boxCards.length > 0) {
    boxCards.forEach(card => {
      card.addEventListener('click', () => {
        boxCards.forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');

        currentPrice = +card.dataset.price;
        currentPackName = card.dataset.pack;
        currentVariantId = card.dataset.variant;
        updateProductTotals();
      });
    });
  }

  function updateProductTotals() {
    if (addCartTotal) {
      addCartTotal.textContent = `₹${currentPrice * currentQty}`;
    }
    const stickyTotal = document.getElementById('mobile-sticky-price');
    if (stickyTotal) {
      stickyTotal.textContent = `₹${currentPrice * currentQty}`;
    }
  }

  if (qtyMinus && qtyPlus && qtyVal) {
    qtyMinus.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        qtyVal.textContent = currentQty;
        qtyMinus.disabled = (currentQty <= 1);
        updateProductTotals();
      }
    });

    qtyPlus.addEventListener('click', () => {
      if (currentQty < 15) {
        currentQty++;
        qtyVal.textContent = currentQty;
        qtyMinus.disabled = false;
        updateProductTotals();
      }
    });
  }

  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      const productName = document.querySelector('.product-main-title') ? document.querySelector('.product-main-title').textContent.trim() : 'Crumbly Cookies';
      window.CrumblyCart.addItem(currentVariantId, currentQty, currentPrice, productName, currentPackName);

      // Animation
      const originalText = addCartBtn.innerHTML;
      addCartBtn.innerHTML = '<span>Added to Cart! ✓</span>';
      setTimeout(() => { addCartBtn.innerHTML = originalText; updateProductTotals(); }, 1200);
    });
  }

  // Cross-Sell Buttons (+ Add another flavour)
  if (crossSellBtns.length > 0) {
    crossSellBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = +btn.dataset.price;
        const variant = btn.dataset.variant;
        const pack = btn.dataset.pack;
        window.CrumblyCart.addItem(variant, 1, price, name, pack);

        btn.textContent = 'Added ✓';
        btn.style.background = '#0F8A43';
        setTimeout(() => {
          btn.textContent = '+ Add';
          btn.style.background = '';
        }, 1500);
      });
    });
  }

  // Product Accordion Toggle
  const accordions = document.querySelectorAll('.accordion-header');
  if (accordions.length > 0) {
    accordions.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const isOpen = item.classList.contains('is-open');

        // Close others (one open at a time requirement)
        document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('is-open'));

        if (!isOpen) {
          item.classList.add('is-open');
        }
      });
    });
  }

  // Homepage FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-acc-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-acc-trigger');
      const body = item.querySelector('.faq-acc-body');
      const icon = item.querySelector('.faq-acc-icon');
      if (trigger && body) {
        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          faqItems.forEach(other => {
            other.classList.remove('is-open');
            const otherBody = other.querySelector('.faq-acc-body');
            const otherIcon = other.querySelector('.faq-acc-icon');
            if (otherBody) otherBody.style.display = 'none';
            if (otherIcon) otherIcon.textContent = '+';
          });
          if (!isOpen) {
            item.classList.add('is-open');
            body.style.display = 'block';
            if (icon) icon.textContent = '−';
          }
        });
      }
    });
  }

  // Pincode Checker
  const pinInput = document.getElementById('pincode-input');
  const pinBtn = document.getElementById('pincode-btn');
  const pinRes = document.getElementById('pincode-result');

  if (pinBtn && pinInput && pinRes) {
    pinBtn.addEventListener('click', () => {
      const code = pinInput.value.trim();
      if (!code || code.length < 6) {
        pinRes.textContent = 'Please enter a valid 6-digit Indian pincode.';
        pinRes.style.color = '#C2410C';
        pinRes.style.display = 'block';
        return;
      }
      pinRes.innerHTML = '✓ Pan-India surface delivery available! Estimated delivery: <b>7–8 days</b>.';
      pinRes.style.color = '#0F8A43';
      pinRes.style.display = 'block';
    });
  }

  // Initial cart UI render
  updateCartUI();

  // Floating Cart Drawer Listeners
  const fc = document.getElementById('floating-cart');
  const fcCheckout = document.getElementById('floating-cart-checkout-btn');
  const cartModal = document.getElementById('cart-modal');
  const cartClose = document.getElementById('cart-modal-close');
  const cartCheckout = document.getElementById('cart-modal-checkout-btn');

  if (fc) {
    fc.addEventListener('click', (e) => {
      if (e.target.closest('#floating-cart-checkout-btn')) return;
      window.CrumblyCart.openCartModal();
    });
  }
  if (fcCheckout) {
    fcCheckout.addEventListener('click', (e) => {
      e.stopPropagation();
      window.CrumblyCart.checkout();
    });
  }
  if (cartClose) {
    cartClose.addEventListener('click', window.CrumblyCart.closeCartModal);
  }
  if (cartCheckout) {
    cartCheckout.addEventListener('click', window.CrumblyCart.checkout);
  }
})();
