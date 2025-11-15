/**
 * Authentication Module (Alex)
 * Handles user login, logout, and session management
 * Uses localStorage to store current user session
 */

const API_URL = 'http://localhost:3000/api';

/**
 * Renders the login page
 */
function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">Task Planning App</h1>
        <div id="login-error" style="display: none;" class="error-message"></div>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
        </form>
        <p style="margin-top: 1.5rem; text-align: center; color: #666; font-size: 0.9rem;">
          Demo accounts:<br>
          Admin: admin@task.com / admin123<br>
          Manager: john@task.com / pass123<br>
          Employee: jane@task.com / pass123
        </p>
      </div>
    </div>
  `;

  // Hide navbar on login page
  document.getElementById('navbar').style.display = 'none';

  // Handle login form submission
  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

/**
 * Handles login form submission
 * Sends credentials to API and stores user session
 */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      // Redirect based on role
      window.location.hash = data.user.role === 'admin' ? '#admin' : '#dashboard';
      
      // Reload the app
      if (typeof loadApp === 'function') {
        loadApp();
      }
    } else {
      // Show error message
      errorDiv.textContent = data.error || 'Login failed';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Connection error. Make sure the server is running.';
    errorDiv.style.display = 'block';
    console.error('Login error:', error);
  }
}

/**
 * Handles user logout
 * Clears session and redirects to login page
 */
function handleLogout() {
  localStorage.removeItem('currentUser');
  window.location.hash = '#login';
  if (typeof loadApp === 'function') {
    loadApp();
  }
}

/**
 * Gets the currently logged in user from localStorage
 * Returns null if no user is logged in
 */
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Checks if user is authenticated
 * Returns true if logged in, false otherwise
 */
function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Updates the navbar with current user info
 */
function updateNavbar() {
  const user = getCurrentUser();
  if (user) {
    document.getElementById('navbar').style.display = 'block';
    document.getElementById('user-name').textContent = `${user.name} (${user.role})`;
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.onclick = handleLogout;
  } else {
    document.getElementById('navbar').style.display = 'none';
  }
}
