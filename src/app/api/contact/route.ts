import { NextResponse } from "next/server";
import { bad, clean, isEmail, limited, readJson } from "@/lib/commerce/http";
import { saveMessage } from "@/lib/commerce/store";
import { sendEmail } from "@/lib/commerce/services";
import { BRAND, CONTACT_TOPICS } from "@/lib/data/brand";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (limited(req, 5)) return bad("Too many messages. Please wait a minute.", 429);
  const body = await readJson(req);
  if (!body || clean(body.website)) return bad("Invalid request.", 400);
  const m = {
    name: clean(body.name, 80),
    email: clean(body.email, 160).toLowerCase(),
    topic: CONTACT_TOPICS.includes(clean(body.topic, 40)) ? clean(body.topic, 40) : "Something else",
    orderRef: clean(body.orderRef, 20).toUpperCase(),
    body: clean(body.message, 3000),
  };
  if (m.name.length < 2) return bad("Please tell us your name.");
  if (!isEmail(m.email)) return bad("Please enter a valid email address.");
  if (m.body.length < 10) return bad("Please write a little more so we can help.");
  try {
    await saveMessage(m);
  } catch {
    return bad("We couldn’t send your message. Please email us instead.", 500);
  }
  const inbox = process.env.CONTACT_INBOX;
  if (inbox) {
    await sendEmail(inbox, `[${m.topic}] ${m.name}${m.orderRef ? ` · ${m.orderRef}` : ""}`, `${m.body}\n\n${m.name} <${m.email}>`, m.email).catch(() => undefined);
  }
  await sendEmail(m.email, "We’ve received your message", `Dear ${m.name.split(" ")[0]},\n\nThank you for writing to us. We’ll reply within one business day.\n\n${BRAND.name}, Grasse`).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
