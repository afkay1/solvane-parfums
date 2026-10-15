import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { BRAND } from "@/lib/data/brand";

export const metadata: Metadata = {
  title: "Privacy, terms & cookies",
  description: "How Solvane handles your data, our terms of sale and our use of cookies and browser storage.",
  alternates: { canonical: "/policies" },
};

const SECTIONS = [
  {
    id: "privacy",
    title: "Privacy policy",
    body: [
      `${BRAND.legalName} (“Solvane”, “we”) is the data controller for personal data collected through this website. We collect only what we need to fulfil your order and look after you: your name, email, delivery address, phone number for the courier, and your order history.`,
      "Payments are processed by Stripe. We never see or store your full card number. Emails are sent through Resend. Couriers receive your name, address and phone number only to deliver your parcel.",
      "If you subscribe to our letters, we use your email address to send them until you unsubscribe, which you can do with one click in any email. We never sell or rent your data.",
      "We keep order records for ten years, as French accounting law requires, and newsletter data until you unsubscribe. You have the right to access, correct, export or delete your data and to object to its use. Write to us and we will respond within 30 days. You may also complain to the CNIL (France) or your local data protection authority.",
    ],
  },
  {
    id: "terms",
    title: "Terms of sale",
    body: [
      "Prices are shown in the currency of the country you ship to. Prices for the UK, EU and UAE include VAT; for international destinations we prepay duties and taxes; US orders show estimated sales tax at checkout.",
      "Your contract with us is formed when we email your order confirmation. We may cancel an order in case of an obvious pricing error or if an item is unavailable, in which case you are refunded in full.",
      "You have the right to withdraw from your purchase within 30 days of delivery for unopened products (14 days is the legal minimum in the EU and UK; we extend it). For hygiene reasons, opened perfumes and samples cannot be returned unless faulty.",
      "Discovery Set credit codes are personal, valid for 60 days and can be used once on a 50 ml or 100 ml bottle. Gift cards are valid for three years and cannot be exchanged for cash.",
      "These terms are governed by French law. EU consumers keep the protection of the mandatory laws of their country of residence.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies & storage",
    body: [
      "We do not use advertising or analytics cookies, so there is no cookie banner to dismiss.",
      "We use your browser’s local storage for things you would expect a shop to remember: your bag, your chosen shipping country and, in demo mode, your recent orders. If you use the admin area, a single secure session cookie keeps you signed in for eight hours.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <>
      <PageHead crumbs={[{ name: "Policies", path: "/policies" }]} eyebrow="Legal" title="Privacy, terms & cookies." text="Written to be read. Last updated 1 October 2026." />
      <section className="sec-bone pb-28">
        <div className="wrap grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-24">
          <nav aria-label="On this page" className="lg:sticky lg:top-[calc(var(--header)+var(--bar)+32px)] lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="chip lg:!border-0 lg:!px-0 lg:hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="max-w-3xl space-y-16">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-32 border-t border-line pt-8">
                <h2 className="serif h3">{s.title}</h2>
                <div className="prose-sv mt-6 text-[16px] leading-relaxed text-smoke">
                  {s.body.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
            <p className="text-[14px] text-smoke">
              {BRAND.legalName} · {BRAND.address} · {BRAND.email}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
