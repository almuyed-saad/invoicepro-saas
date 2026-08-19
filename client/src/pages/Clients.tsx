import { Button } from "@/components/ui/button";
import { filterClients } from "@/lib/clients";
import { trpc } from "@/lib/trpc";
import { Mail, MapPin, Pencil, Phone, Plus, Search, Trash2, UsersRound, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type ClientDraft = { name: string; email: string; phone: string; address: string };
const blank: ClientDraft = { name: "", email: "", phone: "", address: "" };

export default function Clients() {
  const utils = trpc.useUtils();
  const list = trpc.clients.list.useQuery();
  const create = trpc.clients.create.useMutation({ onSuccess: () => utils.clients.list.invalidate() });
  const update = trpc.clients.update.useMutation({ onSuccess: () => utils.clients.list.invalidate() });
  const remove = trpc.clients.delete.useMutation({ onSuccess: () => utils.clients.list.invalidate() });
  const [draft, setDraft] = useState<ClientDraft | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const clients = list.data ?? [];
  const filteredClients = useMemo(() => filterClients(clients, search), [clients, search]);
  const save = async (event: FormEvent) => { event.preventDefault(); if (!draft) return; const values = { ...draft, email: draft.email || null, phone: draft.phone || null, address: draft.address || null }; try { if (editingId) await update.mutateAsync({ id: editingId, values }); else await create.mutateAsync(values); toast.success(editingId ? "Client updated" : "Client added"); setDraft(null); setEditingId(null); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save client"); } };
  const startEdit = (client: any) => { setEditingId(client.id); setDraft({ name: client.name, email: client.email || "", phone: client.phone || "", address: client.address || "" }); };
  return <>
    <section className="page-head"><div><p className="eyebrow">REUSABLE CLIENT RECORDS</p><h1>Clients</h1><p>Keep client details ready for your next invoice.</p></div><div className="page-actions"><Button className="primary-button" onClick={() => { setEditingId(null); setDraft(blank); }}><Plus size={17} />Add client</Button></div></section>
    {draft && <form className="form-card mb-5" onSubmit={save}><div className="card-head"><div><p className="eyebrow">{editingId ? "UPDATE RECORD" : "NEW CLIENT"}</p><h2 className="mt-1">{editingId ? "Edit client" : "Add client"}</h2></div><Button type="button" className="secondary-button icon-button" onClick={() => { setDraft(null); setEditingId(null); }}><X size={17} /></Button></div><div className="form-grid"><div className="field"><label>Client name</label><input required value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. North Studio" /></div><div className="field"><label>Email address</label><input type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} placeholder="client@example.com" /></div><div className="field"><label>Phone number</label><input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} placeholder="01XXXXXXXXX" /></div><div className="field"><label>Address</label><input value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} placeholder="City, country" /></div></div><div className="sticky-submit"><Button type="button" className="secondary-button" onClick={() => { setDraft(null); setEditingId(null); }}>Cancel</Button><Button type="submit" className="primary-button" disabled={create.isPending || update.isPending}>{editingId ? "Save changes" : "Add client"}</Button></div></form>}
    <div className="list-toolbar mb-4"><div className="relative"><Search size={15} className="absolute left-3 top-[13px] text-slate-400" /><input className="search-input pl-9" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search clients by name, email, or phone" aria-label="Search clients" /></div><span className="text-xs font-bold text-slate-500">{filteredClients.length} saved client{filteredClients.length === 1 ? "" : "s"}</span></div>
    <section className="grid gap-3 md:grid-cols-2">{filteredClients.length ? filteredClients.map((client: any) => <article key={client.id} className="surface-card p-5"><div className="flex items-start justify-between gap-4"><div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef4f3] text-[#0f766e]"><UsersRound size={18} /></span><div><h2 className="font-sans text-[16px] font-extrabold">{client.name}</h2><div className="mt-2 grid gap-1 text-[12px] text-slate-500">{client.email && <span className="flex items-center gap-1"><Mail size={12} />{client.email}</span>}{client.phone && <span className="flex items-center gap-1"><Phone size={12} />{client.phone}</span>}{client.address && <span className="flex items-center gap-1"><MapPin size={12} />{client.address}</span>}</div></div></div><div className="flex gap-1"><button className="danger-icon text-slate-500" onClick={() => startEdit(client)} aria-label="Edit client"><Pencil size={15} /></button><button className="danger-icon" onClick={async () => { if (confirm(`Delete ${client.name}? Existing invoices will keep their saved details.`)) { try { await remove.mutateAsync({ id: client.id }); toast.success("Client deleted"); } catch { toast.error("Could not delete client"); } } }} aria-label="Delete client"><Trash2 size={15} /></button></div></div></article>) : <div className="empty-state md:col-span-2"><UsersRound size={22} />{search ? "No saved client matches that search." : "Add clients once and select them again whenever you make an invoice."}</div>}</section>
  </>;
}
