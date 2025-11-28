/**
 * Main Application Router (Alex)
 * Handles Single Page Application routing and page loading
 * Coordinates between different modules (auth, admin, tasks, etc.)
 */

/**
 * Main function to load the appropriate page based on route
 * Called on page load and whenever the hash changes
 */
function loadApp() {
  const hash = window.location.hash.slice(1) || 'login'; // Remove # from hash
  const user = getCurrentUser();

  // If not logged in, always show login page
  if (!user && hash !== 'login') {
    window.location.hash = '#login';
    renderLoginPage();
    return;
  }

  // If logged in and trying to access login, redirect to dashboard
  if (user && hash === 'login') {
    window.location.hash = user.role === 'admin' ? '#admin' : '#dashboard';
    return;
  }

  // Update navbar if user is logged in
  if (user) {
    updateNavbar();
  }

  // Route to appropriate page
  switch (hash) {
    case 'login':
      renderLoginPage();
      break;
    
    case 'admin':
      // Only admins can access admin page
      if (user && user.role === 'admin') {
        renderAdminPage();
      } else {
        alert('Access denied. Admin privileges required.');
        window.location.hash = '#dashboard';
      }
      break;
    
    case 'manager':
      // Only managers can access manager page
      if (user && user.role === 'manager') {
        renderManagerPage();
      } else {
        alert('Access denied. Manager privileges required.');
        window.location.hash = '#dashboard';
      }
      break;
    
    case 'dashboard':
      renderDashboard();
      break;
    
    // TODO: Florin will add more routes here
    // case 'my-tasks':
    //   renderMyTasksPage(); (Florin)
    //   break;
    // case 'history':
    //   renderHistoryPage(); (Florin)
    //   break;
    
    default:
      renderDashboard();
  }
}

/**
 * Renders a basic dashboard page
 * Florin & Andrei will customize this based on user role
 */
function renderDashboard() {
  const app = document.getElementById('app');
  const user = getCurrentUser();

  if (!user) {
    window.location.hash = '#login';
    return;
  }

  // Basic dashboard - teammates can expand this
  app.innerHTML = `
    <div class="card">
      <h1 class="card-title">Welcome, ${user.name}!</h1>
      <p>Role: <strong>${user.role.toUpperCase()}</strong></p>
      
      <div class="mt-3">
        <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Quick Links</h2>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          ${user.role === 'admin' ? '<a href="#admin" class="btn btn-primary">User Management</a>' : ''}
          ${user.role === 'manager' ? '<a href="#manager" class="btn btn-primary">Task Management</a>' : ''}
          ${user.role === 'employee' ? '<!-- Florin: Add employee links here -->' : ''}
        </div>
      </div>

      <div class="mt-3">
        <div class="card" style="background-color: #e8f4f8; border-left: 4px solid #3498db;">
          <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">📝 For Teammates</h3>
          <p style="font-size: 0.9rem; margin: 0;">
            <strong>Andrei (Manager):</strong> Add task management, task creation, and task history views here.<br>
            <strong>Florin (Employee):</strong> Add "My Tasks" page, task completion functionality, and task history here.
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize the application
 * Sets up event listeners and loads initial page
 */
function initApp() {
  // Load the current page
  loadApp();

  // Listen for hash changes (navigation)
  window.addEventListener('hashchange', loadApp);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
