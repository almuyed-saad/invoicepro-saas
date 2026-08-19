import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Onboarding() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/sign-in?next=/onboarding" });
  const [, setLocation] = useLocation();
  const profile = trpc.profile.get.useQuery(undefined, { enabled: Boolean(user) });
  const utils = trpc.useUtils();
  const save = trpc.profile.save.useMutation({ onSuccess: () => { utils.profile.get.invalidate(); utils.dashboard.summary.invalidate(); } });
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  useEffect(() => { if (profile.data) setLocation("/dashboard"); }, [profile.data, setLocation]);
  if (loading || profile.isLoading || profile.data) return <div className="page-loading"><div className="loading-orb" />Preparing your InvoicePro workspace</div>;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await save.mutateAsync({ businessName, phone, email: businessEmail, logoUrl: null, bkashNumber: null, nagadNumber: null, rocketNumber: null, bankTransferInstructions: null });
      toast.success("Step 1 complete — your workspace is ready");
      setLocation("/dashboard?welcome=1");
    } catch (error) { toast.error(error instanceof Error ? error.message : "We could not save your setup"); }
  };
  return <main className="onboarding-shell"><section className="onboarding-card"><div className="onboarding-top"><span className="brand-mark">৳</span><div><p className="eyebrow">FIRST-TIME SETUP</p><h1>Make your first invoice feel like yours.</h1></div></div><div className="onboarding-progress"><span className="active">1</span><i /><span>2</span><i /><span>3</span><p>Business details</p></div><p className="onboarding-copy">Start with the details your clients should see. You can add your logo and payment numbers later from your business profile.</p><form onSubmit={submit} className="onboarding-form"><div className="field"><label>Business or freelancer name</label><input value={businessName} onChange={event => setBusinessName(event.target.value)} placeholder="e.g. Saad Design Studio" minLength={2} required autoFocus /></div><div className="form-grid"><div className="field"><label>Phone number</label><input value={phone} onChange={event => setPhone(event.target.value)} placeholder="01XXXXXXXXX" minLength={5} required /></div><div className="field"><label>Business email</label><input type="email" value={businessEmail} onChange={event => setBusinessEmail(event.target.value)} placeholder="you@example.com" required /></div></div><Button type="submit" className="customer-cta" disabled={save.isPending}>{save.isPending ? "Creating workspace…" : <>Continue to your workspace <ArrowRight size={17} /></>}</Button></form><div className="onboarding-reassurance"><Sparkles size={16} /><span>Your 14-day trial is active. Create as many client-ready BDT invoices as you need.</span></div></section><aside className="onboarding-side"><p className="eyebrow">WHAT HAPPENS NEXT</p><div><CheckCircle2 size={19} /><span><strong>Save your payment details</strong><small>Add bKash, Nagad, Rocket, or bank transfer instructions.</small></span></div><div><CheckCircle2 size={19} /><span><strong>Create your first invoice</strong><small>Choose a client, add line items, and set a due date.</small></span></div><div><CheckCircle2 size={19} /><span><strong>Share a clean client link</strong><small>Copy a WhatsApp or email message in one tap.</small></span></div></aside></main>;
}
