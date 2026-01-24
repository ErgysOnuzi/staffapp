# StaffHub - Staff Management App

## Overview
StaffHub is a comprehensive staff management mobile application built with Expo React Native and Express.js backend. It provides employees, managers, and administrators with tools to manage schedules, submit requests, track salaries, and handle emergencies.

## Current State
- **Version**: 1.0.0 (MVP)
- **Status**: Development
- **Last Updated**: January 2026

## Features
- **Authentication**: Login with email/password and company code
- **Home Dashboard**: Status overview, today's shift, accumulated salary, notifications, quick actions
- **Role-Based Navigation**: Different tabs and features based on user role
- **Schedule**: Weekly calendar view with shifts, break times, and positions (Staff only)
- **Users Management**: View and manage all users in the company (Admin only)
- **Team Management**: View team members and approve/reject requests (Manager only)
- **Requests**: Submit and track requests/reports with status filtering
- **Profile**: User info, salary summary, contract details, settings
- **SOS Emergency**: Quick access to emergency services (Police, Security, Ambulance, Firefighters)
- **Settings**: Theme, accent color, language, security options

## User Roles & Features

### Staff
- Home: Personal dashboard with shift info, salary, notifications
- Schedule: View weekly calendar with their shifts
- Requests: Submit and track their own requests
- Profile: View personal info and settings

### Manager
- Home: Personal dashboard with shift info, salary, notifications
- Team: View team members and their today's shifts
- Team Requests: View and approve/reject staff requests
- Requests: View all requests (their own and team's)
- Profile: View personal info and settings

### Admin
- Home: Personal dashboard with status overview
- Users: View and manage all users in the company
  - User Detail: View/edit individual user profiles, change roles, assign to markets
  - Add User: Create new users with role and market assignment
  - Company Overview: View company stats (user counts, locations, pending requests)
  - Manage Locations: CRUD operations for company markets/locations
- Requests: View and manage all requests system-wide
- Profile: View personal info and settings

## Test Accounts

| Role | Email | Password | Company Code |
|------|-------|----------|--------------|
| Admin | admin@demo.com | password123 | DEMO |
| Manager | manager@demo.com | password123 | DEMO |
| Staff | staff@demo.com | password123 | DEMO |
| Staff (2) | worker@demo.com | password123 | DEMO |

## Project Architecture

### Frontend (Expo React Native)
```
client/
├── App.tsx                 # Main app entry with providers
├── components/            # Reusable UI components
├── constants/
│   └── theme.ts           # Colors, spacing, typography
├── context/
│   └── AuthContext.tsx    # Authentication state management
├── hooks/
├── lib/
├── navigation/
│   ├── HomeStackNavigator.tsx
│   ├── MainTabNavigator.tsx  # Role-based tab navigation
│   ├── ProfileStackNavigator.tsx
│   ├── RequestsStackNavigator.tsx
│   ├── RootStackNavigator.tsx
│   ├── ScheduleStackNavigator.tsx
│   ├── TeamStackNavigator.tsx    # Manager only
│   └── UsersStackNavigator.tsx   # Admin only
└── screens/
    ├── HomeScreen.tsx
    ├── LoginScreen.tsx
    ├── ProfileScreen.tsx
    ├── RequestsScreen.tsx
    ├── ScheduleScreen.tsx
    ├── SettingsScreen.tsx
    ├── SOSScreen.tsx
    ├── SubmitRequestScreen.tsx
    ├── TeamScreen.tsx           # Manager team view
    ├── UsersScreen.tsx          # Admin users list
    ├── UserDetailScreen.tsx     # Admin: View/edit user
    ├── AddUserScreen.tsx        # Admin: Create new user
    ├── CompanyScreen.tsx        # Admin: Company overview
    └── MarketsScreen.tsx        # Admin: Manage locations
```

### Backend (Express.js)
```
server/
├── index.ts               # Server entry point
├── routes.ts              # API routes with role-based endpoints
└── templates/
    └── landing-page.html  # App landing page
```

### Shared
```
shared/
└── schema.ts              # Database schema (Drizzle)
```

## API Endpoints

### Role-Specific Endpoints
- `GET /api/admin/users` - List all users (Admin only)
- `POST /api/admin/users` - Create new user (Admin only)
- `GET /api/admin/company-stats` - Get company statistics (Admin only)
- `GET /api/admin/markets` - List markets with user counts (Admin only)
- `GET /api/manager/team` - List team members with today's shifts (Manager only)
- `GET /api/manager/requests` - List team requests (Manager only)
- `PUT /api/requests/:id/status` - Approve/reject requests (Manager/Admin)
- `PUT /api/users/:id` - Update user details (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/companies` - Update company info (Admin only)
- `POST /api/markets` - Create market (Admin only)
- `PUT /api/markets/:id` - Update market (Admin only)
- `DELETE /api/markets/:id` - Delete market (Admin only)

## Running the App
- **Frontend**: `npm run expo:dev` (Port 8081)
- **Backend**: `npm run server:dev` (Port 5000)

## Recent Changes
- **January 2026**: Added comprehensive admin management system
  - UserDetailScreen: View/edit user profiles with role change confirmation
  - AddUserScreen: Create new users with role and market assignment
  - CompanyScreen: Company dashboard with statistics
  - MarketsScreen: Location management with CRUD operations
  - New API endpoints for all admin operations
- Implemented role-based navigation with different tabs for Admin, Manager, and Staff
- Added Users management screen for Admin role
- Added Team management screen for Manager role with approve/reject functionality
- Updated Quick Actions to show New Request and Emergency SOS
- Added company code requirement for login authentication
- Initial MVP implementation with all core screens
- Authentication flow with role-based access
- SOS emergency feature with confirmation flow
- Request/Report submission with anonymous option
- Settings with theme, language, and security options
