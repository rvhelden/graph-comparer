import { useIsAuthenticated } from "@azure/msal-react";
import { Navigate } from "@tanstack/react-router";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
