import { describe, expect, it } from "vitest";
import { beforeEach, vi } from "vitest";
import type { Request } from "express";
import type { User } from "../drizzle/schema";

vi.mock("./db", () => ({ getUserById: vi.fn() }));

import { getUserById } from "./db";
import { CUSTOMER_SESSION_COOKIE, createCustomerSession, getCustomerUserFromRequest, hashCustomerPassword, verifyCustomerPassword } from "./customerAuth";

describe("customer password handling", () => {
  it("accepts the original password and rejects a different password", async () => {
    const hash = await hashCustomerPassword("InvoiceProPass123");

    await expect(verifyCustomerPassword("InvoiceProPass123", hash)).resolves.toBe(true);
    await expect(verifyCustomerPassword("different-password", hash)).resolves.toBe(false);
  });

  it("does not place the password itself in the persisted hash", async () => {
    const password = "A-unique-password-99";
    const hash = await hashCustomerPassword(password);

    expect(hash).not.toContain(password);
    expect(hash).toContain(":");
  });
});

describe("customer session revocation", () => {
  const customer: User = {
    id: 42,
    openId: "customer_test",
    name: "Customer Test",
    email: "customer@example.com",
    loginMethod: "password",
    role: "user",
    customerSessionVersion: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  beforeEach(() => vi.clearAllMocks());

  it("rejects a token when the stored session version was invalidated", async () => {
    const token = await createCustomerSession(customer);
    vi.mocked(getUserById).mockResolvedValue({ ...customer, customerSessionVersion: 5 });
    const req = { headers: { cookie: `${CUSTOMER_SESSION_COOKIE}=${token}` } } as Request;

    await expect(getCustomerUserFromRequest(req)).resolves.toBeNull();
    expect(getUserById).toHaveBeenCalledWith(42);
  });
});
