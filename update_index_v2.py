import re

file_path = r"c:\Users\DELL\Downloads\crumbly-site (2)\crumbly\index.html"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace "Pre-Order" mentions
content = content.replace("Pre-order now available.", "Launch now active.")
content = content.replace("Pre-Order Available", "Available Now")
content = content.replace("Immediate Pre-Order Active", "Launch Active")
content = content.replace("Available to Order", "Launch Active")

# Replace the single config block with two config blocks (Flavour and Pack)
shop_replacement = '''<!-- Flavour Selection -->
            <div class="shop-config-block">
              <div class="shop-variant-label">
                <span>Select Flavour:</span>
                <span id="flavour-selection-summary" class="shop-selection-pill">Double Chocolate</span>
              </div>
              <div class="shop-pack-picker" id="flavour-picker" style="margin-top:10px;">
                <button class="shop-pack-btn is-active" type="button" data-flavour="chocolate">
                  <div class="shop-pack-top-row">
                    <span class="shop-pack-radio"><span class="shop-radio-inner"></span></span>
                    <span class="shop-pack-title">Double Chocolate</span>
                  </div>
                </button>
                <button class="shop-pack-btn" type="button" data-flavour="chocochips">
                  <div class="shop-pack-top-row">
                    <span class="shop-pack-radio"><span class="shop-radio-inner"></span></span>
                    <span class="shop-pack-title">Choco Chips</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Pack Selection -->
            <div class="shop-config-block" style="margin-top:24px;">
              <div class="shop-variant-label">
                <span>Select Pack:</span>
                <span id="pack-selection-summary" class="shop-selection-pill">Single Box (180g)</span>
              </div>
              <div class="shop-pack-picker" id="pack-picker" style="margin-top:10px;">
                <button class="shop-pack-btn is-active" type="button" data-pack="single">
                  <div class="shop-pack-top-row">
                    <span class="shop-pack-radio"><span class="shop-radio-inner"></span></span>
                    <span class="shop-pack-title">Single Box</span>
                  </div>
                  <span class="shop-pack-coins">180g Box</span>
                  <div class="shop-pack-price-row">
                    <span class="shop-pack-price"><strike>₹559</strike> ₹449</span>
                  </div>
                </button>
                <button class="shop-pack-btn" type="button" data-pack="duo">
                  <span class="shop-pack-badge-tag">⚡ Save ₹150</span>
                  <div class="shop-pack-top-row">
                    <span class="shop-pack-radio"><span class="shop-radio-inner"></span></span>
                    <span class="shop-pack-title">Duo Box</span>
                  </div>
                  <span class="shop-pack-coins">360g (2x 180g)</span>
                  <div class="shop-pack-price-row">
                    <span class="shop-pack-price"><strike>₹1118</strike> ₹749</span>
                  </div>
                </button>
              </div>
            </div>'''

content = re.sub(r'<div class="shop-config-block">.*?</div>\s*</div>\s*<!-- Dynamic Savings', shop_replacement + '\n\n            <!-- Dynamic Savings', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html updated successfully!")
