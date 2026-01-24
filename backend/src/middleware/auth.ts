import { Request, Response, NextFunction } from 'express'
import { userDb } from '../userDb.js'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string
        username: string
      }
    }
  }
}

/**
 * Middleware to ensure user is authenticated
 * If not authenticated, redirects to login
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user) {
    return next()
  }
  res.status(401).json({ error: 'Authentication required' })
}

/**
 * Middleware to load user from session
 * Adds user object to request if authenticated
 */
export function loadUser(req: Request, _res: Response, next: NextFunction) {
  if (req.session?.user) {
    req.user = req.session.user
  }
  next()
}

/**
 * Helper to get or create user from session
 * Used for simple username-based authentication
 */
export function getOrCreateUser(username: string): { user_id: string; username: string } {
  // For simplicity, use username as user_id (you could use UUID instead)
  const user_id = username.toLowerCase().replace(/\s+/g, '_')

  let user = userDb.getByUserId(user_id)

  if (!user) {
    // Create new user
    user = {
      user_id,
      username,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    }
    userDb.insert(user)
  } else {
    // Update last login
    userDb.updateLastLogin(user_id)
  }

  return { user_id, username }
}
