import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { SignInButton, SignOutButton } from "./AuthButtons";

export const AuthenticationStatus = () => {
  const { accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {accounts[0]?.name || accounts[0]?.username}!
        </span>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton />;
};
