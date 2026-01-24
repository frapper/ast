import { cn } from '@/lib/utils'

interface MySchoolsIllustrationProps {
  className?: string
  onClick?: () => void
}

export function MySchoolsIllustration({ className, onClick }: MySchoolsIllustrationProps) {
  return (
    <div
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl",
        "border-4 border-primary rounded-2xl p-6 bg-card",
        "hover:border-primary/80",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[200px]"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="hsl(var(--muted))" opacity="0.3" />

        {/* Heart outline */}
        <path
          d="M100 175
            C 100 175, 35 130, 35 85
            C 35 55, 55 40, 75 40
            C 88 40, 95 50, 100 60
            C 105 50, 112 40, 125 40
            C 145 40, 165 55, 165 85
            C 165 130, 100 175, 100 175
            Z"
          fill="hsl(var(--primary))"
          opacity="0.2"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
        />

        {/* Star in the center */}
        <path
          d="M100 65
            L108 88 L132 88 L113 103
            L120 126 L100 113
            L80 126 L87 103
            L68 88 L92 88
            Z"
          fill="hsl(var(--accent))"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Small heart icon at bottom */}
        <path
          d="M100 145
            C 100 145, 92 140, 92 135
            C 92 132, 95 130, 98 130
            C 100 130, 101 132, 100 134
            C 99 132, 100 130, 102 130
            C 105 130, 108 132, 108 135
            C 108 140, 100 145, 100 145
            Z"
          fill="hsl(var(--destructive))"
        />
      </svg>
    </div>
  )
}
