# Math Practice App

A lightweight app for practicing math problems.

> **Project status:** This repository is currently a starter scaffold. Add the application source files first (for example, a React/Vite app) and then use the setup/deployment flow below.

## 1) Install and run locally

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm (comes with Node.js)

### Setup
```bash
git clone <your-repo-url>
cd math-practice-app
npm install
```

### Start development server
```bash
npm run dev
```

Then open the local URL printed by Vite (typically `http://localhost:5173`).

### Build for production
```bash
npm run build
```

### Preview production build locally
```bash
npm run preview
```

## 2) Environment variables

If your app needs runtime configuration, create a `.env` file in the repository root.

Example:
```env
VITE_API_BASE_URL=https://api.example.com
```

> For Vite projects, only variables prefixed with `VITE_` are exposed to browser code.

## 3) Deployment options

## Option A: Vercel (quickest for frontend apps)
1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Set:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add environment variables (if needed) in Vercel Project Settings.
5. Deploy.

## Option B: Netlify
1. Connect your repository in Netlify.
2. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add environment variables in Site Settings.
4. Deploy.

## Option C: Docker + any container host
Create a `Dockerfile` and deploy to Render, Fly.io, Railway, ECS, etc.

Example production Docker strategy for static Vite output:
- Build with Node in a builder stage.
- Serve `dist/` using Nginx in a runtime stage.

## 4) Recommended npm scripts

Ensure your `package.json` includes:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

If you want, I can also add a deployment-specific `Dockerfile`, `vercel.json`, or Netlify config (`netlify.toml`) directly in this repo.
