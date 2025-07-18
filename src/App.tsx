
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PermissionsProvider, usePermissions } from "@/contexts/PermissionsContext";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Leaves from "./pages/Leaves";
import Documents from "./pages/Documents";
import Compliance from "./pages/Compliance";
import ComplianceType from "./pages/ComplianceType";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import JobApplication from "./pages/JobApplication";
import Applications from "./pages/Applications";

// Protected Route component with permission checking
function ProtectedRoute({ children, requiredPage }: { children: React.ReactNode; requiredPage?: string }) {
  const { user, loading: authLoading } = useAuth();
  const { hasPageAccess, loading: permissionsLoading } = usePermissions();
  
  if (authLoading || permissionsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredPage && !hasPageAccess(requiredPage)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// App content with permissions
function AppContent() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      {/* Public job application portal */}
      <Route path="/" element={<JobApplication />} />
      
      {/* Protected admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/admin/applications" element={
        <ProtectedRoute requiredPage="/applications">
          <Applications />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees" element={
        <ProtectedRoute requiredPage="/employees">
          <Employees />
        </ProtectedRoute>
      } />
      <Route path="/admin/leaves" element={
        <ProtectedRoute requiredPage="/leaves">
          <Leaves />
        </ProtectedRoute>
      } />
      <Route path="/admin/documents" element={
        <ProtectedRoute requiredPage="/documents">
          <Documents />
        </ProtectedRoute>
      } />
      <Route path="/admin/compliance" element={
        <ProtectedRoute requiredPage="/compliance">
          <Compliance />
        </ProtectedRoute>
      } />
      <Route path="/admin/compliance/:id" element={
        <ProtectedRoute requiredPage="/compliance">
          <ComplianceType />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute requiredPage="/reports">
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute requiredPage="/settings">
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/admin/user-management" element={
        <ProtectedRoute requiredPage="/user-management">
          <UserManagement />
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PermissionsProvider>
        <CompanyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </CompanyProvider>
      </PermissionsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
