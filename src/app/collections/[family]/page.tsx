import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { PageHead } from "@/components/ui";
import { FAMILIES, PERFUMES, type FamilyId } from "@/lib/data/products";
import { itemListLd } from "@/lib/seo";

const ids = Object.keys(FAMILIES) as FamilyId[];

export function generateStaticParams() {
  return ids.map((family) => ({ family }));
}

export function generateMetadata({ params }: { params: { family: string } }): Metadata {
  const f = FAMILIES[params.family as FamilyId];
  if (!f) return {};
  return { title: `${f.name} perfumes`, description: f.text, alternates: { canonical: `/collections/${params.family}` } };
}

export default function FamilyPage({ params }: { params: { family: string } }) {
  const id = params.family as FamilyId;
  const f = FAMILIES[id];
  if (!f) notFound();
  const members = PERFUMES.filter((p) => p.family === id);
  const others = ids.filter((x) => x !== id);
  return (
    <>
      <JsonLd data={itemListLd(members)} />
      <PageHead crumbs={[{ name: "Collections", path: "/collections" }, { name: f.name, path: `/collections/${id}` }]} eyebrow="Scent family" title={f.name} text={f.text} />
      <section className="sec-bone pb-24">
        <div className="wrap">
          <Reveal className="grid gap-x-6 gap-y-12 sm:grid-cols-2" stagger={0.1}>
            {members.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i === 0} sizes="(min-width: 640px) 50vw, 100vw" />
            ))}
          </Reveal>
        </div>
      </section>
      <section className="sec-stone py-20">
        <div className="wrap">
          <p className="eyebrow text-smoke">Other families</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o}>
                <Link href={`/collections/${o}`} className="group flex items-center justify-between border-t border-graphite py-5">
                  <span className="serif text-[28px]">{FAMILIES[o].name}</span>
                  <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
