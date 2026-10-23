/* ════════════════════════════════════════════════════════════
   CRUMBLY SHOP CONFIG — the ONE place to edit prices & Shopify IDs
   ────────────────────────────────────────────────────────────
   • price / mrp: shown on the site. Keep them EQUAL to the price
     set on the same variant in Shopify (Shopify charges its own price).
   • variant: the Shopify variant ID (number from the variant's URL
     in Shopify admin). Leave '' if the variant doesn't exist yet —
     the site will then take that order on WhatsApp instead of
     sending the customer to the wrong product.
   ════════════════════════════════════════════════════════════ */
window.CRUMBLY_SHOP = {
  shopifyDomain: 'crumblyblr.myshopify.com',
  whatsapp: '917069666910',

  packs: {
    mini:   { label: 'Mini box',   weight: '80g',  grams: 80,  coins: 'about 8–10 coins' },
    single: { label: 'Single box', weight: '180g', grams: 180, coins: 'about 18–20 coins' },
    duo:    { label: 'Duo pack',   weight: '360g', grams: 360, coins: '2 × 180g boxes, about 36–40 coins' }
  },

  flavours: {
    'choco-chips': {
      name: 'Choco Chips',
      page: 'choco-chips.html',
      img: { single: 'assets/img/choco_chips_single_box.jpeg', duo: 'assets/img/choco_chips_duo_pack.jpeg' },
      prices: {
        mini:   { price: 239, mrp: 299, variant: '48020321075349' },
        single: { price: 420, mrp: 499, variant: '47857840423061' },
        duo:    { price: 780, mrp: 998, variant: '47857840455829' }
      }
    },
    'double-chocolate': {
      name: 'Double Chocolate',
      page: 'double-chocolate.html',
      img: { single: 'assets/img/double_chocolate_single_box.jpeg', duo: 'assets/img/double_chocolate_duo_pack.jpeg' },
      prices: {
        mini:   { price: 239, mrp: 299, variant: '48020304986261' },
        single: { price: 420, mrp: 499, variant: '48011888132245' },
        duo:    { price: 780, mrp: 998, variant: '48011888165013' }
      }
    },
    'red-velvet': {
      name: 'Red Velvet',
      page: 'red-velvet.html',
      img: { single: 'assets/img/red_velvet_single_box.jpeg', duo: '' },
      /* ⚠ Paste the Red Velvet variant IDs from Shopify here.
         Until then, Red Velvet orders open WhatsApp with the order typed in. */
      prices: {
        mini:   { price: 239, mrp: 299, variant: '' },
        single: { price: 420, mrp: 499, variant: '' },
        duo:    { price: 780, mrp: 998, variant: '' }
      }
    }
  }
};
