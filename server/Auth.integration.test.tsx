// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchSession: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  setLocation: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { fetch: mocks.fetchSession } } }),
    auth: {
      login: { useMutation: () => ({ mutateAsync: mocks.login, isPending: false }) },
      register: { useMutation: () => ({ mutateAsync: mocks.register, isPending: false }) },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
  useLocation: () => ["/sign-in", mocks.setLocation],
}));

vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }));

import Auth from "@/pages/Auth";

describe("Auth customer session integration", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchSession.mockResolvedValue({ id: 5, email: "customer@example.com" });
    mocks.login.mockResolvedValue({});
    mocks.register.mockResolvedValue({});
    window.history.pushState({}, "", "/sign-in?next=%2Finvoices");
  });

  it("refreshes the customer session before navigating after password login", async () => {
    const events: string[] = [];
    mocks.login.mockImplementation(async () => { events.push("login"); });
    mocks.fetchSession.mockImplementation(async () => { events.push("refresh"); return { id: 5 }; });
    mocks.setLocation.mockImplementation((path: string) => events.push(`navigate:${path}`));
    render(<Auth />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "customer@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPassword1!" } });
    fireEvent.click(screen.getByRole("button", { name: /open workspace/i }));
    await waitFor(() => expect(mocks.setLocation).toHaveBeenCalledWith("/invoices"));
    expect(events).toEqual(["login", "refresh", "navigate:/invoices"]);
  });

  it("refreshes the customer session before onboarding after registration", async () => {
    const events: string[] = [];
    mocks.register.mockImplementation(async () => { events.push("register"); });
    mocks.fetchSession.mockImplementation(async () => { events.push("refresh"); return { id: 5 }; });
    mocks.setLocation.mockImplementation((path: string) => events.push(`navigate:${path}`));
    render(<Auth />);
    fireEvent.click(screen.getByRole("button", { name: /start your free trial/i }));
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Browser QA" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "customer@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPassword1!" } });
    fireEvent.click(screen.getByRole("button", { name: /^start free trial/i }));
    await waitFor(() => expect(mocks.setLocation).toHaveBeenCalledWith("/onboarding"));
    expect(events).toEqual(["register", "refresh", "navigate:/onboarding"]);
  });

  it("shows the expected error and blocks navigation if a successful login lacks a session", async () => {
    mocks.fetchSession.mockResolvedValue(null);
    render(<Auth />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "customer@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPassword1!" } });
    fireEvent.click(screen.getByRole("button", { name: /open workspace/i }));
    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith("Your credentials were accepted, but the session could not be opened. Please try again."));
    expect(mocks.setLocation).not.toHaveBeenCalled();
  });
});
