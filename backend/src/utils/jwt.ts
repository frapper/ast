import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'change-this-in-production'

export interface JWTPayload {
  user_id: string
  email: string
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any)
}

/**
 * Verify a JWT token and return the payload
 * Returns null if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Decode a JWT token without verifying signature
 * Useful for debugging
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}
