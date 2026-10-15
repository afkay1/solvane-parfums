import type { Metadata } from "next";
import Checkout from "@/components/checkout/Checkout";
import { isStripeMode } from "@/lib/commerce/services";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <section className="sec-bone min-h-[80vh] pb-28 pt-[calc(var(--header)+var(--bar)+40px)]">
      <div className="wrap">
        <p className="eyebrow text-smoke">Secure checkout</p>
        <h1 className="serif h2 mt-3">Checkout</h1>
        <div className="mt-10">
          <Checkout stripe={isStripeMode()} />
        </div>
      </div>
    </section>
  );
}
