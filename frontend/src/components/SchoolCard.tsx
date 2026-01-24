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
}

export function SchoolCard({ school }: SchoolCardProps) {
  const formatLocation = () => {
    const parts = [school.suburb, school.town].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Location not available'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{school.school_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{school.address || 'Address not available'}</p>
            <p>{formatLocation()}</p>
            {school.postcode && <p>{school.postcode}</p>}
          </div>
        </div>

        {school.school_type && (
          <div className="text-sm">
            <span className="font-medium">Type:</span> {school.school_type}
          </div>
        )}

        {school.authority && (
          <div className="text-sm">
            <span className="font-medium">Authority:</span> {school.authority}
          </div>
        )}

        {school.roll_number && school.roll_number > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>Roll: {school.roll_number.toLocaleString()}</span>
          </div>
        )}

        {school.decile && school.decile > 0 && (
          <div className="text-sm">
            <span className="font-medium">Decile:</span> {school.decile}
          </div>
        )}

        <div className="pt-2 space-y-1">
          {school.phone && (
            <a
              href={`tel:${school.phone}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Phone className="w-4 h-4" />
              {school.phone}
            </a>
          )}

          {school.email && (
            <a
              href={`mailto:${school.email}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              {school.email}
            </a>
          )}

          {school.website && (
            <a
              href={school.website.startsWith('http') ? school.website : `https://${school.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
