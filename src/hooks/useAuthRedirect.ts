import { useEffect } from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export const useAuthRedirect = () => {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  useEffect(() => {
    // If user is authenticated and on login page, redirect to home
    if (isAuthenticated && currentPath === "/login") {
      navigate({ to: "/" });
    }
    // If user is not authenticated and not on login page, redirect to login
    else if (!isAuthenticated && currentPath !== "/login") {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, currentPath, navigate]);
};
