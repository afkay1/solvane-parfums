// Fails if any internal link, anchor or image reference points to something that does not exist.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(SRC).filter((f) => /\.(tsx?)$/.test(f));
const products = readFileSync(join(SRC, "lib/data/products.ts"), "utf8");
const productSlugs = ["sol-blanc", "ombre-doud", "figue-lente", "rose-nocturne", "cuir-fume", "santal-doux", "iris-poudre", "vetiver-mer", "candle-ombre", "candle-jardin", "candle-sel"];
for (const s of productSlugs) if (!products.includes(`"${s}"`)) throw new Error(`slug ${s} missing from products.ts`);
const families = ["fresh", "floral", "woody", "amber"];

const routes = new Set([
  "/", "/shop", "/collections", "/discovery-set", "/scent-finder", "/gifting", "/atelier", "/faq", "/shipping-returns",
  "/contact", "/policies", "/cart", "/checkout", "/checkout/confirmation", "/track", "/admin",
]);
productSlugs.forEach((s) => routes.add(`/products/${s}`));
families.forEach((f) => routes.add(`/collections/${f}`));

const bad = [];
const pageFor = (r) => {
  const seg = r.split("/").filter(Boolean);
  if (existsSync(join(SRC, "app", ...seg, "page.tsx"))) return true;
  if (seg[0] === "products" && seg.length === 2) return existsSync(join(SRC, "app/products/[slug]/page.tsx"));
  if (seg[0] === "collections" && seg.length === 2) return existsSync(join(SRC, "app/collections/[family]/page.tsx"));
  return false;
};
for (const r of routes) if (!pageFor(r)) bad.push(`route without page: ${r}`);

const ANCHORS = {
  "/policies": ["privacy", "terms", "cookies"],
  "/gifting": ["gift-card", "guides"],
};
let count = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/href[=:]\s*[{]?["'`](\/[^"'`?$]*)/g)) {
    count++;
    const [path, hash] = m[1].split("#");
    if (path.startsWith("/api/")) continue;
    const prefixOk = path.endsWith("/") && path.length > 1 && [...routes].some((r) => r.startsWith(path));
    if (!routes.has(path || "/") && !prefixOk) bad.push(`${f}: ${m[1]}`);
    if (hash && ANCHORS[path] && !ANCHORS[path].includes(hash)) bad.push(`${f}: missing anchor ${m[1]}`);
  }
  for (const m of src.matchAll(/img\(\s*[`"]([^"`$]+)[`"]/g)) if (!existsSync(join("public/images", `${m[1]}.webp`))) bad.push(`${f}: missing image ${m[1]}`);
  for (const m of src.matchAll(/["'`]\/images\/([^"'`$]+\.webp)/g)) if (!existsSync(join("public/images", m[1]))) bad.push(`${f}: missing image file ${m[1]}`);
}
// Image sets built from slugs in products.ts
for (const s of productSlugs.slice(0, 8)) for (const k of ["bottle", "mood", "life"]) if (!existsSync(`public/images/${k}-${s}.webp`)) bad.push(`missing ${k}-${s}.webp`);
for (const f of readdirSync("public/images").filter((x) => x.endsWith(".webp") && !x.endsWith("-md.webp")))
  if (!existsSync(join("public/images", f.replace(/\.webp$/, "-md.webp")))) bad.push(`missing medium size for ${f}`);

if (bad.length) {
  console.error("Problems:\n" + bad.join("\n"));
  process.exit(1);
}
console.log(`${routes.size} routes, ${count} internal links checked, 0 dead. All images present.`);
