# Debble Portal

A React application with Microsoft Authentication Library (MSAL) integration for Azure AD authentication.

## Features

- React 19 with TypeScript
- Vite for development and building
- TanStack Router for routing
- Microsoft Authentication Library (MSAL) for Azure AD authentication
- Tailwind CSS for styling (classes used in components)

## Azure AD Setup

1. **Register your application in Azure AD:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to Azure Active Directory > App registrations
   - Click "New registration"
   - Enter a name for your application
   - Select "Single-page application (SPA)" as the platform
   - Add your redirect URI (e.g., `http://localhost:5173` for development)

2. **Configure your application:**
   - Copy the Application (client) ID
   - Copy the Directory (tenant) ID
   - Under "Authentication", ensure your redirect URIs are configured
   - Under "API permissions", ensure you have the necessary permissions (User.Read is included by default)

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Replace the placeholder values with your actual Azure AD configuration:
     ```
     VITE_AZURE_CLIENT_ID=your-client-id-here
     VITE_AZURE_TENANT_ID=your-tenant-id-here
     ```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables (see Azure AD Setup above)

3. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication Features

- **Sign In/Sign Out**: Users can authenticate using their Microsoft/Azure AD accounts
- **User Profile**: Display user information from Microsoft Graph API
- **Protected Routes**: Components that require authentication
- **Session Management**: Automatic token refresh and session handling

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
