# SellDesk — WhatsApp Sales Assistant

AI-powered tool that crafts perfect WhatsApp replies for Nigerian businesses, closing more sales automatically.

---

## Environment Variables

Add ONE variable to Vercel (Project Settings > Environment Variables):

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (`sk-ant-...`) |

No database. No other config needed.

---

## Deploy to Vercel

### GitHub method (recommended):
1. Unzip this folder
2. Go INSIDE the `selldesk` folder
3. Select ALL files inside (package.json must be visible at root)
4. Zip those files — NOT the folder itself
5. Upload to GitHub
6. Import to Vercel, add ANTHROPIC_API_KEY, deploy

### CLI method:
```bash
npm install
npx vercel
```

---

## Project Structure
```
selldesk/
  pages/
    index.js          → Full app (setup + WhatsApp simulator + AI analysis)
    404.js            → Not found page
    api/
      reply.js        → Claude API proxy (keeps API key server-side)
  styles/
    globals.css       → Base styles
  next.config.js
  vercel.json
  .env.example
```

---

## How It Works

1. Business owner sets up their business profile (name, industry, products, tone)
2. They paste a customer WhatsApp message
3. SellDesk returns:
   - Perfect reply to copy-paste
   - Alternative reply option
   - Conversion probability score
   - Intent detection (is customer ready to buy, negotiating, objecting?)
   - Sales strategy explanation
   - Follow-up tip

## Monetization (Future)
- Free: 10 replies/day
- Pro ₦10k/month: Unlimited + reply history + team access
