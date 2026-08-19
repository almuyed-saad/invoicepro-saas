import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Check, ChevronRight, FileText, Send, WalletCards } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const enterWorkspace = () => isAuthenticated ? setLocation("/dashboard") : startLogin();

  return (
    <div className="marketing-shell">
      <header className="marketing-nav">
        <button className="brand-lockup brand-on-light" onClick={() => setLocation("/")}><span className="brand-mark">৳</span>Invoice<span>Pro</span></button>
        <Button variant="ghost" onClick={enterWorkspace} className="text-ink hover:bg-ink/5">{isAuthenticated ? "Open workspace" : "Sign in"}<ChevronRight size={16} /></Button>
      </header>
      <main>
        <section className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">BUILT FOR BANGLADESHI FREELANCERS</p>
            <h1>Invoice clearly.<br /><em>Get paid</em> confidently.</h1>
            <p className="hero-lede">Create BDT invoices, share them in one tap, and stay ahead of every follow-up—from your phone.</p>
            <div className="hero-actions"><Button size="lg" onClick={enterWorkspace}>Create your first invoice <ChevronRight size={17} /></Button><span>No cards. Manual activation.</span></div>
            <div className="hero-proof"><span><Check size={15} /> BDT only</span><span><Check size={15} /> bKash, Nagad &amp; Rocket</span><span><Check size={15} /> Client links, no login</span></div>
          </div>
          <div className="hero-art" aria-label="InvoicePro invoice preview">
            <div className="float-note note-top">Today <strong>৳18,500</strong><small>received</small></div>
            <div className="invoice-hero-card">
              <div className="invoice-hero-head"><span className="brand-mark">৳</span><span className="status-badge status-sent">Sent</span></div>
              <p className="invoice-hero-kicker">INVOICE #INV-2408-016</p><h3>Studio North</h3><p className="invoice-hero-muted">Brand identity &amp; social kit</p>
              <div className="invoice-hero-line"><span>Design system</span><strong>৳32,000</strong></div>
              <div className="invoice-hero-total"><span>Total due</span><strong>৳32,000</strong></div>
              <button>Copy WhatsApp message <Send size={15} /></button>
            </div>
            <div className="float-note note-bottom"><WalletCards size={17} /><span>Due in <strong>4 days</strong></span></div>
          </div>
        </section>
        <section className="value-strip"><div><FileText /><span><strong>Professional invoices</strong><small>That carry your business details.</small></span></div><div><Send /><span><strong>Quick sharing</strong><small>Messages prepared for you.</small></span></div><div><WalletCards /><span><strong>Better follow-ups</strong><small>Know exactly who to contact.</small></span></div></section>
      </main>
    </div>
  );
}
