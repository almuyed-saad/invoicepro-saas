import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({ reviewPaymentRequest: vi.fn() }));

import { reviewPaymentRequest } from "./db";
import { appRouter } from "./routers";

describe("owner payment-request review", () => {
  const ctx: TrpcContext = {
    user: {
      id: 9,
      openId: "invoicepro-owner",
      name: "InvoicePro Owner",
      email: "owner@example.com",
      loginMethod: "manus",
      role: "admin",
      customerSessionVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  beforeEach(() => vi.clearAllMocks());

  it("forwards an approved local-payment request to the owner review helper", async () => {
    vi.mocked(reviewPaymentRequest).mockResolvedValue({ success: true });

    await expect(appRouter.createCaller(ctx).admin.reviewPaymentRequest({ requestId: 71, status: "approved", ownerNote: "Reference matched" })).resolves.toEqual({ success: true });
    expect(reviewPaymentRequest).toHaveBeenCalledWith(9, { requestId: 71, status: "approved", ownerNote: "Reference matched" });
  });
});
