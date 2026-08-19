// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../client/src/_core/hooks/useAuth";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  query: { data: null, error: null, isLoading: false, isFetching: true, refetch: vi.fn() },
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
  useAuth({ redirectOnUnauthenticated: true });
  return null;
}

describe("useAuth protected-route integration", () => {
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
});
