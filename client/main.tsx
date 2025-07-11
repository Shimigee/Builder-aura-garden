import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth-real";
import { LotsProvider } from "@/hooks/use-lots-supabase";
import { PermitsProvider } from "@/hooks/use-permits-supabase";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PermitDetail from "./pages/PermitDetail";
import UserManagement from "./pages/UserManagement";
import LotManagement from "./pages/LotManagement";
import Scanner from "./pages/Scanner";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LotsProvider>
        <PermitsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/permit/:permitId" element={<PermitDetail />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/lot-management" element={<LotManagement />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PermitsProvider>
      </LotsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
