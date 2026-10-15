import type { Customer } from "./order";
import { US_STATES } from "./markets";

/** Countries without postal codes. */
export const NO_POSTAL = ["AE", "QA", "HK"];

/** Shared client/server validation of checkout details. Returns field → message. */
export function validateCustomer(c: Customer, physical: boolean): Partial<Record<keyof Customer, string>> {
  const e: Partial<Record<keyof Customer, string>> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)) e.email = "Please enter a valid email address.";
  if (!c.firstName.trim()) e.firstName = "Please enter your first name.";
  if (!c.lastName.trim()) e.lastName = "Please enter your last name.";
  if (!physical) return e;
  if (c.address1.trim().length < 3) e.address1 = "Please enter your street address.";
  if (c.city.trim().length < 2) e.city = "Please enter your town or city.";
  if (c.country === "US") {
    if (!US_STATES.some((s) => s.code === c.region)) e.region = "Please choose your state.";
    if (!/^\d{5}(-\d{4})?$/.test(c.postal.trim())) e.postal = "Please enter a 5-digit ZIP code.";
  } else if (c.country === "GB") {
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(c.postal.trim())) e.postal = "Please enter a valid UK postcode.";
  } else if (!NO_POSTAL.includes(c.country) && c.postal.trim().length < 3) {
    e.postal = "Please enter your postal code.";
  }
  if (!/^[+()\d\s-]{7,20}$/.test(c.phone.trim())) e.phone = "The courier needs a phone number to reach you.";
  return e;
}
