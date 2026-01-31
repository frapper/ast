import { faker } from '@faker-js/faker'
import { Student } from './db.js'

// Student levels
const LEVELS = ['Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10']

// Gender options
const GENDERS = ['Male', 'Female', 'Non-binary', 'Other']

// DMU Ethnicity codes from asTTle specification
export interface EthnicityCode {
  DMU: string
  Description: string
}

export const ETHNICITY_CODES: EthnicityCode[] = [
  { DMU: '111', Description: 'NZ European / Pakeha' },
  { DMU: '121', Description: 'British / Irish' },
  { DMU: '122', Description: 'Dutch' },
  { DMU: '123', Description: 'Greek' },
  { DMU: '124', Description: 'Polish' },
  { DMU: '125', Description: 'South Slav' },
  { DMU: '126', Description: 'Italian' },
  { DMU: '127', Description: 'German' },
  { DMU: '128', Description: 'Australian' },
  { DMU: '129', Description: 'Other European' },
  { DMU: '211', Description: 'Maori' },
  { DMU: '311', Description: 'Samoan' },
  { DMU: '321', Description: 'Cook Island Maori' },
  { DMU: '331', Description: 'Tongan' },
  { DMU: '341', Description: 'Niuean' },
  { DMU: '351', Description: 'Tokelauan' },
  { DMU: '361', Description: 'Fijian' },
  { DMU: '371', Description: 'Other Pacific Peoples' },
  { DMU: '411', Description: 'Filipino' },
  { DMU: '412', Description: 'Cambodian' },
  { DMU: '413', Description: 'Vietnamese' },
  { DMU: '414', Description: 'Other Southeast Asian' },
  { DMU: '421', Description: 'Chinese' },
  { DMU: '431', Description: 'Indian' },
  { DMU: '441', Description: 'Sri Lankan' },
  { DMU: '442', Description: 'Japanese' },
  { DMU: '443', Description: 'Korean' },
  { DMU: '444', Description: 'Other Asian' },
  { DMU: '511', Description: 'Middle Eastern' },
  { DMU: '521', Description: 'Latin American' },
  { DMU: '531', Description: 'African' },
  { DMU: '611', Description: 'Other Ethnicity' },
  { DMU: '999', Description: 'Not Stated' }
]

// Language codes: 1=English, 2=Other than English, 999=Unknown
export interface LanguageCode {
  code: string
  description: string
}

export const LANGUAGE_CODES: LanguageCode[] = [
  { code: '1', description: 'English' },
  { code: '2', description: 'Other than English' },
  { code: '999', description: 'Unknown' }
]

export interface StudentGenerationOptions {
  suffix?: string
  fixedYear?: number
  badNSNCount?: number
}

/**
 * Calculate NSN check digit using mod 11 algorithm
 * Weights: 2, 3, 4, 5, 6, 7, 8, 9, 10 (for positions 1-9)
 */
function calculateNSNCheckDigit(digits: string): string {
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 10]
  let sum = 0

  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i]) * weights[i]
  }

  const remainder = sum % 11
  const checkDigit = (11 - remainder) % 10

  return checkDigit.toString()
}

/**
 * Generate a random NSN (9-digit number) with valid mod 11 checksum
 * If makeBad is true, generates an NSN with invalid checksum
 */
function generateNSN(makeBad = false): string {
  // Generate first 8 digits
  const first8 = faker.string.numeric({ length: 8, allowLeadingZeros: true })

  // Calculate check digit
  const checkDigit = calculateNSNCheckDigit(first8)

  if (makeBad) {
    // Return NSN with wrong check digit (add 1, wrap around at 10)
    const badCheckDigit = ((parseInt(checkDigit) + 1) % 10).toString()
    return first8 + badCheckDigit
  }

  return first8 + checkDigit
}

/**
 * Generate a random student
 */
export function generateStudent(options?: StudentGenerationOptions, makeBadNSN = false): Student {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const studentId = `STU-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`

  // Use fixed year if provided, otherwise random level
  const level = options?.fixedYear
    ? `Year ${options.fixedYear}`
    : faker.helpers.arrayElement(LEVELS)

  const gender = faker.helpers.arrayElement(GENDERS)
  const ethnicityObj = faker.helpers.arrayElement(ETHNICITY_CODES)
  const ethnicity = ethnicityObj.DMU
  const languageObj = faker.helpers.arrayElement(LANGUAGE_CODES)
  const language = languageObj.code
  const nsn = generateNSN(makeBadNSN)

  // Apply suffix to last name if provided
  const suffixedLastName = options?.suffix
    ? `${lastName}-${options.suffix}`
    : lastName

  return {
    student_id: studentId,
    first_name: firstName,
    last_name: suffixedLastName,
    level,
    ethnicity,
    gender,
    nsn,
    language
  }
}

/**
 * Generate N random students
 */
export function generateStudents(
  count: number,
  existingNSNs: string[] = [],
  options?: StudentGenerationOptions
): Student[] {
  const students: Student[] = []
  const usedNSNs = new Set(existingNSNs)
  const usedStudentIds = new Set<string>()
  const badNSNCount = options?.badNSNCount || 0

  for (let i = 0; i < count; i++) {
    let student: Student
    let attempts = 0
    const maxAttempts = 100

    // Determine if this student should have a bad NSN
    const makeBadNSN = i < badNSNCount

    // Ensure uniqueness
    do {
      student = generateStudent(options, makeBadNSN)
      attempts++
    } while (
      (usedNSNs.has(student.nsn) || usedStudentIds.has(student.student_id)) &&
      attempts < maxAttempts
    )

    if (attempts < maxAttempts) {
      usedNSNs.add(student.nsn)
      usedStudentIds.add(student.student_id)
      students.push(student)
    }
  }

  return students
}
