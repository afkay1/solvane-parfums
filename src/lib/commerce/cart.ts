"use client";

import { useMemo, useSyncExternalStore } from "react";
import { COUNTRIES, DEFAULT_COUNTRY } from "./markets";
import { computeCart, lineKey, MAX_QTY, MAX_SAMPLES, WELCOME_CODE, type CartLine, type Voucher } from "./pricing";
import type { Order } from "./order";

/**
 * Client cart store. Persists in localStorage, syncs across tabs, and is read with
 * useSyncExternalStore so server-rendered HTML always hydrates cleanly.
 */

export interface CartState {
  lines: CartLine[];
  samples: string[];
  giftWrap: boolean;
  giftMessage: string;
  code: string;
  voucher: Voucher | null;
  country: string;
  region: string;
  shipping: "standard" | "express";
}

const KEY = "solvane.cart.v1";
const COUNTRY_KEY = "solvane.country";
const ORDERS_KEY = "solvane.orders.v1";

const EMPTY: CartState = { lines: [], samples: [], giftWrap: false, giftMessage: "", code: "", voucher: null, country: DEFAULT_COUNTRY, region: "", shipping: "standard" };

let state: CartState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

/** Best guess of the visitor's country from their time zone, used only on the first visit. */
function guessCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const map: Record<string, string> = {
      "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Paris": "FR", "Europe/Berlin": "DE", "Europe/Rome": "IT", "Europe/Madrid": "ES",
      "Europe/Amsterdam": "NL", "Europe/Brussels": "BE", "Europe/Lisbon": "PT", "Europe/Vienna": "AT", "Europe/Stockholm": "SE",
      "Europe/Copenhagen": "DK", "Europe/Warsaw": "PL", "Europe/Zurich": "CH", "Europe/Oslo": "NO", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
      "Asia/Qatar": "QA", "Asia/Kuwait": "KW", "Asia/Tokyo": "JP", "Asia/Singapore": "SG", "Asia/Hong_Kong": "HK", "Asia/Seoul": "KR",
      "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Pacific/Auckland": "NZ", "America/Toronto": "CA", "America/Vancouver": "CA",
    };
    if (map[tz]) return map[tz];
    if (tz.startsWith("America/")) return "US";
  } catch {
    /* ignore */
  }
  return DEFAULT_COUNTRY;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<CartState>) : {};
    const country = localStorage.getItem(COUNTRY_KEY) || guessCountry();
    state = { ...EMPTY, ...saved, country: COUNTRIES.some((c) => c.code === country) ? country : DEFAULT_COUNTRY };
  } catch {
    state = EMPTY;
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY || e.key === COUNTRY_KEY) {
      loaded = false;
      load();
      emit();
    }
  });
}

function emit() {
  listeners.forEach((l) => l());
}

function set(patch: Partial<CartState>) {
  load();
  state = { ...state, ...patch };
  try {
    const { country, ...rest } = state;
    localStorage.setItem(KEY, JSON.stringify(rest));
    localStorage.setItem(COUNTRY_KEY, country);
  } catch {
    /* storage full or blocked: the cart still works for this visit */
  }
  emit();
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => EMPTY;

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSummary() {
  const s = useCart();
  return useMemo(() => computeCart(s), [s]);
}

/* ---------------- Drawer UI state ---------------- */

let drawer = false;
const drawerListeners = new Set<() => void>();
export function useDrawer() {
  return useSyncExternalStore(
    (fn) => {
      drawerListeners.add(fn);
      return () => drawerListeners.delete(fn);
    },
    () => drawer,
    () => false
  );
}
export function setDrawer(open: boolean) {
  drawer = open;
  drawerListeners.forEach((l) => l());
}

/* ---------------- Actions ---------------- */

export const cart = {
  get: getSnapshot,
  add(line: CartLine, { open = true }: { open?: boolean } = {}) {
    load();
    const key = lineKey(line);
    const existing = state.lines.find((l) => lineKey(l) === key);
    const lines = existing
      ? state.lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l))
      : [...state.lines, { ...line, qty: Math.min(MAX_QTY, line.qty) }];
    set({ lines });
    if (open) window.setTimeout(() => setDrawer(true), 450);
  },
  setQty(key: string, qty: number) {
    if (qty <= 0) return cart.remove(key);
    set({ lines: state.lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : l)) });
  },
  remove(key: string) {
    set({ lines: state.lines.filter((l) => lineKey(l) !== key) });
  },
  toggleSample(slug: string) {
    const has = state.samples.includes(slug);
    if (has) set({ samples: state.samples.filter((s) => s !== slug) });
    else if (state.samples.length < MAX_SAMPLES) set({ samples: [...state.samples, slug] });
  },
  setGiftWrap(giftWrap: boolean) {
    set({ giftWrap });
  },
  setGiftMessage(giftMessage: string) {
    set({ giftMessage: giftMessage.slice(0, 240) });
  },
  setCountry(country: string) {
    set({ country, region: "", shipping: "standard" });
  },
  setRegion(region: string) {
    set({ region });
  },
  setShipping(shipping: "standard" | "express") {
    set({ shipping });
  },
  /** Applies a promo or voucher code. Voucher codes are verified by the server. */
  async applyCode(raw: string): Promise<string | null> {
    const code = raw.trim().toUpperCase();
    if (!code) return "Please enter a code.";
    if (code === WELCOME_CODE) {
      set({ code, voucher: null });
      return null;
    }
    try {
      const res = await fetch("/api/voucher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const json = (await res.json()) as { ok: boolean; voucher?: Voucher; error?: string };
      if (!json.ok || !json.voucher) return json.error ?? "We don’t recognise this code.";
      set({ code, voucher: json.voucher });
      return null;
    } catch {
      return "We couldn’t check this code. Please try again.";
    }
  },
  clearCode() {
    set({ code: "", voucher: null });
  },
  clearAfterOrder() {
    set({ lines: [], samples: [], giftWrap: false, giftMessage: "", code: "", voucher: null });
  },
};

/* ---------------- Orders kept in this browser (demo mode) ---------------- */

export function localOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]") as Order[];
  } catch {
    return [];
  }
}
export function saveLocalOrder(order: Order) {
  const all = localOrders().filter((o) => o.ref !== order.ref);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...all].slice(0, 20)));
  } catch {
    /* ignore */
  }
}
export function findLocalOrder(ref: string) {
  return localOrders().find((o) => o.ref === ref.trim().toUpperCase()) ?? null;
}
