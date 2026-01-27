import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'

export interface JWTPayload {
  user_id: string
  email: string
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

/**
 * Middleware to require JWT authentication
 * Checks for Authorization header with Bearer token
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  const payload = verifyToken(token)

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.user = payload
  next()
}

/**
 * Middleware to load user from JWT if present
 * Does not require authentication - continues without user if no token
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (payload) {
      req.user = payload
    }
  }

  next()
}
