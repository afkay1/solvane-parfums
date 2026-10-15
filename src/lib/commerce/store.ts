import { neon } from "@neondatabase/serverless";
import { computeCart, type CartLine } from "./pricing";
import { COUNTRIES } from "./markets";
import type { Order, OrderStatus } from "./order";

/**
 * Storage adapter. With DATABASE_URL set, orders, redemptions, subscribers and messages live
 * in Postgres (see db/schema.sql). Without it the store runs in demo mode: orders are kept in
 * the customer's browser and the admin shows generated sample data.
 */
export const isDbMode = () => Boolean(process.env.DATABASE_URL);
const db = () => neon(process.env.DATABASE_URL as string);
type Row = Record<string, unknown>;

export async function saveOrder(o: Order) {
  if (!isDbMode()) return;
  const sql = db();
  await sql`insert into orders (ref, created_at, email, status, market, currency, total, data)
    values (${o.ref}, ${o.createdAt}, ${o.customer.email.toLowerCase()}, ${o.status}, ${o.summary.market}, ${o.summary.currency}, ${o.summary.total}, ${JSON.stringify(o)}::jsonb)`;
}

export async function setOrderStatus(ref: string, status: OrderStatus) {
  if (!isDbMode()) return;
  const sql = db();
  await sql`update orders set status = ${status}, data = jsonb_set(data, '{status}', to_jsonb(${status}::text)) where ref = ${ref}`;
}

export async function getOrder(ref: string): Promise<Order | null> {
  if (!isDbMode()) return null;
  const sql = db();
  const rows = (await sql`select data from orders where ref = ${ref.toUpperCase()} limit 1`) as Row[];
  return rows[0] ? (rows[0].data as Order) : null;
}

export async function findOrder(ref: string, email: string): Promise<Order | null> {
  if (!isDbMode()) return null;
  const sql = db();
  const rows = (await sql`select data from orders where ref = ${ref.toUpperCase()} and email = ${email.toLowerCase()} limit 1`) as Row[];
  return rows[0] ? (rows[0].data as Order) : null;
}

export async function listOrders(): Promise<Order[]> {
  if (!isDbMode()) return sampleOrders();
  const sql = db();
  const rows = (await sql`select data from orders order by created_at desc limit 1000`) as Row[];
  return rows.map((r) => r.data as Order);
}

export async function codeRedeemed(code: string): Promise<boolean> {
  if (!isDbMode()) return false;
  const sql = db();
  const rows = (await sql`select 1 from redemptions where code = ${code} limit 1`) as Row[];
  return rows.length > 0;
}

export async function welcomeUsed(email: string): Promise<boolean> {
  if (!isDbMode()) return false;
  const sql = db();
  const rows = (await sql`select 1 from orders where email = ${email.toLowerCase()} and status = 'paid' limit 1`) as Row[];
  return rows.length > 0;
}

export async function recordRedemption(code: string, ref: string) {
  if (!isDbMode()) return;
  const sql = db();
  await sql`insert into redemptions (code, order_ref) values (${code}, ${ref}) on conflict do nothing`;
}

export async function addSubscriber(email: string, source: string) {
  if (!isDbMode()) return;
  const sql = db();
  await sql`insert into subscribers (email, source) values (${email.toLowerCase()}, ${source}) on conflict (email) do nothing`;
}

export async function saveMessage(m: { name: string; email: string; topic: string; orderRef: string; body: string }) {
  if (!isDbMode()) return;
  const sql = db();
  await sql`insert into messages (name, email, topic, order_ref, body) values (${m.name}, ${m.email}, ${m.topic}, ${m.orderRef}, ${m.body})`;
}

/* ---------------- Demo sample orders for the admin dashboard ---------------- */

const FIRST = ["Emma", "Lucas", "Olivia", "Mateo", "Aisha", "Noah", "Sophie", "Liam", "Yuki", "Isabella", "Ethan", "Mia", "Omar", "Chloe", "Leo", "Ava", "James", "Nora", "Hugo", "Layla", "Grace", "Daniel", "Camille", "Ryan", "Fatima", "Thomas", "Amelia", "Khalid", "Julia", "Ben"];
const LAST = ["Laurent", "Meyer", "Bennett", "García", "Rahman", "Fischer", "Dubois", "O’Connor", "Tanaka", "Rossi", "Clarke", "Jansen", "Haddad", "Martin", "Nilsson", "Kowalski", "Wright", "Berg", "Silva", "Khan"];
const WEIGHTED_COUNTRIES = ["US", "US", "US", "US", "GB", "GB", "FR", "DE", "AE", "AE", "NL", "IT", "SA", "CA", "AU", "ES", "IE", "SE", "JP", "SG"];
const BASKETS: CartLine[][] = [
  [{ slug: "discovery-set", variant: "set", qty: 1 }],
  [{ slug: "santal-doux", variant: "100", qty: 1 }],
  [{ slug: "sol-blanc", variant: "50", qty: 1 }],
  [{ slug: "ombre-doud", variant: "100", qty: 1 }, { slug: "candle-ombre", variant: "220", qty: 1 }],
  [{ slug: "discovery-set", variant: "set", qty: 1 }],
  [{ slug: "vetiver-mer", variant: "100", qty: 1 }],
  [{ slug: "rose-nocturne", variant: "50", qty: 1 }, { slug: "iris-poudre", variant: "2", qty: 1 }],
  [{ slug: "figue-lente", variant: "50", qty: 1 }, { slug: "candle-jardin", variant: "220", qty: 1 }],
  [{ slug: "cuir-fume", variant: "100", qty: 1 }],
  [{ slug: "santal-doux", variant: "50", qty: 2 }],
  [{ slug: "discovery-set", variant: "set", qty: 2 }],
  [{ slug: "candle-sel", variant: "220", qty: 1 }, { slug: "candle-jardin", variant: "220", qty: 1 }, { slug: "candle-ombre", variant: "220", qty: 1 }],
  [{ slug: "iris-poudre", variant: "50", qty: 1 }],
  [{ slug: "sol-blanc", variant: "100", qty: 1 }, { slug: "vetiver-mer", variant: "50", qty: 1 }],
  [{ slug: "gift-card", variant: "gc", qty: 1, gift: { amount: 100, to: "Sam", email: "sam@example.com", from: "Alex", message: "Happy birthday!", date: "2026-10-01" } }],
  [{ slug: "ombre-doud", variant: "50", qty: 1 }],
];

/** Small deterministic PRNG so the demo dashboard is stable between reloads. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function sampleOrders(now = Date.now()): Order[] {
  const day0 = Math.floor(now / 86_400_000) * 86_400_000;
  const out: Order[] = [];
  const rand = rng(20261015);
  for (let i = 0; i < 140; i++) {
    const ago = Math.floor(Math.pow(rand(), 1.15) * 30 * 24) * 3_600_000 + Math.floor(rand() * 3_600_000);
    const createdAt = new Date(day0 + 20 * 3_600_000 - ago);
    if (createdAt.getTime() > now) continue;
    const country = WEIGHTED_COUNTRIES[Math.floor(rand() * WEIGHTED_COUNTRIES.length)];
    const basket = BASKETS[Math.floor(rand() * BASKETS.length)];
    const useCredit = basket.some((l) => l.variant === "100" || l.variant === "50") && rand() < 0.3;
    const useWelcome = !useCredit && rand() < 0.18;
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    const summary = computeCart({
      lines: basket,
      samples: ["sol-blanc", "iris-poudre"],
      giftWrap: rand() < 0.25,
      code: useCredit ? "CREDIT-38USD-DEMO00-DEMO00" : useWelcome ? "WELCOME10" : "",
      voucher: useCredit ? { code: "CREDIT-38USD-DEMO00-DEMO00", kind: "credit", amount: 38, currency: "USD" } : null,
      country,
      region: country === "US" ? ["NY", "CA", "TX", "FL", "IL", "WA"][Math.floor(rand() * 6)] : "",
      shipping: rand() < 0.15 ? "express" : "standard",
    });
    out.push({
      ref: `SLV-${(482100 + i * 37).toString(36).toUpperCase()}`,
      createdAt: createdAt.toISOString(),
      status: rand() < 0.03 ? "cancelled" : "paid",
      payment: "demo",
      customer: {
        email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
        firstName: first,
        lastName: last,
        phone: "",
        address1: "",
        address2: "",
        city: "",
        region: "",
        postal: "",
        country: COUNTRIES.find((c) => c.code === country)?.code ?? "US",
      },
      newsletter: rand() < 0.6,
      giftMessage: "",
      summary,
      vouchers: [],
    });
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
