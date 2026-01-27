import axios from 'axios'
import type {
  GenerateStudentsResponse,
  GetStudentsResponse,
  DeleteStudentsResponse,
} from '@/types/student'
import type {
  GetSchoolsResponse,
  RefreshSchoolsResponse,
  DeleteSchoolsResponse,
} from '@/types/school'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const studentsApi = {
  /**
   * Generate synthetic students
   */
  async generateStudents(count: number): Promise<GenerateStudentsResponse> {
    const response = await api.post<GenerateStudentsResponse>('/api/students/generate', { count })
    return response.data
  },

  /**
   * Get all students
   */
  async getStudents(): Promise<GetStudentsResponse> {
    const response = await api.get<GetStudentsResponse>('/api/students')
    return response.data
  },

  /**
   * Delete all students
   */
  async deleteStudents(): Promise<DeleteStudentsResponse> {
    const response = await api.delete<DeleteStudentsResponse>('/api/students')
    return response.data
  }
}

export const schoolsApi = {
  /**
   * Get all schools
   */
  async getSchools(): Promise<GetSchoolsResponse> {
    const response = await api.get<GetSchoolsResponse>('/api/schools')
    return response.data
  },

  /**
   * Refresh schools from remote CSV
   */
  async refreshSchools(): Promise<RefreshSchoolsResponse> {
    const response = await api.post<RefreshSchoolsResponse>('/api/schools/refresh')
    return response.data
  },

  /**
   * Upload CSV file
   */
  async uploadSchools(file: File): Promise<RefreshSchoolsResponse> {
    const formData = new FormData()
    formData.append('csvFile', file)

    const response = await api.post<RefreshSchoolsResponse>('/api/schools/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Delete all schools
   */
  async deleteSchools(): Promise<DeleteSchoolsResponse> {
    const response = await api.delete<DeleteSchoolsResponse>('/api/schools')
    return response.data
  }
}

export const authApi = {
  /**
   * Login with email
   */
  async login(email: string) {
    const response = await api.post('/api/auth/login', { email })
    return response.data
  },

  /**
   * Logout
   */
  async logout() {
    // Remove token from localStorage
    localStorage.removeItem('auth_token')
    const response = await api.post('/api/auth/logout')
    return response.data
  },

  /**
   * Get current user
   */
  async getMe() {
    const response = await api.get('/api/auth/me')
    return response.data
  }
}

export const mySchoolsApi = {
  /**
   * Get user's saved schools
   */
  async getMySchools() {
    const response = await api.get('/api/my-schools')
    return response.data
  },

  /**
   * Add school to user's list
   */
  async addSchool(schoolId: string) {
    const response = await api.post(`/api/my-schools/${schoolId}`)
    return response.data
  },

  /**
   * Remove school from user's list
   */
  async removeSchool(schoolId: string) {
    const response = await api.delete(`/api/my-schools/${schoolId}`)
    return response.data
  },

  /**
   * Check if school is in user's list
   */
  async checkSchool(schoolId: string) {
    const response = await api.get(`/api/my-schools/check/${schoolId}`)
    return response.data
  },

  /**
   * Get all user's school IDs
   */
  async getSchoolIds() {
    const response = await api.get('/api/my-schools/school-ids')
    return response.data
  }
}

export const groupsApi = {
  /**
   * Get groups for a specific school
   */
  async getGroupsBySchool(schoolId: string) {
    const response = await api.get(`/api/groups/school/${schoolId}`)
    return response.data
  },

  /**
   * Get all groups for current user
   */
  async getAllUserGroups() {
    const response = await api.get('/api/groups/user')
    return response.data
  },

  /**
   * Create a new group
   */
  async createGroup(schoolId: string, groupName: string) {
    const response = await api.post('/api/groups', { school_id: schoolId, group_name: groupName })
    return response.data
  },

  /**
   * Update group name
   */
  async updateGroup(groupId: string, groupName: string) {
    const response = await api.put(`/api/groups/${groupId}`, { group_name: groupName })
    return response.data
  },

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string) {
    const response = await api.delete(`/api/groups/${groupId}`)
    return response.data
  },

  /**
   * Get students for a specific group
   */
  async getGroupStudents(groupId: string) {
    const response = await api.get(`/api/groups/${groupId}/students`)
    return response.data
  },

  /**
   * Generate synthetic students for a specific group
   */
  async generateStudentsForGroup(groupId: string, count: number) {
    const response = await api.post(`/api/groups/${groupId}/students/generate`, { count })
    return response.data
  },

  /**
   * Remove a student from a group
   */
  async removeStudentFromGroup(groupId: string, studentId: string) {
    const response = await api.delete(`/api/groups/${groupId}/students/${studentId}`)
    return response.data
  }
}

export const astApi = {
  /**
   * Generate AST file content
   */
  async generateAST(schoolId: string, schoolName: string, groupId?: string) {
    const response = await api.post('/api/ast/generate', {
      schoolId,
      schoolName,
      groupId
    }, {
      responseType: 'text'
    })
    return response.data
  },

  /**
   * Download AST file
   */
  async downloadAST(schoolId: string, schoolName: string, groupId?: string) {
    const response = await api.post('/api/ast/download', {
      schoolId,
      schoolName,
      groupId
    }, {
      responseType: 'blob'
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    const timestamp = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `AST_${schoolId}_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return { success: true }
  }
}

export default api
