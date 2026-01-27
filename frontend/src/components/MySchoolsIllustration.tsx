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
        width="300"
        height="300"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ color: 'hsl(var(--primary))' }}
      >
        {/* Heart background */}
        <path
          d="M100 185
            C 100 185, 25 140, 25 85
            C 25 50, 50 30, 75 30
            C 90 30, 95 42, 100 55
            C 105 42, 110 30, 125 30
            C 150 30, 175 50, 175 85
            C 175 140, 100 185, 100 185
            Z"
          fill="currentColor"
          opacity="0.1"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Left School (smallest, behind) */}
        <g opacity="0.7">
          {/* Building */}
          <rect x="25" y="95" width="40" height="50" rx="2"
            fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" />
          {/* Roof */}
          <path d="M20 95 L45 75 L70 95"
            fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Door */}
          <rect x="35" y="115" width="16" height="30" rx="1"
            fill="white" stroke="currentColor" strokeWidth="2" />
          {/* Window */}
          <rect x="30" y="105" width="10" height="10" rx="1"
            fill="white" stroke="currentColor" strokeWidth="2" />
          <rect x="50" y="105" width="10" height="10" rx="1"
            fill="white" stroke="currentColor" strokeWidth="2" />
        </g>

        {/* Right School (medium, middle) */}
        <g opacity="0.85">
          {/* Building */}
          <rect x="135" y="90" width="45" height="55" rx="2"
            fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" />
          {/* Roof */}
          <path d="M130 90 L157.5 68 L185 90"
            fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Flag */}
          <line x1="157.5" y1="68" x2="157.5" y2="55" stroke="currentColor" strokeWidth="2" />
          <rect x="157.5" y="55" width="14" height="10" rx="1"
            fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
          {/* Door */}
          <rect x="148" y="110" width="19" height="35" rx="1"
            fill="white" stroke="currentColor" strokeWidth="2" />
          {/* Windows */}
          <rect x="142" y="100" width="12" height="12" rx="1"
            fill="white" stroke="currentColor" strokeWidth="2" />
          <rect x="161" y="100" width="12" height="12" rx="1"
            fill="white" stroke="currentColor" strokeWidth="2" />
        </g>

        {/* Center School (largest, front) */}
        <g>
          {/* Building */}
          <rect x="65" y="80" width="70" height="70" rx="2"
            fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3" />
          {/* Roof */}
          <path d="M58 80 L100 48 L142 80"
            fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          {/* Flag pole and flag */}
          <line x1="100" y1="48" x2="100" y2="32" stroke="currentColor" strokeWidth="2.5" />
          <rect x="100" y="32" width="18" height="13" rx="1"
            fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
          {/* Door */}
          <rect x="82" y="105" width="36" height="45" rx="2"
            fill="white" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="108" cy="130" r="2.5" fill="currentColor" />
          {/* Windows */}
          <rect x="72" y="92" width="16" height="16" rx="1"
            fill="white" stroke="currentColor" strokeWidth="2" />
          <line x1="80" y1="92" x2="80" y2="108" stroke="currentColor" strokeWidth="2" />
          <line x1="72" y1="100" x2="88" y2="100" stroke="currentColor" strokeWidth="2" />

          <rect x="112" y="92" width="16" height="16" rx="1"
            fill="white" stroke="currentColor" strokeWidth="2" />
          <line x1="120" y1="92" x2="120" y2="108" stroke="currentColor" strokeWidth="2" />
          <line x1="112" y1="100" x2="128" y2="100" stroke="currentColor" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}
