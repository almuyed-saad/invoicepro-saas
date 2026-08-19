import { requireAuthenticatedCustomer } from "./customerAuthNavigation";

export async function completeCustomerAuthentication<T>(input: {
  authenticate: () => Promise<unknown>;
  refreshSession: () => Promise<T | null | undefined>;
  failureMessage: string;
  onAuthenticated: () => void;
}) {
  await input.authenticate();
  await requireAuthenticatedCustomer(input.refreshSession, input.failureMessage);
  input.onAuthenticated();
}
