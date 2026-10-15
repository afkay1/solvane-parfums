"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mx-auto max-w-sm space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
        const j = (await res.json()) as { ok: boolean; error?: string };
        setBusy(false);
        if (j.ok) router.refresh();
        else setErr(j.error ?? "Sign-in failed.");
      }}
    >
      <div>
        <label htmlFor="admin-pw" className="label">
          Admin password
        </label>
        <input id="admin-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" aria-invalid={Boolean(err)} />
        {err && <p className="err">{err}</p>}
      </div>
      <button type="submit" disabled={busy || !password} className="btn btn-dark w-full">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function AdminLogout() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      }}
      className="btn btn-outline !min-h-[40px] !px-4 text-[13px]"
    >
      Sign out
    </button>
  );
}
