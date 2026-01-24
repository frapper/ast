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
  }
}
