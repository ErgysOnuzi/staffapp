# Staff Management App - Design Guidelines

## 1. Brand Identity

**Purpose**: Professional staff management system for retail/service businesses. Empowers staff to manage schedules and requests while giving managers oversight tools and admins full control.

**Aesthetic Direction**: **Editorial/Professional** - Clean hierarchy with purposeful use of color to denote urgency and status. Trust-building through clarity and transparency. Every interaction reinforces reliability.

**Memorable Element**: Status-driven color language - users instantly understand their standing and alert severity through consistent color coding across all features.

## 2. Authentication

**Required** - Role-based system (Staff, Manager, Admin)

**Login Screen**:
- Email/password fields
- "Forgot Password?" link (triggers admin notification flow)
- Primary action: "Sign In"
- Footer: "Contact your administrator for account access"

**No self-registration** - admin assigns roles

**Logged-in Persistence**: Use local state to maintain session

**Account Screen** (nested in Profile tab):
- Settings > Account > Request Account Deletion (triggers admin approval flow)
- Settings > Security > Enable 2FA (toggle)
- Log out with confirmation alert

## 3. Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)

**Tabs**:
1. **Home** - Dashboard with status overview, quick actions
2. **Schedule** - Personal/team schedule with break notifications
3. **Requests** - Submit and track requests/reports
4. **Profile** - Settings, account, salary info

**Floating Action**: SOS button (always visible, overlays all screens except during active SOS)

**Role-Based Navigation**:
- Staff: See own data only
- Manager: Additional "Team" section in Schedule and Requests
- Admin: Additional "Management" tab for system controls

## 4. Screen Specifications

### Home Screen
- **Header**: Transparent, greeting + user avatar (right)
- **Content** (scrollable):
  - Status card: standing indicator, contract countdown
  - Quick stats: today's shift, accumulated salary, pending requests
  - Recent notifications list
  - Cash register summary (if staff has register access)
- **SOS Button**: Floating bottom-right
- **Safe Area**: top: headerHeight + 24, bottom: tabBarHeight + 24

### Schedule Screen
- **Header**: Default navigation, search icon (right)
- **Content** (scrollable calendar/list):
  - Week view with shifts
  - Break time indicators (30-min countdown when active)
  - Swap/request shift actions
  - Manager: Team schedule toggle
- **Safe Area**: top: 24, bottom: tabBarHeight + 24

### Requests Screen
- **Header**: Segmented control (My Requests | Submit New), "+" button (right) opens submission form
- **Content** (list):
  - Request cards with status badges (Pending/Approved/Declined)
  - Manager: Filter by staff member
  - Empty state: "No requests yet"
- **Safe Area**: top: 24, bottom: tabBarHeight + 24

### Submit Request/Report Screen (Modal)
- **Header**: "Cancel" (left), "Submit" (right), title in center
- **Content** (scrollable form):
  - Type selector (Request/Report/Warning Acknowledgment)
  - Subject input
  - Details text area
  - Anonymous toggle (reports only)
  - Emergency type selector (if SOS report)
- **Safe Area**: top: 24, bottom: insets.bottom + 24

### Profile Screen
- **Header**: Transparent, "Settings" icon (right)
- **Content** (scrollable):
  - Profile header: avatar, name, role badge, standing indicator
  - Salary summary card
  - Contract details card
  - Warnings received (if any)
  - Navigation: Settings, Language, Theme
- **Safe Area**: top: headerHeight + 24, bottom: tabBarHeight + 24

### Settings Screen
- **Header**: Default navigation, "Settings" title
- **Content** (scrollable list):
  - Account (email, phone, password, profile picture)
  - Appearance (theme: Dark/Light, accent color picker)
  - Language (English/Albanian/Serbian)
  - Security (2FA toggle)
  - Account Management (request deletion - nested)
- **Safe Area**: top: 24, bottom: tabBarHeight + 24

### SOS Screen (Modal - full screen)
- **Header**: None
- **Content**:
  - Large emergency type buttons (Police, Security, Ambulance, Firefighters)
  - "Cancel" button at bottom
  - Confirmation alert before sending
- **Safe Area**: top: insets.top + 40, bottom: insets.bottom + 40

### Admin Management Screen (Admin only, replaces Profile)
- **Header**: "Management" title, filter icon (right)
- **Content** (scrollable sections):
  - User management (add/remove/reset passwords)
  - System activity log
  - Global salary rate editor
  - Pending account deletions
- **Safe Area**: top: 24, bottom: tabBarHeight + 24

## 5. Color Palette

**Primary**: #1A73E8 (Professional blue - trustworthy, calm)
**Background**: #F8F9FA (Light), #121212 (Dark)
**Surface**: #FFFFFF (Light), #1E1E1E (Dark)
**Text Primary**: #202124 (Light), #E8EAED (Dark)
**Text Secondary**: #5F6368 (Light), #9AA0A6 (Dark)

**Semantic Colors** (status-driven):
- **Success/All Good**: #34A853
- **Warning/At Risk**: #FBBC04
- **Error/Critical**: #EA4335
- **Info**: #4285F4

**Accent Options** (user-selectable):
- White: #FFFFFF
- Pink: #F48FB1
- Green: #81C784
- Blue: #64B5F6
- Red: #E57373

## 6. Typography

**Font**: System (SF Pro for iOS, Roboto for Android)

**Type Scale**:
- Hero: 32pt Bold (dashboard greeting)
- Title: 24pt Bold (screen headers)
- Headline: 20pt Semibold (section headers)
- Body: 16pt Regular (main content)
- Caption: 14pt Regular (metadata)
- Label: 12pt Medium (badges, labels)

## 7. Visual Design

**Icons**: Feather icons from @expo/vector-icons
**Touchable Feedback**: Opacity 0.7 on press, scale 0.98 for buttons
**Cards**: 12pt border radius, subtle elevation
**Floating SOS Button**:
  - Red gradient background (#EA4335 to #C5221F)
  - 56pt diameter circle
  - Shadow: offset (0, 2), opacity 0.10, radius 2
  - Position: 16pt from bottom-right (above tab bar)

**Status Indicators**: Circle badges (8pt diameter) next to text, color-coded by semantic palette

## 8. Assets to Generate

**icon.png** - App icon: Abstract geometric lock symbol with gradient (blue to teal), professional style. **WHERE USED**: Device home screen

**splash-icon.png** - Same lock symbol, centered on solid blue background. **WHERE USED**: App launch screen

**empty-requests.png** - Minimalist illustration of clipboard with checkmark, muted colors. **WHERE USED**: Requests screen when no requests exist

**empty-schedule.png** - Simple calendar icon with clock hands, soft shadows. **WHERE USED**: Schedule screen when no shifts scheduled

**sos-success.png** - Shield with checkmark, reassuring illustration. **WHERE USED**: SOS confirmation screen after emergency sent

**profile-avatar-default.png** - Neutral silhouette in circle, single-color fill. **WHERE USED**: Default user avatar before custom upload

**standing-good.png** - Small badge icon (green checkmark in circle). **WHERE USED**: Status cards showing user standing

**standing-at-risk.png** - Small badge icon (yellow warning triangle). **WHERE USED**: Status cards showing at-risk standing