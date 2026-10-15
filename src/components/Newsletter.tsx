"use client";

import { useId, useState } from "react";

export default function Newsletter({ source, dark = false }: { source: string; dark?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (state === "done") {
    return (
      <p className={`text-[15px] ${dark ? "text-bone" : ""}`} role="status">
        Thank you. Your welcome code is <span className="font-mono">WELCOME10</span>, valid on your first order.
      </p>
    );
  }
  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          setState("error");
          setMsg("Please enter a valid email address.");
          return;
        }
        setState("busy");
        try {
          const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source, website: "" }) });
          const j = (await res.json()) as { ok: boolean; error?: string };
          if (!j.ok) throw new Error(j.error);
          setState("done");
        } catch (err) {
          setState("error");
          setMsg(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
        }
      }}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className={`flex border-b ${dark ? "border-bone/40" : "border-graphite"}`}>
        <input
          id={id}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-invalid={state === "error"}
          aria-describedby={`${id}-msg`}
          className={`w-full bg-transparent py-3 text-[16px] outline-none ${dark ? "placeholder:text-bone/45" : "placeholder:text-smoke"}`}
        />
        <button type="submit" disabled={state === "busy"} className="eyebrow shrink-0 px-2 hover:opacity-60">
          {state === "busy" ? "…" : "Subscribe"}
        </button>
      </div>
      <p id={`${id}-msg`} className={`mt-2 text-[12px] ${state === "error" ? (dark ? "text-[#f1a58f]" : "text-[#a23b2a]") : dark ? "text-bone/45" : "text-smoke"}`} aria-live="polite">
        {state === "error" ? msg : "Unsubscribe any time. We never share your email."}
      </p>
    </form>
  );
}
