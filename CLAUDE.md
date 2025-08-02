# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Debble Portal is a React-based single-page application with Microsoft Azure AD authentication. It uses modern React 19, TypeScript, TanStack Router for routing, and Azure MSAL for authentication. The application provides a secure portal interface with user authentication and profile management.

## Development Commands

- `npm run dev` - Start development server with Vite (http://localhost:5173)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Architecture Overview

### Core Stack
- **React 19** with TypeScript and React Compiler (babel-plugin-react-compiler)
- **TanStack Router** for file-based routing with automatic route tree generation
- **Azure MSAL** (@azure/msal-browser, @azure/msal-react) for Microsoft/Azure AD authentication
- **Ant Design** for UI components with dark theme configuration
- **Vite** for development and building with React plugin and TanStack Router plugin

### Authentication Flow
The application implements a comprehensive authentication system:
- **MsalProvider** wraps the entire application in src/main.tsx
- **useAuthRedirect** hook handles automatic redirects based on authentication state
- **ProtectedLayout** component redirects unauthenticated users to /login
- **ProtectedRoute** component shows auth prompt inline instead of redirecting
- Authentication state is managed via Azure MSAL with session storage caching

### Routing Structure
- **File-based routing** with TanStack Router
- **Route tree auto-generation** via @tanstack/router-plugin
- Routes: `/` (home), `/about`, `/login`
- **Conditional layout rendering** in __root.tsx based on current path
- Login page gets minimal layout, authenticated pages get full navigation

### Configuration Requirements
The application requires Azure AD environment variables:
- `VITE_AZURE_CLIENT_ID` - Azure AD application client ID
- `VITE_AZURE_TENANT_ID` - Azure AD tenant ID  
- `VITE_REDIRECT_URI` - Optional, defaults to window.location.origin

### Key Components
- **useAuthRedirect** (src/hooks/useAuthRedirect.ts:5) - Handles automatic navigation based on auth state

### Styling
- **Ant Design** theming with dark algorithm and custom primary color (rgb(50, 108, 57))
- **Gradient designs** for visual appeal in login and user interface elements

## Development Notes

### Route Generation
- Routes are auto-generated in src/routeTree.gen.ts by TanStack Router plugin
- Do not manually edit the route tree file
- Add new routes by creating files in src/routes/ directory

### Authentication Patterns
- Use `useIsAuthenticated()` to check auth state
- Use `useMsal()` to access accounts and MSAL instance

### Microsoft Graph Integration
- GraphQL endpoint configured for User.Read scope
- User profile data accessible via MSAL accounts array
- Profile information displayed in UserProfile component

### Build Process
- TypeScript compilation happens before Vite build
- React Compiler plugin is enabled for optimization
- Auto code splitting enabled via TanStack Router plugin