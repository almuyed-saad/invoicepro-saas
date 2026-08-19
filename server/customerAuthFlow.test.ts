import { describe, expect, it } from "vitest";
import { completeCustomerAuthentication } from "@shared/customerAuthFlow";

describe("completeCustomerAuthentication", () => {
  it("refreshes the authenticated session before allowing navigation", async () => {
    const events: string[] = [];
    await completeCustomerAuthentication({
      authenticate: async () => { events.push("authenticate"); },
      refreshSession: async () => { events.push("refresh"); return { id: 7 }; },
      failureMessage: "Session unavailable",
      onAuthenticated: () => events.push("navigate"),
    });
    expect(events).toEqual(["authenticate", "refresh", "navigate"]);
  });

  it("blocks navigation when the post-auth session refresh has no customer", async () => {
    const events: string[] = [];
    await expect(completeCustomerAuthentication({
      authenticate: async () => { events.push("authenticate"); },
      refreshSession: async () => { events.push("refresh"); return null; },
      failureMessage: "Session unavailable",
      onAuthenticated: () => events.push("navigate"),
    })).rejects.toThrow("Session unavailable");
    expect(events).toEqual(["authenticate", "refresh"]);
  });
});
