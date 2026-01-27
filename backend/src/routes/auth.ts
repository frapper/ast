import { Router, Request, Response } from 'express'
import { getOrCreateUserByEmail } from '../userDb.js'
import { generateToken } from '../utils/jwt.js'
import { requireAuth } from '../middleware/jwtAuth.js'
import { apiLogger } from '../logger.js'

const router = Router()

/**
 * Login endpoint
 * Creates or retrieves user based on email or username
 * Returns a JWT token
 */
router.post('/login', (req: Request, res: Response) => {
  // Accept both 'email' and 'username' for backward compatibility
  const { email, username } = req.body
  const emailOrUsername = email || username

  apiLogger.request('POST', '/api/auth/login', { emailOrUsername })

  try {
    // Validate email
    if (!emailOrUsername || typeof emailOrUsername !== 'string' || emailOrUsername.trim().length === 0) {
      apiLogger.response('POST', '/api/auth/login', 400, { error: 'Email is required' })
      return res.status(400).json({ error: 'Email is required' })
    }

    const trimmedEmail = emailOrUsername.trim().toLowerCase()

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      apiLogger.response('POST', '/api/auth/login', 400, { error: 'Invalid email format' })
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Get or create user by email
    const user = getOrCreateUserByEmail(trimmedEmail)

    // Generate JWT token
    const token = generateToken({
      user_id: user.user_id,
      email: user.email
    })

    apiLogger.response('POST', '/api/auth/login', 200, { user_id: user.user_id, email: user.email })
    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        email: user.email
      }
    })
  } catch (error) {
    apiLogger.error('POST', '/api/auth/login', error as Error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

/**
 * Logout endpoint
 * Client-side only - removes token from localStorage
 */
router.post('/logout', (_req: Request, res: Response) => {
  apiLogger.request('POST', '/api/auth/logout')

  // JWT tokens are stateless - logout is handled client-side
  // by removing the token from localStorage
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

/**
 * Get current user endpoint
 * Returns the currently authenticated user from JWT
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  apiLogger.request('GET', '/api/auth/me')

  try {
    // requireAuth middleware ensures req.user is set
    apiLogger.response('GET', '/api/auth/me', 200, { user_id: req.user!.user_id })
    res.json({
      success: true,
      user: {
        user_id: req.user!.user_id,
        email: req.user!.email
      }
    })
  } catch (error) {
    apiLogger.error('GET', '/api/auth/me', error as Error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

export default router
