# Solvane: niche perfume e-commerce store

Solvane is a fictional independent perfume house in Grasse, built by MYFRIX as a concept project. The site is a complete direct-to-consumer store. It has:

- 8 eaux de parfum in 50 ml, 100 ml and 2 ml sizes
- a Discovery Set whose price comes back as credit
- 3 candles
- digital gift cards
- a six-question Scent Finder
- multi-currency pricing
- a 3-step checkout
- order tracking
- an admin dashboard

Stack: Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, GSAP + ScrollTrigger, Lenis and next/font (Instrument Serif, Inter, IBM Plex Mono). Optional services: Postgres (Neon), Stripe Checkout, Resend.

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000. The whole store works immediately in **demo mode**, with no accounts or keys.

- `npm run build` then `npm start`: production build.
- `npm run check:links`: checks every internal link, anchor and image.

## Pages

| Area | Routes |
|---|---|
| Store | `/`, `/shop` (category and family filters, sorting), `/products/[slug]` (8 perfumes, 3 candles), `/collections`, `/collections/[family]` |
| Signature features | `/discovery-set`, `/scent-finder` (results can be shared with `?r=`), `/gifting` (gift card builder) |
| Brand | `/atelier`, `/faq`, `/shipping-returns`, `/contact`, `/policies` |
| Commerce | Bag drawer, `/cart`, `/checkout`, `/checkout/confirmation`, `/track`, `/admin` |
| API | `/api/checkout`, `/api/checkout/verify`, `/api/voucher`, `/api/orders/track`, `/api/newsletter`, `/api/contact`, `/api/admin/*` |

## How the commerce works

- **Markets.** The ship-to country sets the currency (USD, GBP, EUR or AED), the shipping rates and how tax is shown. The first visit picks a country from the visitor's time zone, and it can be changed in the header, footer or checkout.
- **One pricing engine** (`src/lib/commerce/pricing.ts`). It runs in the browser for instant totals and again on the server at checkout, so the price shown is always the price charged. It covers:
  - stock limits;
  - 2 free samples;
  - free gift wrap;
  - free-shipping thresholds;
  - US sales tax by state, VAT shown as included, and duties prepaid for international orders.
- **Codes:**
  - `WELCOME10` gives 10% off;
  - each Discovery Set generates a signed credit code worth its price, usable on a 50 or 100 ml bottle within 60 days;
  - each gift card generates a signed gift code.

  Codes are HMAC-signed with `ORDER_SECRET`, so they can't be forged. With a database, each code can be used only once.
- **Discovery Set and sample-only orders** always ship free.

## Demo mode vs live mode

| Feature | Demo (default) | Live (add environment variables) |
|---|---|---|
| Orders | Placed instantly, stored in the shopper's browser | Saved in Postgres (`DATABASE_URL`) |
| Payment | "Place demo order", no payment taken | Stripe Checkout with cards, Apple Pay, Google Pay (`STRIPE_SECRET_KEY`) |
| Emails | Confirmation page only | Order, contact and newsletter emails (`RESEND_API_KEY`, `EMAIL_FROM`) |
| Track order | Orders placed in this browser | Any order, looked up by number + email |
| Admin | Open, with generated sample orders | Password login (`ADMIN_PASSWORD`) and real orders |

### Switch on the database

1. In Vercel, open the project and go to **Storage → Create → Neon (Postgres)**. This adds `DATABASE_URL`.
2. Open the Neon SQL editor and run `db/schema.sql` once.
3. Add `ADMIN_PASSWORD` and `ORDER_SECRET` (a long random string).
4. Redeploy.

### Switch on Stripe (test mode)

1. Copy your **test** secret key (`sk_test_…`) into `STRIPE_SECRET_KEY`.
2. Set `NEXT_PUBLIC_SITE_URL` to your live URL.
3. Redeploy.

To test a payment, use card `4242 4242 4242 4242`, any future date and any CVC. Credit codes and gift codes are issued only after the payment succeeds.

## Editing content

- **Perfumes, candles, gift card, notes, reviews, stock:** `src/lib/data/products.ts`
- **Brand details, FAQs, atelier story, ingredients:** `src/lib/data/brand.ts`
- **Scent Finder questions and weights:** `src/lib/data/quiz.ts`
- **Countries, currencies, shipping rates, tax:** `src/lib/commerce/markets.ts`
- **Images:** `public/images/*.webp` (each also has a `-md.webp` size). Keep the file names when you replace an image.

The email, phone and address in `brand.ts` are placeholders. Replace them before using the site for a real brand.

## Quality

- **SEO:** Product structured data with offers, shipping details, return policy and reviews. Also ItemList, Organization, FAQPage and breadcrumbs, plus a sitemap, robots, canonical URLs and Open Graph.
- **Accessibility:**
  - skip link;
  - keyboard-operable menu, search, bag drawer (focus trapped, Esc closes), gallery, quiz and forms;
  - labelled fields with inline errors;
  - `prefers-reduced-motion` turns off all motion.
- **Performance:**
  - static pages wherever possible;
  - two pre-compressed WebP sizes per image;
  - self-hosted fonts;
  - no third-party scripts.

## Deploy

Push this `website` folder to GitHub, import it at vercel.com/new, set `NEXT_PUBLIC_SITE_URL` and `ORDER_SECRET`, and deploy.
