PROJECT: Team Task Manager
==========================

Live URL: https://celebrated-courage-production-4b0f.up.railway.app
GitHub: https://github.com/saifkhan727/team-task-manager

TECH STACK
----------
Frontend: React.js + Tailwind CSS + Vite
Backend: Node.js + Express.js
Database: PostgreSQL (Railway)
Deployment: Railway

FEATURES
--------
- JWT Authentication (Register/Login)
- Role-based access control (Admin/Member)
- Project creation and management
- Task creation, assignment & status tracking
- Kanban-style task board (Todo/In Progress/Done)
- Dashboard with stats (total tasks, overdue, by status)
- Add members to projects (Admin only)
- Delete projects and tasks (Admin only)

TEST CREDENTIALS
----------------
Admin:
  Email: admin@test.com
  Password: password123

Member:
  Email: member@test.com
  Password: password123

API ENDPOINTS
-------------
POST /auth/register
POST /auth/login
GET/POST /projects
GET/DELETE /projects/:id
POST /projects/:id/members
GET/POST /projects/:id/tasks
PATCH /tasks/:id
DELETE /tasks/:id
GET /dashboard

SETUP LOCALLY
-------------
1. Clone repo: git clone https://github.com/saifkhan727/team-task-manager
2. Backend:
   cd server
   npm install
   add .env with DATABASE_URL and JWT_SECRET
   npm run dev
3. Frontend:
   cd client
   npm install
   npm run dev
