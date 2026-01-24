# StaffHub - Staff Management App

## Overview
StaffHub is a comprehensive staff management mobile application built with Expo React Native and Express.js backend. It provides employees, managers, and administrators with tools to manage schedules, submit requests, track salaries, and handle emergencies.

## Current State
- **Version**: 1.0.0 (MVP)
- **Status**: Development
- **Last Updated**: January 2026

## Features
- **Authentication**: Login with email/password
- **Home Dashboard**: Status overview, today's shift, accumulated salary, notifications
- **Schedule**: Weekly calendar view with shifts, break times, and positions
- **Requests**: Submit and track requests/reports with status filtering
- **Profile**: User info, salary summary, contract details, settings
- **SOS Emergency**: Quick access to emergency services (Police, Security, Ambulance, Firefighters)
- **Settings**: Theme, accent color, language, security options

## Project Architecture

### Frontend (Expo React Native)
```
client/
├── App.tsx                 # Main app entry with providers
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   ├── HeaderTitle.tsx
│   ├── Input.tsx
│   ├── SOSButton.tsx
│   ├── StatusBadge.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/
│   └── theme.ts           # Colors, spacing, typography
├── context/
│   └── AuthContext.tsx    # Authentication state management
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenOptions.ts
│   └── useTheme.ts
├── lib/
│   ├── query-client.ts    # React Query setup
│   └── storage.ts         # AsyncStorage utilities
├── navigation/
│   ├── HomeStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   ├── RequestsStackNavigator.tsx
│   ├── RootStackNavigator.tsx
│   └── ScheduleStackNavigator.tsx
└── screens/
    ├── HomeScreen.tsx
    ├── LoginScreen.tsx
    ├── ProfileScreen.tsx
    ├── RequestsScreen.tsx
    ├── ScheduleScreen.tsx
    ├── SettingsScreen.tsx
    ├── SOSScreen.tsx
    └── SubmitRequestScreen.tsx
```

### Backend (Express.js)
```
server/
├── index.ts               # Server entry point
├── routes.ts              # API routes
└── templates/
    └── landing-page.html  # App landing page
```

### Shared
```
shared/
└── schema.ts              # Database schema (Drizzle)
```

## Data Storage
- **Local Storage**: AsyncStorage for user data, requests, schedule, notifications, settings
- **Mock Data**: Initial login populates sample data for demo purposes

## User Roles
- **Staff**: View own data (schedule, salary, requests)
- **Manager**: View team data within their market
- **Admin**: Full system access

## Running the App
- **Frontend**: `npm run expo:dev` (Port 8081)
- **Backend**: `npm run server:dev` (Port 5000)

## Recent Changes
- Initial MVP implementation with all core screens
- Authentication flow with mock user data
- AsyncStorage for local data persistence
- SOS emergency feature with confirmation flow
- Request/Report submission with anonymous option
- Settings with theme, language, and security options
