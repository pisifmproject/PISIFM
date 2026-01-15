# Project Status Implementation - Backend-Driven Logic

## 📋 Overview

Implementasi sistem project status yang sepenuhnya ditangani oleh backend berdasarkan progress dan target date. Frontend hanya menampilkan data dari database tanpa ada hardcoded data atau manual status assignment.

## 🎯 Business Rules

Status project ditentukan secara otomatis oleh backend dengan aturan:

1. **Planning** (0% progress)

   - Project baru yang belum dikerjakan
   - Progress = 0%

2. **In Progress** (>0% dan <100%, belum lewat target)

   - Project sedang berjalan
   - Progress > 0% dan < 100%
   - Tanggal hari ini ≤ target date

3. **Completed** (100% progress)

   - Project selesai
   - Progress = 100%

4. **Delayed** (Lewat target, belum completed)
   - Project terlambat
   - Progress < 100%
   - Tanggal hari ini > target date

## 🔧 Backend Changes

### 1. Project Service (`server/src/services/projectService.js`)

**Penambahan Method `calculateStatus(progress, dueDate)`:**

```javascript
calculateStatus(progress, dueDate) {
  const progressNum = parseInt(progress) || 0;

  if (progressNum >= 100) return "Completed";
  if (progressNum === 0) return "Planning";

  if (dueDate) {
    const targetDate = new Date(dueDate);
    const today = new Date();
    if (today > targetDate) return "Delayed";
  }

  return "In Progress";
}
```

**Modified Methods:**

- `getAllProjects()` - Menghitung status untuk semua projects
- `getProjectById(id)` - Menghitung status untuk single project
- `createProject(projectData)` - Ignore status dari client, hitung otomatis
- `updateProject(id, projectData)` - Recalculate status saat update

### 2. Project Controller (`server/src/controllers/projectController.js`)

- Tidak ada perubahan, sudah compatible dengan service layer

### 3. Project Routes (`server/src/routes/projectRoutes.js`)

- Tidak ada perubahan, endpoint tetap sama

## 💻 Frontend Changes

### 1. CreateProjectModal (`components/Projects/CreateProjectModal.tsx`)

**Removed:**

- Manual status field dari form data initial state
- Status assignment saat submit

**Updated:**

- Form submit tidak include status field
- Backend calculate status based on progress and dueDate
- Form reset after successful submission

### 2. ProjectsView (`components/Projects/ProjectsView.tsx`)

**Removed:**

- Manual status update via drag-drop
- `handleStatusChange` sekarang no-op (kept for compatibility)

**Updated:**

- `handleCreateProject` properly refresh data after create
- Error handling with user feedback

### 3. ProjectBoard (`components/Projects/ProjectBoard.tsx`)

**Removed:**

- Drag and drop functionality completely
- All drag event handlers (handleDragStart, handleDragEnd, etc.)
- draggedOver state

**Updated:**

- Cards are now clickable but not draggable
- Status is display-only, calculated by backend

### 4. FormsView (`components/FormsView.tsx`)

**Updated:**

- "Reference Job" dropdown now uses `projects` instead of `jobs`
- Shows all projects from database
- Option label: `p.name` instead of `j.projectName`
- Option value: `p.id` (project ID)

### 5. App.tsx

**Updated:**

- `fetchData()` now properly handles API response format
- No fallback to MOCK_PROJECTS (except users for auth)
- `onRefresh` callback properly extracts `response.data`

## 📊 Data Flow

```
User Creates Project
       ↓
Frontend sends data WITHOUT status
       ↓
Backend calculates status based on:
  - progress value
  - dueDate vs today
       ↓
Database stores project WITH calculated status
       ↓
Frontend fetches projects
       ↓
Display in Project Vault (by status)
       ↓
Also available in Forms & Requests dropdown
```

## 🔄 Sync Behavior

1. **Create Project:**

   - Frontend sends: name, location, progress, dueDate, etc.
   - Backend calculates status automatically
   - Returns project with status
   - Frontend refreshes to show new project

2. **Update Project:**

   - If progress or dueDate changes
   - Backend recalculates status
   - Returns updated project with new status
   - UI reflects new status category

3. **View Projects:**
   - Backend always calculates status on-the-fly
   - Frontend displays projects grouped by status
   - No manual status override possible

## ✅ Testing Checklist

- [ ] Create project dengan progress 0% → Status "Planning"
- [ ] Create project dengan progress 50% belum lewat target → Status "In Progress"
- [ ] Create project dengan progress 100% → Status "Completed"
- [ ] Create project dengan progress 30% sudah lewat target → Status "Delayed"
- [ ] Project muncul di Project Vault sesuai status
- [ ] Project muncul di dropdown Reference Job di Forms
- [ ] Tidak ada data dummy/hardcoded yang muncul
- [ ] Reload page tetap konsisten (data dari DB)
- [ ] Update progress project → Status otomatis berubah

## 🚀 Deployment Notes

1. Pastikan backend sudah running dengan perubahan projectService
2. Database schema tidak berubah, tidak perlu migration
3. Frontend akan otomatis ambil status dari backend
4. Clear localStorage jika masih ada mock data tersimpan

## 🔐 Security

- Status tidak bisa di-override dari frontend
- Validasi tetap ada di backend
- Authentication middleware aktif untuk semua endpoints

## 📝 Additional Notes

- Approval flow untuk submissions TIDAK diubah
- Job assignments tetap menggunakan table terpisah
- Users tetap dari database (kecuali fallback untuk auth)
- Drag-and-drop dinonaktifkan karena status auto-calculated

---

**Last Updated:** January 15, 2026  
**Implemented by:** Senior Fullstack Developer  
**Status:** ✅ Complete
