export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://solvane-parfums.vercel.app").replace(/\/$/, "");

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  const d = iso.length === 10 ? new Date(iso + "T12:00:00Z") : new Date(iso);
  return d.toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

export const stars = (n: number) => "★★★★★".slice(0, Math.round(n)) + "☆☆☆☆☆".slice(0, 5 - Math.round(n));
