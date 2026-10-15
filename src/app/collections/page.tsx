import type { Metadata } from "next";
import Link from "next/link";
import ImageReveal from "@/components/ImageReveal";
import Reveal from "@/components/Reveal";
import { PageHead } from "@/components/ui";
import { FAMILIES, PERFUMES, type FamilyId } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Scent families",
  description: "Explore Solvane perfumes by scent family: Fresh & Luminous, Floral & Powdery, Green & Woody, and Amber & Smoke.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <>
      <PageHead
        crumbs={[{ name: "Collections", path: "/collections" }]}
        eyebrow="Scent families"
        title="Four families, eight perfumes."
        text="If you already know you love citrus, or rose, or woods, start here. Each family holds two perfumes that share a mood but wear very differently."
      />
      <section className="sec-bone pb-28">
        <div className="wrap space-y-24 sm:space-y-32">
          {(Object.keys(FAMILIES) as FamilyId[]).map((id, i) => {
            const f = FAMILIES[id];
            const members = PERFUMES.filter((p) => p.family === id);
            return (
              <article key={id} className="grid items-center gap-10 border-t border-line pt-12 lg:grid-cols-2 lg:gap-20">
                <ImageReveal image={f.image} className={`aspect-[4/5] ${i % 2 ? "lg:order-2" : ""}`} sizes="(min-width: 1024px) 45vw, 100vw" zoom />
                <div>
                  <p className="font-mono text-[12px] text-smoke">0{i + 1}</p>
                  <h2 className="serif h2 mt-3">{f.name}</h2>
                  <p className="lead mt-5 max-w-md text-smoke">{f.text}</p>
                  <Reveal as="ul" className="mt-10 divide-y divide-line border-y border-line" stagger={0.1}>
                    {members.map((p) => (
                      <li key={p.slug} data-reveal>
                        <Link href={`/products/${p.slug}`} className="group flex items-center justify-between gap-4 py-5">
                          <span className="flex items-center gap-4">
                            <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: p.color }} aria-hidden />
                            <span>
                              <span className="serif block text-[28px] leading-tight transition-transform duration-500 ease-lux group-hover:translate-x-1.5">{p.name}</span>
                              <span className="block text-[13px] text-smoke">{p.short}</span>
                            </span>
                          </span>
                          <span aria-hidden className="text-[20px] transition-transform duration-500 group-hover:translate-x-1">→</span>
                        </Link>
                      </li>
                    ))}
                  </Reveal>
                  <Link href={`/collections/${id}`} className="link-arrow mt-8">
                    Explore {f.name} <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
