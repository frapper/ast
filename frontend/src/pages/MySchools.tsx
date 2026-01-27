import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Heart, Star, Users, MapPin } from 'lucide-react'
import { mySchoolsApi, groupsApi } from '@/lib/api'

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
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({})

  // Load user's schools on mount
  useEffect(() => {
    loadMySchools()
  }, [])

  // Load group counts when schools change
  useEffect(() => {
    if (schools.length > 0) {
      loadGroupCounts()
    }
  }, [schools])

  const loadGroupCounts = async () => {
    const counts: Record<string, number> = {}
    for (const school of schools) {
      if (school.school_id) {
        try {
          const response = await groupsApi.getGroupsBySchool(school.school_id)
          counts[school.school_id] = response.count
        } catch (err) {
          counts[school.school_id] = 0
        }
      }
    }
    setGroupCounts(counts)
  }

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

  const handleViewGroups = (schoolId: string, schoolName: string) => {
    navigate(`/groups/${schoolId}`, { state: { schoolName } })
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
              {schools.map((school) => {
                const groupCount = groupCounts[school.school_id!] || 0
                const isRemoving = removing === school.school_id

                return (
                  <Card
                    key={school.id || school.school_id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewGroups(school.school_id!, school.school_name)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg flex-1">{school.school_name}</CardTitle>
                        <div className="flex items-center gap-1">
                          {/* Group count badge */}
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewGroups(school.school_id!, school.school_name)
                            }}
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>{groupCount}</span>
                          </div>
                          {/* Remove favorite button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveSchool(school.school_id!, school.school_name)
                            }}
                            disabled={isRemoving}
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Star className="h-4 w-4 fill-current" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
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
                  </Card>
                )
              })}
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
