import { describe, expect, it } from "vitest";
import { shouldRedirectToSignIn } from "@shared/authRedirectGuard";

describe("shouldRedirectToSignIn", () => {
  it("waits for an in-flight auth refetch before redirecting a protected route", () => {
    expect(shouldRedirectToSignIn({ redirectOnUnauthenticated: true, sessionCheckPending: true, hasUser: false, isAlreadyAtRedirect: false })).toBe(false);
  });

  it("redirects only after the auth lookup is settled and no customer session exists", () => {
    expect(shouldRedirectToSignIn({ redirectOnUnauthenticated: true, sessionCheckPending: false, hasUser: false, isAlreadyAtRedirect: false })).toBe(true);
    expect(shouldRedirectToSignIn({ redirectOnUnauthenticated: true, sessionCheckPending: false, hasUser: true, isAlreadyAtRedirect: false })).toBe(false);
  });
});
