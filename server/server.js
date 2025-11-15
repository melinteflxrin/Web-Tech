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

// ===== TASK MANAGEMENT ENDPOINTS (Florin & Andrei) =====
// TODO: Florin & Andrei will add task-related endpoints here
// Example endpoints needed:
// - POST /api/tasks (create task - Manager)
// - GET /api/tasks (get all tasks - Manager)
// - PUT /api/tasks/:id/assign (assign task - Manager)
// - PUT /api/tasks/:id/complete (complete task - Employee)
// - PUT /api/tasks/:id/close (close task - Manager)
// - GET /api/tasks/user/:userId (get tasks for specific user)
// - GET /api/tasks/history/:userId (get task history)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
});
