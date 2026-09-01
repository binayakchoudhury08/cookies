document.body.classList.remove('nojs');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (REDUCED) document.body.classList.add('reduce');

/* ════════════════════════════════════════════════════════════
   CRUMBLY CONFIGURATION & SHOPIFY PRE-ORDER SETTINGS
   ════════════════════════════════════════════════════════════ */
const CRUMBLY_CONFIG = {
  SHOPIFY_DOMAIN: "crumblyblr.myshopify.com",
  WHATSAPP_NUMBER: "917069666910",
  HELPLINE_NUMBER: "917069666910",
  HELPLINE_NUMBER_2: "917008246057",

  PACKS: {
    1: {
      name: "Single Box (200g)",
      weight: "200g",
      price: 449,
      mrp: 559,
      variantId: "47857840423061"
    },
    2: {
      name: "Duo Pack (400g)",
      weight: "400g",
      price: 759,
      mrp: 959,
      variantId: "47857840455829"
    },
    3: {
      name: "Party Trio (600g)",
      weight: "600g",
      price: 1099,
      mrp: 1499,
      variantId: "47857840488597"
    }
  },

  SHEET_ENDPOINT: "https://script.google.com/macros/s/AKfycbx7J57slMbP6jvNqOsNM0HH4BaM5tVkVh8Wvs-iPCUHyKj31pRvWhmF1kNp_wxKXyInyQ/exec"
};

/* ══════════════════════════════════════════════════════════
   OUR 4 FLAVOURS — VIDEO ONLY AUTOPLAY LOOP & SWIPER
   ══════════════════════════════════════════════════════════ */
(() => {
  const videos = document.querySelectorAll('.flav-card-video');

  // Auto-play all flavour videos seamlessly in loop
  videos.forEach(v => {
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.play().catch(() => { });
  });

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => { });
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.15 });

    videos.forEach(v => videoObserver.observe(v));
  }

  // Horizontal swipe slider navigation arrows
  const trackEl = document.getElementById('flavours-track');
  const prevBtn = document.getElementById('flav-slide-prev');
  const nextBtn = document.getElementById('flav-slide-next');

  if (trackEl && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      trackEl.scrollBy({ left: -320, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      trackEl.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }
})();

/* ══════════════════════════════════════════════════════════
   WHY MINI — 5-POSTER SWIPE CAROUSEL ENGINE
   ══════════════════════════════════════════════════════════ */
(() => {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = document.querySelectorAll('.carousel-dot');
  const container = document.getElementById('poster-carousel');

  if (!track || !dots.length) return;

  let currentSlide = 0;
  const totalSlides = dots.length;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === currentSlide));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => goToSlide(idx));
  });

  // Touch swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) goToSlide(currentSlide + 1);
      else goToSlide(currentSlide - 1);
    }
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════
   INTERACTIVE SNACKING CALIBRATOR (WHY MINI SECTION)
   ══════════════════════════════════════════════════════════ */
(() => {
  const slider = document.getElementById('coin-slider');
  const countDisplay = document.getElementById('coin-calc-display');
  const calDisplay = document.getElementById('metric-cal');
  const bitesDisplay = document.getElementById('metric-bites');

  if (!slider) return;

  slider.addEventListener('input', () => {
    const val = +slider.value;
    countDisplay.textContent = `${val} Mini Coin${val > 1 ? 's' : ''}`;
    calDisplay.textContent = `${val * 20}`;
    bitesDisplay.textContent = `${val}`;
  });
})();

/* ══════════════════════════════════════════════════════════
ADVANCED REAL-TIME CRUMB PHYSICS, 3D TILT & AUDIO ENGINE
(Single cookie image — breaks only when ALL 5 dots clicked)
══════════════════════════════════════════════════════════ */
(() => {
  const stage = document.getElementById('shatter-stage');
  const cookieContainer = document.getElementById('shatter-cookie-container');
  const cookieImg = document.getElementById('shatter-img');
  const canvas = document.getElementById('crumb-physics-canvas');
  const pins = document.querySelectorAll('[data-pin]');
  const finale = document.getElementById('finale-reveal');
  const pill = document.getElementById('break-status-pill');
  const title = document.getElementById('break-title');
  const desc = document.getElementById('break-desc');
  const resetBtn = document.getElementById('reset-break-btn');
  const meterFill = document.getElementById('crunch-meter-fill');
  const meterVal = document.getElementById('crunch-meter-val');
  const tapPrompt = document.getElementById('cookie-tap-prompt');

  if (!cookieContainer || !canvas) {
    console.warn('Cookie Break elements missing from DOM');
    return;
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let clickedPins = new Set();
  let isShattered = false;
  let animId = null;

  // Cookie image sequence for the break progression
  const cookieImages = ['assets/img/ck1.webp', 'assets/img/ck2.webp', 'assets/img/ck3.webp', 'assets/img/ck4.webp'];

  function resizeCanvas() {
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Particle physics particle class
  class CrumbParticle {
    constructor(x, y, isBig = false) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = isBig ? (Math.random() * 4.5 + 2.5) : (Math.random() * 5 + 2);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (Math.random() * 2.5 + 1);
      this.gravity = 0.32;
      this.size = isBig ? (Math.random() * 3.5 + 2.5) : (Math.random() * 3 + 1.2);
      this.rot = Math.random() * Math.PI;
      this.rotSpeed = (Math.random() - 0.5) * 0.25;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      const colors = ['#3B1D0E', '#261408', '#C48847', '#D49B5A', '#E8B878', '#5E3B24'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.isCircle = Math.random() > 0.4;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= 0.98;
      this.rot += this.rotSpeed;
      this.alpha -= this.decay;
    }

    draw(c) {
      if (this.alpha <= 0) return;
      c.save();
      c.globalAlpha = Math.max(0, this.alpha);
      c.translate(this.x, this.y);
      c.rotate(this.rot);
      c.fillStyle = this.color;
      if (this.isCircle) {
        c.beginPath();
        c.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        c.fill();
      } else {
        c.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.8);
      }
      c.restore();
    }
  }

  function spawnParticles(originX, originY, count = 20, bigBurst = false) {
    for (let i = 0; i < count; i++) {
      particles.push(new CrumbParticle(originX, originY, bigBurst));
    }
    if (!animId) renderParticles();
  }

  function renderParticles() {
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].alpha <= 0) particles.splice(i, 1);
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(renderParticles);
    } else {
      animId = null;
    }
  }

  // High-Fidelity Web Audio Multi-Layer Biscuit Crunch Synthesizer
  function playCookieCrunchSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      if (actx.state === 'suspended') actx.resume();

      const t = actx.currentTime;

      // Layer 1: Crisp biscuit snap noise
      const snapLen = actx.sampleRate * 0.07;
      const snapBuf = actx.createBuffer(1, snapLen, actx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapLen; i++) {
        snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.25));
      }
      const snapSource = actx.createBufferSource();
      snapSource.buffer = snapBuf;
      const snapFilter = actx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.value = 2400 + Math.random() * 500;
      snapFilter.Q.value = 2.5;
      const snapGain = actx.createGain();
      snapGain.gain.setValueAtTime(0.35, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      snapSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(actx.destination);
      snapSource.start(t);

      // Layer 2: Deep low butter thud
      const thud = actx.createOscillator();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(140, t);
      thud.frequency.exponentialRampToValueAtTime(45, t + 0.06);
      const thudGain = actx.createGain();
      thudGain.gain.setValueAtTime(0.25, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
      thud.connect(thudGain);
      thudGain.connect(actx.destination);
      thud.start(t);
      thud.stop(t + 0.06);
    } catch (_) { }
  }

  // 3D Gyro / Mouse Interactive Tilt
  if (stage && cookieContainer) {
    stage.addEventListener('mousemove', (e) => {
      if (isShattered) return;
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cookieContainer.style.transform = `rotateY(${x * 24}deg) rotateX(${-y * 24}deg) scale(1.02)`;
    });

    stage.addEventListener('mouseleave', () => {
      if (isShattered) return;
      cookieContainer.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
    });
  }

  // Cookie frame progression matching 10am version
  const cookieFrames = {
    1: 'assets/img/ck2.webp',
    2: 'assets/img/ck3.webp',
    3: 'assets/img/ck4.webp',
    4: 'assets/img/ck4.webp',
    5: 'assets/img/ck4.webp'
  };

  const stepsInfo = {
    1: { pill: '💥 Step 2 of 5 · Top-Left Fractured!', title: '100% Pure Butter Crust', desc: 'First bite snapped! Real creamery butter delivers clean crispness with 0% palm oil.', integrity: '85% Intact', pct: '85%' },
    2: { pill: '💥 Step 3 of 5 · Top-Right Fractured!', title: 'Handy Coin Geometry', desc: 'Second section broken! Engineered for single-bite satisfaction with zero crumbs.', integrity: '70% Intact', pct: '70%' },
    3: { pill: '💥 Step 4 of 5 · Bottom-Left Crumbled!', title: 'Rich Cocoa Snap', desc: 'Crisp corner snapped! Intense chocolate aroma released from the dairy core.', integrity: '55% Intact', pct: '55%' },
    4: { pill: '💥 Step 5 of 5 · Tap Center Core to Shatter!', title: 'Delicate Perimeter Break', desc: 'All 4 corners broken! Tap the center to fracture the core and reveal what is inside!', integrity: '40% Intact', pct: '40%' },
    5: { pill: '✨ CRUMBLY REVEALED!', title: 'Grand Brand Emblem Revealed!', desc: 'The cookie is gently shattered! Emerging from inside: CRUMBLY — YOU KNOW YOU WANT IT.', integrity: '0% · Shattered', pct: '0%' }
  };

  function handlePinClick(pinId, clickX, clickY) {
    if (isShattered) return;
    if (clickedPins.has(pinId)) return;

    // Mark this pin as clicked
    clickedPins.add(pinId);
    const count = clickedPins.size;

    // Hide this pin instantly
    const targetPin = document.querySelector(`.break-pin[data-pin="${pinId}"]`);
    if (targetPin) {
      targetPin.classList.add('is-used');
      targetPin.style.opacity = '0';
      targetPin.style.visibility = 'hidden';
      targetPin.style.pointerEvents = 'none';
      targetPin.style.transform = 'scale(0)';
    }

    // Hide tap guide prompt
    if (tapPrompt) tapPrompt.classList.add('is-hidden');

    // Impact jolt shake
    if (cookieContainer) {
      cookieContainer.classList.remove('is-impacting');
      void cookieContainer.offsetWidth;
      cookieContainer.classList.add('is-impacting');
    }

    // Play synthesized biscuit crunch sound
    playCookieCrunchSound();

    // Spawn realistic particle burst at click position
    const sRect = stage.getBoundingClientRect();
    let burstX = sRect.width / 2;
    let burstY = sRect.height / 2;
    if (clickX !== undefined && clickY !== undefined) {
      burstX = clickX - sRect.left;
      burstY = clickY - sRect.top;
    } else if (targetPin) {
      const pRect = targetPin.getBoundingClientRect();
      burstX = pRect.left - sRect.left + pRect.width / 2;
      burstY = pRect.top - sRect.top + pRect.height / 2;
    }
    spawnParticles(burstX, burstY, 18, false);

    // Update cookie frame and fracture state on each click
    if (cookieImg) {
      if (cookieFrames[count]) {
        cookieImg.src = cookieFrames[count];
      }
      cookieImg.className = `shatter-cookie-img is-broken-${count}`;
    }

    // Update step info status and crunch pressure meter
    if (stepsInfo[count]) {
      const info = stepsInfo[count];
      if (pill) pill.textContent = info.pill;
      if (title) title.textContent = info.title;
      if (desc) desc.textContent = info.desc;
      if (meterVal) meterVal.textContent = info.integrity;
      if (meterFill) meterFill.style.width = info.pct;
    }

    // When ALL 5 dots have been clicked -> Full Shatter & Reveal Hidden Brand Emblem
    if (count >= 5) {
      isShattered = true;

      // Fine artisanal crumb burst from center
      spawnParticles(sRect.width / 2, sRect.height / 2, 40, true);

      // Hide all pins completely
      pins.forEach(p => {
        p.classList.add('is-used');
        p.style.opacity = '0';
        p.style.visibility = 'hidden';
        p.style.pointerEvents = 'none';
        p.style.display = 'none';
      });

      if (cookieContainer) cookieContainer.classList.add('is-revealed');

      // Reveal hidden brand emblem inside
      setTimeout(() => {
        if (finale) finale.classList.add('is-active');
      }, 300);
    }
  }

  // Attach click listeners to all pins
  pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = pin.getAttribute('data-pin');
      handlePinClick(id, e.clientX, e.clientY);
    });
  });

  // Reset button to restore fresh unbroken cookie
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clickedPins.clear();
      isShattered = false;

      if (cookieImg) {
        cookieImg.src = 'assets/img/ck1.webp';
        cookieImg.className = 'shatter-cookie-img';
      }

      if (cookieContainer) {
        cookieContainer.classList.remove('is-revealed', 'is-impacting');
        cookieContainer.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
      }
      if (finale) finale.classList.remove('is-active');

      pins.forEach(p => {
        p.classList.remove('is-used');
        p.style.display = '';
        p.style.opacity = '';
        p.style.visibility = '';
        p.style.pointerEvents = '';
        p.style.transform = '';
      });

      if (tapPrompt) tapPrompt.classList.remove('is-hidden');
      if (pill) pill.textContent = '💥 Step 1 of 5 · Tap stress points to break';
      if (title) title.textContent = 'Tap points to break cookie';
      if (desc) desc.textContent = 'Experience the 100% pure dairy butter snap. Follow the touch icons to trigger real-time particle fractures.';
      if (meterVal) meterVal.textContent = '100% Intact';
      if (meterFill) meterFill.style.width = '100%';
    });
  }
})();

/* ══════════════════════════════════════════════════════════
   DTC E-COMMERCE PRODUCT CONFIGURATOR & 1-CLICK CHECKOUT
   (Takes zero customer inputs on page — sends straight to Shopify)
   ══════════════════════════════════════════════════════════ */
(() => {
  let selectedPackId = 1;
  let quantity = 1;

  const packBtns = document.querySelectorAll('.shop-pack-btn');
  const qtyMinus = document.getElementById('qty-minus-btn');
  const qtyPlus = document.getElementById('qty-plus-btn');
  const qtyDisplay = document.getElementById('qty-display');
  const checkoutBtn = document.getElementById('direct-checkout-cta');
  const summaryText = document.getElementById('pack-selection-summary');

  if (!checkoutBtn) return;

  function updateCheckoutLink() {
    const packData = CRUMBLY_CONFIG.PACKS[selectedPackId] || CRUMBLY_CONFIG.PACKS[1];
    const totalPrice = packData.price * quantity;
    const variantId = packData.variantId;

    // Build 1-click Shopify direct checkout URL
    const domain = CRUMBLY_CONFIG.SHOPIFY_DOMAIN || 'crumblyblr.myshopify.com';
    const url = `https://${domain}/cart/${variantId}:${quantity}?checkout`;

    checkoutBtn.href = url;
    checkoutBtn.textContent = `Pre-Order Now • ₹${totalPrice} ➔`;
    if (summaryText) summaryText.textContent = `${packData.name} (${quantity} unit${quantity > 1 ? 's' : ''})`;
  }

  checkoutBtn.addEventListener('click', () => {
    try {
      const packData = CRUMBLY_CONFIG.PACKS[selectedPackId] || CRUMBLY_CONFIG.PACKS[1];
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
          content_name: packData.name,
          content_category: 'Cookies',
          content_ids: [packData.variantId],
          num_items: quantity,
          value: packData.price * quantity,
          currency: 'INR'
        });
      }
    } catch (_) { }
  });

  packBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      packBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedPackId = +btn.dataset.packId;
      updateCheckoutLink();
    });
  });

  if (qtyMinus && qtyPlus && qtyDisplay) {
    qtyMinus.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        qtyDisplay.textContent = quantity;
        updateCheckoutLink();
      }
    });

    qtyPlus.addEventListener('click', () => {
      if (quantity < 10) {
        quantity++;
        qtyDisplay.textContent = quantity;
        updateCheckoutLink();
      }
    });
  }

  updateCheckoutLink();
})();

/* ══════════════════════════════════════════════════════════
   VIP ACCESS WAITLIST LOGIC (VANILLA, RED VELVET, OATS)
   ══════════════════════════════════════════════════════════ */
(() => {
  const vipBtn = document.getElementById('vip-submit-btn');
  const vipName = document.getElementById('vip-name');
  const vipPhone = document.getElementById('vip-phone');
  const vipEmail = document.getElementById('vip-email');
  const vipAddress = document.getElementById('vip-address');
  const chkVan = document.getElementById('vip-check-vanilla');
  const chkRed = document.getElementById('vip-check-redvelvet');
  const chkOats = document.getElementById('vip-check-oats');
  const vipErr = document.getElementById('vip-err');
  const vipSuccess = document.getElementById('vip-success-box');

  if (!vipBtn) return;

  vipBtn.addEventListener('click', async () => {
    const nm = vipName.value.trim();
    const ph = vipPhone.value.trim();
    const em = vipEmail.value.trim();
    const addr = vipAddress ? vipAddress.value.trim() : '';

    if (!nm) { vipErr.textContent = 'Please enter your name.'; vipName.focus(); return; }
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) {
      vipErr.textContent = 'Please enter a valid email address.'; vipEmail.focus(); return;
    }

    const selectedFlavours = [];
    if (chkVan && chkVan.checked) selectedFlavours.push('Madagascar Vanilla');
    if (chkRed && chkRed.checked) selectedFlavours.push('Red Velvet');
    if (chkOats && chkOats.checked) selectedFlavours.push('Wholesome Oats');

    if (!selectedFlavours.length) {
      vipErr.textContent = 'Please select at least one flavour for the waitlist.';
      return;
    }

    vipErr.textContent = '';
    vipBtn.disabled = true;
    vipBtn.textContent = 'Joining Waitlist…';

    const payload = {
      type: 'Waitlist',
      flavours: selectedFlavours.join(', '),
      name: nm,
      email: em,
      phone: ph,
      address: addr,
      timestamp: new Date().toISOString()
    };

    if (CRUMBLY_CONFIG.SHEET_ENDPOINT && !CRUMBLY_CONFIG.SHEET_ENDPOINT.startsWith('PASTE_')) {
      try {
        await fetch(CRUMBLY_CONFIG.SHEET_ENDPOINT, {
          method: 'POST',
          body: new URLSearchParams(payload)
        });
      } catch (_) { }
    }

    // Track Meta Pixel Lead event
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: 'Waitlist Early Access Lead',
          content_category: selectedFlavours.join(', ')
        });
      }
    } catch (_) { }

    vipBtn.style.display = 'none';
    vipSuccess.style.display = 'block';
  });
})();

/* ══════════════════════════════════════════════════════════
   Sequence engine (HERO Animation Canvas)
   ══════════════════════════════════════════════════════════ */
class Sequence {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.dir = canvas.dataset.dir;
    this.total = +canvas.dataset.count;
    this.section = canvas.closest('[data-seq-section]') || canvas.parentElement;

    const mobile = matchMedia('(max-width:820px)').matches;
    const weak = (navigator.hardwareConcurrency || 4) <= 4
      || (navigator.connection && navigator.connection.saveData);
    this.step = (mobile || weak) ? (this.total > 90 ? 3 : 2) : 1;

    this.ids = [];
    for (let i = 1; i <= this.total; i += this.step) this.ids.push(i);

    this.frames = [];
    this.loaded = 0;
    this.failed = 0;
    this.ready = false;
    this.visible = false;
    this.shown = 0;
    this.painted = -1;
    this.started = false;

    this.updateBounds = this.updateBounds.bind(this);
    this.size = this.size.bind(this);
    addEventListener('resize', () => { this.updateBounds(); this.size(); }, { passive: true });
    this.updateBounds();
    this.size();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(e => {
        this.visible = e[0].isIntersecting;
        if (this.visible) {
          this.updateBounds();
          this.load();
        }
      }, { rootMargin: '200px' }).observe(canvas);
    } else {
      this.visible = true;
      this.load();
    }
    if (!canvas.hasAttribute('data-lazy')) this.load();
  }

  updateBounds() {
    const r = this.section.getBoundingClientRect();
    this.secTop = r.top + window.scrollY;
    this.secHeight = this.section.offsetHeight;
  }

  load() {
    if (this.started) return;
    this.started = true;
    this.ids.forEach((n, i) => {
      const img = new Image();
      img.decoding = 'async';
      const settle = ok => {
        if (!ok) this.failed++;
        this.loaded++;
        if (!this.ready && this.loaded >= Math.min(10, this.ids.length)) {
          this.ready = true;
          this.paint(0, true);
        }
        if (this.loaded === this.ids.length) this.finish();
      };
      img.onload = () => settle(true);
      img.onerror = () => settle(false);
      img.src = `${this.dir}/f${String(n).padStart(3, '0')}.webp`;
      this.frames[i] = img;
    });
  }

  finish() {
    if (this.failed && this.failed === this.ids.length) {
      this.cv.classList.add('seq-dead');
      return;
    }
    this.ready = true;
  }

  size() {
    const r = this.cv.getBoundingClientRect();
    const area = r.width * r.height;
    const dpr = Math.min(devicePixelRatio || 1, area > 900000 ? 1.25 : 1.5);
    this.cv.width = Math.max(1, Math.round(r.width * dpr));
    this.cv.height = Math.max(1, Math.round(r.height * dpr));
    this.painted = -1;
    if (this.ready) this.paint(Math.round(this.shown));
  }

  paint(i, force) {
    if (i === this.painted && !force) return;
    const img = this.frames[i];
    if (!img || !img.complete || !img.naturalWidth) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const cw = this.cv.width, ch = this.cv.height;
    const s = Math.max(cw / iw, ch / ih);
    const w = iw * s, h = ih * s;
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    this.painted = i;
  }

  progress() {
    const sy = window.scrollY;
    const travel = this.secHeight - innerHeight;
    if (travel > 0) return Math.min(1, Math.max(0, (sy - (this.secTop - 0.5 * (innerHeight - this.cv.height))) / travel));
    const span = innerHeight + this.secHeight;
    return Math.min(1, Math.max(0, (innerHeight - (this.secTop - sy)) / span));
  }

  tick() {
    if (!this.ready || !this.visible) return null;
    const p = this.progress();
    const target = p * (this.frames.length - 1);
    const diff = target - this.shown;
    if (Math.abs(diff) < 0.001) {
      this.shown = target;
    } else {
      this.shown += diff * 0.18;
    }

    const idx = Math.round(this.shown);
    this.paint(idx);

    const nxt = this.frames[idx + 1];
    if (nxt && nxt.decode && !nxt._pre) { nxt._pre = 1; nxt.decode().catch(() => { }); }
    return p;
  }
}

const seqs = [...document.querySelectorAll('[data-seq]')].map(c => new Sequence(c));

/* ══ Parallax layers + copy fade ══ */
const layers = [...document.querySelectorAll('[data-layer]')];
const copy = document.querySelector('[data-hero-copy]');
const hint = document.querySelector('[data-hint]');
const hero = document.querySelector('.hero');

let heroP = 0, lastHeroP = -1;

function frame() {
  let hp = null;
  for (const s of seqs) {
    const p = s.tick();
    if (p !== null && s.cv.dataset.seq === 'hero') hp = p;
  }

  if (!REDUCED && hp !== null && Math.abs(hp - lastHeroP) > 0.0005) {
    lastHeroP = heroP = hp;
    for (const el of layers) {
      el.style.transform = `translate3d(0,${Math.round(hp * +el.dataset.layer)}px,0)`;
    }
    if (copy) {
      const fade = Math.max(0, 1 - Math.max(0, (hp - 0.55) / 0.35));
      copy.style.opacity = fade.toFixed(2);
      copy.style.transform = `translate3d(0,${Math.round(-hp * 60)}px,0)`;
    }
    if (hint) hint.classList.toggle('is-gone', hp > 0.05);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ══ Nav Scroll State ══ */
(() => {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const hero = document.getElementById('home');
  const onScroll = () => {
    const h = hero ? hero.offsetHeight - window.innerHeight * 0.9 : 300;
    nav.classList.toggle('is-solid', window.scrollY > h);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ══ Reveals & Link Highlight ══ */
if ('IntersectionObserver' in window) {
  const rv = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv').forEach(el => rv.observe(el));

  const links = [...document.querySelectorAll('[data-nl]')];
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + e.target.id)));
  }), { threshold: .4 });
  ['home', 'flavours', 'why', 'shatter', 'shop', 'waitlist'].forEach(id => {
    const el = document.getElementById(id); if (el) spy.observe(el);
  });
} else {
  document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
}

/* ══ Music Toggle ══ */
(() => {
  const btn = document.querySelector('[data-sound]');
  const audio = document.querySelector('[data-audio]');
  if (!btn || !audio) return;
  audio.volume = 0.4;
  btn.addEventListener('click', async () => {
    if (btn.getAttribute('aria-pressed') === 'true') {
      audio.pause();
      btn.setAttribute('aria-pressed', 'false');
    } else {
      try {
        await audio.play();
        btn.setAttribute('aria-pressed', 'true');
      } catch { btn.setAttribute('aria-label', 'Music unavailable'); }
    }
  });
})();

