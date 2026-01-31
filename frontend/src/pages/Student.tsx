import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, User, Trash2, Loader2 } from 'lucide-react'
import { studentsApi } from '@/lib/api'
import type { Student } from '@/types/student'

// DMU Ethnicity code descriptions
const ETHNICITY_MAP: Record<string, string> = {
  '111': 'NZ European / Pakeha',
  '121': 'British / Irish',
  '122': 'Dutch',
  '123': 'Greek',
  '124': 'Polish',
  '125': 'South Slav',
  '126': 'Italian',
  '127': 'German',
  '128': 'Australian',
  '129': 'Other European',
  '211': 'Maori',
  '311': 'Samoan',
  '321': 'Cook Island Maori',
  '331': 'Tongan',
  '341': 'Niuean',
  '351': 'Tokelauan',
  '361': 'Fijian',
  '371': 'Other Pacific Peoples',
  '411': 'Filipino',
  '412': 'Cambodian',
  '413': 'Vietnamese',
  '414': 'Other Southeast Asian',
  '421': 'Chinese',
  '431': 'Indian',
  '441': 'Sri Lankan',
  '442': 'Japanese',
  '443': 'Korean',
  '444': 'Other Asian',
  '511': 'Middle Eastern',
  '521': 'Latin American',
  '531': 'African',
  '611': 'Other Ethnicity',
  '999': 'Not Stated'
}

export function Student() {
  const navigate = useNavigate()
  const [studentCount, setStudentCount] = useState(10)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing students on mount
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setError(null)
      const response = await studentsApi.getStudents()
      setStudents(response.students)
    } catch (err) {
      console.error('Error loading students:', err)
      setError('Failed to load students')
    }
  }

  const handleGenerateStudents = async () => {
    if (studentCount < 1 || studentCount > 10000) {
      setError('Please enter a number between 1 and 10000')
      return
    }

    try {
      setError(null)
      setLoading(true)
      const response = await studentsApi.generateStudents(studentCount)
      setStudents(response.students)
    } catch (err) {
      console.error('Error generating students:', err)
      setError('Failed to generate students')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all students?')) {
      return
    }

    try {
      setError(null)
      setLoading(true)
      await studentsApi.deleteStudents()
      setStudents([])
    } catch (err) {
      console.error('Error clearing students:', err)
      setError('Failed to clear students')
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    navigate('/')
  }

  const getEthnicityLabel = (code: string) => {
    return ETHNICITY_MAP[code] || code
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Student Portal</h1>
            <p className="text-muted-foreground">Generate and manage synthetic student data</p>
          </div>
        </div>

        {/* Generator Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <CardTitle>Generate Synthetic Students</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="studentCount" className="block text-sm font-medium mb-2">
                  Number of Students to Create
                </label>
                <Input
                  id="studentCount"
                  type="number"
                  min="1"
                  max="10000"
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
                  placeholder="Enter number of students"
                  disabled={loading}
                />
              </div>
              <Button onClick={handleGenerateStudents} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Create Synthetic'
                )}
              </Button>
              {students.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  disabled={loading}
                  size="lg"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}

            {students.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Total students: <span className="font-semibold text-foreground">{students.length}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Table */}
        {students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Ethnicity</TableHead>
                      <TableHead>NSN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>{student.first_name}</TableCell>
                        <TableCell>{student.last_name}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{getEthnicityLabel(student.ethnicity)}</TableCell>
                        <TableCell>{student.nsn}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {students.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No students generated yet</p>
                <p className="text-sm">
                  Enter the number of students you want to create and click "Create Synthetic"
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
