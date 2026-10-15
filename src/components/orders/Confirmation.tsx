"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cart, findLocalOrder, saveLocalOrder } from "@/lib/commerce/cart";
import { deliveryWindow } from "@/lib/commerce/markets";
import type { IssuedVoucher, Order } from "@/lib/commerce/order";
import OrderDetails from "./OrderDetails";

export default function Confirmation() {
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "unpaid">("loading");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ref = (p.get("ref") || "").toUpperCase();
    const session = p.get("session_id");
    const local = ref ? findLocalOrder(ref) : null;
    if (!local) {
      setState("missing");
      return;
    }
    if (local.status === "pending_payment" && session) {
      fetch(`/api/checkout/verify?ref=${encodeURIComponent(ref)}&session_id=${encodeURIComponent(session)}`)
        .then((r) => r.json() as Promise<{ ok: boolean; paid?: boolean; vouchers?: IssuedVoucher[] }>)
        .then((j) => {
          if (j.paid) {
            const paid: Order = { ...local, status: "paid", vouchers: j.vouchers ?? [] };
            saveLocalOrder(paid);
            cart.clearAfterOrder();
            setOrder(paid);
            setState("ok");
          } else {
            setOrder(local);
            setState("unpaid");
          }
        })
        .catch(() => {
          setOrder(local);
          setState("unpaid");
        });
      return;
    }
    setOrder(local);
    setState(local.status === "paid" ? "ok" : "unpaid");
  }, []);

  if (state === "loading") return <p className="py-24 text-center text-smoke">Loading your order…</p>;

  if (state === "missing" || !order) {
    return (
      <div className="py-20 text-center">
        <h1 className="serif h2">We couldn’t find this order here.</h1>
        <p className="mx-auto mt-4 max-w-md text-smoke">If you placed it on another device, you can look it up with your order number and email.</p>
        <Link href="/track" className="btn btn-dark mt-8">
          Track an order
        </Link>
      </div>
    );
  }

  const eta = order.summary.shipping ? deliveryWindow(order.summary.shipping.days, new Date(order.createdAt)) : null;

  return (
    <div>
      <div className="border-b border-line pb-12">
        <p className="eyebrow text-smoke">Order {order.ref}</p>
        {state === "unpaid" ? (
          <>
            <h1 className="serif h1 mt-4">Payment not completed.</h1>
            <p className="lead mt-5 max-w-xl text-smoke">Your order is saved but we haven’t received payment. Your bag is still there if you’d like to try again.</p>
            <Link href="/checkout" className="btn btn-dark mt-8">
              Return to checkout
            </Link>
          </>
        ) : (
          <>
            <h1 className="serif h1 mt-4">Thank you, {order.customer.firstName}.</h1>
            <p className="lead mt-5 max-w-2xl text-smoke">
              Your order is confirmed and a receipt is on its way to <span className="text-graphite">{order.customer.email}</span>.
              {eta ? ` We’ll hand-pack it in Grasse; it should arrive ${eta}.` : " Gift cards are delivered by email on the dates you chose."}
            </p>
            <div className="no-print mt-8 flex flex-wrap gap-3">
              <Link href={`/track?ref=${order.ref}`} className="btn btn-dark">
                Track this order
              </Link>
              <button type="button" onClick={() => window.print()} className="btn btn-outline">
                Print receipt
              </button>
              <Link href="/shop" className="btn btn-outline">
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
      <div className="mt-12">
        <OrderDetails order={order} />
      </div>
    </div>
  );
}
