# CRUMBLY™ — Google Apps Script Setup (Waitlist Drops)

This Google Apps Script captures waitlist early-access signups (including **Name**, **Email**, **Phone**, **Delivery Address**, and **Flavours**) directly into your private Google Sheet in real time.

---

## 1 · Set Up Your Google Sheet

1. Create a new [Google Sheet](https://sheets.new).
2. Set the sheet tab name to **`Sheet1`**.
3. In **Row 1**, set these headers in **Columns A through I**:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| **Timestamp** | **Name** | **Email** | **Phone** | **Delivery Address** | **Flavours Requested** | **Submission Type** | **Referrer** | **User Agent** |

---

## 2 · Add the Google Apps Script

In your Google Sheet: **Extensions → Apps Script**. Paste this code:

```javascript
/**
 * ═════════════════════════════════════════════════════════════════════
 * CRUMBLY™ — DROP WAITLIST GOOGLE APPS SCRIPT
 * ═════════════════════════════════════════════════════════════════════
 */

const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  
  try {
    const p = (e && e.parameter) || {};
    
    const name     = String(p.name || '').trim();
    const email    = String(p.email || '').trim().toLowerCase();
    const phone    = String(p.phone || '').trim();
    const address  = String(p.address || '').trim();
    const flavours = String(p.flavours || '').trim();
    const type     = String(p.type || 'Waitlist').trim();
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
        'Delivery Address',
        'Flavours Requested',
        'Submission Type',
        'Referrer',
        'User Agent'
      ]);
      const headerRange = sheet.getRange(1, 1, 1, 9);
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
    
    // Append the lead row with Address in column E
    sheet.appendRow([
      timestampFormatted,
      name,
      email,
      phoneFormatted,
      address,
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

1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. Set **Execute as**: `Me`.
4. Set **Who has access**: **`Anyone`**.
5. Click **Deploy** and copy the Web app URL.
