export const PAYMENT_LABELS = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "bank transfer",
} as const;

export const STATUS_LABELS = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  partially_paid: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
} as const;

export function formatBDT(paisa: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format((paisa || 0) / 100).replace("BDT", "৳");
}

export function formatDate(value?: Date | string | number | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function toDateInput(value?: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function daysOverdue(value?: Date | string | null) {
  if (!value) return 0;
  return Math.max(1, Math.ceil((Date.now() - new Date(value).getTime()) / 86_400_000));
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function publicInvoiceUrl(token: string) {
  return `${window.location.origin}/share/${token}`;
}
