import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth-ultra-simple";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to appropriate page based on auth status
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}
