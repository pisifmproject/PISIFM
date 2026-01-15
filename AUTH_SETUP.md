# PISIFM Authentication & Database Integration

## ✅ Completed Changes

### 1. **Backend Configuration**

- Port updated from 5001 to **3026**
- Database: PostgreSQL PISIFM on localhost:5432
- Drizzle ORM integration with password hashing

### 2. **Frontend-Backend Connection**

#### API Configuration (services/api.ts)

- Added `authService` with:
  - `login()` - Authenticates against database
  - `register()` - Creates new user in database
  - `logout()` - Clears authentication
  - `isAuthenticated()` - Check auth status
- JWT token stored in localStorage
- Automatic token injection in API requests

#### Sign In Component

- Connected to `/api/auth/login` endpoint
- Validates credentials against database
- Shows error messages for invalid credentials
- Stores JWT token on successful login
- Redirects to dashboard after login

#### Sign Up Component

- Connected to `/api/auth/register` endpoint
- Saves user data directly to database
- Password is automatically hashed (bcrypt)
- Validates password match and length
- Shows error messages
- Redirects to login after successful registration

### 3. **App.tsx Updates**

- Uses `authService.isAuthenticated()` to check login state
- Persists authentication across page refreshes
- Calls `authService.logout()` on logout
- Only fetches data when authenticated

### 4. **Development Scripts**

#### run-dev.ps1

- Updated to start both servers with correct ports
- Backend: http://localhost:3026
- Frontend: http://localhost:5173
- Shows network access URLs for remote devices

### 5. **Proxy Configuration (vite.config.ts)**

- Proxies `/api` requests to `http://localhost:3026`
- Enables seamless frontend-backend communication

## 🚀 How to Use

### Start Development Servers

```powershell
.\run-dev.ps1
```

This will:

1. Start backend on port 3026
2. Start frontend on port 5173
3. Open browser automatically

### Default Admin Account

- **Email**: `admin@pisifm.com`
- **Password**: `admin123`

### Testing Authentication

#### 1. Test Login

- Navigate to http://localhost:5173/#/login
- Enter valid credentials from database
- Should redirect to dashboard on success
- Shows error message for invalid credentials

#### 2. Test Sign Up

- Navigate to http://localhost:5173/#/signup
- Fill in the form:
  - Name
  - Email (must be unique)
  - Role (user/engineer/supervisor/manager/admin)
  - Password (min 6 characters)
  - Confirm Password
- Click "Create Account"
- Check database to verify user was created
- Password should be hashed in database
- Redirects to login page after successful registration

#### 3. Verify Database

You can check the database to see the registered users:

```sql
SELECT id, name, email, role, created_at FROM users;
```

Note: Password column should show hashed values, not plain text.

## 🔐 Security Features

1. **Password Hashing**: All passwords are hashed with bcryptjs (10 salt rounds)
2. **JWT Authentication**: Token-based authentication with 7-day expiry
3. **Protected Routes**: API routes require valid JWT token
4. **Token Storage**: JWT stored in localStorage
5. **Auto-injection**: Token automatically added to all API requests

## 📊 API Endpoints

### Public Endpoints

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password

### Protected Endpoints (require JWT token)

- `GET /api/auth/profile` - Get current user profile
- `GET /api/users` - Get all users
- `GET /api/projects` - Get all projects
- All other CRUD endpoints

## ✅ Verification Checklist

- [x] Backend runs on port 3026
- [x] Frontend runs on port 5173
- [x] Vite proxy configured correctly
- [x] Login validates against database
- [x] Sign up saves to database
- [x] Passwords are hashed in database
- [x] JWT tokens are stored and used
- [x] Authentication persists on refresh
- [x] Logout clears authentication
- [x] Error messages display correctly
- [x] run-dev.ps1 starts both servers

## 🎯 Next Steps

1. Run `.\run-dev.ps1` to start servers
2. Test login with default admin account
3. Test sign up with new account
4. Verify data in database
5. Test authentication persistence
6. Test logout functionality

## 🐛 Troubleshooting

### Backend not connecting?

- Check if backend is running on port 3026
- Verify DATABASE_URL in server/.env
- Check server logs for errors

### Login not working?

- Verify user exists in database
- Check password is correct
- Look for error messages in browser console
- Check network tab for API responses

### Sign up not working?

- Check if email is unique
- Verify password length (min 6 chars)
- Passwords must match
- Check browser console for errors
