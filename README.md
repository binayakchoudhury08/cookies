# Crumbly — landing page

Static coming-soon page. No build step: plain HTML, CSS, JS plus image assets.

## Deploying

See `vercel-deploy.md`.

## Waitlist

The form posts name, email and phone to a Google Sheet via Apps Script.
Setup and the script itself are in `google-sheet-setup.md`. Paste your Web App
URL into the `SHEET_ENDPOINT` constant in `index.html`.

## Assets — read this before committing

`assets/` holds **231 image files plus the audio track** that the page cannot work without:

| Folder | Files | Purpose |
|---|---|---|
| `assets/hero/` | 120 | hero scroll-scrub sequence |
| `assets/choc/` | 60 | chocolate flavour card sequence |
| `assets/van/` | 42 | vanilla flavour card sequence |
| `assets/img/` | 9 | cookie sprites, popper, hand shot |
| `assets/cookie-theme.mp3` | 1 | background music |

If the page loads but the animations are missing, the folders above did not
fully deploy. **GitHub's web uploader silently caps each batch at 100 files**,
so uploading through the browser needs several passes — or use git, which
doesn't have that limit:

```bash
git add -A && git commit -m "assets" && git push
```

Verify a deployment by opening `/assets/hero/f001.webp` on the live site. A 404
means the upload was incomplete. The browser console also names every frame that
failed.
