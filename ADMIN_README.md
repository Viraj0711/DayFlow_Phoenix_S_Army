# Dayflow HRMS - Admin/HR Interface

## Overview

A comprehensive Admin/HR dashboard for the Dayflow Human Resource Management System. This modern web application provides HR administrators with complete control over employee management, attendance tracking, leave approvals, payroll processing, and analytics.

## 🎯 Features

### ✅ Completed Features

#### 1. **Admin Dashboard**
- Real-time statistics and KPIs
- Employee count and status overview
- Today's attendance summary
- Pending leave requests
- Recent activity feed
- Interactive charts and visualizations

#### 2. **Employee Management**
- **Employee List**: View all employees with advanced filtering and search
- **Employee Profiles**: Comprehensive employee detail pages
- **Add/Edit Employees**: Full CRUD operations with form validation
- **Employee Switching**: Seamless navigation between employee records
- **Document Management**: View and manage employee documents
- **Export Functionality**: Download employee data as CSV

#### 3. **Leave Approval System**
- View all leave requests with status filters
- Approve or reject leave applications
- Add comments and notes to requests
- Track leave history
- Multiple leave types support (Paid, Sick, Casual, etc.)
- Detailed leave request modal with all information

#### 4. **Attendance Management**
- Organization-wide attendance overview
- Date-based attendance tracking
- Visual attendance statistics
- Status indicators (Present, Absent, Leave, Half-day)
- Work hours calculation
- Department-wise analytics
- Export attendance reports

#### 5. **Payroll Management**
- View payroll details for all employees
- Salary structure breakdown
- Edit salary components (UI)
- Gross salary, deductions, and net salary calculations
- Payment status tracking
- Monthly payroll processing
- Detailed salary slip generation

#### 6. **Reports & Analytics**
- **Attendance Reports**: 
  - Individual employee attendance tracking
  - Department-wise attendance analytics
  - Visual charts and graphs
  - Attendance percentage calculations
  - Export to CSV
  
- **Salary Slips**:
  - Generate and view salary slips
  - Downloadable PDF format (UI ready)
  - Month-wise salary history

#### 7. **Security & Access Control**
- Role-based authentication (Admin/HR only)
- Protected routes
- Session management
- Secure navigation (employees cannot access admin screens)

#### 8. **UI/UX Excellence**
- **Modern Design**: Clean, professional interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Consistent Design System**: Unified components and styling
- **Intuitive Navigation**: Easy-to-use sidebar and breadcrumbs
- **Interactive Elements**: Smooth transitions and animations
- **Accessibility**: WCAG compliant components

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **State Management**: React Context API

## 📁 Project Structure

```
DayFlow_Phoenix_S_Army/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatCard.tsx
│   │
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   │
│   ├── layouts/             # Layout components
│   │   └── AdminLayout.tsx
│   │
│   ├── lib/                 # Utilities and helpers
│   │   ├── api.ts
│   │   └── utils.ts
│   │
│   ├── pages/               # Page components
│   │   ├── admin/
│   │   │   ├── AttendanceManagement.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EmployeeDetail.tsx
│   │   │   ├── EmployeeForm.tsx
│   │   │   ├── EmployeeList.tsx
│   │   │   ├── LeaveRequests.tsx
│   │   │   ├── PayrollManagement.tsx
│   │   │   └── Reports.tsx
│   │   ├── Login.tsx
│   │   └── Unauthorized.tsx
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   │
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type definitions
│
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind config
├── vite.config.ts           # Vite config
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to Frontend**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:3000`

### Demo Credentials

For testing the application:
- **Email**: admin@dayflow.com
- **Password**: admin123

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#0ea5e9)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Gray**: Various shades for UI elements

### Components

All components follow a consistent design pattern:
- **Cards**: White background with subtle shadows
- **Buttons**: Primary, secondary, success, and danger variants
- **Inputs**: Consistent styling with focus states
- **Badges**: Color-coded status indicators
- **Tables**: Responsive with hover states
- **Modals**: Centered overlays with backdrop

## 🔐 Security Features

1. **Authentication**: JWT-based authentication system
2. **Protected Routes**: Admin-only access control
3. **Role-Based Access**: Different permissions for different roles
4. **Secure API Calls**: Authorization headers on all requests
5. **Session Management**: Automatic logout on token expiration

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- **Desktop**: Full-featured experience with sidebar
- **Tablet**: Optimized layout with collapsible sidebar
- **Mobile**: Touch-friendly interface with hamburger menu

## 🔄 API Integration

The application is designed to integrate with a REST API. All API calls are centralized in `src/lib/api.ts`.

### API Endpoints Expected

- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `GET /employees` - Get all employees
- `GET /employees/:id` - Get employee details
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `GET /leave-requests` - Get leave requests
- `PUT /leave-requests/:id` - Update leave status
- `GET /attendance` - Get attendance records
- `GET /payroll` - Get payroll records
- `PUT /payroll/:id` - Update salary structure
- `GET /reports/attendance` - Get attendance reports
- `GET /reports/salary-slips` - Get salary slips

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- Component-based architecture

## 📊 Features Breakdown

### Dashboard
- **Stats Cards**: Total employees, present today, on leave, pending requests
- **Charts**: Visual representation of data
- **Recent Activity**: Latest leave requests and check-ins

### Employee Management
- **Search & Filter**: Find employees quickly
- **Bulk Actions**: Export, multi-select operations
- **Detailed Profiles**: Complete employee information
- **Edit Forms**: Comprehensive employee data editing

### Leave Management
- **Filtering**: By status (pending, approved, rejected)
- **Quick Actions**: Approve/reject with one click
- **Comments**: Add notes to leave decisions
- **History Tracking**: View all leave requests

### Attendance
- **Calendar View**: Date-based selection
- **Real-time Stats**: Live attendance metrics
- **Status Tracking**: Multiple attendance statuses
- **Reporting**: Detailed attendance reports

### Payroll
- **Salary Breakdown**: Complete salary structure
- **Edit Capability**: Update salary components
- **Payment Tracking**: Monitor payment status
- **Historical Data**: Month-wise payroll records

### Reports
- **Attendance Analytics**: Visual charts and graphs
- **Salary Reports**: Downloadable salary slips
- **Export Options**: CSV and PDF formats
- **Department Insights**: Department-wise analytics

## 🚧 Future Enhancements

While the current implementation provides a complete admin interface, potential enhancements include:

1. **Real-time Notifications**: Push notifications for new requests
2. **Advanced Analytics**: More detailed insights and predictions
3. **Bulk Operations**: Mass approve/reject, bulk uploads
4. **Document Management**: Enhanced document handling
5. **Email Integration**: Automated email notifications
6. **Performance Optimization**: Further optimizations for large datasets
7. **Mobile App**: Native mobile applications
8. **Dark Mode**: Theme switching capability

## 📄 License

This project is part of the Dayflow HRMS system.

## 👥 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ for efficient HR management**
