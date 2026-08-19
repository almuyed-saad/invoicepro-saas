import { Button } from "@/components/ui/button";
import { formatBDT, toDateInput } from "@/lib/invoice";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CircleAlert, Minus, Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

type LineItem = { id: string; description: string; quantity: string; rate: string };
const firstItem = (): LineItem => ({ id: crypto.randomUUID(), description: "", quantity: "1", rate: "" });

export default function InvoiceEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/invoices/:id/edit");
  const invoiceId = Number(params?.id);
  const isEditing = Number.isInteger(invoiceId) && invoiceId > 0;
  const clientsQuery = trpc.clients.list.useQuery();
  const detailQuery = trpc.invoices.get.useQuery({ id: invoiceId }, { enabled: isEditing });
  const create = trpc.invoices.create.useMutation();
  const update = trpc.invoices.update.useMutation();
  const [clientChoice, setClientChoice] = useState("manual");
  const [billingType, setBillingType] = useState<"fixed_price" | "itemized">("itemized");
  const [manualClient, setManualClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([firstItem()]);
  const existing = detailQuery.data;
  useEffect(() => {
    if (!existing) return;
    setClientChoice(existing.clientId ? String(existing.clientId) : "manual");
    setBillingType(existing.billingType);
    setManualClient({ name: existing.clientName, email: existing.clientEmail || "", phone: existing.clientPhone || "", address: existing.clientAddress || "" });
    setDueDate(toDateInput(existing.dueDate));
    setDiscount(String(existing.discountPaisa / 100));
    setNotes(existing.notes || "");
    setItems(existing.items.map(item => ({ id: String(item.id), description: item.description, quantity: String(item.quantityHundredths / 100), rate: String(item.unitAmountPaisa / 100) })));
  }, [existing]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Math.round((Number(item.quantity) || 0) * (Number(item.rate) || 0) * 100), 0), [items]);
  const discountPaisa = Math.min(subtotal, Math.max(0, Math.round((Number(discount) || 0) * 100)));
  const total = subtotal - discountPaisa;
  const updateItem = (id: string, key: keyof Omit<LineItem, "id">, value: string) => setItems(current => current.map(item => item.id === id ? { ...item, [key]: value } : item));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const selectedClient = clientChoice === "manual" ? null : Number(clientChoice);
    if (!selectedClient && !manualClient.name.trim()) { toast.error("Add a client name or choose a saved client"); return; }
    const input = {
      clientId: selectedClient,
      clientName: selectedClient ? null : manualClient.name,
      clientEmail: selectedClient ? null : (manualClient.email || null),
      clientPhone: selectedClient ? null : (manualClient.phone || null),
      clientAddress: selectedClient ? null : (manualClient.address || null),
      billingType,
      dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).getTime() : null,
      discountPaisa,
      notes: notes || null,
      items: items.map(item => ({ description: item.description, quantityHundredths: Math.max(1, Math.round((Number(item.quantity) || 0) * 100)), unitAmountPaisa: Math.max(0, Math.round((Number(item.rate) || 0) * 100)) })),
    };
    try {
      const result = isEditing ? await update.mutateAsync({ id: invoiceId, values: input }) : await create.mutateAsync(input);
      toast.success(isEditing ? "Invoice updated" : "Invoice created");
      setLocation(`/invoices/${result.id}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save invoice"); }
  };
  const selectedClient = clientsQuery.data?.find(client => String(client.id) === clientChoice);
  return <><section className="page-head"><div><button className="mb-3 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0f766e]" onClick={() => setLocation(isEditing ? `/invoices/${invoiceId}` : "/invoices")}><ArrowLeft size={14} />Back</button><p className="eyebrow">{isEditing ? "UPDATE INVOICE" : "NEW BDT INVOICE"}</p><h1>{isEditing ? "Edit invoice" : "Create invoice"}</h1><p>Build a clear invoice your client can open without an account.</p></div></section>
  <form className="form-shell form-card" onSubmit={submit}>
    <section className="form-section"><h2>Who is this for?</h2><p>Select a saved client or add their details for this invoice only.</p><div className="form-grid"><div className="field span-2"><label>Saved client</label><select value={clientChoice} onChange={e => setClientChoice(e.target.value)}><option value="manual">Add client details manually</option>{clientsQuery.data?.map(client => <option key={client.id} value={client.id}>{client.name}{client.email ? ` · ${client.email}` : ""}</option>)}</select></div>{clientChoice === "manual" ? <><div className="field"><label>Client name</label><input required value={manualClient.name} onChange={e => setManualClient({ ...manualClient, name: e.target.value })} placeholder="Client or business name" /></div><div className="field"><label>Client email <span className="font-normal text-slate-400">(optional)</span></label><input type="email" value={manualClient.email} onChange={e => setManualClient({ ...manualClient, email: e.target.value })} placeholder="client@example.com" /></div><div className="field"><label>Phone <span className="font-normal text-slate-400">(optional)</span></label><input value={manualClient.phone} onChange={e => setManualClient({ ...manualClient, phone: e.target.value })} placeholder="01XXXXXXXXX" /></div><div className="field"><label>Address <span className="font-normal text-slate-400">(optional)</span></label><input value={manualClient.address} onChange={e => setManualClient({ ...manualClient, address: e.target.value })} placeholder="City, country" /></div></> : <div className="surface-card p-4 text-sm text-slate-600"><strong className="text-[#102a43]">{selectedClient?.name}</strong><span className="ml-2">{selectedClient?.email || selectedClient?.phone || "Saved client details will be added."}</span></div>}</div></section>
    <section className="form-section"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2>What are you charging for?</h2><p>Every invoice uses BDT. Choose the layout that fits the job.</p></div><div className="billing-toggle"><button type="button" className={billingType === "itemized" ? "active" : ""} onClick={() => setBillingType("itemized")}>Itemized</button><button type="button" className={billingType === "fixed_price" ? "active" : ""} onClick={() => setBillingType("fixed_price")}>Fixed price</button></div></div><div className="item-editor"><div className="item-editor-head"><span>Description</span><span>Qty</span><span>Rate (৳)</span><span className="text-right">Amount</span><span /></div>{items.map((item, index) => <div className="item-row" key={item.id}><input required value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} placeholder={billingType === "fixed_price" ? "Project or service" : "Service description"} /><input required type="number" min="0.01" step="0.01" value={billingType === "fixed_price" ? "1" : item.quantity} disabled={billingType === "fixed_price"} onChange={e => updateItem(item.id, "quantity", e.target.value)} /><input required type="number" min="0" step="0.01" value={item.rate} onChange={e => updateItem(item.id, "rate", e.target.value)} placeholder="0" /><strong>{formatBDT(Math.round((billingType === "fixed_price" ? 1 : Number(item.quantity) || 0) * (Number(item.rate) || 0) * 100))}</strong><button type="button" className="danger-icon" disabled={items.length === 1} onClick={() => setItems(current => current.filter(row => row.id !== item.id))} aria-label="Remove line item"><Trash2 size={15} /></button></div>)}</div><Button type="button" variant="ghost" className="mt-3 text-[#0f766e]" onClick={() => setItems(current => [...current, firstItem()])}><Plus size={15} />Add line item</Button><div className="form-grid mt-5"><div className="field"><label>Due date <span className="font-normal text-slate-400">(optional)</span></label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div><div className="field"><label>Discount (৳)</label><input type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} /></div><div className="field span-2"><label>Note for client <span className="font-normal text-slate-400">(optional)</span></label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Thank you for working with me." /></div></div><div className="summary-total"><div><span>Subtotal</span><strong>{formatBDT(subtotal)}</strong></div><div><span>Discount</span><strong>− {formatBDT(discountPaisa)}</strong></div><div><span>Total due</span><strong>{formatBDT(total)}</strong></div></div></section>
    <div className="sticky-submit"><Button type="button" className="secondary-button" onClick={() => setLocation(isEditing ? `/invoices/${invoiceId}` : "/invoices")}>Cancel</Button><Button type="submit" className="primary-button" disabled={create.isPending || update.isPending}><Save size={16} />{isEditing ? "Save invoice" : "Create invoice"}</Button></div>
  </form></>;
}
