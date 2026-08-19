export type SearchableClient = {
  name: string;
  email?: string | null;
  phone?: string | null;
};

export function filterClients<T extends SearchableClient>(clients: T[], search: string) {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return clients;
  return clients.filter(client => `${client.name} ${client.email || ""} ${client.phone || ""}`.toLowerCase().includes(normalized));
}
