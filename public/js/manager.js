/**
 * Manager Dashboard Module (Andrei)
 * Handles task management functionality for managers
 * Allows creating, viewing, allocating, and closing tasks
 */

/**
 * Renders the manager dashboard page
 * Shows task management interface with multiple sections
 */
async function renderManagerPage() {
  const app = document.getElementById('app');
  const user = getCurrentUser();

  // Check if user is a manager
  if (!user || user.role !== 'manager') {
    window.location.hash = '#login';
    return;
  }

  app.innerHTML = `
    <div class="manager-container">
      <h1 class="card-title">Task Management Dashboard</h1>
      
      <!-- Navigation Tabs -->
      <div class="manager-tabs">
        <button class="tab-btn active" onclick="switchManagerTab('all-tasks')">All Tasks</button>
        <button class="tab-btn" onclick="switchManagerTab('create-task')">Create Task</button>
        <button class="tab-btn" onclick="switchManagerTab('task-history')">Task History</button>
      </div>

      <!-- Content Area -->
      <div id="manager-content" class="card">
        <!-- Content will be loaded here -->
      </div>
    </div>
  `;

  // Load the default tab
  switchManagerTab('all-tasks');
}

/**
 * Switches between different manager dashboard tabs
 * @param {string} tab - The tab to switch to
 */
function switchManagerTab(tab) {
  // Update active tab button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  const contentDiv = document.getElementById('manager-content');

  // Load appropriate content
  switch(tab) {
    case 'all-tasks':
      loadAllTasks();
      break;
    case 'create-task':
      showCreateTaskForm();
      break;
    case 'task-history':
      loadTaskHistory();
      break;
  }
}

/**
 * Loads and displays all tasks
 */
async function loadAllTasks() {
  const contentDiv = document.getElementById('manager-content');

  try {
    const response = await fetch(`${API_URL}/tasks`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const tasks = await response.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      contentDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No tasks created yet. Create your first task!</p>';
      return;
    }

    // Group tasks by state
    const tasksByState = {
      'OPEN': [],
      'PENDING': [],
      'COMPLETED': [],
      'CLOSED': []
    };

    tasks.forEach(task => {
      if (tasksByState[task.state]) {
        tasksByState[task.state].push(task);
      }
    });

    // Create HTML
    let html = '<div class="tasks-container">';

    // OPEN tasks
    if (tasksByState['OPEN'].length > 0) {
      html += createTasksSection('OPEN', tasksByState['OPEN'], '#ffc107');
    }

    // PENDING tasks
    if (tasksByState['PENDING'].length > 0) {
      html += createTasksSection('PENDING', tasksByState['PENDING'], '#17a2b8');
    }

    // COMPLETED tasks
    if (tasksByState['COMPLETED'].length > 0) {
      html += createTasksSection('COMPLETED', tasksByState['COMPLETED'], '#28a745');
    }

    // CLOSED tasks
    if (tasksByState['CLOSED'].length > 0) {
      html += createTasksSection('CLOSED', tasksByState['CLOSED'], '#6c757d');
    }

    html += '</div>';
    contentDiv.innerHTML = html;

  } catch (error) {
    console.error('Error loading tasks:', error);
    contentDiv.innerHTML = `<p class="error-message">Failed to load tasks. Error: ${error.message}</p>`;
  }
}

/**
 * Creates a section for tasks of a specific state
 * @param {string} state - The task state (OPEN, PENDING, etc.)
 * @param {array} tasks - Array of tasks in this state
 * @param {string} color - Color for the section header
 * @returns {string} HTML for the section
 */
function createTasksSection(state, tasks, color) {
  let html = `
    <div class="task-state-section">
      <h2 style="color: ${color}; border-bottom: 3px solid ${color}; padding-bottom: 0.5rem; margin-bottom: 1rem;">
        ${state} (${tasks.length})
      </h2>
      <div class="tasks-grid">
  `;

  tasks.forEach(task => {
    html += `
      <div class="task-card" style="border-left: 4px solid ${color};">
        <div class="task-card-header">
          <h3>${task.title}</h3>
          <span class="task-badge" style="background-color: ${color}; color: white;">${state}</span>
        </div>
        
        <p class="task-description">${task.description}</p>
        
        <div class="task-meta">
          <p><strong>Due:</strong> ${task.dueDate || 'N/A'}</p>
          <p><strong>Priority:</strong> ${task.priority || 'N/A'}</p>
          <p><strong>Assigned to:</strong> ${task.assignedTo || 'Unassigned'}</p>
          <p><strong>Created:</strong> ${new Date(task.createdAt).toLocaleDateString()}</p>
        </div>

        <div class="task-actions">
          ${state === 'OPEN' ? `<button class="btn btn-primary btn-small" onclick="showAllocateForm(${task.id})">Allocate</button>` : ''}
          ${state === 'COMPLETED' ? `<button class="btn btn-success btn-small" onclick="closeTask(${task.id})">Close Task</button>` : ''}
          ${state !== 'CLOSED' ? `<button class="btn btn-secondary btn-small" onclick="editTask(${task.id})">Edit</button>` : ''}
          <button class="btn btn-danger btn-small" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Shows the create task form
 */
function showCreateTaskForm() {
  const contentDiv = document.getElementById('manager-content');

  contentDiv.innerHTML = `
    <form id="create-task-form" onsubmit="handleCreateTask(event)">
      <h2 style="font-size: 1.2rem; margin-bottom: 1.5rem;">Create New Task</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        <div class="form-group">
          <label for="task-title">Task Title <span style="color: red;">*</span></label>
          <input type="text" id="task-title" required placeholder="Enter task title">
        </div>

        <div class="form-group">
          <label for="task-due-date">Due Date <span style="color: red;">*</span></label>
          <input type="date" id="task-due-date" required>
        </div>

        <div class="form-group">
          <label for="task-priority">Priority</label>
          <select id="task-priority">
            <option value="LOW">Low</option>
            <option value="MEDIUM" selected>Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="task-description">Description <span style="color: red;">*</span></label>
        <textarea id="task-description" rows="5" required placeholder="Enter task description"></textarea>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 2rem;">
        <button type="submit" class="btn btn-success">Create Task</button>
        <button type="button" class="btn btn-secondary" onclick="switchManagerTab('all-tasks')">Cancel</button>
      </div>
    </form>
  `;
}

/**
 * Handles creating a new task
 */
async function handleCreateTask(event) {
  event.preventDefault();

  const user = getCurrentUser();

  const taskData = {
    title: document.getElementById('task-title').value,
    description: document.getElementById('task-description').value,
    dueDate: document.getElementById('task-due-date').value,
    priority: document.getElementById('task-priority').value,
    createdBy: user.id,
    state: 'OPEN',
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      const data = await response.json();
      alert(`Error: ${data.error || 'Failed to create task'}`);
      return;
    }

    const data = await response.json();
    alert('Task created successfully!');
    document.getElementById('create-task-form').reset();
    
    // Add a small delay before loading tasks to ensure task is written to file
    setTimeout(() => {
      switchManagerTab('all-tasks');
    }, 500);
    
  } catch (error) {
    console.error('Error creating task:', error);
    alert('Failed to create task. Make sure the server is running.');
  }
}

/**
 * Shows the allocate task form
 * @param {number} taskId - The task ID to allocate
 */
async function showAllocateForm(taskId) {
  const contentDiv = document.getElementById('manager-content');

  try {
    // Get all users
    const response = await fetch(`${API_URL}/users`);
    const users = await response.json();
    const employees = users.filter(u => u.role === 'employee');

    if (employees.length === 0) {
      alert('No employees available to allocate tasks to.');
      return;
    }

    let html = `
      <form onsubmit="handleAllocateTask(event, ${taskId})">
        <h2 style="font-size: 1.2rem; margin-bottom: 1.5rem;">Allocate Task to Employee</h2>

        <div class="form-group">
          <label for="allocate-employee">Select Employee <span style="color: red;">*</span></label>
          <select id="allocate-employee" required>
            <option value="">-- Select an employee --</option>
    `;

    employees.forEach(emp => {
      html += `<option value="${emp.id}">${emp.name} (${emp.email})</option>`;
    });

    html += `
          </select>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button type="submit" class="btn btn-success">Allocate Task</button>
          <button type="button" class="btn btn-secondary" onclick="loadAllTasks()">Cancel</button>
        </div>
      </form>
    `;

    contentDiv.innerHTML = html;
    contentDiv.classList.add('card');

  } catch (error) {
    console.error('Error loading employees:', error);
    alert('Failed to load employees. Make sure the server is running.');
  }
}

/**
 * Handles allocating a task to an employee
 */
async function handleAllocateTask(event, taskId) {
  event.preventDefault();

  const employeeId = document.getElementById('allocate-employee').value;

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assignedTo: employeeId,
        state: 'PENDING'
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task allocated successfully!');
      loadAllTasks();
    } else {
      alert(`Error: ${data.error || 'Failed to allocate task'}`);
    }
  } catch (error) {
    console.error('Error allocating task:', error);
    alert('Failed to allocate task. Make sure the server is running.');
  }
}

/**
 * Closes a completed task
 * @param {number} taskId - The task ID to close
 */
async function closeTask(taskId) {
  if (!confirm('Are you sure you want to close this task?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/close`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ state: 'CLOSED' })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task closed successfully!');
      loadAllTasks();
    } else {
      alert(`Error: ${data.error || 'Failed to close task'}`);
    }
  } catch (error) {
    console.error('Error closing task:', error);
    alert('Failed to close task. Make sure the server is running.');
  }
}

/**
 * Shows the edit task form
 * @param {number} taskId - The task ID to edit
 */
async function editTask(taskId) {
  const contentDiv = document.getElementById('manager-content');

  try {
    // Get the task to edit
    const response = await fetch(`${API_URL}/tasks/${taskId}`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const task = await response.json();

    // Show edit form
    let html = `
      <form onsubmit="handleEditTask(event, ${taskId})">
        <h2 style="font-size: 1.2rem; margin-bottom: 1.5rem;">Edit Task</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
          <div class="form-group">
            <label for="edit-task-title">Task Title <span style="color: red;">*</span></label>
            <input type="text" id="edit-task-title" required placeholder="Enter task title" value="${task.title}">
          </div>

          <div class="form-group">
            <label for="edit-task-due-date">Due Date <span style="color: red;">*</span></label>
            <input type="date" id="edit-task-due-date" required value="${task.dueDate || ''}">
          </div>

          <div class="form-group">
            <label for="edit-task-priority">Priority</label>
            <select id="edit-task-priority">
              <option value="LOW" ${task.priority === 'LOW' ? 'selected' : ''}>Low</option>
              <option value="MEDIUM" ${task.priority === 'MEDIUM' ? 'selected' : ''}>Medium</option>
              <option value="HIGH" ${task.priority === 'HIGH' ? 'selected' : ''}>High</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="edit-task-description">Description <span style="color: red;">*</span></label>
          <textarea id="edit-task-description" rows="5" required placeholder="Enter task description">${task.description}</textarea>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button type="submit" class="btn btn-success">Save Changes</button>
          <button type="button" class="btn btn-secondary" onclick="loadAllTasks()">Cancel</button>
        </div>
      </form>
    `;

    contentDiv.innerHTML = html;
  } catch (error) {
    console.error('Error loading task for edit:', error);
    alert('Failed to load task for editing. Make sure the server is running.');
  }
}

/**
 * Handles saving edited task
 */
async function handleEditTask(event, taskId) {
  event.preventDefault();

  const taskData = {
    title: document.getElementById('edit-task-title').value,
    description: document.getElementById('edit-task-description').value,
    dueDate: document.getElementById('edit-task-due-date').value,
    priority: document.getElementById('edit-task-priority').value
  };

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      const data = await response.json();
      alert(`Error: ${data.error || 'Failed to update task'}`);
      return;
    }

    alert('Task updated successfully!');
    loadAllTasks();
  } catch (error) {
    console.error('Error updating task:', error);
    alert('Failed to update task. Make sure the server is running.');
  }
}

/**
 * Deletes a task
 * @param {number} taskId - The task ID to delete
 */
async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task deleted successfully!');
      loadAllTasks();
    } else {
      alert(`Error: ${data.error || 'Failed to delete task'}`);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Failed to delete task. Make sure the server is running.');
  }
}

/**
 * Loads and displays task history for the manager
 */
async function loadTaskHistory() {
  const contentDiv = document.getElementById('manager-content');
  const user = getCurrentUser();

  try {
    const response = await fetch(`${API_URL}/tasks/history/${user.id}`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const history = await response.json();

    if (!Array.isArray(history) || history.length === 0) {
      contentDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No task history available.</p>';
      return;
    }

    // Create table
    let html = `
      <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Task History</h2>
      <table>
        <thead>
          <tr>
            <th>Task Title</th>
            <th>Assigned to</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created</th>
            <th>Due Date</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
    `;

    history.forEach(task => {
      const statusColor = {
        'OPEN': '#ffc107',
        'PENDING': '#17a2b8',
        'COMPLETED': '#28a745',
        'CLOSED': '#6c757d'
      }[task.state] || '#999';

      html += `
        <tr>
          <td>${task.title}</td>
          <td>${task.assignedToName || 'N/A'}</td>
          <td><span class="task-badge" style="background-color: ${statusColor}; color: white;">${task.state}</span></td>
          <td>${task.priority || 'N/A'}</td>
          <td>${new Date(task.createdAt).toLocaleDateString()}</td>
          <td>${task.dueDate || 'N/A'}</td>
          <td>${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '-'}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    contentDiv.innerHTML = html;
  } catch (error) {
    console.error('Error loading task history:', error);
    contentDiv.innerHTML = `<p class="error-message">Failed to load task history. Error: ${error.message}</p>`;
  }
}

// Make functions globally accessible for onclick
window.switchManagerTab = switchManagerTab;
window.showAllocateForm = showAllocateForm;
window.handleAllocateTask = handleAllocateTask;
window.closeTask = closeTask;
window.editTask = editTask;
window.handleEditTask = handleEditTask;
window.deleteTask = deleteTask;
