import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import Companies from "@/pages/Companies";
import Clients from "@/pages/Clients";
import Users from "@/pages/Users";
import Performance from "@/pages/Performance";
import Reports from "@/pages/Reports";
import Permissions from "@/pages/Permissions";
import Kanban from "@/pages/Kanban";
import JobClosureReport from "@/pages/JobClosureReport";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={() => <Layout><Dashboard /></Layout>} />
          <Route path="/dashboard" component={() => <Layout><Dashboard /></Layout>} />
          <Route path="/jobs" component={() => <Layout><Jobs /></Layout>} />
          <Route path="/kanban" component={() => <Layout><Kanban /></Layout>} />
          <Route path="/companies" component={() => <Layout><Companies /></Layout>} />
          <Route path="/clients" component={() => <Layout><Clients /></Layout>} />
          <Route path="/users" component={() => <Layout><Users /></Layout>} />
          <Route path="/permissions" component={() => <Layout><Permissions /></Layout>} />
          <Route path="/performance" component={() => <Layout><Performance /></Layout>} />
          <Route path="/reports" component={() => <Layout><Reports /></Layout>} />
          <Route path="/reports/job-closure" component={() => <Layout><JobClosureReport /></Layout>} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
