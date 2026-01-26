import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Phone, Mail, Globe, Users } from 'lucide-react'

export interface School {
  id?: number
  school_id?: string
  school_name: string
  address?: string
  suburb?: string
  town?: string
  postcode?: string
  phone?: string
  email?: string
  website?: string
  principal?: string
  school_type?: string
  authority?: string
  decile?: number
  roll_number?: number
  gender?: string
  is_primary?: number
  is_secondary?: number
  iscomposite?: number
  org_code?: string
  特区?: string
  local_body?: string
}

interface SchoolCardProps {
  school: School
  isInList?: boolean
}

export function SchoolCard({ school, isInList }: SchoolCardProps) {
  const formatLocation = () => {
    const parts = [school.suburb, school.town].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Not available'
  }

  return (
    <Card className={`hover:shadow-md transition-shadow h-full flex flex-col ${
      isInList ? 'bg-blue-50 dark:bg-blue-950' : ''
    }`}>
      <CardHeader>
        <CardTitle className="text-lg">{school.school_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{school.address || 'Not available'}</p>
            <p>{formatLocation()}</p>
            <p>{school.postcode || 'Not available'}</p>
          </div>
        </div>

        <div className="text-sm">
          <span className="font-medium">Type:</span>{' '}
          {school.school_type || 'Not available'}
        </div>

        <div className="text-sm">
          <span className="font-medium">Authority:</span>{' '}
          {school.authority || 'Not available'}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4" />
          <span>Roll: {school.roll_number ? school.roll_number.toLocaleString() : 'Not available'}</span>
        </div>

        <div className="text-sm">
          <span className="font-medium">Decile:</span>{' '}
          {school.decile && school.decile > 0 ? school.decile : 'Not available'}
        </div>

        <div className="text-sm">
          <span className="font-medium">Gender:</span>{' '}
          {school.gender || 'Not available'}
        </div>

        <div className="text-sm">
          <span className="font-medium">Principal:</span>{' '}
          {school.principal || 'Not available'}
        </div>

        <div className="pt-2 space-y-1 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4" />
            {school.phone ? (
              <a
                href={`tel:${school.phone}`}
                className="text-primary hover:underline"
              >
                {school.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">Not available</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4" />
            {school.email ? (
              <a
                href={`mailto:${school.email}`}
                className="text-primary hover:underline"
              >
                {school.email}
              </a>
            ) : (
              <span className="text-muted-foreground">Not available</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4" />
            {school.website ? (
              <a
                href={school.website.startsWith('http') ? school.website : `https://${school.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Website
              </a>
            ) : (
              <span className="text-muted-foreground">Not available</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
