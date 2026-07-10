# Product Requirements Document (PRD) & Software Requirements Specification (SRS)

## 1. Product Overview
**Name**: Al-Rabb Tours & Travels
**Type**: Enterprise Travel Operations Management System
**Goal**: A secure, centralized platform acting as a bridge between Customers, Partner Travel Agencies, and the Al-Rabb Tours & Travels Administration. The system replaces manual paperwork and informal communication (e.g., WhatsApp) with a structured, trackable, and scalable solution for managing travel requests, visas, and ticketing.

**Core Scope (Inclusions)**:
- Collecting and tracking Group Visa, Individual Visa, and Air Ticket requests.
- Secure document upload, validation, and storage.
- Strict Role-Based Access Control (RBAC) with varied dashboards.
- Centralized administration processing and notifications.

**Core Exclusions**:
- Does NOT act as an OTA (Online Travel Agency) booking engine for direct flight issuance.
- Does NOT automatically issue visas via government APIs (currently handles request operations).
- No end-customer group visa submissions (Customers can only submit Air Tickets).

## 2. User Roles & Personas
### 2.1 Customer
- **Capabilities**: Register, Verify Email, Login/Reset Password, Book Air Tickets, View own requests/status, Receive notifications, Edit profile.
- **Restrictions**: Cannot access Visa Services or any Agency/Admin features.

### 2.2 Agency (Partner)
- **Capabilities**: Register, Verify Email, Password Login + OTP on every login, Submit Group/Individual Visas, Submit Air Ticket Requests, Upload Documents, Track requests/timeline, Manage company profile.
- **Restrictions**: Cannot access other agencies' data or the Admin panel.

### 2.3 Super Administrator
- **Capabilities**: Complete system control. Manage Agencies/Customers/Users, View all requests, Assign/Approve/Reject requests, Suspend agencies, View Analytics, Export Reports, Download documents, View Audit Logs.

## 3. Core Features & Workflows
### 3.1 Request Workflow Timeline
All requests must transition through:
`Draft` → `Submitted` → `Under Review` → `Processing` → `Approved` | `Rejected` → `Completed`

### 3.2 Visa Services
#### Group Visa
- **Fields**: Number of Passengers, Flight Itinerary, Flight Code, Date, Country Code.
- **Hotels**: Makkah & Madinah tabs (Hotel Name, Room Type: Quad/Pentagonal/Hexagonal, Room Count, Check-In/Check-Out).
- **Group Info**: Group Leader, India Number, Saudi Number.
- **Transport**: Airport Pickup, Makkah Ziyarah, Makkah → Madinah, Madinah Ziyarah (Date, Time, FN/AN).

#### Individual Visa (Normal)
- **Fields**: Passengers, Arrival, Departure, Ticket Upload, Stay Days, Saudi/India Numbers.
- **Documents**: PDF/PNG/JPG.

#### Individual Visa (Iqama)
- **Fields**: Iqama Holder, Iqama ID, DOB, National Address, Arrival/Departure Tickets, Stay Days, Saudi/India Numbers.

### 3.3 Air Ticket Request
- **Available to**: Customers & Agencies.
- **Fields**: Origin, Destination, Arrival/Departure Dates, Passengers, Preferred Airline, Luggage Weight, Wheelchair Required, Meal Preference, Additional Notes.

### 3.4 Dashboards
- **Agency**: Pending/Review/Approved/Rejected/Completed, Recent Requests, Timeline, Notifications, Analytics.
- **Customer**: Active Tickets, Completed, Recent Activity.
- **Admin**: Total/Active Agencies, Customers, Requests Today, Queue, Revenue Placeholder, Live Notifications.

### 3.5 Global Search & Filters
- **Search**: Agency, Customer, Request ID, Passport Number (future), Status, Date, Hotel, Destination.
- **Filters**: Status, Date, Request Type, Agency, Country, Assigned Staff.

### 3.6 Reports
- **Formats**: PDF, Excel, CSV.
- **Frequency**: Generate monthly reports.

## 4. Security & Compliance Requirements
- **Authentication**: JWT with Refresh Token Rotation, HttpOnly/Secure/SameSite Strict Cookies, Argon2id Password Hashing, Session Expiration, OTP for Admins/Agencies.
- **Data Protection**: Object-Level Authorization (Agencies only see their data), Secure File Uploads (10MB max, MIME checks, Randomized filenames, Virus scan support), never expose raw storage URLs.
- **Infrastructure**: CSRF Protection, Helmet (CSP/HSTS/Security Headers), SQLi Prevention via ORM, Rate Limiting, Brute Force Protection.

## 5. Technical Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI, TanStack Query, React Hook Form, Zod.
- **Backend**: Django, DRF, PostgreSQL (UUIDs), Redis, Celery, Gunicorn.
- **Storage/Email**: Cloudflare R2 / AWS S3, Resend / Amazon SES.
- **DevOps**: Docker, GitHub Actions (CI/CD), Vercel (FE), VPS/Railway (BE).

## 6. Design Aesthetic
- **Vibe**: Premium enterprise platform, calm and trustworthy.
- **Colors**: Soft warm whites, elegant orange gradients (sunrise/desert).
- **Details**: Rounded corners (18-20px), soft shadows, subtle travel motifs (thin route-lines, light map contours, airport timeline indicators, passport-stamp status badges). Avoid cliché airplane graphics.

## 7. Accessibility
- WCAG 2.2 AA Compliance.
- Keyboard navigation, screen reader support, distinct focus states, reduced motion.
