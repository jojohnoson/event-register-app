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

### Database endpoints/credential has been Exposed Purposely for Public Experience but it is not a good practice in production. 
Always credentials, endpoints and etc must be in .env and must be .gitignore while pushing the code to github.

### 1. Prerequisites
- Node.js 18+ installed

### 2. Environment Variables
Check `.env.local` in the root directory:
```env
DATABASE_URL="postgresql://neondb_owner:npg_NxOUwj28GePa@ep-frosty-recipe-az7x7jpz-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```
### 3. Run the Application on Docker
Must have Docker to be installed in the local machine to run this command. 
Pulling the image from Docker Hub which Public.
```
docker pull joeljxhnson/eventhubapp:latest  
```
After pulling the Image from Docker Hub, you can run this command to run the application through container and check on localhost:3000.
```
docker run -d --name eventhubregisterapp -p 3000:3000 -v app_data:/app/data -e DATABASE_URL="postgresql://neondb_owner:npg_NxOUwj28GePa@ep-frosty-recipe-az7x7jpz-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" --restart unless-stopped joeljxhnson/eventhubapp:latest
```
### 4. To Run on Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Build for Production
```bash
npm run build
npm run start
```
