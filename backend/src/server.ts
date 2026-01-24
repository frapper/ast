import express from 'express'
import cors from 'cors'
import session from 'express-session'
import studentRoutes from './routes/students'
import schoolRoutes from './routes/schools'
import authRoutes from './routes/auth'
import mySchoolsRoutes from './routes/mySchools'
import groupsRoutes from './routes/groups'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'my-schools-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}))

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

// Start server
export function startServer() {
  return app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`)
  })
}

export default app
