import { describe, expect, it } from "vitest";
import { buildInvoiceEmailHref, buildInvoiceEmailText, buildInvoiceWhatsAppHref, toWhatsAppNumber } from "../shared/invoiceSharing";

const details = {
  invoiceNumber: "INV-2408-016",
  clientName: "Studio North",
  businessName: "Saad Design",
  total: "৳32,000",
  shareUrl: "https://invoice-pro-saas.netlify.app/share/token",
};

describe("invoice sharing links", () => {
  it("creates a prefilled email composer link with recipient, subject, and public invoice URL", () => {
    const href = buildInvoiceEmailHref("client@example.com", details);
    expect(href).toContain("mailto:client%40example.com");
    expect(decodeURIComponent(href)).toContain("subject=Invoice INV-2408-016 from Saad Design");
    expect(decodeURIComponent(href)).toContain(details.shareUrl);
    expect(buildInvoiceEmailText(details)).toContain("Hello Studio North");
  });

  it("creates a direct WhatsApp link for Bangladeshi client numbers and rejects incomplete values", () => {
    expect(toWhatsAppNumber("01612-075236")).toBe("8801612075236");
    expect(buildInvoiceWhatsAppHref("01612-075236", details)).toContain("https://wa.me/8801612075236?");
    expect(buildInvoiceWhatsAppHref("123", details)).toBeNull();
  });
});
