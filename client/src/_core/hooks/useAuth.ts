import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";
import { isAuthSessionCheckPending } from "@shared/authSessionState";
import { shouldRedirectToSignIn } from "@shared/authRedirectGuard";
import { navigateToAuthRoute } from "@shared/authRouteNavigation";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  // Login is started via startLogin() in the effect below, only when we actually
  // navigate — never during render. startLogin() mints a one-time nonce + writes
  // the state cookie, so calling it per render would overwrite the cookie and
  // desync it from an in-flight login's `state`.
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const sessionCheckPending = isAuthSessionCheckPending({
    isLoading: meQuery.isLoading,
    isFetching: meQuery.isFetching,
    isLoggingOut: logoutMutation.isPending,
  });

  const initialWorkspaceLoad = meQuery.isLoading || logoutMutation.isPending;

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: initialWorkspaceLoad,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    logoutMutation.error,
    initialWorkspaceLoad,
    sessionCheckPending,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = redirectPath || `/sign-in?next=${encodeURIComponent(window.location.pathname)}`;
    if (!shouldRedirectToSignIn({
      redirectOnUnauthenticated,
      sessionCheckPending,
      hasUser: Boolean(state.user),
      isAlreadyAtRedirect: Boolean(redirectPath && window.location.pathname === redirectPath),
    })) return;

    navigateToAuthRoute(target);
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    sessionCheckPending,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
