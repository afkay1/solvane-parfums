import { NextResponse } from "next/server";
import { computeCart, WELCOME_CODE, type CartLine, type Voucher } from "@/lib/commerce/pricing";
import { getCountry } from "@/lib/commerce/markets";
import { bad, clean, isEmail, limited, readJson } from "@/lib/commerce/http";
import { verifyVoucher, vouchersFor } from "@/lib/commerce/vouchers";
import { validateCustomer } from "@/lib/commerce/validate";
import { addSubscriber, codeRedeemed, recordRedemption, saveOrder, welcomeUsed } from "@/lib/commerce/store";
import { createCheckout, isStripeMode, newRef, sendOrderEmails } from "@/lib/commerce/services";
import type { Customer, Order } from "@/lib/commerce/order";

export const dynamic = "force-dynamic";

function readLines(v: unknown): CartLine[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > 30) return null;
  const out: CartLine[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") return null;
    const l = raw as Record<string, unknown>;
    const line: CartLine = { slug: clean(l.slug, 40), variant: clean(l.variant, 10), qty: Number(l.qty) };
    if (l.gift && typeof l.gift === "object") {
      const g = l.gift as Record<string, unknown>;
      line.gift = { amount: Number(g.amount), to: clean(g.to, 60), email: clean(g.email, 160).toLowerCase(), from: clean(g.from, 60), message: clean(g.message, 300), date: clean(g.date, 10) };
      if (!line.gift.to || !line.gift.from || !isEmail(line.gift.email) || !/^\d{4}-\d{2}-\d{2}$/.test(line.gift.date)) return null;
    }
    out.push(line);
  }
  return out;
}

export async function POST(req: Request) {
  if (limited(req, 12)) return bad("Too many attempts. Please wait a minute and try again.", 429);
  const body = await readJson(req);
  if (!body) return bad("Invalid request.", 400);
  if (clean(body.website)) return bad("Invalid request.", 400); // honeypot
  if (body.acceptTerms !== true) return bad("Please accept the terms of sale.");

  const c = (body.cart ?? {}) as Record<string, unknown>;
  const lines = readLines(c.lines);
  if (!lines) return bad("Your bag looks empty or has an invalid item. Please refresh and try again.");

  const cu = (body.customer ?? {}) as Record<string, unknown>;
  const customer: Customer = {
    email: clean(cu.email, 160).toLowerCase(),
    firstName: clean(cu.firstName, 60),
    lastName: clean(cu.lastName, 60),
    phone: clean(cu.phone, 20),
    address1: clean(cu.address1, 120),
    address2: clean(cu.address2, 120),
    city: clean(cu.city, 80),
    region: clean(cu.region, 80),
    postal: clean(cu.postal, 12).toUpperCase(),
    country: getCountry(clean(cu.country, 2)).code,
  };

  // Codes are always re-checked on the server.
  const code = clean(c.code, 40).toUpperCase();
  let voucher: Voucher | null = null;
  if (code && code !== WELCOME_CODE) {
    const v = verifyVoucher(code);
    if ("error" in v) return bad(v.error);
    if (await codeRedeemed(v.voucher.code)) return bad("This code has already been used.");
    voucher = v.voucher;
  }
  if (code === WELCOME_CODE && (await welcomeUsed(customer.email))) return bad("The welcome code is for first orders only.");

  const samples = Array.isArray(c.samples) ? c.samples.map((x) => clean(x, 40)).slice(0, 5) : [];
  const summary = computeCart({
    lines,
    samples,
    giftWrap: c.giftWrap === true,
    code,
    voucher,
    country: customer.country,
    region: customer.region,
    shipping: c.shipping === "express" ? "express" : "standard",
  });
  if (summary.errors.length) return bad(summary.errors[0]);
  if (code && summary.codeError) return bad(summary.codeError);

  const fieldErrors = validateCustomer(customer, summary.physical);
  const firstErr = Object.values(fieldErrors)[0];
  if (firstErr) return bad(firstErr);

  const stripe = isStripeMode();
  const order: Order = {
    ref: newRef(),
    createdAt: new Date().toISOString(),
    status: stripe ? "pending_payment" : "paid",
    payment: stripe ? "stripe" : "demo",
    customer,
    newsletter: body.newsletter === true,
    giftMessage: summary.giftWrap ? clean(c.giftMessage, 240) : "",
    summary,
    vouchers: [],
  };
  // Vouchers are issued only once an order is paid (immediately in demo mode).
  if (!stripe) order.vouchers = vouchersFor(order);

  try {
    await saveOrder(order);
  } catch {
    return bad("We couldn’t save your order. Please try again.", 500);
  }

  if (stripe) {
    try {
      const checkoutUrl = await createCheckout(order);
      return NextResponse.json({ ok: true, order, checkoutUrl });
    } catch (e) {
      return bad(e instanceof Error ? e.message : "Payment could not be started.", 502);
    }
  }

  if (voucher) await recordRedemption(voucher.code, order.ref);
  if (order.newsletter) await addSubscriber(customer.email, "checkout").catch(() => undefined);
  await sendOrderEmails(order).catch(() => undefined);
  return NextResponse.json({ ok: true, order });
}
