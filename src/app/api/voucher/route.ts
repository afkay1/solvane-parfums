import { NextResponse } from "next/server";
import { bad, clean, limited, readJson } from "@/lib/commerce/http";
import { verifyVoucher } from "@/lib/commerce/vouchers";
import { codeRedeemed } from "@/lib/commerce/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (limited(req, 15)) return bad("Too many attempts. Please wait a minute.", 429);
  const body = await readJson(req);
  const code = clean(body?.code, 40);
  if (!code) return bad("Please enter a code.");
  const v = verifyVoucher(code);
  if ("error" in v) return bad(v.error);
  if (await codeRedeemed(v.voucher.code)) return bad("This code has already been used.");
  return NextResponse.json({ ok: true, voucher: v.voucher });
}
