# DayFlow HRMS Frontend

A modern, professional React-based frontend for the DayFlow Human Resource Management System.

## Features

- 🎨 **Modern UI Design** - Clean, professional interface with consistent color scheme
- 🔐 **Authentication** - Secure sign-in/sign-up with role-based access control
- 📊 **Dashboards** - Separate dashboards for employees and administrators
- 👥 **Employee Management** - Comprehensive employee data management (Admin)
- ⏰ **Attendance Tracking** - Real-time attendance check-in/check-out
- 📅 **Leave Management** - Apply, track, and approve leave requests
- 💰 **Payroll** - View payslips and salary information
- 📈 **Reports** - Analytics and reporting capabilities
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **React 18.2** - Modern React with hooks
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Icons** - Comprehensive icon library
- **CSS Custom Properties** - Design tokens for consistent theming

## Color Scheme

- **Primary**: #1e3a8a (Deep Blue)
- **Secondary**: #0891b2 (Teal)
- **Accent**: #f59e0b (Amber)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on port 5000

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm start
```

The application will open at http://localhost:3000

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Docker Deployment

The frontend includes a multi-stage Dockerfile for production deployment:

```bash
docker build -t dayflow-frontend .
docker run -p 80:80 dayflow-frontend
```

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Components.jsx  # Badge, Alert
│   │   ├── DashboardLayout.jsx
│   │   ├── Form.jsx        # Form inputs
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Table.jsx
│   ├── context/           # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── SignIn.jsx
│   │   └── SignUp.jsx
│   ├── services/          # API service layer
│   │   └── api.js
│   ├── styles/            # CSS files
│   │   ├── globals.css    # Global styles & design tokens
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── components.css
│   │   ├── form.css
│   │   ├── modal.css
│   │   └── table.css
│   ├── App.jsx            # Main app component with routing
│   ├── App.css
│   └── index.js           # Entry point
├── Dockerfile             # Production Docker image
├── package.json
└── README.md
```

## Components

### Layout Components
- **Navbar** - Top navigation with user menu
- **Sidebar** - Side navigation with role-based menu items
- **DashboardLayout** - Wrapper component for authenticated pages

### UI Components
- **Button** - Customizable button with variants and sizes
- **Card** - Card container with header, body, footer
- **StatCard** - Dashboard statistics card with gradients
- **Form** - Form inputs (text, select, textarea, checkbox)
- **Modal** - Modal dialog with overlay
- **Table** - Data table with custom rendering
- **Badge** - Status badges
- **Alert** - Alert notifications

## API Integration

The app connects to the backend API through axios with automatic token management:

```javascript
// Example: Fetching user profile
import { employeeAPI } from './services/api';

const profile = await employeeAPI.getProfile();
```

All API calls include the JWT token from localStorage automatically.

## Authentication Flow

1. User signs in at `/signin`
2. Backend returns user object and JWT token
3. Token stored in localStorage
4. AuthContext provides user state globally
5. Protected routes check authentication
6. Role-based redirects (admin vs employee dashboards)

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For Docker deployment, the backend is accessed via `http://backend:5000/api`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Contributing

1. Follow the established component structure
2. Use the design tokens from `globals.css`
3. Maintain consistent naming conventions
4. Add PropTypes or TypeScript for type safety
5. Write responsive CSS using the mobile-first approach

## Design System

### Spacing Scale
- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)

### Typography Scale
- `--text-xs`: 0.75rem
- `--text-sm`: 0.875rem
- `--text-base`: 1rem
- `--text-lg`: 1.125rem
- `--text-xl`: 1.25rem
- `--text-2xl`: 1.5rem
- `--text-3xl`: 2rem

### Border Radius
- `--radius-sm`: 0.25rem
- `--radius-md`: 0.5rem
- `--radius-lg`: 0.75rem
- `--radius-xl`: 1rem

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - DayFlow HRMS

## Support

For support, contact the development team or refer to the main project documentation.
