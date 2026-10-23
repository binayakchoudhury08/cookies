/* CRUMBLY v2 — prices from shop-config.js, FAQ, flavour product pages */
(() => {
  const SHOP = window.CRUMBLY_SHOP;
  const inr = n => '₹' + Number(n).toLocaleString('en-IN');

  /* 1. Prices everywhere come from shop-config.js */
  if (SHOP) {
    document.querySelectorAll('[data-price]').forEach(el => {
      const [slug, pack] = el.dataset.price.split(':');
      const p = SHOP.flavours[slug] && SHOP.flavours[slug].prices[pack];
      if (p) el.textContent = inr(p.price);
    });
  }

  /* 2. FAQ: one open at a time, accessible */
  const faqItems = [...document.querySelectorAll('.faq2__item')];
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq2__btn');
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      faqItems.forEach(o => { o.classList.remove('is-open'); o.querySelector('.faq2__btn').setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* 3. Flavour product page */
  const pdp = document.querySelector('.pdp[data-flavour]');
  if (!pdp || !SHOP) return;

  const slug = pdp.dataset.flavour;
  const F = SHOP.flavours[slug];
  const PACKS = SHOP.packs;
  const params = new URLSearchParams(location.search);
  let pack = PACKS[params.get('pack')] ? params.get('pack') : 'single';
  let qty = 1;

  const $ = s => pdp.querySelector(s);
  const packBtns = [...pdp.querySelectorAll('.pdp__pack')];
  const slides = [...pdp.querySelectorAll('.pdp__slide')];
  const thumbs = [...pdp.querySelectorAll('.pdp__thumb')];
  const caption = $('.pdp__caption');
  const rows = [...pdp.querySelectorAll('.pdp__table tbody tr')];
  const sticky = document.querySelector('.pdp-sticky');

  // fill pack prices from config
  packBtns.forEach(b => {
    const p = F.prices[b.dataset.pack];
    b.querySelector('[data-f="price"]').textContent = inr(p.price);
    b.querySelector('[data-f="mrp"]').textContent = inr(p.mrp);
  });
  rows.forEach(r => {
    const k = r.dataset.pack, p = F.prices[k];
    r.querySelector('[data-f="price"]').textContent = inr(p.price);
    r.querySelector('[data-f="mrp"]').textContent = inr(p.mrp);
    r.querySelector('[data-f="per"]').textContent = inr(Math.round(p.price / PACKS[k].grams * 100));
  });

  const CAPTIONS = {
    mini: 'Shown: our 180g box. The Mini box holds 80g, about 8–10 coins.',
    single: '',
    duo: F.img.duo ? '' : 'Duo pack = two 180g boxes, shipped together.'
  };

  function showSlide(name) {
    slides.forEach(s => s.classList.toggle('is-active', s.dataset.slide === name));
    thumbs.forEach(t => t.classList.toggle('is-active', t.dataset.slide === name));
    caption.textContent = name === 'hand' ? 'Real size: one coin, one bite.' : (name === 'single' && pack === 'mini' ? CAPTIONS.mini : (name === 'duo' ? CAPTIONS.duo : ''));
  }

  function render() {
    const p = F.prices[pack], meta = PACKS[pack];
    packBtns.forEach(b => b.setAttribute('aria-checked', String(b.dataset.pack === pack)));
    rows.forEach(r => r.classList.toggle('is-current', r.dataset.pack === pack));
    showSlide(pack === 'duo' ? 'duo' : 'single');
    $('#pdp-qty').textContent = qty;
    $('#pdp-minus').disabled = qty <= 1;
    $('#pdp-total').textContent = inr(p.price * qty);
    $('#pdp-unit').textContent = `${meta.label} ${meta.weight} · ${inr(Math.round(p.price / meta.grams * 100))} per 100g`;
    const save = (p.mrp - p.price) * qty;
    $('#pdp-save').textContent = save > 0 ? `You save ${inr(save)}` : '';
    $('#pdp-cart-label').textContent = `Add ${qty} to cart`;
    const hasVariant = !!p.variant;
    $('#pdp-wa-note').hidden = hasVariant;
    $('#pdp-buy-label').textContent = hasVariant ? `Buy now · ${inr(p.price * qty)}` : 'Order on WhatsApp';
    pdp.querySelector('.pdp__btn--cart').hidden = !hasVariant;
    pdp.querySelector('.pdp__btns').style.gridTemplateColumns = hasVariant ? '' : '1fr';
    if (sticky) {
      sticky.querySelector('#pdp-sticky-total').textContent = inr(p.price * qty);
      sticky.querySelector('#pdp-sticky-pack').textContent = `${meta.label} ${meta.weight} × ${qty}`;
      sticky.querySelector('[data-action="cart"]').textContent = hasVariant ? 'Add to cart' : 'Order on WhatsApp';
    }
    const url = new URL(location.href);
    url.searchParams.set('pack', pack);
    history.replaceState(null, '', url);
  }

  // radio-group keyboard support
  packBtns.forEach((b, i) => {
    b.addEventListener('click', () => { pack = b.dataset.pack; render(); });
    b.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      e.preventDefault();
      const n = packBtns[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : packBtns.length - 1)) % packBtns.length];
      n.focus(); n.click();
    });
  });
  thumbs.forEach(t => t.addEventListener('click', () => showSlide(t.dataset.slide)));
  $('#pdp-minus').addEventListener('click', () => { if (qty > 1) { qty--; render(); } });
  $('#pdp-plus').addEventListener('click', () => { if (qty < 20) { qty++; render(); } });

  function waOrder(name, packKey, q) {
    const m = PACKS[packKey], p = F.prices[packKey] || SHOP.flavours[slug].prices[packKey];
    const msg = `Hi Crumbly! I'd like to order ${q} × ${name} — ${m.label} ${m.weight}. Please share the payment link.`;
    window.open(`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }
  function track(evt, p) {
    try { if (typeof window.fbq === 'function') window.fbq('track', evt, { content_name: F.name, content_ids: [p.variant], value: p.price * qty, currency: 'INR' }); } catch (_) { }
  }

  function addToCart() {
    const p = F.prices[pack], m = PACKS[pack];
    if (!p.variant) return waOrder(F.name, pack, qty);
    window.CrumblyCart.addItem(p.variant, qty, p.price, F.name, `${m.label} (${m.weight})`, F.img.single);
    track('AddToCart', p);
  }
  function buyNow() {
    const p = F.prices[pack];
    if (!p.variant) return waOrder(F.name, pack, qty);
    track('InitiateCheckout', p);
    location.href = `https://${SHOP.shopifyDomain}/cart/${p.variant}:${qty}`;
  }
  pdp.querySelectorAll('[data-action="cart"]').forEach(b => b.addEventListener('click', addToCart));
  pdp.querySelectorAll('[data-action="buy"]').forEach(b => b.addEventListener('click', buyNow));
  if (sticky) sticky.querySelector('[data-action="cart"]').addEventListener('click', addToCart);

  // pair with another flavour (Single 180g)
  pdp.querySelectorAll('.pdp__pair-add').forEach(b => {
    b.addEventListener('click', () => {
      const other = SHOP.flavours[b.dataset.flavour], p = other.prices.single;
      if (!p.variant) { location.href = other.page + '?pack=single'; return; }
      window.CrumblyCart.addItem(p.variant, 1, p.price, other.name, 'Single box (180g)', other.img.single);
      b.textContent = 'Added'; setTimeout(() => { b.textContent = '+ Add 180g'; }, 1500);
    });
  });
  pdp.querySelectorAll('[data-pair-price]').forEach(el => {
    el.textContent = inr(SHOP.flavours[el.dataset.pairPrice].prices.single.price);
  });

  // tabs
  const tabs = [...pdp.querySelectorAll('.pdp__tab')];
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      tabs.forEach(o => { o.setAttribute('aria-selected', 'false'); o.tabIndex = -1; document.getElementById(o.getAttribute('aria-controls')).hidden = true; });
      t.setAttribute('aria-selected', 'true'); t.tabIndex = 0;
      document.getElementById(t.getAttribute('aria-controls')).hidden = false;
    });
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); n.click();
    });
  });

  // lightbox on the big photo
  $('.pdp__stage').addEventListener('click', () => {
    const active = pdp.querySelector('.pdp__slide.is-active img');
    const lb = document.getElementById('product-lightbox'), img = document.getElementById('lightbox-img');
    if (active && lb && img) { img.src = active.src; img.alt = active.alt; lb.classList.add('is-visible'); }
  });
  const lb = document.getElementById('product-lightbox');
  if (lb) {
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-close]')) lb.classList.remove('is-visible'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('is-visible'); });
  }

  render();
})();
