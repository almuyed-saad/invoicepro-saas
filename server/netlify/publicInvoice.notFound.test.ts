import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./context";

const dbMocks = vi.hoisted(() => ({
  getPublicInvoice: vi.fn(),
  markPublicInvoiceViewed: vi.fn(),
}));

vi.mock("./db.pg", async () => {
  const actual = await vi.importActual<typeof import("./db.pg")>("./db.pg");
  return { ...actual, ...dbMocks };
});

import { appRouter } from "./routers";

function publicContext(): TrpcContext {
  return { req: new Request("https://invoice-pro-saas.netlify.app"), res: new Response(), user: null };
}

describe("public invoice missing token handling", () => {
  it("returns a controlled NOT_FOUND error instead of an internal-server error", async () => {
    dbMocks.getPublicInvoice.mockResolvedValue(null);
    const caller = appRouter.createCaller(publicContext());

    await expect(caller.publicInvoice.get({ token: "a".repeat(24) })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
