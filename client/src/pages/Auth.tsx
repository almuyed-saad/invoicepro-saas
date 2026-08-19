import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const utils = trpc.useUtils();
  const register = trpc.auth.register.useMutation();
  const login = trpc.auth.login.useMutation();
  const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
  const pending = register.isPending || login.isPending;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "register") {
        await register.mutateAsync({ name, email, password });
        const customer = await utils.auth.me.fetch();
        if (!customer) throw new Error("Your account was created, but the session could not be opened. Please sign in again.");
        toast.success("Your 14-day trial is ready");
        setLocation("/onboarding");
      } else {
        await login.mutateAsync({ email, password });
        const customer = await utils.auth.me.fetch();
        if (!customer) throw new Error("Your credentials were accepted, but the session could not be opened. Please try again.");
        toast.success("Welcome back");
        setLocation(next);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not sign you in");
    }
  };

  return <main className="account-shell">
    <section className="account-aside">
      <Link href="/" className="brand-lockup"><span className="brand-mark">৳</span>Invoice<span>Pro</span></Link>
      <div className="account-promise">
        <p className="eyebrow">BUILT FOR YOUR NEXT PAYMENT</p>
        <h1>Keep client money moving—without a complicated system.</h1>
        <p>Make BDT invoices, share a clean link, and know exactly who to follow up with from your phone.</p>
      </div>
      <div className="account-checks"><span><CheckCircle2 size={17} />14-day trial, no card</span><span><CheckCircle2 size={17} />bKash, Nagad, Rocket & bank transfer</span><span><CheckCircle2 size={17} />Clients never need an account</span></div>
    </section>
    <section className="account-panel">
      <Link href="/" className="back-home"><ArrowLeft size={15} /> Back to home</Link>
      <div className="account-form-wrap">
        <p className="eyebrow">{mode === "register" ? "START YOUR TRIAL" : "WELCOME BACK"}</p>
        <h2>{mode === "register" ? "Your next invoice starts here." : "Sign in to your workspace."}</h2>
        <p className="account-description">{mode === "register" ? "Create your customer account in under a minute. No card is needed for the trial." : "Use the email address and password you chose for InvoicePro."}</p>
        <form onSubmit={submit} className="account-form">
          {mode === "register" && <div className="field"><label>Your name</label><input autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Saad Ahmed" required /></div>}
          <div className="field"><label>Email address</label><input autoComplete="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
          <div className="field"><label>Password</label><div className="password-field"><input autoComplete={mode === "register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} minLength={8} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <Button type="submit" className="customer-cta" disabled={pending}>{pending ? "Please wait…" : mode === "register" ? <>Start free trial <ArrowRight size={17} /></> : <>Open workspace <ArrowRight size={17} /></>}</Button>
        </form>
        <p className="account-switch">{mode === "register" ? "Already have an account?" : "New to InvoicePro?"} <button type="button" onClick={() => setMode(mode === "register" ? "login" : "register")}>{mode === "register" ? "Sign in" : "Start your free trial"}</button></p>
        <div className="owner-access"><ShieldCheck size={15} /><span>Platform owner: sign in with your InvoicePro email and password.</span></div>
      </div>
    </section>
  </main>;
}
