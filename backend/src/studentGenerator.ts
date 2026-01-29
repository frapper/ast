import { faker } from '@faker-js/faker'
import { Student } from './db.js'

// Student levels
const LEVELS = ['Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10']

// Gender options
const GENDERS = ['Male', 'Female', 'Non-binary', 'Other']

// Ethnicity codes: 1 = English, 2 = Other
const ETHNICITY_CODES = ['1', '2']

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
  const ethnicity = faker.helpers.arrayElement(ETHNICITY_CODES)
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
    nsn
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
