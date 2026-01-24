import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Loader2, Plus, Trash2, Layers, Check, X } from 'lucide-react'
import { groupsApi } from '@/lib/api'

export interface Group {
  id?: number
  group_id: string
  user_id: string
  school_id: string
  group_name: string
  created_at?: string
  updated_at?: string
}

export function Groups() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const schoolId = params.schoolId || ''
  const schoolName = location.state?.schoolName || 'School'

  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadGroups()
  }, [schoolId])

  const loadGroups = async () => {
    try {
      setError(null)
      const response = await groupsApi.getGroupsBySchool(schoolId)
      setGroups(response.groups)
    } catch (err: any) {
      console.error('Error loading groups:', err)
      if (err.response?.status === 401) {
        setError('Please log in to view groups')
      } else {
        setError('Failed to load groups')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    const trimmedName = newGroupName.trim()

    if (!trimmedName) {
      setError('Please enter a group name')
      return
    }

    if (trimmedName.length > 100) {
      setError('Group name must be 100 characters or less')
      return
    }

    try {
      setError(null)
      setCreating(true)
      await groupsApi.createGroup(schoolId, trimmedName)

      setNewGroupName('')
      setSuccess('Group created successfully')
      await loadGroups()

      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error creating group:', err)
      setError(err.response?.data?.error || 'Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Delete "${groupName}"?`)) {
      return
    }

    try {
      setError(null)
      setDeleting(groupId)
      await groupsApi.deleteGroup(groupId)

      setGroups(prev => prev.filter(g => g.group_id !== groupId))
      setSuccess('Group deleted successfully')

      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error deleting group:', err)
      setError(err.response?.data?.error || 'Failed to delete group')
    } finally {
      setDeleting(null)
    }
  }

  const handleStartEdit = (group: Group) => {
    setEditing(group.group_id)
    setEditValue(group.group_name)
  }

  const handleCancelEdit = () => {
    setEditing(null)
    setEditValue('')
  }

  const handleSaveEdit = async (groupId: string) => {
    const trimmedName = editValue.trim()

    if (!trimmedName) {
      setError('Group name cannot be empty')
      return
    }

    if (trimmedName.length > 100) {
      setError('Group name must be 100 characters or less')
      return
    }

    try {
      setError(null)
      await groupsApi.updateGroup(groupId, trimmedName)

      setGroups(prev => prev.map(g =>
        g.group_id === groupId ? { ...g, group_name: trimmedName } : g
      ))

      setEditing(null)
      setEditValue('')
      setSuccess('Group updated successfully')

      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error updating group:', err)
      setError(err.response?.data?.error || 'Failed to update group')
    }
  }

  const handleGoBack = () => {
    navigate('/my-schools')
  }

  const handleKeyPress = (e: React.KeyboardEvent, groupId?: string) => {
    if (e.key === 'Enter') {
      if (groupId) {
        handleSaveEdit(groupId)
      } else {
        handleCreateGroup()
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Layers className="h-10 w-10 text-primary" />
              Groups
            </h1>
            <p className="text-muted-foreground">for {schoolName}</p>
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

        {/* Success Message */}
        {success && (
          <Card className="border-green-500">
            <CardContent className="pt-6">
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Group List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Groups ({groups.length})</h2>
            </div>

            {loading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading groups...</p>
                  </div>
                </CardContent>
              </Card>
            ) : groups.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No groups yet</p>
                    <p className="text-xs mt-1">Create your first group</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <Card key={group.group_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {editing === group.group_id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, group.group_id)}
                            className="flex-1"
                            maxLength={100}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(group.group_id!)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{group.group_name}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(group)}
                            >
                              <Layers className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.group_id!, group.group_name)}
                              disabled={deleting === group.group_id}
                            >
                              {deleting === group.group_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Create Group Button */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Input
                    placeholder="New group name..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={creating}
                    maxLength={100}
                  />
                  <Button
                    className="w-full"
                    onClick={handleCreateGroup}
                    disabled={creating || !newGroupName.trim()}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        New Group
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground">
              <p>Groups are specific to this school.</p>
              <p>Group names must be unique per school.</p>
            </div>
          </div>

          {/* Right Content - Info/Empty State */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Layers className="h-24 w-24 mx-auto mb-6 text-primary opacity-50" />
                  <h2 className="text-2xl font-semibold mb-3">Manage Your Groups</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Create groups to organize students or classes within {schoolName}.
                    Groups are specific to each school and can be managed from the list on the left.
                  </p>
                  {groups.length > 0 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg inline-block">
                      <p className="text-sm">
                        You have <span className="font-semibold">{groups.length}</span> group{groups.length !== 1 ? 's' : ''} for this school
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
