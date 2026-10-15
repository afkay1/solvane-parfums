import type { Currency } from "./markets";
import type { Summary } from "./pricing";

export interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postal: string;
  country: string;
}

export interface IssuedVoucher {
  code: string;
  kind: "credit" | "gift";
  amount: number;
  currency: Currency;
  note: string;
}

export type OrderStatus = "paid" | "pending_payment" | "cancelled";

export interface Order {
  ref: string;
  createdAt: string;
  status: OrderStatus;
  payment: "demo" | "stripe";
  customer: Customer;
  newsletter: boolean;
  giftMessage: string;
  summary: Summary;
  vouchers: IssuedVoucher[];
}

/** Fulfilment timeline, derived from the order date (business days). */
export function trackingSteps(order: Pick<Order, "createdAt" | "status" | "summary">, now = Date.now()) {
  const placed = new Date(order.createdAt).getTime();
  const days = order.summary.shipping?.days ?? [3, 5];
  const DAY = 86_400_000;
  const steps = [
    { id: "placed", label: "Order placed", detail: "We’ve received your order.", at: placed },
    { id: "packed", label: "Hand-packed in Grasse", detail: "Wrapped by our atelier team and sealed with your samples.", at: placed + 0.9 * DAY },
    { id: "shipped", label: "On its way", detail: `Handed to ${order.summary.shipping?.carrier ?? "our courier"}. Tracking is emailed to you.`, at: placed + 1.2 * DAY },
    { id: "delivered", label: "Delivered", detail: "Enjoy, and tell us what you think.", at: placed + (1.2 + days[1]) * DAY },
  ];
  if (!order.summary.physical) {
    return [
      { ...steps[0], done: true },
      { id: "sent", label: "Gift card scheduled", detail: "Delivered by email on the date you chose.", at: placed, done: order.status === "paid" },
    ];
  }
  return steps.map((s) => ({ ...s, done: order.status === "paid" && now >= s.at }));
}
