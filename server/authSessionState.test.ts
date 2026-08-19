import { describe, expect, it } from "vitest";
import { isAuthSessionCheckPending } from "@shared/authSessionState";

describe("isAuthSessionCheckPending", () => {
  it("holds an auth gate during an initial or refreshed session lookup", () => {
    expect(isAuthSessionCheckPending({ isLoading: true, isFetching: true, isLoggingOut: false })).toBe(true);
    expect(isAuthSessionCheckPending({ isLoading: false, isFetching: true, isLoggingOut: false })).toBe(true);
  });

  it("holds an auth gate while logout invalidates the server session", () => {
    expect(isAuthSessionCheckPending({ isLoading: false, isFetching: false, isLoggingOut: true })).toBe(true);
    expect(isAuthSessionCheckPending({ isLoading: false, isFetching: false, isLoggingOut: false })).toBe(false);
  });
});
