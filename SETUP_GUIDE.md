# Dayflow HRMS - Quick Setup Guide

## 📋 Prerequisites Checklist

Before you begin, ensure you have:
- ✅ Node.js (v16.0.0 or higher) - [Download](https://nodejs.org/)
- ✅ npm (comes with Node.js) or yarn
- ✅ Git (optional, for version control)
- ✅ A code editor (VS Code recommended)

## 🚀 Installation Steps

### Step 1: Navigate to Frontend

Open your terminal in the project directory and navigate to the frontend folder:

```bash
cd frontend
```

### Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

This will install all required packages:
- React & React DOM
- React Router
- TypeScript
- Tailwind CSS
- Axios
- Recharts
- Lucide React
- date-fns
- And all development dependencies

### Step 3: Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

   **Note**: Replace with your actual backend API URL in production.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Step 5: Login

Use the demo credentials:
- **Email**: admin@dayflow.com
- **Password**: admin123

## 📦 Production Build

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 🎯 Project Structure Overview

```
src/
├── components/       → Reusable UI components
├── contexts/        → React contexts (Auth, etc.)
├── layouts/         → Page layouts
├── lib/            → Utilities and API client
├── pages/          → Application pages
│   ├── admin/      → Admin dashboard pages
│   └── ...         → Other pages
├── types/          → TypeScript type definitions
└── App.tsx         → Main application component
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎨 Features Overview

### 1. Dashboard (`/admin`)
Main overview with statistics, charts, and quick actions

### 2. Employee Management (`/admin/employees`)
- View all employees
- Add new employees (`/admin/employees/new`)
- View employee details (`/admin/employees/:id`)
- Edit employee (`/admin/employees/:id/edit`)

### 3. Leave Requests (`/admin/leave-requests`)
- View all leave requests
- Approve/reject leaves
- Filter by status

### 4. Attendance (`/admin/attendance`)
- Organization-wide attendance
- Date-based filtering
- Export reports

### 5. Payroll (`/admin/payroll`)
- View payroll details
- Edit salary structures
- Monthly processing

### 6. Reports (`/admin/reports`)
- Attendance reports with charts
- Salary slips
- Export functionality

## 🔐 Authentication Flow

1. User visits protected route
2. If not authenticated, redirected to `/login`
3. After successful login, redirected back to original destination
4. Admin role required for all `/admin/*` routes

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### API Configuration
Edit `src/lib/api.ts` to modify API settings:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

## 📱 Mobile Testing

The app is responsive. To test on mobile:

1. **Using Chrome DevTools**:
   - Press F12
   - Click device toolbar icon
   - Select a mobile device

2. **Using Local Network**:
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access from mobile: `http://YOUR_IP:3000`

## 🐛 Troubleshooting

### Issue: Dependencies won't install
**Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: Port 3000 already in use
**Solution**: Either kill the process using port 3000 or change the port in `vite.config.ts`:
```typescript
server: {
  port: 3001, // Change to any available port
}
```

### Issue: API calls failing
**Solution**: 
1. Check if backend is running
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check browser console for CORS errors

### Issue: Build errors
**Solution**: 
1. Run `npm run lint` to check for code issues
2. Ensure all imports are correct
3. Check TypeScript errors

## 🔄 Updating Dependencies

To update all dependencies to their latest versions:

```bash
npm update
```

To update a specific package:

```bash
npm update package-name
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router Docs](https://reactrouter.com)

## 🤝 Getting Help

If you encounter issues:
1. Check the console for error messages
2. Review the documentation above
3. Check network tab for API errors
4. Contact the development team

## ✅ Verification Checklist

After setup, verify:
- ✅ Development server starts without errors
- ✅ Login page loads correctly
- ✅ Can login with demo credentials
- ✅ Dashboard displays data
- ✅ All navigation links work
- ✅ No console errors
- ✅ Responsive design works on mobile

---

**You're all set! Happy coding! 🎉**
