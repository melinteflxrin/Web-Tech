# Task Planning Web Application

A web application for task planning, allocation, and monitoring built with vanilla JavaScript and Node.js/Express.

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation & Running

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3000`

3. **Open the app:**
   - Open your browser and go to `http://localhost:3000`
   - Use one of the demo accounts to login:
     - **Admin:** admin@task.com / admin123
     - **Manager:** john@task.com / pass123
     - **Employee:** jane@task.com / pass123

---

## Project Structure

```
Web-Tech/
├── server/
│   ├── server.js          # Express server & API endpoints
│   ├── data.json          # JSON database (users & tasks)
│   └── package.json       # Dependencies
├── public/
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── styles.css     # Global styles
│   └── js/
│       ├── app.js         # SPA routing & navigation
│       ├── auth.js        # Login/logout functionality
│       ├── admin.js       # User management (admin)
│       ├── manager.js     # Task management (manager)
│       └── employee.js    # Employee tasks (Florin)
└── README.md
```

---

## Features & User Roles

### Administrator (Alex)
- ✅ Add, view, and delete users
- ✅ Assign roles (admin, manager, employee)
- ✅ Assign managers to employees

### Manager (Andrei)
- ✅ Create tasks (state: OPEN)
- ✅ Allocate tasks to employees (state: PENDING)
- ✅ View all tasks and their statuses
- ✅ Close completed tasks (state: CLOSED)
- ✅ View task history for employees

### Employee (Florin)
- ✅ View assigned tasks
- ✅ Mark tasks as completed (state: COMPLETED)
- ✅ View personal task history
- ✅ View detailed task information
- ✅ Track task statistics and completion rate

### Task States
**OPEN** → **PENDING** → **COMPLETED** → **CLOSED**

---

## API Endpoints

### User Management (Alex)
- `POST /api/login` - Authenticate user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/managers` - Get all managers

### Task Management (Andrei & Florin - Completed)
- `POST /api/tasks` - Create task (Manager)
- `GET /api/tasks` - Get all tasks (Manager)
- `GET /api/tasks/:id` - Get task by ID (Employee)
- `GET /api/tasks/user/:userId` - Get tasks for user (Employee)
- `PUT /api/tasks/:id/assign` - Assign task to user (Manager)
- `PUT /api/tasks/:id/complete` - Mark task as completed (Employee)
- `PUT /api/tasks/:id/close` - Close completed task (Manager)
- `PUT /api/tasks/:id` - Update task (Manager)
- `DELETE /api/tasks/:id` - Delete task (Manager)
- `GET /api/tasks/history/:userId` - Get task history (Manager/Employee)

---

## Team Responsibilities

### Alex (Completed)
- ✅ Project setup (Node.js, Express, file structure)
- ✅ User authentication (login/logout)
- ✅ User management (admin dashboard)
- ✅ SPA routing and navigation
- ✅ Responsive UI foundation

### Andrei (Completed)
- ✅ Manager task management interface
- ✅ Task creation and allocation
- ✅ Task status monitoring
- ✅ Task history views for managers
- ✅ Task state transitions (OPEN → PENDING → COMPLETED → CLOSED)

### Florin (Completed)
- ✅ Employee task interface
- ✅ Task completion functionality
- ✅ Employee task history with statistics
- ✅ Detailed task view
- ✅ Priority badges and overdue warnings
- ✅ Responsive design for mobile/tablet/desktop
- ✅ Testing & documentation

---

## Database Structure

The `server/data.json` file stores all data:

```json
{
  "users": [
    {
      "id": 1,
      "name": "User Name",
      "email": "user@example.com",
      "password": "password",
      "role": "admin|manager|employee",
      "managerId": null or number
    }
  ],
  "tasks": []
}
```

---

## Technology Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js, Express.js
- **Database:** JSON file storage
- **Architecture:** Single Page Application (SPA)

---

## Development Notes

### For Florin & Andrei

1. **Adding new pages:**
   - Create your JS file in `public/js/`
   - Add route case in `app.js` switch statement
   - Create render function (e.g., `renderTasksPage()`)

2. **Using the API:**
   - Base URL: `const API_URL = 'http://localhost:3000/api'`
   - Use `fetch()` for all API calls
   - Check `auth.js` and `admin.js` for examples

3. **Getting current user:**
   ```javascript
   const user = getCurrentUser(); // From auth.js
   ```

4. **Adding styles:**
   - Add your CSS to `public/css/styles.css`
   - Follow existing naming conventions

5. **Testing:**
   - Test with all three user roles
   - Ensure responsive design (mobile/tablet/desktop)

---

## Troubleshooting

**Server won't start:**
- Make sure you're in the `server/` directory
- Run `npm install` first
- Check if port 3000 is already in use

**Login doesn't work:**
- Verify server is running on http://localhost:3000
- Check browser console for errors
- Make sure `data.json` exists in `server/` folder

**Changes not appearing:**
- Hard refresh browser (Ctrl+F5)
- Clear browser cache
- Restart the server

---

## Example Applications
Similar task management systems: JIRA, Asana, Trello
