import { Router, Request, Response } from 'express'
import { studentDb } from '../db'
import { generateStudents } from '../studentGenerator'
import { apiLogger } from '../logger.js'

const router = Router()

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

export default router
