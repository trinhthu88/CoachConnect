# Connect+ Premium Coaching Platform

Connect+ is a private, role-based coaching platform that connects invited coachees with approved professional coaches.

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com) account
- A [Resend](https://resend.com) account (for emails)

### 2. Database Setup
1. Create a new project on Supabase.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase-schema.sql` and click **Run**.
4. Then paste the contents of `supabase-seed.sql` and click **Run** to populate dummy data.
5. This script creates the tables without strict Auth requirements for demo purposes, so you can see the interface immediately.

### 3. Environment Variables
1. Create a `.env` file in the root directory.
2. Copy the content from `.env.example` into `.env`.
3. Fill in your credentials:
   - `VITE_SUPABASE_URL`: Found in Supabase Settings > API (e.g., `https://your-proj.supabase.co`). *Do not include /rest/v1/ at the end.*
   - `VITE_SUPABASE_ANON_KEY`: Found in Supabase Settings > API.
   - `VITE_RESEND_API_KEY`: Found in Resend Settings > API Keys.

### 4. Local Development
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🏗️ Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Motion.
- **Backend API**: Express (Node.js) with Typescript.
- **Database**: PostgreSQL (Supabase).
- **Auth**: Supabase Auth with Role-Based Access Control (RBAC).
- **Communication**: Real-time chat via Supabase Realtime.

## 👥 Roles & Permissions

1. **Coachee**:
   - Browse approved coaches.
   - Book sessions (30/45/60 min).
   - Chat with coaches after booking confirmation.
   - Add reflections and rate coaches.
2. **Coach**:
   - Approve/Reject booking requests.
   - Manage availability (Google Calendar/Calendly).
   - Add session notes (Shared & Private).
   - Edit professional profile (Requires Admin approval).
3. **Admin**:
   - Approve user registrations and coach profile changes.
   - Manage session limits and manual assignments.
   - Platform settings and reporting.

## 🛠️ Integration Layers

The app uses an abstraction layer (`src/lib/providers.ts`) to handle multiple services:
- **Calendar**: Supports `GoogleCalendarProvider` and `CalendlyProvider`.
- **Meetings**: Supports `ZoomMeetingProvider` and `GoogleMeetProvider`.
- **Emails**: Powered by `ResendEmailProvider`.

## 🔐 Security
- **RLS Policies**: Data is protected at the database level. For example, `coach_private` notes are only readable by the authoring coach.
- **Admin Approval**: New registrations are restricted to a `pending_approval` status by default.
