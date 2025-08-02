import type { Configuration, PopupRequest } from "@azure/msal-browser";

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "YOUR_CLIENT_ID", // Replace with your Azure AD app client ID
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "YOUR_TENANT_ID"}`, // Replace with your tenant ID or 'common'
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin, // Must be registered as a redirect URI with your application
    postLogoutRedirectUri:
      import.meta.env.VITE_REDIRECT_URI || window.location.origin, // Must be registered as a logout URI with your application
  },
  cache: {
    cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false, // Set this to "true" if you're having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ["User.Read"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
