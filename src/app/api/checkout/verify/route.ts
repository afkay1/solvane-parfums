import { NextResponse } from "next/server";
import { bad, clean } from "@/lib/commerce/http";
import { isSessionPaid, sendOrderEmails, sessionOrderLines } from "@/lib/commerce/services";
import { getOrder, recordRedemption, setOrderStatus, isDbMode, addSubscriber } from "@/lib/commerce/store";
import { vouchersFor } from "@/lib/commerce/vouchers";
import type { Currency } from "@/lib/commerce/markets";

export const dynamic = "force-dynamic";

/** Called by the confirmation page after Stripe redirects back. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = clean(url.searchParams.get("ref"), 20).toUpperCase();
  const sessionId = clean(url.searchParams.get("session_id"), 200);
  if (!/^SLV-[A-Z0-9]{6}$/.test(ref) || !sessionId) return bad("Invalid request.", 400);

  const paid = await isSessionPaid(sessionId, ref);
  if (!paid) return NextResponse.json({ ok: true, paid: false });

  if (isDbMode()) {
    const order = await getOrder(ref);
    if (order && order.status !== "paid") {
      order.status = "paid";
      order.vouchers = vouchersFor(order);
      await setOrderStatus(ref, "paid");
      if (order.summary.discount && order.summary.discount.code !== "WELCOME10") await recordRedemption(order.summary.discount.code, ref);
      if (order.summary.giftCard) await recordRedemption(order.summary.giftCard.code, ref);
      if (order.newsletter) await addSubscriber(order.customer.email, "checkout").catch(() => undefined);
      await sendOrderEmails(order).catch(() => undefined);
    }
    return NextResponse.json({ ok: true, paid: true, vouchers: order ? vouchersFor(order) : [] });
  }

  // No database: rebuild the vouchers from the order summary stored on the Stripe session.
  const meta = await sessionOrderLines(sessionId).catch(() => null);
  const vouchers = meta
    ? vouchersFor({ ref, summary: { currency: meta.c as Currency, lines: meta.l.map(([kind, qty, unit, to]) => ({ kind, qty, unit, gift: { to } })) } })
    : [];
  return NextResponse.json({ ok: true, paid: true, vouchers });
}
