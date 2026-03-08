# WasteWise — Complete Setup & Deployment Guide

---

## What you have after this guide:
- ✅ A working React app in VS Code
- ✅ Gemini AI powering waste analysis (free tier)
- ✅ Your code on GitHub
- ✅ Live website on Netlify with a public URL

---

## STEP 1 — Install Node.js

Go to https://nodejs.org → Download the **LTS** version → Install it.

Open VS Code. Press `Ctrl + `` ` (backtick) to open the terminal.
Type this to confirm it worked:
```
node -v
```
You should see something like `v20.11.0`. If yes, continue.

---

## STEP 2 — Create the project

In the VS Code terminal, run these commands one by one:

```bash
cd Desktop
npm create vite@latest wastewise -- --template react
cd wastewise
npm install
npm install recharts
```

---

## STEP 3 — Drop in your files

Your project folder now looks like this:
```
wastewise/
  src/
    App.jsx        ← REPLACE THIS
    main.jsx       ← leave as-is
  index.html
  package.json
  vite.config.js
```

**3a.** Open `wastewise` in VS Code: File → Open Folder → select `wastewise`

**3b.** In the left panel, click `src/App.jsx`
- Select all (Ctrl+A), delete everything
- Open your downloaded `wastewise.jsx` file, copy everything, paste it in
- Save (Ctrl+S)

**3c.** Create a new folder called `netlify` inside your project root.
Inside that, create another folder called `functions`.
Inside that, create a file called `ai.js`.
Paste the contents of the `ai.js` file you downloaded from Claude into it.

Your structure should now be:
```
wastewise/
  netlify/
    functions/
      ai.js        ← NEW
  src/
    App.jsx        ← replaced
  netlify.toml     ← NEW (paste contents from Claude)
  ...
```

**3d.** Create `netlify.toml` in the root of your project (same level as `package.json`).
Paste the contents of the `netlify.toml` file from Claude into it.

---

## STEP 4 — Get your FREE Gemini API key

1. Go to https://aistudio.google.com
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key — it looks like `AIzaSy...`

**Keep this key secret — never put it directly in your code or commit it to GitHub.**

---

## STEP 5 — Test locally (optional but recommended)

Create a file called `.env` in your project root:
```
GEMINI_API_KEY=AIzaSyYOUR_KEY_HERE
```

Then run:
```bash
npm run dev
```

Note: The AI features won't work locally without also running Netlify Dev
(`npm install -g netlify-cli` then `netlify dev`), but the UI will load fine.
You can test the AI features after deploying to Netlify.

---

## STEP 6 — Push to GitHub

**6a.** Create a GitHub account at https://github.com if you don't have one.

**6b.** Install Git from https://git-scm.com if not already installed.
Check: type `git -v` in the terminal.

**6c.** Create a `.gitignore` file in your project root with this content:
```
node_modules/
dist/
.env
.env.local
```
This prevents your API key and large folders from being uploaded.

**6d.** In the VS Code terminal (inside wastewise folder):
```bash
git init
git add .
git commit -m "initial commit - WasteWise AgentathonX 2026"
```

**6e.** Go to https://github.com
- Click the **+** button (top right) → **New repository**
- Name: `wastewise`
- Set to **Public**
- Do NOT tick "Add README" or anything else
- Click **Create repository**

**6f.** GitHub shows you commands. Run these in your terminal:
```bash
git remote add origin https://github.com/YOURUSERNAME/wastewise.git
git branch -M main
git push -u origin main
```

Refresh the GitHub page — your code is live!

---

## STEP 7 — Deploy on Netlify

**7a.** Go to https://netlify.com → Sign up with your GitHub account.

**7b.** Click **"Add new site"** → **"Import an existing project"** → **GitHub**

**7c.** Authorize Netlify to access your GitHub. Select your `wastewise` repo.

**7d.** Build settings (should auto-detect, but verify):
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Click **Deploy site**.

**7e.** While it deploys, go to:
**Site configuration → Environment variables → Add a variable**

- Key: `GEMINI_API_KEY`
- Value: `AIzaSyYOUR_KEY_HERE` (your actual key from Step 4)

Click Save.

**7f.** Go back to Deploys → click **"Trigger deploy"** → **"Deploy site"**
(This redeploy picks up your environment variable.)

In ~60 seconds you'll have a live URL like `wastewise-abc123.netlify.app`.

---

## STEP 8 — Rename your site (optional)

In Netlify: **Site configuration → General → Site details → Change site name**
Set it to something like `wastewise-india` → your URL becomes `wastewise-india.netlify.app`

---

## Every time you update the code:

```bash
git add .
git commit -m "describe what you changed"
git push
```

Netlify automatically detects the push and redeploys. Your site updates in ~60 seconds.

---

## Summary of free tier limits (all generous for a hackathon):

| Service | Free limit |
|---------|-----------|
| Gemini API | 15 requests/min, 1500/day |
| Netlify hosting | 100GB bandwidth/month |
| Netlify functions | 125,000 calls/month |
| GitHub | Unlimited public repos |
| localStorage | ~5MB per user browser |

---

## Troubleshooting

**"Module not found: recharts"**
→ Run `npm install recharts` in the terminal

**AI features return errors on Netlify**
→ Check that GEMINI_API_KEY is set in Netlify environment variables
→ Trigger a redeploy after adding the variable

**White screen after deploy**
→ Check Netlify deploy logs for errors
→ Most common cause: a syntax error in App.jsx

**Camera doesn't work on deployed site**
→ Camera requires HTTPS — Netlify gives you HTTPS automatically, so this should work

---

*WasteWise · AgentathonX 2026 · Built with React + Gemini AI*
