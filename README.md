# RegisterHub - Attendee Registration Web App
Live Website Link - https://eventhubmanagementapp.vercel.app/events
A modern, full-stack registration web application built with **Next.js (App Router)**, **Tailwind CSS**, and **Neon PostgreSQL Database**.

## Features

- 📝 **Attendee Registration Form**:
  - Full Name, Email ID, Phone Number, Age, Organization / Company, Role / Designation, and Notes.
  - Client & Server-side input validation.
  - Duplicate email detection & error handling.
  - Instant sample data auto-fill button for fast testing.
- 🗄️ **Neon DB PostgreSQL Integration**:
  - Connects directly using `@neondatabase/serverless` with SSL pooling.
  - Auto-initializes the `registrations` database table with timestamps.
- 👥 **Registered Users Directory**:
  - Dedicated **"View Registered Users"** button and live modal view.
  - Live count indicator on the header and summary cards.
  - Real-time search across Name, Email, Phone, Organization, and Role.
  - Switchable **Table View** and **Card Grid View**.
  - **Export to CSV** feature to download registered attendees.
  - One-click copy for email and phone numbers.
  - Delete / manage registrations with confirmation.
- 📊 **Live Stats Dashboard**:
  - Total registered attendees counter.
  - Unique organizations count.
  - Demographic average age.
  - Neon DB connection status indicator.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ installed

### 2. Environment Variables
Check `.env.local` in the root directory:
```env
DATABASE_URL="postgresql://neondb_owner:.............<Iam Sorry, the DB url cant be exposed>"
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Build for Production
```bash
npm run build
npm run start
```
