# DayFlow HRMS - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm 7 or higher
- Docker & Docker Compose (for full deployment)

## 📦 Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

The app will open at **http://localhost:3000**

## 🎨 What's Included

### ✅ Complete Component Library
- **Layout**: Navbar, Sidebar, DashboardLayout
- **Forms**: Input, Select, Textarea, Checkbox with validation
- **Data Display**: Table, Card, StatCard
- **Feedback**: Alert, Badge, Modal
- **Actions**: Button (multiple variants)

### ✅ Pages
- **Authentication**: Sign In, Sign Up
- **Dashboards**: Employee Dashboard, Admin Dashboard
- **Placeholders**: Profile, Attendance, Leave, Payroll, Reports

### ✅ Features
- JWT Authentication with role-based access
- Responsive design (mobile, tablet, desktop)
- Consistent color scheme across all pages
- Loading states and error handling
- Protected routes for authenticated users
- Admin-only routes for HR/Admin users

## 🎯 Default Credentials (Mock)

Since this is a frontend-only setup, you'll need the backend running for actual authentication. However, the structure is ready for:

**Employee Account:**
- Email: employee@dayflow.com
- Password: password123

**Admin Account:**
- Email: admin@dayflow.com
- Password: admin123

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Components.jsx   # Badge, Alert
│   │   ├── DashboardLayout.jsx
│   │   ├── Form.jsx         # All form inputs
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Table.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Global auth state
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── SignIn.jsx
│   │   └── SignUp.jsx
│   ├── services/
│   │   └── api.js           # API client & endpoints
│   ├── styles/              # Component-specific CSS
│   │   ├── globals.css      # Design tokens
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── components.css
│   │   ├── form.css
│   │   ├── modal.css
│   │   └── table.css
│   ├── App.jsx              # Main app with routing
│   ├── App.css
│   └── index.js             # Entry point
├── .gitignore
├── Dockerfile
├── package.json
├── jsconfig.json
└── README.md
```

## 🛠️ Available Scripts

### Development
```bash
npm start          # Start dev server (port 3000)
npm test           # Run tests
npm run build      # Build for production
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t dayflow-frontend .
```

### Run Container
```bash
docker run -p 80:80 dayflow-frontend
```

### With Docker Compose (Full Stack)
```bash
# From project root
docker-compose up
```

## 🎨 Design System

### Colors
- **Primary**: #1e3a8a (Deep Blue) - Main actions, headers
- **Secondary**: #0891b2 (Teal) - Secondary actions
- **Accent**: #f59e0b (Amber) - Highlights, warnings
- **Success**: #10b981 (Green) - Success states
- **Error**: #ef4444 (Red) - Error states

### Component Variants

**Button**
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

**Alert**
```jsx
<Alert variant="success" title="Success">Operation completed</Alert>
<Alert variant="error" title="Error">Something went wrong</Alert>
<Alert variant="warning" title="Warning">Be careful</Alert>
<Alert variant="info" title="Info">Here's some information</Alert>
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔐 Authentication Flow

1. User visits `/` → Redirects to `/dashboard`
2. Not authenticated → Redirects to `/signin`
3. After login → Redirected based on role:
   - Employee → Employee Dashboard
   - Admin/HR → Admin Dashboard
4. Protected routes check authentication
5. Admin routes check for admin role

## 📊 Dashboard Features

### Employee Dashboard
- Attendance statistics for current month
- Leave balance and usage
- Last payroll information
- Quick actions (Mark Attendance, Apply Leave, View Payslip)
- Recent activity timeline

### Admin Dashboard
- Total employee count
- Present today count
- Pending leave requests
- Average attendance percentage
- Pending leave approvals list
- Quick statistics

## 🔧 Customization

### Change Colors
Edit `frontend/src/styles/globals.css`:

```css
:root {
  --color-primary: #1e3a8a;        /* Your primary color */
  --color-secondary: #0891b2;      /* Your secondary color */
  --color-accent: #f59e0b;         /* Your accent color */
  /* ... more variables */
}
```

### Add New Routes
Edit `frontend/src/App.jsx`:

```jsx
<Route
  path="/your-route"
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  }
/>
```

## 🚧 Next Steps

To complete the HRMS, you'll need to implement:

1. **Profile Page** - View/edit user profile
2. **Attendance Page** - Calendar view with check-in/out
3. **Leave Page** - Apply leave, view leave history
4. **Payroll Page** - View payslips, download PDFs
5. **Reports Page** - Analytics and charts
6. **Employee Management** (Admin) - CRUD operations
7. **Leave Approvals** (Admin) - Approve/reject leaves

Each page should:
- Use `DashboardLayout` wrapper
- Follow the established design system
- Use existing components
- Integrate with API service layer

## 📝 Example: Creating a New Page

```jsx
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardBody } from '../components/Card';

const MyNewPage = () => {
  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1 className="dashboard-title">My New Page</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
        </CardHeader>
        <CardBody>
          {/* Your content here */}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default MyNewPage;
```

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000
```

### Dependencies Not Installing
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check Node version (should be 16+)
node --version

# Update npm
npm install -g npm@latest
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

## 💡 Tips

1. **Use the Components** - Don't recreate UI elements, use the existing component library
2. **Follow the Design System** - Use CSS variables for colors and spacing
3. **Keep It Consistent** - Match the established patterns and naming conventions
4. **Mobile First** - Design for mobile first, then enhance for desktop
5. **Accessibility** - Use semantic HTML and proper ARIA labels

## 🎉 You're Ready!

The frontend is now set up and ready for development. Start the dev server and begin building the remaining pages!

```bash
npm start
```

Happy coding! 🚀
