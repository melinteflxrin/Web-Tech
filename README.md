# Web-Tech

## Task Planning Web Application

### Objective
Implement a web application for task planning, allocation, and monitoring.

### Detailed Specifications

#### User Roles
- **Administrator**: Adds users (managers or executing users).
- **Manager**: Creates tasks, allocates tasks, monitors status, closes completed tasks, views user task history.
- **Executing User**: Has an assigned manager, receives tasks, marks tasks as completed, views their own task history.

#### Core Features
- User management (add users, assign roles, assign manager to users)
- Task creation (by managers, with description, initial state OPEN)
- Task allocation (manager assigns to user, state becomes PENDING)
- Task status updates (user marks as COMPLETED, manager marks as CLOSED)
- Task history (users and managers can view history)

#### Task States
- **OPEN** → **PENDING** → **COMPLETED** → **CLOSED**

#### Accessibility
- Single Page Application (SPA)
- Responsive: desktop, mobile, tablet

---

### Project Plan

#### Milestones
1. **Project Setup**
	- Initialize Git repository
	- Set up project structure (frontend SPA, backend API if needed)
	- Add README with project description
2. **User Management**
	- Admin can add users and assign roles
	- Assign manager to executing users
3. **Task Management**
	- Managers can create tasks (OPEN)
	- Managers can allocate tasks (PENDING)
	- Users can view and complete tasks (COMPLETED)
	- Managers can close tasks (CLOSED)
4. **Task History**
	- Users and managers can view task history
5. **UI/UX**
	- Responsive SPA interface
6. **Testing & Documentation**
	- Test core flows
	- Update documentation

#### Technologies
- **Frontend**: JavaScript (React or Vue recommended), HTML, CSS
- **Backend**: Node.js/Express (optional for now)
- **Data**: In-memory or simple JSON for prototype
- **Version Control**: Git

---

### Folder Structure

```
Web-Tech/
  src/        # Application source code
  public/     # Static files (index.html, etc.)
  README.md   # Project documentation
  LICENSE
```

---

### Example Applications
JIRA, Asana