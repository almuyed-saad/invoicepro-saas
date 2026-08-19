export type FirstInvoiceJourneyStep = {
  id: "profile" | "invoice" | "share";
  title: string;
  detail: string;
  complete: boolean;
  actionLabel: string;
  target: string;
  available: boolean;
};

export function getFirstInvoiceJourney(profileReady: boolean, firstInvoiceId?: number): FirstInvoiceJourneyStep[] {
  const invoiceReady = typeof firstInvoiceId === "number" && firstInvoiceId > 0;
  const invoiceTarget = invoiceReady ? `/invoices/${firstInvoiceId}` : "/invoices/new";

  return [
    {
      id: "profile",
      title: "Add your business details",
      detail: profileReady ? "Your client-facing business details are ready." : "Add the name, phone number, and email your clients should see.",
      complete: profileReady,
      actionLabel: profileReady ? "Review profile" : "Finish profile",
      target: "/profile",
      available: true,
    },
    {
      id: "invoice",
      title: "Create your first BDT invoice",
      detail: invoiceReady ? "Your first invoice is ready to review." : "Add a client, service, amount, and due date in just a few steps.",
      complete: invoiceReady,
      actionLabel: invoiceReady ? "View first invoice" : "Create first invoice",
      target: invoiceTarget,
      available: true,
    },
    {
      id: "share",
      title: "Share a public client link",
      detail: invoiceReady ? "Open your invoice and copy a ready-made WhatsApp, email, or public-link message." : "This unlocks right after your first invoice is created.",
      complete: false,
      actionLabel: "Open sharing tools",
      target: invoiceTarget,
      available: invoiceReady,
    },
  ];
}
