export function isAuthSessionCheckPending(input: {
  isLoading: boolean;
  isFetching: boolean;
  isLoggingOut: boolean;
}) {
  return input.isLoading || input.isFetching || input.isLoggingOut;
}
