import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Hero: Add Rating + count under the title main product image
rating_html = '''
              <div class="hero-rating" style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #F59E0B; font-size: 18px;">★★★★★</span>
                <span style="color: #F4E8DC; font-size: 13px; font-weight: 600;">4.9/5 (1,240+ Reviews)</span>
              </div>
'''
html = html.replace('YOU KNOW YOU WANT IT.</p>\n              </div>', 'YOU KNOW YOU WANT IT.</p>\n              </div>' + rating_html)

# 2. The 5 Second Test Conversion section (Replacing the #why section)
# We will replace everything from <!-- ══ WHY MINI to <!-- ══ PREMIUM DTC
why_section_start = html.find('<!-- ══ WHY MINI')
shop_section_start = html.find('<!-- ══ PREMIUM DTC')

if why_section_start != -1 and shop_section_start != -1:
    five_second_html = '''<!-- ══ THE 5 SECOND TEST CONVERSION ═══════════════ -->
    <section class="sec has-deco" id="why" aria-labelledby="why-h">
      <div class="shell">
        <div class="sec__head rv">
          <span class="kicker">The 5 Second Test</span>
          <h2 class="dsp h2" id="why-h">Is CRUMBLY for you?</h2>
        </div>

        <div class="why-pillars" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 40px;">
          <div class="why-pillar rv" style="background: #FFFDF8; padding: 24px; border-radius: 20px; border: 1px solid var(--line); box-shadow: 0 10px 30px rgba(38,20,8,0.05);">
            <h3 class="why-pillar__title" style="color: var(--brand); margin-bottom: 12px; font-size: 20px;">What is it?</h3>
            <p class="why-pillar__desc">Mini coin-shaped cookies made with 100% pure butter and intense flavors. Zero crumbs, perfect bite-sized indulgence.</p>
          </div>
          <div class="why-pillar rv" style="background: #FFFDF8; padding: 24px; border-radius: 20px; border: 1px solid var(--line); box-shadow: 0 10px 30px rgba(38,20,8,0.05);">
            <h3 class="why-pillar__title" style="color: var(--brand); margin-bottom: 12px; font-size: 20px;">Who is it for?</h3>
            <p class="why-pillar__desc">Chocolate lovers, focus-workers craving a clean snack, and anyone who appreciates real bakery craft without the mess.</p>
          </div>
          <div class="why-pillar rv" style="background: #FFFDF8; padding: 24px; border-radius: 20px; border: 1px solid var(--line); box-shadow: 0 10px 30px rgba(38,20,8,0.05);">
            <h3 class="why-pillar__title" style="color: var(--brand); margin-bottom: 12px; font-size: 20px;">Why buy now?</h3>
            <p class="why-pillar__desc">Our small batches sell out fast. Batch #001 is currently active with free air shipping on multi-packs. Don't miss out.</p>
          </div>
          <div class="why-pillar rv" style="background: #FFFDF8; padding: 24px; border-radius: 20px; border: 1px solid var(--line); box-shadow: 0 10px 30px rgba(38,20,8,0.05);">
            <h3 class="why-pillar__title" style="color: var(--brand); margin-bottom: 12px; font-size: 20px;">What do I do next?</h3>
            <p class="why-pillar__desc">Click below to order your fresh batch right away. Secure 1-click checkout.</p>
            <a class="btn" href="#shop" style="margin-top: 16px; width: 100%;">Shop Drops ➔</a>
          </div>
        </div>
      </div>
    </section>
    
    <div class="crumbrule" aria-hidden="true"></div>
    
    '''
    html = html[:why_section_start] + five_second_html + html[shop_section_start:]

# 3. Product Page Updates (Videos, trust notes, remove old images)
# Replace product media gallery with video for Double Chocolate & Chocochips
media_gallery_start = html.find('<div class="shop-product-media-wrapper">')
media_gallery_end = html.find('<!-- Right: E-Commerce Product Configuration -->')

if media_gallery_start != -1 and media_gallery_end != -1:
    new_media_gallery = '''<div class="shop-product-media-wrapper">
            <div class="shop-product-media" style="position: relative; overflow: hidden; border-radius: 20px; border: 1px solid var(--line);">
              <span class="shop-product-badge">Oven Fresh · Batch #001</span>
              <div class="shop-media-tag-bottom" style="z-index: 10;">🧈 100% Churned Butter</div>
              <video id="main-product-video" class="shop-product-video" src="Chocolate.mp4" playsinline autoplay loop muted preload="auto" style="width: 100%; height: 100%; object-fit: cover; display: block;"></video>
            </div>
            <p style="font-size: 12px; text-align: center; color: var(--muted); margin-top: 10px;">🎥 See the real texture in action</p>
          </div>
          
          '''
    html = html[:media_gallery_start] + new_media_gallery + html[media_gallery_end:]

# Trust grid updates (Return policy & Shipping)
trust_grid_start = html.find('<div class="shop-trust-notes light-trust-grid">')
trust_grid_end = html.find('</div>\n            </div>\n          </div>\n        </article>')

if trust_grid_start != -1 and trust_grid_end != -1:
    new_trust_grid = '''<div class="shop-trust-notes light-trust-grid">
                <div class="shop-trust-note-item">
                  <span class="shop-trust-icon">🚚</span>
                  <span><b>Delivery</b><br>7-8 Days Everywhere<br><small>(No Air by default)</small></span>
                </div>
                <div class="shop-trust-note-item">
                  <span class="shop-trust-icon">🛡️</span>
                  <span><b>Return Policy</b><br>No Returns/Refunds<br><small>Guaranteed Quality</small></span>
                </div>
                <div class="shop-trust-note-item">
                  <span class="shop-trust-icon">💳</span>
                  <span><b>Secure Payments</b><br>No COD Available</span>
                </div>
                <div class="shop-trust-note-item">
                  <span class="shop-trust-icon">💬</span>
                  <span><b>Need Help?</b><br><a href="contact.html" style="color:var(--brand); text-decoration:underline;">Contact Us</a></span>
                </div>
              </div>'''
    # We need to find the exact closing tag of trust_grid
    closing_div = html.find('</div>', trust_grid_start)
    # The current one has 4 items, each with a closing div, so we just replace the whole block
    html = html[:trust_grid_start] + new_trust_grid + html[trust_grid_end:]

# 4. Add Testimonials and FAQ before Footer
vip_section_end = html.find('<!-- ══ HIGH-END BRAND GRAND FINALE FOOTER')

if vip_section_end != -1:
    testimonials_faq = '''
    <div class="crumbrule" aria-hidden="true"></div>

    <!-- ══ TESTIMONIALS & REVIEWS ══ -->
    <section class="sec has-deco" id="reviews">
      <div class="shell">
        <div class="sec__head rv">
          <span class="kicker">Real Customer Love</span>
          <h2 class="dsp h2">What our snackers say</h2>
        </div>
        <div class="reviews-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px;">
          <div class="review-card rv" style="background: #FFF; padding: 24px; border-radius: 16px; border: 1px solid var(--line);">
            <div style="color: #F59E0B; margin-bottom: 12px; font-size: 18px;">★★★★★</div>
            <p style="font-style: italic; color: var(--ink); margin-bottom: 16px;">"The chocolate coins are incredibly rich. Perfect bite size so there is zero mess on my desk while working."</p>
            <div style="font-weight: 700; font-size: 14px; color: var(--brand);">— Rahul S.</div>
          </div>
          <div class="review-card rv" style="background: #FFF; padding: 24px; border-radius: 16px; border: 1px solid var(--line);">
            <div style="color: #F59E0B; margin-bottom: 12px; font-size: 18px;">★★★★★</div>
            <p style="font-style: italic; color: var(--ink); margin-bottom: 16px;">"Loved the pure butter taste! Ordered the Duo box and it finished in two days. Will definitely buy again."</p>
            <div style="font-weight: 700; font-size: 14px; color: var(--brand);">— Priya M.</div>
          </div>
          <div class="review-card rv" style="background: #FFF; padding: 24px; border-radius: 16px; border: 1px solid var(--line);">
            <div style="color: #F59E0B; margin-bottom: 12px; font-size: 18px;">★★★★★</div>
            <p style="font-style: italic; color: var(--ink); margin-bottom: 16px;">"Best cookies I've ever had. You can really taste the premium ingredients. 10/10."</p>
            <div style="font-weight: 700; font-size: 14px; color: var(--brand);">— Aman K.</div>
          </div>
        </div>
      </div>
    </section>

    <div class="crumbrule" aria-hidden="true"></div>

    <!-- ══ FAQ ══ -->
    <section class="sec has-deco" id="faq">
      <div class="shell">
        <div class="sec__head rv">
          <span class="kicker">Got Questions?</span>
          <h2 class="dsp h2">Frequently Asked Questions</h2>
        </div>
        <div class="faq-list rv" style="max-width: 800px; margin: 40px auto 0; display: flex; flex-direction: column; gap: 16px;">
          <div class="faq-item" style="background: #FFF; padding: 20px; border-radius: 12px; border: 1px solid var(--line);">
            <h4 style="font-family: var(--display); font-size: 18px; margin-bottom: 8px;">What makes Crumbly different?</h4>
            <p style="color: var(--muted); font-size: 14px;">Our cookies are baked with 100% pure dairy butter and high-quality chocolate. They are coin-sized to give you the perfect bite without making a mess.</p>
          </div>
          <div class="faq-item" style="background: #FFF; padding: 20px; border-radius: 12px; border: 1px solid var(--line);">
            <h4 style="font-family: var(--display); font-size: 18px; margin-bottom: 8px;">How long is the delivery time?</h4>
            <p style="color: var(--muted); font-size: 14px;">We deliver across India within 7-8 days via surface transport to ensure the cookies arrive safely.</p>
          </div>
          <div class="faq-item" style="background: #FFF; padding: 20px; border-radius: 12px; border: 1px solid var(--line);">
            <h4 style="font-family: var(--display); font-size: 18px; margin-bottom: 8px;">Are there returns or COD available?</h4>
            <p style="color: var(--muted); font-size: 14px;">Because we bake fresh and ship food items, we do not accept returns and we do not offer Cash on Delivery. All payments are 100% secure.</p>
          </div>
        </div>
      </div>
    </section>

    '''
    html = html[:vip_section_end] + testimonials_faq + html[vip_section_end:]

# 5. Footer Updates
footer_col_start = html.find('<div class="foot-col">\n              <h4>Direct Customer Contacts</h4>')
if footer_col_start != -1:
    footer_links_end = html.find('<!-- Customer Helpline Contact Box (Both Numbers) -->')
    new_footer_col = '''<div class="foot-col">
              <h4>Support & Links</h4>
              <ul>
                <li><a href="about.html">About Us</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="contact.html">Track Order (Email Tracking ID sent to you via Shiprocket)</a></li>
              </ul>
            </div>
            <div class="foot-col">
              <h4>Legal & Policies</h4>
              <ul>
                <li><a href="privacy-policy.html">Privacy Policy</a></li>
                <li><a href="terms.html">Terms of Service</a></li>
                <li><a href="shipping-policy.html">Shipping Policy</a></li>
                <li><a href="refund-policy.html">Refund Policy</a></li>
              </ul>
            </div>
            
            '''
    html = html[:footer_col_start] + new_footer_col + html[footer_links_end:]

with open('index_updated.html', 'w', encoding='utf-8') as f:
    f.write(html)
