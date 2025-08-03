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

const primary = "#326c39";
const backgroundColor = "#141414";
const secondaryBackgroundColor = "#1d1c1c";

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <ConfigProvider
        theme={{
          hashed: false,
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: primary,
            colorBgBase: backgroundColor,
          },
          components: {
            Layout: {
              headerBg: secondaryBackgroundColor,
              siderBg: secondaryBackgroundColor,
            },
            Menu: {
              darkItemSelectedBg: "rgba(50, 108, 57, 0.4)",
              darkSubMenuItemBg: secondaryBackgroundColor,
              darkItemBg: secondaryBackgroundColor,
              itemHoverBg: secondaryBackgroundColor,
            },
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </MsalProvider>
  </StrictMode>
);
