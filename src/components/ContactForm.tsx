"use client";

import { useEffect, useState } from "react";
import { CONTACT_TOPICS } from "@/lib/data/brand";

type F = { name: string; email: string; topic: string; orderRef: string; message: string; website: string };

export default function ContactForm() {
  const [f, setF] = useState<F>({ name: "", email: "", topic: CONTACT_TOPICS[0], orderRef: "", message: "", website: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof F, string>>>({});
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("topic");
    if (t && CONTACT_TOPICS.includes(t)) setF((v) => ({ ...v, topic: t }));
  }, []);

  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Partial<Record<keyof F, string>> = {};
    if (f.name.trim().length < 2) err.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) err.email = "Please enter a valid email address.";
    if (f.message.trim().length < 10) err.message = "Please write a little more so we can help (10 characters or more).";
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`c-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    setState("busy");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (!j.ok) throw new Error(j.error);
      setState("done");
    } catch (er) {
      setState("error");
      setServerMsg(er instanceof Error && er.message ? er.message : "Something went wrong. Please email us instead.");
    }
  };

  if (state === "done") {
    return (
      <div role="status" className="border border-line bg-paper p-10">
        <p className="serif text-[36px]">Thank you, {f.name.split(" ")[0]}.</p>
        <p className="mt-3 text-smoke">We’ve received your message and will reply to {f.email} within one business day.</p>
      </div>
    );
  }

  const err = (k: keyof F) =>
    errors[k] ? (
      <p id={`c-${k}-err`} className="err">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">
            Name
          </label>
          <input id="c-name" value={f.name} onChange={set("name")} autoComplete="name" maxLength={80} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "c-name-err" : undefined} className="field" />
          {err("name")}
        </div>
        <div>
          <label htmlFor="c-email" className="label">
            Email
          </label>
          <input id="c-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" maxLength={160} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "c-email-err" : undefined} className="field" />
          {err("email")}
        </div>
        <div>
          <label htmlFor="c-topic" className="label">
            Topic
          </label>
          <select id="c-topic" value={f.topic} onChange={set("topic")} className="field">
            {CONTACT_TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="c-orderRef" className="label">
            Order number <span className="font-normal text-smoke">(optional)</span>
          </label>
          <input id="c-orderRef" value={f.orderRef} onChange={set("orderRef")} placeholder="SLV-XXXXXX" maxLength={20} className="field font-mono uppercase" />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="label">
          Message
        </label>
        <textarea id="c-message" value={f.message} onChange={set("message")} rows={6} maxLength={3000} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "c-message-err" : undefined} className="field resize-y" />
        {err("message")}
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
      </div>
      {state === "error" && (
        <p className="err" role="alert">
          {serverMsg}
        </p>
      )}
      <button type="submit" disabled={state === "busy"} className="btn btn-dark">
        {state === "busy" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
