# CRUMBLY™ — Google Apps Script Setup (VIP Access & Waitlist)

This Google Apps Script captures VIP early-access signups (for **Madagascar Vanilla**, **Red Velvet**, and **Wholesome Oats**) directly into your private Google Sheet in real time.

---

## 1 · Set Up Your Google Sheet

1. Create a new [Google Sheet](https://sheets.new).
2. Set the sheet tab name to **`Sheet1`**.
3. In **Row 1**, set these headers in **Columns A through H**:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| **Timestamp** | **Name** | **Email** | **Phone** | **Flavours Requested** | **Submission Type** | **Referrer** | **User Agent** |

---

## 2 · Add the Google Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete everything inside the editor and paste the following code:

```javascript
/**
 * ═════════════════════════════════════════════════════════════════════
 * CRUMBLY™ — VIP ACCESS & DROP WAITLIST GOOGLE APPS SCRIPT
 * ═════════════════════════════════════════════════════════════════════
 */

const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // 30s lock for concurrent requests
  
  try {
    const p = (e && e.parameter) || {};
    
    const name     = String(p.name || '').trim();
    const email    = String(p.email || '').trim().toLowerCase();
    const phone    = String(p.phone || '').trim();
    const flavours = String(p.flavours || '').trim();
    const type     = String(p.type || 'VIP Access Waitlist').trim();
    const referrer = String(p.referrer || '').trim();
    const ua       = String(p.ua || '').trim();
    
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return createJsonResponse({ ok: false, error: 'Invalid email address' });
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.getActiveSheet();
    }
    
    // Auto-create Header Row if Sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Flavours Requested',
        'Submission Type',
        'Referrer',
        'User Agent'
      ]);
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#261408');
      headerRange.setFontColor('#FFFDF9');
    }
    
    // Check for duplicate emails in Column C
    if (sheet.getLastRow() > 1) {
      const existingEmails = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues().flat();
      const isDuplicate = existingEmails.some(function(item) {
        return String(item).trim().toLowerCase() === email;
      });
      
      if (isDuplicate) {
        return createJsonResponse({ ok: true, message: 'Already subscribed', duplicate: true });
      }
    }
    
    // Format timestamp in Indian Standard Time (IST)
    const timestampFormatted = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    
    // Leading quote preserves formatting for +91 phone numbers
    const phoneFormatted = phone ? (phone.startsWith('+') || phone.startsWith("'") ? phone : "'" + phone) : '';
    
    // Append the row
    sheet.appendRow([
      timestampFormatted,
      name,
      email,
      phoneFormatted,
      flavours || 'All Drops',
      type,
      referrer,
      ua
    ]);
    
    return createJsonResponse({ ok: true, message: 'VIP Pass Reserved Successfully' });
    
  } catch (error) {
    return createJsonResponse({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({
    ok: true,
    status: 'online',
    service: 'CRUMBLY VIP Access Waitlist Webhook',
    timestamp: new Date().toISOString()
  });
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 3 · Deploy as Web App

1. Click **Deploy → New deployment** (top right blue button).
2. Click the ⚙️ gear icon next to *Select type* and select **Web app**.
3. Configure settings:
   - **Description**: `CRUMBLY VIP Waitlist v2`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: must be Anyone so website visitors can submit without Google login)*.
4. Click **Deploy**.
5. Grant permissions if prompted by clicking **Review permissions → Advanced → Go to Untitled project (unsafe) → Allow**.
6. Copy the generated **Web app URL** (e.g. `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 4 · Connect to Website

In `assets/js/main.js`, update the `SHEET_ENDPOINT` inside `CRUMBLY_CONFIG`:

```javascript
const CRUMBLY_CONFIG = {
  SHOPIFY_DOMAIN: "wbqudn-4r.myshopify.com",
  WHATSAPP_NUMBER: "917069666910",
  HELPLINE_NUMBER: "917069666910",
  HELPLINE_NUMBER_2: "917008246057",
  SHEET_ENDPOINT: "PASTE_YOUR_COPIED_URL_HERE"
};
```
