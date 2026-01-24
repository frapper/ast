# School Management Feature Plan

## Overview
Add a "Manage Schools" page to the application with the ability to refresh school data from a remote CSV source and display all schools in a grid layout.

## Source Data
- **CSV URL**: https://catalogue.data.govt.nz/dataset/c1923d33-e781-46c9-9ea1-d9b850082be4/resource/4b292323-9fcc-41f8-814b-3c7b19cf14b3/download/schooldirectory-02-01-2026-074519.csv
- **Format**: CSV file containing New Zealand school directory information

---

## Implementation Steps

### 1. Database Schema - Create Schools Table

**Location**: `backend/src/database/schoolDb.ts` (new file)

Create a new SQLite table for schools with the following schema (adjust fields based on actual CSV structure):

```typescript
interface School {
  id: number
  school_id: string
  school_name: string
  address: string
  suburb: string
  town: string
  postcode: string
  phone: string
  email: string
  website: string
  principal: string
  school_type: string
  authority: string
  decile: number
  roll_number: number
  // Add other fields from CSV as needed
}
```

**Tasks**:
- [ ] Create `schoolDb.ts` with database connection methods
- [ ] Create `schools` table schema
- [ ] Implement CRUD methods (getAll, create, update, delete, truncate)

---

### 2. Backend - CSV Download & Parsing

**Location**: `backend/src/routes/schoolRoutes.ts` (new file)

**Dependencies to add**:
- `csv-parser` - for parsing CSV files
- `axios` or `node-fetch` - for fetching the CSV from URL

**API Endpoints**:

```typescript
// GET /api/schools - Get all schools
// POST /api/schools/refresh - Fetch and parse CSV from remote URL
// DELETE /api/schools - Clear all schools
```

**Tasks**:
- [ ] Install `csv-parser` dependency
- [ ] Create `schoolRoutes.ts` with Express router
- [ ] Implement GET /api/schools endpoint
- [ ] Implement POST /api/schools/refresh endpoint:
  - Fetch CSV from remote URL
  - Parse CSV data
  - Transform and validate data
  - Insert/replace schools in database
  - Return count of schools added/updated
- [ ] Implement DELETE /api/schools endpoint
- [ ] Register school routes in `backend/src/server.ts`

---

### 3. Frontend - Create Manage Schools Page

**Location**: `frontend/src/pages/Schools.tsx` (new file)

**Component Structure**:
```tsx
// Schools.tsx
- Page header with title "Manage Schools"
- Refresh button (with loading state and icon)
- School count display
- Grid layout displaying all schools
- Each school card shows key information
- Empty state message when no schools exist
```

**Tasks**:
- [ ] Create `Schools.tsx` component
- [ ] Implement refresh button with loading spinner
- [ ] Add API call to POST /api/schools/refresh
- [ ] Display success/error messages (toast or alert)
- [ ] Create school card component to display individual school info
- [ ] Implement grid layout using Tailwind CSS (responsive: 1 col mobile, 2 cols tablet, 3-4 cols desktop)
- [ ] Add empty state design
- [ ] Handle loading states
- [ ] Handle error states

---

### 4. Frontend - Add Navigation from Home Page

**Location**: `frontend/src/pages/Home.tsx`

**Tasks**:
- [ ] Add new navigation card similar to "Student Portal" card
- [ ] Create `SchoolIllustration` component (or use generic icon)
- [ ] Add route to `/schools` with label "Manage Schools"
- [ ] Position alongside Student Portal link
- [ ] Match existing styling and design patterns

**Update to Home.tsx**:
```tsx
// Add alongside Student Portal section
<Card onClick={() => navigate('/schools')}>
  <SchoolIllustration />
  <h2>Manage Schools</h2>
  <p>View and refresh school directory data</p>
</Card>
```

---

### 5. Frontend - Add Route Configuration

**Location**: `frontend/src/App.tsx`

**Tasks**:
- [ ] Import Schools component
- [ ] Add new route: `<Route path="/schools" element={<Schools />} />`

---

### 6. Type Definitions

**Location**: `frontend/src/types/school.ts` and `backend/src/types/school.ts` (new files)

**Tasks**:
- [ ] Create shared TypeScript interface for School type
- [ ] Ensure consistency between frontend and backend types

---

## File Structure Summary

### New Files to Create

```
backend/
  src/
    database/
      schoolDb.ts              # Schools database operations
    routes/
      schoolRoutes.ts          # Schools API endpoints
    types/
      school.ts                # School type definitions

frontend/
  src/
    components/
      SchoolIllustration.tsx   # Home page icon for schools
      SchoolCard.tsx           # Individual school display card
    pages/
      Schools.tsx              # Manage Schools page
    types/
      school.ts                # School type definitions
```

### Files to Modify

```
backend/
  src/server.ts               # Register school routes

frontend/
  src/App.tsx                 # Add /schools route
  src/pages/Home.tsx          # Add navigation card
```

---

## Technical Considerations

### CSV Parsing
- First fetch the CSV manually to inspect the actual column structure
- Map CSV columns to database schema fields
- Handle potential data inconsistencies (missing values, invalid formats)
- Consider batch inserts for performance if CSV is large

### Error Handling
- Handle network failures when fetching CSV
- Validate CSV structure before parsing
- Show clear error messages to user
- Implement retry mechanism for failed refresh

### Performance
- Consider pagination or virtual scrolling if there are many schools
- Cache school data on frontend to avoid repeated API calls
- Use loading states during CSV fetch and processing

### Data Management
- Decide on refresh strategy: replace all data or upsert based on school_id
- Consider adding a "last refreshed" timestamp
- Add school count display
- Consider adding search/filter functionality (future enhancement)

---

## User Flow

1. User navigates to Home page
2. User clicks "Manage Schools" card
3. User is taken to `/schools` page
4. If no schools exist, user sees empty state
5. User clicks "Refresh Schools" button
6. System fetches CSV from remote URL
7. System parses and inserts school data into database
8. User sees success message with count of schools loaded
9. Schools are displayed in a responsive grid layout
10. Each school card displays key information (name, location, type, etc.)

---

## Dependencies to Add

```bash
# Backend dependencies
npm install csv-parser
npm install axios
```

---

## Testing Checklist

- [ ] Can navigate to Manage Schools page from Home
- [ ] Refresh button works and fetches CSV successfully
- [ ] Schools are displayed correctly in grid layout
- [ ] Empty state displays when no schools exist
- [ ] Error handling works when CSV fetch fails
- [ ] Loading states display properly
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Data persists across page refreshes
- [ ] Can delete all schools if needed
- [ ] School count displays accurately

---

## Future Enhancements (Out of Scope for Initial Implementation)

- Add search/filter functionality for schools
- Add ability to edit individual school details
- Add school details page with full information
- Export schools to CSV
- Add pagination for large datasets
- Add school statistics/dashboard
- Add last refreshed timestamp display
