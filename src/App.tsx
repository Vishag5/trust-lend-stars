import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateContract from "./pages/CreateContract";
import ContractDetail from "./pages/ContractDetail";
import Profile from "./pages/Profile";
import Contracts from "./pages/Contracts";
import UserProfile from "./pages/UserProfile";
import LenderProfile from "./pages/LenderProfile";
import BorrowerProfile from "./pages/BorrowerProfile";
import DebugData from "./pages/DebugData";
import SearchProfiles from "./pages/SearchProfiles";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import { AuthCallback } from "./components/auth/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-contract" element={<CreateContract />} />
          <Route path="/contract/:id" element={<ContractDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/lender/:id" element={<LenderProfile />} />
          <Route path="/borrower/:id" element={<BorrowerProfile />} />
          <Route path="/debug" element={<DebugData />} />
          <Route path="/search" element={<SearchProfiles />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
