# NoteScribe AI — NDIS Progress Note Writer

AI-powered documentation tool for Australian disability support workers. Write professional, NDIS-compliant progress notes, incident reports, and support plans in under 30 seconds.

**Stack:** Next.js 16 · Tailwind CSS v4 · Ollama (local LLM) · Claude API · Stripe · SaaS Engine

---

## Features

| Feature | Description |
|---|---|
| AI note generation | Converts rough shift notes into professional NDIS documentation |
| 6 report types | Progress Note, Incident Report, Handover, Support Plan, Goal Review, FCA — plus custom |
| Local AI (Ollama) | Runs llama3 locally — no API key needed, notes never leave the machine |
| Cloud AI (Claude) | Falls back to Claude Haiku when `USE_LOCAL_LLM=false` |
| Client profiles | Save participant details + NDIS goals, auto-fill on every note |
| Note history | Search, filter by type, download .txt, print to PDF, delete |
| AI Coach | Analyses all your notes, gives NDIS compliance coaching via llama3 |
| Billing | Stripe subscription — Free (5 notes/month) or Pro ($79 AUD/month, unlimited) |
| Help & Docs | Full in-app user guide, NDIS language guide, audit checklist |
| Mobile nav | Responsive hamburger menu for phone use |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

### 3. Install and start Ollama (local AI)

```bash
# Install Ollama from https://ollama.com
ollama pull llama3
ollama serve
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_ENGINE_URL` | Yes | SaaS Engine base URL |
| `SAAS_ENGINE_API_KEY` | Yes | Server-side engine API key |
| `SAAS_ENGINE_ORG_ID` | Yes | Engine organisation ID |
| `SAAS_ENGINE_PROJECT_ID` | Yes | Engine project ID |
| `NEXT_PUBLIC_ORG_ID` | Yes | Same as ORG_ID (browser-exposed) |
| `NEXT_PUBLIC_PROJECT_ID` | Yes | Same as PROJECT_ID (browser-exposed) |
| `NEXT_PUBLIC_API_KEY` | Yes | Same as API_KEY (browser-exposed, read-only) |
| `ANTHROPIC_API_KEY` | No* | Claude API key — only needed when `USE_LOCAL_LLM=false` |
| `USE_LOCAL_LLM` | Yes | `true` = use Ollama, `false` = use Claude |
| `OLLAMA_MODEL` | Yes | Ollama model name, e.g. `llama3` |
| `OLLAMA_BASE_URL` | Yes | Ollama server URL, default `http://localhost:11434` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Price ID for Pro plan |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app's public URL (e.g. `https://notescribe.ai`) |

---

## Project Structure

```
app/
├── page.tsx                        # Landing page
├── login/page.tsx                  # Login + register (tabs)
├── forgot-password/page.tsx        # Password reset
├── privacy/page.tsx                # Privacy policy
├── terms/page.tsx                  # Terms of service
├── dashboard/
│   ├── layout.tsx                  # Dashboard layout wrapper
│   ├── DashboardShell.tsx          # Nav, header, mobile menu
│   ├── page.tsx                    # Write Note (main feature)
│   ├── history/page.tsx            # Note history + export
│   ├── clients/page.tsx            # Client profiles
│   ├── advisor/page.tsx            # AI Documentation Coach
│   ├── help/page.tsx               # Help & documentation
│   ├── settings/page.tsx           # Account + password
│   └── billing/page.tsx            # Subscription management
└── api/
    ├── generate-note/route.ts      # Core AI note generation
    ├── advisor/route.ts            # AI coach (analyses notes)
    ├── auth/
    │   ├── login/route.ts          # Auth proxy
    │   ├── register/route.ts       # Auth proxy
    │   ├── forgot-password/route.ts
    │   └── subscription/route.ts   # Read plan from engine
    ├── billing/
    │   └── create-checkout/route.ts  # Stripe checkout session
    └── webhooks/
        └── stripe/route.ts         # Stripe webhook handler
```

---

## AI Generation

The `/api/generate-note` route handles all AI generation.

**Local mode (default, `USE_LOCAL_LLM=true`):**
- Uses Ollama with llama3
- Notes never leave the machine
- No API cost
- Requires Ollama running locally

**Cloud mode (`USE_LOCAL_LLM=false`):**
- Uses Claude Haiku via Anthropic API
- Faster, more consistent output
- Requires `ANTHROPIC_API_KEY`
- Costs ~$0.001 per note

Switch by setting `USE_LOCAL_LLM=true/false` in `.env.local`.

---

## Stripe Setup

### Local testing

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will print a webhook secret — add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### Production

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Data Model (SaaS Engine entity types)

| Entity type | Fields | Description |
|---|---|---|
| `ndis_note` | userId, clientName, reportType, generatedNote, rawInput, workerName, duration, date, llm | Generated notes |
| `client_profile` | userId, name, ndisNumber, dob, diagnosis, goals, supports | Saved participant profiles |
| `usage_event` | userId, plan, action | Monthly usage tracking for free tier |
| `subscription` | userId, stripeCustomerId, stripeSubscriptionId, plan, status | Active subscriptions |

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

**Important:** Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://notescribe.vercel.app`) — this is used for Stripe redirect URLs.

---

## NDIS Compliance

NoteScribe AI generates notes that meet:
- **NDIS Practice Standards** (Quality Indicators)
- **NDIS Quality and Safeguards Commission** documentation requirements
- **Person-centred language** standards
- **Australian Privacy Principles** (APP) for participant data handling

Workers should always review generated notes before submitting. The AI is a drafting tool, not a replacement for professional judgment.

---

## Pricing

| Plan | Price | Notes |
|---|---|---|
| Free | $0/month | 5 AI notes per month |
| Pro | $79 AUD/month | Unlimited notes, all features |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Auth + Data | SaaS Engine (Railway) |
| Local AI | Ollama + LangChain (`@langchain/ollama`) |
| Cloud AI | Anthropic Claude Haiku (`@anthropic-ai/sdk`) |
| Payments | Stripe (`stripe`, `@stripe/stripe-js`) |
| Icons | Lucide React |
| Language | TypeScript |
| Deploy | Vercel |

---

## Support

Email: support@notescribe.ai
