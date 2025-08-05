import { useEffect, useRef } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

export const useAuthRedirect = () => {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();
  const loginAttempted = useRef(false);

  useEffect(() => {
    // Wait for MSAL to finish initializing and any ongoing operations
    if (inProgress === "none" && !isAuthenticated && !loginAttempted.current) {
      // Check if there are any accounts in cache first
      const accounts = instance.getAllAccounts();

      if (accounts.length > 0) {
        // There's a cached account, MSAL should handle this automatically
        console.log(
          "Found cached account, waiting for automatic authentication"
        );
        return;
      }

      // No cached accounts, attempt login
      loginAttempted.current = true;

      instance
        .loginRedirect(loginRequest)
        .then(() => {
          console.log("Authentication successful");
        })
        .catch((e) => {
          console.error("Login failed:", e);
          // Reset the flag if login fails so user can try again
          loginAttempted.current = false;
        });
    }
  }, [isAuthenticated, instance, inProgress]);
};
