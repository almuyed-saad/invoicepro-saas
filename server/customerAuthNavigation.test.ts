import { describe, expect, it } from "vitest";
import { requireAuthenticatedCustomer } from "@shared/customerAuthNavigation";

describe("requireAuthenticatedCustomer", () => {
  it("returns the refreshed customer session before route navigation", async () => {
    await expect(requireAuthenticatedCustomer(async () => ({ id: 7, email: "customer@example.com" }), "Session unavailable")).resolves.toEqual({ id: 7, email: "customer@example.com" });
  });

  it("blocks navigation with a clear error when a post-auth refresh has no customer", async () => {
    await expect(requireAuthenticatedCustomer(async () => null, "Session unavailable")).rejects.toThrow("Session unavailable");
  });
});
