# Environment Configuration

This document explains how to configure environment variables for the AST application.

## Overview

The application uses environment variables to manage configuration across different environments (development and production). This allows you to switch between HTTP (local development) and HTTPS (production) for API URLs.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. For local development, the `.env.development` files will be used automatically when running `npm run dev`.

3. For production builds, the `.env.production` files will be used when running `npm run build`.

## Environment Files

### Root Directory
- **`.env.example`** - Template file (committed to git) showing all available environment variables
- **`.env`** - Local overrides for all workspaces (gitignored)

### Frontend (`/frontend`)
- **`.env.development`** - Development environment configuration (HTTP)
- **`.env.production`** - Production environment configuration (HTTPS)
- **`.env.local`** - Local overrides that take precedence (gitignored)

### Backend (`/backend`)
- **`.env.development`** - Development environment configuration
- **`.env.production`** - Production environment configuration
- **`.env.local`** - Local overrides that take precedence (gitignored)

## How Vite Loads Environment Files

Vite automatically loads environment files in this order (later files override earlier ones):

1. `.env` - Always loaded
2. `.env.local` - Always loaded, ignored by git
3. `.env.[mode]` - e.g., `.env.development`, `.env.production`
4. `.env.[mode].local` - Mode-specific local overrides, ignored by git

**When running:**
- `npm run dev` → loads `.env.development`
- `npm run build` → loads `.env.production`
- `npm run preview` → loads `.env.production`

## Available Environment Variables

### Frontend Variables

Note: Frontend variables **must** use the `VITE_` prefix for Vite to expose them to the browser.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001` |

### Backend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SESSION_SECRET` | Session encryption secret | *(see below)* |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |

## Development Setup

For local development, the application is configured to use HTTP:

**Frontend (`.env.development`)**:
```bash
VITE_API_URL=http://localhost:3001
```

**Backend (`.env.development`)**:
```bash
PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
LOG_LEVEL=debug
```

## Production Deployment

### Security Requirements

The backend validates environment variables on startup and will **refuse to start** in production mode if:
- `SESSION_SECRET` is not set
- `SESSION_SECRET` uses one of the default/insecure values

### Generating a Secure Session Secret

Generate a secure random string for production:

```bash
openssl rand -base64 32
```

### Production Configuration

**Frontend (`.env.production`)**:
```bash
VITE_API_URL=https://api.your-domain.com
```

**Backend (`.env.production`)**:
```bash
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
SESSION_SECRET=<your-generated-secret-here>
NODE_ENV=production
LOG_LEVEL=info
```

### Important Notes

1. **Never commit** `.env.production`, `.env.local`, or `.env.*.local` files to git
2. **Always use HTTPS** for `VITE_API_URL` in production
3. **Set a secure `SESSION_SECRET`** in production
4. **Configure CORS properly** - `FRONTEND_URL` must match your production frontend domain

## Environment-Specific Behavior

### Development Mode
- Uses HTTP for local development
- Detailed logging (`LOG_LEVEL=debug`)
- Insecure session secrets allowed
- CORS allows localhost

### Production Mode
- Expects HTTPS URLs
- Standard logging (`LOG_LEVEL=info`)
- Requires secure session secret
- Cookies set with `secure: true`
- CORS restricted to production domain

## Troubleshooting

### "SESSION_SECRET must be set to a secure random string"

You're running in production mode with an insecure session secret:
1. Generate a secure secret: `openssl rand -base64 32`
2. Set it in your production environment or `.env.production` file
3. Restart the server

### CORS errors in production

Ensure `FRONTEND_URL` in backend `.env.production` matches your actual frontend domain (including protocol: `https://`).

### Environment variables not loading

1. Ensure variables are named correctly (frontend vars must have `VITE_` prefix)
2. Check that `.env` files are in the correct directory
3. Restart the dev server after adding/changing environment files
4. Build the frontend again after changing production variables: `npm run build`

## File Structure

```
ast/
├── .env.example              # Template (committed to git)
├── .env                      # Local overrides (gitignored)
├── docs/
│   └── ENVIRONMENT.md        # This file
├── frontend/
│   ├── .env.development      # Dev config (committed)
│   ├── .env.production       # Prod config (committed, requires updates)
│   └── .env.local            # Local overrides (gitignored)
└── backend/
    ├── .env.development      # Dev config (committed)
    ├── .env.production       # Prod config (committed, requires updates)
    └── .env.local            # Local overrides (gitignored)
```
