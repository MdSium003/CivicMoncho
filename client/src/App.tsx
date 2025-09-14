import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Events from "@/pages/Events";
import Threads from "@/pages/Threads";
import Login from "@/pages/Login"; // Import Login page
import Register from "@/pages/Register"; // Import Register page
import Info from "@/pages/Info";
import CreateProject from "./pages/CreateProject"; // Import the new page
import CreateEvent from "./pages/CreateEvent";
import Service from "./pages/ServiceLocator";
import profile from "./pages/MyProfile";
import AccountApproval from "./pages/AccountApproval";
import NotFound from "@/pages/not-found";
import PendingEvents from "@/pages/PendingEvents";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      <Route path="/events" component={Events} />
      <Route path="/threads" component={Threads} />
      <Route path="/login" component={Login} /> {/* Add Login route */}
      <Route path="/register" component={Register} /> {/* Add Register route */}
      <Route path="/info" component={Info} /> {/* Add Info route */}
      <Route path="/projects/create" component={CreateProject} /> {/* Add new route */}
      <Route path="/events/create" component={CreateEvent} /> {/* Add new route */}
      <Route path="/events/pending" component={PendingEvents} /> {/* Add new route */}
      <Route path="/service-locator" component={Service} /> {/* Add new route */}
      <Route path="/myprofile" component={profile} /> {/* Add new route */}
      <Route path="/account-approval" component={AccountApproval} /> {/* Add new route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <Router />
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;

