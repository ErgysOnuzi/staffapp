# Google Play Data Safety Information for StaffHub

This document contains all the information needed to complete the Data Safety section in Google Play Console.

## Overview

StaffHub is a staff management application that collects user data for employment management purposes. This document provides the answers needed for Google Play's Data Safety form.

---

## Section 1: Data Collection & Security

### Does your app collect or share any of the required user data types?
**Yes**

### Is all of the user data collected by your app encrypted in transit?
**Yes** - All data is transmitted over HTTPS/TLS

### Do you provide a way for users to request that their data is deleted?
**Yes** - Users can contact privacy@staffhub.app to request data deletion per GDPR Article 17

---

## Section 2: Data Types Collected

### Personal Information

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Name | Yes | No | Account creation, display in app | No |
| Email address | Yes | No | Account creation, authentication | No |
| Phone number | Yes | No | Emergency contact, SOS feature | No |
| Address | No | - | - | - |
| Other personal info | No | - | - | - |

### Financial Information

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Salary information | Yes | No | Employment records, salary tracking | No |
| Bank account info | No | - | - | - |
| Credit card info | No | - | - | - |
| Purchase history | No | - | - | - |

### Location

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Approximate location | No | - | - | - |
| Precise location | Yes | Yes* | SOS emergency feature only | Yes |

*Location is shared only with emergency responders when SOS is activated

### App Activity

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| App interactions | Yes | No | App functionality, analytics | No |
| In-app search history | No | - | - | - |
| Installed apps | No | - | - | - |
| Other user-generated content | Yes | No | Requests, reports submitted | No |

### Device or Other IDs

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Device ID | Yes | No | Session management, security | No |

---

## Section 3: Data Usage & Handling

### Primary Data Usage Purposes

| Purpose | Data Types Used |
|---------|----------------|
| **App functionality** | Name, email, phone, salary, device ID |
| **Account management** | Name, email, phone |
| **Analytics** | App interactions (anonymized) |
| **Security** | Device ID, session tokens |

### Data Sharing

**Is data shared with third parties?**
- **Service providers only**: Cloud hosting (data processing agreement in place)
- **Emergency services**: Location data shared only during SOS activation
- **Employer**: Work-related data shared with user's employer as part of app functionality

**We do NOT share data for:**
- Advertising
- Marketing
- Cross-app tracking
- Sale to data brokers

---

## Section 4: Additional Disclosures

### Data Processing

| Processing Activity | Purpose |
|--------------------|---------|
| Work schedule management | Core app functionality |
| Request/report processing | Employment communication |
| Salary calculation display | Employment records |
| Emergency SOS alerts | User safety feature |

### Data Retention

- **Active employment**: Data retained during employment period
- **Post-employment**: Data retained as required by Kosovo labor law (5 years for employment records)
- **Financial records**: Retained as required by tax law (10 years)

### User Rights (GDPR Compliance)

Users have the right to:
- Access their personal data
- Correct inaccurate data
- Request data deletion
- Export their data (data portability)
- Withdraw consent for optional features

Contact: privacy@staffhub.app

---

## Section 5: Play Console Form Quick Reference

### Page 1: Data Collection
- [x] My app collects or shares user data
- [x] All data is encrypted in transit
- [x] Users can request data deletion

### Page 2: Data Types (Check these)
- [x] Name (Collected, Not Shared)
- [x] Email address (Collected, Not Shared)
- [x] Phone number (Collected, Not Shared)
- [x] Precise location (Collected, Shared with emergency services only)
- [x] App interactions (Collected, Not Shared)
- [x] Device or other IDs (Collected, Not Shared)
- [x] Other user-generated content (Collected, Not Shared)

### Page 3: Purpose Selection
For each data type, select:
- App functionality
- Account management
- Analytics (for app interactions only)
- Fraud prevention, security, and compliance (for device ID)

---

## Privacy Policy URL

**https://YOUR_DOMAIN/privacy**

Replace YOUR_DOMAIN with your actual deployed domain (e.g., staffhub.replit.app)

---

## Contact Information for Play Console

- **Developer name**: StaffHub Solutions
- **Email**: support@staffhub.app
- **Privacy policy URL**: https://YOUR_DOMAIN/privacy
- **Physical address**: Pristina, Republic of Kosovo

---

## App Category

**Category**: Business
**Sub-category**: Staff Management / HR Tools

---

## Content Rating Questionnaire

### Violence
- No violence depicted

### Sexuality
- No sexual content

### Language
- No profanity or offensive language

### Controlled Substances
- None depicted

### Miscellaneous
- No user-generated content moderation issues
- No gambling features
- App does not collect location unless user activates SOS

**Expected Rating**: PEGI 3 / Everyone

---

*Document Version: 1.0.0*
*Last Updated: January 2026*
