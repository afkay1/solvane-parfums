import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false },
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  return (
    <section className="sec-bone min-h-[70vh] pb-28 pt-[calc(var(--header)+var(--bar)+40px)]">
      <div className="wrap">
        <Breadcrumbs items={[{ name: "Bag", path: "/cart" }]} />
        <h1 className="serif h1 mt-8">Your bag</h1>
        <div className="mt-10">
          <CartView />
        </div>
      </div>
    </section>
  );
}
