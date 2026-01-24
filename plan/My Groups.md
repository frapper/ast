# My Groups Feature Plan

## Overview
Add a "My Groups" feature that allows users to create and manage groups within their saved schools. Users can create groups, assign them to specific schools from their "My Schools" list, and manage them through a dedicated groups page.

---

## Implementation Steps

### 1. Database Schema - Groups Table

**Location**: `backend/src/groupDb.ts` (new file)

Create a new table for groups with the following schema:

```typescript
interface Group {
  id: number
  group_id: string        // UUID
  user_id: string         // Foreign key to users
  school_id: string       // Foreign key to schools
  group_name: string      // Name of the group
  created_at: string
  updated_at: string
}
```

**SQL Schema**:
```sql
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  school_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE,
  UNIQUE(user_id, school_id, group_name)
);

CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_school_id ON groups(school_id);
```

**Tasks**:
- [ ] Create `groupDb.ts` with database connection methods
- [ ] Create `groups` table schema
- [ ] Add unique constraint on (user_id, school_id, group_name) to prevent duplicate group names per school
- [ ] Implement CRUD methods (insert, delete, getBySchool, getByUser, update)

---

### 2. Backend - Groups API Endpoints

**Location**: `backend/src/routes/groups.ts` (new file)

**API Endpoints**:

```typescript
// GET /api/groups/school/:schoolId - Get all groups for a specific school
// POST /api/groups - Create a new group
// DELETE /api/groups/:groupId - Delete a group
// PUT /api/groups/:groupId - Update group name
// GET /api/groups/user - Get all groups for current user (grouped by school)
```

**Tasks**:
- [ ] Create `groupsRoutes.ts` with Express router
- [ ] Implement GET /api/groups/school/:schoolId:
  - Get current user from session
  - Return all groups for the specified school
  - Requires authentication
- [ ] Implement POST /api/groups:
  - Validate group_name (not empty, max length)
  - Validate school_id belongs to user's My Schools
  - Create group with unique group_id (UUID)
  - Return created group
- [ ] Implement DELETE /api/groups/:groupId:
  - Verify group belongs to current user
  - Delete group and cascade any related data
  - Return success message
- [ ] Implement PUT /api/groups/:groupId:
  - Verify group belongs to current user
  - Update group_name
  - Return updated group
- [ ] Implement GET /api/groups/user:
  - Get current user from session
  - Return all groups grouped by school
- [ ] Register routes in `backend/src/server.ts`

---

### 3. Frontend - Add Groups Icon to School Cards (My Schools Page)

**Location**: `frontend/src/pages/MySchools.tsx`

**Tasks**:
- [ ] Add "Groups" button/icon to each school card
- [ ] Position in the card footer or alongside the "Remove" button
- [ ] Show group count badge (e.g., "3 Groups")
- [ ] Click handler navigates to groups page for that school
- [ ] Pass school_id and school_name as route params or state

**UI Design**:
```tsx
// In school card footer
<div className="flex gap-2">
  <Button
    variant="outline"
    size="sm"
    className="flex-1"
    onClick={() => handleViewGroups(school)}
  >
    <Users className="mr-1 h-4 w-4" />
    Groups ({groupCounts[school.school_id] || 0})
  </Button>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleRemoveSchool(school.school_id, school.school_name)}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

---

### 4. Frontend - Create Groups Page

**Location**: `frontend/src/pages/Groups.tsx` (new file)

**Component Structure**:
```tsx
// Groups.tsx
- Header with school name and back button
- Two-column layout:
  - Left sidebar (1/3 width): List of groups for this school
  - Right content area (2/3 width):
    - "Create New Group" form
    - OR Selected group details/edit
```

**Tasks**:
- [ ] Create `Groups.tsx` component
- [ ] Get school_id and school_name from route params or navigation state
- [ ] Load groups for this school on mount
- [ ] Display group list in left sidebar
- [ ] Add "Create New Group" button/form
- [ ] Implement create group functionality
- [ ] Implement delete group functionality with confirmation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty state ("No groups yet - create one!")

**Left Sidebar**:
```tsx
<div className="w-1/3 border-r p-4">
  <h3 className="font-semibold mb-4">Groups</h3>
  <div className="space-y-2">
    {groups.map(group => (
      <Card
        key={group.group_id}
        className={selectedGroupId === group.group_id ? 'ring-2 ring-primary' : ''}
        onClick={() => selectGroup(group)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <span>{group.group_name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                deleteGroup(group.group_id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
  <Button
    variant="outline"
    className="w-full mt-4"
    onClick={createNewGroup}
  >
    <Plus className="mr-2 h-4 w-4" />
    New Group
  </Button>
</div>
```

---

### 5. Frontend - Add Route Configuration

**Location**: `frontend/src/App.tsx`

**Tasks**:
- [ ] Import Groups component
- [ ] Add new route: `<Route path="/groups/:schoolId" element={<Groups />} />`
- [ ] Or use state-based navigation: `<Route path="/groups" element={<Groups />} />`

---

### 6. Frontend - API Layer

**Location**: `frontend/src/lib/api.ts`

**Tasks**:
- [ ] Add `groupsApi` object with methods:
  - `getGroupsBySchool(schoolId: string)` - Get groups for a school
  - `createGroup(schoolId: string, groupName: string)` - Create new group
  - `deleteGroup(groupId: string)` - Delete a group
  - `updateGroup(groupId: string, groupName: string)` - Update group name
  - `getAllUserGroups()` - Get all user's groups grouped by school

---

### 7. Frontend - Add Group Illustration Component (Optional)

**Location**: `frontend/src/components/GroupIllustration.tsx` (new file)

**Tasks**:
- [ ] Create illustration component for future use (home page, etc.)
- [ ] Design with multiple user icons or groups icon

---

## File Structure Summary

### New Files to Create

```
backend/
  src/
    groupDb.ts                  # Groups database operations
    routes/
      groups.ts                 # Groups API endpoints

frontend/
  src/
    pages/
      Groups.tsx                # Groups management page
    components/
      GroupIllustration.tsx     # (Optional) Groups icon
```

### Files to Modify

```
backend/
  src/server.ts                 # Register groups routes

frontend/
  src/App.tsx                   # Add /groups route
  src/pages/MySchools.tsx       # Add Groups button to school cards
  src/lib/api.ts                # Add groupsApi methods
```

---

## User Flow

### Viewing Groups for a School
1. User navigates to "My Schools" page
2. User sees a "Groups" button on each school card with group count
3. User clicks "Groups" button on a school card
4. User is taken to `/groups/{schoolId}` page
5. Page shows:
   - School name in header
   - Left sidebar with list of groups for this school
   - "New Group" button
   - Empty state if no groups exist

### Creating a New Group
1. User clicks "New Group" button
2. Input form appears or modal opens
3. User enters group name (required, max 100 characters)
4. User submits form
5. Group is created and added to the list
6. Success message displayed

### Deleting a Group
1. User clicks trash icon next to a group in the list
2. Confirmation dialog appears: "Delete '{group_name}'?"
3. User confirms
4. Group is deleted from database
5. Group is removed from the list
6. Success message displayed

---

## Technical Considerations

### Group Validation
- Group name must not be empty
- Group name max length: 100 characters
- Group name must be unique per school per user
- Trim whitespace from group names

### School Association
- Groups can only be created for schools in user's "My Schools" list
- Backend validates school_id belongs to user before creating group
- If school is removed from "My Schools", cascade delete associated groups

### Performance
- Index user_id and school_id columns for fast queries
- Use UUID for group_id to prevent conflicts
- Consider pagination if user has many groups (future enhancement)

### User Experience
- Show loading states during group operations
- Display group count on school cards
- Persist selected group when navigating
- Quick delete with confirmation (don't make it too easy)
- Empty state with clear call-to-action

---

## Database Schema Details

### SQL for Creating Groups Table

```sql
-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  school_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE,
  UNIQUE(user_id, school_id, group_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_school_id ON groups(school_id);
CREATE INDEX IF NOT EXISTS idx_groups_user_school ON groups(user_id, school_id);
```

---

## Data Flow

### Creating a Group
```
Frontend                    Backend                    Database
    |                          |                          |
    |--POST /api/groups------->|                          |
    |  {school_id, name}       |                          |
    |                          |--INSERT INTO groups----->|
    |                          |                          |
    |<--{group}----------------|                          |
```

### Loading Groups for a School
```
Frontend                    Backend                    Database
    |                          |                          |
    |--GET /api/groups/        |                          |
    |  school/:schoolId------->|                          |
    |                          |--SELECT * FROM groups--->|
    |                          |  WHERE school_id=?       |
    |                          |  AND user_id=?           |
    |                          |                          |
    |<--{groups}---------------|                          |
```

---

## Testing Checklist

### Group Creation
- [ ] Can create a new group from the Groups page
- [ ] Group name is required
- [ ] Group name validation works (max length, no empty names)
- [ ] Cannot create duplicate group names for same school
- [ ] Group appears in the list immediately after creation
- [ ] Group count updates on school card

### Group Deletion
- [ ] Can delete a group from the list
- [ ] Confirmation dialog appears before deletion
- [ ] Group is removed from list after deletion
- [ ] Group count updates on school card
- [ ] Cannot delete groups from other users

### School Association
- [ ] Groups are associated with correct school
- [ ] Groups list filters by selected school
- [ ] Cannot create groups for schools not in "My Schools"
- [ ] Groups are deleted when school is removed from "My Schools" (cascade)

### Navigation
- [ ] Groups button appears on each school card in My Schools
- [ ] Clicking Groups button navigates to correct school's groups
- [ ] Back button returns to My Schools page
- [ ] School name is displayed in header

### Error Handling
- [ ] Shows error if group name is empty
- [ ] Shows error if school not found
- [ ] Shows error if not authenticated
- [ ] Handles network errors gracefully

---

## Future Enhancements (Out of Scope for Initial Implementation)

- Add group description or notes field
- Add students to groups
- Bulk operations on groups
- Group templates (create from template)
- Duplicate group functionality
- Group statistics/dashboard
- Search/filter groups
- Export groups to CSV
- Share groups with other users
- Group history/audit log
- Color coding for groups
- Drag-and-drop to reorder groups
- Sub-groups within groups
