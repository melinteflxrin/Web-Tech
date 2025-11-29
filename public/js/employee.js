/**
 * Employee Dashboard Module (Florin)
 * Handles employee task viewing, task completion, and task history
 * Allows employees to view assigned tasks and mark them as completed
 */

/**
 * Renders the employee dashboard page
 * Shows task interface for employees with My Tasks and Task History tabs
 */
async function renderEmployeePage() {
  const app = document.getElementById('app');
  const user = getCurrentUser();

  // Check if user is an employee
  if (!user || user.role !== 'employee') {
    window.location.hash = '#login';
    return;
  }

  app.innerHTML = `
    <div class="employee-container">
      <h1 class="card-title">My Tasks Dashboard</h1>
      
      <!-- Navigation Tabs -->
      <div class="employee-tabs">
        <button class="tab-btn active" onclick="switchEmployeeTab('my-tasks')">My Tasks</button>
        <button class="tab-btn" onclick="switchEmployeeTab('task-history')">Task History</button>
      </div>

      <!-- Content Area -->
      <div id="employee-content" class="card">
        <!-- Content will be loaded here -->
      </div>
    </div>
  `;

  // Load the default tab
  switchEmployeeTab('my-tasks');
}

/**
 * Switches between different employee dashboard tabs
 * @param {string} tab - The tab to switch to
 */
function switchEmployeeTab(tab) {
  // Update active tab button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  const contentDiv = document.getElementById('employee-content');

  // Load appropriate content
  switch(tab) {
    case 'my-tasks':
      loadMyTasks();
      break;
    case 'task-history':
      loadEmployeeTaskHistory();
      break;
  }
}

/**
 * Loads and displays tasks assigned to the current employee
 */
async function loadMyTasks() {
  const contentDiv = document.getElementById('employee-content');
  const user = getCurrentUser();

  try {
    const response = await fetch(`${API_URL}/tasks/user/${user.id}`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const tasks = await response.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      contentDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">You have no assigned tasks yet. Check back later!</p>';
      return;
    }

    // Separate active tasks (PENDING) from completed tasks
    const pendingTasks = tasks.filter(t => t.state === 'PENDING');
    const completedTasks = tasks.filter(t => t.state === 'COMPLETED' || t.state === 'CLOSED');

    let html = '<div class="tasks-container">';

    // Pending Tasks Section
    if (pendingTasks.length > 0) {
      html += `
        <div class="task-state-section">
          <h2 style="color: #17a2b8; border-bottom: 3px solid #17a2b8; padding-bottom: 0.5rem; margin-bottom: 1rem;">
            📋 Active Tasks (${pendingTasks.length})
          </h2>
          <div class="tasks-grid">
      `;

      pendingTasks.forEach(task => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
        const dueDateColor = isOverdue ? '#e74c3c' : '#333';
        
        html += `
          <div class="task-card" style="border-left: 4px solid #17a2b8;">
            <div class="task-card-header">
              <h3>${task.title}</h3>
              <span class="task-badge" style="background-color: #17a2b8; color: white;">PENDING</span>
            </div>
            
            <p class="task-description">${task.description}</p>
            
            <div class="task-meta">
              <p><strong>Due:</strong> <span style="color: ${dueDateColor}; font-weight: ${isOverdue ? 'bold' : 'normal'}">${task.dueDate || 'N/A'} ${isOverdue ? '⚠️ OVERDUE' : ''}</span></p>
              <p><strong>Priority:</strong> <span class="priority-badge priority-${task.priority ? task.priority.toLowerCase() : 'medium'}">${task.priority || 'MEDIUM'}</span></p>
              <p><strong>Assigned:</strong> ${new Date(task.createdAt).toLocaleDateString()}</p>
            </div>

            <div class="task-actions">
              <button class="btn btn-success" onclick="completeTask(${task.id})">✓ Mark as Completed</button>
              <button class="btn btn-secondary btn-small" onclick="viewTaskDetails(${task.id})">View Details</button>
            </div>
          </div>
        `;
      });

      html += '</div></div>';
    } else {
      html += `
        <div class="card" style="background-color: #d4edda; border-left: 4px solid #28a745; margin-bottom: 1.5rem;">
          <p style="margin: 0; color: #155724;">🎉 Great job! You have no pending tasks at the moment.</p>
        </div>
      `;
    }

    // Completed Tasks Section
    if (completedTasks.length > 0) {
      html += `
        <div class="task-state-section" style="margin-top: 2rem;">
          <h2 style="color: #28a745; border-bottom: 3px solid #28a745; padding-bottom: 0.5rem; margin-bottom: 1rem;">
            ✓ Recently Completed (${completedTasks.length})
          </h2>
          <div class="tasks-grid">
      `;

      completedTasks.slice(0, 3).forEach(task => {
        const stateColor = task.state === 'CLOSED' ? '#6c757d' : '#28a745';
        
        html += `
          <div class="task-card" style="border-left: 4px solid ${stateColor}; opacity: 0.8;">
            <div class="task-card-header">
              <h3>${task.title}</h3>
              <span class="task-badge" style="background-color: ${stateColor}; color: white;">${task.state}</span>
            </div>
            
            <p class="task-description">${task.description}</p>
            
            <div class="task-meta">
              <p><strong>Completed:</strong> ${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Priority:</strong> ${task.priority || 'N/A'}</p>
            </div>
          </div>
        `;
      });

      html += '</div></div>';
    }

    html += '</div>';
    contentDiv.innerHTML = html;

  } catch (error) {
    console.error('Error loading tasks:', error);
    contentDiv.innerHTML = `<p class="error-message">Failed to load tasks. Error: ${error.message}</p>`;
  }
}

/**
 * Marks a task as completed
 * @param {number} taskId - The task ID to complete
 */
async function completeTask(taskId) {
  if (!confirm('Are you sure you want to mark this task as completed?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ state: 'COMPLETED' })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task marked as completed! Your manager will review it.');
      loadMyTasks(); // Reload tasks
    } else {
      alert(`Error: ${data.error || 'Failed to complete task'}`);
    }
  } catch (error) {
    console.error('Error completing task:', error);
    alert('Failed to complete task. Make sure the server is running.');
  }
}

/**
 * Shows detailed view of a specific task
 * @param {number} taskId - The task ID to view
 */
async function viewTaskDetails(taskId) {
  const contentDiv = document.getElementById('employee-content');

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const task = await response.json();

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    const statusColor = {
      'OPEN': '#ffc107',
      'PENDING': '#17a2b8',
      'COMPLETED': '#28a745',
      'CLOSED': '#6c757d'
    }[task.state] || '#999';

    const html = `
      <div class="task-details-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; margin: 0;">Task Details</h2>
          <button class="btn btn-secondary" onclick="loadMyTasks()">← Back to My Tasks</button>
        </div>

        <div class="card" style="border-left: 4px solid ${statusColor};">
          <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
            <h1 style="font-size: 1.8rem; margin: 0; flex: 1;">${task.title}</h1>
            <span class="task-badge" style="background-color: ${statusColor}; color: white; font-size: 1rem;">${task.state}</span>
          </div>

          <div style="background-color: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 1.5rem 0;">
            <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Description</h3>
            <p style="line-height: 1.8; margin: 0;">${task.description}</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
            <div style="padding: 1rem; background-color: #e3f2fd; border-radius: 4px;">
              <p style="font-weight: bold; margin-bottom: 0.3rem; color: #1976d2;">Due Date</p>
              <p style="margin: 0; font-size: 1.1rem; color: ${isOverdue ? '#e74c3c' : '#333'}; font-weight: ${isOverdue ? 'bold' : 'normal'}">
                ${task.dueDate || 'Not set'} ${isOverdue ? '⚠️' : ''}
              </p>
            </div>

            <div style="padding: 1rem; background-color: #f3e5f5; border-radius: 4px;">
              <p style="font-weight: bold; margin-bottom: 0.3rem; color: #7b1fa2;">Priority</p>
              <p style="margin: 0; font-size: 1.1rem;">
                <span class="priority-badge priority-${task.priority ? task.priority.toLowerCase() : 'medium'}">${task.priority || 'MEDIUM'}</span>
              </p>
            </div>

            <div style="padding: 1rem; background-color: #e8f5e9; border-radius: 4px;">
              <p style="font-weight: bold; margin-bottom: 0.3rem; color: #388e3c;">Assigned Date</p>
              <p style="margin: 0; font-size: 1.1rem;">${new Date(task.createdAt).toLocaleDateString()}</p>
            </div>

            ${task.completedAt ? `
            <div style="padding: 1rem; background-color: #fff3e0; border-radius: 4px;">
              <p style="font-weight: bold; margin-bottom: 0.3rem; color: #f57c00;">Completed Date</p>
              <p style="margin: 0; font-size: 1.1rem;">${new Date(task.completedAt).toLocaleDateString()}</p>
            </div>
            ` : ''}
          </div>

          ${task.state === 'PENDING' ? `
          <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #ddd;">
            <button class="btn btn-success" style="font-size: 1.1rem; padding: 0.8rem 2rem;" onclick="completeTask(${task.id})">✓ Mark as Completed</button>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    contentDiv.innerHTML = html;

  } catch (error) {
    console.error('Error loading task details:', error);
    alert('Failed to load task details. Make sure the server is running.');
    loadMyTasks();
  }
}

/**
 * Loads and displays task history for the employee
 * Shows all tasks that have been assigned to the employee
 */
async function loadEmployeeTaskHistory() {
  const contentDiv = document.getElementById('employee-content');
  const user = getCurrentUser();

  try {
    const response = await fetch(`${API_URL}/tasks/user/${user.id}`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const tasks = await response.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      contentDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No task history available yet.</p>';
      return;
    }

    // Sort tasks by creation date (newest first)
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.state === 'COMPLETED' || t.state === 'CLOSED').length;
    const pendingTasks = tasks.filter(t => t.state === 'PENDING').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let html = `
      <div class="task-history-container">
        <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">📊 Task History & Statistics</h2>

        <!-- Statistics Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Total Tasks</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">${totalTasks}</p>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Active Tasks</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">${pendingTasks}</p>
          </div>

          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Completed</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">${completedTasks}</p>
          </div>

          <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Completion Rate</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">${completionRate}%</p>
          </div>
        </div>

        <!-- Task History Table -->
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">All Tasks</h3>
        <div style="overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned Date</th>
                <th>Due Date</th>
                <th>Completed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
    `;

    tasks.forEach(task => {
      const statusColor = {
        'OPEN': '#ffc107',
        'PENDING': '#17a2b8',
        'COMPLETED': '#28a745',
        'CLOSED': '#6c757d'
      }[task.state] || '#999';

      const isOverdue = task.state === 'PENDING' && task.dueDate && new Date(task.dueDate) < new Date();

      html += `
        <tr>
          <td>${task.title}</td>
          <td><span class="task-badge" style="background-color: ${statusColor}; color: white;">${task.state}</span></td>
          <td><span class="priority-badge priority-${task.priority ? task.priority.toLowerCase() : 'medium'}">${task.priority || 'MEDIUM'}</span></td>
          <td>${new Date(task.createdAt).toLocaleDateString()}</td>
          <td style="color: ${isOverdue ? '#e74c3c' : 'inherit'}; font-weight: ${isOverdue ? 'bold' : 'normal'}">
            ${task.dueDate || 'N/A'} ${isOverdue ? '⚠️' : ''}
          </td>
          <td>${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '-'}</td>
          <td>
            <button class="btn btn-secondary btn-small" onclick="viewTaskDetails(${task.id})">View</button>
            ${task.state === 'PENDING' ? `<button class="btn btn-success btn-small" onclick="completeTask(${task.id})">Complete</button>` : ''}
          </td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    contentDiv.innerHTML = html;

  } catch (error) {
    console.error('Error loading task history:', error);
    contentDiv.innerHTML = `<p class="error-message">Failed to load task history. Error: ${error.message}</p>`;
  }
}

// Make functions globally accessible for onclick
window.switchEmployeeTab = switchEmployeeTab;
window.completeTask = completeTask;
window.viewTaskDetails = viewTaskDetails;
