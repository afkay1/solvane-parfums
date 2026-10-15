import { NextResponse } from "next/server";
import { bad, clean, isEmail, limited, readJson } from "@/lib/commerce/http";
import { findOrder, isDbMode } from "@/lib/commerce/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (limited(req, 10)) return bad("Too many attempts. Please wait a minute.", 429);
  const body = await readJson(req);
  const ref = clean(body?.ref, 20).toUpperCase();
  const email = clean(body?.email, 160).toLowerCase();
  if (!/^SLV-[A-Z0-9]{6}$/.test(ref)) return bad("Order numbers look like SLV-7KQ2MX.");
  if (!isEmail(email)) return bad("Please enter the email used for the order.");
  if (!isDbMode()) return NextResponse.json({ ok: false, demo: true, error: "We couldn’t find that order. In this demo store, orders are kept only in the browser they were placed in." }, { status: 404 });
  const order = await findOrder(ref, email);
  if (!order) return NextResponse.json({ ok: false, error: "We couldn’t find an order with that number and email." }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}
