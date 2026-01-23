import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

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
    const stmt = db.prepare(`
      INSERT INTO students (student_id, first_name, last_name, level, ethnicity, gender, nsn)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(student.student_id, student.first_name, student.last_name, student.level, student.ethnicity, student.gender, student.nsn)
  },

  // Insert multiple students
  insertMany(students: Student[]) {
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
  },

  // Get all students
  getAll(): Student[] {
    const stmt = db.prepare('SELECT * FROM students ORDER BY student_id')
    return stmt.all() as Student[]
  },

  // Delete all students
  deleteAll() {
    const stmt = db.prepare('DELETE FROM students')
    return stmt.run()
  },

  // Count students
  count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM students')
    const result = stmt.get() as { count: number }
    return result.count
  }
}
