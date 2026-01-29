import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { dbLogger } from './logger.js'
import { randomUUID } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../students.db')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    username TEXT,
    email TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
  )
`)

// Migration: Rebuild users table with new schema if needed
try {
  // Check if we need to migrate by checking if username is still NOT NULL
  const tableInfo = db.pragma('table_info(users)') as any[]
  const usernameCol = tableInfo.find((col: any) => col.name === 'username')

  if (usernameCol && usernameCol.notnull === 1) {
    // Old schema detected - need to migrate
    console.log('[MIGRATION] Rebuilding users table to make username nullable...')

    // Start transaction
    db.exec('BEGIN TRANSACTION')

    try {
      // 1. Create new users table with correct schema
      db.exec(`
        CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT UNIQUE NOT NULL,
          username TEXT,
          email TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          last_login TEXT
        )
      `)

      // 2. Copy data, using email for username if username is missing
      db.exec(`
        INSERT INTO users_new (id, user_id, username, email, created_at, last_login)
        SELECT id, user_id,
          COALESCE(username, email) as username,
          COALESCE(email, username) as email,
          created_at,
          last_login
        FROM users
      `)

      // 3. Drop old table
      db.exec('DROP TABLE users')

      // 4. Rename new table
      db.exec('ALTER TABLE users_new RENAME TO users')

      // 5. Recreate indexes
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)

      db.exec('COMMIT')
      console.log('[MIGRATION] Users table migrated successfully')
    } catch (err) {
      db.exec('ROLLBACK')
      console.error('[MIGRATION] Failed to migrate users table:', err)
      throw err
    }
  }
} catch (e) {
  // Ignore migration errors
}

dbLogger.success('users', 'CREATE_TABLE', { message: 'Users table initialized' })

// Create user_schools junction table
db.exec(`
  CREATE TABLE IF NOT EXISTS user_schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    school_id TEXT NOT NULL,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE,
    UNIQUE(user_id, school_id)
  )
`)

dbLogger.success('user_schools', 'CREATE_TABLE', { message: 'User schools table initialized' })

// Create indexes for performance
db.exec(`CREATE INDEX IF NOT EXISTS idx_user_schools_user_id ON user_schools(user_id)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_user_schools_school_id ON user_schools(school_id)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)

dbLogger.success('user_schools', 'CREATE_INDEX', { message: 'User schools indexes created' })

export interface User {
  id?: number
  user_id: string
  username?: string  // Optional now, kept for backward compatibility
  email: string      // Now required
  created_at?: string
  last_login?: string
}

export interface UserSchool {
  id?: number
  user_id: string
  school_id: string
  added_at?: string
  notes?: string
}

export const userDb = {
  // Create a new user
  insert(user: User) {
    try {
      dbLogger.query('users', 'INSERT', { email: user.email })
      const stmt = db.prepare(`
        INSERT INTO users (user_id, username, email, last_login)
        VALUES (?, ?, ?, ?)
      `)
      const result = stmt.run(user.user_id, user.username || null, user.email, user.last_login || null)
      dbLogger.success('users', 'INSERT', { user_id: user.user_id })
      return result
    } catch (error) {
      dbLogger.error('users', 'INSERT', error as Error, { email: user.email })
      throw error
    }
  },

  // Get user by email (new primary method)
  getByEmail(email: string): User | undefined {
    try {
      dbLogger.query('users', 'SELECT_BY_EMAIL')
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
      const result = stmt.get(email) as User | undefined
      if (result) {
        dbLogger.success('users', 'SELECT_BY_EMAIL', { email })
      }
      return result
    } catch (error) {
      dbLogger.error('users', 'SELECT_BY_EMAIL', error as Error, { email })
      throw error
    }
  },

  // Get user by user_id (kept for backward compatibility)
  getByUserId(user_id: string): User | undefined {
    try {
      dbLogger.query('users', 'SELECT_BY_USER_ID')
      const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?')
      const result = stmt.get(user_id) as User | undefined
      if (result) {
        dbLogger.success('users', 'SELECT_BY_USER_ID', { user_id })
      }
      return result
    } catch (error) {
      dbLogger.error('users', 'SELECT_BY_USER_ID', error as Error, { user_id })
      throw error
    }
  },

  // Update user's last login
  updateLastLogin(user_id: string) {
    try {
      dbLogger.query('users', 'UPDATE_LAST_LOGIN', { user_id })
      const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?')
      const result = stmt.run(user_id)
      dbLogger.success('users', 'UPDATE_LAST_LOGIN', { user_id })
      return result
    } catch (error) {
      dbLogger.error('users', 'UPDATE_LAST_LOGIN', error as Error, { user_id })
      throw error
    }
  },

  // Add school to user's list
  addSchool(userSchool: UserSchool) {
    try {
      dbLogger.query('user_schools', 'INSERT', { user_id: userSchool.user_id, school_id: userSchool.school_id })
      const stmt = db.prepare(`
        INSERT INTO user_schools (user_id, school_id, notes)
        VALUES (?, ?, ?)
      `)
      const result = stmt.run(userSchool.user_id, userSchool.school_id, userSchool.notes || null)
      dbLogger.success('user_schools', 'INSERT', { user_id: userSchool.user_id, school_id: userSchool.school_id })
      return result
    } catch (error) {
      dbLogger.error('user_schools', 'INSERT', error as Error, { user_id: userSchool.user_id })
      throw error
    }
  },

  // Remove school from user's list
  removeSchool(user_id: string, school_id: string) {
    try {
      dbLogger.query('user_schools', 'DELETE', { user_id, school_id })
      const stmt = db.prepare('DELETE FROM user_schools WHERE user_id = ? AND school_id = ?')
      const result = stmt.run(user_id, school_id)
      dbLogger.success('user_schools', 'DELETE', { user_id, school_id, changes: result.changes })
      return result
    } catch (error) {
      dbLogger.error('user_schools', 'DELETE', error as Error, { user_id, school_id })
      throw error
    }
  },

  // Get all schools for a user (join with schools table)
  getUserSchools(user_id: string) {
    try {
      dbLogger.query('user_schools', 'SELECT_USER_SCHOOLS', { user_id })
      const stmt = db.prepare(`
        SELECT
          s.*,
          us.added_at,
          us.notes
        FROM user_schools us
        INNER JOIN schools s ON us.school_id = s.school_id
        WHERE us.user_id = ?
        ORDER BY us.added_at DESC
      `)
      const result = stmt.all(user_id)
      dbLogger.success('user_schools', 'SELECT_USER_SCHOOLS', { user_id, count: result.length })
      return result
    } catch (error) {
      dbLogger.error('user_schools', 'SELECT_USER_SCHOOLS', error as Error, { user_id })
      throw error
    }
  },

  // Check if school is in user's list
  checkSchool(user_id: string, school_id: string): boolean {
    try {
      const stmt = db.prepare('SELECT 1 FROM user_schools WHERE user_id = ? AND school_id = ?')
      const result = stmt.get(user_id, school_id) as { 1: number } | undefined
      return !!result
    } catch (error) {
      dbLogger.error('user_schools', 'CHECK_SCHOOL', error as Error, { user_id, school_id })
      throw error
    }
  },

  // Get all user_schools for a list of school_ids (for batch checking)
  getUserSchoolIds(user_id: string): string[] {
    try {
      const stmt = db.prepare('SELECT school_id FROM user_schools WHERE user_id = ?')
      const result = stmt.all(user_id) as { school_id: string }[]
      return result.map(r => r.school_id)
    } catch (error) {
      dbLogger.error('user_schools', 'GET_USER_SCHOOL_IDS', error as Error, { user_id })
      throw error
    }
  },

  // Count schools for a user
  countUserSchools(user_id: string): number {
    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM user_schools WHERE user_id = ?')
      const result = stmt.get(user_id) as { count: number }
      return result.count
    } catch (error) {
      dbLogger.error('user_schools', 'COUNT', error as Error, { user_id })
      throw error
    }
  }
}

/**
 * Get or create a user by email
 * This is the primary authentication function
 */
export function getOrCreateUserByEmail(email: string): User {
  const normalizedEmail = email.toLowerCase().trim()

  // Try to get existing user
  let user = userDb.getByEmail(normalizedEmail)

  if (user) {
    // Update last login
    userDb.updateLastLogin(user.user_id)

    // Ensure username is set (for older accounts that might not have it)
    if (!user.username) {
      user.username = normalizedEmail
    }
  } else {
    // Create new user with UUID as user_id
    const user_id = randomUUID()
    user = {
      user_id,
      username: normalizedEmail,  // Use email as username
      email: normalizedEmail,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    }
    userDb.insert(user)
  }

  return user
}
