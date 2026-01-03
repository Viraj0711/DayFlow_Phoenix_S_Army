# 🚀 Running DayFlow HRMS Frontend

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```powershell
cd frontend
npm install
```

### Step 2: Start Development Server
```powershell
npm start
```

### Step 3: Open Browser
The application will automatically open at:
```
http://localhost:3000
```

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js 16 or higher (`node --version`)
- ✅ npm 7 or higher (`npm --version`)
- ✅ Backend API running on port 5000 (optional for testing UI)

## 🎯 What You'll See

### Landing Page
- If not authenticated → Redirects to Sign In page
- If authenticated → Redirects to Dashboard (role-based)

### Sign In Page (`/signin`)
- Professional login form
- Email and password fields
- Error handling
- Link to sign up

### Sign Up Page (`/signup`)
- Registration form
- Name, email, password, department, designation
- Password confirmation
- Success message and redirect

### Employee Dashboard (`/dashboard`)
- Attendance statistics for current month
- Leave balance
- Last payroll amount
- Quick action cards
- Recent activity timeline

### Admin Dashboard (`/dashboard`)
- Total employees
- Present today count
- Pending leave requests
- Average attendance percentage
- Leave approval queue

## 🎨 Testing the UI

### Testing Authentication Flow

1. **Navigate to Sign Up**
   ```
   http://localhost:3000/signup
   ```

2. **Fill the form:**
   - Name: John Doe
   - Email: john@test.com
   - Department: Engineering
   - Designation: Software Engineer
   - Password: password123
   - Confirm Password: password123

3. **Click "Sign Up"**
   - Should show success message
   - Redirects to sign in after 2 seconds

4. **Sign In**
   - Use the credentials you just created
   - (Note: Without backend, authentication won't persist)

### Testing Navigation

With mock authentication (temporary):

1. **Open browser console (F12)**

2. **Manually set auth in localStorage:**
   ```javascript
   localStorage.setItem('user', JSON.stringify({
     id: 1,
     name: 'John Doe',
     email: 'john@test.com',
     role: 'employee'
   }));
   localStorage.setItem('token', 'mock-jwt-token');
   ```

3. **Refresh page**
   - Should now show Employee Dashboard
   - Try clicking sidebar menu items

4. **Test Admin View:**
   ```javascript
   localStorage.setItem('user', JSON.stringify({
     id: 1,
     name: 'Admin User',
     email: 'admin@test.com',
     role: 'admin'
   }));
   ```

5. **Refresh page**
   - Should show Admin Dashboard
   - Notice different sidebar menu items

### Testing Components

Visit different routes to see components in action:

- `/signin` - Sign in form
- `/signup` - Sign up form  
- `/dashboard` - Dashboard (needs mock auth)

### Testing Responsive Design

1. **Open Developer Tools (F12)**
2. **Click device toolbar icon** (or Ctrl+Shift+M)
3. **Select different devices:**
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

Watch how the layout adapts!

## 🔧 Development Tools

### React Developer Tools
Install the React DevTools extension:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React Developer Tools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Useful Browser Extensions
- Redux DevTools (if you add Redux later)
- Axe DevTools (accessibility testing)
- Lighthouse (performance testing)

## 📝 Available npm Scripts

```powershell
# Development
npm start              # Start dev server (port 3000)
npm test               # Run tests (watch mode)

# Production
npm run build          # Create optimized production build
npm run eject          # Eject from create-react-app (⚠️ one-way)

# Code Quality
npm run lint           # Run ESLint (if configured)
```

## 🐛 Common Issues & Solutions

### Issue: Port 3000 Already in Use

**Solution:**
```powershell
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
$env:PORT=3001; npm start
```

### Issue: Dependencies Not Installing

**Solution:**
```powershell
# Clear cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: Module Not Found

**Solution:**
```powershell
# Ensure you're in the frontend directory
cd frontend

# Reinstall dependencies
npm install
```

### Issue: Blank Page After npm start

**Solution:**
1. Check browser console for errors (F12)
2. Ensure all imports are correct
3. Check for syntax errors in JSX files
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Issue: Hot Reload Not Working

**Solution:**
```powershell
# Restart the dev server
# Ctrl+C to stop, then npm start again

# Or set an environment variable
$env:FAST_REFRESH=true; npm start
```

## 🔍 Exploring the Codebase

### Start Here:
1. **src/App.jsx** - Main app structure and routing
2. **src/index.js** - Entry point
3. **src/pages/** - Page components
4. **src/components/** - Reusable UI components

### Understanding the Flow:

```
index.js
  ↓
App.jsx (with BrowserRouter)
  ↓
AuthProvider (wraps everything)
  ↓
Routes
  ├── Public Routes (/signin, /signup)
  └── Protected Routes (/dashboard, /profile, etc.)
      └── DashboardLayout
          ├── Navbar
          ├── Sidebar
          └── Page Content
```

### Key Files to Explore:

1. **Design System:**
   - `src/styles/globals.css` - All design tokens

2. **Authentication:**
   - `src/context/AuthContext.jsx` - Auth logic
   - `src/services/api.js` - API calls

3. **Components:**
   - `src/components/Button.jsx` - See how variants work
   - `src/components/Card.jsx` - Multiple component exports
   - `src/components/Form.jsx` - Form input suite

4. **Pages:**
   - `src/pages/SignIn.jsx` - Form handling example
   - `src/pages/EmployeeDashboard.jsx` - Complex page with stats

## 📊 Testing Backend Integration

### Mock API Responses (Development)

You can use tools like:
- **JSON Server** - Quick REST API
- **MSW (Mock Service Worker)** - API mocking
- **Mirage JS** - API simulation

Example with JSON Server:
```powershell
# Install globally
npm install -g json-server

# Create db.json in project root
# (see below for example)

# Start mock server
json-server --watch db.json --port 5000
```

**db.json example:**
```json
{
  "auth": {
    "login": {
      "token": "mock-jwt-token",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@test.com",
        "role": "employee"
      }
    }
  },
  "employees": [
    { "id": 1, "name": "John Doe", "department": "Engineering" }
  ]
}
```

## 🎨 Customizing the UI

### Change Colors

Edit `src/styles/globals.css`:
```css
:root {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  --color-accent: #your-color;
}
```

Save and the entire app updates instantly! ✨

### Change Fonts

Edit `public/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

Then in `src/styles/globals.css`:
```css
:root {
  --font-sans: 'Your Font', sans-serif;
}
```

### Add New Components

1. Create file in `src/components/`
2. Follow existing component patterns
3. Use design tokens from `globals.css`
4. Import and use in pages

## 🚀 Next Development Steps

### 1. Complete Remaining Pages

Priority order:
1. Profile page (view/edit user info)
2. Attendance page (calendar + check-in/out)
3. Leave page (apply leave, view history)
4. Payroll page (view payslips)
5. Reports page (charts and analytics)

### 2. Enhance Components

- Add loading skeletons
- Implement proper error boundaries
- Add toast notifications
- Create pagination component
- Add search/filter components

### 3. Backend Integration

- Connect to real API endpoints
- Handle actual authentication
- Implement data fetching with error handling
- Add loading states to all API calls

### 4. Testing

- Write unit tests for components
- Add integration tests for pages
- E2E tests for critical user flows

## 📞 Getting Help

### Documentation
- `frontend/README.md` - Detailed frontend docs
- `FRONTEND_QUICKSTART.md` - This file
- `FRONTEND_BUILD_SUMMARY.md` - What's built
- `FILE_STRUCTURE.md` - File organization

### External Resources
- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Axios Docs](https://axios-http.com)

### Code Comments
Look for comments in:
- `src/App.jsx` - Routing examples
- `src/components/Form.jsx` - Component patterns
- `src/services/api.js` - API organization

## ✅ Pre-Flight Checklist

Before starting development:

- [ ] Node.js 16+ installed
- [ ] npm dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Familiarized with file structure
- [ ] Read component documentation
- [ ] Tested basic navigation
- [ ] Opened React DevTools

Ready to code! 🎉

---

**Pro Tip:** Keep the React DevTools and browser console open while developing. They'll show you helpful warnings and errors!

**Happy coding! 💻**
