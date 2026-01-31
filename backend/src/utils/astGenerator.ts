import type { Student } from '../db.js'

export interface ASTGenerationOptions {
  schoolId: string
  schoolName: string
  groupId?: string
  year?: number
  groupName?: string
}

export interface GroupStudents {
  group_id: string
  group_name: string
  students: Student[]
}

/**
 * Generate AST CSV file from student and group data
 * Format: Simplified CSV with Class, Student, Student_Class sections
 */
export function generateASTFile(
  groups: GroupStudents[],
  options: ASTGenerationOptions
): string {
  const { schoolId } = options

  const lines: string[] = []

  // SECTION: Header
  lines.push('SECTION,Header')
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23)
  lines.push(`ast.csv,${timestamp},1`)
  lines.push('SECTION,Import_Type')
  lines.push('Class')

  // SECTION: School
  lines.push('SECTION,School,ROWS,1')
  lines.push(schoolId)

  // Collect all unique students and create a local ID mapping
  const allStudents = new Map<string, Student>()
  for (const group of groups) {
    for (const student of group.students) {
      allStudents.set(student.student_id, student)
    }
  }

  // Create local ID for each student (sequential starting from 1)
  const studentLocalIds = new Map<string, number>()
  let localId = 1
  for (const student of allStudents.values()) {
    studentLocalIds.set(student.student_id, localId++)
  }

  // SECTION: Class
  lines.push('SECTION,Class,ROWS,' + groups.length)
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    // Use sequential class IDs starting from 1
    const classId = i + 1
    lines.push(`${classId},${escapeCSV(group.group_name)},Y`)
  }

  // SECTION: Student
  lines.push('SECTION,Student,ROWS,' + allStudents.size)
  for (const student of allStudents.values()) {
    const localId = studentLocalIds.get(student.student_id)!
    const yearLevel = extractYearLevel(student.level)
    const gender = mapGenderCode(student.gender)
    // Convert language: '999' becomes blank for AST output
    const languageForAST = student.language === '999' ? '' : student.language
    // Format: local_id,nsn,last_name,first_name,year_level,gender,language,ethnicity
    lines.push(`${localId},${student.nsn},${escapeCSV(student.last_name)},${escapeCSV(student.first_name)},${yearLevel},${gender},${languageForAST},${student.ethnicity}`)
  }

  // SECTION: Student_Class (link students to their classes)
  const studentClassLinks: string[] = []
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    const classId = i + 1
    for (const student of group.students) {
      const localId = studentLocalIds.get(student.student_id)!
      // Format: local_id,nsn,class_id
      studentClassLinks.push(`${localId},${student.nsn},${classId}`)
    }
  }

  lines.push('SECTION,Student_Class,ROWS,' + studentClassLinks.length)
  lines.push(...studentClassLinks)

  // SECTION: Footer
  lines.push('SECTION,Footer')
  lines.push('ast.csv')

  return lines.join('\n') + '\n'
}

function escapeCSV(str: string): string {
  // Escape quotes by doubling them
  return str.replace(/"/g, '""')
}

function mapGenderCode(gender: string): string {
  const g = gender.toLowerCase()
  if (g === 'male') return 'M'
  if (g === 'female') return 'F'
  return 'N'  // Non-binary or Other
}

function extractYearLevel(level: string): number {
  const match = level.match(/Year (\d+)/i)
  return match ? parseInt(match[1]) : 3  // Default to Year 3
}
