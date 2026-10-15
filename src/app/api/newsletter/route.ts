import { NextResponse } from "next/server";
import { bad, clean, isEmail, limited, readJson } from "@/lib/commerce/http";
import { addSubscriber } from "@/lib/commerce/store";
import { sendEmail } from "@/lib/commerce/services";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (limited(req, 8)) return bad("Too many attempts. Please wait a minute.", 429);
  const body = await readJson(req);
  if (!body || clean(body.website)) return bad("Invalid request.", 400);
  const email = clean(body.email, 160).toLowerCase();
  if (!isEmail(email)) return bad("Please enter a valid email address.");
  try {
    await addSubscriber(email, clean(body.source, 30) || "site");
  } catch {
    return bad("We couldn’t subscribe you right now. Please try again.", 500);
  }
  await sendEmail(email, "Welcome to Solvane", "Thank you for joining us.\n\nYour welcome code WELCOME10 gives you 10% off your first order.\n\nSolvane, Grasse").catch(() => undefined);
  return NextResponse.json({ ok: true });
}
