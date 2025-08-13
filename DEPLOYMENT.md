# GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Automatic Deployment

The site will automatically deploy to GitHub Pages when you push to the `main` branch. The deployment workflow:

1. **Triggers**: Runs on every push to `main` branch or manual workflow dispatch
2. **Build Process**: Installs dependencies, builds the React app, and prepares artifacts
3. **Deploy**: Uploads the built files to GitHub Pages

## Setting Up GitHub Pages

To enable GitHub Pages deployment:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The deployment will automatically start on the next push to `main`

## Site URL

Once deployed, your site will be available at:
```
https://rvhelden.github.io/graph-comparer/
```

## Manual Deployment (Alternative)

You can also deploy manually using the gh-pages package:

```bash
# Install dependencies
npm install

# Build and deploy
npm run deploy
```

This will build the project and push the `dist` folder to the `gh-pages` branch.

## Configuration Details

### Vite Configuration
- **Base URL**: Set to `/graph-comparer/` for production
- **Output Directory**: `dist`
- **Chunk Splitting**: Vendor, Antd, and Router chunks for better caching

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Node Version**: 18
- **Build Command**: `npm run build`
- **Deploy Target**: `./dist` directory

## Troubleshooting

1. **Routing Issues**: The app uses client-side routing. GitHub Pages serves files correctly with the current configuration.

2. **Asset Loading**: All assets are configured with the correct base path for GitHub Pages.

3. **Build Failures**: Check the Actions tab in your GitHub repository for detailed error logs.

4. **Permissions**: Make sure the repository has the correct permissions set for GitHub Pages deployment.