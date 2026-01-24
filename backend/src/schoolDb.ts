import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { dbLogger } from './logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../students.db')
const db = new Database(dbPath)

// Create schools table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id TEXT UNIQUE,
    school_name TEXT NOT NULL,
    address TEXT,
    suburb TEXT,
    town TEXT,
    postcode TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    principal TEXT,
    school_type TEXT,
    authority TEXT,
    decile INTEGER,
    roll_number INTEGER,
    gender TEXT,
    is_primary INTEGER DEFAULT 0,
    is_secondary INTEGER DEFAULT 0,
    iscomposite INTEGER DEFAULT 0,
    org_code TEXT,
   特区 TEXT,
    local_body TEXT
  )
`)

dbLogger.success('schools', 'CREATE_TABLE', { message: 'Schools table initialized' })

export interface School {
  id?: number
  school_id?: string
  school_name: string
  address?: string
  suburb?: string
  town?: string
  postcode?: string
  phone?: string
  email?: string
  website?: string
  principal?: string
  school_type?: string
  authority?: string
  decile?: number
  roll_number?: number
  gender?: string
  is_primary?: number
  is_secondary?: number
  iscomposite?: number
  org_code?: string
  特区?: string
  local_body?: string
}

export const schoolDb = {
  // Insert a school
  insert(school: School) {
    try {
      dbLogger.query('schools', 'INSERT', { school_name: school.school_name })
      const stmt = db.prepare(`
        INSERT INTO schools (
          school_id, school_name, address, suburb, town, postcode, phone, email, website,
          principal, school_type, authority, decile, roll_number, gender,
          is_primary, is_secondary, iscomposite, org_code, 特区, local_body
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      const result = stmt.run(
        school.school_id,
        school.school_name,
        school.address,
        school.suburb,
        school.town,
        school.postcode,
        school.phone,
        school.email,
        school.website,
        school.principal,
        school.school_type,
        school.authority,
        school.decile,
        school.roll_number,
        school.gender,
        school.is_primary || 0,
        school.is_secondary || 0,
        school.iscomposite || 0,
        school.org_code,
        school.特区,
        school.local_body
      )
      dbLogger.success('schools', 'INSERT', { school_id: result.lastInsertRowid })
      return result
    } catch (error) {
      dbLogger.error('schools', 'INSERT', error as Error, { school_name: school.school_name })
      throw error
    }
  },

  // Insert many schools (using transaction for performance)
  insertMany(schools: School[]) {
    try {
      dbLogger.query('schools', 'INSERT_MANY', { count: schools.length })
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO schools (
          school_id, school_name, address, suburb, town, postcode, phone, email, website,
          principal, school_type, authority, decile, roll_number, gender,
          is_primary, is_secondary, iscomposite, org_code, 特区, local_body
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      const insertMany = db.transaction((schools: School[]) => {
        for (const school of schools) {
          stmt.run(
            school.school_id,
            school.school_name,
            school.address,
            school.suburb,
            school.town,
            school.postcode,
            school.phone,
            school.email,
            school.website,
            school.principal,
            school.school_type,
            school.authority,
            school.decile,
            school.roll_number,
            school.gender,
            school.is_primary || 0,
            school.is_secondary || 0,
            school.iscomposite || 0,
            school.org_code,
            school.特区,
            school.local_body
          )
        }
      })
      insertMany(schools)
      dbLogger.success('schools', 'INSERT_MANY', { count: schools.length })
    } catch (error) {
      dbLogger.error('schools', 'INSERT_MANY', error as Error, { count: schools.length })
      throw error
    }
  },

  // Get all schools
  getAll(): School[] {
    try {
      dbLogger.query('schools', 'SELECT_ALL')
      const stmt = db.prepare('SELECT * FROM schools ORDER BY school_name')
      const result = stmt.all() as School[]
      dbLogger.success('schools', 'SELECT_ALL', { count: result.length })
      return result
    } catch (error) {
      dbLogger.error('schools', 'SELECT_ALL', error as Error)
      throw error
    }
  },

  // Delete all schools
  deleteAll() {
    try {
      dbLogger.query('schools', 'DELETE_ALL')
      const stmt = db.prepare('DELETE FROM schools')
      const result = stmt.run()
      dbLogger.success('schools', 'DELETE_ALL', { changes: result.changes })
      return result
    } catch (error) {
      dbLogger.error('schools', 'DELETE_ALL', error as Error)
      throw error
    }
  },

  // Count schools
  count(): number {
    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM schools')
      const result = stmt.get() as { count: number }
      return result.count
    } catch (error) {
      dbLogger.error('schools', 'COUNT', error as Error)
      throw error
    }
  }
}
