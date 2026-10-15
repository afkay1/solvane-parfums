import type { Metadata } from "next";
import ShopGrid from "@/components/ShopGrid";
import JsonLd from "@/components/JsonLd";
import { PageHead } from "@/components/ui";
import { ALL_PRODUCTS } from "@/lib/data/products";
import { itemListLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop all fragrances",
  description: "Shop Solvane eaux de parfum in 50 ml, 100 ml and 2 ml samples, the Discovery Set, scented candles and gift cards. Free samples with every order.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({ searchParams }: { searchParams: { category?: string; family?: string } }) {
  return (
    <>
      <JsonLd data={itemListLd(ALL_PRODUCTS)} />
      <PageHead crumbs={[{ name: "Shop", path: "/shop" }]} eyebrow="Shop" title="The whole collection." text="Eight eaux de parfum, the set that lets you try them all, three candles for the home and gift cards for the people you love." />
      <section className="sec-bone pb-28">
        <div className="wrap">
          <ShopGrid initialCategory={searchParams.category} initialFamily={searchParams.family} />
        </div>
      </section>
    </>
  );
}
