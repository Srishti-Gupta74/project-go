# G🌍
Project Go
### *Go Green. Go Clean. Go Smart.*

> **Project Go — India's waste-sorting assistant**  
> Built solo by Srishti Suman Gupta, BTech CSE Year 1

---

## 🌍 The Problem

India generates **62 million tonnes of waste every year.**  
**80% of it ends up in open dumps or rivers.**  
Most Indians simply don't know which bin to use — not because they don't care, but because no one ever showed them how.

**Project Go fixes that with one photo.**

---

## ✨ What It Does

Project Go is an AI-powered waste classification agent. You photograph any piece of waste, and the AI:

- **Identifies** exactly what the item is
- **Classifies** it into the correct waste category (wet, dry, hazardous, e-waste, sanitary)
- **Tells you** which bin to use and how to dispose of it
- **Calculates** the real environmental impact of recycling it — carbon saved, energy saved, wildlife protected
- **Finds** the 3 nearest recycling centers to you
- **Rewards** you with EcoCoins redeemable for real-world impact (plant a tree, protect sea turtles, clean ocean plastic)
- **Tracks** your real money earned from selling scrap to the kabadiwala
- **Educates** you on how your actions connect to the UN's 17 Sustainable Development Goals

---

## 🤖 The AI Agent

Project Go uses **Gemini 2.5 Flash** (via secure Vercel serverless functions) with three specialized agent calls:

| Agent Call | What It Does |
|------------|--------------|
| `analyze` | Vision model identifies waste item from photo, classifies category, gives disposal instructions |
| `impact` | Calculates environmental impact — carbon %, energy, water, wildlife effect, fun facts |
| `centers` | Finds 3 nearest real recycling centers using geolocation |

The API key is **never exposed to the frontend** — all AI calls go through a Vercel serverless function.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Hooks), Recharts, pure CSS |
| AI | Gemini 2.5 Flash (Vision + Text) |
| Backend | Vercel Serverless Functions (Node.js) |
| Build | Vite |
| Deployment | Vercel (CI/CD via GitHub) |
| Geolocation | Browser Geolocation API + OpenStreetMap Nominatim |
| Storage | localStorage (per-user, no backend needed) |
| Fonts | Fraunces (serif) + Outfit (sans) via Google Fonts |

---

## 🌟 Features

### 📸 AI Waste Scanner
- Upload photo or use live camera (back-facing, flippable)
- Scanning line animation for camera mode
- Real-time AI classification with confidence score
- Bin recommendation (Green / Blue / Red / E-Waste Center / Black)
- Environmental impact panel with carbon %, energy saved, wildlife impact
- Nearest recycling centers with Google Maps links

### 💰 Kabadiwala Earnings Tracker
- Log real money earned from selling scrap
- 12 preset items with typical kabadiwala rates (plastic, newspaper, iron, copper, etc.)
- Auto-calculates suggested earnings with "Use this ↗" shortcut
- Charts of earnings over time
- Full trip history

### 🎁 Rewards Store
- 10 real-world rewards redeemable with EcoCoins
- Plant a real tree (SankalpTaru NGO)
- Fund sea turtle protection (Wildlife Trust of India)
- Solar lamp donation for rural families
- Eco certificates, discount coupons

### 🌍 SDG Goals Page
- Covers 11 of the UN's 17 Sustainable Development Goals
- Tap any SDG to learn how your recycling actions contribute
- Educational, beautiful, interactive

### 📊 Dashboard
- Level system (EcoCoins → Levels)
- Calendar view of scan history
- Charts: waste type breakdown, EcoCoins by category, carbon over time
- 7 unlockable badges (First Scan, Green Hero, EcoWarrior, etc.)

### 🎨 Design
- Animated **G🌍** logo cycling: Go Green → Go Clean → Go Smart → Go Local → Go Zero → Go Earth
- Full dark/light mode toggle
- Desktop (3-column sidebar layout) + Mobile (bottom tab bar) responsive
- Floating leaf animations, orb backgrounds, glass cards

---

## 🚀 Live Demo

**Deployed on Vercel**

---

## 🛠️ Run Locally

```bash
# Clone the repo
git clone https://github.com/Srishti-Gupta74/project-go.git
cd project-go/wastewise

# Install dependencies
npm install

# Set up environment
# Create .env locally or add to Vercel Dashboard:
# GEMINI_API_KEY=your_key_here

# Run dev server
npm run dev

# For full serverless API testing locally with Vercel CLI:
npm i -g vercel
vercel dev
```

---

## 📁 Project Structure

```
project-go/
├── vercel.json              # Vercel build configuration
├── api/
│   └── ai.js                # Vercel Serverless AI proxy (Gemini)
└── wastewise/
    ├── src/
    │   ├── App.jsx          # Entire React app
    │   ├── App.css          # Global styles & animations
    │   ├── main.jsx         # React entry point
    │   └── index.css        # Base CSS
    ├── api/
    │   └── ai.js            # Vercel Serverless Function (ESM route)
    ├── index.html           # HTML entry
    ├── package.json
    └── vite.config.js
```

---

## 🎯 SDGs Addressed

Project Go directly contributes to **11 of the 17 UN Sustainable Development Goals:**

SDG 1 · SDG 3 · SDG 6 · SDG 7 · SDG 8 · SDG 11 · **SDG 12** · **SDG 13** · SDG 14 · SDG 15 · SDG 17

---

## 👩‍💻 About the Builder

**Team Prakriti — Srishti Suman Gupta**  
BTech CSE Year 1 · Solo participant

---

*"62 million tonnes of waste. Most Indians don't know which bin to use. Project Go fixes that with one photo."*
