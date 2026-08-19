import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { formatBDT, formatDate } from "@/lib/invoice";
import { ArrowUpRight, BellRing, FileText, HandCoins, Plus, WalletCards } from "lucide-react";
import { useLocation } from "wouter";

function StatCard({ icon, label, value, overdue = false }: { icon: React.ReactNode; label: string; value: string; overdue?: boolean }) {
  return <article className={`stat-card ${overdue ? "overdue" : ""}`}><span className="stat-icon">{icon}</span><strong>{value}</strong><span>{label}</span></article>;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const summary = trpc.dashboard.summary.useQuery();
  const invoiceQuery = trpc.invoices.list.useQuery();
  const profileQuery = trpc.profile.get.useQuery();
  const data = summary.data;
  const invoices = invoiceQuery.data ?? [];

  return <>
    <section className="page-head">
      <div><p className="eyebrow">CASH FLOW AT A GLANCE</p><h1>Good to see you.</h1><p>See what is paid, pending, and ready for a follow-up.</p></div>
      <div className="page-actions"><Button className="primary-button" onClick={() => setLocation("/invoices/new")}><Plus size={17} />New invoice</Button></div>
    </section>
    {!profileQuery.data && <div className="surface-card mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">ONE LAST STEP</p><h2 className="mt-1">Add your business and payment details.</h2><p className="mt-1 text-sm text-slate-500">Your client-facing invoices will use these details.</p></div><Button className="secondary-button" onClick={() => setLocation("/profile")}>Set up profile <ArrowUpRight size={15} /></Button></div>}
    <section className="stat-grid">
      <StatCard icon={<FileText size={16} />} label="Total invoices" value={String(data?.totalInvoices ?? 0)} />
      <StatCard icon={<WalletCards size={16} />} label="Awaiting payment" value={formatBDT(data?.totalUnpaidPaisa ?? 0)} />
      <StatCard icon={<HandCoins size={16} />} label="Received" value={formatBDT(data?.totalPaidPaisa ?? 0)} />
      <StatCard icon={<BellRing size={16} />} label="Need follow-up" value={String(data?.overdueCount ?? 0)} overdue />
    </section>
    <section className="dashboard-grid">
      <article className="surface-card">
        <div className="card-head"><div><p className="eyebrow">RECENT INVOICES</p><h2 className="mt-1">Payment pulse</h2></div><button className="card-link" onClick={() => setLocation("/invoices")}>See all invoices</button></div>
        {invoices.length ? <div className="invoice-table-wrap"><table className="invoice-table"><thead><tr><th>Invoice</th><th>Due date</th><th>Status</th><th className="text-right">Outstanding</th></tr></thead><tbody>{invoices.slice(0, 6).map(invoice => <tr key={invoice.id} onClick={() => setLocation(`/invoices/${invoice.id}`)}><td className="invoice-title-cell"><strong>{invoice.clientName}</strong><span>{invoice.invoiceNumber}</span></td><td>{formatDate(invoice.dueDate)}</td><td><StatusBadge status={invoice.status} /></td><td className="text-right"><strong className="amount">{formatBDT(invoice.outstandingPaisa)}</strong></td></tr>)}</tbody></table></div> : <div className="empty-state"><FileText size={20} />Your first invoice will appear here.<br /><button className="card-link mt-2" onClick={() => setLocation("/invoices/new")}>Create an invoice</button></div>}
      </article>
      <article className="surface-card"><div className="card-head"><div><p className="eyebrow">RECENT ACTIVITY</p><h2 className="mt-1">Workspace trail</h2></div></div><div className="activity-list">{data?.recentActivity?.length ? data.recentActivity.map(event => <div className="activity-row" key={event.id}><span className="activity-dot" /><div><p>{event.detail || event.action}</p><span>{formatDate(event.createdAt)}</span></div></div>) : <div className="empty-state"><BellRing size={20} />Actions like invoices, payments, and profile changes will be remembered here.</div>}</div></article>
    </section>
  </>;
}
