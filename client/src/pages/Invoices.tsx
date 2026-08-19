import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatBDT, formatDate } from "@/lib/invoice";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Invoices() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const invoicesQuery = trpc.invoices.list.useQuery();
  const invoices = invoicesQuery.data ?? [];
  const filtered = useMemo(() => invoices.filter(invoice => `${invoice.clientName} ${invoice.invoiceNumber}`.toLowerCase().includes(search.toLowerCase())), [invoices, search]);
  return <>
    <section className="page-head"><div><p className="eyebrow">BDT INVOICING</p><h1>Invoices</h1><p>Create, share, and keep every client payment visible.</p></div><div className="page-actions"><Button className="primary-button" onClick={() => setLocation("/invoices/new")}><Plus size={17} />New invoice</Button></div></section>
    <article className="surface-card"><div className="list-toolbar"><div className="relative"><Search size={15} className="absolute left-3 top-[13px] text-slate-400" /><input className="search-input pl-9" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search client or invoice number" /></div><span className="text-xs font-bold text-slate-500">{filtered.length} invoice{filtered.length === 1 ? "" : "s"}</span></div>
    {filtered.length ? <div className="invoice-table-wrap"><table className="invoice-table"><thead><tr><th>Client</th><th>Due date</th><th>Status</th><th className="text-right">Invoice total</th><th className="text-right">Outstanding</th></tr></thead><tbody>{filtered.map(invoice => <tr key={invoice.id} onClick={() => setLocation(`/invoices/${invoice.id}`)}><td className="invoice-title-cell"><strong>{invoice.clientName}</strong><span>{invoice.invoiceNumber}</span></td><td>{formatDate(invoice.dueDate)}</td><td><StatusBadge status={invoice.status} /></td><td className="text-right"><span className="amount">{formatBDT(invoice.totalPaisa)}</span></td><td className="text-right"><span className="amount">{formatBDT(invoice.outstandingPaisa)}</span>{invoice.daysOverdue > 0 && <span className="amount-muted text-orange-700">{invoice.daysOverdue}d overdue</span>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><FileText size={22} />{search ? "No invoice matches this search." : "You have not created an invoice yet."}<br />{!search && <button className="card-link mt-2" onClick={() => setLocation("/invoices/new")}>Create your first one</button>}</div>}</article>
  </>;
}
