import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// TanStack Router
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

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
const fontColor = '#FFFFFF';
const backgroundColor = '#1B1A19FF';
const secondaryBackgroundColor = '#252423FF';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
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
        </ConfigProvider>
    </StrictMode>
);
