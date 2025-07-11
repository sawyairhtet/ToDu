/**
 * UI Manager - User Interface Operations
 * Handles DOM manipulation, modals, notifications, and UI interactions
 */

export class UIManager {
  constructor() {
    this.modals = new Map();
    this.notifications = [];
    this.currentTheme = 'light';
    this.init();
  }

  /**
   * Initialize UI manager
   */
  init() {
    this.setupModals();
    this.setupNotificationContainer();
    this.setupTheme();
  }

  /**
   * Setup modal system
   */
  setupModals() {
    document.addEventListener('click', e => {
      // Close modal when clicking backdrop
      if (e.target.classList.contains('modal')) {
        this.hideModal(e.target.id);
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.hideAllModals();
      }
    });
  }

  /**
   * Setup notification container
   */
  setupNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(container);
    }
  }

  /**
   * Setup theme system
   */
  setupTheme() {
    // Detect system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    prefersDark.addEventListener('change', e => {
      if (this.currentTheme === 'system') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Show modal
   * @param {string} modalId - Modal element ID
   * @param {Object} options - Modal options
   */
  showModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('entering');

    // Store modal state
    this.modals.set(modalId, {
      isOpen: true,
      options
    });

    // Focus management
    const firstFocusable = modal.querySelector('input, button, [tabindex]');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }

    // Remove entrance animation class
    setTimeout(() => {
      modal.classList.remove('entering');
    }, 200);
  }

  /**
   * Hide modal
   * @param {string} modalId - Modal element ID
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || modal.classList.contains('hidden')) return;

    modal.classList.add('leaving');

    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('leaving');
      this.modals.delete(modalId);
    }, 200);
  }

  /**
   * Hide all open modals
   */
  hideAllModals() {
    for (const modalId of this.modals.keys()) {
      this.hideModal(modalId);
    }
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} duration - Auto-hide duration in ms
   */
  showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = this.createNotificationElement(message, type);
    container.appendChild(notification);

    this.notifications.push(notification);

    // Auto-hide
    if (duration > 0) {
      setTimeout(() => {
        this.hideNotification(notification);
      }, duration);
    }

    return notification;
  }

  /**
   * Create notification element
   * @param {string} message - Message text
   * @param {string} type - Notification type
   * @returns {HTMLElement} Notification element
   */
  createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification bg-surface border border-light rounded-lg shadow-lg p-4 
                             transition-all flex items-center gap-3 max-w-sm animate-slide-in-down`;

    const icon = this.getNotificationIcon(type);
    const colorClass = this.getNotificationColorClass(type);

    notification.innerHTML = `
      <div class="flex-shrink-0 ${colorClass}">
        ${icon}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-primary">${this.escapeHtml(message)}</p>
      </div>
      <button class="flex-shrink-0 text-secondary hover:text-primary transition-colors" 
              onclick="this.parentElement.remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    return notification;
  }

  /**
   * Get notification icon based on type
   * @param {string} type - Notification type
   * @returns {string} SVG icon
   */
  getNotificationIcon(type) {
    const icons = {
      success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>`,
      error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>`,
      warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>`,
      info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>`
    };
    return icons[type] || icons.info;
  }

  /**
   * Get notification color class based on type
   * @param {string} type - Notification type
   * @returns {string} CSS color class
   */
  getNotificationColorClass(type) {
    const colors = {
      success: 'text-green',
      error: 'text-red',
      warning: 'text-orange',
      info: 'text-blue'
    };
    return colors[type] || colors.info;
  }

  /**
   * Hide notification
   * @param {HTMLElement} notification - Notification element
   */
  hideNotification(notification) {
    if (!notification || !notification.parentNode) return;

    notification.classList.add('animate-slide-out-up');

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }

      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 300);
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications() {
    this.notifications.forEach(notification => {
      this.hideNotification(notification);
    });
  }

  /**
   * Apply theme
   * @param {string} theme - Theme name (light, dark, system)
   */
  applyTheme(theme) {
    const html = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    this.currentTheme = theme;
  }

  /**
   * Create task item HTML
   * @param {Object} task - Task object
   * @returns {string} HTML string
   */
  createTaskHTML(task) {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && !task.completed;
    const isDueToday = dueDate && this.isToday(dueDate) && !task.completed;

    const dueDateClass = isOverdue ? 'due-overdue' : isDueToday ? 'due-today' : '';

    const priorityClass = `priority-${task.priority}`;
    const completedClass = task.completed ? 'completed' : '';

    return `
      <div class="task-item ${priorityClass} ${completedClass}" data-task-id="${task.id}">
        <div class="priority-indicator"></div>
        <div class="task-content">
          <div class="task-checkbox">
            <label class="checkbox">
              <input type="checkbox" ${task.completed ? 'checked' : ''} 
                     onchange="window.app.toggleTask('${task.id}')">
              <span class="checkbox-mark"></span>
            </label>
          </div>
          
          <div class="task-details">
            <p class="task-text">${this.escapeHtml(task.text)}</p>
            
            <div class="task-meta">
              ${
                task.category
                  ? `<span class="badge badge-secondary">${this.escapeHtml(task.category)}</span>`
                  : ''
              }
              
              <span class="badge ${this.getPriorityBadgeClass(task.priority)}">
                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              
              ${
                task.dueDate
                  ? `
                <span class="badge ${dueDateClass}">
                  📅 ${this.formatDate(task.dueDate)}
                  ${isOverdue ? ' (Overdue)' : isDueToday ? ' (Today)' : ''}
                </span>
              `
                  : ''
              }
            </div>
            
            <div class="text-xs text-secondary mt-1">
              Created: ${this.formatDateTime(task.createdAt)}
              ${task.completedAt ? ` • Completed: ${this.formatDateTime(task.completedAt)}` : ''}
            </div>
          </div>
          
          <div class="task-actions">
            <button class="btn btn-ghost btn-icon" onclick="window.app.editTask('${task.id}')" 
                    title="Edit task">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            
            <button class="btn btn-ghost btn-icon text-red" onclick="window.app.deleteTask('${
              task.id
            }')" 
                    title="Delete task">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render tasks list
   * @param {Array} tasks - Array of tasks
   * @param {HTMLElement} container - Container element
   */
  renderTasks(tasks, container) {
    if (!container) return;

    // Clear container for both empty and non-empty states
    container.innerHTML = '';

    if (tasks.length > 0) {
      container.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
    }
    // For empty state, we let the app.js handle showing the HTML empty state element
  }

  /**
   * Get priority badge class
   * @param {string} priority - Priority level
   * @returns {string} CSS class
   */
  getPriorityBadgeClass(priority) {
    const classes = {
      high: 'badge-error',
      medium: 'badge-warning',
      low: 'badge-success'
    };
    return classes[priority] || classes.medium;
  }

  /**
   * Update category filter options
   * @param {Array} categories - Array of categories
   */
  updateCategoryFilter(categories) {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });

    // Restore selection if still valid
    if (categories.includes(currentValue)) {
      select.value = currentValue;
    }
  }

  /**
   * Show loading state
   * @param {HTMLElement} element - Element to show loading in
   */
  showLoading(element) {
    if (!element) return;

    element.classList.add('loading');
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.id = 'loading-spinner';
    element.appendChild(spinner);
  }

  /**
   * Hide loading state
   * @param {HTMLElement} element - Element to hide loading from
   */
  hideLoading(element) {
    if (!element) return;

    element.classList.remove('loading');
    const spinner = element.querySelector('#loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  }

  /**
   * Utility methods
   */

  /**
   * Check if a date is today
   * @param {Date} date - Date to check
   * @returns {boolean} Is today
   */
  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }

  /**
   * Format date and time for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date and time
   */
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
