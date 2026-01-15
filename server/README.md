# PISIFM Backend API Documentation

## Architecture

The backend has been restructured following **MVC (Model-View-Controller)** and **Clean Architecture** principles:

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Drizzle ORM database connection
│   ├── models/          # Database schema definitions
│   │   └── schema.js    # All table schemas using Drizzle ORM
│   ├── services/        # Business logic layer
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── projectService.js
│   │   ├── submissionService.js
│   │   ├── jobService.js
│   │   └── plantService.js
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── submissionController.js
│   │   ├── jobController.js
│   │   └── plantController.js
│   ├── middleware/      # Express middleware
│   │   └── authMiddleware.js
│   ├── routes/          # API route definitions
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── submissionRoutes.js
│   │   ├── jobRoutes.js
│   │   └── plantRoutes.js
│   ├── server.js        # Main application entry point
│   └── migrate.js       # Database migration script
├── .env                 # Environment variables
├── drizzle.config.js    # Drizzle ORM configuration
└── package.json
```

## Features

✅ **Drizzle ORM** - Type-safe database queries
✅ **Password Hashing** - Using bcryptjs for secure password storage
✅ **JWT Authentication** - Token-based authentication system
✅ **Clean Architecture** - Separation of concerns with layers
✅ **RESTful API** - Standard HTTP methods and status codes
✅ **Error Handling** - Centralized error handling
✅ **CORS Enabled** - Cross-origin resource sharing configured

## Database Connection

- **Database**: PostgreSQL
- **Connection String**: `postgres://postgres:Indofood00@localhost:5432/PISIFM`
- **Port**: 3026
- **ORM**: Drizzle ORM

## Environment Variables

```env
DATABASE_URL=postgres://postgres:Indofood00@localhost:5432/PISIFM
PORT=3026
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
NODE_ENV=development
API_GEMINI=AIzaSyC1TlWce_2xSNwxqPrV01A9-uxE8_Ln_wY
```

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
```

## Default Admin Account

After running migration, a default admin account is created:

- **Email**: `admin@pisifm.com`
- **Password**: `admin123`
- **Role**: `admin`

⚠️ **Important**: Change the default password after first login!

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user (password will be hashed)
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires auth)

### Users

- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `POST /api/users` - Create user (requires auth)
- `PATCH /api/users/:id` - Update user (requires auth)
- `DELETE /api/users/:id` - Delete user (requires auth)

### Projects

- `GET /api/projects` - Get all projects (requires auth)
- `GET /api/projects/:id` - Get project by ID (requires auth)
- `POST /api/projects` - Create project (requires auth)
- `PUT /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)

### Submissions

- `GET /api/submissions` - Get all submissions (requires auth)
- `GET /api/submissions/:id` - Get submission by ID (requires auth)
- `POST /api/submissions` - Create submission (requires auth)
- `PUT /api/submissions/:id` - Update submission (requires auth)
- `DELETE /api/submissions/:id` - Delete submission (requires auth)

### Jobs

- `GET /api/jobs` - Get all jobs (requires auth)
- `GET /api/jobs/:id` - Get job by ID (requires auth)
- `POST /api/jobs` - Create job (requires auth)
- `PUT /api/jobs/:id` - Update job (requires auth)
- `DELETE /api/jobs/:id` - Delete job (requires auth)

### Plants

- `GET /api/plants` - Get all plants (requires auth)
- `GET /api/plants/:id` - Get plant by ID (requires auth)
- `POST /api/plants` - Create plant (requires auth)
- `PUT /api/plants/:id` - Update plant (requires auth)
- `DELETE /api/plants/:id` - Delete plant (requires auth)

### Health Check

- `GET /health` - Check server and database status

## Authentication Flow

1. **Register**: Send user data to `/api/auth/register`

   - Password is automatically hashed with bcrypt
   - Returns user data and JWT token

2. **Login**: Send email and password to `/api/auth/login`

   - Password is verified against hashed password in database
   - Returns user data and JWT token

3. **Access Protected Routes**: Include JWT token in Authorization header
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## Request/Response Format

### Successful Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing the API

### 1. Test Health Check

```bash
curl http://localhost:3026/health
```

### 2. Register a New User

```bash
curl -X POST http://localhost:3026/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3026/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pisifm.com",
    "password": "admin123"
  }'
```

### 4. Access Protected Route

```bash
curl http://localhost:3026/api/users \
  -H "Authorization: Bearer <your-token-here>"
```

## Password Security

All passwords are:

- Hashed using bcryptjs with 10 salt rounds
- Never stored in plain text
- Never returned in API responses
- Verified securely during login

## Next Steps

1. ✅ Database migrated successfully
2. ✅ Server running on port 3026
3. ✅ Authentication system with password hashing implemented
4. ✅ All CRUD operations available
5. 🔄 Test the authentication and CRUD operations via frontend

## Important Notes

- All routes except `/health`, `/api/auth/register`, and `/api/auth/login` require authentication
- JWT tokens expire after 7 days
- Password must be provided when creating users
- Update operations can optionally include new password (will be hashed automatically)
