import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Heart, Zap, Settings, User, ChevronRight } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">UI Framework Demo</h1>
          <p className="text-muted-foreground">
            Tailwind CSS + shadcn/ui + Lucide Icons
          </p>
        </div>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Different button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Icon Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Icon Buttons</CardTitle>
            <CardDescription>Buttons with Lucide icons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button variant="secondary">
                <Heart className="mr-2 h-4 w-4" />
                Like
              </Button>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button size="icon">
                <Zap className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Counter</CardTitle>
            <CardDescription>State management with UI components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCount((c) => c - 1)}
              >
                -
              </Button>
              <div className="text-2xl font-bold w-16 text-center">{count}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCount((c) => c + 1)}
              >
                +
              </Button>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setCount(0)}
            >
              Reset
            </Button>
          </CardContent>
        </Card>

        {/* Icon Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Icon Library</CardTitle>
            <CardDescription>A small sample of Lucide icons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-4">
              <div className="flex flex-col items-center gap-1">
                <Github className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Github</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Heart className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Heart</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Zap className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Zap</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Settings className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Settings</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <User className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">User</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ChevronRight className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Arrow</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Built with React 19, TypeScript, Tailwind CSS, shadcn/ui, and Lucide Icons
        </div>
      </div>
    </div>
  )
}

export default App
