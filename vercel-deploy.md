# Putting Crumbly on Vercel

The site is plain HTML, CSS, JS and image files. There's no build step and no
framework, which makes this about as simple as web deployment gets. Vercel's free
Hobby plan covers everything here.

Two routes below. **Route A** is fastest. **Route B** is better if you'll keep
editing the site, which you will.

---

## Before you start

- A Vercel account — sign up at vercel.com, free, GitHub/Google login is fine.
- The unzipped `crumbly` folder. It must contain `index.html` at the top
  level, next to the `assets` folder. Not nested inside another folder.
- For Route A only: Node.js installed (`node -v` in a terminal should print a
  version). If it doesn't, get the LTS build from nodejs.org.

Check your folder looks like this:

```
crumbly/
├── index.html          ← must be at this level
├── vercel.json
├── google-sheet-setup.md
└── assets/
    ├── hero/    (120 frames)
    ├── choc/    (60 frames)
    ├── van/     (42 frames)
    ├── img/
    └── cookie-theme.mp3
```

---

## Route A · Command line (fastest)

Open a terminal, move into the folder, run one command.

```bash
cd path/to/crumbly
npx vercel
```

First run asks a short series of questions. The safe answers:

| Prompt | Answer |
|---|---|
| Set up and deploy? | **Y** |
| Which scope? | your own account |
| Link to existing project? | **N** |
| Project name? | `crumbly` (or press Enter) |
| In which directory is your code? | `./` — press Enter |
| Want to modify build settings? | **N** |

It uploads and prints a **Preview** URL. Open it and check the site works.

Then publish to the real URL:

```bash
npx vercel --prod
```

That gives you `crumbly.vercel.app` (or similar). Done.

To push changes later: edit your files, run `npx vercel --prod` again.

### If it asks about a framework

Choose **Other**. There's nothing to build. Leave the build command empty and
the output directory as the root.

---

## Route B · GitHub (better long-term)

Worth the extra ten minutes. Every push redeploys automatically, you get a
history you can roll back, and your teammates can contribute.

1. Create a new repository on github.com. Keep it private if you'd rather.
2. Upload the folder contents. Easiest without git: on the empty repo page click
   **uploading an existing file**, then drag everything in.
   - GitHub's web uploader takes 100 files at a time. You have ~240 frames, so
     do it in a few passes: `index.html` + `vercel.json` first, then each
     `assets/` subfolder separately.
   - If you know git, this is faster:
     ```bash
     cd crumbly
     git init && git add -A && git commit -m "Crumbly landing page"
     git branch -M main
     git remote add origin https://github.com/YOUR-NAME/crumbly.git
     git push -u origin main
     ```
3. In Vercel: **Add New → Project → Import** your repo.
4. Framework Preset: **Other**. Leave build command and output directory empty.
5. **Deploy.**

From now on, any change pushed to `main` goes live in under a minute.

---

## What you get

- A live HTTPS URL, certificate handled for you.
- A global CDN, so the 240 frame files load fast from wherever the visitor is.
- The caching rules in `vercel.json` — the frames are marked `immutable` for a
  year, so a returning visitor doesn't re-download 5 MB of cookies.
- A new preview URL for every deployment, so you can compare versions.

---

## Adding your own domain

Do this whenever, no redeploy needed.

1. Buy the domain. `.in` is roughly ₹500–900/year, `.com` roughly ₹1,000–1,500.
   Check the **renewal** price, not just the first year — some registrars
   advertise a cheap first year then renew at several times that.
2. Vercel → your project → **Settings → Domains → Add**. Enter the domain.
3. Vercel shows the exact DNS records to create. **Use the values on that
   screen**, not values copied from a guide — they change, and the dashboard is
   authoritative. You'll get one of two options:
   - **A + CNAME records** — add them in your registrar's DNS panel. Keeps your
     registrar in charge of DNS, so email on the domain still works.
   - **Nameservers** — point the whole domain at Vercel. Simpler, but Vercel then
     owns all DNS for it, so add MX records there if you want email.
4. Add both the apex (`coincookie.in`) and `www`. Vercel redirects one to the
   other; you choose which is canonical.
5. Wait. Usually minutes, sometimes a few hours. Vercel verifies and issues the
   certificate on its own.

**Tell me the domain once it's live** — `index.html` still has
`https://coincookie.example/` in its canonical link and Open Graph tags. Those
should point at the real domain so Google indexes it correctly and WhatsApp and
Instagram link previews render properly.

---

## Things that commonly go wrong

**Blank page, or 404 on the root.** `index.html` isn't at the top level of what
you deployed. If you dragged the *parent* folder in, everything sits one level
too deep. Redeploy from inside `crumbly`.

**Site loads but no cookies, no video scrub.** The `assets` folder didn't upload,
or only partly. Open the browser console (F12) — you'll see 404s naming the
missing files. Via GitHub's web uploader this usually means a batch was missed.

**Waitlist form does nothing.** Expected until you paste your Apps Script URL
into `index.html` — see `google-sheet-setup.md`. Until then it logs to the
console instead of saving.

**Form works locally but not on the live site.** Redeploy after editing
`index.html`. Vercel serves what you uploaded, not what's on your laptop.

**Slow first load.** The hero is 120 frames, about 2.8 MB. It's preloaded so the
scrub is smooth, and the flavour sequences load lazily, but the first visit on a
slow connection will take a moment. If you want it lighter, I can cut the hero to
80 frames — the difference is barely visible and it saves roughly a third.

**Changes don't show.** Hard-refresh (Ctrl/Cmd + Shift + R). The
`immutable` caching is aggressive by design; if you edit an asset *file* rather
than replacing it, rename it so browsers fetch the new one.

---

## After it's live

Turn on **Vercel Analytics** (project → Analytics). Free tier is enough and it
needs no code change. The number that matters is signups ÷ visitors. Everything
we've designed so far is an educated guess; once real people hit the page, you'll
know which parts work. Change one thing at a time so you can tell what caused
what.

---

*Vercel's dashboard changes fairly often. The commands above are stable, but if a
menu name here doesn't match what you see, trust the screen in front of you — and
tell me what it says, and I'll work it out with you.*
