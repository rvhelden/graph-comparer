import { useMsal } from "@azure/msal-react";
import { useNavigate } from "@tanstack/react-router";
import { loginRequest } from "../authConfig";

export const SignInButton = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogin = () => {
    instance
      .loginPopup(loginRequest)
      .then(() => {
        // Navigate to home page after successful login
        navigate({ to: "/" });
      })
      .catch((e) => {
        console.error("Login failed:", e);
      });
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Sign In with Microsoft
    </button>
  );
};

export const SignOutButton = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: "/login",
      mainWindowRedirectUri: "/login",
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      Sign Out
    </button>
  );
};
