import { getFirstInvoiceJourney } from "../shared/customerJourney";
import { describe, expect, it } from "vitest";

describe("first-invoice onboarding journey", () => {
  it("directs a newly onboarded customer from profile setup to the first BDT invoice", () => {
    const steps = getFirstInvoiceJourney(true);

    expect(steps.map(step => ({ id: step.id, complete: step.complete, available: step.available, target: step.target }))).toEqual([
      { id: "profile", complete: true, available: true, target: "/profile" },
      { id: "invoice", complete: false, available: true, target: "/invoices/new" },
      { id: "share", complete: false, available: false, target: "/invoices/new" },
    ]);
  });

  it("unlocks the existing invoice sharing tools once a first invoice exists", () => {
    const shareStep = getFirstInvoiceJourney(true, 42).find(step => step.id === "share");

    expect(shareStep).toMatchObject({ available: true, target: "/invoices/42", actionLabel: "Open sharing tools" });
  });
});
