import express from 'express'
import cors from 'cors'
import studentRoutes from './routes/students'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}))
app.use(express.json())

// Routes
app.use('/api/students', studentRoutes)

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
