import type { Metadata } from "next";
import Confirmation from "@/components/orders/Confirmation";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default function ConfirmationPage() {
  return (
    <section className="sec-bone min-h-[80vh] pb-28 pt-[calc(var(--header)+var(--bar)+48px)]">
      <div className="wrap">
        <Confirmation />
      </div>
    </section>
  );
}
