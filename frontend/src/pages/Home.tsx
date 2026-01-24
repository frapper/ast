import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudentIllustration } from '@/components/StudentIllustration'
import { SchoolIllustration } from '@/components/SchoolIllustration'
import { MySchoolsIllustration } from '@/components/MySchoolsIllustration'
import { GraduationCap, LogOut, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'

export function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState<{ user_id: string; username: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authApi.getMe()
      if (response.success) {
        setUser(response.user)
      }
    } catch (err) {
      // Not logged in, that's ok
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    try {
      setError(null)
      setLoginLoading(true)
      const response = await authApi.login(username.trim())

      if (response.success) {
        setUser(response.user)
        setUsername('')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data?.error || 'Failed to login. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleStudentClick = () => {
    navigate('/student')
  }

  const handleSchoolsClick = () => {
    navigate('/schools')
  }

  const handleMySchoolsClick = () => {
    navigate('/my-schools')
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl font-bold">Welcome</h1>
            <p className="text-xl text-muted-foreground">
              Enter your username to continue
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loginLoading}
                    autoFocus
                    minLength={2}
                    maxLength={50}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose any username to get started
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>This is a simple username-based login for demonstration purposes.</p>
            <p className="mt-1">No password required - just enter any username.</p>
          </div>
        </div>
      </div>
    )
  }

  // Show main content if logged in
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with User Info */}
        <div className="flex items-center justify-between">
          <div className="text-center space-y-4 flex-1">
            <div className="flex justify-center">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold">Welcome to Your Learning Portal</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Hello, <span className="font-semibold text-foreground">{user.username}</span>!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your journey to knowledge starts here. Explore resources, track your progress,
                and achieve your academic goals.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="self-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
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

        {/* Schools Navigation Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Manage Schools</CardTitle>
            <CardDescription>Click the school icon below to access the school directory</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SchoolIllustration onClick={handleSchoolsClick} />
          </CardContent>
        </Card>

        {/* My Schools Navigation Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>My Schools</CardTitle>
            <CardDescription>View your saved schools</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <MySchoolsIllustration onClick={handleMySchoolsClick} />
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
