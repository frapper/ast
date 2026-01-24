import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { dbLogger } from './logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../students.db')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create groups table
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    school_id TEXT NOT NULL,
    group_name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE,
    UNIQUE(user_id, school_id, group_name)
  )
`)

dbLogger.success('groups', 'CREATE_TABLE', { message: 'Groups table initialized' })

// Create indexes for performance
db.exec(`CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_groups_school_id ON groups(school_id)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_groups_user_school ON groups(user_id, school_id)`)

dbLogger.success('groups', 'CREATE_INDEX', { message: 'Groups indexes created' })

export interface Group {
  id?: number
  group_id: string
  user_id: string
  school_id: string
  group_name: string
  created_at?: string
  updated_at?: string
}

export const groupDb = {
  // Create a new group
  insert(group: Group) {
    try {
      dbLogger.query('groups', 'INSERT', { school_id: group.school_id, group_name: group.group_name })
      const stmt = db.prepare(`
        INSERT INTO groups (group_id, user_id, school_id, group_name)
        VALUES (?, ?, ?, ?)
      `)
      const result = stmt.run(group.group_id, group.user_id, group.school_id, group.group_name)
      dbLogger.success('groups', 'INSERT', { group_id: group.group_id })
      return result
    } catch (error) {
      dbLogger.error('groups', 'INSERT', error as Error, { group_name: group.group_name })
      throw error
    }
  },

  // Get all groups for a specific school
  getBySchool(user_id: string, school_id: string): Group[] {
    try {
      dbLogger.query('groups', 'SELECT_BY_SCHOOL', { user_id, school_id })
      const stmt = db.prepare(`
        SELECT * FROM groups
        WHERE user_id = ? AND school_id = ?
        ORDER BY group_name ASC
      `)
      const result = stmt.all(user_id, school_id) as Group[]
      dbLogger.success('groups', 'SELECT_BY_SCHOOL', { user_id, school_id, count: result.length })
      return result
    } catch (error) {
      dbLogger.error('groups', 'SELECT_BY_SCHOOL', error as Error, { user_id, school_id })
      throw error
    }
  },

  // Get all groups for a user, grouped by school
  getAllByUser(user_id: string): Group[] {
    try {
      dbLogger.query('groups', 'SELECT_ALL_BY_USER', { user_id })
      const stmt = db.prepare(`
        SELECT * FROM groups
        WHERE user_id = ?
        ORDER BY school_id, group_name ASC
      `)
      const result = stmt.all(user_id) as Group[]
      dbLogger.success('groups', 'SELECT_ALL_BY_USER', { user_id, count: result.length })
      return result
    } catch (error) {
      dbLogger.error('groups', 'SELECT_ALL_BY_USER', error as Error, { user_id })
      throw error
    }
  },

  // Get a specific group by group_id
  getByGroupId(group_id: string): Group | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM groups WHERE group_id = ?')
      const result = stmt.get(group_id) as Group | undefined
      return result
    } catch (error) {
      dbLogger.error('groups', 'SELECT_BY_GROUP_ID', error as Error, { group_id })
      throw error
    }
  },

  // Update group name
  updateName(group_id: string, group_name: string) {
    try {
      dbLogger.query('groups', 'UPDATE', { group_id, group_name })
      const stmt = db.prepare(`
        UPDATE groups
        SET group_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE group_id = ?
      `)
      const result = stmt.run(group_name, group_id)
      dbLogger.success('groups', 'UPDATE', { group_id, changes: result.changes })
      return result
    } catch (error) {
      dbLogger.error('groups', 'UPDATE', error as Error, { group_id })
      throw error
    }
  },

  // Delete a group
  delete(group_id: string) {
    try {
      dbLogger.query('groups', 'DELETE', { group_id })
      const stmt = db.prepare('DELETE FROM groups WHERE group_id = ?')
      const result = stmt.run(group_id)
      dbLogger.success('groups', 'DELETE', { group_id, changes: result.changes })
      return result
    } catch (error) {
      dbLogger.error('groups', 'DELETE', error as Error, { group_id })
      throw error
    }
  },

  // Count groups for a school
  countBySchool(user_id: string, school_id: string): number {
    try {
      const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM groups
        WHERE user_id = ? AND school_id = ?
      `)
      const result = stmt.get(user_id, school_id) as { count: number }
      return result.count
    } catch (error) {
      dbLogger.error('groups', 'COUNT', error as Error, { user_id, school_id })
      throw error
    }
  },

  // Delete all groups for a school
  deleteBySchool(user_id: string, school_id: string) {
    try {
      dbLogger.query('groups', 'DELETE_BY_SCHOOL', { user_id, school_id })
      const stmt = db.prepare(`
        DELETE FROM groups
        WHERE user_id = ? AND school_id = ?
      `)
      const result = stmt.run(user_id, school_id)
      dbLogger.success('groups', 'DELETE_BY_SCHOOL', { user_id, school_id, changes: result.changes })
      return result
    } catch (error) {
      dbLogger.error('groups', 'DELETE_BY_SCHOOL', error as Error, { user_id, school_id })
      throw error
    }
  }
}
