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
  },
  withCredentials: true
})

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
   * Login with username
   */
  async login(username: string) {
    const response = await api.post('/api/auth/login', { username })
    return response.data
  },

  /**
   * Logout
   */
  async logout() {
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

export default api
