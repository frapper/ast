import axios from 'axios'
import type {
  GenerateStudentsResponse,
  GetStudentsResponse,
  DeleteStudentsResponse,
} from '@/types/student'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

export default api
