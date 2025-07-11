/**
 * Main Application - ToDu Task Manager
 * Coordinates all modules and handles application lifecycle
 */

import { TaskManager } from './taskManager.js';
import { UIManager } from './ui.js';
import { StorageManager } from './storage.js';
import Sortable from 'sortablejs';

class ToDoApp {
  constructor() {
    this.taskManager = new TaskManager();
    this.ui = new UIManager();
    this.storage = new StorageManager();
    this.currentFilters = {};
    this.sortable = null;
    this.currentEditingTask = null;

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      await this.setupEventListeners();
      await this.setupDragAndDrop();
      await this.setupTheme();
      await this.renderInitialState();

      this.ui.showNotification('Welcome to ToDu! 🎉', 'success');
      console.log('ToDu App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.ui.showNotification('Failed to initialize app', 'error');
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Task form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleAddTask();
      });
    }

    // Edit task form submission
    const editForm = document.getElementById('editTaskForm');
    if (editForm) {
      editForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleSaveEdit();
      });
    }

    // Search input with debouncing
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      const debouncedSearch = this.ui.debounce(value => {
        this.currentFilters.search = value;
        this.applyFilters();
      }, 300);

      searchInput.addEventListener('input', e => {
        debouncedSearch(e.target.value);
      });
    }

    // Filter controls
    ['statusFilter', 'priorityFilter', 'categoryFilter', 'dueDateFilter'].forEach(filterId => {
      const element = document.getElementById(filterId);
      if (element) {
        element.addEventListener('change', () => {
          this.updateFiltersFromUI();
          this.applyFilters();
        });
      }
    });

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => {
        this.toggleDarkMode();
      });
    }

    // Stats button
    const statsBtn = document.getElementById('statsBtn');
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        this.showStats();
      });
    }

    // Modal close handlers
    this.setupModalHandlers();

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      this.handleKeyboardShortcuts(e);
    });

    // Task manager event listeners
    this.taskManager.on('taskAdded', task => {
      this.handleTaskAdded(task);
    });

    this.taskManager.on('taskUpdated', (task, oldTask) => {
      this.handleTaskUpdated(task, oldTask);
    });

    this.taskManager.on('taskDeleted', task => {
      this.handleTaskDeleted(task);
    });

    this.taskManager.on('taskCompleted', (task, wasCompleted) => {
      this.handleTaskCompleted(task, wasCompleted);
    });

    this.taskManager.on('tasksFiltered', tasks => {
      this.renderTasks(tasks);
    });
  }

  /**
   * Setup modal event handlers
   */
  setupModalHandlers() {
    // Edit modal handlers
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEdit = document.getElementById('cancelEdit');

    if (closeEditModal) {
      closeEditModal.addEventListener('click', () => {
        this.ui.hideModal('editModal');
      });
    }

    if (cancelEdit) {
      cancelEdit.addEventListener('click', () => {
        this.ui.hideModal('editModal');
      });
    }

    // Stats modal handlers
    const closeStatsModal = document.getElementById('closeStatsModal');
    if (closeStatsModal) {
      closeStatsModal.addEventListener('click', () => {
        this.ui.hideModal('statsModal');
      });
    }
  }

  /**
   * Setup drag and drop functionality
   */
  setupDragAndDrop() {
    const taskList = document.getElementById('taskList');
    if (taskList) {
      this.sortable = Sortable.create(taskList, {
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: evt => {
          this.handleTaskReorder(evt.oldIndex, evt.newIndex);
        }
      });
    }
  }

  /**
   * Setup theme system
   */
  setupTheme() {
    const savedTheme = this.storage.loadDarkMode();

    if (savedTheme !== null) {
      this.ui.applyTheme(savedTheme ? 'dark' : 'light');
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.ui.applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  /**
   * Render initial application state
   */
  renderInitialState() {
    this.updateCategoryFilter();
    this.applyFilters();
  }

  /**
   * Handle adding a new task
   */
  handleAddTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityInput = document.getElementById('priorityInput');
    const categoryInput = document.getElementById('categoryInput');

    if (!taskInput) return;

    const taskData = {
      text: taskInput.value.trim(),
      dueDate: dueDateInput?.value || null,
      priority: priorityInput?.value || 'medium',
      category: categoryInput?.value.trim() || 'General'
    };

    if (!taskData.text) {
      this.ui.showNotification('Please enter a task description', 'error');
      taskInput.focus();
      return;
    }

    const task = this.taskManager.addTask(taskData);
    if (task) {
      // Reset form
      taskInput.value = '';
      if (dueDateInput) dueDateInput.value = '';
      if (priorityInput) priorityInput.value = 'medium';
      if (categoryInput) categoryInput.value = '';

      taskInput.focus();
    }
  }

  /**
   * Handle task addition
   * @param {Object} task - Added task
   */
  handleTaskAdded(task) {
    this.ui.showNotification('Task added successfully! ✅', 'success');
    this.updateCategoryFilter();
    this.applyFilters();

    // Add bounce animation to the new task
    setTimeout(() => {
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        taskElement.classList.add('animate-bounce-in');
      }
    }, 100);
  }

  /**
   * Handle task update
   * @param {Object} task - Updated task
   * @param {Object} oldTask - Previous task state
   */
  handleTaskUpdated(task, oldTask) {
    this.ui.showNotification('Task updated successfully! 📝', 'success');
    this.updateCategoryFilter();
    this.applyFilters();
  }

  /**
   * Handle task deletion
   * @param {Object} task - Deleted task
   */
  handleTaskDeleted(task) {
    this.ui.showNotification('Task deleted', 'info');
    this.updateCategoryFilter();
    this.applyFilters();
  }

  /**
   * Handle task completion toggle
   * @param {Object} task - Task that was toggled
   * @param {boolean} wasCompleted - Previous completion state
   */
  handleTaskCompleted(task, wasCompleted) {
    if (task.completed) {
      this.ui.showNotification('Task completed! 🎉', 'success');

      // Add celebration animation
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        taskElement.classList.add('celebrating');
        setTimeout(() => {
          taskElement.classList.remove('celebrating');
        }, 600);
      }
    } else {
      this.ui.showNotification('Task marked as pending', 'info');
    }

    this.applyFilters();
  }

  /**
   * Handle task reordering
   * @param {number} oldIndex - Old position
   * @param {number} newIndex - New position
   */
  handleTaskReorder(oldIndex, newIndex) {
    if (oldIndex !== newIndex) {
      this.taskManager.reorderTasks(oldIndex, newIndex);
      this.ui.showNotification('Task order updated', 'info', 2000);
    }
  }

  /**
   * Toggle task completion
   * @param {string} taskId - Task ID
   */
  toggleTask(taskId) {
    this.taskManager.toggleTask(taskId);
  }

  /**
   * Edit a task
   * @param {string} taskId - Task ID
   */
  editTask(taskId) {
    const task = this.taskManager.getTask(taskId);
    if (!task) return;

    this.currentEditingTask = taskId;

    // Populate edit form
    const editTaskInput = document.getElementById('editTaskInput');
    const editDueDateInput = document.getElementById('editDueDateInput');
    const editPriorityInput = document.getElementById('editPriorityInput');
    const editCategoryInput = document.getElementById('editCategoryInput');

    if (editTaskInput) editTaskInput.value = task.text;
    if (editDueDateInput) editDueDateInput.value = task.dueDate || '';
    if (editPriorityInput) editPriorityInput.value = task.priority;
    if (editCategoryInput) editCategoryInput.value = task.category;

    this.ui.showModal('editModal');
  }

  /**
   * Handle save edit
   */
  handleSaveEdit() {
    if (!this.currentEditingTask) return;

    const editTaskInput = document.getElementById('editTaskInput');
    const editDueDateInput = document.getElementById('editDueDateInput');
    const editPriorityInput = document.getElementById('editPriorityInput');
    const editCategoryInput = document.getElementById('editCategoryInput');

    const updates = {
      text: editTaskInput?.value.trim(),
      dueDate: editDueDateInput?.value || null,
      priority: editPriorityInput?.value || 'medium',
      category: editCategoryInput?.value.trim() || 'General'
    };

    if (!updates.text) {
      this.ui.showNotification('Please enter a task description', 'error');
      return;
    }

    const updatedTask = this.taskManager.updateTask(this.currentEditingTask, updates);
    if (updatedTask) {
      this.ui.hideModal('editModal');
      this.currentEditingTask = null;
    }
  }

  /**
   * Delete a task with confirmation
   * @param {string} taskId - Task ID
   */
  deleteTask(taskId) {
    const task = this.taskManager.getTask(taskId);
    if (!task) return;

    if (confirm(`Are you sure you want to delete "${task.text}"?`)) {
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        taskElement.classList.add('removing');
        setTimeout(() => {
          this.taskManager.deleteTask(taskId);
        }, 300);
      } else {
        this.taskManager.deleteTask(taskId);
      }
    }
  }

  /**
   * Update filters from UI state
   */
  updateFiltersFromUI() {
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const dueDateFilter = document.getElementById('dueDateFilter');
    const searchInput = document.getElementById('searchInput');

    this.currentFilters = {
      status: statusFilter?.value || 'all',
      priority: priorityFilter?.value || 'all',
      category: categoryFilter?.value || 'all',
      dueDate: dueDateFilter?.value || 'all',
      search: searchInput?.value || ''
    };
  }

  /**
   * Apply current filters to tasks
   */
  applyFilters() {
    this.updateFiltersFromUI();
    const filteredTasks = this.taskManager.filterTasks(this.currentFilters);
    this.renderTasks(filteredTasks);
  }

  /**
   * Render tasks in the UI
   * @param {Array} tasks - Tasks to render
   */
  renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    this.ui.renderTasks(tasks, taskList);

    // Update empty state visibility
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
      emptyState.classList.toggle('hidden', tasks.length > 0);
    }
  }

  /**
   * Update category filter options
   */
  updateCategoryFilter() {
    const categories = this.taskManager.getCategories();
    this.ui.updateCategoryFilter(categories);
  }

  /**
   * Show statistics modal
   */
  showStats() {
    const stats = this.taskManager.getStatistics();
    const statsContent = document.getElementById('statsContent');

    if (!statsContent) return;

    statsContent.innerHTML = this.createStatsHTML(stats);
    this.ui.showModal('statsModal');
  }

  /**
   * Create statistics HTML
   * @param {Object} stats - Statistics object
   * @returns {string} HTML content
   */
  createStatsHTML(stats) {
    return `
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="stats-card card card-compact">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-blue">${stats.total}</div>
            <div class="text-sm text-secondary">Total Tasks</div>
          </div>
        </div>
        
        <div class="stats-card card card-compact">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-green">${stats.completed}</div>
            <div class="text-sm text-secondary">Completed</div>
          </div>
        </div>
        
        <div class="stats-card card card-compact">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-orange">${stats.pending}</div>
            <div class="text-sm text-secondary">Pending</div>
          </div>
        </div>
        
        <div class="stats-card card card-compact">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-primary">${stats.completionRate}%</div>
            <div class="text-sm text-secondary">Completion Rate</div>
          </div>
        </div>
      </div>
      
      <div class="space-y-6">
        <div>
          <h4 class="text-lg font-semibold mb-3">Priority Breakdown</h4>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-red">High Priority</span>
              <span class="font-medium">${stats.byPriority.high}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-orange">Medium Priority</span>
              <span class="font-medium">${stats.byPriority.medium}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-green">Low Priority</span>
              <span class="font-medium">${stats.byPriority.low}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-3">Today's Progress</h4>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span>Tasks completed today</span>
              <span class="font-medium text-green">${stats.completedToday}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tasks due today</span>
              <span class="font-medium text-orange">${stats.dueToday}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Overdue tasks</span>
              <span class="font-medium text-red">${stats.overdue}</span>
            </div>
          </div>
        </div>
        
        ${
          stats.categories.length > 0
            ? `
          <div>
            <h4 class="text-lg font-semibold mb-3">Categories</h4>
            <div class="space-y-2">
              ${stats.categories
                .map(
                  cat => `
                <div class="flex justify-between items-center">
                  <span>${this.ui.escapeHtml(cat.name)}</span>
                  <span class="font-medium">${cat.count}</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }
        
        <div>
          <h4 class="text-lg font-semibold mb-3">Productivity</h4>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span>This week</span>
              <span class="font-medium">${
                stats.productivity.thisWeek.completed
              }/${stats.productivity.thisWeek.created} tasks</span>
            </div>
            <div class="flex justify-between items-center">
              <span>This month</span>
              <span class="font-medium">${
                stats.productivity.thisMonth.completed
              }/${stats.productivity.thisMonth.created} tasks</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    this.storage.saveDarkMode(isDarkMode);
    this.ui.currentTheme = isDarkMode ? 'dark' : 'light';

    this.ui.showNotification(`${isDarkMode ? 'Dark' : 'Light'} mode enabled`, 'success', 2000);
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          const taskInput = document.getElementById('taskInput');
          if (taskInput) taskInput.focus();
          break;
        case 'd':
          e.preventDefault();
          this.toggleDarkMode();
          break;
        case 's':
          e.preventDefault();
          this.showStats();
          break;
      }
    }

    if (e.key === 'Escape') {
      this.ui.hideAllModals();
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ToDoApp();
});

// Make app globally available for inline event handlers
if (typeof window !== 'undefined') {
  window.ToDoApp = ToDoApp;
}

export default ToDoApp;
