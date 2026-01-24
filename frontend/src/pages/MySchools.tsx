import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Heart, Trash2, MapPin, Users } from 'lucide-react'
import { mySchoolsApi } from '@/lib/api'

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

export function MySchools() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load user's schools on mount
  useEffect(() => {
    loadMySchools()
  }, [])

  const loadMySchools = async () => {
    try {
      setError(null)
      const response = await mySchoolsApi.getMySchools()
      setSchools(response.schools)
    } catch (err: any) {
      console.error('Error loading my schools:', err)
      if (err.response?.status === 401) {
        setError('Please log in to view your schools')
        navigate('/login')
      } else {
        setError('Failed to load your schools')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSchool = async (schoolId: string, schoolName: string) => {
    if (!confirm(`Remove "${schoolName}" from your schools?`)) {
      return
    }

    try {
      setError(null)
      setRemoving(schoolId)
      await mySchoolsApi.removeSchool(schoolId)

      // Remove from local state
      setSchools(prev => prev.filter(s => s.school_id !== schoolId))
    } catch (err: any) {
      console.error('Error removing school:', err)
      setError(err.response?.data?.error || 'Failed to remove school')
    } finally {
      setRemoving(null)
    }
  }

  const handleBrowseSchools = () => {
    navigate('/schools')
  }

  const handleGoBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Heart className="h-10 w-10 text-primary fill-primary" />
              My Schools
            </h1>
            <p className="text-muted-foreground">Your saved schools</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your schools...</p>
              </div>
            </CardContent>
          </Card>
        ) : schools.length > 0 ? (
          <>
            {/* Count Display */}
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  You have <span className="font-semibold text-foreground">{schools.length}</span> school{schools.length !== 1 ? 's' : ''} saved
                </p>
              </CardContent>
            </Card>

            {/* Schools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {schools.map((school) => (
                <Card key={school.id || school.school_id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{school.school_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{school.address || 'Address not available'}</p>
                        <p>{[school.suburb, school.town].filter(Boolean).join(', ') || 'Location not available'}</p>
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
                  </CardContent>
                  <CardContent className="pt-0 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRemoveSchool(school.school_id!, school.school_name)}
                      disabled={removing === school.school_id}
                    >
                      {removing === school.school_id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No schools saved yet</p>
                <p className="text-sm mb-4">
                  Browse the school directory and add schools to your list
                </p>
                <Button onClick={handleBrowseSchools} size="lg">
                  Browse Schools
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
