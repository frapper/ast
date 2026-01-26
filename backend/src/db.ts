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

// Create students table
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    level TEXT NOT NULL,
    ethnicity TEXT NOT NULL,
    gender TEXT NOT NULL,
    nsn TEXT NOT NULL UNIQUE
  )
`)

dbLogger.success('students', 'CREATE_TABLE', { message: 'Students table initialized' })

// Create group_students junction table
db.exec(`
  CREATE TABLE IF NOT EXISTS group_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE(group_id, student_id)
  )
`)

dbLogger.success('group_students', 'CREATE_TABLE', { message: 'Group_Students table initialized' })

// Create indexes for performance
db.exec(`CREATE INDEX IF NOT EXISTS idx_group_students_group_id ON group_students(group_id)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_group_students_student_id ON group_students(student_id)`)

dbLogger.success('group_students', 'CREATE_INDEX', { message: 'Group_Students indexes created' })

export interface Student {
  student_id: string
  first_name: string
  last_name: string
  level: string
  ethnicity: string
  gender: string
  nsn: string
}

export const studentDb = {
  // Insert a student
  insert(student: Student) {
    try {
      dbLogger.query('students', 'INSERT', { student_id: student.student_id })
      const stmt = db.prepare(`
        INSERT INTO students (student_id, first_name, last_name, level, ethnicity, gender, nsn)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      const result = stmt.run(student.student_id, student.first_name, student.last_name, student.level, student.ethnicity, student.gender, student.nsn)
      dbLogger.success('students', 'INSERT', { student_id: student.student_id })
      return result
    } catch (error) {
      dbLogger.error('students', 'INSERT', error as Error, { student_id: student.student_id })
      throw error
    }
  },

  // Insert multiple students
  insertMany(students: Student[]) {
    try {
      dbLogger.query('students', 'INSERT_MANY', { count: students.length })
      const stmt = db.prepare(`
        INSERT INTO students (student_id, first_name, last_name, level, ethnicity, gender, nsn)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      const insertMany = db.transaction((students: Student[]) => {
        for (const student of students) {
          stmt.run(student.student_id, student.first_name, student.last_name, student.level, student.ethnicity, student.gender, student.nsn)
        }
      })
      insertMany(students)
      dbLogger.success('students', 'INSERT_MANY', { count: students.length })
    } catch (error) {
      dbLogger.error('students', 'INSERT_MANY', error as Error, { count: students.length })
      throw error
    }
  },

  // Get all students
  getAll(): Student[] {
    try {
      dbLogger.query('students', 'SELECT_ALL')
      const stmt = db.prepare('SELECT * FROM students ORDER BY student_id')
      const result = stmt.all() as Student[]
      dbLogger.success('students', 'SELECT_ALL', { count: result.length })
      return result
    } catch (error) {
      dbLogger.error('students', 'SELECT_ALL', error as Error)
      throw error
    }
  },

  // Delete all students
  deleteAll() {
    try {
      dbLogger.query('students', 'DELETE_ALL')
      const stmt = db.prepare('DELETE FROM students')
      const result = stmt.run()
      dbLogger.success('students', 'DELETE_ALL', { changes: result.changes })
      return result
    } catch (error) {
      dbLogger.error('students', 'DELETE_ALL', error as Error)
      throw error
    }
  },

  // Count students
  count(): number {
    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM students')
      const result = stmt.get() as { count: number }
      return result.count
    } catch (error) {
      dbLogger.error('students', 'COUNT', error as Error)
      throw error
    }
  },

  // Get students by group ID
  getByGroupId(group_id: string): Student[] {
    try {
      dbLogger.query('group_students', 'SELECT_BY_GROUP', { group_id })
      const stmt = db.prepare(`
        SELECT s.* FROM students s
        INNER JOIN group_students gs ON s.student_id = gs.student_id
        WHERE gs.group_id = ?
        ORDER BY s.last_name, s.first_name
      `)
      const result = stmt.all(group_id) as Student[]
      dbLogger.success('group_students', 'SELECT_BY_GROUP', { group_id, count: result.length })
      return result
    } catch (error) {
      dbLogger.error('group_students', 'SELECT_BY_GROUP', error as Error, { group_id })
      throw error
    }
  },

  // Add student to group
  addToGroup(group_id: string, student_id: string) {
    try {
      dbLogger.query('group_students', 'INSERT', { group_id, student_id })
      const stmt = db.prepare(`
        INSERT INTO group_students (group_id, student_id)
        VALUES (?, ?)
      `)
      const result = stmt.run(group_id, student_id)
      dbLogger.success('group_students', 'INSERT', { group_id, student_id })
      return result
    } catch (error) {
      dbLogger.error('group_students', 'INSERT', error as Error, { group_id, student_id })
      throw error
    }
  },

  // Add multiple students to a group
  addManyToGroup(group_id: string, student_ids: string[]) {
    try {
      dbLogger.query('group_students', 'INSERT_MANY', { group_id, count: student_ids.length })
      const stmt = db.prepare(`
        INSERT INTO group_students (group_id, student_id)
        VALUES (?, ?)
      `)
      const insertMany = db.transaction((student_ids: string[]) => {
        for (const student_id of student_ids) {
          stmt.run(group_id, student_id)
        }
      })
      insertMany(student_ids)
      dbLogger.success('group_students', 'INSERT_MANY', { group_id, count: student_ids.length })
    } catch (error) {
      dbLogger.error('group_students', 'INSERT_MANY', error as Error, { group_id, count: student_ids.length })
      throw error
    }
  },

  // Remove student from group
  removeFromGroup(group_id: string, student_id: string) {
    try {
      dbLogger.query('group_students', 'DELETE', { group_id, student_id })
      const stmt = db.prepare(`
        DELETE FROM group_students
        WHERE group_id = ? AND student_id = ?
      `)
      const result = stmt.run(group_id, student_id)
      dbLogger.success('group_students', 'DELETE', { group_id, student_id })
      return result
    } catch (error) {
      dbLogger.error('group_students', 'DELETE', error as Error, { group_id, student_id })
      throw error
    }
  },

  // Remove all students from a group
  removeAllFromGroup(group_id: string) {
    try {
      dbLogger.query('group_students', 'DELETE_ALL', { group_id })
      const stmt = db.prepare(`DELETE FROM group_students WHERE group_id = ?`)
      const result = stmt.run(group_id)
      dbLogger.success('group_students', 'DELETE_ALL', { group_id })
      return result
    } catch (error) {
      dbLogger.error('group_students', 'DELETE_ALL', error as Error, { group_id })
      throw error
    }
  },

  // Count students in a group
  countByGroup(group_id: string): number {
    try {
      const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM group_students WHERE group_id = ?
      `)
      const result = stmt.get(group_id) as { count: number }
      return result.count
    } catch (error) {
      dbLogger.error('group_students', 'COUNT', error as Error, { group_id })
      throw error
    }
  },

  // Delete specific students by their IDs
  deleteByIds(student_ids: string[]) {
    try {
      dbLogger.query('students', 'DELETE_BY_IDS', { count: student_ids.length })
      const stmt = db.prepare(`DELETE FROM students WHERE student_id = ?`)
      const deleteMany = db.transaction((student_ids: string[]) => {
        for (const student_id of student_ids) {
          stmt.run(student_id)
        }
      })
      const result = deleteMany(student_ids)
      dbLogger.success('students', 'DELETE_BY_IDS', { count: student_ids.length })
      return result
    } catch (error) {
      dbLogger.error('students', 'DELETE_BY_IDS', error as Error, { count: student_ids.length })
      throw error
    }
  },

  // Get all NSNs for a user's groups in a specific school
  getNSNsByUserSchool(user_id: string, school_id: string): string[] {
    try {
      dbLogger.query('students', 'SELECT_NSN_BY_USER_SCHOOL', { user_id, school_id })
      const stmt = db.prepare(`
        SELECT DISTINCT s.nsn
        FROM students s
        INNER JOIN group_students gs ON s.student_id = gs.student_id
        INNER JOIN groups g ON gs.group_id = g.group_id
        WHERE g.user_id = ? AND g.school_id = ?
      `)
      const result = stmt.all(user_id, school_id) as { nsn: string }[]
      dbLogger.success('students', 'SELECT_NSN_BY_USER_SCHOOL', { user_id, school_id, count: result.length })
      return result.map(r => r.nsn)
    } catch (error) {
      dbLogger.error('students', 'SELECT_NSN_BY_USER_SCHOOL', error as Error, { user_id, school_id })
      throw error
    }
  }
}
