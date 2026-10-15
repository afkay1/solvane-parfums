import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { Accordion, PageHead } from "@/components/ui";
import { BRAND, FAQ_GROUPS } from "@/lib/data/brand";
import { faqLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about Solvane orders, shipping, returns, the Discovery Set credit, our perfumes and gifting.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqLd()} />
      <PageHead crumbs={[{ name: "FAQ", path: "/faq" }]} eyebrow="Help" title="Questions, answered." text="Can’t find what you need? Our team in Grasse replies within one business day." />
      <section className="sec-bone pb-28">
        <div className="wrap grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-24">
          <nav aria-label="FAQ topics" className="lg:sticky lg:top-[calc(var(--header)+var(--bar)+32px)] lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
              {FAQ_GROUPS.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="chip lg:!border-0 lg:!px-0 lg:hover:underline">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-16">
            {FAQ_GROUPS.map((g) => (
              <section key={g.id} id={g.id} className="scroll-mt-32" aria-labelledby={`${g.id}-h`}>
                <h2 id={`${g.id}-h`} className="serif h3 mb-6">
                  {g.title}
                </h2>
                <Accordion items={g.items.map((f) => ({ title: f.q, body: <p>{f.a}</p> }))} />
              </section>
            ))}
            <div className="border border-line bg-paper p-8">
              <p className="serif text-[28px]">Still have a question?</p>
              <p className="mt-2 text-smoke">
                Write to <a href={`mailto:${BRAND.email}`} className="underline underline-offset-4">{BRAND.email}</a> or use our{" "}
                <Link href="/contact" className="underline underline-offset-4">
                  contact form
                </Link>
                . {BRAND.hours}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
