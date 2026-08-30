# 🛒 Complete Shopify + Pre-Order + Razorpay + Shiprocket Setup Guide

This guide gives you the exact, step-by-step process to connect your landing page (**CRUMBLY**) to **Shopify**, configure **Variants with different pricing**, handle payments via **Razorpay**, and automate shipping, invoices, and live tracking via **Shiprocket**.

---

## 🗺️ The Complete Architecture

```mermaid
flowchart TD
    A["Customer on Landing Page"] -->|Selects Pack & Clicks Pre-Order| B["Shopify Checkout (Cart Permalink)"]
    B -->|Customer enters address/UPI| C["Razorpay Gateway on Shopify"]
    C -->|Payment Success (₹199 / ₹349 / ₹499)| D["Shopify Order Created & Marked PAID"]
    
    D --> E["Shopify Instant Notifications"]
    E --> E1["Customer: Email & WhatsApp Confirmation"]
    E --> E2["Merchant: New Order Alert"]
    
    D --> F["Shiprocket Auto-Sync (via Shopify App)"]
    F --> G["Shiprocket creates GST Tax Invoice & Assigns Courier"]
    G --> H["Shiprocket pushes AWB & Tracking Link to Shopify"]
    H --> I["Customer receives SMS/WhatsApp with 'Track Order' Link"]
```

---

## Step 1: Create the Product with 3 Variants in Shopify

1. Open your **Shopify Admin** (`https://admin.shopify.com/store/YOUR_STORE`).
2. Go to **Products** → Click **Add product**.
3. **Title**: `CRUMBLY - Chocolate Mini Coins (Pre-Order)`
4. **Description**: `Mini coin-shaped cookies in rich Chocolate, made with pure butter and zero palm oil.`
5. **Media**: Upload cookie pack images.
6. **Inventory**:
   - ⚠️ **VERY IMPORTANT**: Check the box **"Continue selling when out of stock"** (so pre-orders never get blocked).
7. Scroll down to **Variants** → Click **+ Add options like size or color**.
   - Option name: `Pack Size`
   - Option values:
     1. `Single Box (20 Coins)`
     2. `Duo Pack (40 Coins)`
     3. `Party Trio (60 Coins)`

### Set Variant Prices, MRP & Weights:
Click on each variant row and set the values:

| Variant Name | Price (Selling) | Compare-at Price (MRP) | Weight | SKU |
| :--- | :--- | :--- | :--- | :--- |
| **Single Box (20 Coins)** | `₹199` | `₹249` | `0.15 kg` | `CRM-CHOC-SGL` |
| **Duo Pack (40 Coins)** | `₹349` | `₹498` | `0.30 kg` | `CRM-CHOC-DUO` |
| **Party Trio (60 Coins)** | `₹499` | `₹747` | `0.45 kg` | `CRM-CHOC-TRIO` |

8. Click **Save**.

---

## Step 2: Get Variant IDs & Paste into `index.html`

Each variant in Shopify has a unique numerical ID.

### How to get the Variant ID:
1. In your Shopify Product page, click on the first variant (**Single Box (20 Coins)**).
2. Look at your browser URL bar:
   ```
   https://admin.shopify.com/store/my-store/products/9876543210/variants/48920192831001
   ```
3. Copy the numbers at the very end (`48920192831001`).
4. Repeat this for **Duo Pack** and **Party Trio**.

### Where to paste them in `index.html`:
Open `index.html` and find `const CRUMBLY_CONFIG` (around line 2425):

```javascript
const CRUMBLY_CONFIG = {
  // 🛍️ REPLACE WITH YOUR SHOPIFY STORE URL
  SHOPIFY_DOMAIN: "crumbly.myshopify.com",

  // 📦 PASTE YOUR 3 VARIANT IDs HERE:
  PACKS: {
    1: {
      name: "Single Box (200g)",
      coins: "20 mini coins",
      price: "₹449",
      mrp: "₹449",
      variantId: "47857840423061", // 👈 Paste Single Box Variant ID here
      quantity: 1
    },
    2: {
      name: "Duo Pack (Pack of 2, 2x 200g)",
      coins: "40 mini coins",
      price: "₹759",
      mrp: "₹759",
      variantId: "47857840455829", // 👈 Paste Duo Pack Variant ID here
      quantity: 1
    },
    3: {
      name: "Party Trio (6Pack of 3, 3x 200g)",
      coins: "60 mini coins",
      price: "₹1099",
      mrp: "₹1099",
      variantId: "47857840488597", // 👈 Paste Party Trio Variant ID here
      quantity: 1
    }
  },

  SHEET_ENDPOINT: "PASTE_YOUR_APPS_SCRIPT_URL_HERE"
};
```

---

## Step 3: Connect Razorpay to Shopify

1. In **Shopify Admin**, go to **Settings** (bottom left) → **Payments**.
2. Under **Supported Payment Methods**, click **Add payment methods**.
3. Search for **Razorpay Secure** (or **Razorpay for Shopify**).
4. Click **Install App** and log in to your Razorpay account.
5. In Razorpay Dashboard → **Settings** → **API Keys**, generate or copy:
   - **Key ID**
   - **Key Secret**
6. Paste them into the Shopify Razorpay app settings.
7. Under **Payment Capture**, select **Automatically capture payment for orders**.
8. Save and click **Activate**.

---

## Step 4: Connect Shiprocket to Shopify

1. Log in to your **Shiprocket Dashboard** (`https://app.shiprocket.in/`).
2. Go to **Settings / Channels** → Click **Add New Channel** → Select **Shopify**.
3. Enter your store domain (e.g. `crumbly.myshopify.com`) and click **Connect**.
4. In Shiprocket channel settings:
   - **Auto-Sync Orders**: Turn ON.
   - **Sync Order Status**: Select `Paid`.
   - **Auto-generate Invoice**: Turn ON.

---

## Step 5: How Order Receipts, GST Invoices & Tracking Flow

### 1. Customer Receipts & Confirmation:
- The moment a customer pays, Shopify sends an automated **Order Confirmation Email / WhatsApp / SMS** containing their Order ID (`#1001`), pack breakdown, and delivery address.
- You can customize this email in **Shopify Admin → Settings → Notifications → Order confirmation**.

### 2. Merchant Order Alerts:
- Shopify alerts you and your team under **Settings → Notifications → Staff order notifications**.

### 3. GST Invoices:
- Shiprocket automatically creates a GST Tax Invoice when shipping the order.
- To also allow PDF invoice downloads directly from Shopify, install the free **Shopify Order Printer** app.

### 4. Courier Assignment & "Track Order" Link:
- When you click **Ship Now** in Shiprocket, it assigns the best courier (BlueDart, Delhivery, DTDC, etc.) and generates an **AWB Number**.
- Shiprocket automatically updates Shopify's order status to **Fulfilled** and attaches the live tracking URL.
- Customer receives an SMS and WhatsApp notification with their direct **Track Order** link (`https://shiprocket.co/tracking/<AWB>`).

---

## 🚀 Quick Verification Checklist

- [ ] Product created in Shopify with 3 variants (`Single Box`, `Duo Pack`, `Party Trio`).
- [ ] Prices & Weights entered for all 3 variants.
- [ ] "Continue selling when out of stock" checked for all variants.
- [ ] 3 Variant IDs copied and pasted into `CRUMBLY_CONFIG` inside `index.html`.
- [ ] Razorpay active under Shopify Settings → Payments.
- [ ] Shiprocket channel connected to Shopify with Auto-sync enabled for `Paid` orders.
