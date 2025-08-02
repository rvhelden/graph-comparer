import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from "./AuthButtons";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">
          You need to sign in to access this content.
        </p>
        <SignInButton />
      </div>
    );
  }

  return <>{children}</>;
};
