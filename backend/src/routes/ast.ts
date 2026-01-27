import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/jwtAuth.js'
import { generateASTFile, type ASTGenerationOptions, type GroupStudents } from '../utils/astGenerator.js'
import { groupDb } from '../groupDb.js'
import { studentDb } from '../db.js'
import { apiLogger } from '../logger.js'

const router = Router()

// All routes require authentication
router.use(requireAuth)

/**
 * Generate AST CSV file for a school's groups
 * POST /api/ast/generate
 * Body: { schoolId, schoolName, groupId? }
 */
router.post('/generate', async (req: Request, res: Response) => {
  const { schoolId, schoolName, groupId } = req.body

  apiLogger.request('POST', '/api/ast/generate', { schoolId, groupId })

  try {
    if (!schoolId || !schoolName) {
      apiLogger.response('POST', '/api/ast/generate', 400, { error: 'Missing required fields' })
      return res.status(400).json({ error: 'schoolId and schoolName are required' })
    }

    // Get user_id from JWT
    const user_id = req.user!.user_id

    // Get groups for this school and user
    const groups = groupId
      ? [groupDb.getByGroupId(groupId)]
      : groupDb.getBySchool(user_id, schoolId)

    if (!groups || groups.length === 0) {
      apiLogger.response('POST', '/api/ast/generate', 404, { error: 'No groups found' })
      return res.status(404).json({ error: 'No groups found for this school' })
    }

    // Verify ownership if specific groupId requested
    if (groupId && groups[0]?.user_id !== user_id) {
      apiLogger.response('POST', '/api/ast/generate', 403, { error: 'Access denied' })
      return res.status(403).json({ error: 'Access denied to this group' })
    }

    // Collect groups with their students
    const groupsWithStudents: GroupStudents[] = []
    for (const group of groups) {
      if (group) {
        const students = studentDb.getByGroupId(group.group_id)
        groupsWithStudents.push({
          group_id: group.group_id,
          group_name: group.group_name,
          students
        })
      }
    }

    // Count total students
    const totalStudents = groupsWithStudents.reduce((sum, g) => sum + g.students.length, 0)

    if (totalStudents === 0) {
      apiLogger.response('POST', '/api/ast/generate', 404, { error: 'No students found' })
      return res.status(404).json({ error: 'No students found in groups' })
    }

    // Generate AST CSV
    const options: ASTGenerationOptions = {
      schoolId,
      schoolName,
      groupId
    }

    const astCSV = generateASTFile(groupsWithStudents, options)

    apiLogger.response('POST', '/api/ast/generate', 200, {
      schoolId,
      studentCount: totalStudents,
      groupId: groupId || 'all'
    })

    // Return CSV content
    res.setHeader('Content-Type', 'text/csv')
    res.send(astCSV)

  } catch (error) {
    apiLogger.error('POST', '/api/ast/generate', error as Error, { schoolId })
    console.error('Error generating AST:', error)
    res.status(500).json({ error: 'Failed to generate AST file' })
  }
})

/**
 * Download AST file with proper filename
 * POST /api/ast/download
 * Body: { schoolId, schoolName, groupId? }
 */
router.post('/download', async (req: Request, res: Response) => {
  const { schoolId, schoolName, groupId } = req.body

  apiLogger.request('POST', '/api/ast/download', { schoolId, groupId })

  try {
    if (!schoolId || !schoolName) {
      return res.status(400).json({ error: 'schoolId and schoolName are required' })
    }

    // Get user_id from JWT
    const user_id = req.user!.user_id

    // Get groups for this school and user
    const groups = groupId
      ? [groupDb.getByGroupId(groupId)]
      : groupDb.getBySchool(user_id, schoolId)

    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: 'No groups found' })
    }

    // Verify ownership if specific groupId requested
    if (groupId && groups[0]?.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied to this group' })
    }

    // Collect groups with their students
    const groupsWithStudents: GroupStudents[] = []
    for (const group of groups) {
      if (group) {
        const students = studentDb.getByGroupId(group.group_id)
        groupsWithStudents.push({
          group_id: group.group_id,
          group_name: group.group_name,
          students
        })
      }
    }

    // Count total students
    const totalStudents = groupsWithStudents.reduce((sum, g) => sum + g.students.length, 0)

    if (totalStudents === 0) {
      return res.status(404).json({ error: 'No students found in groups' })
    }

    const astCSV = generateASTFile(groupsWithStudents, { schoolId, schoolName, groupId })

    // Set download headers
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `AST_${schoolId}_${timestamp}.csv`

    apiLogger.response('POST', '/api/ast/download', 200, {
      schoolId,
      studentCount: totalStudents,
      filename
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(astCSV)

  } catch (error) {
    apiLogger.error('POST', '/api/ast/download', error as Error, { schoolId })
    console.error('Error downloading AST:', error)
    res.status(500).json({ error: 'Failed to download AST file' })
  }
})

export default router
