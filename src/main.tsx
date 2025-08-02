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
import { ConfigProvider, theme } from "antd";
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
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "rgb(50, 108, 57)",
            colorBgBase: "rgb(27, 26, 25)",
            colorBgContainer: "rgb(37, 36, 35)",
            colorText: "rgb(243, 242, 243)",
            colorTextSecondary: "hsl(127, 37%, 50%)",
            borderRadius: 2,
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </MsalProvider>
  </StrictMode>
);
