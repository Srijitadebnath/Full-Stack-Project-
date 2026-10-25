-- =================================================================
-- SMART COLLEGE EVENT MANAGEMENT SYSTEM - DATABASE SCHEMA (POSTGRESQL)
-- Version: 1.0 (Production Ready)
-- =================================================================

-- Enable UUID extension for secure non-sequential primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing tables (for development reset)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS event_budgets CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =================================================================
-- 1. USERS TABLE
-- Stores Faculty Admins, Registered OC Members, and Students
-- =================================================================
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TEAM', 'USER')),
    phone VARCHAR(20),
    department VARCHAR(100),
    college VARCHAR(150) DEFAULT 'UPES Dehradun',
    avatar_url TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_ACTIVATION', 'SUSPENDED')),
    activation_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =================================================================
-- 2. EVENTS TABLE
-- Core campus events catalog
-- =================================================================
CREATE TABLE events (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    registration_deadline DATE NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    registration_count INT DEFAULT 0 CHECK (registration_count >= 0),
    status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    category VARCHAR(50) NOT NULL,
    budget NUMERIC(12, 2) DEFAULT 0.00,
    budget_used NUMERIC(12, 2) DEFAULT 0.00,
    image_url TEXT,
    organizer VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);

-- =================================================================
-- 3. REGISTRATIONS TABLE
-- Tracks participant & OC team registrations for events
-- =================================================================
CREATE TABLE registrations (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    college VARCHAR(150) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year_level VARCHAR(20) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    registration_type VARCHAR(20) NOT NULL CHECK (registration_type IN ('PARTICIPANT', 'OC_TEAM')),
    oc_department VARCHAR(100),
    oc_responsibility_preference TEXT,
    status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PENDING', 'CANCELLED', 'ATTENDED')),
    registration_date DATE DEFAULT CURRENT_DATE,
    custom_inputs JSONB -- Flexible dynamic form inputs (e.g., T-Shirt size, Diet preferences)
);

CREATE INDEX idx_reg_event ON registrations(event_id);
CREATE INDEX idx_reg_email ON registrations(user_email);
CREATE INDEX idx_reg_type ON registrations(registration_type);

-- =================================================================
-- 4. OC TEAM MEMBERS TABLE
-- Assigns registered student OC members to specific event responsibilities
-- =================================================================
CREATE TABLE team_members (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    year_level VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Lead', 'Coordinator', 'Member', 'Volunteer')),
    assigned_event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    assigned_event_name VARCHAR(150) NOT NULL,
    responsibility TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_team_event ON team_members(assigned_event_id);
CREATE INDEX idx_team_email ON team_members(email);

-- =================================================================
-- 5. TASKS TABLE
-- Work assignments given to OC teams and individual members
-- =================================================================
CREATE TABLE tasks (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    assigned_to_name VARCHAR(150) NOT NULL,
    assigned_to_id VARCHAR(64) NOT NULL,
    assigned_type VARCHAR(20) NOT NULL CHECK (assigned_type IN ('TEAM', 'MEMBER')),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(30) DEFAULT 'ASSIGNED' CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'NEEDS_REVISION', 'COMPLETED')),
    progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_assignee ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_event ON tasks(event_id);

-- =================================================================
-- 6. BUDGET ALLOCATIONS & EXPENSES TABLES
-- Financial allocations and logged expense receipts
-- =================================================================
CREATE TABLE event_budgets (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id VARCHAR(64) UNIQUE NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_budget NUMERIC(12, 2) NOT NULL CHECK (total_budget >= 0),
    allocated NUMERIC(12, 2) DEFAULT 0.00,
    spent NUMERIC(12, 2) DEFAULT 0.00
);

CREATE TABLE expenses (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    budget_id VARCHAR(64) NOT NULL REFERENCES event_budgets(id) ON DELETE CASCADE,
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Venue', 'Decoration', 'Food', 'Marketing', 'Transportation', 'Equipment', 'Sound', 'Lighting', 'Photography', 'Printing', 'Miscellaneous')),
    title VARCHAR(200) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    spent_by VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'PAID' CHECK (status IN ('PAID', 'PENDING', 'APPROVED')),
    notes TEXT
);

CREATE INDEX idx_expenses_event ON expenses(event_id);

-- =================================================================
-- 7. SUBMISSIONS TABLE
-- Text updates, photo proofs, and voice notes submitted by OC members
-- =================================================================
CREATE TABLE submissions (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    submitted_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
    submitted_by_name VARCHAR(100) NOT NULL,
    submission_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('TEXT', 'IMAGE', 'VOICE')),
    image_url TEXT,
    voice_url TEXT,
    voice_duration_seconds INT,
    status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'NEEDS_REVISION')),
    feedback TEXT
);

CREATE INDEX idx_submissions_task ON submissions(task_id);

-- =================================================================
-- 8. CHAT MESSAGES & CONVERSATIONS TABLES
-- Operations messenger threads
-- =================================================================
CREATE TABLE conversations (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    participant_name VARCHAR(100) NOT NULL,
    participant_role VARCHAR(20) NOT NULL,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unread_count INT DEFAULT 0
);

CREATE TABLE messages (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL REFERENCES users(id),
    sender_name VARCHAR(100) NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'IMAGE', 'VOICE', 'ATTACHMENT')),
    file_url TEXT,
    audio_duration_seconds INT
);

CREATE INDEX idx_messages_conv ON messages(conversation_id);

-- =================================================================
-- 10. PASSWORD RESETS TABLE
-- Secure, time-limited tokens for account password recovery
-- =================================================================
CREATE TABLE password_resets (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
