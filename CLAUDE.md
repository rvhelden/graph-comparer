# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint with TypeScript-ESLint configuration
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React 19 + TypeScript SPA for Microsoft Graph scope comparison, built with Vite and TanStack Router.

### Core Technology Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with React Compiler (Babel plugin)
- **Routing**: TanStack Router with file-based routing and auto-generated route tree
- **UI Framework**: Ant Design v5 with custom dark theme
- **Styling**: Custom CSS with Ant Design theming (primary color: #326c39, dark backgrounds)

### Application Architecture
- **Layout Structure**: Uses Ant Design Layout with Header (TitleBar), Sider (SideNavigation), and Content areas
- **Router Configuration**: TanStack Router with devtools enabled in development, auto-code splitting enabled
- **Theme System**: Dark theme with custom colors - primary (#326c39), font color (#50AF5BFF), background (#1B1A19FF)

### Data Sources and Processing
The application works with Microsoft Graph permissions data through several JSON files:

- **permissions.json**: Core Microsoft Graph permissions schema from DevX content repository
- **permissions-descriptions.json**: Additional permission descriptions
- **PowerShell Data Pipeline** (`scripts/refresh-permissions.ps1`): Comprehensive script that:
  - Downloads latest DevX permissions JSON files
  - Fetches Microsoft Graph service principal data (app roles, delegated scopes)
  - Builds Kibali tool and runs import to create GraphPermissions.json
  - Generates index-by-scope.json for efficient client-side lookups

### Key Components Structure
- **AppLayout** (`src/components/AppLayout.tsx`): Main layout container with 280px sidebar
- **TitleBar** (`src/components/TitleBar.tsx`): Header with "Debble" branding using Doctor Glitch font
- **SideNavigation** (`src/components/SideNavigation.tsx`): Menu with "Scopes" navigation item

### Build Configuration
- **Vite Config**: Uses TanStack Router plugin with auto-code splitting and React Compiler via Babel
- **TypeScript Config**: Strict mode enabled with modern ES2022 target, bundler module resolution
- **ESLint Config**: TypeScript-ESLint with React hooks and refresh plugins, modern flat config format

### File-Based Routing
Uses TanStack Router with:
- Auto-generated route tree (`src/routeTree.gen.ts`) 
- Route files in `src/routes/` directory
- Router devtools available in development

### Data Processing Pipeline
The PowerShell script (`scripts/refresh-permissions.ps1`) creates a complete data pipeline:
1. Downloads official Microsoft Graph DevX permissions data
2. Optionally fetches live service principal data via Graph API
3. Uses Kibali tool to process and validate permissions
4. Creates optimized index files for client-side consumption
5. Supports automated git commits for data updates

This application appears to be designed for comparing and analyzing Microsoft Graph API scopes/permissions, likely for developers working with Graph integrations.