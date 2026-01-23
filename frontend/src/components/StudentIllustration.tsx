import { cn } from '@/lib/utils'

interface StudentIllustrationProps {
  className?: string
  onClick?: () => void
}

export function StudentIllustration({ className, onClick }: StudentIllustrationProps) {
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

        {/* Body */}
        <path
          d="M60 160 Q60 120 100 120 Q140 120 140 160 L140 180 L60 180 Z"
          fill="hsl(var(--primary))"
        />

        {/* Head */}
        <circle cx="100" cy="75" r="30" fill="hsl(var(--primary))" />

        {/* Face details */}
        {/* Eyes */}
        <circle cx="88" cy="72" r="4" fill="hsl(var(--background))" />
        <circle cx="112" cy="72" r="4" fill="hsl(var(--background))" />

        {/* Smile */}
        <path
          d="M88 82 Q100 92 112 82"
          stroke="hsl(var(--background))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Hair/Graduation cap */}
        <rect x="75" y="45" width="50" height="8" rx="2" fill="hsl(var(--accent))" />
        <rect x="95" y="38" width="10" height="10" fill="hsl(var(--accent))" />
        <ellipse cx="100" cy="50" rx="28" ry="6" fill="hsl(var(--accent))" />

        {/* Tassel */}
        <line x1="105" y1="44" x2="105" y2="60" stroke="hsl(var(--accent-foreground))" strokeWidth="2" />
        <circle cx="105" cy="62" r="3" fill="hsl(var(--accent-foreground))" />

        {/* Book in hand */}
        <rect x="55" y="135" width="25" height="18" rx="2" fill="hsl(var(--accent))" />
        <line x1="67.5" y1="135" x2="67.5" y2="153" stroke="hsl(var(--background))" strokeWidth="1" />
      </svg>
    </div>
  )
}
