import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AuthenticationStatus } from "../components/AuthenticationStatus";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useAuthRedirect();

  const router = useRouterState();
  const currentPath = router.location.pathname;

  // If on login page, show minimal layout
  if (currentPath === "/login") {
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools />
      </>
    );
  }

  // If not authenticated and not on login page, redirect will be handled by ProtectedLayout
  // For authenticated users or protected routes, show full layout
  return (
    <>
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex gap-4">
            <Link
              to="/"
              className="[&.active]:font-bold text-blue-600 hover:text-blue-800"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="[&.active]:font-bold text-blue-600 hover:text-blue-800"
            >
              About
            </Link>
          </div>
          <AuthenticationStatus />
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  );
}
