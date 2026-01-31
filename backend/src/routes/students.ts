import { Router, Request, Response } from 'express'
import { studentDb } from '../db.js'
import { generateStudents, ETHNICITY_CODES, LANGUAGE_CODES } from '../studentGenerator.js'
import { apiLogger } from '../logger.js'

const router = Router()

/**
 * GET /api/students/ethnicity-codes
 * Get all DMU ethnicity codes
 */
router.get('/ethnicity-codes', (_req: Request, res: Response) => {
  apiLogger.request('GET', '/api/students/ethnicity-codes')
  try {
    res.json({
      success: true,
      codes: ETHNICITY_CODES
    })
    apiLogger.response('GET', '/api/students/ethnicity-codes', 200, { count: ETHNICITY_CODES.length })
  } catch (error) {
    apiLogger.error('GET', '/api/students/ethnicity-codes', error as Error)
    res.status(500).json({
      error: 'Failed to fetch ethnicity codes'
    })
  }
})

/**
 * GET /api/students/language-codes
 * Get all language codes
 */
router.get('/language-codes', (_req: Request, res: Response) => {
  apiLogger.request('GET', '/api/students/language-codes')
  try {
    res.json({
      success: true,
      codes: LANGUAGE_CODES
    })
    apiLogger.response('GET', '/api/students/language-codes', 200, { count: LANGUAGE_CODES.length })
  } catch (error) {
    apiLogger.error('GET', '/api/students/language-codes', error as Error)
    res.status(500).json({
      error: 'Failed to fetch language codes'
    })
  }
})

/**
 * POST /api/students/generate
 * Generate N synthetic students
 */
router.post('/generate', (req: Request, res: Response) => {
  apiLogger.request('POST', '/api/students/generate', { count: req.body.count })
  try {
    const { count } = req.body

    // Validate count
    if (typeof count !== 'number' || count < 1 || count > 10000) {
      apiLogger.response('POST', '/api/students/generate', 400, { count, error: 'Invalid count' })
      return res.status(400).json({
        error: 'Count must be a number between 1 and 10000'
      })
    }

    // Generate students
    const students = generateStudents(count)

    // Insert into database
    studentDb.insertMany(students)

    res.json({
      success: true,
      count: students.length,
      students
    })
    apiLogger.response('POST', '/api/students/generate', 200, { count: students.length })
  } catch (error) {
    apiLogger.error('POST', '/api/students/generate', error as Error, { count: req.body.count })
    res.status(500).json({
      error: 'Failed to generate students'
    })
  }
})

/**
 * GET /api/students
 * Get all students
 */
router.get('/', (_req: Request, res: Response) => {
  apiLogger.request('GET', '/api/students')
  try {
    const students = studentDb.getAll()
    apiLogger.response('GET', '/api/students', 200, { count: students.length })
    res.json({
      success: true,
      count: students.length,
      students
    })
  } catch (error) {
    apiLogger.error('GET', '/api/students', error as Error)
    res.status(500).json({
      error: 'Failed to fetch students'
    })
  }
})

/**
 * DELETE /api/students
 * Delete all students
 */
router.delete('/', (_req: Request, res: Response) => {
  apiLogger.request('DELETE', '/api/students')
  try {
    studentDb.deleteAll()
    apiLogger.response('DELETE', '/api/students', 200)
    res.json({
      success: true,
      message: 'All students deleted'
    })
  } catch (error) {
    apiLogger.error('DELETE', '/api/students', error as Error)
    res.status(500).json({
      error: 'Failed to delete students'
    })
  }
})

/**
 * PUT /api/students/:studentId
 * Update a specific student
 */
router.put('/:studentId', (req: Request, res: Response) => {
  apiLogger.request('PUT', `/api/students/${req.params.studentId}`, { body: req.body })
  try {
    const { studentId } = req.params
    const updates = req.body

    // Validate studentId is a string
    if (typeof studentId !== 'string') {
      apiLogger.response('PUT', `/api/students/${studentId}`, 400, { error: 'Invalid student ID' })
      return res.status(400).json({
        error: 'Invalid student ID'
      })
    }

    // Validate that at least one field is being updated
    if (Object.keys(updates).length === 0) {
      apiLogger.response('PUT', `/api/students/${studentId}`, 400, { error: 'No fields to update' })
      return res.status(400).json({
        error: 'No fields to update'
      })
    }

    // Validate allowed fields
    const allowedFields = ['first_name', 'last_name', 'level', 'ethnicity', 'gender', 'nsn', 'language']
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field))

    if (invalidFields.length > 0) {
      apiLogger.response('PUT', `/api/students/${studentId}`, 400, { error: 'Invalid fields', invalidFields })
      return res.status(400).json({
        error: `Invalid fields: ${invalidFields.join(', ')}`
      })
    }

    // Update student
    studentDb.update(studentId, updates)

    // Get updated student
    const students = studentDb.getAll()
    const updatedStudent = students.find(s => s.student_id === studentId)

    if (!updatedStudent) {
      apiLogger.response('PUT', `/api/students/${studentId}`, 404, { error: 'Student not found' })
      return res.status(404).json({
        error: 'Student not found'
      })
    }

    apiLogger.response('PUT', `/api/students/${studentId}`, 200, { student: updatedStudent })
    res.json({
      success: true,
      student: updatedStudent
    })
  } catch (error) {
    apiLogger.error('PUT', `/api/students/${req.params.studentId}`, error as Error)
    res.status(500).json({
      error: 'Failed to update student'
    })
  }
})

export default router
