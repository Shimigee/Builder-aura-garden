import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth-supabase";
import { LotsProvider } from "@/hooks/use-lots-supabase";
import { PermitsProvider } from "@/hooks/use-permits-supabase";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PermitDetail from "./pages/PermitDetail";
import UserManagement from "./pages/UserManagement";
import LotManagement from "./pages/LotManagement";
import Scanner from "./pages/Scanner";
import Emergency from "./pages/Emergency";
import TestDashboard from "./pages/TestDashboard";
import DashboardNoAuth from "./pages/DashboardNoAuth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        {/* Emergency route - completely bypasses all auth */}
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/test-dashboard" element={<TestDashboard />} />
        {/* Real dashboard without auth - for testing */}
        <Route
          path="/dashboard-no-auth"
          element={
            <LotsProvider>
              <PermitsProvider>
                <TooltipProvider>
                  <DashboardNoAuth />
                </TooltipProvider>
              </PermitsProvider>
            </LotsProvider>
          }
        />

        {/* All other routes wrapped in auth */}
        <Route
          path="/*"
          element={
            <AuthProvider>
              <LotsProvider>
                <PermitsProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route
                        path="/permit/:permitId"
                        element={<PermitDetail />}
                      />
                      <Route
                        path="/user-management"
                        element={<UserManagement />}
                      />
                      <Route
                        path="/lot-management"
                        element={<LotManagement />}
                      />
                      <Route path="/scanner" element={<Scanner />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                </PermitsProvider>
              </LotsProvider>
            </AuthProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
