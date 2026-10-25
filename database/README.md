# PostgreSQL Database Setup Guide

This folder contains the official production database schema and seed data scripts for the **Smart College Event Management System**.

## 1. Quick Database Setup

### Option A: Local PostgreSQL Installation
1. Open PostgreSQL Command Line (`psql`) or your database GUI tool (pgAdmin, DBeaver, TablePlus).
2. Create the target database:
   ```sql
   CREATE DATABASE smart_campus_events;
   ```
3. Run the schema creation DDL script:
   ```bash
   psql -U postgres -d smart_campus_events -f database/schema.sql
   ```
4. Populate initial seed data:
   ```bash
   psql -U postgres -d smart_campus_events -f database/seed.sql
   ```

### Option B: Docker Container (Recommended)
Launch a pre-configured PostgreSQL 16 container with one command:
```bash
docker run --name campus-postgres -e POSTGRES_DB=smart_campus_events -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

Then load the schema and seed data:
```bash
docker exec -i campus-postgres psql -U postgres -d smart_campus_events < database/schema.sql
docker exec -i campus-postgres psql -U postgres -d smart_campus_events < database/seed.sql
```

---

## 2. Table Summary

- `users`: Accounts for Admins, OC Team Members, and Students.
- `events`: Core event catalog records (dates, venues, capacities, budgets).
- `registrations`: Student signups for event attendance or OC Team registration.
- `team_members`: Organizing Committee student assignments.
- `tasks`: Work items assigned to OC teams with progress tracking.
- `event_budgets` & `expenses`: Financial allocations and logged expense receipts.
- `submissions`: Photo proof and audio voice note work updates.
- `conversations` & `messages`: Operations messenger threads.

---

## 3. Step 2 Preparation
Once PostgreSQL is running and loaded with `schema.sql` and `seed.sql`, you are ready to begin **Phase 2: Backend Auth & Admin Event REST APIs**!
