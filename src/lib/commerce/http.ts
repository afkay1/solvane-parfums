import { NextResponse } from "next/server";

export const bad = (error: string, status = 422) => NextResponse.json({ ok: false, error }, { status });

export const clean = (v: unknown, max = 200) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, " ")
    .trim()
    .slice(0, max);

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const isPhone = (v: string) => /^[+()\d\s-]{7,20}$/.test(v);

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const j = (await req.json()) as unknown;
    return j && typeof j === "object" ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Very small in-memory rate limiter per IP (best effort on serverless). */
const hits = new Map<string, number[]>();
export function limited(req: Request, max = 20, windowMs = 60_000) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > max;
}
