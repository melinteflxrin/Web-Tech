/**
 * Admin Dashboard Module (Alex)
 * Handles user management functionality for administrators
 * Allows creating, viewing, editing, and deleting users
 */

/**
 * Renders the admin dashboard page
 * Shows list of all users and form to add new users
 */
async function renderAdminPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <h1 class="card-title">User Management</h1>
      
      <!-- Add User Form -->
      <div class="card" style="background-color: #f8f9fa;">
        <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Add New User</h2>
        <form id="add-user-form">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div class="form-group">
              <label for="new-name">Name</label>
              <input type="text" id="new-name" required>
            </div>
            <div class="form-group">
              <label for="new-email">Email</label>
              <input type="email" id="new-email" required>
            </div>
            <div class="form-group">
              <label for="new-password">Password</label>
              <input type="password" id="new-password" required>
            </div>
            <div class="form-group">
              <label for="new-role">Role</label>
              <select id="new-role" required>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-group" id="manager-field">
              <label for="new-manager">Assign Manager <span style="color: red;">*</span></label>
              <select id="new-manager">
                <option value="">Select a manager...</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-success">Add User</button>
        </form>
      </div>

      <!-- Users List -->
      <div class="mt-3">
        <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">All Users</h2>
        <div id="users-list">Loading users...</div>
      </div>
    </div>
  `;

  // Load managers for dropdown
  await loadManagersDropdown();

  // Load and display all users
  await loadUsers();

  // Setup form submission
  document.getElementById('add-user-form').addEventListener('submit', handleAddUser);

  // Update role field to show/hide manager dropdown and set required attribute
  document.getElementById('new-role').addEventListener('change', function() {
    const managerField = document.getElementById('manager-field');
    const managerSelect = document.getElementById('new-manager');
    
    if (this.value === 'employee') {
      managerField.style.display = 'block';
      managerSelect.required = true;
    } else {
      managerField.style.display = 'none';
      managerSelect.required = false;
      managerSelect.value = ''; // Clear selection for non-employees
    }
  });
}

/**
 * Loads all managers into the dropdown for assigning managers to employees
 */
async function loadManagersDropdown() {
  try {
    const response = await fetch(`${API_URL}/managers`);
    const managers = await response.json();

    const dropdown = document.getElementById('new-manager');
    managers.forEach(manager => {
      const option = document.createElement('option');
      option.value = manager.id;
      option.textContent = manager.name;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading managers:', error);
  }
}

/**
 * Loads and displays all users in a table
 */
async function loadUsers() {
  const listDiv = document.getElementById('users-list');

  try {
    const response = await fetch(`${API_URL}/users`);
    const users = await response.json();

    if (users.length === 0) {
      listDiv.innerHTML = '<p>No users found.</p>';
      return;
    }

    // Create table
    let html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Manager</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const user of users) {
      // Get manager name if user has a manager
      let managerName = 'N/A';
      if (user.managerId) {
        const manager = users.find(u => u.id === user.managerId);
        managerName = manager ? manager.name : 'Unknown';
      }

      html += `
        <tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td><strong>${user.role.toUpperCase()}</strong></td>
          <td>${managerName}</td>
          <td>
            <button class="btn btn-danger btn-small" onclick="handleDeleteUser(${user.id}, '${user.name}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    }

    html += `
        </tbody>
      </table>
    `;

    listDiv.innerHTML = html;
  } catch (error) {
    console.error('Error loading users:', error);
    listDiv.innerHTML = '<p class="error-message">Failed to load users. Make sure the server is running.</p>';
  }
}

/**
 * Handles adding a new user
 * Called when add user form is submitted
 */
async function handleAddUser(event) {
  event.preventDefault();

  const name = document.getElementById('new-name').value;
  const email = document.getElementById('new-email').value;
  const password = document.getElementById('new-password').value;
  const role = document.getElementById('new-role').value;
  const managerId = document.getElementById('new-manager').value || null;

  // Validate that employees have a manager assigned
  if (role === 'employee' && !managerId) {
    alert('Employees must have a manager assigned!');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        managerId: managerId ? parseInt(managerId) : null
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`User "${name}" added successfully!`);
      
      // Reset form
      document.getElementById('add-user-form').reset();
      
      // Reload users list
      await loadUsers();
      await loadManagersDropdown(); // Refresh in case new manager was added
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Failed to add user. Make sure the server is running.');
  }
}

/**
 * Handles deleting a user
 * Called when delete button is clicked on a user row
 * Note: This function is called from onclick in HTML, so it's global
 */
async function handleDeleteUser(userId, userName) {
  if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok) {
      alert(`User "${userName}" deleted successfully!`);
      
      // Reload users list
      await loadUsers();
      await loadManagersDropdown(); // Refresh manager list
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Failed to delete user. Make sure the server is running.');
  }
}

// Make handleDeleteUser globally accessible for onclick
window.handleDeleteUser = handleDeleteUser;
