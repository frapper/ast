import { cn } from '@/lib/utils'

interface SchoolIllustrationProps {
  className?: string
  onClick?: () => void
}

export function SchoolIllustration({ className, onClick }: SchoolIllustrationProps) {
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

        {/* School building */}
        <rect x="50" y="80" width="100" height="70" rx="2" fill="hsl(var(--primary))" />

        {/* Roof */}
        <path
          d="M40 80 L100 40 L160 80"
          fill="hsl(var(--accent))"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Flag on top */}
        <rect x="95" y="25" width="10" height="15" fill="hsl(var(--muted-foreground))" />
        <rect x="105" y="25" width="20" height="12" fill="hsl(var(--destructive))" />

        {/* Door */}
        <rect x="85" y="110" width="30" height="40" rx="2" fill="hsl(var(--background))" />
        <circle cx="108" cy="132" r="2" fill="hsl(var(--muted-foreground))" />

        {/* Windows */}
        <rect x="60" y="95" width="18" height="18" rx="2" fill="hsl(var(--background))" />
        <line x1="69" y1="95" x2="69" y2="113" stroke="hsl(var(--primary))" strokeWidth="2" />
        <line x1="60" y1="104" x2="78" y2="104" stroke="hsl(var(--primary))" strokeWidth="2" />

        <rect x="122" y="95" width="18" height="18" rx="2" fill="hsl(var(--background))" />
        <line x1="131" y1="95" x2="131" y2="113" stroke="hsl(var(--primary))" strokeWidth="2" />
        <line x1="122" y1="104" x2="140" y2="104" stroke="hsl(var(--primary))" strokeWidth="2" />

        {/* Steps */}
        <rect x="80" y="150" width="40" height="5" fill="hsl(var(--muted))" />
        <rect x="75" y="155" width="50" height="5" fill="hsl(var(--muted))" />
      </svg>
    </div>
  )
}
