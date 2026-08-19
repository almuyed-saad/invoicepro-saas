export function shouldRedirectToSignIn(input: {
  redirectOnUnauthenticated: boolean;
  sessionCheckPending: boolean;
  hasUser: boolean;
  isAlreadyAtRedirect: boolean;
}) {
  return input.redirectOnUnauthenticated
    && !input.sessionCheckPending
    && !input.hasUser
    && !input.isAlreadyAtRedirect;
}
