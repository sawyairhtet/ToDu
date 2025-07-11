/**
 * Storage Module - Local Storage Management
 * Handles all localStorage operations for tasks and application settings
 */

export class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      TASKS: "todo-tasks-v2",
      SETTINGS: "todo-settings-v2",
      DARK_MODE: "todo-dark-mode",
      CATEGORIES: "todo-categories",
    };
  }

  /**
   * Save tasks to localStorage
   * @param {Array} tasks - Array of task objects
   * @returns {boolean} Success status
   */
  saveTasks(tasks) {
    try {
      const tasksData = {
        tasks,
        lastModified: new Date().toISOString(),
        version: "2.0",
      };
      localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(tasksData));
      return true;
    } catch (error) {
      console.error("Failed to save tasks:", error);
      return false;
    }
  }

  /**
   * Load tasks from localStorage
   * @returns {Array} Array of task objects
   */
  loadTasks() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.TASKS);
      if (!saved) return [];

      const tasksData = JSON.parse(saved);

      // Handle legacy format
      if (Array.isArray(tasksData)) {
        return this.migrateLegacyTasks(tasksData);
      }

      return tasksData.tasks || [];
    } catch (error) {
      console.error("Failed to load tasks:", error);
      return [];
    }
  }

  /**
   * Migrate legacy task format to new format
   * @param {Array} legacyTasks - Legacy tasks array
   * @returns {Array} Migrated tasks
   */
  migrateLegacyTasks(legacyTasks) {
    const migratedTasks = legacyTasks.map((task) => ({
      ...task,
      id: task.id || this.generateId(),
      createdAt: task.createdAt || new Date().toISOString(),
      category: task.category || "General",
      priority: task.priority || "medium",
    }));

    // Save migrated tasks
    this.saveTasks(migratedTasks);
    return migratedTasks;
  }

  /**
   * Save application settings
   * @param {Object} settings - Settings object
   * @returns {boolean} Success status
   */
  saveSettings(settings) {
    try {
      const settingsData = {
        ...settings,
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem(
        this.STORAGE_KEYS.SETTINGS,
        JSON.stringify(settingsData)
      );
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      return false;
    }
  }

  /**
   * Load application settings
   * @returns {Object} Settings object
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (!saved) return this.getDefaultSettings();

      const settings = JSON.parse(saved);
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default application settings
   * @returns {Object} Default settings
   */
  getDefaultSettings() {
    return {
      theme: "system", // 'light', 'dark', 'system'
      defaultPriority: "medium",
      defaultCategory: "General",
      sortBy: "createdAt", // 'createdAt', 'dueDate', 'priority', 'alphabetical'
      sortOrder: "desc", // 'asc', 'desc'
      showCompletedTasks: true,
      autoDeleteCompleted: false,
      autoDeleteCompletedDays: 30,
      enableNotifications: true,
      enableSounds: false,
      compactView: false,
    };
  }

  /**
   * Save dark mode preference
   * @param {boolean} isDarkMode - Dark mode enabled status
   */
  saveDarkMode(isDarkMode) {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.DARK_MODE,
        JSON.stringify(isDarkMode)
      );
    } catch (error) {
      console.error("Failed to save dark mode preference:", error);
    }
  }

  /**
   * Load dark mode preference
   * @returns {boolean|null} Dark mode preference or null for system
   */
  loadDarkMode() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.DARK_MODE);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load dark mode preference:", error);
      return null;
    }
  }

  /**
   * Save categories list
   * @param {Array} categories - Array of category names
   */
  saveCategories(categories) {
    try {
      const categoriesData = {
        categories: [...new Set(categories)].filter(Boolean),
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem(
        this.STORAGE_KEYS.CATEGORIES,
        JSON.stringify(categoriesData)
      );
    } catch (error) {
      console.error("Failed to save categories:", error);
    }
  }

  /**
   * Load categories list
   * @returns {Array} Array of category names
   */
  loadCategories() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
      if (!saved) return ["General", "Work", "Personal"];

      const categoriesData = JSON.parse(saved);
      return categoriesData.categories || [];
    } catch (error) {
      console.error("Failed to load categories:", error);
      return ["General", "Work", "Personal"];
    }
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageInfo() {
    try {
      const tasksSize = this.getItemSize(this.STORAGE_KEYS.TASKS);
      const settingsSize = this.getItemSize(this.STORAGE_KEYS.SETTINGS);
      const darkModeSize = this.getItemSize(this.STORAGE_KEYS.DARK_MODE);
      const categoriesSize = this.getItemSize(this.STORAGE_KEYS.CATEGORIES);

      const totalSize =
        tasksSize + settingsSize + darkModeSize + categoriesSize;
      const availableSize = this.getAvailableStorage();

      return {
        totalSize,
        tasksSize,
        settingsSize,
        darkModeSize,
        categoriesSize,
        availableSize,
        usagePercentage:
          totalSize > 0 ? (totalSize / (totalSize + availableSize)) * 100 : 0,
      };
    } catch (error) {
      console.error("Failed to get storage info:", error);
      return null;
    }
  }

  /**
   * Get size of a localStorage item in bytes
   * @param {string} key - Storage key
   * @returns {number} Size in bytes
   */
  getItemSize(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? new Blob([item]).size : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get available localStorage space
   * @returns {number} Available space in bytes
   */
  getAvailableStorage() {
    try {
      const testKey = "storage-test";
      const testData = "0".repeat(1024); // 1KB test data
      let availableSize = 0;

      // Binary search for available space
      let low = 0;
      let high = 5 * 1024; // 5MB max test

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const testValue = testData.repeat(mid);

        try {
          localStorage.setItem(testKey, testValue);
          localStorage.removeItem(testKey);
          availableSize = mid * 1024;
          low = mid + 1;
        } catch (e) {
          high = mid - 1;
        }
      }

      return availableSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clear all application data
   * @returns {boolean} Success status
   */
  clearAllData() {
    try {
      Object.values(this.STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Failed to clear data:", error);
      return false;
    }
  }

  /**
   * Export all data as JSON
   * @returns {Object} Exported data
   */
  exportData() {
    try {
      const tasks = this.loadTasks();
      const settings = this.loadSettings();
      const categories = this.loadCategories();
      const darkMode = this.loadDarkMode();

      return {
        version: "2.0",
        exportDate: new Date().toISOString(),
        tasks,
        settings,
        categories,
        darkMode,
      };
    } catch (error) {
      console.error("Failed to export data:", error);
      return null;
    }
  }

  /**
   * Import data from JSON
   * @param {Object} data - Data to import
   * @returns {boolean} Success status
   */
  importData(data) {
    try {
      if (!data || typeof data !== "object") {
        throw new Error("Invalid data format");
      }

      // Validate data structure
      if (data.tasks && Array.isArray(data.tasks)) {
        this.saveTasks(data.tasks);
      }

      if (data.settings && typeof data.settings === "object") {
        this.saveSettings(data.settings);
      }

      if (data.categories && Array.isArray(data.categories)) {
        this.saveCategories(data.categories);
      }

      if (data.darkMode !== undefined) {
        this.saveDarkMode(data.darkMode);
      }

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  /**
   * Generate unique ID for tasks
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} Storage availability
   */
  isStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage event listeners for cross-tab synchronization
   */
  setupStorageSync(callback) {
    window.addEventListener("storage", (event) => {
      if (Object.values(this.STORAGE_KEYS).includes(event.key)) {
        callback(event.key, event.oldValue, event.newValue);
      }
    });
  }
}
