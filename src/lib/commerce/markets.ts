/**
 * Markets: the ship-to country decides the currency, shipping rates and how tax is shown
 * (the same model Shopify Markets and most global DTC brands use).
 */
export type Currency = "USD" | "EUR" | "GBP" | "AED";
export type MarketId = "US" | "UK" | "EU" | "AE" | "INTL";
export type TaxMode = "us-sales" | "vat-included" | "duties-included";

export interface ShipMethod {
  id: "standard" | "express";
  name: string;
  price: number;
  days: [number, number];
  carrier: string;
}

export interface Market {
  id: MarketId;
  name: string;
  currency: Currency;
  freeOver: number;
  methods: ShipMethod[];
  taxMode: TaxMode;
}

export const MARKETS: Record<MarketId, Market> = {
  US: {
    id: "US",
    name: "United States",
    currency: "USD",
    freeOver: 150,
    methods: [
      { id: "standard", name: "Standard", price: 8, days: [3, 5], carrier: "UPS Ground" },
      { id: "express", name: "Express", price: 20, days: [1, 2], carrier: "UPS 2nd Day Air" },
    ],
    taxMode: "us-sales",
  },
  UK: {
    id: "UK",
    name: "United Kingdom",
    currency: "GBP",
    freeOver: 125,
    methods: [
      { id: "standard", name: "Standard", price: 6, days: [2, 3], carrier: "Royal Mail Tracked" },
      { id: "express", name: "Next day", price: 15, days: [1, 1], carrier: "DPD Next Day" },
    ],
    taxMode: "vat-included",
  },
  EU: {
    id: "EU",
    name: "European Union",
    currency: "EUR",
    freeOver: 140,
    methods: [
      { id: "standard", name: "Standard", price: 9, days: [3, 6], carrier: "Colissimo" },
      { id: "express", name: "Express", price: 22, days: [2, 3], carrier: "DHL Express" },
    ],
    taxMode: "vat-included",
  },
  AE: {
    id: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    freeOver: 550,
    methods: [
      { id: "standard", name: "Standard", price: 35, days: [3, 5], carrier: "Aramex" },
      { id: "express", name: "Express", price: 80, days: [1, 2], carrier: "DHL Express" },
    ],
    taxMode: "vat-included",
  },
  INTL: {
    id: "INTL",
    name: "International",
    currency: "USD",
    freeOver: 250,
    methods: [
      { id: "standard", name: "International", price: 25, days: [6, 10], carrier: "DHL eCommerce" },
      { id: "express", name: "International express", price: 45, days: [3, 5], carrier: "DHL Express" },
    ],
    taxMode: "duties-included",
  },
};

export interface Country {
  code: string;
  name: string;
  market: MarketId;
  vat?: number; // VAT rate included in prices, for the receipt
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", market: "US" },
  { code: "GB", name: "United Kingdom", market: "UK", vat: 0.2 },
  { code: "FR", name: "France", market: "EU", vat: 0.2 },
  { code: "DE", name: "Germany", market: "EU", vat: 0.19 },
  { code: "IT", name: "Italy", market: "EU", vat: 0.22 },
  { code: "ES", name: "Spain", market: "EU", vat: 0.21 },
  { code: "NL", name: "Netherlands", market: "EU", vat: 0.21 },
  { code: "BE", name: "Belgium", market: "EU", vat: 0.21 },
  { code: "IE", name: "Ireland", market: "EU", vat: 0.23 },
  { code: "PT", name: "Portugal", market: "EU", vat: 0.23 },
  { code: "AT", name: "Austria", market: "EU", vat: 0.2 },
  { code: "SE", name: "Sweden", market: "EU", vat: 0.25 },
  { code: "DK", name: "Denmark", market: "EU", vat: 0.25 },
  { code: "PL", name: "Poland", market: "EU", vat: 0.23 },
  { code: "AE", name: "United Arab Emirates", market: "AE", vat: 0.05 },
  { code: "SA", name: "Saudi Arabia", market: "INTL" },
  { code: "QA", name: "Qatar", market: "INTL" },
  { code: "KW", name: "Kuwait", market: "INTL" },
  { code: "CA", name: "Canada", market: "INTL" },
  { code: "AU", name: "Australia", market: "INTL" },
  { code: "NZ", name: "New Zealand", market: "INTL" },
  { code: "CH", name: "Switzerland", market: "INTL" },
  { code: "NO", name: "Norway", market: "INTL" },
  { code: "JP", name: "Japan", market: "INTL" },
  { code: "SG", name: "Singapore", market: "INTL" },
  { code: "HK", name: "Hong Kong", market: "INTL" },
  { code: "KR", name: "South Korea", market: "INTL" },
];

export const DEFAULT_COUNTRY = "US";
export const getCountry = (code: string | undefined | null) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
export const marketFor = (code: string | undefined | null) => MARKETS[getCountry(code).market];

/** Fixed exchange rates used to derive local price lists from USD. */
const RATE: Record<Currency, number> = { USD: 1, EUR: 0.95, GBP: 0.82, AED: 3.7 };

/** Local price from a USD base price, rounded the way a brand prices (to 5 above 50, to 1 below). */
export function localPrice(usd: number, cur: Currency) {
  if (cur === "USD") return usd;
  const v = usd * RATE[cur];
  return v >= 50 ? Math.round(v / 5) * 5 : Math.max(1, Math.round(v));
}

/** Converts an amount between currencies (used for credit codes issued in another currency). */
export function convert(amount: number, from: Currency, to: Currency) {
  if (from === to) return amount;
  return Math.round(((amount / RATE[from]) * RATE[to]) * 100) / 100;
}

const fmtCache = new Map<string, Intl.NumberFormat>();
export function money(n: number, cur: Currency) {
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  const k = `${cur}-${whole}`;
  if (!fmtCache.has(k)) {
    const locale = cur === "EUR" ? "en-IE" : cur === "GBP" ? "en-GB" : cur === "AED" ? "en-AE" : "en-US";
    fmtCache.set(k, new Intl.NumberFormat(locale, { style: "currency", currency: cur, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 }));
  }
  return (fmtCache.get(k) as Intl.NumberFormat).format(whole ? Math.round(n) : n);
}

export const CURRENCY_SYMBOL: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£", AED: "AED" };

/** Simplified US sales-tax estimate by state (combined average rates). */
export const US_STATES: { code: string; name: string; rate: number }[] = [
  { code: "AL", name: "Alabama", rate: 0.0929 }, { code: "AK", name: "Alaska", rate: 0.0182 }, { code: "AZ", name: "Arizona", rate: 0.0838 },
  { code: "AR", name: "Arkansas", rate: 0.0946 }, { code: "CA", name: "California", rate: 0.0885 }, { code: "CO", name: "Colorado", rate: 0.0781 },
  { code: "CT", name: "Connecticut", rate: 0.0635 }, { code: "DE", name: "Delaware", rate: 0 }, { code: "DC", name: "District of Columbia", rate: 0.06 },
  { code: "FL", name: "Florida", rate: 0.0702 }, { code: "GA", name: "Georgia", rate: 0.0738 }, { code: "HI", name: "Hawaii", rate: 0.045 },
  { code: "ID", name: "Idaho", rate: 0.0603 }, { code: "IL", name: "Illinois", rate: 0.0886 }, { code: "IN", name: "Indiana", rate: 0.07 },
  { code: "IA", name: "Iowa", rate: 0.0694 }, { code: "KS", name: "Kansas", rate: 0.0865 }, { code: "KY", name: "Kentucky", rate: 0.06 },
  { code: "LA", name: "Louisiana", rate: 0.0956 }, { code: "ME", name: "Maine", rate: 0.055 }, { code: "MD", name: "Maryland", rate: 0.06 },
  { code: "MA", name: "Massachusetts", rate: 0.0625 }, { code: "MI", name: "Michigan", rate: 0.06 }, { code: "MN", name: "Minnesota", rate: 0.0804 },
  { code: "MS", name: "Mississippi", rate: 0.0706 }, { code: "MO", name: "Missouri", rate: 0.0839 }, { code: "MT", name: "Montana", rate: 0 },
  { code: "NE", name: "Nebraska", rate: 0.0697 }, { code: "NV", name: "Nevada", rate: 0.0824 }, { code: "NH", name: "New Hampshire", rate: 0 },
  { code: "NJ", name: "New Jersey", rate: 0.066 }, { code: "NM", name: "New Mexico", rate: 0.0767 }, { code: "NY", name: "New York", rate: 0.0853 },
  { code: "NC", name: "North Carolina", rate: 0.07 }, { code: "ND", name: "North Dakota", rate: 0.0704 }, { code: "OH", name: "Ohio", rate: 0.0724 },
  { code: "OK", name: "Oklahoma", rate: 0.0899 }, { code: "OR", name: "Oregon", rate: 0 }, { code: "PA", name: "Pennsylvania", rate: 0.0634 },
  { code: "RI", name: "Rhode Island", rate: 0.07 }, { code: "SC", name: "South Carolina", rate: 0.075 }, { code: "SD", name: "South Dakota", rate: 0.0611 },
  { code: "TN", name: "Tennessee", rate: 0.0955 }, { code: "TX", name: "Texas", rate: 0.082 }, { code: "UT", name: "Utah", rate: 0.0742 },
  { code: "VT", name: "Vermont", rate: 0.0636 }, { code: "VA", name: "Virginia", rate: 0.0577 }, { code: "WA", name: "Washington", rate: 0.0938 },
  { code: "WV", name: "West Virginia", rate: 0.0657 }, { code: "WI", name: "Wisconsin", rate: 0.0570 }, { code: "WY", name: "Wyoming", rate: 0.0544 },
];

/** Business-day delivery window from today, e.g. "Tue 20 – Thu 22 Oct". */
export function deliveryWindow(days: [number, number], from = new Date()) {
  const add = (n: number) => {
    const d = new Date(from);
    // Orders placed after 2 pm ship the next business day.
    let left = n + (d.getHours() >= 14 ? 1 : 0);
    while (left > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) left--;
    }
    return d;
  };
  const a = add(days[0]);
  const b = add(days[1]);
  const f = (d: Date, month: boolean) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", ...(month ? { month: "short" } : {}) });
  return days[0] === days[1] ? f(a, true) : `${f(a, a.getMonth() !== b.getMonth())} – ${f(b, true)}`;
}
