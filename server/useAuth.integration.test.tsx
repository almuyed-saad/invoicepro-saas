// @vitest-environment jsdom
import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../client/src/_core/hooks/useAuth";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  query: { data: null as unknown, error: null, isLoading: false, isFetching: true, refetch: vi.fn() },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { setData: vi.fn(), invalidate: vi.fn() } } }),
    auth: {
      me: { useQuery: () => mocks.query },
      logout: { useMutation: () => ({ isPending: false, error: null, mutateAsync: vi.fn() }) },
    },
  },
}));

vi.mock("@shared/authRouteNavigation", () => ({ navigateToAuthRoute: mocks.navigate }));

function AuthProbe() {
  const { loading } = useAuth({ redirectOnUnauthenticated: true });
  return <output data-testid="auth-loading">{loading ? "loading" : "ready"}</output>;
}

describe("useAuth protected-route integration", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = { data: null, error: null, isLoading: false, isFetching: true, refetch: vi.fn() };
    window.history.pushState({}, "", "/dashboard");
  });

  it("does not navigate during a customer session refetch, then redirects only after it settles unauthenticated", async () => {
    const { rerender } = render(<AuthProbe />);
    await waitFor(() => expect(mocks.navigate).not.toHaveBeenCalled());
    mocks.query = { ...mocks.query, isFetching: false };
    rerender(<AuthProbe />);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/sign-in?next=%2Fdashboard"));
  });

  it("keeps an authenticated owner workspace rendered while auth.me refetches in the background", async () => {
    mocks.query = {
      data: { id: 1, name: "InvoicePro owner", email: "contact.almuyedsaad@gmail.com", role: "admin" },
      error: null,
      isLoading: false,
      isFetching: true,
      refetch: vi.fn(),
    };
    const { getByTestId } = render(<AuthProbe />);
    expect(getByTestId("auth-loading").textContent).toBe("ready");
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
