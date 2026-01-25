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

### Role Hierarchy (highest to lowest)
1. **Owner** (level 7) - Full control over company
2. **Admin** (level 6) - Full administrative access
3. **CFO** (level 5) - Financial access only
4. **HR Admin** (level 5) - User management without financial access
5. **Manager** (level 4) - Team management
6. **Supervisor** (level 3) - Team oversight
7. **Staff** (level 1) - Basic employee access

### Role Groups
- **Executive Roles**: owner, admin, cfo, hr_admin - Access to company dashboard/stats
- **User Management Roles**: owner, admin, hr_admin - Can create/edit/delete users
- **Financial Roles**: owner, admin, cfo - Access to salary and payment features
- **Team Management Roles**: owner, admin, hr_admin, manager, supervisor - Can manage team and approve requests

### Staff
- Home: Personal dashboard with shift info, salary, notifications
- Schedule: View weekly calendar with their shifts
- Requests: Submit and track their own requests
- Profile: View personal info and settings

### Supervisor
- Home: Personal dashboard with shift info, salary, notifications
- Team: View team members and their today's shifts
- Team Requests: View and approve/reject staff requests
- Requests: View all requests
- Profile: View personal info and settings

### Manager
- Same as Supervisor, plus additional team management features
- Team: View team members and their today's shifts
- Team Requests: View and approve/reject staff requests
- Requests: View all requests (their own and team's)
- Profile: View personal info and settings

### CFO
- Home: Personal dashboard with financial overview
- Schedule: View schedules (read-only)
- Requests: View and manage all requests
- Profile: View personal info and settings
- Access to salary/payment data and financial reports

### HR Admin
- Home: Personal dashboard with status overview
- Users: View and manage all users in the company
  - User Detail: View/edit individual user profiles, change roles, assign to markets
  - Add User: Create new users with role and market assignment
  - Company Overview: View company stats (user counts, locations)
  - Manage Locations: CRUD operations for company markets/locations
- Requests: View and manage all requests
- Profile: View personal info and settings

### Admin
- All HR Admin features, plus:
- System settings access
- Full company management
- Access to financial data

### Owner
- All Admin features, plus:
- Highest level of access
- Cannot be demoted by other roles
- Company settings and critical operations

## Test Accounts

| Role | Email | Password | Company Code |
|------|-------|----------|--------------|
| Owner | owner@demo.com | password123 | DEMO |
| Admin | admin@demo.com | password123 | DEMO |
| CFO | cfo@demo.com | password123 | DEMO |
| HR Admin | hr@demo.com | password123 | DEMO |
| Manager | manager@demo.com | password123 | DEMO |
| Supervisor | supervisor@demo.com | password123 | DEMO |
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

## Legal Compliance (Kosovo / GDPR / App Store)
- **Privacy Policy**: Comprehensive data handling information, Kosovo jurisdiction, GDPR rights
- **Terms of Service**: User agreement with liability limitations, emergency SOS disclaimer
- **First-Time Consent Flow**: Users must accept Terms and Privacy Policy before accessing app
- **GDPR Data Rights**: Access, rectify, delete, port, and withdraw consent
- **SOS Disclaimer**: Clear warning that app SOS is not a replacement for emergency services (112)
- **About Screen**: App version, company info, contact details

### Legal Screens
- PrivacyPolicyScreen.tsx: Full privacy policy with Kosovo jurisdiction
- TermsOfServiceScreen.tsx: Full terms with emergency services disclaimer
- AboutScreen.tsx: App information and developer contact
- ConsentScreen.tsx: First-time agreement screen (blocks app until accepted)
- Settings > Legal section: Access to all legal documents

## Google Play Store Submission

### Required URLs (after deployment)
- **Privacy Policy**: https://YOUR_DEPLOYED_DOMAIN/privacy
- **Terms of Service**: https://YOUR_DEPLOYED_DOMAIN/terms

### Documentation Files
- `docs/DATA_SAFETY_PLAYSTORE.md` - Complete Data Safety form answers for Play Console
- `docs/APPSTORE_LISTING.md` - App store description, keywords, and listing content

### Data Safety Summary
The app collects: name, email, phone, salary data, location (SOS only), device IDs
Data is encrypted in transit (HTTPS) and users can request deletion via privacy@staffhub.app

### Deployment Checklist
1. Publish the app to get a production URL
2. Replace YOUR_DEPLOYED_DOMAIN in legal documents with actual domain
3. Complete Play Console Data Safety form using docs/DATA_SAFETY_PLAYSTORE.md
4. Upload store listing content from docs/APPSTORE_LISTING.md
5. Complete internal testing → closed testing → production

## Recent Changes
- **January 2026**: Added Google Play submission documentation
  - Public Privacy Policy page at /privacy
  - Public Terms of Service page at /terms
  - Data Safety documentation for Play Console
  - App store listing content and descriptions
- **January 2026**: Added legal compliance framework for production readiness
  - Privacy Policy with GDPR rights and Kosovo jurisdiction
  - Terms of Service with emergency SOS disclaimer
  - First-time consent flow blocking app access until accepted
  - About screen with app version and company info
  - Legal section in Settings for easy document access
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
