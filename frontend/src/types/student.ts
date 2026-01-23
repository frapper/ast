export interface Student {
  student_id: string
  first_name: string
  last_name: string
  level: string
  ethnicity: string
  gender: string
  nsn: string
}

export interface GenerateStudentsResponse {
  success: boolean
  count: number
  students: Student[]
}

export interface GetStudentsResponse {
  success: boolean
  count: number
  students: Student[]
}

export interface DeleteStudentsResponse {
  success: boolean
  message: string
}

export interface ErrorResponse {
  error: string
}
