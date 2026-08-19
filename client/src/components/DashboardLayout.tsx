import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  BellRing,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";

const baseItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: FileText, label: "Invoices", path: "/invoices" },
  { icon: UsersRound, label: "Clients", path: "/clients" },
  { icon: BellRing, label: "Follow-ups", path: "/follow-ups" },
  { icon: CircleUserRound, label: "Business profile", path: "/profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  if (loading) return <div className="page-loading"><div className="loading-orb" /><span>Opening your workspace</span></div>;
  if (!user) {
    return (
      <main className="auth-gate">
        <div className="auth-card">
          <span className="brand-mark">৳</span>
          <p className="eyebrow">InvoicePro workspace</p>
          <h1>Keep every payment moving.</h1>
          <p>Sign in to create invoices, follow up with clients, and see your BDT cash flow.</p>
          <Button onClick={() => startLogin()} className="w-full">Sign in to InvoicePro</Button>
        </div>
      </main>
    );
  }

  const items = user.role === "admin"
    ? [...baseItems, { icon: ShieldCheck, label: "Owner admin", path: "/admin" }]
    : baseItems;
  const activeItem = items.find(item => location === item.path || (item.path === "/invoices" && location.startsWith("/invoices")));

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar collapsible="icon" className="border-0 bg-ink text-white">
        <SidebarHeader className="h-[84px] px-4 flex justify-center">
          <button className="brand-lockup" onClick={() => setLocation("/dashboard")} aria-label="InvoicePro dashboard">
            <span className="brand-mark">৳</span>
            <span className="group-data-[collapsible=icon]:hidden">Invoice<span>Pro</span></span>
          </button>
        </SidebarHeader>
        <SidebarContent className="px-3 pt-3">
          <p className="sidebar-kicker group-data-[collapsible=icon]:hidden">WORKSPACE</p>
          <SidebarMenu className="gap-1">
            {items.map(item => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={activeItem?.path === item.path}
                  onClick={() => setLocation(item.path)}
                  tooltip={item.label}
                  className="sidebar-link h-11 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white data-[active=true]:bg-white data-[active=true]:text-ink"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <div className="sidebar-profile group-data-[collapsible=icon]:justify-center">
            <span className="avatar-initial">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate">{user.name || "InvoicePro user"}</p>
              <span className="truncate">{user.email || "Signed in"}</span>
            </div>
            <button className="group-data-[collapsible=icon]:hidden" onClick={logout} aria-label="Sign out"><LogOut size={16} /></button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0 bg-canvas">
        <header className="mobile-topbar">
          <SidebarTrigger className="h-10 w-10 rounded-xl border border-slate-200 bg-white" />
          <div><p className="eyebrow">INVOICEPRO</p><h2>{activeItem?.label || "Workspace"}</h2></div>
          <button className="mini-avatar" onClick={() => setLocation("/profile")}>{(user.name || "U").slice(0, 1).toUpperCase()}</button>
        </header>
        <main className="workspace-main">{children}</main>
        <nav className="mobile-bottom-nav" aria-label="Primary navigation">
          {items.slice(0, 4).map(item => (
            <button key={item.path} onClick={() => setLocation(item.path)} className={activeItem?.path === item.path ? "active" : ""}>
              <item.icon size={19} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}
