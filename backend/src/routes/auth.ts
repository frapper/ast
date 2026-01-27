import { Router, Request, Response } from 'express'
import { getOrCreateUser } from '../middleware/auth.js'
import { apiLogger } from '../logger.js'

const router = Router()

/**
 * Login endpoint
 * Creates or retrieves user based on username
 */
router.post('/login', (req: Request, res: Response) => {
  const { username } = req.body

  apiLogger.request('POST', '/api/auth/login', { username })

  try {
    // Validate username
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      apiLogger.response('POST', '/api/auth/login', 400, { error: 'Invalid username' })
      return res.status(400).json({ error: 'Username is required' })
    }

    const trimmedUsername = username.trim()

    if (trimmedUsername.length < 2 || trimmedUsername.length > 50) {
      apiLogger.response('POST', '/api/auth/login', 400, { error: 'Invalid username length' })
      return res.status(400).json({ error: 'Username must be between 2 and 50 characters' })
    }

    // Get or create user
    const user = getOrCreateUser(trimmedUsername)

    // Set session
    if (req.session) {
      req.session.user = {
        user_id: user.user_id,
        username: user.username
      }
      console.log('[DEBUG] Login session set:', {
        sessionId: req.sessionID,
        userId: user.user_id,
        username: user.username,
        cookie: req.session.cookie
      })
    } else {
      console.log('[DEBUG] ERROR: No session object available!')
    }

    apiLogger.response('POST', '/api/auth/login', 200, { user_id: user.user_id, username: user.username })
    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        username: user.username
      }
    })
  } catch (error) {
    apiLogger.error('POST', '/api/auth/login', error as Error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

/**
 * Logout endpoint
 * Clears the session
 */
router.post('/logout', (req: Request, res: Response) => {
  apiLogger.request('POST', '/api/auth/logout')

  try {
    req.session?.destroy((err) => {
      if (err) {
        apiLogger.error('POST', '/api/auth/logout', err)
        return res.status(500).json({ error: 'Failed to logout' })
      }

      apiLogger.response('POST', '/api/auth/logout', 200)
      res.json({
        success: true,
        message: 'Logged out successfully'
      })
    })
  } catch (error) {
    apiLogger.error('POST', '/api/auth/logout', error as Error)
    res.status(500).json({ error: 'Failed to logout' })
  }
})

/**
 * Get current user endpoint
 * Returns the currently authenticated user
 */
router.get('/me', (req: Request, res: Response) => {
  apiLogger.request('GET', '/api/auth/me')

  try {
    if (!req.session?.user) {
      apiLogger.response('GET', '/api/auth/me', 401)
      return res.status(401).json({ error: 'Not authenticated' })
    }

    apiLogger.response('GET', '/api/auth/me', 200, { user_id: req.session.user.user_id })
    res.json({
      success: true,
      user: req.session.user
    })
  } catch (error) {
    apiLogger.error('GET', '/api/auth/me', error as Error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

export default router
