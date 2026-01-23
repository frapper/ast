import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudentIllustration } from '@/components/StudentIllustration'
import { GraduationCap } from 'lucide-react'

export function Home() {
  const navigate = useNavigate()

  const handleStudentClick = () => {
    navigate('/student')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold">Welcome to Your Learning Portal</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your journey to knowledge starts here. Explore resources, track your progress,
            and achieve your academic goals.
          </p>
        </div>

        {/* Student Navigation Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Student Portal</CardTitle>
            <CardDescription>Click the student icon below to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <StudentIllustration onClick={handleStudentClick} />
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="text-center">
          <Button size="lg" onClick={handleStudentClick}>
            Go to Student Portal
          </Button>
        </div>
      </div>
    </div>
  )
}
