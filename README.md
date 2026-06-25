# Zeshto Social Content Studio

Your private, installable app for creating 150 days of social media content for Zeshto handmade soaps.

---

## What this app does

- Shows you 150 ready-made posts (one for each day) for Instagram Reels, YouTube Shorts, and LinkedIn
- Each post has a hook, caption, hashtags, and a beautiful image design
- You tap "Download" or "Share" to post manually — no auto-posting, no Instagram/YouTube passwords needed
- Installs to your phone home screen like a real app (no App Store needed)

---

## Part 1 — Run it on your computer first (to test)

### Step 1: Install Node.js (one time only)

1. Go to **nodejs.org**
2. Click the big green "LTS" button to download
3. Install it (just click Next → Next → Finish)
4. To check it worked: open Terminal (Mac) or Command Prompt (Windows) and type `node --version`

### Step 2: Set up the settings file

1. In the `zeshto-studio` folder, find the file called `.env.example`
2. Make a copy of it and rename the copy to `.env.local`
3. Open `.env.local` in Notepad and fill in:
   - `OWNER_EMAIL` → the email you want to log in with (e.g. `you@gmail.com`)
   - `OWNER_PASSWORD` → a strong password (e.g. `Zeshto@2024!`)
   - `JWT_SECRET` → type anything long (e.g. `zeshto-super-secret-nobody-knows-2024`)
   - Leave `DATABASE_URL` blank for now

### Step 3: Start the app

Open Terminal / Command Prompt, navigate to the folder, and run:

```
npm run dev
```

Wait 10 seconds. You'll see: `Ready on http://localhost:3000`

### Step 4: First-time setup (ONE TIME ONLY)

Open your browser and go to:
```
http://localhost:3000/api/seed?secret=zeshto-seed-2024
```

You will see: `"Seeded successfully! 12 products, 150 posts."` — that's it, you're ready!

### Step 5: Log in

Go to `http://localhost:3000` — log in with your email and password from `.env.local`.

---

## Part 2 — Deploy FREE to Vercel (get your private https:// link)

### Step 1: Create a free GitHub account at github.com

### Step 2: Push your code to GitHub

In Terminal (inside the `zeshto-studio` folder):
```
git init
git add .
git commit -m "Zeshto Studio"
```
Then create a new repository on GitHub.com, and follow the instructions it gives you to push.

### Step 3: Create a free Vercel account

1. Go to **vercel.com**
2. Click **Sign Up** → **Continue with GitHub**

### Step 4: Deploy

1. On your Vercel dashboard, click **Add New Project**
2. Find your `zeshto-studio` repository → click **Import**
3. Click **Deploy** — wait about 2 minutes
4. You get a URL like `https://zeshto-studio-abc123.vercel.app` — this is your private app link!

### Step 5: Add your settings to Vercel

1. Click your project → **Settings** → **Environment Variables**
2. Add each line from your `.env.local`:
   - `OWNER_EMAIL`, `OWNER_PASSWORD`, `JWT_SECRET`, `SEED_SECRET`
3. Click **Save** after each one
4. Go to **Deployments** → click the 3 dots on the latest → **Redeploy**

### Step 6: Set up the free database

1. In Vercel, click your project → **Storage** tab
2. Click **Connect Store** → **Create New** → **Postgres**
3. Name it `zeshto-db` → click **Create & Continue**
4. Vercel automatically connects it — no extra steps!
5. Redeploy the project one more time

### Step 7: Run setup on the live site

Open your browser and go to:
```
https://YOUR-VERCEL-URL/api/seed?secret=zeshto-seed-2024
```

You'll see the success message — your live app is now loaded with all 150 posts!

---

## Part 3 — Add to Home Screen (use it like an app)

### On iPhone (Safari only — Chrome won't work for this)

1. Open your Vercel URL in **Safari**
2. Tap the **Share button** (the box with arrow at the bottom of screen)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **"Add"**
5. The Zeshto Studio icon now appears on your home screen!

### On Android (Chrome)

1. Open your Vercel URL in **Chrome**
2. Tap the **three dots** (top right corner)
3. Tap **"Add to Home Screen"** → **"Add"**
4. The icon appears on your home screen — opens like a full-screen app!

---

## Part 4 — How to post manually (every time)

1. Open the app → tap any day in the list
2. Choose platform: **Instagram Reel** / **YouTube Short** / **LinkedIn**
3. Change background if you like (tap any of the 20 colour squares)
4. Edit any text if you want
5. Tap **Download** → image saves to your phone
6. Tap **Copy Caption** → caption is in your clipboard
7. Tap **Copy Hashtags** → hashtags are in your clipboard
8. Open Instagram / YouTube / LinkedIn
9. Create new post → upload the downloaded image
10. Paste the caption → paste the hashtags below
11. Add your own music/audio in the app
12. Post!

**Tip on iPhone/Android:** Tap **Share** instead of Download — it opens the share sheet directly so you can send straight to Instagram or WhatsApp without saving first.

---

## Part 5 — First login (how your account is created)

Your account is created automatically when you run the seed URL in Step 4 (or Step 7 for Vercel). It uses the `OWNER_EMAIL` and `OWNER_PASSWORD` you set in your `.env.local` file. There is no public signup — only you can log in.

If you forget your password, update `OWNER_PASSWORD` in your `.env.local` (and in Vercel settings if deployed), then run the seed URL again.

---

## Part 6 — Updating product information

All product data is in one file: `data/pkb.json`

To update anything (price, ingredients, benefit claims):
1. Open `data/pkb.json` in a text editor
2. Find the product by name and change the value
3. Save the file
4. Push to GitHub → Vercel redeploys automatically

This is the single source of truth — updating here updates everything everywhere.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Nothing loads at localhost:3000 | Make sure `npm run dev` is still running in Terminal |
| Posts page is empty | Run the seed URL again (Part 1 Step 4) |
| "Invalid seed secret" error | Check the `secret=` value matches your `SEED_SECRET` |
| Download button does nothing | Try in Chrome browser; allow downloads if asked |
| Vercel deploy fails | Check ALL env variables are set in Vercel Settings |
| Can't find "Add to Home Screen" on iPhone | You must use Safari, not Chrome |

---

## Your details to save

Write these down somewhere safe:

- **App URL:** _your Vercel URL_
- **Login email:** _your OWNER_EMAIL_
- **Login password:** _your OWNER_PASSWORD_
