import {
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AppLayout } from "../components/AppLayout";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  
  // Always attempt authentication if not authenticated
  useAuthRedirect();

  // Show loading spinner while MSAL is initializing or authentication is in progress
  if (inProgress !== "none" || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  // Only show the app content if user is authenticated
  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <TanStackRouterDevtools />
    </>
  );
}
