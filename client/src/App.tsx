import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import FollowUps from "./pages/FollowUps";
import Home from "./pages/Home";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceEditor from "./pages/InvoiceEditor";
import Invoices from "./pages/Invoices";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import PublicInvoice from "./pages/PublicInvoice";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Subscription from "./pages/Subscription";
import Pricing from "./pages/Pricing";

function Workspace({ children }: { children: React.ReactNode }) { return <DashboardLayout>{children}</DashboardLayout>; }
function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/sign-in" component={Auth} />
    <Route path="/pricing" component={Pricing} />
    <Route path="/onboarding" component={Onboarding} />
    <Route path="/share/:token" component={PublicInvoice} />
    <Route path="/dashboard">{() => <Workspace><Dashboard /></Workspace>}</Route>
    <Route path="/invoices/new">{() => <Workspace><InvoiceEditor /></Workspace>}</Route>
    <Route path="/invoices/:id/edit">{() => <Workspace><InvoiceEditor /></Workspace>}</Route>
    <Route path="/invoices/:id">{() => <Workspace><InvoiceDetail /></Workspace>}</Route>
    <Route path="/invoices">{() => <Workspace><Invoices /></Workspace>}</Route>
    <Route path="/clients">{() => <Workspace><Clients /></Workspace>}</Route>
    <Route path="/follow-ups">{() => <Workspace><FollowUps /></Workspace>}</Route>
    <Route path="/profile">{() => <Workspace><Profile /></Workspace>}</Route>
    <Route path="/subscription">{() => <Workspace><Subscription /></Workspace>}</Route>
    <Route path="/admin">{() => <Workspace><Admin /></Workspace>}</Route>
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-center" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
