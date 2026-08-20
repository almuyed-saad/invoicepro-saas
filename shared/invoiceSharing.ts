export type InvoiceShareDetails = {
  invoiceNumber: string;
  clientName: string;
  businessName: string;
  total: string;
  shareUrl: string;
};

export function buildInvoiceEmailSubject(details: InvoiceShareDetails) {
  return `Invoice ${details.invoiceNumber} from ${details.businessName}`;
}

export function buildInvoiceEmailBody(details: InvoiceShareDetails) {
  return `Hello ${details.clientName},\n\nPlease find your invoice for ${details.total} here: ${details.shareUrl}\n\nThank you.`;
}

export function buildInvoiceEmailText(details: InvoiceShareDetails) {
  return `Subject: ${buildInvoiceEmailSubject(details)}\n\n${buildInvoiceEmailBody(details)}`;
}

export function buildInvoiceEmailHref(recipient: string, details: InvoiceShareDetails) {
  return `mailto:${encodeURIComponent(recipient.trim())}?subject=${encodeURIComponent(buildInvoiceEmailSubject(details))}&body=${encodeURIComponent(buildInvoiceEmailBody(details))}`;
}

export function buildInvoiceWhatsAppText(details: InvoiceShareDetails) {
  return `Hello ${details.clientName}, here is your invoice ${details.invoiceNumber} from ${details.businessName} for ${details.total}. You can view it here: ${details.shareUrl}`;
}

export function toWhatsAppNumber(phone: string | null | undefined) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) return `88${digits}`;
  if (digits.startsWith("8801") && digits.length === 13) return digits;
  return digits.length >= 8 ? digits : null;
}

export function buildInvoiceWhatsAppHref(phone: string | null | undefined, details: InvoiceShareDetails) {
  const recipient = toWhatsAppNumber(phone);
  return recipient ? `https://wa.me/${recipient}?text=${encodeURIComponent(buildInvoiceWhatsAppText(details))}` : null;
}
