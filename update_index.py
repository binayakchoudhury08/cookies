import re

file_path = r"c:\Users\DELL\Downloads\crumbly-site (2)\crumbly\index.html"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Navbar & Social Links
content = re.sub(
    r'<header class="nav" data-nav>.*?<nav class="nav__links" aria-label="Main navigation">',
    '''<header class="nav" data-nav>
    <div style="display:flex;align-items:center;">
      <a class="brand" href="#home" aria-label="CRUMBLY home">
        <img class="brand__logo-img" src="assets/img/brand-logo-crop.webp" alt="CRUMBLY — You know you want it."
          width="140" height="34">
        <span class="brand__text">CRUMBLY</span>
      </a>
      <div class="nav__social" style="display:flex; gap:16px; margin-left: 20px; align-items:center;">
        <a href="https://www.instagram.com/crumbly.blr" target="_blank" style="font-size:13px;font-weight:700;color:var(--ink);text-decoration:none;">Instagram</a>
        <a href="https://wa.me/917069666910" target="_blank" style="font-size:13px;font-weight:700;color:var(--ink);text-decoration:none;">WhatsApp</a>
      </div>
    </div>

    <nav class="nav__links" aria-label="Main navigation">''',
    content, flags=re.DOTALL
)

# 2. Remove Break Cookie from navbar
content = content.replace('<a href="#shatter" data-nl>Break Cookie</a>\n', '')

# 3. Hero Text Update
content = content.replace(
    'Double Chocolate, Vanilla, Red Velvet &amp; Oats.',
    'Double Chocolate, Choco Chips, Vanilla &amp; Red Velvet. Perfectly chewy, tasty and guwy.'
)

# 4. Flavours Section update (Add Choco Chips, Remove Oats)
flavours_replacement = '''
            <!-- Flavour 2: Choco Chips -->
            <article class="flav-card-slide" data-flav-card="choc-chips">
              <div class="flav-media-box">
                <video class="flav-card-video" src="Choco Chips.mp4" playsinline autoplay loop muted preload="auto"></video>
              </div>

              <div class="flav-card-content">
                <span class="flav-card-badge flav-badge-live">⚡ Available to Order</span>
                <h3 class="flav-card-title">Choco Chips</h3>
                <p class="flav-card-desc">
                  Classic chewy, tasty and guwy cookies bursting with rich chocolate chips.
                </p>
                <div class="flav-card-cta">
                  <a class="btn btn--sm" href="#shop" style="width:100%;">Order Choco Chips ➔</a>
                </div>
              </div>
            </article>

            <!-- Flavour 3: Madagascar Vanilla (Video Only · VIP Access) -->'''
content = content.replace('<!-- Flavour 2: Madagascar Vanilla (Video Only · VIP Access) -->', flavours_replacement)

# Remove Oats Flavour Slide completely
content = re.sub(r'<!-- Flavour 4: Oats Cookie.*?</article>', '', content, flags=re.DOTALL)

# 5. Why Mini carousel - Remove Oats Slide
content = re.sub(r'<!-- Slide 4: Oats Cookie -->.*?</div>\s*<!-- Slide 5:', '<!-- Slide 5:', content, flags=re.DOTALL)

# 6. Remove Shatter Section completely
content = re.sub(r'<div class="crumbrule" aria-hidden="true"></div>\s*<!-- ══ BREAK COOKIE.*?</section>', '', content, flags=re.DOTALL)

# 7. Shop Section Updates
# Update Title
content = content.replace('Single Box (200g)', 'Double Chocolate (180g)')
content = content.replace('Select Pack Size:', 'Select Flavour:')

shop_picker_replacement = '''<div class="shop-pack-picker" style="margin-top:10px;">
                <!-- Flavour 1: Double Chocolate -->
                <button class="shop-pack-btn is-active" type="button" data-pack-id="1" data-variant-id="47857840423061" data-price="449" data-mrp="559" data-name="Double Chocolate (180g)">
                  <div class="shop-pack-top-row">
                    <span class="shop-pack-radio"><span class="shop-radio-inner"></span></span>
                    <span class="shop-pack-title">Double Chocolate</span>
                  </div>
                  <span class="shop-pack-coins">180g Box</span>
                  <div class="shop-pack-price-row">
                    <span class="shop-pack-price"><strike>₹559</strike> ₹449</span>
                  </div>
                </button>

                <!-- Flavour 2: Choco Chips -->
                <button class="shop-pack-btn" type="button" data-pack-id="2" data-variant-id="0000000000000" data-price="449" data-mrp="559" data-name="Choco Chips (180g)">
                  <div class="shop-pack-top-row">
                    <span class="shop-pack-radio"><span class="shop-radio-inner"></span></span>
                    <span class="shop-pack-title">Choco Chips</span>
                  </div>
                  <span class="shop-pack-coins">180g Box</span>
                  <div class="shop-pack-price-row">
                    <span class="shop-pack-price"><strike>₹559</strike> ₹449</span>
                  </div>
                </button>
              </div>'''
content = re.sub(r'<div class="shop-pack-picker".*?</div>\s*</div>\s*<!-- Dynamic Savings', shop_picker_replacement + '\n            </div>\n\n            <!-- Dynamic Savings', content, flags=re.DOTALL)

# Checkout Button -> Add to Cart
content = re.sub(
    r'<a href="https://crumblyblr\.myshopify\.com/cart/47857840423061:1\?checkout".*?</a>',
    '''<a href="https://crumblyblr.myshopify.com/cart/47857840423061:1" class="btn shop-buy-now-btn" id="direct-checkout-cta">
                <span class="shop-btn-shine"></span>
                <span class="shop-btn-text" id="direct-checkout-text">Add to Cart • ₹449 ➔</span>
              </a>''',
    content, flags=re.DOTALL
)

# 8. Remove Oats from upcoming drop grid
content = re.sub(r'<!-- Drop 04: Wholesome Oats Cookie -->.*?</div>\s*</div>\s*</div>\s*</section>', '</div>\n      </div>\n    </section>', content, flags=re.DOTALL)

# 9. Remove Oats Waitlist
content = re.sub(r'<label class="vip-checkbox-label">\s*<input type="checkbox" id="vip-check-oats" checked>\s*<span>🌾 Wholesome Oats</span>\s*</label>', '', content, flags=re.DOTALL)

# 10. Remove floating concierge
content = re.sub(r'<!-- ══ FLOATING SOCIAL.*?</div>\s*<!-- ══ HIGH-END BRAND', '<!-- ══ HIGH-END BRAND', content, flags=re.DOTALL)

# 11. Remove Break the cookie from footer
content = content.replace('<li><a href="#shatter">Break the Cookie</a></li>\n', '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html updated successfully!")
