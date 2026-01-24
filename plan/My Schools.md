# My Schools Feature Plan

## Overview
Add a "My Schools" feature that allows each user to create and manage their own personalized list of schools from the main school directory. Users can add/remove schools from their favorites list and view them on a dedicated page.

---

## Implementation Steps

### 1. Database Schema - User Management & My Schools

**Location**: `backend/src/userDb.ts` (new file)

First, we need to support multi-user authentication and store user-specific school selections.

#### Users Table

```typescript
interface User {
  id: number
  user_id: string        // UUID or unique identifier
  username: string
  email?: string
  created_at: string
  last_login: string
}
```

#### User Schools Table (Junction Table)

```typescript
interface UserSchool {
  id: number
  user_id: string       // Foreign key to users
  school_id: string     // Foreign key to schools (from existing schools table)
  added_at: string      // Timestamp when added
  notes?: string        // Optional notes field for future use
}
```

**Tasks**:
- [ ] Create `userDb.ts` with database connection methods
- [ ] Create `users` table schema
- [ ] Create `user_schools` table schema
- [ ] Add unique constraint on (user_id, school_id) to prevent duplicates
- [ ] Implement CRUD methods for user schools

---

### 2. Backend - Authentication & User Context

**Location**: `backend/src/middleware/auth.ts` (new file)

Since this is a multi-user system, we need basic authentication to identify users.

**Options**:
1. **Simple approach**: Use session-based auth with a username (no password for prototype)
2. **Standard approach**: JWT-based authentication
3. **Future**: OAuth integration

For initial implementation, use a simple session-based approach:

**Tasks**:
- [ ] Install express-session and related dependencies
- [ ] Create authentication middleware
- [ ] Add session configuration to server
- [ ] Create login/logout endpoints
- [ ] Add current user context to requests

---

### 3. Backend - My Schools API Endpoints

**Location**: `backend/src/routes/mySchools.ts` (new file)

**API Endpoints**:

```typescript
// GET /api/my-schools - Get current user's saved schools
// POST /api/my-schools/:schoolId - Add a school to user's list
// DELETE /api/my-schools/:schoolId - Remove a school from user's list
// GET /api/my-schools/check/:schoolId - Check if school is in user's list
```

**Tasks**:
- [ ] Create `mySchoolsRoutes.ts` with Express router
- [ ] Implement GET /api/my-schools:
  - Get current user from session
  - Join user_schools with schools table
  - Return list of schools with user-specific data
- [ ] Implement POST /api/my-schools/:schoolId:
  - Validate school exists in schools table
  - Check for duplicates
  - Add to user_schools table
  - Return success message
- [ ] Implement DELETE /api/my-schools/:schoolId:
  - Remove from user_schools table for current user
  - Return success message
- [ ] Implement GET /api/my-schools/check/:schoolId:
  - Return boolean indicating if school is in user's list
- [ ] Register routes in `backend/src/server.ts`

---

### 4. Frontend - Add "Add to My Schools" Button to School Cards

**Location**: `frontend/src/components/SchoolCard.tsx`

**Tasks**:
- [ ] Add state tracking for whether school is in user's My Schools list
- [ ] Add "Add to My Schools" button/icon to each card
- [ ] Show "Remove" state when school is already added
- [ ] Add optimistic UI updates (add/remove immediately, sync with API)
- [ ] Handle error cases with rollback
- [ ] Add hover tooltips
- [ ] Add visual feedback (success toasts)

**UI Design**:
```tsx
// Button on school card
<Button
  variant={isInMySchools ? "default" : "outline"}
  size="sm"
  onClick={() => toggleMySchool(school.id)}
>
  {isInMySchools ? (
    <>
      <CheckIcon className="mr-1 h-4 w-4" />
      Added
    </>
  ) : (
    <>
      <PlusIcon className="mr-1 h-4 w-4" />
      Add to My Schools
    </>
  )}
</Button>
```

---

### 5. Frontend - Create My Schools Page

**Location**: `frontend/src/pages/MySchools.tsx` (new file)

**Component Structure**:
```tsx
// MySchools.tsx
- Page header with title "My Schools"
- Subtitle showing count of saved schools
- Grid layout displaying saved schools (same as Schools page)
- Each school card has "Remove" button
- Empty state with message "No schools saved yet"
- Link to browse all schools
- Optional: Add notes/editing functionality for future
```

**Tasks**:
- [ ] Create `MySchools.tsx` component
- [ ] Implement API call to GET /api/my-schools
- [ ] Display schools in same grid layout as Schools page
- [ ] Add "Remove from My Schools" button on each card
- [ ] Implement remove functionality with confirmation
- [ ] Add empty state design with CTA to browse schools
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Reuse SchoolCard component with props for "My Schools" mode

---

### 6. Frontend - Add Navigation from Home Page

**Location**: `frontend/src/pages/Home.tsx`

**Tasks**:
- [ ] Create `MySchoolsIllustration` component
- [ ] Add new navigation card for "My Schools"
- [ ] Add route to `/my-schools` with label "My Schools"
- [ ] Position alongside Student Portal and Manage Schools links
- [ ] Match existing styling and design patterns

**Update to Home.tsx**:
```tsx
// Add as third navigation card
<Card onClick={() => navigate('/my-schools')}>
  <CardHeader>
    <CardTitle>My Schools</CardTitle>
    <CardDescription>View your saved schools</CardDescription>
  </CardHeader>
  <CardContent className="flex justify-center">
    <MySchoolsIllustration />
  </CardContent>
</Card>
```

---

### 7. Frontend - Add Route Configuration

**Location**: `frontend/src/App.tsx`

**Tasks**:
- [ ] Import MySchools component
- [ ] Add new route: `<Route path="/my-schools" element={<MySchools />} />`

---

### 8. Frontend - API Layer

**Location**: `frontend/src/lib/api.ts`

**Tasks**:
- [ ] Add `mySchoolsApi` object with methods:
  - `getMySchools()` - Get user's saved schools
  - `addToMySchools(schoolId: string)` - Add school to list
  - `removeFromMySchools(schoolId: string)` - Remove from list
  - `checkMySchool(schoolId: string)` - Check if school is saved

---

### 9. Frontend - Authentication Flow

**Location**: `frontend/src/pages/Login.tsx` (new file) and related components

For the simple session-based approach:

**Tasks**:
- [ ] Create simple login page (username only, no password for prototype)
- [ ] Add login form component
- [ ] Store session in cookie/local storage
- [ ] Add logout functionality
- [ ] Add auth check to protected routes
- [ ] Show current user name in header/navigation
- [ ] Redirect to login if not authenticated

---

## File Structure Summary

### New Files to Create

```
backend/
  src/
    userDb.ts                  # User and user_schools database operations
    middleware/
      auth.ts                  # Authentication middleware
    routes/
      mySchools.ts             # My Schools API endpoints
      auth.ts                  # Login/logout endpoints

frontend/
  src/
    components/
      MySchoolsIllustration.tsx  # Home page icon for My Schools
    pages/
      MySchools.tsx             # My Schools page
      Login.tsx                 # Login page
    types/
      user.ts                   # User type definitions
      mySchools.ts              # My Schools specific types
```

### Files to Modify

```
backend/
  src/server.ts                # Register auth and my-schools routes, session config

frontend/
  src/App.tsx                  # Add /my-schools and /login routes
  src/components/SchoolCard.tsx # Add "Add to My Schools" button
  src/lib/api.ts               # Add mySchoolsApi methods
  src/pages/Home.tsx           # Add My Schools navigation card
```

---

## Database Schema Details

### SQL for Creating Tables

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);

-- User Schools junction table
CREATE TABLE IF NOT EXISTS user_schools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  school_id TEXT NOT NULL,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE,
  UNIQUE(user_id, school_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_schools_user_id ON user_schools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_schools_school_id ON user_schools(school_id);
```

---

## Technical Considerations

### Authentication Strategy
- Start with simple session-based auth (username only)
- Store session in express-session with memory store (for development)
- For production: Use Redis or database-backed sessions
- Future: Add JWT tokens for API-only access

### Data Consistency
- Use CASCADE delete when school is deleted from main schools table
- Ensure unique constraint on (user_id, school_id) prevents duplicates
- Use transactions when adding/removing schools

### Performance
- Index user_id and school_id columns in user_schools table
- Use JOIN queries to fetch school details with user relationships
- Consider caching user's My Schools list in session or local storage
- Optimize for fast add/remove operations

### User Experience
- Optimistic UI updates (don't wait for API response)
- Show loading state for add/remove operations
- Display success/error toasts
- Add undo functionality for remove operations
- Persist "is added" state when browsing schools page

---

## User Flow

### First Time Setup
1. User navigates to Home page
2. User clicks any feature (redirected to Login if not authenticated)
3. User enters username on Login page
4. User is redirected to their requested page

### Adding Schools to My Schools
1. User navigates to "Manage Schools" page
2. User browses/filter schools
3. User sees "Add to My Schools" button on each school card
4. User clicks "Add to My Schools"
5. Button changes to "Added" with checkmark icon
6. School is added to user's list (background API call)

### Viewing My Schools
1. User navigates to Home page
2. User clicks "My Schools" card
3. User is taken to `/my-schools` page
4. User sees grid of their saved schools
5. Each card shows "Remove" button

### Removing Schools
1. User on "My Schools" page clicks "Remove" on a school card
2. Confirmation dialog appears (optional)
3. School is removed from the list
4. Grid updates immediately

---

## Dependencies to Add

```bash
# Backend dependencies
npm install express-session
npm install @types/express-session --save-dev

# For session store (production, optional for now)
npm install connect-session-sequelize  # If using Sequelize
# or
npm install connect-redis  # If using Redis
```

---

## Testing Checklist

### Authentication
- [ ] Login page works with username
- [ ] Session persists across page refreshes
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Current user context is available in API calls

### Add to My Schools
- [ ] "Add to My Schools" button appears on school cards
- [ ] Clicking button adds school to user's list
- [ ] Button state changes to "Added"
- [ ] Can add multiple schools
- [ ] Cannot add same school twice (button already shows "Added")
- [ ] Error handling if school doesn't exist

### My Schools Page
- [ ] Can navigate to My Schools page from Home
- [ ] Page displays user's saved schools
- [ ] Empty state displays when no schools saved
- [ ] School count displays accurately
- [ ] Schools display in grid layout
- [ ] Each card shows "Remove" button

### Remove from My Schools
- [ ] "Remove" button removes school from list
- [ ] Confirmation dialog appears (if implemented)
- [ ] Grid updates immediately after removal
- [ ] School no longer appears in My Schools list
- [ ] School still appears in main Schools list
- [ ] "Add" button resets on main Schools page

### Cross-Feature
- [ ] Adding school on Schools page reflects on My Schools page
- [ ] Removing on My Schools page resets button on Schools page
- [ ] Each user has their own isolated list
- [ ] Logging out/in shows correct user's schools

---

## Future Enhancements (Out of Scope for Initial Implementation)

- Add notes field for each saved school
- Allow organizing schools into folders/categories
- Add school comparison feature
- Export My Schools to CSV/PDF
- Share My Schools list with other users
- Add school visit history
- Add alerts/notifications for school updates
- Add map view of My Schools
- Add statistics/analytics for My Schools
- Bulk import schools from CSV
- School recommendation engine
- Integration with other features (students, assessments)
