import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// MSAL
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

// TanStack Router
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// AntD
import { ConfigProvider } from "antd";
import "@ant-design/v5-patch-for-react-19";

import "./index.css";

const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: "#00b96b",
            borderRadius: 2,

            // Alias Token
            colorBgContainer: "#f6ffed",
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </MsalProvider>
  </StrictMode>
);
