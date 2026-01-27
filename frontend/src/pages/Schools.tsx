import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SchoolCard, type School } from '@/components/SchoolCard'
import { ArrowLeft, Trash2, Loader2, Building2, Upload, Filter, X, Search } from 'lucide-react'
import { schoolsApi, mySchoolsApi } from '@/lib/api'

export function Schools() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mySchoolIds, setMySchoolIds] = useState<Set<string>>(new Set())
  const [togglingSchool, setTogglingSchool] = useState<string | null>(null)
  const [showOnlyMySchools, setShowOnlyMySchools] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    schoolName: '',
    minRoll: '',
    maxRoll: '',
    schoolType: ''
  })

  // Load existing schools on mount
  useEffect(() => {
    loadSchools()
    loadMySchoolIds()
  }, [])

  // Load user's saved school IDs
  const loadMySchoolIds = async () => {
    try {
      const response = await mySchoolsApi.getSchoolIds()
      setMySchoolIds(new Set(response.schoolIds))
    } catch (err: any) {
      // Ignore auth errors - user might not be logged in
      if (err.response?.status !== 401) {
        console.error('Error loading my school IDs:', err)
      }
    }
  }

  // Get unique school types for filter dropdown
  const schoolTypes = useMemo(() => {
    const types = new Set(schools.map(s => s.school_type).filter(Boolean))
    return Array.from(types).sort()
  }, [schools])

  // Filter schools based on filters
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      // My Schools filter
      if (showOnlyMySchools && !mySchoolIds.has(school.school_id || '')) {
        return false
      }

      // School name filter (wildcard support)
      if (filters.schoolName) {
        const searchLower = filters.schoolName.toLowerCase().replace(/\*/g, '')
        const nameLower = school.school_name.toLowerCase()
        if (!nameLower.includes(searchLower)) {
          return false
        }
      }

      // Roll size filter (min)
      if (filters.minRoll && school.roll_number) {
        if (school.roll_number < parseInt(filters.minRoll)) {
          return false
        }
      }

      // Roll size filter (max)
      if (filters.maxRoll && school.roll_number) {
        if (school.roll_number > parseInt(filters.maxRoll)) {
          return false
        }
      }

      // School type filter
      if (filters.schoolType && school.school_type !== filters.schoolType) {
        return false
      }

      return true
    })
  }, [schools, filters, showOnlyMySchools, mySchoolIds])

  const hasActiveFilters = filters.schoolName || filters.minRoll || filters.maxRoll || filters.schoolType

  const clearFilters = () => {
    setFilters({
      schoolName: '',
      minRoll: '',
      maxRoll: '',
      schoolType: ''
    })
  }

  const loadSchools = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await schoolsApi.getSchools()
      setSchools(response.schools)
    } catch (err) {
      console.error('Error loading schools:', err)
      setError('Failed to load schools')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all schools?')) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      setLoading(true)
      await schoolsApi.deleteSchools()
      setSchools([])
      setSuccess('All schools deleted successfully')
    } catch (err) {
      console.error('Error clearing schools:', err)
      setError('Failed to clear schools')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's a CSV file
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please select a CSV file')
      return
    }

    try {
      setError(null)
      setSuccess(null)
      setUploading(true)
      const response = await schoolsApi.uploadSchools(file)
      setSuccess(response.message)
      // Reload to get the actual data
      await loadSchools()
    } catch (err) {
      console.error('Error uploading schools:', err)
      setError('Failed to upload CSV file. Please check the file format.')
    } finally {
      setUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleGoBack = () => {
    navigate('/')
  }

  const handleToggleMySchool = async (schoolId: string) => {
    const isInList = mySchoolIds.has(schoolId)

    try {
      setTogglingSchool(schoolId)

      if (isInList) {
        await mySchoolsApi.removeSchool(schoolId)
        setMySchoolIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(schoolId)
          return newSet
        })
      } else {
        await mySchoolsApi.addSchool(schoolId)
        setMySchoolIds(prev => new Set(prev).add(schoolId))
      }
    } catch (err: any) {
      console.error('Error toggling school:', err)
      setError(err.response?.data?.error || `Failed to ${isInList ? 'remove' : 'add'} school`)
    } finally {
      setTogglingSchool(null)
    }
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
            <h1 className="text-4xl font-bold">Manage Schools</h1>
            <p className="text-muted-foreground">View and refresh school directory data</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <CardTitle>School Directory</CardTitle>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={handleFileSelect}
                  disabled={uploading}
                  variant="default"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload CSV
                    </>
                  )}
                </Button>
                {schools.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleClearAll}
                    disabled={loading || uploading}
                    size="lg"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
                {success}
              </div>
            )}

            {schools.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Total schools: <span className="font-semibold text-foreground">{schools.length}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Page Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading schools...</p>
            </div>
          </div>
        )}

        {/* Filter Panel */}
        {!loading && schools.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="ml-2"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredSchools.length} of {schools.length} schools
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* My Schools Toggle */}
                <div className="flex items-center gap-2 pb-4 border-b">
                  <input
                    type="checkbox"
                    id="mySchoolsOnly"
                    checked={showOnlyMySchools}
                    onChange={(e) => setShowOnlyMySchools(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <label htmlFor="mySchoolsOnly" className="text-sm font-medium cursor-pointer">
                    Show only my schools ({mySchoolIds.size})
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* School Name Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      School Name
                    </label>
                    <Input
                      placeholder="Search name... (* for wildcard)"
                      value={filters.schoolName}
                      onChange={(e) => setFilters({ ...filters, schoolName: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Use * as wildcard</p>
                </div>

                {/* Min Roll Size Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Roll Size</label>
                  <Input
                    type="number"
                    placeholder="Min students..."
                    value={filters.minRoll}
                    onChange={(e) => setFilters({ ...filters, minRoll: e.target.value })}
                    min="0"
                  />
                </div>

                {/* Max Roll Size Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Roll Size</label>
                  <Input
                    type="number"
                    placeholder="Max students..."
                    value={filters.maxRoll}
                    onChange={(e) => setFilters({ ...filters, maxRoll: e.target.value })}
                    min="0"
                  />
                </div>

                {/* School Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">School Type</label>
                  <select
                    value={filters.schoolType}
                    onChange={(e) => setFilters({ ...filters, schoolType: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All types</option>
                    {schoolTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schools Grid */}
        {!loading && filteredSchools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSchools.map((school) => {
              const isInList = mySchoolIds.has(school.school_id || '')
              const isToggling = togglingSchool === school.school_id

              return (
                <SchoolCard
                  key={school.id || school.school_id}
                  school={school}
                  isInList={isInList}
                  onToggle={() => handleToggleMySchool(school.school_id || '')}
                  isToggling={isToggling}
                />
              )
            })}
          </div>
        ) : !loading && schools.length > 0 && hasActiveFilters ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Filter className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No schools match your filters</p>
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Empty State */}
        {!loading && schools.length === 0 && !uploading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No schools loaded yet</p>
                <p className="text-sm mb-4">
                  Download the school directory CSV from the NZ government data portal and upload it using the "Upload CSV" button
                </p>
                <a
                  href="https://catalogue.data.govt.nz/dataset/c1923d33-e781-46c9-9ea1-d9b850082be4/resource/4b292323-9fcc-41f8-814b-3c7b19cf14b3/download/schooldirectory-02-01-2026-074519.csv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Download School Directory CSV
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
