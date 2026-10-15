import type { MetadataRoute } from "next";
import { CANDLES, FAMILIES, PERFUMES } from "@/lib/data/products";
import { SITE_URL } from "@/lib/format";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/shop", "/collections", "/discovery-set", "/scent-finder", "/gifting", "/atelier", "/faq", "/shipping-returns", "/contact", "/track", "/policies"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...Object.keys(FAMILIES).map((f) => ({ url: `${SITE_URL}/collections/${f}`, lastModified: now, priority: 0.6 })),
    ...[...PERFUMES, ...CANDLES].map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, lastModified: now, priority: 0.9 })),
  ];
}
