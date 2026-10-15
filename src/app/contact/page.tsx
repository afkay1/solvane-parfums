import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { PageHead } from "@/components/ui";
import { BRAND } from "@/lib/data/brand";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about an order, a scent or corporate gifting? Write to the Solvane team in Grasse. We reply within one business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHead crumbs={[{ name: "Contact", path: "/contact" }]} eyebrow="Contact" title="Write to the atelier." text="A real person in Grasse reads every message. We reply within one business day." />
      <section className="sec-bone pb-28">
        <div className="wrap grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
          <ContactForm />
          <aside className="space-y-10 lg:border-l lg:border-line lg:pl-12">
            <div>
              <p className="eyebrow text-smoke">Email</p>
              <a href={`mailto:${BRAND.email}`} className="serif mt-2 block text-[28px] hover:underline">
                {BRAND.email}
              </a>
            </div>
            <div>
              <p className="eyebrow text-smoke">Phone</p>
              <a href={BRAND.phoneHref} className="serif mt-2 block text-[28px] hover:underline">
                {BRAND.phone}
              </a>
              <p className="mt-1 text-[14px] text-smoke">{BRAND.hours}</p>
            </div>
            <div>
              <p className="eyebrow text-smoke">Atelier</p>
              <p className="mt-2 text-[15px]">{BRAND.address}</p>
              <p className="mt-1 text-[14px] text-smoke">Guided visits on Saturday mornings, April to October, by appointment.</p>
            </div>
            <div className="border-t border-line pt-8 text-[14px] text-smoke">
              Looking for an order?{" "}
              <Link href="/track" className="underline underline-offset-4">
                Track it here
              </Link>
              . Most answers are also in our{" "}
              <Link href="/faq" className="underline underline-offset-4">
                FAQ
              </Link>
              .
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
