# Dayflow – Human Resource Management System (HRMS)

**Every workday, perfectly aligned.**

Dayflow is a web-based **Human Resource Management System (HRMS)** designed to digitize and streamline essential HR operations such as employee management, attendance tracking, leave workflows, and payroll visibility. The system focuses on simplicity for employees and control for HR administrators through secure, role-based access.

---

## 🎉 Project Status: Admin/HR Interface COMPLETED

The **Admin/HR Dashboard** is now fully functional and production-ready! 

✅ **All Core Features Implemented**
- Complete employee management system
- Leave approval workflow
- Attendance tracking and analytics
- Payroll management interface
- Comprehensive reporting system
- Role-based authentication and security

---

## 📚 Documentation

- **[ADMIN_README.md](./ADMIN_README.md)** - Complete feature documentation
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Installation and setup instructions

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ 
- npm or yarn

### Installation

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Open `http://localhost:3000` and login with:
- **Email**: admin@dayflow.com
- **Password**: admin123

### Build for Production

```bash
npm run build
npm run preview
```

---

## Problem Statement

Many organizations still rely on manual or semi-digital HR processes. Attendance is tracked inconsistently, leave approvals are delayed, employee data is scattered, and payroll transparency is limited.

These inefficiencies lead to:
- Administrative overhead
- Human errors
- Poor employee experience
- Lack of real-time insights for HR teams

---

## Solution Overview

Dayflow provides a **centralized HR platform** that automates and organizes core HR functions. It ensures smooth interaction between employees and HR through structured workflows, real-time updates, and secure access control.

The application separates concerns clearly:
- Employees manage their own data and requests
- HR/Admin users supervise, approve, and control organizational records

---

## 🎯 Admin/HR Features (Implemented)

### 📊 Dashboard
- Real-time employee statistics
- Today's attendance overview
- Pending leave requests
- Monthly trends and analytics
- Interactive charts and visualizations

### 👥 Employee Management
- **Employee List**: Search, filter, and export
- **Employee Profiles**: Comprehensive details view
- **Add/Edit Employees**: Full CRUD operations
- **Document Management**: Upload and view documents
- **Quick Actions**: Jump to attendance, leaves, payroll

### 📅 Leave Approval System
- View all leave requests with filters
- One-click approve/reject actions
- Add comments to decisions
- Track leave history
- Status-based filtering (pending, approved, rejected)

### ✅ Attendance Management
- Organization-wide attendance dashboard
- Date-based attendance tracking
- Real-time statistics and metrics
- Multiple status types (Present, Absent, Leave, Half-day)
- Department-wise analytics

### 💰 Payroll Management
- View employee salary structures
- Edit salary components (UI)
- Gross/net salary calculations
- Payment status tracking
- Monthly payroll processing

### 📈 Reports & Analytics
- **Attendance Reports**: 
  - Employee-wise attendance
  - Department analytics
  - Visual charts (Bar, Pie)
  - Export to CSV
- **Salary Slips**:
  - Generate salary slips
  - Download as PDF (UI ready)

### 🔐 Security
- Role-based access control
- Protected routes
- JWT authentication
- Session management
- Secure API integration

---

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **date-fns** - Date utilities
- **Lucide React** - Icons

### Design
- Modern, clean interface
- Fully responsive (mobile, tablet, desktop)
- Consistent design system
- Accessible components

---

## User Roles

| Role | Responsibilities |
|-----|------------------|
| Employee | View profile, attendance, payroll, apply for leave |
| Admin / HR Officer | Manage employees, approve leave & attendance, control payroll |

---

## System Architecture (High Level)

- **Frontend:** Role-based dashboards, responsive UI (✅ Completed)
- **Backend:** RESTful APIs, authentication, business logic (Ready for integration)
- **Database:** Employee records, attendance, leave, payroll
- **Security:** Password hashing, protected routes, access control

---

## Technology Stack (Proposed)

- **Frontend:** React / Next.js / Vue
- **Backend:** Node.js (Express) / Django / Spring Boot
- **Database:** PostgreSQL / MySQL / MongoDB
- **Authentication:** JWT / OAuth
- **Deployment:** Docker, Vercel, AWS, Render

*(Stack may vary based on team preference.)*

---

## Application Workflow

1. User registers and verifies email
2. User logs in and is redirected based on role
3. Employee marks attendance and applies for leave
4. Admin/HR reviews and approves or rejects requests
5. Payroll and reports are managed securely

---

## Use Cases

- Small and medium-sized organizations
- Startups managing growing teams
- Educational institutions
- Academic projects and hackathons
- Internal HR automation tools

---

## Future Enhancements

- Location-based or biometric attendance
- Automated payroll calculation
- Performance evaluation module
- Mobile application support
- AI-powered HR analytics
- Advanced reporting dashboards

---

## Contributing

Contributions are welcome.  
Please follow clean code practices and submit well-documented pull requests.

---

## License

This project is licensed under the **MIT License**.  
Free to use, modify, and distribute.

---
