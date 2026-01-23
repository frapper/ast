import { Router, Request, Response } from 'express'
import { studentDb } from '../db'
import { generateStudents } from '../studentGenerator'

const router = Router()

/**
 * POST /api/students/generate
 * Generate N synthetic students
 */
router.post('/generate', (req: Request, res: Response) => {
  try {
    const { count } = req.body

    // Validate count
    if (typeof count !== 'number' || count < 1 || count > 10000) {
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
  } catch (error) {
    console.error('Error generating students:', error)
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
  try {
    const students = studentDb.getAll()
    res.json({
      success: true,
      count: students.length,
      students
    })
  } catch (error) {
    console.error('Error fetching students:', error)
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
  try {
    studentDb.deleteAll()
    res.json({
      success: true,
      message: 'All students deleted'
    })
  } catch (error) {
    console.error('Error deleting students:', error)
    res.status(500).json({
      error: 'Failed to delete students'
    })
  }
})

export default router
