/**
 * Task Manager - Core Task Operations
 * Handles task CRUD operations, filtering, sorting, and business logic
 */

import { StorageManager } from "./storage.js";

export class TaskManager {
  constructor() {
    this.storage = new StorageManager();
    this.tasks = [];
    this.currentEditingTask = null;
    this.listeners = {
      taskAdded: [],
      taskUpdated: [],
      taskDeleted: [],
      taskCompleted: [],
      tasksReordered: [],
      tasksFiltered: [],
    };

    this.init();
  }

  /**
   * Initialize the task manager
   */
  init() {
    this.loadTasks();
    this.setupStorageSync();
  }

  /**
   * Setup cross-tab storage synchronization
   */
  setupStorageSync() {
    this.storage.setupStorageSync((key, oldValue, newValue) => {
      if (key === this.storage.STORAGE_KEYS.TASKS) {
        this.loadTasks();
        this.emit("tasksFiltered", this.tasks);
      }
    });
  }

  /**
   * Load tasks from storage
   */
  loadTasks() {
    this.tasks = this.storage.loadTasks();
    this.emit("tasksFiltered", this.tasks);
  }

  /**
   * Save tasks to storage
   * @returns {boolean} Success status
   */
  saveTasks() {
    return this.storage.saveTasks(this.tasks);
  }

  /**
   * Add a new task
   * @param {Object} taskData - Task data object
   * @returns {Object|null} Created task or null if invalid
   */
  addTask(taskData) {
    const { text, dueDate, priority, category } = taskData;

    if (!text || text.trim().length === 0) {
      return null;
    }

    const task = {
      id: this.storage.generateId(),
      text: text.trim(),
      completed: false,
      dueDate: dueDate || null,
      priority: priority || "medium",
      category: category?.trim() || "General",
      createdAt: new Date().toISOString(),
      completedAt: null,
      updatedAt: new Date().toISOString(),
    };

    this.tasks.unshift(task); // Add to beginning for newest first
    this.saveTasks();
    this.emit("taskAdded", task);

    return task;
  }

  /**
   * Update an existing task
   * @param {string} taskId - Task ID
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} Updated task or null if not found
   */
  updateTask(taskId, updates) {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return null;

    const oldTask = { ...this.tasks[taskIndex] };

    // Validate updates
    if (updates.text !== undefined && updates.text.trim().length === 0) {
      return null;
    }

    // Apply updates
    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Clean up text if provided
    if (updates.text !== undefined) {
      updatedTask.text = updates.text.trim();
    }

    // Clean up category if provided
    if (updates.category !== undefined) {
      updatedTask.category = updates.category?.trim() || "General";
    }

    this.tasks[taskIndex] = updatedTask;
    this.saveTasks();
    this.emit("taskUpdated", updatedTask, oldTask);

    return updatedTask;
  }

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @returns {Object|null} Deleted task or null if not found
   */
  deleteTask(taskId) {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return null;

    const deletedTask = this.tasks[taskIndex];
    this.tasks.splice(taskIndex, 1);
    this.saveTasks();
    this.emit("taskDeleted", deletedTask);

    return deletedTask;
  }

  /**
   * Toggle task completion status
   * @param {string} taskId - Task ID
   * @returns {Object|null} Updated task or null if not found
   */
  toggleTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    task.updatedAt = new Date().toISOString();

    this.saveTasks();
    this.emit("taskCompleted", task, wasCompleted);

    return task;
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {Object|null} Task or null if not found
   */
  getTask(taskId) {
    return this.tasks.find((t) => t.id === taskId) || null;
  }

  /**
   * Reorder tasks
   * @param {number} oldIndex - Old index
   * @param {number} newIndex - New index
   * @returns {boolean} Success status
   */
  reorderTasks(oldIndex, newIndex) {
    if (
      oldIndex < 0 ||
      oldIndex >= this.tasks.length ||
      newIndex < 0 ||
      newIndex >= this.tasks.length
    ) {
      return false;
    }

    const [movedTask] = this.tasks.splice(oldIndex, 1);
    this.tasks.splice(newIndex, 0, movedTask);

    this.saveTasks();
    this.emit("tasksReordered", this.tasks);

    return true;
  }

  /**
   * Filter tasks based on criteria
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered tasks
   */
  filterTasks(filters = {}) {
    const {
      status = "all",
      priority = "all",
      category = "all",
      search = "",
      dueDate = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    let filteredTasks = [...this.tasks];

    // Status filter
    if (status === "completed") {
      filteredTasks = filteredTasks.filter((t) => t.completed);
    } else if (status === "pending") {
      filteredTasks = filteredTasks.filter((t) => !t.completed);
    }

    // Priority filter
    if (priority !== "all") {
      filteredTasks = filteredTasks.filter((t) => t.priority === priority);
    }

    // Category filter
    if (category !== "all") {
      filteredTasks = filteredTasks.filter((t) => t.category === category);
    }

    // Due date filter
    if (dueDate !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dueDate) {
        case "overdue":
          filteredTasks = filteredTasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < today && !t.completed
          );
          break;
        case "today":
          filteredTasks = filteredTasks.filter(
            (t) => t.dueDate && this.isToday(new Date(t.dueDate))
          );
          break;
        case "upcoming":
          filteredTasks = filteredTasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) > today
          );
          break;
        case "no-date":
          filteredTasks = filteredTasks.filter((t) => !t.dueDate);
          break;
      }
    }

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (t) =>
          t.text.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower)
      );
    }

    // Sort tasks
    filteredTasks.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "alphabetical":
          comparison = a.text.localeCompare(b.text);
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case "dueDate":
          // Tasks with no due date go to the end
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "createdAt":
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    this.emit("tasksFiltered", filteredTasks);
    return filteredTasks;
  }

  /**
   * Get all unique categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    const categories = [...new Set(this.tasks.map((t) => t.category))].filter(
      Boolean
    );
    return categories.sort();
  }

  /**
   * Get task statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPriority = {
      high: this.tasks.filter((t) => t.priority === "high").length,
      medium: this.tasks.filter((t) => t.priority === "medium").length,
      low: this.tasks.filter((t) => t.priority === "low").length,
    };

    const today = new Date();
    const completedToday = this.tasks.filter(
      (t) =>
        t.completed && t.completedAt && this.isToday(new Date(t.completedAt))
    ).length;

    const dueToday = this.tasks.filter(
      (t) => !t.completed && t.dueDate && this.isToday(new Date(t.dueDate))
    ).length;

    const overdue = this.tasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < today
    ).length;

    // Category statistics
    const categoryCount = {};
    this.tasks.forEach((task) => {
      categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    });

    const categories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Productivity statistics
    const thisWeek = this.getTasksInRange(7);
    const thisMonth = this.getTasksInRange(30);

    return {
      total,
      completed,
      pending,
      completionRate,
      byPriority,
      completedToday,
      dueToday,
      overdue,
      categories,
      productivity: {
        thisWeek: {
          completed: thisWeek.filter((t) => t.completed).length,
          created: thisWeek.length,
        },
        thisMonth: {
          completed: thisMonth.filter((t) => t.completed).length,
          created: thisMonth.length,
        },
      },
    };
  }

  /**
   * Get tasks created within a date range
   * @param {number} days - Number of days from today
   * @returns {Array} Tasks within range
   */
  getTasksInRange(days) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.tasks.filter((t) => new Date(t.createdAt) >= since);
  }

  /**
   * Bulk operations
   */

  /**
   * Mark multiple tasks as completed
   * @param {Array} taskIds - Array of task IDs
   * @returns {Array} Updated tasks
   */
  completeMultipleTasks(taskIds) {
    const updatedTasks = [];

    taskIds.forEach((taskId) => {
      const task = this.getTask(taskId);
      if (task && !task.completed) {
        task.completed = true;
        task.completedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
        updatedTasks.push(task);
      }
    });

    if (updatedTasks.length > 0) {
      this.saveTasks();
      updatedTasks.forEach((task) => this.emit("taskCompleted", task, false));
    }

    return updatedTasks;
  }

  /**
   * Delete multiple tasks
   * @param {Array} taskIds - Array of task IDs
   * @returns {Array} Deleted tasks
   */
  deleteMultipleTasks(taskIds) {
    const deletedTasks = [];

    // Sort by index in reverse order to maintain indices while deleting
    const tasksToDelete = taskIds
      .map((id) => ({ id, index: this.tasks.findIndex((t) => t.id === id) }))
      .filter((item) => item.index !== -1)
      .sort((a, b) => b.index - a.index);

    tasksToDelete.forEach(({ id, index }) => {
      const deletedTask = this.tasks.splice(index, 1)[0];
      deletedTasks.push(deletedTask);
    });

    if (deletedTasks.length > 0) {
      this.saveTasks();
      deletedTasks.forEach((task) => this.emit("taskDeleted", task));
    }

    return deletedTasks;
  }

  /**
   * Update category for multiple tasks
   * @param {Array} taskIds - Array of task IDs
   * @param {string} newCategory - New category name
   * @returns {Array} Updated tasks
   */
  updateMultipleTasksCategory(taskIds, newCategory) {
    const updatedTasks = [];

    taskIds.forEach((taskId) => {
      const task = this.getTask(taskId);
      if (task) {
        const oldCategory = task.category;
        task.category = newCategory?.trim() || "General";
        task.updatedAt = new Date().toISOString();
        updatedTasks.push({ task, oldCategory });
      }
    });

    if (updatedTasks.length > 0) {
      this.saveTasks();
      updatedTasks.forEach(({ task, oldCategory }) =>
        this.emit("taskUpdated", task, { ...task, category: oldCategory })
      );
    }

    return updatedTasks.map((item) => item.task);
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
   * Event system
   */

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}
