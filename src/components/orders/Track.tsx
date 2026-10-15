"use client";

import { useEffect, useState } from "react";
import { findLocalOrder, localOrders } from "@/lib/commerce/cart";
import { money } from "@/lib/commerce/markets";
import type { Order } from "@/lib/commerce/order";
import { fmtDate } from "@/lib/format";
import OrderDetails from "./OrderDetails";

export default function Track() {
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) {
      const o = findLocalOrder(r);
      if (o) setOrder(o);
      else setRef(r.toUpperCase());
    }
    setRecent(localOrders().slice(0, 5));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = ref.trim().toUpperCase();
    if (!/^SLV-[A-Z0-9]{6}$/.test(r)) return setErr("Order numbers look like SLV-7KQ2MX. You’ll find yours in your confirmation email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErr("Please enter the email used for the order.");
    const local = findLocalOrder(r);
    if (local && local.customer.email === email.trim().toLowerCase()) return setOrder(local);
    setBusy(true);
    try {
      const res = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: r, email }) });
      const j = (await res.json()) as { ok: boolean; order?: Order; error?: string };
      if (j.ok && j.order) setOrder(j.order);
      else setErr(j.error ?? "We couldn’t find that order.");
    } catch {
      setErr("We couldn’t look up your order. Please try again.");
    }
    setBusy(false);
  };

  if (order) {
    return (
      <div>
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
          <div>
            <p className="eyebrow text-smoke">Placed {fmtDate(order.createdAt)}</p>
            <h2 className="serif h2 mt-3">Order {order.ref}</h2>
          </div>
          <button type="button" onClick={() => setOrder(null)} className="link-arrow">
            Look up another order
          </button>
        </div>
        <div className="mt-10">
          <OrderDetails order={order} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
      <form onSubmit={submit} noValidate className="max-w-lg space-y-5">
        <div>
          <label htmlFor="t-ref" className="label">
            Order number
          </label>
          <input id="t-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="SLV-XXXXXX" className="field font-mono uppercase" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="t-email" className="label">
            Email
          </label>
          <input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" />
        </div>
        {err && (
          <p role="alert" className="err">
            {err}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn btn-dark">
          {busy ? "Looking…" : "Find my order"}
        </button>
      </form>
      {recent.length > 0 && (
        <div>
          <p className="eyebrow text-smoke">Recent orders on this device</p>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {recent.map((o) => (
              <li key={o.ref}>
                <button type="button" onClick={() => setOrder(o)} className="flex w-full items-center justify-between gap-4 py-4 text-left hover:opacity-70">
                  <span>
                    <span className="block font-mono text-[14px]">{o.ref}</span>
                    <span className="block text-[13px] text-smoke">
                      {fmtDate(o.createdAt)} · {o.summary.count} item{o.summary.count === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="font-mono text-[13px]">{money(o.summary.total, o.summary.currency)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
