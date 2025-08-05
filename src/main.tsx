import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// MSAL
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';

// TanStack Router
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// TanStack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// AntD
import { ConfigProvider, theme } from 'antd';
import '@ant-design/v5-patch-for-react-19';

import './index.css';

const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const primary = '#326c39';
const fontColor = '#50AF5BFF';
const backgroundColor = '#141414';
const secondaryBackgroundColor = '#1d1c1c';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Create Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 3,
            refetchOnWindowFocus: false
        }
    }
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MsalProvider instance={msalInstance}>
            <QueryClientProvider client={queryClient}>
                <ConfigProvider
                    theme={{
                        algorithm: theme.darkAlgorithm,
                        token: {
                            colorPrimary: primary,
                            colorBgBase: backgroundColor
                        },
                        components: {
                            Tabs: {
                                itemSelectedColor: fontColor
                            },
                            Anchor: {
                                colorText: fontColor
                            },
                            Layout: {
                                headerBg: secondaryBackgroundColor,
                                siderBg: secondaryBackgroundColor
                            },
                            Menu: {
                                darkItemSelectedBg: 'rgba(50, 108, 57, 0.4)',
                                darkSubMenuItemBg: secondaryBackgroundColor,
                                darkItemBg: secondaryBackgroundColor,
                                itemHoverBg: secondaryBackgroundColor
                            },
                            Typography: {
                                colorText: fontColor
                            }
                        }
                    }}
                >
                    <RouterProvider router={router} />
                    <ReactQueryDevtools initialIsOpen={false} />
                </ConfigProvider>
            </QueryClientProvider>
        </MsalProvider>
    </StrictMode>
);
