import { Router, Request, Response } from 'express'
import { userDb } from '../userDb.js'
import { schoolDb } from '../schoolDb.js'
import { apiLogger } from '../logger.js'

const router = Router()

/**
 * Get all schools for the current user
 */
router.get('/', (req: Request, res: Response) => {
  apiLogger.request('GET', '/api/my-schools')

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('GET', '/api/my-schools', 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id
    const schools = userDb.getUserSchools(user_id)

    apiLogger.response('GET', '/api/my-schools', 200, { count: schools.length })
    res.json({
      success: true,
      count: schools.length,
      schools
    })
  } catch (error) {
    apiLogger.error('GET', '/api/my-schools', error as Error)
    res.status(500).json({ error: 'Failed to fetch my schools' })
  }
})

/**
 * Add a school to user's list
 */
router.post('/:schoolId', (req: Request, res: Response) => {
  const schoolId = String(req.params.schoolId)

  apiLogger.request('POST', `/api/my-schools/${schoolId}`, {
    sessionExists: !!req.session,
    userExists: !!req.session?.user,
    userId: req.session?.user?.user_id
  })

  try {
    if (!req.session?.user?.user_id) {
      console.log('[DEBUG] Session details:', {
        hasSession: !!req.session,
        sessionId: req.sessionID,
        sessionData: req.session,
        cookie: req.session?.cookie
      })
      apiLogger.response('POST', `/api/my-schools/${schoolId}`, 401, {
        hasSession: !!req.session,
        hasUser: !!req.session?.user
      })
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id

    // Check if school exists
    const schools = schoolDb.getAll()
    const schoolExists = schools.some(s => s.school_id === schoolId)

    if (!schoolExists) {
      apiLogger.response('POST', `/api/my-schools/${schoolId}`, 404, { schoolId })
      return res.status(404).json({ error: 'School not found' })
    }

    // Add school to user's list
    userDb.addSchool({ user_id, school_id: schoolId })

    apiLogger.response('POST', `/api/my-schools/${schoolId}`, 200, { user_id, schoolId })
    res.json({
      success: true,
      message: 'School added to your list'
    })
  } catch (error) {
    // Handle unique constraint violation (already added)
    if ((error as any).code === 'SQLITE_CONSTRAINT') {
      apiLogger.response('POST', `/api/my-schools/${schoolId}`, 409, { schoolId })
      return res.status(409).json({ error: 'School already in your list' })
    }

    apiLogger.error('POST', `/api/my-schools/${schoolId}`, error as Error)
    res.status(500).json({ error: 'Failed to add school' })
  }
})

/**
 * Remove a school from user's list
 */
router.delete('/:schoolId', (req: Request, res: Response) => {
  const schoolId = String(req.params.schoolId)

  apiLogger.request('DELETE', `/api/my-schools/${schoolId}`)

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('DELETE', `/api/my-schools/${schoolId}`, 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id
    const result = userDb.removeSchool(user_id, schoolId)

    if (result.changes === 0) {
      apiLogger.response('DELETE', `/api/my-schools/${schoolId}`, 404, { schoolId })
      return res.status(404).json({ error: 'School not in your list' })
    }

    apiLogger.response('DELETE', `/api/my-schools/${schoolId}`, 200, { user_id, schoolId })
    res.json({
      success: true,
      message: 'School removed from your list'
    })
  } catch (error) {
    apiLogger.error('DELETE', `/api/my-schools/${schoolId}`, error as Error)
    res.status(500).json({ error: 'Failed to remove school' })
  }
})

/**
 * Check if a school is in user's list
 */
router.get('/check/:schoolId', (req: Request, res: Response) => {
  const schoolId = String(req.params.schoolId)

  apiLogger.request('GET', `/api/my-schools/check/${schoolId}`)

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('GET', `/api/my-schools/check/${schoolId}`, 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id
    const isInList = userDb.checkSchool(user_id, schoolId)

    apiLogger.response('GET', `/api/my-schools/check/${schoolId}`, 200, { schoolId, isInList })
    res.json({
      success: true,
      isInList
    })
  } catch (error) {
    apiLogger.error('GET', `/api/my-schools/check/${schoolId}`, error as Error)
    res.status(500).json({ error: 'Failed to check school' })
  }
})

/**
 * Get all school IDs for the current user (for batch checking)
 */
router.get('/school-ids', (req: Request, res: Response) => {
  apiLogger.request('GET', '/api/my-schools/school-ids')

  try {
    if (!req.session?.user?.user_id) {
      apiLogger.response('GET', '/api/my-schools/school-ids', 401)
      return res.status(401).json({ error: 'Authentication required' })
    }

    const user_id = req.session.user.user_id
    const schoolIds = userDb.getUserSchoolIds(user_id)

    apiLogger.response('GET', '/api/my-schools/school-ids', 200, { count: schoolIds.length })
    res.json({
      success: true,
      schoolIds
    })
  } catch (error) {
    apiLogger.error('GET', '/api/my-schools/school-ids', error as Error)
    res.status(500).json({ error: 'Failed to fetch school IDs' })
  }
})

export default router
