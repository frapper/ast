# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with separate frontend and backend workspaces:

```
ast/
├── frontend/          # React 19 + TypeScript + Vite SPA
├── backend/           # Backend server (TypeScript + Node.js)
├── package.json       # Root workspace configuration
└── CLAUDE.md          # This file
```

## Development Commands

```bash
# Install all dependencies (from root)
npm install

# Start frontend development server with HMR
npm run dev
# or
npm run dev:all        # Start both frontend and backend

# Start only frontend
npm run dev --workspace=frontend

# Start only backend
npm run dev --workspace=backend

# Build all
npm run build

# Build individual workspaces
npm run build:frontend
npm run build:backend

# Run linting
npm run lint
```

## Frontend Architecture

Located in `/frontend` - React 19 + TypeScript + Vite SPA using modern tooling and best practices.

### TypeScript Configuration
- Uses project references with separate configs for app (`tsconfig.app.json`) and build tooling (`tsconfig.node.json`)
- Strict mode enabled with additional checks: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Bundler mode with ES2022 target, ESNext modules
- JSX transform: `react-jsx` (new JSX runtime)

### Build Setup
- **Vite** is the build tool with `@vitejs/plugin-react` plugin
- TypeScript compilation via `tsc -b` runs before Vite bundling
- Uses ES modules (`"type": "module"` in package.json)
- Fast Refresh via Babel/SWC for development

### Linting
- Modern flat ESLint configuration (`eslint.config.js`)
- Includes `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- The `dist` directory is globally ignored

### Source Structure
- `frontend/src/main.tsx` - Application entry point
- `frontend/src/App.tsx` - Main component
- `frontend/src/index.css` - Global styles with CSS custom properties for theming
- `frontend/src/App.css` - Component-specific styles
- `frontend/index.html` - HTML template

## Backend Architecture

Located in `/backend` - TypeScript + Node.js server setup.

### Backend Configuration
- Uses `tsx` for development with hot-reload
- TypeScript compilation to `dist/` for production
- Port defaults to 3001 (configurable via PORT env var)

### Source Structure
- `backend/src/index.ts` - Server entry point

## Notes

- No testing framework is currently configured
- React Compiler is disabled (see README.md for how to enable)
- For production ESLint setup, consider enabling type-aware rules per README.md
