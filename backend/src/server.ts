import express from 'express'
import session from 'express-session'
import studentRoutes from './routes/students.js'
import schoolRoutes from './routes/schools.js'
import authRoutes from './routes/auth.js'
import mySchoolsRoutes from './routes/mySchools.js'
import groupsRoutes from './routes/groups.js'

// Environment validation
function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production'

  // Check for insecure session secret in production
  if (isProduction) {
    const sessionSecret = process.env.SESSION_SECRET || ''
    const insecureSecrets = [
      'my-schools-secret-key-change-in-production',
      'dev-secret-key-change-in-production',
      'change-this-in-production',
      'change-this-in-production-use-a-secure-random-string'
    ]

    if (!sessionSecret || insecureSecrets.includes(sessionSecret)) {
      throw new Error(
        'SESSION_SECRET must be set to a secure random string in production. ' +
        'Generate one with: openssl rand -base64 32'
      )
    }
  }

  // Log environment configuration
  console.log('='.repeat(50))
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`PORT: ${process.env.PORT || 3001}`)
  console.log(`FRONTEND_URL (CORS): ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET ? '***SET***' : 'NOT SET'}`)
  console.log('='.repeat(50))
}

validateEnv()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}

// Log CORS configuration for debugging
console.log(`CORS configured for origin: ${corsOptions.origin}`)

// Request logging middleware (before CORS to see original requests)
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  console.log(`  Headers:`, {
    origin: req.headers.origin,
    host: req.headers.host,
    referer: req.headers.referer,
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-forwarded-host': req.headers['x-forwarded-host'],
    'x-forwarded-proto': req.headers['x-forwarded-proto']
  })
  next()
}, (err: Error, _req: unknown, _res: unknown, next: (err?: Error) => void) => {
  console.error('Logging middleware error:', err)
  next()
})

// Custom CORS middleware with detailed logging
app.use((req, res, next) => {
  const origin = req.headers.origin

  // Log preflight requests
  if (req.method === 'OPTIONS') {
    console.log('PREFLIGHT REQUEST')
    console.log(`  Origin: ${origin}`)
    console.log(`  Configured CORS origin: ${corsOptions.origin}`)
    console.log(`  Match: ${origin === corsOptions.origin}`)
  }

  // Set CORS headers
  try {
    if (origin === corsOptions.origin) {
      res.header('Access-Control-Allow-Origin', origin)
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.header('Access-Control-Allow-Credentials', 'true')

      if (req.method === 'OPTIONS') {
        res.sendStatus(200)
        return
      }
    } else if (origin) {
      console.log(`WARNING: Origin mismatch! Expected: ${corsOptions.origin}, Got: ${origin}`)
    }
    next()
  } catch (error) {
    console.error('CORS middleware error:', error)
    next(error)
  }
})

app.use(express.json())

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'my-schools-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-origin cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}))

// Session debug middleware (must be after session configuration)
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api/') && req.method !== 'OPTIONS') {
    console.log(`[SESSION DEBUG] ${req.method} ${req.path}`, {
      hasSession: !!req.session,
      sessionId: req.sessionID,
      hasUser: !!req.session?.user,
      userId: req.session?.user?.user_id,
      origin: req.headers.origin,
      cookieHeader: req.headers.cookie ? 'present' : 'missing'
    })
  }
  next()
})

// Routes
app.use('/api/students', studentRoutes)
app.use('/api/schools', schoolRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/my-schools', mySchoolsRoutes)
app.use('/api/groups', groupsRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' })
})

// Global error handler - ensures CORS headers are present on all error responses
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const origin = req.headers.origin

  // Add CORS headers to error responses
  if (origin === corsOptions.origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
  }

  console.error('Error:', err)

  // Handle multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the size limit'
    })
  }

  // Handle multer file type errors
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid file upload',
      message: err.message || 'Unexpected file field'
    })
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
})

// Start server
export function startServer() {
  return app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`)
  })
}

export default app
