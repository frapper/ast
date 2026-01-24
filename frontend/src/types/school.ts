export interface School {
  id?: number
  school_id?: string
  school_name: string
  address?: string
  suburb?: string
  town?: string
  postcode?: string
  phone?: string
  email?: string
  website?: string
  principal?: string
  school_type?: string
  authority?: string
  decile?: number
  roll_number?: number
  gender?: string
  is_primary?: number
  is_secondary?: number
  iscomposite?: number
  org_code?: string
  特区?: string
  local_body?: string
}

export interface GetSchoolsResponse {
  schools: School[]
  count: number
}

export interface RefreshSchoolsResponse {
  success: boolean
  message: string
  count: number
}

export interface DeleteSchoolsResponse {
  success: boolean
  message: string
}
