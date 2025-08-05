# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint with TypeScript-ESLint configuration
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React 19 + TypeScript SPA with Azure AD authentication, built with Vite and TanStack Router.

### Core Architecture Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with React Compiler (Babel plugin)
- **Authentication**: Microsoft Authentication Library (MSAL) with Azure AD integration
- **Routing**: TanStack Router with file-based routing and auto-generated route tree
- **Data Fetching**: TanStack Query (React Query) with caching and background updates
- **Table Management**: TanStack Table for advanced table functionality
- **Schema Validation**: Zod for runtime type validation and schema parsing
- **UI Framework**: Ant Design v5 with dark theme customization
- **Styling**: Custom CSS with Ant Design theming (colors: primary #326c39, dark backgrounds)

### Authentication Flow
The application enforces authentication across all routes through a centralized system:

1. **Root Route Guard** (`src/routes/__root.tsx`): All routes require authentication before rendering content
2. **Auto-Authentication Hook** (`src/hooks/useAuthRedirect.ts`): Automatically attempts login popup when user is not authenticated
3. **MSAL Configuration** (`src/authConfig.ts`): Centralized Azure AD configuration with environment variable support
4. **Session Management**: Uses localStorage for token persistence across tabs/refreshes

### Key Components Structure
- **AppLayout** (`src/components/AppLayout.tsx`): Main layout with header (TitleBar), sidebar (SideNavigation), and content area
- **Authentication Components**: LoadingSpinner shown during MSAL initialization and auth processes
- **Route Protection**: All routes inherit authentication requirement from root route

### Environment Configuration
Requires Azure AD app registration with these environment variables:
- `VITE_AZURE_CLIENT_ID` - Azure AD application client ID
- `VITE_AZURE_TENANT_ID` - Azure AD tenant ID  
- `VITE_REDIRECT_URI` - Redirect URI (optional, defaults to window.location.origin)

### File-Based Routing
Uses TanStack Router with:
- Auto-generated route tree (`src/routeTree.gen.ts`)
- Route files in `src/routes/` directory
- Root route enforces authentication globally
- Router devtools enabled in development

### Development Setup Requirements
1. Install dependencies with `npm install`
2. Configure Azure AD app registration (see README.md for detailed steps)
3. Set up environment variables for Azure AD configuration and OData endpoint
4. Start development server with `npm run dev`

### Data Management & Validation
- **TanStack Query**: Centralized data fetching with automatic caching, background refetch, and error handling
- **Custom Hooks** (`src/hooks/useCustomers.ts`): Abstracted data fetching logic with React Query integration
- **Zod Schemas** (`src/schemas/customerSchemas.ts`): Runtime validation for all API responses and data types
- **Query Devtools**: React Query DevTools available in development for debugging

### OData Integration
The application integrates with a .NET OData API for customer data:
- **Service Layer** (`src/services/odataService.ts`): Handles authentication, OData queries, and Zod validation
- **Customer Schema**: Matches C# Customer domain model with Zod validation for runtime type safety
- **Features Supported**: Workplace, TeamsGovernance, KnowledgeBase, CWP, and TopDesk features
- **Query Capabilities**: Supports OData `$skip`, `$top`, `$orderby`, `$filter`, and `$count` operations
- **Authentication**: Uses MSAL access tokens with scope `api://1db0c7a7-38e1-48ef-98c8-95be5adab33b/access_as_user`

### Table Implementation
- **TanStack Table**: Server-side pagination, sorting, and filtering with manual control
- **Performance**: Efficient rendering with virtual scrolling capabilities
- **Features**: Column sorting, global search, pagination controls, and loading states
- **Responsive**: Horizontal scrolling on smaller screens with fixed column widths

### Environment Variables
Required environment variables (see `.env.example`):
- `VITE_AZURE_CLIENT_ID` - Azure AD application client ID
- `VITE_AZURE_TENANT_ID` - Azure AD tenant ID  
- `VITE_REDIRECT_URI` - Redirect URI (optional, defaults to window.location.origin)
- `VITE_ODATA_BASE_URL` - OData API base URL (defaults to https://localhost:7253 for development)