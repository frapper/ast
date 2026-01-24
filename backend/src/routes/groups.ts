import { Router, Request, Response } from 'express'
import { groupDb } from '../groupDb.js'
import { userDb } from '../userDb.js'
import { randomUUID } from 'crypto'
import { apiLogger } from '../logger.js'

const router = Router()

/**
 * Get all groups for a specific school
 */
router.get('/school/:schoolId', (req: Request, res: Response) => {
  const schoolId = String(req.params.schoolId)

  apiLogger.request('GET', `/api/groups/school/${schoolId}`)

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('GET', `/api/groups/school/${schoolId}`, 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id
    const groups = groupDb.getBySchool(user_id, schoolId)

    apiLogger.response('GET', `/api/groups/school/${schoolId}`, 200, { count: groups.length })
    res.json({
      success: true,
      count: groups.length,
      groups
    })
  } catch (error) {
    apiLogger.error('GET', `/api/groups/school/${schoolId}`, error as Error)
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

/**
 * Get all groups for the current user (grouped by school)
 */
router.get('/user', (req: Request, res: Response) => {
  apiLogger.request('GET', '/api/groups/user')

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('GET', '/api/groups/user', 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id
    const groups = groupDb.getAllByUser(user_id)

    // Group by school_id
    const grouped = groups.reduce((acc: Record<string, typeof groups>, group) => {
      if (!acc[group.school_id]) {
        acc[group.school_id] = []
      }
      acc[group.school_id].push(group)
      return acc
    }, {})

    apiLogger.response('GET', '/api/groups/user', 200, { total: groups.length })
    res.json({
      success: true,
      total: groups.length,
      groups: grouped
    })
  } catch (error) {
    apiLogger.error('GET', '/api/groups/user', error as Error)
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

/**
 * Create a new group
 */
router.post('/', (req: Request, res: Response) => {
  const { school_id, group_name } = req.body

  apiLogger.request('POST', '/api/groups', { school_id, group_name })

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('POST', '/api/groups', 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id

    // Validate inputs
    if (!school_id || typeof school_id !== 'string') {
      apiLogger.response('POST', '/api/groups', 400, { error: 'Invalid school_id' })
      return res.status(400).json({ error: 'school_id is required' })
    }

    if (!group_name || typeof group_name !== 'string') {
      apiLogger.response('POST', '/api/groups', 400, { error: 'Invalid group_name' })
      return res.status(400).json({ error: 'group_name is required' })
    }

    const trimmedName = group_name.trim()

    if (trimmedName.length === 0) {
      apiLogger.response('POST', '/api/groups', 400, { error: 'Empty group_name' })
      return res.status(400).json({ error: 'group_name cannot be empty' })
    }

    if (trimmedName.length > 100) {
      apiLogger.response('POST', '/api/groups', 400, { error: 'Group name too long' })
      return res.status(400).json({ error: 'group_name must be 100 characters or less' })
    }

    // Verify school is in user's My Schools
    const schoolIds = userDb.getUserSchoolIds(user_id)
    if (!schoolIds.includes(school_id)) {
      apiLogger.response('POST', '/api/groups', 403, { school_id })
      return res.status(403).json({ error: 'School not found in your list' })
    }

    // Create group
    const group_id = randomUUID()
    const group = {
      group_id,
      user_id,
      school_id,
      group_name: trimmedName
    }

    groupDb.insert(group)

    apiLogger.response('POST', '/api/groups', 200, { group_id })
    res.json({
      success: true,
      group
    })
  } catch (error) {
    // Handle unique constraint violation
    if ((error as any).code === 'SQLITE_CONSTRAINT') {
      apiLogger.response('POST', '/api/groups', 409)
      return res.status(409).json({ error: 'A group with this name already exists for this school' })
    }

    apiLogger.error('POST', '/api/groups', error as Error)
    res.status(500).json({ error: 'Failed to create group' })
  }
})

/**
 * Update a group name
 */
router.put('/:groupId', (req: Request, res: Response) => {
  const groupId = String(req.params.groupId)
  const { group_name } = req.body

  apiLogger.request('PUT', `/api/groups/${groupId}`, { group_name })

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('PUT', `/api/groups/${groupId}`, 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id

    // Validate inputs
    if (!group_name || typeof group_name !== 'string') {
      apiLogger.response('PUT', `/api/groups/${groupId}`, 400)
      return res.status(400).json({ error: 'group_name is required' })
    }

    const trimmedName = group_name.trim()

    if (trimmedName.length === 0) {
      apiLogger.response('PUT', `/api/groups/${groupId}`, 400)
      return res.status(400).json({ error: 'group_name cannot be empty' })
    }

    if (trimmedName.length > 100) {
      apiLogger.response('PUT', `/api/groups/${groupId}`, 400)
      return res.status(400).json({ error: 'group_name must be 100 characters or less' })
    }

    // Verify group belongs to user
    const group = groupDb.getByGroupId(groupId)
    if (!group) {
      apiLogger.response('PUT', `/api/groups/${groupId}`, 404)
      return res.status(404).json({ error: 'Group not found' })
    }

    if (group.user_id !== user_id) {
      apiLogger.response('PUT', `/api/groups/${groupId}`, 403)
      return res.status(403).json({ error: 'Access denied' })
    }

    // Update group
    groupDb.updateName(groupId, trimmedName)

    apiLogger.response('PUT', `/api/groups/${groupId}`, 200)
    res.json({
      success: true,
      message: 'Group updated successfully'
    })
  } catch (error) {
    apiLogger.error('PUT', `/api/groups/${groupId}`, error as Error)
    res.status(500).json({ error: 'Failed to update group' })
  }
})

/**
 * Delete a group
 */
router.delete('/:groupId', (req: Request, res: Response) => {
  const groupId = String(req.params.groupId)

  apiLogger.request('DELETE', `/api/groups/${groupId}`)

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('DELETE', `/api/groups/${groupId}`, 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id

    // Verify group belongs to user
    const group = groupDb.getByGroupId(groupId)
    if (!group) {
      apiLogger.response('DELETE', `/api/groups/${groupId}`, 404)
      return res.status(404).json({ error: 'Group not found' })
    }

    if (group.user_id !== user_id) {
      apiLogger.response('DELETE', `/api/groups/${groupId}`, 403)
      return res.status(403).json({ error: 'Access denied' })
    }

    // Delete group
    const result = groupDb.delete(groupId)

    apiLogger.response('DELETE', `/api/groups/${groupId}`, 200, { changes: result.changes })
    res.json({
      success: true,
      message: 'Group deleted successfully'
    })
  } catch (error) {
    apiLogger.error('DELETE', `/api/groups/${groupId}`, error as Error)
    res.status(500).json({ error: 'Failed to delete group' })
  }
})

export default router
