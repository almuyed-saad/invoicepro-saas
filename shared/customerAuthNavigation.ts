export async function requireAuthenticatedCustomer<T>(
  refreshSession: () => Promise<T | null | undefined>,
  failureMessage: string,
) {
  const customer = await refreshSession();
  if (!customer) throw new Error(failureMessage);
  return customer;
}
