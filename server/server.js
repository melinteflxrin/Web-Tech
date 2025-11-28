/**
 * Main Express Server
 * Handles user management API endpoints and serves static files
 * Created by: Alex (Project Setup & User Management)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Helper function: Read data from JSON file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { users: [], tasks: [] };
  }
}

// Helper function: Write data to JSON file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// ===== USER MANAGEMENT ENDPOINTS (Alex) =====

/**
 * POST /api/login
 * Authenticates a user
 * Body: { email, password }
 * Returns: User object without password
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const data = await readData();
  const user = data.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Don't send password back to client
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

/**
 * GET /api/users
 * Returns all users (admin only in production, but simplified for this project)
 * Returns: Array of user objects without passwords
 */
app.get('/api/users', async (req, res) => {
  const data = await readData();
  
  // Remove passwords from response
  const usersWithoutPasswords = data.users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

/**
 * GET /api/users/:id
 * Returns a specific user by ID
 * Returns: User object without password
 */
app.get('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const data = await readData();
  
  const user = data.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

/**
 * POST /api/users
 * Creates a new user (admin functionality)
 * Body: { name, email, password, role, managerId }
 * Returns: Created user object
 */
app.post('/api/users', async (req, res) => {
  const { name, email, password, role, managerId } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  const data = await readData();

  // Check if email already exists
  if (data.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  // Create new user
  const newUser = {
    id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
    name,
    email,
    password,
    role, // 'admin', 'manager', or 'employee'
    managerId: managerId || null
  };

  data.users.push(newUser);
  await writeData(data);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

/**
 * PUT /api/users/:id
 * Updates an existing user
 * Body: { name, email, password, role, managerId }
 * Returns: Updated user object
 */
app.put('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, password, role, managerId } = req.body;

  const data = await readData();
  const userIndex = data.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user fields
  if (name) data.users[userIndex].name = name;
  if (email) data.users[userIndex].email = email;
  if (password) data.users[userIndex].password = password;
  if (role) data.users[userIndex].role = role;
  if (managerId !== undefined) data.users[userIndex].managerId = managerId;

  await writeData(data);

  const { password: _, ...userWithoutPassword } = data.users[userIndex];
  res.json(userWithoutPassword);
});

/**
 * DELETE /api/users/:id
 * Deletes a user
 * Returns: Success message
 */
app.delete('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const data = await readData();

  const userIndex = data.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  data.users.splice(userIndex, 1);
  await writeData(data);

  res.json({ message: 'User deleted successfully' });
});

/**
 * GET /api/managers
 * Returns all users with role 'manager'
 * Useful for assigning managers to employees
 */
app.get('/api/managers', async (req, res) => {
  const data = await readData();
  const managers = data.users
    .filter(u => u.role === 'manager')
    .map(({ password, ...user }) => user);
  
  res.json(managers);
});

// ===== TASK MANAGEMENT ENDPOINTS (Andrei) =====

/**
 * POST /api/tasks
 * Creates a new task
 * Body: { title, description, dueDate, priority, createdBy, state }
 * Returns: Created task object
 */
app.post('/api/tasks', async (req, res) => {
  const { title, description, dueDate, priority, createdBy, state } = req.body;

  if (!title || !description || !createdBy) {
    return res.status(400).json({ error: 'Title, description, and createdBy are required' });
  }

  const data = await readData();

  // Create new task
  const newTask = {
    id: data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.id)) + 1 : 1,
    title,
    description,
    dueDate: dueDate || null,
    priority: priority || 'MEDIUM',
    createdBy,
    state: state || 'OPEN',
    assignedTo: null,
    assignedToName: null,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  data.tasks.push(newTask);
  await writeData(data);

  res.status(201).json(newTask);
});

/**
 * GET /api/tasks
 * Returns all tasks
 * Returns: Array of task objects
 */
app.get('/api/tasks', async (req, res) => {
  const data = await readData();
  res.json(data.tasks || []);
});

/**
 * GET /api/tasks/user/:userId
 * Returns all tasks assigned to a specific user
 * Returns: Array of task objects
 * NOTE: This must come before GET /api/tasks/:id
 */
app.get('/api/tasks/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const data = await readData();

  const userTasks = data.tasks.filter(t => t.assignedTo === userId);
  res.json(userTasks);
});

/**
 * GET /api/tasks/history/:userId
 * Returns task history for a specific manager
 * Shows all tasks created by this manager
 * Returns: Array of task objects
 * NOTE: This must come before GET /api/tasks/:id
 */
app.get('/api/tasks/history/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const data = await readData();

  const taskHistory = data.tasks.filter(t => t.createdBy === userId);
  res.json(taskHistory);
});

/**
 * GET /api/tasks/:id
 * Returns a specific task by ID
 * Returns: Task object
 * NOTE: This comes after specific routes like /user/:userId and /history/:userId
 */
app.get('/api/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const data = await readData();

  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

/**
 * PUT /api/tasks/:id/assign
 * Assigns a task to an employee
 * Body: { assignedTo, state }
 * Returns: Updated task object
 */
app.put('/api/tasks/:id/assign', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { assignedTo, state } = req.body;

  if (!assignedTo) {
    return res.status(400).json({ error: 'assignedTo is required' });
  }

  const data = await readData();
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Get employee name
  const employee = data.users.find(u => u.id === parseInt(assignedTo));
  const employeeName = employee ? employee.name : 'Unknown';

  // Update task
  data.tasks[taskIndex].assignedTo = parseInt(assignedTo);
  data.tasks[taskIndex].assignedToName = employeeName;
  if (state) {
    data.tasks[taskIndex].state = state;
  }

  await writeData(data);
  res.json(data.tasks[taskIndex]);
});

/**
 * PUT /api/tasks/:id/complete
 * Marks a task as completed
 * Body: { state }
 * Returns: Updated task object
 */
app.put('/api/tasks/:id/complete', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { state } = req.body;

  const data = await readData();
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Update task
  data.tasks[taskIndex].state = state || 'COMPLETED';
  data.tasks[taskIndex].completedAt = new Date().toISOString();

  await writeData(data);
  res.json(data.tasks[taskIndex]);
});

/**
 * PUT /api/tasks/:id/close
 * Closes a completed task
 * Body: { state }
 * Returns: Updated task object
 */
app.put('/api/tasks/:id/close', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { state } = req.body;

  const data = await readData();
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Update task
  data.tasks[taskIndex].state = state || 'CLOSED';

  await writeData(data);
  res.json(data.tasks[taskIndex]);
});

/**
 * DELETE /api/tasks/:id
 * Deletes a task
 * Returns: Success message
 */
app.delete('/api/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const data = await readData();

  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  data.tasks.splice(taskIndex, 1);
  await writeData(data);

  res.json({ message: 'Task deleted successfully' });
});

/**
 * PUT /api/tasks/:id
 * Updates a task
 * Body: { title, description, dueDate, priority, state }
 * Returns: Updated task object
 */
app.put('/api/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, dueDate, priority, state } = req.body;

  const data = await readData();
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Update task fields
  if (title) data.tasks[taskIndex].title = title;
  if (description) data.tasks[taskIndex].description = description;
  if (dueDate) data.tasks[taskIndex].dueDate = dueDate;
  if (priority) data.tasks[taskIndex].priority = priority;
  if (state) data.tasks[taskIndex].state = state;

  await writeData(data);
  res.json(data.tasks[taskIndex]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
});
