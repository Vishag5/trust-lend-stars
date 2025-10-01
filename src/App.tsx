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
import SearchProfiles from "./pages/SearchProfiles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-contract" element={<CreateContract />} />
          <Route path="/contract/:id" element={<ContractDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/search" element={<SearchProfiles />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
