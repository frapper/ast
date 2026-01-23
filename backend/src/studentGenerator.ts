import { faker } from '@faker-js/faker'
import { Student } from './db'

// Student levels
const LEVELS = ['Freshman', 'Sophomore', 'Junior', 'Senior']

// Gender options
const GENDERS = ['Male', 'Female', 'Non-binary', 'Other']

// Ethnicity codes: 1 = English, 2 = Other
const ETHNICITY_CODES = ['1', '2']

/**
 * Generate a random NSN (9-digit number)
 */
function generateNSN(): string {
  return faker.string.numeric({ length: 9, allowLeadingZeros: true })
}

/**
 * Generate a random student
 */
export function generateStudent(): Student {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const studentId = `STU-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`
  const level = faker.helpers.arrayElement(LEVELS)
  const gender = faker.helpers.arrayElement(GENDERS)
  const ethnicity = faker.helpers.arrayElement(ETHNICITY_CODES)
  const nsn = generateNSN()

  return {
    student_id: studentId,
    first_name: firstName,
    last_name: lastName,
    level,
    ethnicity,
    gender,
    nsn
  }
}

/**
 * Generate N random students
 */
export function generateStudents(count: number): Student[] {
  const students: Student[] = []
  const usedNSNs = new Set<string>()
  const usedStudentIds = new Set<string>()

  for (let i = 0; i < count; i++) {
    let student: Student
    let attempts = 0
    const maxAttempts = 100

    // Ensure uniqueness
    do {
      student = generateStudent()
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
