# ToDu - Smart Task Manager 🚀

A modern, responsive, and feature-rich To-Do List application built with professional project structure, inspired by the elegant design of the Things app. Features modular JavaScript architecture, custom CSS design system, and comprehensive task management capabilities.

## ✨ Features

### 🔧 Core Functionality

- **Task Management**: Add, edit, delete, and mark tasks as complete/incomplete
- **Input Validation**: Ensures task descriptions are required before adding
- **Due Dates**: Set optional due dates with visual indicators for overdue and today's tasks
- **Priority Levels**: Assign Low, Medium, or High priority to tasks with color-coded indicators
- **Categories/Tags**: Organize tasks with custom categories

### 🗂️ Organization & Filtering

- **Smart Filtering**: Filter tasks by status (All/Pending/Completed), priority, category, or due date
- **Real-time Search**: Search through tasks with highlighted search terms
- **Drag & Drop**: Reorder tasks by dragging them to your preferred position
- **Advanced Filters**: Filter by overdue, due today, upcoming, or tasks with no due date

### 💾 Data Persistence

- **localStorage**: All tasks are automatically saved to browser's local storage
- **Auto-save**: Changes are immediately persisted - no manual save required
- **Data Migration**: Automatic migration from legacy data formats
- **Cross-tab Sync**: Changes sync across multiple browser tabs

### 🖼️ Modern UI/UX (Things-Inspired)

- **Custom Design System**: Beautiful, Apple-inspired design with consistent styling
- **System Fonts**: Uses native system fonts for optimal readability
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Subtle transitions for task addition, completion, and removal
- **Visual Feedback**: Color-coded priorities, completion states, and due date warnings

### 🌙 Advanced Features

- **Dark/Light Mode**: Toggle between themes with persistent preference and system detection
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + Enter`: Focus task input
  - `Ctrl/Cmd + D`: Toggle dark mode
  - `Ctrl/Cmd + S`: Open statistics
  - `Escape`: Close modals
- **Comprehensive Statistics**: Detailed analytics including completion rates, priority breakdown, and productivity metrics
- **Smart Notifications**: Success/error messages for user actions with auto-dismiss
- **Due Date Tracking**: Visual indicators for overdue and today's tasks

## 🏗️ Project Structure

```
ToDu/
├── index.html                 # Main application entry point
├── README.md                  # Project documentation
├── src/                       # Source code directory
│   ├── css/                   # Modular CSS files
│   │   ├── base.css          # Design tokens, reset, and base styles
│   │   ├── components.css    # Component-specific styles
│   │   └── animations.css    # Animations and transitions
│   ├── js/                    # Modular JavaScript files
│   │   ├── app.js            # Main application coordinator
│   │   ├── taskManager.js    # Task operations and business logic
│   │   ├── storage.js        # localStorage management
│   │   └── ui.js             # UI operations and DOM manipulation
│   └── assets/               # Static assets
│       └── icons/            # Icon files
├── config/                    # Configuration files
└── *.old.*                   # Backup of previous implementation
```

## 🚀 Getting Started

### Development Setup (Recommended)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:3000` with hot reloading.

### Quick Start (Static)

1. Open `index.html` in any modern web browser
2. Start adding tasks using the input form
3. Enjoy the full-featured task management experience!

### Development Guide

For detailed development instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 📖 Usage Guide

### Adding Tasks

1. Enter your task description in the main input field
2. Optionally set a due date, priority level, and category
3. Click "Add Task" or press Enter to save

### Managing Tasks

- **Complete/Uncomplete**: Click the checkbox next to any task
- **Edit**: Click the edit icon (pencil) to modify task details
- **Delete**: Click the delete icon (trash) to remove a task
- **Reorder**: Drag and drop tasks to rearrange them

### Using Filters

- **Search**: Type in the search box to find specific tasks
- **Status Filter**: Show all tasks, only pending, or only completed
- **Priority Filter**: Filter by High, Medium, or Low priority tasks
- **Category Filter**: Filter by specific categories you've created
- **Due Date Filter**: Filter by overdue, due today, upcoming, or no due date

### Viewing Statistics

- Click the statistics icon in the header to view comprehensive analytics
- See completion rates, task breakdowns by priority and category
- Track today's progress, overdue tasks, and productivity metrics

### Customization

- **Dark Mode**: Click the moon/sun icon to toggle between light and dark themes
- **Categories**: Create custom categories by typing them when adding tasks
- **Priorities**: Use the priority dropdown to organize tasks by importance

## 🛠️ Technical Details

### Architecture

- **Modular Design**: Clean separation of concerns with dedicated modules
- **ES6+ JavaScript**: Modern JavaScript with classes, modules, and async/await
- **Custom CSS Framework**: Things-inspired design system with CSS custom properties
- **Event-Driven**: Comprehensive event system for loose coupling between modules

### Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **Custom CSS**: Modular design system inspired by Apple's Things app
- **Vanilla JavaScript**: Modern ES6+ JavaScript with modular architecture
- **SortableJS**: Library for drag-and-drop functionality
- **localStorage API**: Browser storage for data persistence

### Key Modules

#### TaskManager (`src/js/taskManager.js`)

- Core task operations (CRUD)
- Advanced filtering and sorting
- Event system for UI updates
- Bulk operations support

#### StorageManager (`src/js/storage.js`)

- localStorage abstraction
- Data migration and versioning
- Export/import functionality
- Storage usage monitoring

#### UIManager (`src/js/ui.js`)

- DOM manipulation and rendering
- Modal and notification systems
- Theme management
- Animation controls

#### App (`src/js/app.js`)

- Application coordinator
- Event handling and routing
- Keyboard shortcuts
- Application lifecycle management

### Browser Compatibility

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance Features

- **Efficient Rendering**: Only re-renders necessary components
- **Debounced Search**: Optimized search with input debouncing
- **Memory Management**: Proper event listener cleanup
- **Lazy Loading**: Components load on demand

### Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Friendly**: Semantic HTML and ARIA labels
- **High Contrast**: Colors meet WCAG accessibility standards
- **Focus Management**: Clear visual focus indicators
- **Reduced Motion**: Respects user's motion preferences

## 📱 Responsive Design

ToDu is designed to work seamlessly across all device sizes:

- **Desktop**: Full-featured interface with drag-and-drop
- **Tablet**: Touch-optimized with appropriate spacing
- **Mobile**: Simplified layout optimized for small screens

## 🔒 Privacy & Security

- **Local Storage Only**: No data is sent to external servers
- **No Tracking**: No analytics or tracking scripts
- **XSS Protection**: Input sanitization prevents malicious script injection
- **Offline Capable**: Works without internet connection

## 🎨 Design System

### Color Palette

- **Primary**: iOS Blue (#007AFF) with hover variations
- **Success**: Green (#30D158) for completed tasks
- **Warning**: Orange (#FF9500) for medium priority
- **Error**: Red (#FF453A) for high priority
- **Neutrals**: Carefully selected grays for text and backgrounds

### Typography

- **System Fonts**: Native system font stack for optimal performance
- **Font Sizes**: Consistent scale from 12px to 30px
- **Font Weights**: 400 (normal) to 700 (bold)
- **Line Heights**: Optimized for readability

### Spacing & Layout

- **8px Grid System**: Consistent spacing based on 8px increments
- **Border Radius**: Consistent rounding from 4px to 16px
- **Shadows**: Subtle depth with carefully tuned shadow system
- **Containers**: Max-width responsive containers with proper padding

## 🔄 Data Format

Tasks are stored in localStorage with the following structure:

```json
{
  "id": "unique-task-id",
  "text": "Task description",
  "completed": false,
  "dueDate": "2024-01-15",
  "priority": "medium",
  "category": "Work",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "completedAt": null,
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

## 🚀 Future Enhancements

Potential features for future versions:

- **Progressive Web App**: Service worker for offline functionality
- **Task Templates**: Recurring task templates
- **Sub-tasks**: Hierarchical task organization
- **Time Tracking**: Built-in time tracking for tasks
- **Collaboration**: Task sharing and team features
- **Sync**: Cloud synchronization across devices
- **Plugins**: Extensible plugin system

## 📄 Development

### File Organization

- **Modular CSS**: Separate files for base styles, components, and animations
- **ES6 Modules**: Clean module imports/exports
- **Event-Driven Architecture**: Loose coupling between components
- **Configuration**: Centralized configuration management

### Code Quality

- **JSDoc Comments**: Comprehensive documentation
- **Error Handling**: Robust error handling throughout
- **Type Safety**: Careful type checking and validation
- **Performance**: Optimized for speed and memory usage

### Adding Features

The modular architecture makes it easy to extend:

1. Add new methods to existing managers
2. Create new modules for major features
3. Use the event system for loose coupling
4. Follow the established patterns for consistency

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ inspired by Apple's Things app**

Enjoy using ToDu to stay organized and productive! 🎯

## 📝 Version History

- **v2.0**: Complete rewrite with modular architecture and Things-inspired design
- **v1.0**: Initial version with basic functionality

---

_For questions, feedback, or contributions, please feel free to reach out!_
