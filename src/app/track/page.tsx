import type { Metadata } from "next";
import Track from "@/components/orders/Track";
import { PageHead } from "@/components/ui";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Follow your Solvane order from our atelier in Grasse to your door.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <>
      <PageHead crumbs={[{ name: "Track an order", path: "/track" }]} eyebrow="Help" title="Where’s my order?" text="Enter your order number and email to see where your parcel is." />
      <section className="sec-bone pb-28">
        <div className="wrap">
          <Track />
        </div>
      </section>
    </>
  );
}
