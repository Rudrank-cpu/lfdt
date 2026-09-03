# EventFlow Backend Service (Supabase Edition)

RESTful API backend for the **EventFlow Event Management System**, integrated with **Supabase (PostgreSQL + Row Level Security + Storage)**.

---

## Supabase Quick Setup

### 1. Set Up Database Schema in Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open [`src/scripts/supabase_schema.sql`](file:///c:/Users/lenovo/lfdt/server/src/scripts/supabase_schema.sql).
4. Copy and paste the entire script into the Supabase SQL Editor and click **Run**.
   * Creates `profiles`, `events`, and `registrations` tables.
   * Configures **Row Level Security (RLS)** policies for Head and Viewer roles.
   * Creates the concurrency-safe `register_for_event` **Database Function (RPC)** with atomic row locks.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your project credentials from **Project Settings &rarr; API**:
```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## Local Development & Testing

### 1. Install Dependencies
```bash
npm.cmd install
```

### 2. Seed Local Demo Accounts
```bash
npm.cmd run db:seed
```
Pre-configures local demo accounts for instant offline verification:
- **Head Organizer:** `sarah.head@eventflow.dev` (Password: `Password123!`)
- **Attendee 1:** `john.viewer@eventflow.dev` (Password: `Password123!`)
- **Attendee 2:** `alex.attendee@eventflow.dev` (Password: `Password123!`)

### 3. Run Automated Integration Tests
```bash
npm.cmd test
```

### 4. Start Development Server
```bash
npm.cmd start
```
Server runs on `http://localhost:5000`.

---

## Architecture & API Overview

### Documentation References
* [idea.md](file:///c:/Users/lenovo/lfdt/code%20and%20files/idea.md) — Product requirements & user stories.
* [architecture.md](file:///c:/Users/lenovo/lfdt/code%20and%20files/architecture.md) — Supabase BaaS architecture & component flow.
* [frontend.md](file:///c:/Users/lenovo/lfdt/code%20and%20files/frontend.md) — UI/UX wireframes & Supabase client integration.
* [database.md](file:///c:/Users/lenovo/lfdt/code%20and%20files/database.md) — Supabase PostgreSQL schema, RLS policies & RPC specifications.
* [backend.md](file:///c:/Users/lenovo/lfdt/code%20and%20files/backend.md) — REST API endpoint specs & Supabase RPC handler logic.
