# ELLOLING Website — Backend & Hosting Setup Guide

## Overview

| Layer | Tool | Cost |
|---|---|---|
| Contact form backend | Formspree | Free (50 submissions/mo) |
| Hosting | GitHub Pages | Free |
| SSL / HTTPS | GitHub Pages (auto) | Free |

---

## PART 1 — Formspree Setup (5 Minutes)

### Step 1 — Create Your Formspree Account

1. Go to **https://formspree.io**
2. Click **Sign Up** → use `info@elloling.com`
3. Verify your email

---

### Step 2 — Create 3 Forms (one per form on your site)

You need **3 separate Formspree forms** — one for each page that has a form.

#### Form A — Contact Page (`contact.html`)

1. In Formspree dashboard → click **+ New Form**
2. Name it: `ELLOLING Contact Form`
3. Email: `info@elloling.com`
4. Copy the **Form Endpoint ID** — it looks like: `xpwzgkla`
5. Your full endpoint will be: `https://formspree.io/f/xpwzgkla`

#### Form B — Support Page (`support.html`)

1. Click **+ New Form**
2. Name it: `ELLOLING Support Tickets`
3. Email: `support@elloling.com`
4. Copy the **Form Endpoint ID**

#### Form C — CCTV Page (`cctv.html`)

1. Click **+ New Form**
2. Name it: `ELLOLING CCTV Survey Requests`
3. Email: `info@elloling.com`
4. Copy the **Form Endpoint ID**

---

### Step 3 — Paste Your IDs into nav.js

Open `nav.js` and find this block (around line 232):

```javascript
const FORMSPREE_IDS = {
  'contact-form': 'YOUR_CONTACT_FORM_ID',   /* ← Replace this */
  'support-form': 'YOUR_SUPPORT_FORM_ID',   /* ← Replace this */
  'cctv-form':    'YOUR_CCTV_FORM_ID'       /* ← Replace this */
};
```

Replace the placeholder values with your real IDs. Example:

```javascript
const FORMSPREE_IDS = {
  'contact-form': 'xpwzgkla',
  'support-form': 'mpwzabcd',
  'cctv-form':    'qwzrxyz1'
};
```

**That's all the code changes needed.**

---

### Step 4 — Enable Spam Protection in Formspree

In each form's Formspree dashboard:
1. Go to **Settings** → **Spam Filtering**
2. Enable **reCAPTCHA** (optional but recommended)
3. Enable **Email Confirmation** so Formspree sends a confirmation to each submitter

---

### Step 5 — Test a Submission

1. Open your website
2. Fill in the contact form and submit
3. Check `info@elloling.com` — you'll receive an email like this:

```
From: Formspree <no-reply@formspree.io>
Subject: New Contact Enquiry — ELLOLING

fname: John
lname: Doe
email: john@example.com
phone: +91 98765 43210
company: ABC Corp
service: Website Development
budget: ₹25,000 – ₹1,00,000
message: I need a portfolio website...
```

---

## PART 2 — How You Receive Client Information

### Where Does Client Data Go?

```
Client fills form → Formspree receives → Email sent to you
                                       → Stored in Formspree dashboard
```

### Viewing Submissions

1. Log in to **https://formspree.io/dashboard**
2. Click on your form (e.g. "ELLOLING Contact Form")
3. Click **Submissions** tab
4. All submissions are listed with timestamp, name, email, message etc.
5. You can **Export to CSV** for record-keeping

### Email Notifications

Every form submission sends an email to `info@elloling.com` automatically.
- Subject line: `New Contact Enquiry — ELLOLING` (set by the `_subject` hidden field)
- The email contains all form fields the client filled in

---

## PART 3 — GitHub Pages Hosting (Free)

### Step 1 — Create a GitHub Repository

1. Go to **https://github.com** → Sign up / Log in
2. Click **+** → **New Repository**
3. Repository name: `elloling-website` (or `YOUR-USERNAME.github.io` for root URL)
4. Set to **Public** (required for free GitHub Pages)
5. Click **Create Repository**

### Step 2 — Upload Your Website Files

#### Option A — Using GitHub Website (No Terminal Needed)

1. Open your repository on GitHub
2. Click **Add file** → **Upload files**
3. Drag and drop ALL your website files:
   ```
   index.html
   about.html
   contact.html
   support.html
   cctv.html
   amc.html
   pricing.html
   careers.html
   web-development.html
   nav.js
   style.css
   site.webmanifest
   _config.yml
   favicon.ico
   favicon-16x16.png
   favicon-32x32.png
   apple-touch-icon.png
   android-chrome-192x192.png
   android-chrome-512x512.png
   ```
4. Write commit message: `Initial website upload`
5. Click **Commit changes**

#### Option B — Using Git Terminal (Faster for Updates)

```bash
# First time only
git clone https://github.com/YOUR-USERNAME/elloling-website.git
cd elloling-website

# Copy all your files into this folder, then:
git add .
git commit -m "Initial website upload"
git push origin main
```

### Step 3 — Enable GitHub Pages

1. In your repository → click **Settings**
2. Left sidebar → click **Pages**
3. Under **Source** → select **Deploy from a branch**
4. Branch: `main` | Folder: `/ (root)`
5. Click **Save**
6. Wait ~2 minutes
7. Your site is live at: `https://YOUR-USERNAME.github.io/elloling-website/`

### Step 4 — Update Internal Links (if using subfolder URL)

If your URL is `https://username.github.io/elloling-website/` (not root), check that all links in your HTML use relative paths (e.g., `href="contact.html"` not `href="/contact.html"`). Your files already use relative paths — no change needed.

---

## PART 4 — Files to Include / Exclude

### ✅ Upload These Files to GitHub

```
index.html, about.html, contact.html, support.html,
cctv.html, amc.html, pricing.html, careers.html,
web-development.html, nav.js, style.css,
site.webmanifest, _config.yml,
favicon.ico, *.png (all favicon/icon files)
```

### ❌ Do NOT Upload These Files

```
firebase.json        — No longer needed (removed)
_htaccess            — Apache only, not needed on GitHub Pages
FORMSPREE_SETUP.md   — Internal guide, keep private
.env files           — Never upload secrets
```

---

## PART 5 — Updating Your Website

### When You Make Changes

```bash
# Edit your HTML/CSS/JS files locally
# Then push to GitHub:

git add .
git commit -m "Update contact page copy"
git push origin main

# GitHub Pages rebuilds automatically in ~1 minute
```

---

## PART 6 — Formspree Free Plan Limits

| Feature | Free Plan |
|---|---|
| Submissions per month | 50 total across all forms |
| Email notifications | ✅ Yes |
| Spam filtering | ✅ Yes |
| Dashboard access | ✅ Yes |
| CSV export | ✅ Yes |
| Custom redirect | ✅ Yes |

**50 submissions/month = ~1-2 client enquiries per day — enough to start.**

When you scale up, the paid plan is ₹700/month for unlimited submissions.

---

## Quick Reference — IDs to Replace

| File | What to Replace | Where to Find It |
|---|---|---|
| `nav.js` line ~232 | `YOUR_CONTACT_FORM_ID` | Formspree dashboard → Contact form endpoint |
| `nav.js` line ~233 | `YOUR_SUPPORT_FORM_ID` | Formspree dashboard → Support form endpoint |
| `nav.js` line ~234 | `YOUR_CCTV_FORM_ID` | Formspree dashboard → CCTV form endpoint |
| `_config.yml` line 8 | `YOUR-USERNAME` | Your GitHub username |

---

*Guide version: 1.0 | ELLOLING Corporation | info@elloling.com*
