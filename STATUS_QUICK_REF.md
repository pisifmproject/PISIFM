# Quick Reference: Project Status System

## Status Logic (Backend Auto-Calculate)

| Progress | Target Date | Status          |
| -------- | ----------- | --------------- |
| 0%       | Any         | **Planning**    |
| 1-99%    | Not Passed  | **In Progress** |
| 1-99%    | Passed      | **Delayed**     |
| 100%     | Any         | **Completed**   |

## Key Points

✅ **Backend calculates status** - Frontend cannot override  
✅ **Projects from database only** - No mock/hardcoded data  
✅ **Drag-and-drop disabled** - Status is read-only  
✅ **Forms Reference Job** - Uses projects table (not jobs)  
✅ **Auto-refresh** - New projects appear immediately

## File Changes Summary

### Backend

- `server/src/services/projectService.js` - Added calculateStatus() logic

### Frontend

- `components/Projects/CreateProjectModal.tsx` - Removed manual status
- `components/Projects/ProjectsView.tsx` - Disabled status change
- `components/Projects/ProjectBoard.tsx` - Removed drag-and-drop
- `components/FormsView.tsx` - Use projects for Reference Job
- `App.tsx` - Fixed data fetching

## API Endpoints (No Changes)

```
GET    /api/projects       - Get all (with calculated status)
GET    /api/projects/:id   - Get one (with calculated status)
POST   /api/projects       - Create (status auto-calculated)
PUT    /api/projects/:id   - Update (status recalculated)
DELETE /api/projects/:id   - Delete project
```

## Testing Commands

```bash
# Start backend
cd server
npm run dev

# Start frontend
npm run dev
```

## Common Scenarios

1. **New project** → POST with progress=0 → Status: Planning
2. **Work starts** → PUT with progress=30 → Status: In Progress
3. **Deadline passes** → Status auto: Delayed (if not 100%)
4. **Work done** → PUT with progress=100 → Status: Completed

---

✅ **Implementation Complete**  
📅 January 15, 2026
