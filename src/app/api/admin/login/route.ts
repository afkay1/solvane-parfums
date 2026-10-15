import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { bad, limited, readJson } from "@/lib/commerce/http";
import { signAdmin } from "@/lib/commerce/services";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (limited(req, 6)) return bad("Too many attempts. Please wait a minute.", 429);
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return bad("Set ADMIN_PASSWORD to enable the admin login.", 400);
  const body = await readJson(req);
  const given = Buffer.from(String(body?.password ?? ""));
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return bad("Incorrect password.", 401);
  const exp = Date.now() + 8 * 3_600_000;
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sv_admin", signAdmin(exp), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(exp) });
  return res;
}
