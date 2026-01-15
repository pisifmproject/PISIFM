# Testing Guide: Project Status System

## Pre-Testing Setup

### 1. Start Backend Server

```bash
cd server
npm install  # jika belum
npm run dev  # atau node src/server.js
```

Backend harus running di: `http://localhost:3000`

### 2. Start Frontend

```bash
# Di root folder
npm install  # jika belum
npm run dev
```

Frontend akan running di: `http://localhost:5173` (atau port lain)

### 3. Database Check

Pastikan PostgreSQL running dan database terkoneksi.

---

## Test Cases

### ✅ Test 1: Create Project - Planning Status

**Steps:**

1. Login ke aplikasi
2. Navigate to "Project Vault"
3. Click "New Project" button
4. Fill form:
   - Name: "Test Planning Project"
   - Location: "Plant A"
   - Progress: 0%
   - Due Date: (future date)
   - Budget: 100000
5. Submit

**Expected Result:**

- Project created successfully
- Appears in "Planning" column (0% progress)
- Visible in database
- No error messages

---

### ✅ Test 2: Create Project - In Progress Status

**Steps:**

1. Click "New Project"
2. Fill form:
   - Name: "Test In Progress Project"
   - Location: "Plant B"
   - Progress: 50%
   - Due Date: (future date, 7 days from now)
   - Budget: 200000
3. Submit

**Expected Result:**

- Project appears in "In Progress" column
- Progress shows 50%
- Status calculated by backend (not manual)

---

### ✅ Test 3: Create Project - Delayed Status

**Steps:**

1. Click "New Project"
2. Fill form:
   - Name: "Test Delayed Project"
   - Location: "Plant C"
   - Progress: 30%
   - Due Date: (past date, yesterday)
   - Budget: 150000
3. Submit

**Expected Result:**

- Project appears in "Delayed" column
- Shows alert icon
- Red/warning styling visible

---

### ✅ Test 4: Create Project - Completed Status

**Steps:**

1. Click "New Project"
2. Fill form:
   - Name: "Test Completed Project"
   - Location: "Plant D"
   - Progress: 100%
   - Due Date: (any date)
   - Budget: 300000
3. Submit

**Expected Result:**

- Project appears in "Completed" column
- Progress shows 100%
- Green/success styling

---

### ✅ Test 5: Drag-and-Drop Disabled

**Steps:**

1. In Project Vault, try to drag a project card
2. Try to drop it in different status column

**Expected Result:**

- Cards are NOT draggable
- Cursor shows pointer (not grab)
- Status cannot be changed manually
- Console shows: "Status is auto-calculated on backend"

---

### ✅ Test 6: Forms - Reference Job Dropdown

**Steps:**

1. Navigate to "Forms & Requests"
2. Select "Progress" tab (Daily Report)
3. Open "Reference Job" dropdown

**Expected Result:**

- Dropdown shows all projects from database
- Shows project names (not job names)
- No empty/undefined values
- Projects match those in Project Vault

---

### ✅ Test 7: Data Persistence (Reload Test)

**Steps:**

1. Create a new project
2. Note its status column
3. Refresh browser (F5 or Ctrl+R)
4. Navigate back to Project Vault

**Expected Result:**

- Project still appears in same status column
- Data persists from database
- No mock/dummy data appears
- Status consistent with progress/date rules

---

### ✅ Test 8: Empty State

**Steps:**

1. If possible, empty the projects table
2. Navigate to Project Vault

**Expected Result:**

- Shows "No Projects Found" message
- Shows "Create Project" button
- No hardcoded/mock projects visible
- Clean empty state UI

---

### ✅ Test 9: Multiple Projects

**Steps:**

1. Create 2-3 projects with different statuses
2. Navigate to "Forms & Requests"
3. Check "Reference Job" dropdown

**Expected Result:**

- All created projects visible in dropdown
- Projects sorted/listed properly
- Can select any project
- Selection works correctly

---

### ✅ Test 10: Update Project Progress

**Steps:**

1. Open browser DevTools → Network tab
2. In Project Vault, update a project's progress via API
   ```javascript
   // In browser console:
   fetch("/api/projects/PRJ-123456", {
     method: "PUT",
     headers: {
       "Content-Type": "application/json",
       Authorization: "Bearer " + localStorage.getItem("authToken"),
     },
     body: JSON.stringify({ progress: 75 }),
   });
   ```
3. Refresh Project Vault

**Expected Result:**

- Status recalculated by backend
- Project moves to correct column
- API response includes calculated status

---

## 🔍 Debugging Checklist

If tests fail, check:

- [ ] Backend server is running
- [ ] Database connection successful
- [ ] No console errors in browser
- [ ] Network tab shows API calls succeeding
- [ ] localStorage has authToken
- [ ] PostgreSQL service running
- [ ] Correct API endpoint in vite.config.ts

---

## 📊 Expected API Responses

### GET /api/projects

```json
{
  "success": true,
  "data": [
    {
      "id": "PRJ-1234567890",
      "name": "Test Project",
      "location": "Plant A",
      "status": "In Progress",  // ← Calculated by backend
      "progress": 50,
      "dueDate": "2026-01-20",
      "budget": "100000",
      ...
    }
  ]
}
```

### POST /api/projects

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "PRJ-1234567890",
    "status": "Planning",  // ← Auto-calculated
    ...
  }
}
```

---

## ⚠️ Known Issues / Not Supported

❌ Manual status override (by design)  
❌ Drag-and-drop status change (disabled)  
❌ Mock data in production (removed)  
✅ All project data from database only  
✅ Status auto-calculated on every request

---

## 🎯 Success Criteria

All tests passing means:

- ✅ Backend status logic working
- ✅ Frontend displays correctly
- ✅ No hardcoded data
- ✅ Database is single source of truth
- ✅ Forms dropdown works
- ✅ Reload-safe (persistent)

---

**Testing Completed:** ****\_\_****  
**Tester Name:** ****\_\_****  
**All Tests Passed:** ☐ Yes ☐ No  
**Issues Found:** ****\_\_****
