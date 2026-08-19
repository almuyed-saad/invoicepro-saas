import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getPublicInvoice: vi.fn(),
  listAdminUsers: vi.fn(),
  updateSubscription: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...dbMocks };
});

import { calculateInvoice, fromPaisa, isPastDue, toPaisa } from "./db";
import { appRouter } from "./routers";

function context(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? {
      id: 7,
      openId: "test-user",
      name: "Test user",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("InvoicePro BDT calculations", () => {
  it("keeps amounts in paisa and clamps discounts to the subtotal", () => {
    const result = calculateInvoice({
      items: [
        { description: "Brand strategy", quantityHundredths: 100, unitAmountPaisa: toPaisa(12000) },
        { description: "Social assets", quantityHundredths: 250, unitAmountPaisa: toPaisa(800) },
      ],
      discountPaisa: toPaisa(15000),
    });
    expect(result.subtotalPaisa).toBe(toPaisa(14000));
    expect(result.discountPaisa).toBe(toPaisa(14000));
    expect(fromPaisa(result.totalPaisa)).toBe(0);
  });

  it("marks only an unpaid past-due invoice as overdue", () => {
    expect(isPastDue(new Date(Date.now() - 86_400_000), 500, 1000)).toBe(true);
    expect(isPastDue(new Date(Date.now() - 86_400_000), 1000, 1000)).toBe(false);
    expect(isPastDue(new Date(Date.now() + 86_400_000), 0, 1000)).toBe(false);
  });
});

describe("InvoicePro access rules", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows public invoice lookup without a logged-in user", async () => {
    dbMocks.getPublicInvoice.mockResolvedValue({ invoice: { id: 1 }, items: [], profile: { businessName: "Test" } });
    const caller = appRouter.createCaller(context(null));
    await expect(caller.publicInvoice.get({ token: "a".repeat(24) })).resolves.toMatchObject({ invoice: { id: 1 } });
    expect(dbMocks.getPublicInvoice).toHaveBeenCalledWith("a".repeat(24));
  });

  it("blocks regular users from subscription administration", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.admin.users()).rejects.toMatchObject<Partial<TRPCError>>({ code: "FORBIDDEN" });
  });

  it("allows the owner to manually update a subscription after local payment confirmation", async () => {
    dbMocks.updateSubscription.mockResolvedValue({ status: "active" });
    const caller = appRouter.createCaller(context("admin"));
    await expect(caller.admin.updateSubscription({
      userId: 12,
      status: "active",
      activeUntil: Date.now() + 30 * 86_400_000,
      lastPaymentMethod: "bkash",
      ownerNote: "Confirmed locally",
    })).resolves.toMatchObject({ status: "active" });
    expect(dbMocks.updateSubscription).toHaveBeenCalledWith(7, expect.objectContaining({ userId: 12, lastPaymentMethod: "bkash" }));
  });
});
