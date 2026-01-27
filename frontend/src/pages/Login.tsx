import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError('Please enter your email')
      return
    }

    try {
      setError(null)
      setLoading(true)
      const response = await authApi.login(username.trim())

      if (response.success) {
        // Store the JWT token
        localStorage.setItem('auth_token', response.token)
        // Redirect to home page
        navigate('/')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data?.error || 'Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <LogIn className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Welcome</CardTitle>
            <CardDescription>Enter your email to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="username"
                  type="email"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoFocus
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter your email address to get started
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>This is a simple email-based login for demonstration purposes.</p>
          <p className="mt-1">No password required - just enter your email address.</p>
        </div>
      </div>
    </div>
  )
}
