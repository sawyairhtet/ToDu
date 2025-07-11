# ToDu Development Guide 🛠️

This guide covers the development workflow for the ToDu Task Manager project.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm 8+

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:3000` with hot module reloading.

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Vite |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run serve` | Alternative development server with live-server |
| `npm run lint` | Run ESLint code quality checks |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Clean build directory |
| `npm start` | Alias for `npm run dev` |

## 🏗️ Development Architecture

### Project Structure
```
src/
├── css/                    # Modular CSS
│   ├── base.css           # Design tokens & base styles
│   ├── components.css     # Component styles
│   └── animations.css     # Animations & transitions
├── js/                    # ES6 Modules
│   ├── app.js            # Main application coordinator
│   ├── taskManager.js    # Business logic & data operations
│   ├── storage.js        # localStorage management
│   └── ui.js             # DOM manipulation & UI
└── assets/               # Static assets
    └── icons/           # SVG icons
```

### Module Dependencies
```
app.js
├── taskManager.js
├── ui.js
├── storage.js
└── sortablejs (external)
```

## 🎨 Development Tools

### Vite Features
- ⚡ **Fast HMR**: Hot module reloading for instant updates
- 📦 **ES Modules**: Native ES module support
- 🎯 **Tree Shaking**: Automatic dead code elimination
- 🔧 **Source Maps**: Debug with original source code

### Code Quality
- **ESLint**: Automated code quality checks
- **Prettier**: Consistent code formatting
- **Modern ES6+**: Classes, modules, async/await

### Browser Support
- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔧 Development Workflow

### 1. Start Development
```bash
npm run dev
```
- Opens browser automatically at `http://localhost:3000`
- Watches for file changes
- Hot reloads CSS and JavaScript

### 2. Code Quality
```bash
npm run lint        # Check for issues
npm run format      # Format code
```

### 3. Building
```bash
npm run build       # Production build
npm run preview     # Test production build
```

## 📁 Key Files

### Configuration
- `vite.config.js` - Vite bundler configuration
- `.eslintrc.js` - ESLint rules and settings
- `.prettierrc` - Code formatting rules
- `package.json` - Dependencies and scripts

### Entry Points
- `index.html` - Main HTML template
- `src/js/app.js` - JavaScript entry point
- `src/css/base.css` - CSS entry point

## 🎯 Development Best Practices

### CSS Organization
- Use CSS custom properties for theming
- Follow BEM-like naming for components
- Keep animations subtle and performant

### JavaScript Patterns
- Use ES6 modules for organization
- Implement event-driven architecture
- Handle errors gracefully
- Document with JSDoc comments

### Performance Tips
- Lazy load non-critical features
- Debounce user input
- Use event delegation
- Optimize DOM queries

## 🐛 Debugging

### Development Tools
- Browser DevTools for debugging
- Vite's error overlay for build issues
- ESLint output for code quality

### Common Issues
1. **Module not found**: Check import paths
2. **CSS not loading**: Verify CSS import order
3. **Hot reload not working**: Check Vite server logs

## 📈 Adding Features

### 1. New Components
1. Add CSS to appropriate file in `src/css/`
2. Create methods in relevant manager class
3. Update UI manager for rendering
4. Add event handlers in app.js

### 2. New Modules
1. Create new file in `src/js/`
2. Export class or functions
3. Import in `app.js`
4. Initialize in app constructor

### 3. External Dependencies
```bash
npm install package-name
```
Then import in relevant module:
```javascript
import Package from 'package-name';
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```
- Outputs to `dist/` directory
- Minified and optimized
- Ready for static hosting

### Hosting Options
- GitHub Pages
- Netlify
- Vercel
- Any static file server

---

Happy coding! 🎉 