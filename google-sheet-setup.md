# Sending waitlist signups to a Google Sheet

No server needed. A Google Apps Script Web App sits in front of your sheet and
accepts the form post.

---

## 1 · Make the sheet

New Google Sheet. Name it whatever you like. In row 1, add these headers in
columns A–E, spelled exactly:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| `Timestamp` | `Name` | `Email` | `Phone` | `Source` | `Referrer` | `User agent` |

## 2 · Add the script

In the sheet: **Extensions → Apps Script**. Delete whatever is there and paste
this in full.

```javascript
const SHEET_NAME = 'Sheet1';   // change if you renamed the tab

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);                     // serialise concurrent submits
  try {
    const p = (e && e.parameter) || {};
    const email = String(p.email || '').trim().toLowerCase();
    const name  = String(p.name  || '').trim();
    const phone = String(p.phone || '').trim();

    // basic shape check — the page validates too, but never trust the client
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return json({ ok: false, error: 'invalid email' });
    }

    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);

    // skip duplicates so one person refreshing doesn't fill the sheet
    // (email lives in column C now, hence the 3)
    const seen = sh.getLastRow() > 1
      ? sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues().flat()
      : [];
    if (seen.some(v => String(v).trim().toLowerCase() === email)) {
      return json({ ok: true, duplicate: true });
    }

    sh.appendRow([
      new Date(),
      name,
      email,
      phone ? "'" + phone : '',   // leading quote keeps +91… as text, not a number
      p.source   || '',
      p.referrer || '',
      p.ua       || ''
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// lets you open the URL in a browser to check it's alive
function doGet() {
  return json({ ok: true, alive: true });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3 · Deploy it

1. **Deploy → New deployment**
2. Type: **Web app**
3. *Execute as:* **Me**
4. *Who has access:* **Anyone** — this matters. "Anyone with a Google account"
   will fail, because your visitors aren't signed in.
5. **Deploy**, then authorise when prompted. Google will warn that the app is
   unverified; it's your own script, so continue through.
6. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy…/exec`

## 4 · Paste it into the site

Open `index.html`, find this line near the top of the waitlist script:

```javascript
const SHEET_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
```

Replace the placeholder with your URL. That's the only edit.

## 5 · Test it

Open the page, submit a real address, then check the sheet. A row should appear
within a second or two.

If nothing arrives, open the browser console (F12) and submit again:

- **`no endpoint set`** — the placeholder is still there.
- **401 / 403** — access is not set to "Anyone". Redeploy.
- **CORS error but a row still lands** — expected and harmless; see below.
- **Nothing at all in console and no row** — open the Web app URL directly in a
  tab. You should see `{"ok":true,"alive":true}`. If you don't, the deployment
  didn't publish.

---

## Notes worth knowing

**Redeploy after every script edit.** Apps Script serves the last *deployed*
version, not what's in the editor. Use **Deploy → Manage deployments → Edit →
Version: New version**. Forgetting this is the most common reason a change
appears to do nothing.

**Why the request is url-encoded, not JSON.** Sending
`Content-Type: application/json` triggers a CORS preflight, which Apps Script
doesn't answer. Url-encoded form data is a "simple request" and skips preflight
entirely. That's why the page builds a `URLSearchParams` body.

**Why there's a `no-cors` fallback.** Apps Script redirects to
`googleusercontent.com` to serve its response, and that hop sometimes fails
CORS depending on the browser. The page first tries a readable request so it can
report genuine errors, then falls back to fire-and-forget. In the fallback the
response is opaque — the row still gets written, but the page can't *confirm*
it. So run the test in step 5 rather than trusting the success screen alone.

**Duplicates** are skipped on email, case-insensitively. The script also takes a
lock so two people submitting at the same moment can't overwrite each other's
row.

**The spam trap.** The form has a hidden field real users never see. If it comes
back filled, the submission is dropped silently in the browser. It costs nothing
and stops naive bots. It won't stop a determined one — for that you'd add
reCAPTCHA or Turnstile, worth doing only if you start seeing junk.

**Getting notified.** In the sheet: **Tools → Notification settings → Notify me
of changes** for an email when a row lands. Or add a `MailApp.sendEmail(...)`
call in the script, but note the daily quota on free accounts.

**Phone numbers are stored as text.** The script prefixes them with an
apostrophe, otherwise Sheets treats `+91 98765 43210` as a formula or strips the
leading zero. The apostrophe doesn't display in the cell.

**Name is required, phone is optional.** The page enforces that; the script
accepts a blank phone and writes an empty cell.

**Privacy.** You're now collecting names and phone numbers as well as emails. Keep the sheet's sharing set to
private, don't hand the link around, and only email these people about the
launch you promised. The page currently commits to "one message, nothing else" —
worth honouring, both ethically and because it's what they consented to.
