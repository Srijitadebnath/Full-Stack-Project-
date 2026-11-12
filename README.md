# 🎓 Smart College Event Management System (EVENTRA)

An institutional, enterprise-grade, multi-tier web platform built for **UPES Dehradun** to manage end-to-end college fests, student registrations, organizing committee operations, faculty administrative workflows, and real-time AI-powered campus operations.

---

## 🌟 Key Highlights

- **Multi-Role Portal Segregation**: 3 dedicated consoles for Students (`/user/*`), Organizing Committee (`/vendor/*`), and Faculty/Deans (`/admin/*`).
- **AI Operations & RAG Copilot Suite**: Role-based AI assistants grounded in live PostgreSQL records (events, tasks, budgets, vendors, rosters) and campus policy documents.
- **Dynamic Event Planning Advisor**: Automatically structures unique domain-specific event titles, multi-round competition timelines, strategic budget allocations, and departmental OC rosters without hardcoded templates.
- **Global Floating Copilot**: Persistent, role-aware floating AI assistant mounted across all authenticated admin and OC pages.
- **28+ RESTful Endpoints**: Full CRUD suite for fests, registrations, teams, task assignments, budget accounting, live chat, and AI queries.
- **ACID-Compliant Cloud Database**: Powered by Neon Serverless PostgreSQL on AWS Singapore with row-level locking (`SELECT ... FOR UPDATE`) to eliminate race conditions and overbooking.
- **Institutional Domain Boundary**: Strict email domain enforcement (`@stu.upes.ac.in` for students, `.oc@upes.ac.in` for organizers, and `@upes.ac.in` for faculty admins).
- **1-Click Cascading Record Deletions**: Authorized deletion endpoints for events, tasks, and vendors with foreign key cascade integrity.
- **Zero In-Memory Volatility**: 100% database persistence — all actions survive browser refreshes (F5).
- **Enterprise Security**: BCrypt password hashing (10 salt rounds), JWT authentication, route guards, and zero SQL-injection vulnerability via parameterized queries.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph ClientTier ["Frontend Tier (React 19 + TypeScript + Vite + Tailwind CSS)"]
        UI_Login["LoginPage (Institutional Gateway)"]
        UI_Student["Student Discovery Portal (/user/*)"]
        UI_OC["OC Work Desk (/vendor/*)"]
        UI_Admin["Faculty & Dean Console (/admin/*)"]
        UI_AdminAI["Faculty AI Operations (/admin/ai)"]
        FloatingAI["OperationsAIAssistant (Global Role-Aware Modal)"]
        Guards["ProtectedRoute (Role-Based Route Interceptors)"]
        Services["Service Layer (auth, event, team, task, budget, ai)"]
    end

    subgraph ServerTier ["Application Tier (Node.js + Express + TypeScript)"]
        Router["Express REST Router (server/src/index.ts)"]
        AuthMiddleware["JWT Authentication Guard"]
        AI_Service["AI Assistant Service (RAG Engine + Policy Retriever)"]
        Local_LLM["Ollama Local Engine (Llama 3.2 1B)"]
        TransManager["Transaction Manager (BEGIN ... COMMIT / ROLLBACK)"]
        PoolManager["pg.Pool (Resilient Cloud Connection Pooling)"]
    end

    subgraph DatabaseTier ["Cloud Database Tier (Neon PostgreSQL - AWS Singapore)"]
        DB_Users["users (BCrypt hashes, roles, activation tokens)"]
        DB_Events["events (Capacity, live registrations, budgets, status)"]
        DB_Regs["registrations (ACID booked seats & passes)"]
        DB_Teams["team_members (Active committee roster & assignments)"]
        DB_Tasks["tasks (Checklists & progress percentages)"]
        DB_Vendors["vendors (Contractors, categories, milestones)"]
        DB_Budgets["event_budgets & expenses (Receipts & spent tracking)"]
    end

    UI_Login --> Guards
    UI_Student --> Guards
    UI_OC --> Guards
    UI_Admin --> Guards
    FloatingAI --> Services
    UI_AdminAI --> Services
    Guards --> Services
    Services -->|"HTTP JSON REST (Port 5000)"| Router
    Router --> AuthMiddleware
    Router --> AI_Service
    AI_Service <--> Local_LLM
    Router --> TransManager
    TransManager --> PoolManager
    PoolManager -->|"Secure TLS/SSL Pool (Port 5432)"| DatabaseTier
```

---

## 🤖 Role-Aware AI Operations Suite

The platform includes a 3-tier Retrieval-Augmented Generation (RAG) and operational intelligence system:

### 1. 🛡️ Faculty Operations Copilot (`ADMIN`)
- **Live Financial Audit**: Real-time evaluation of total allocated budget vs. spent funds across active campus events.
- **Operational Task & Vendor Delay Auditing**: Live detection of pending deliverables, overdue deadlines, and contractor progress.
- **Dynamic Event Planning Advisor**: When faculty provide a rough prompt (e.g. *"Plan a 2-day AI Hackathon for CSE students with 3 rounds, ₹50,000 budget, and 18 volunteers at MAC Auditorium"*), the AI synthesizes:
  - 3 unique creative domain titles (e.g., *NeuralSprint 2026*, *ByteStorm AI*).
  - A structured 3-round competition timeline (Ideation & System Design, Continuous Sprint & Mentor Checkpoints, Live Stage Demos).
  - Strategic budget breakdown (Cash prizes, Catering, Stage/AV networking, Kits & Certificates).
  - Complete departmental OC roster scaled to the exact volunteer count.
- **Manual Control Flow**: Directs faculty to the **Events Console** (`+ Create Event`) and **Tasks Console** to manually finalize and deploy the event.

### 2. 📋 OC Team Assistant (`TEAM`)
- **Task & Deadline Inquiries**: Immediate visibility into personal task assignments, priorities, and deadlines.
- **Peer Directory**: Discover fellow departmental volunteers and team leads.
- **Operational Guidelines**: Instant answers regarding line array checks, work proof submission, venue asset returns, and disciplinary conduct codes.

### 3. 🎓 Student Fest Helpdesk (`USER`)
- **Live Event & Seat Queries**: Real-time seat counts and schedule details.
- **Pass & QR Code Guidance**: Locating digital QR entry badges under *My Passes*.
- **Institutional Campus Policies**: Clarifications on gate entry, ID card rules, dress codes, and certificate issuance.

---

## 📱 Operational Consoles

### 1. 🎓 Student Discovery Portal (`/user/*`)
- **Live Event Catalog**: Search and filter upcoming fests with real-time seat availability.
- **Instant Booking**: Real-time pass reservation with button state locking (`✓ Already Registered`).
- **Digital Pass QR Badge**: Displays attendee details, unique registration ID, and pass QR code.
- **Organizing Committee Application**: Submit volunteer applications for college fests directly from the home feed.
- **In-App OC Account Activation**: When approved by the Dean, students review their official `.oc@upes.ac.in` handle, set their password, and jump straight to the OC Work Desk.

### 2. 📋 Organizing Committee Work Desk (`/vendor/*`)
- **Department Task Checklist**: Filter tasks by priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and status.
- **Progress Tracking**: Step-by-step progress logging (`+25% Progress` button) syncing directly to PostgreSQL.
- **Auto-Completion**: Reaching 100% progress automatically marks tasks as `'COMPLETED'`.
- **Floating OC Operations Assistant**: Instant answers on work proof uploads, venue soundchecks, and peer assignments.
- **Attendee Check-In**: Fast verification of student passes at campus venue gates.

### 3. 🛡️ Faculty & Dean Administrative Console (`/admin/*`)
- **Event Management**: Launch new campus fests, edit parameters, or delete cancelled events with cascading cleanup.
- **Volunteer Application Review**: Review student volunteer submissions with one-click **"Approve & Issue OC Account"**.
- **Official Handle Generation**: Automated generation of institutional credentials (`firstname.oc@upes.ac.in`) with single-use activation tokens.
- **Task & Vendor Delegation**: Assign departmental tasks with deadlines and manage contracted campus vendors with 1-click deletion.
- **Live Budget & Receipt Tracker**: Real-time spending overview with category breakdowns and itemized receipt logging.
- **Faculty AI Operations Center**: Full-page and floating copilot for instant campus auditing and event scheduling consultation.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend** | React 19 | Modern UI framework with state reconciliation |
| **Language** | TypeScript | Strict type checking across client and server |
| **Build Tool** | Vite | Sub-second Hot Module Replacement (HMR) |
| **Styling** | Tailwind CSS v4 | Utility-first glassmorphism design system |
| **Backend** | Node.js & Express | Asynchronous non-blocking REST API server |
| **AI Engine** | Ollama + Llama 3.2 1B | Local low-latency LLM with RAG grounding |
| **Database** | Neon Cloud PostgreSQL | Serverless PostgreSQL deployed on AWS Singapore |
| **Database Driver** | `pg` (node-postgres) | Resilient connection pooling with SSL/TLS |
| **Security** | BCrypt (`bcryptjs`) | Password hashing with 10 random salt rounds |
| **Auth** | JSON Web Tokens (`jsonwebtoken`) | Stateless role-encoded authorization tokens |
| **Icons** | Lucide React | Uniform, responsive icon library |

---

## 📡 REST API Reference (28 Endpoints)

### System & Health
- `GET /` - Server status & health probe.

### Events & Discovery
- `GET /api/events` - Queries active fests with dynamic `(capacity - registration_count) AS remaining_seats`.
- `GET /api/events/:id` - Single event details with assigned OC members and active task checklists.
- `POST /api/events` - Faculty creates a new fest with venue, dates, and seat caps.
- `DELETE /api/events/:id` - **1-Click Cascade Deletion**. Removes event and cascades across tasks and related records.

### Registrations & Seat Booking
- `POST /api/events/:id/register` - **ACID Transaction with `SELECT ... FOR UPDATE`**. Checks capacity, blocks duplicate registrations, and locks the seat row.
- `GET /api/registrations` - Queries tickets (supports `?email=...` and `?event_id=...`).

### Authentication & Account Lifecycle
- `POST /api/auth/register` - Student signup; enforces `@stu.upes.ac.in` domain and hashes password.
- `POST /api/auth/login` - Multi-portal login with role-matching and BCrypt verification.
- `POST /api/auth/oc-invite` - Generates `name.oc@upes.ac.in` handle and 15-character activation token.
- `POST /api/auth/activate-oc` - Validates token, hashes OC password, activates account, and burns token.
- `POST /api/auth/forgot-password` - Issues 15-minute recovery token routed strictly to `@stu.upes.ac.in`.
- `POST /api/auth/reset-password` - Validates single-use token and re-hashes password.

### Organizing Committee Workflow
- `POST /api/oc/apply` - Student applies for fest organizing committee (`status = 'PENDING'`).
- `GET /api/admin/oc-applications` - Admin fetches pending student volunteer applications.
- `POST /api/admin/approve-oc` - Admin approves student, generates handle and token, creates OC account.
- `GET /api/user/oc-status` - Student portal polls for approval status and retrieves activation token.

### Team Management
- `GET /api/teams` - Queries active organizing committee members.
- `POST /api/teams` - Admin adds a team member manually.
- `DELETE /api/teams/:id` - Admin removes an organizing committee member.

### Task Management
- `GET /api/tasks` - Queries event checklists with progress percentages and assignees.
- `POST /api/tasks` - Admin creates a task with priority, deadline, and assigned OC lead.
- `PATCH /api/tasks/:id/progress` - Updates task progress (0–100%) and auto-completes at 100%.
- `DELETE /api/tasks/:id` - Admin deletes an operational task.

### Vendor Management
- `GET /api/vendors` - Fetches contracted vendors, categories, and progress milestones.
- `POST /api/vendors` - Admin registers a new vendor.
- `DELETE /api/vendors/:id` - Admin removes a vendor contract.

### Budgeting & Expenses
- `GET /api/budget/:eventId` - Fetches total budget, spent sum, remaining balance, and itemized receipts.
- `POST /api/expenses` - Logs expense receipt, updates `event_budgets`, and recalculates `budget_used`.

### AI Operations Copilot
- `POST /api/ai/query` - Role-aware intelligent query handler for Student Helpdesk, OC Operations, and Faculty Audits.

---

## 🔒 Security Architecture

1. **SQL Injection Immunity**: 100% of queries use parameterized prepared statements (`$1, $2`). Input strings are never concatenated directly into SQL queries.
2. **Cryptographic Protection**: Passwords are never stored in plaintext. They are salted and hashed using BCrypt (10 rounds).
3. **Race Condition Prevention**: `POST /api/events/:id/register` runs inside an isolated SQL transaction using `SELECT ... FOR UPDATE`. If concurrent users register at the same millisecond for the last ticket, requests are serialized and overbooking is physically impossible.
4. **Institutional Boundary Enforcement**:
   - Students: `@stu.upes.ac.in`
   - Organizing Committee: `.oc@upes.ac.in`
   - Faculty & Deans: `@upes.ac.in`
5. **Account Takeover Protection**: Password reset tokens for both students and OC accounts are routed strictly to the enrolled student address (`@stu.upes.ac.in`).
6. **Frontend Route Guards**: `ProtectedRoute` intercepts client-side routing to prevent privilege escalation or unauthorized URL access.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- A free [Neon PostgreSQL](https://neon.tech) cloud database account
- Optional: [Ollama](https://ollama.com) with `llama3.2:1b` for local AI copilot features

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/SrijitaDebnath/Full-Stack-Project-.git
cd Full-Stack-Project-
```

#### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

#### 3. Configure Environment Variables
Inside the `server/` directory, create a `.env` file based on `.env.example`:
```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:<your-password>@<your-neon-host>.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_jwt_secret_key_here
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

#### 4. Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Server runs at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev
# Vite dev server runs at http://localhost:5173
```

Visit `http://localhost:5173` in your browser.

---

## 📂 Project Directory Structure

```
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                  # Resilient Neon PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts      # Role-based JWT validation
│   │   ├── Services/
│   │   │   └── aiAssistantService.ts  # Role-aware AI engine & Dynamic event advisor
│   │   └── index.ts                   # 28 REST API routes, validation, and business logic
│   ├── .env.example                   # Environment template
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── AppLayout.tsx              # Shell with floating OperationsAIAssistant
│   │   └── router.tsx                 # ProtectedRoute role guards
│   ├── components/                    # Reusable UI components & modals
│   │   ├── OperationsAIAssistant.tsx  # Floating multi-role AI widget
│   │   ├── StudentAIAssistant.tsx     # Student helpdesk floating copilot
│   │   └── EventProposalCard.tsx      # Event preview card
│   ├── pages/
│   │   ├── admin/                     # Faculty console (AI, Teams, Events, Tasks, Budget)
│   │   │   ├── AdminAIPage.tsx        # Dedicated Faculty AI Operations Console
│   │   │   └── AdminDashboardPage.tsx # Hero AI quick-launch banner
│   │   ├── auth/                      # Dual-mode Login & Signup page
│   │   ├── user/                      # Student discovery feed & pass registration
│   │   └── vendor/                    # OC work desk & task progress tracker
│   ├── services/                      # API communication layer (auth, event, team, task, budget, ai)
│   └── types/                         # TypeScript interfaces and domain models
├── .gitignore
├── package.json
├── README.md                          # Master documentation
└── vite.config.ts
```

---

## 👩‍💻 Author & Institutional Attribution

- **Project Lead**: Srijita Debnath
- **Institution**: University of Petroleum and Energy Studies (UPES), Dehradun
- **License**: MIT
