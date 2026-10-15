import { BRAND, FAQS, type Faq } from "./data/brand";
import { productHref, type Product } from "./data/products";
import { MARKETS } from "./commerce/markets";
import { SITE_URL } from "./format";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#org`,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    email: BRAND.email,
    telephone: BRAND.phone,
    foundingDate: String(BRAND.founded),
    address: { "@type": "PostalAddress", streetAddress: "18 Chemin des Roses", addressLocality: "Grasse", postalCode: "06130", addressCountry: "FR" },
    sameAs: [BRAND.instagram],
  };
}

const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "US",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 30,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
};

function shippingDetails() {
  const us = MARKETS.US;
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: us.methods[0].price, currency: "USD" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: us.methods[0].days[0], maxValue: us.methods[0].days[1], unitCode: "DAY" },
    },
  };
}

export function productLd(p: Product) {
  const url = `${SITE_URL}${productHref(p)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    description: p.description.join(" "),
    image: p.gallery.map((g) => `${SITE_URL}${g.src}`),
    brand: { "@type": "Brand", name: BRAND.name },
    sku: p.variants[0].sku,
    category: p.kind === "candle" ? "Home fragrance > Candles" : "Beauty > Fragrance > Eau de Parfum",
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating.value, reviewCount: p.rating.count, bestRating: 5 },
    review: p.reviews.slice(0, 3).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.date,
      name: r.title,
      reviewBody: r.body,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: `${p.name} ${v.label}`,
      url,
      price: v.usd,
      priceCurrency: "USD",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: shippingDetails(),
      hasMerchantReturnPolicy: returnPolicy,
    })),
  };
}

export function itemListLd(items: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}${productHref(p)}`, name: p.name })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function faqLd(list: Faq[] = FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
