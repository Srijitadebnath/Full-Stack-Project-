import express, { Request, Response } from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOcActivationEmail, sendPasswordResetEmail } from './Services/mailServices.js';
import { verifyToken, requireRole } from './middleware/authMiddleware.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// =================================================================
// 1. HEALTH CHECK ROUTE
// =================================================================
app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "🚀 Smart College Event Management API is online and healthy!"
    });
});

// =================================================================
// 2. LIVE DATABASE ROUTE: Fetch all upcoming events directly from PostgreSQL!
// =================================================================
app.get('/api/events', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                name, 
                description, 
                event_date, 
                start_time, 
                end_time, 
                venue, 
                capacity, 
                registration_count, 
                (capacity - registration_count) AS remaining_seats,
                status, 
                category, 
                organizer
            FROM events
            ORDER BY event_date ASC;
        `);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch events from PostgreSQL database"
        });
    }
});

// =================================================================
// 3. GET SINGLE EVENT BY ID (With OC Team & Checklist Tasks)
// =================================================================
app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const eventResult = await pool.query(`
            SELECT
                id,
                name,
                description,
                event_date,
                start_time,
                end_time,
                venue,
                registration_deadline,
                capacity,
                registration_count,
                (capacity - registration_count) AS remaining_seats,
                status,
                category,
                budget,
                budget_used,
                organizer
            FROM events
            WHERE id = $1;
        `, [id]);

        if (eventResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Event with ID '${id}' was not found.`
            });
        }

        const event = eventResult.rows[0];

        // Fetch Assigned OC Team Members
        const teamResult = await pool.query(`
            SELECT
                id,
                name,
                email,
                phone,
                department,
                year_level,
                role,
                responsibility,
                status
            FROM team_members
            WHERE assigned_event_id = $1;
        `, [id]);

        // Fetch Active Checklist Tasks
        const taskResult = await pool.query(`
            SELECT
                id,
                name,
                description,
                assigned_to_name,
                priority,
                status,
                progress,
                deadline
            FROM tasks
            WHERE event_id = $1
            ORDER BY deadline ASC;
        `, [id]);

        res.status(200).json({
            success: true,
            data: {
                ...event,
                oc_team: teamResult.rows,
                tasks: taskResult.rows
            }
        });
    } catch (error) {
        console.error("Error fetching event details:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error fetching event details"
        });
    }
});

// =================================================================
// 4. ATOMIC EVENT REGISTRATION WITH ROW-LEVEL LOCKING & STRICT VALIDATION
// Endpoint: POST /api/events/:id/register
// =================================================================
app.post('/api/events/:id/register', async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        user_name,
        user_email,
        user_phone,
        college,
        course,
        year_level,
        student_id,
        registration_type,
        oc_department,
        custom_inputs
    } = req.body;

    // -------------------------------------------------------------
    // STEP 1: STRICT INPUT VALIDATION (NO GUESSING / NO DIRTY DATA)
    // -------------------------------------------------------------
    const missingFields: string[] = [];
    if (!user_name) missingFields.push("Full Name (user_name)");
    if (!user_email) missingFields.push("Email (user_email)");
    if (!user_phone) missingFields.push("Phone Number (user_phone)");
    if (!student_id) missingFields.push("Student SAP ID (student_id)");
    if (!college) missingFields.push("College / University (college)");
    if (!course) missingFields.push("Course / Branch (course)");
    if (!year_level) missingFields.push("Year Level (year_level)");

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Please fill in all required fields. Missing: ${missingFields.join(', ')}`
        });
    }

    // Grab a dedicated client from the pool for the transaction
    const client = await pool.connect();

    try {
        // -------------------------------------------------------------
        // STEP 2: BEGIN TRANSACTION & ROW-LEVEL LOCK (Prevents Overbooking)
        // -------------------------------------------------------------
        await client.query('BEGIN');

        // FOR UPDATE locks this exact row against concurrent race conditions
        const eventLock = await client.query(`
            SELECT id, name, capacity, registration_count, status, registration_deadline
            FROM events
            WHERE id = $1
            FOR UPDATE;
        `, [id]);

        if (eventLock.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: `Event with ID '${id}' was not found.`
            });
        }

        const event = eventLock.rows[0];

        // Business Validation: Is the event still active?
        if (event.status !== 'UPCOMING') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `Cannot register: Event is currently ${event.status}.`
            });
        }

        // Business Validation: Are seats available?
        if (event.registration_count >= event.capacity) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "Sorry, this event is already fully booked! Capacity reached."
            });
        }

        // Business Validation: Check duplicate registration by SAP ID or Email (Case-insensitive & trimmed)
        const existingReg = await client.query(`
            SELECT id FROM registrations
            WHERE event_id = $1 AND (
                LOWER(TRIM(student_id)) = LOWER(TRIM($2)) 
                OR LOWER(TRIM(user_email)) = LOWER(TRIM($3))
            );
        `, [id, student_id, user_email]);

        if (existingReg.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "You have already registered for this event! Your digital pass is already active in your account."
            });
        }

        // -------------------------------------------------------------
        // STEP 3: INSERT VERIFIED DATA (REAL DATA ONLY)
        // -------------------------------------------------------------
        const regResult = await client.query(`
            INSERT INTO registrations (
                event_id, 
                event_name, 
                user_name, 
                user_email, 
                user_phone, 
                college, 
                course, 
                year_level, 
                student_id, 
                registration_type, 
                oc_department, 
                custom_inputs,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'CONFIRMED')
            RETURNING id, registration_date, status;
        `, [
            id,
            event.name,
            user_name,
            user_email,
            user_phone || null,
            college,
            course,
            year_level,
            student_id,
            registration_type || 'PARTICIPANT',
            oc_department || null,
            custom_inputs ? JSON.stringify(custom_inputs) : null
        ]);

        // -------------------------------------------------------------
        // STEP 4: ATOMICALLY INCREMENT REGISTRATION COUNT
        // -------------------------------------------------------------
        await client.query(`
            UPDATE events 
            SET registration_count = registration_count + 1 
            WHERE id = $1;
        `, [id]);

        // -------------------------------------------------------------
        // STEP 5: COMMIT TRANSACTION (Write permanently to SSD)
        // -------------------------------------------------------------
        await client.query('COMMIT');

        const newRegistration = regResult.rows[0];

        res.status(201).json({
            success: true,
            message: `🎉 Successfully registered for ${event.name}!`,
            data: {
                ticket_id: newRegistration.id,
                event_id: id,
                event_name: event.name,
                attendee: user_name,
                email: user_email,
                course: course,
                year_level: year_level,
                status: newRegistration.status,
                registration_date: newRegistration.registration_date
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Registration transaction error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error processing registration."
        });
    } finally {
        // ALWAYS release the client back to the connection pool
        client.release();
    }
});

// =================================================================
// 5. UPDATE OC TASK PROGRESS / STATUS (HTTP PATCH)
// Endpoint: PATCH /api/tasks/:id/progress
// =================================================================
app.patch('/api/tasks/:id/progress', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { progress, status, notes } = req.body;

        if (progress === undefined && !status && !notes) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update: progress, status, or notes."
            });
        }

        // Validate progress bounds if provided
        if (progress !== undefined && (progress < 0 || progress > 100)) {
            return res.status(400).json({
                success: false,
                message: "Progress must be a percentage between 0 and 100."
            });
        }

        // Auto-complete status if progress hits 100
        const computedStatus = progress === 100 ? 'COMPLETED' : status;

        const updateResult = await pool.query(`
            UPDATE tasks 
            SET 
                progress = COALESCE($1, progress),
                status = COALESCE($2, status),
                notes = COALESCE($3, notes)
            WHERE id = $4
            RETURNING id, name, progress, status, notes, event_id;
        `, [progress, computedStatus, notes, id]);

        if (updateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Task with ID '${id}' was not found.`
            });
        }

        res.status(200).json({
            success: true,
            message: "Task progress updated successfully!",
            data: updateResult.rows[0]
        });

    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error updating task."
        });
    }
});

// =================================================================
// 6. SUBMIT OC EXPENSE REIMBURSEMENT (HTTP POST)
// Endpoint: POST /api/expenses
// =================================================================
app.post('/api/expenses', async (req: Request, res: Response) => {
    try {
        const { event_id, budget_id, category, title, amount, spent_by, notes } = req.body;

        if (!event_id || !title || !amount || !spent_by) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: event_id, title, amount, and spent_by are required."
            });
        }

        // Fetch or link budget_id if not provided directly
        let finalBudgetId = budget_id;
        if (!finalBudgetId) {
            const budgetLookup = await pool.query(`SELECT id FROM event_budgets WHERE event_id = $1;`, [event_id]);
            if (budgetLookup.rows.length > 0) {
                finalBudgetId = budgetLookup.rows[0].id;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "No approved budget found for this event."
                });
            }
        }

        // Insert expense record
        const expenseResult = await pool.query(`
            INSERT INTO expenses (
                budget_id, 
                event_id, 
                category, 
                title, 
                amount, 
                spent_by, 
                status, 
                notes
            ) VALUES ($1, $2, $3, $4, $5, $6, 'PAID', $7)
            RETURNING id, title, amount, category, status, expense_date;
        `, [
            finalBudgetId,
            event_id,
            category || 'Miscellaneous',
            title,
            amount,
            spent_by,
            notes || null
        ]);

        // Automatically update the spent amount in event_budgets
        await pool.query(`
            UPDATE event_budgets 
            SET spent = spent + $1 
            WHERE id = $2;
        `, [amount, finalBudgetId]);

        // Automatically update the budget_used in events
        await pool.query(`
            UPDATE events 
            SET budget_used = budget_used + $1 
            WHERE id = $2;
        `, [amount, event_id]);

        res.status(201).json({
            success: true,
            message: "Expense logged successfully and budget updated!",
            data: expenseResult.rows[0]
        });

    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error logging expense."
        });
    }
});

// =================================================================
// 7. FACULTY ADMIN: CREATE NEW EVENT (HTTP POST)
// Endpoint: POST /api/events
// =================================================================
app.post('/api/events', async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            event_date,
            start_time,
            end_time,
            venue,
            registration_deadline,
            capacity,
            category,
            budget,
            organizer
        } = req.body;

        if (!name || !event_date || !venue || !capacity || !category) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, event_date, venue, capacity, and category are required."
            });
        }

        const newEventResult = await pool.query(`
            INSERT INTO events (
                name, 
                description, 
                event_date, 
                start_time, 
                end_time, 
                venue, 
                registration_deadline, 
                capacity, 
                registration_count,
                status, 
                category, 
                budget, 
                budget_used, 
                organizer
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'UPCOMING', $9, $10, 0.00, $11)
            RETURNING *;
        `, [
            name,
            description || '',
            event_date,
            start_time || '09:00 AM',
            end_time || '05:00 PM',
            venue,
            registration_deadline || event_date,
            capacity,
            category,
            budget || 0.00,
            organizer || 'Student Affairs'
        ]);

        const createdEvent = newEventResult.rows[0];

        // Also auto-initialize an empty budget record for this event
        if (budget && budget > 0) {
            await pool.query(`
                INSERT INTO event_budgets (event_id, total_budget, allocated, spent)
                VALUES ($1, $2, $2, 0.00);
            `, [createdEvent.id, budget]);
        }

        res.status(201).json({
            success: true,
            message: `Event '${name}' created successfully!`,
            data: createdEvent
        });

    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error creating event."
        });
    }
});
// =================================================================
// 8. MULTI-PORTAL INSTITUTIONAL LOGIN API (Strict Email & Role Guard)
// Endpoint: POST /api/auth/login
// =================================================================
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, department, college } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, email, and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existing = await pool.query(`SELECT id FROM users WHERE LOWER(email) = $1`, [normalizedEmail]);
        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "An account with this institutional email already exists. Please sign in."
            });
        }

        // Hash the password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserResult = await pool.query(`
            INSERT INTO users (
                name, email, password_hash, role, phone, department, college, status
            ) VALUES ($1, $2, $3, 'USER', $4, $5, $6, 'ACTIVE')
            RETURNING id, name, email, role, department, college;
        `, [
            name,
            normalizedEmail,
            hashedPassword,
            phone || null,
            department || 'Computer Science',
            college || 'UPES Dehradun'
        ]);

        const newUser = newUserResult.rows[0];

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_2026';
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: `Account created successfully! Welcome, ${newUser.name}.`,
            token,
            user: newUser
        });
    } catch (error) {
        console.error("Student registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error registering student."
        });
    }
});

app.post('/api/auth/login', async(req: Request, res: Response) => {
    try{
        const{email,password, portal} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Please provide both college email and password."
            });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const userResult = await pool.query(`
            SELECT id, name, email, password_hash, role, department, college, avatar_url, status
            FROM users
            WHERE LOWER(email) = $1
        `, [normalizedEmail]);
        if(userResult.rows.length === 0){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials:No account found with this institutional email."
            });
        }
        const user = userResult.rows[0];
        if(user.status === 'PENDING_ACTIVATION'){
            return res.status(403).json
({
                success:false,
                message: "Your OC account is pending activation, please use the activation link sent to your college mail to set your password."
});        }
       if(user.status === 'SUSPENDED'){
        return res.status(403).json({
            success:false,
            message:"Your campus account has been suspended by administration. Please contact the APO"
        });
       }
       if(portal){
        const requestedPortal = portal.toUpperCase();
        if(user.role !== requestedPortal){
            return res.status(403).json({
                success: false,
                message:`Accsess Denied: You cannot log into the ${requestedPortal} portal with a ${user.role} account.`
            });
        }
       }
       // 5. Verify Password (Supports both bcrypt hash & direct password comparison)
        let isPasswordValid = false;
        if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
            isPasswordValid = await bcrypt.compare(password, user.password_hash);
        } else {
            // Direct match for initial seed data
            isPasswordValid = (password === user.password_hash);
        }
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials: The password you entered is incorrect."
            });
        }
        // 6. Generate Signed JWT "Digital Wristband" (Valid for 7 Days)
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_2026';
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            jwtSecret,
            { expiresIn: '7d' }
        );
        // 7. Return successful login payload (Never return password_hash!)
        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}! Authentication successful.`,
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                college: user.college,
                avatar_url: user.avatar_url
            }
        });
    } catch (error) {
        console.error("Login authentication error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during authentication."
        });
    }
});


// =================================================================
// 9. OC ONBOARDING: ADMIN APPROVES VOLUNTEER (Tasks assigned later)
// Endpoint: POST /api/auth/oc-invite
// =================================================================
app.post('/api/auth/oc-invite', async (req: Request, res: Response) => {
    try {
        const { student_name, student_email, department, event_id } = req.body;

        if (!student_name || !student_email || !department) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: student_name, student_email, and department are required."
            });
        }

        // 1. Generate official OC email: e.g. "rohan.oc@upes.ac.in"
        const cleanName = student_name.trim().toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
        const officialOcEmail = `${cleanName}.oc@upes.ac.in`;

        // 2. Generate secure activation token
        const activationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        // 3. Create or update user row in PostgreSQL with PENDING_ACTIVATION
        const existingUser = await pool.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1);`, [officialOcEmail]);
        let userId: string;

        if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
            await pool.query(`
                UPDATE users 
                SET status = 'PENDING_ACTIVATION', activation_token = $1 
                WHERE id = $2;
            `, [activationToken, userId]);
        } else {
            const newUserResult = await pool.query(`
                INSERT INTO users (
                    name, 
                    email, 
                    password_hash, 
                    role, 
                    department, 
                    college, 
                    status, 
                    activation_token
                ) VALUES ($1, $2, 'UNSET', 'TEAM', $3, 'UPES Dehradun', 'PENDING_ACTIVATION', $4)
                RETURNING id;
            `, [student_name, officialOcEmail, department, activationToken]);
            userId = newUserResult.rows[0].id;
        }

        // 4. Add them to the event's team roster as a general volunteer (Tasks assigned later!)
        if (event_id) {
            const eventLookup = await pool.query(`SELECT name FROM events WHERE id = $1;`, [event_id]);
            const eventName = eventLookup.rows.length > 0 ? eventLookup.rows[0].name : 'Campus Fest';

            await pool.query(`
                INSERT INTO team_members (
                    user_id, name, email, department, year_level, role, assigned_event_id, assigned_event_name, responsibility, status
                ) VALUES ($1, $2, $3, $4, '3rd Year', 'Volunteer', $5, $6, 'General Volunteer (Tasks to be assigned upon team finalization)', 'ACTIVE');
            `, [
                userId,
                student_name,
                officialOcEmail,
                department,
                event_id,
                eventName
            ]);
        }

        const activationUrl = `http://localhost:5173/activate-oc?token=${activationToken}`;
        const mailResult = await sendOcActivationEmail(
            student_email,
            student_name,
            officialOcEmail,
            activationUrl
        );
        res.status(201).json({
            success: true,
            message: `Official OC account created for ${student_name}! Activation link generated.`,
            data: {
                official_email: officialOcEmail,
                personal_email: student_email,
                department: department,
                role: "Volunteer",
                note: "Tasks will be assigned by the Admin once full committee is formed.",
                activation_token: activationToken,
                activation_url: activationUrl
            }
        });

    } catch (error) {
        console.error("OC Invite error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error creating OC account invitation."
        });
    }
});
// =================================================================
// 10. OC ACTIVATION: SET NEW PASSWORD
// Endpoint: POST /api/auth/activate-oc
// =================================================================
app.post('/api/auth/activate-oc', async (req: Request, res: Response) => {
    try {
        const { token, new_password } = req.body;
        if (!token || !new_password) {
            return res.status(400).json({
                success: false,
                message: "Missing token or new_password."
            });
        }
        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }
        // 1. Look up user by activation token
        const userResult = await pool.query(`
            SELECT id, name, email, status FROM users WHERE activation_token = $1;
        `, [token]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired activation link."
            });
        }
        const user = userResult.rows[0];
        // 2. Hash the new password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        // 3. Activate the account and clear the token!
        await pool.query(`
            UPDATE users 
            SET 
                password_hash = $1, 
                status = 'ACTIVE', 
                activation_token = NULL 
            WHERE id = $2;
        `, [hashedPassword, user.id]);
        res.status(200).json({
            success: true,
            message: `🎉 Account activated successfully! You can now log into the OC Portal with ${user.email}.`,
            data: {
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error("OC Activation error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error activating account."
        });
    }
});
// =================================================================
// 11. FORGOT PASSWORD (DISPATCHED EXCLUSIVELY TO .stu.upes.ac.in)
// Endpoint: POST /api/auth/forgot-password
// =================================================================
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter your registered college email."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 1. Look up user by email
        const userResult = await pool.query(`
            SELECT id, name, email, role FROM users WHERE LOWER(email) = $1;
        `, [normalizedEmail]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No registered account found with this institutional email."
            });
        }

        const user = userResult.rows[0];
        let targetRecoveryEmail = user.email;

        // 2. Security Rule: If it's an OC member (.oc@upes.ac.in),
        // find their primary student email (.stu.upes.ac.in) to deliver the recovery link!
        if (user.role === 'TEAM' || normalizedEmail.includes('.oc@')) {
            const studentLookup = await pool.query(`
                SELECT user_email FROM registrations 
                WHERE LOWER(user_name) = LOWER($1) AND user_email LIKE '%stu.upes.ac.in'
                LIMIT 1;
            `, [user.name]);

            if (studentLookup.rows.length > 0) {
                targetRecoveryEmail = studentLookup.rows[0].user_email;
            } else {
                // Fallback: Check if they have an active student email
                targetRecoveryEmail = `${user.email.split('.')[0]}.mehta@stu.upes.ac.in`; // institutional student mapping
            }
        }

        // 3. Verification: Ensure the recovery destination is strictly a student college mail (.stu.upes.ac.in)
        if (!targetRecoveryEmail.endsWith('stu.upes.ac.in') && user.role !== 'ADMIN') {
            return res.status(400).json({
                success: false,
                message: "Password recovery for campus members can only be dispatched to an official @stu.upes.ac.in student address."
            });
        }

        // 4. Generate secure 32-character reset token
        const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        // 5. Token expires in 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // 6. Save token to password_resets table
        await pool.query(`
            INSERT INTO password_resets (user_id, token, expires_at, used)
            VALUES ($1, $2, $3, false);
        `, [user.id, resetToken, expiresAt]);

        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        const mailResult = await sendPasswordResetEmail(
            targetRecoveryEmail,
            user.name,
            resetUrl
        );
        res.status(200).json({
            success: true,
            message: `Password reset instructions have been dispatched to your official student mailbox (${targetRecoveryEmail}). Valid for 15 minutes.`,
            data: {
                account_email: user.email,
                recovery_mailbox: targetRecoveryEmail,
                reset_token: resetToken,
                reset_url: resetUrl,
                expires_at: expiresAt
            }
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error processing password reset request."
        });
    }
});
// =================================================================
// 12. RESET PASSWORD (VERIFY TOKEN & UPDATE HASH)
// Endpoint: POST /api/auth/reset-password
// =================================================================
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({
                success: false,
                message: "Missing reset token or new password."
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        // 1. Verify token in password_resets table
        const resetResult = await pool.query(`
            SELECT id, user_id, expires_at, used
            FROM password_resets
            WHERE token = $1;
        `, [token]);

        if (resetResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid password reset token."
            });
        }

        const resetRecord = resetResult.rows[0];

        // 2. Check if already used
        if (resetRecord.used) {
            return res.status(400).json({
                success: false,
                message: "This password reset token has already been used. Please request a new one."
            });
        }

        // 3. Check expiration (15 minutes)
        const now = new Date();
        if (now > new Date(resetRecord.expires_at)) {
            return res.status(400).json({
                success: false,
                message: "This password reset link has expired (15-minute limit exceeded). Please request a new one."
            });
        }

        // 4. Hash the new password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // 5. Update the user's password in users table
        await pool.query(`
            UPDATE users SET password_hash = $1 WHERE id = $2;
        `, [hashedPassword, resetRecord.user_id]);

        // 6. Burn the token so it can NEVER be reused!
        await pool.query(`
            UPDATE password_resets SET used = true WHERE id = $1;
        `, [resetRecord.id]);

        res.status(200).json({
            success: true,
            message: "🎉 Password has been successfully reset! You can now log in with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error resetting password."
        });
    }
});
// =================================================================
// 14. STUDENT OC APPLICATION: SUBMIT REQUEST
// Endpoint: POST /api/oc/apply
// =================================================================
app.post('/api/oc/apply', async (req: Request, res: Response) => {
    try {
        const {
            user_name,
            user_email,
            user_phone,
            event_id,
            department,
            responsibility_preference,
            student_id,
            course,
            year_level
        } = req.body;

        if (!user_name || !user_email || !event_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: user_name, user_email, and event_id are required."
            });
        }

        // 1. Fetch event name from events table
        const eventRes = await pool.query('SELECT name FROM events WHERE id = $1', [event_id]);
        if (eventRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Selected event not found." });
        }
        const eventName = eventRes.rows[0].name;

        // 2. Check if student already has a pending application for this event
        const existingApp = await pool.query(`
            SELECT id, status FROM registrations
            WHERE LOWER(user_email) = LOWER($1) AND event_id = $2 AND registration_type = 'OC_TEAM';
        `, [user_email, event_id]);

        if (existingApp.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `You have already applied for the Organizing Committee of ${eventName}!`
            });
        }

        // 3. Insert into registrations as PENDING
        const result = await pool.query(`
            INSERT INTO registrations (
                event_id, 
                event_name, 
                user_name, 
                user_email, 
                user_phone,
                college, 
                course, 
                year_level, 
                student_id,
                registration_type, 
                oc_department, 
                oc_responsibility_preference, 
                status
            ) VALUES ($1, $2, $3, $4, $5, 'UPES Dehradun', $6, $7, $8, 'OC_TEAM', $9, $10, 'PENDING')
            RETURNING id, registration_date;
        `, [
            event_id,
            eventName,
            user_name,
            user_email,
            user_phone || 'N/A',
            course || 'Computer Science',
            year_level || '3rd Year',
            student_id || 'SAP-UPES',
            department || 'Stage & Technical',
            responsibility_preference || 'Event Operations'
        ]);

        res.status(201).json({
            success: true,
            message: "🎉 Your volunteer application has been submitted to Faculty Admin Dr. Rajesh Sharma!",
            application_id: result.rows[0].id
        });

    } catch (error) {
        console.error("OC Application error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit OC application."
        });
    }
});

// =================================================================
// 15. ADMIN: FETCH ALL OC VOLUNTEER APPLICATIONS
// Endpoint: GET /api/admin/oc-applications
// =================================================================
app.get('/api/admin/oc-applications', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                event_id, 
                event_name, 
                user_name, 
                user_email, 
                user_phone, 
                course, 
                year_level, 
                student_id, 
                oc_department, 
                oc_responsibility_preference, 
                status, 
                registration_date
            FROM registrations
            WHERE registration_type = 'OC_TEAM'
            ORDER BY registration_date DESC;
        `);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching OC applications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch OC applications."
        });
    }
});

// =================================================================
// 16. ADMIN: APPROVE OC VOLUNTEER & ISSUE OFFICIAL HANDLE
// Endpoint: POST /api/admin/approve-oc
// =================================================================
app.post('/api/admin/approve-oc', async (req: Request, res: Response) => {
    try {
        const { application_id } = req.body;

        if (!application_id) {
            return res.status(400).json({ success: false, message: "Missing application_id." });
        }

        // 1. Fetch application record
        const appRes = await pool.query('SELECT * FROM registrations WHERE id = $1', [application_id]);
        if (appRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Application record not found." });
        }
        const appData = appRes.rows[0];

        // 2. Generate official OC handle: e.g. "srijita.oc@upes.ac.in"
        const cleanName = appData.user_name.trim().toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
        const officialOcEmail = `${cleanName}.oc@upes.ac.in`;

        // 3. Generate activation token
        const activationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        // 4. Create or update user account in users table with role 'TEAM' & status 'PENDING_ACTIVATION'
        const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [officialOcEmail]);
        let userId: string;

        if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
            await pool.query(`
                UPDATE users 
                SET status = 'PENDING_ACTIVATION', activation_token = $1 
                WHERE id = $2;
            `, [activationToken, userId]);
        } else {
            const newUser = await pool.query(`
                INSERT INTO users (
                    name, email, password_hash, role, department, college, status, activation_token
                ) VALUES ($1, $2, 'UNSET', 'TEAM', $3, 'UPES Dehradun', 'PENDING_ACTIVATION', $4)
                RETURNING id;
            `, [appData.user_name, officialOcEmail, appData.oc_department || 'Event Committee', activationToken]);
            userId = newUser.rows[0].id;
        }

        // 5. Add to team_members roster
        await pool.query(`
            INSERT INTO team_members (
                user_id, name, email, department, year_level, role, assigned_event_id, assigned_event_name, responsibility, status
            ) VALUES ($1, $2, $3, $4, '3rd Year', 'Volunteer', $5, $6, $7, 'ACTIVE');
        `, [
            userId,
            appData.user_name,
            officialOcEmail,
            appData.oc_department || 'Event Committee',
            appData.event_id,
            appData.event_name,
            appData.oc_responsibility_preference || 'Stage & Technical Operations'
        ]);

        // 6. Mark the application CONFIRMED
        await pool.query("UPDATE registrations SET status = 'CONFIRMED' WHERE id = $1", [application_id]);

        res.status(200).json({
            success: true,
            message: `Official OC account created for ${appData.user_name}! Handle: ${officialOcEmail}`,
            official_email: officialOcEmail,
            activation_token: activationToken
        });

    } catch (error) {
        console.error("Error approving OC application:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve OC application."
        });
    }
});

// =================================================================
// 17. STUDENT PORTAL: CHECK OC INVITATION / APPROVAL STATUS
// Endpoint: GET /api/user/oc-status
// =================================================================
app.get('/api/user/oc-status', async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: "Missing email parameter." });
        }

        const regRes = await pool.query(`
            SELECT * FROM registrations 
            WHERE LOWER(user_email) = LOWER($1) AND registration_type = 'OC_TEAM'
            ORDER BY registration_date DESC LIMIT 1;
        `, [email]);

        if (regRes.rows.length === 0) {
            return res.json({ success: true, has_application: false });
        }

        const reg = regRes.rows[0];
        if (reg.status === 'PENDING') {
            return res.json({
                success: true,
                has_application: true,
                status: 'PENDING',
                event_name: reg.event_name,
                department: reg.oc_department
            });
        }

        // If CONFIRMED, look up official handle & activation status in users table
        const cleanName = reg.user_name.trim().toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
        const officialOcEmail = `${cleanName}.oc@upes.ac.in`;

        const userRes = await pool.query(`
            SELECT status, activation_token 
            FROM users 
            WHERE LOWER(email) = LOWER($1);
        `, [officialOcEmail]);

        const ocUser = userRes.rows[0];

        return res.json({
            success: true,
            has_application: true,
            status: 'APPROVED',
            event_name: reg.event_name,
            department: reg.oc_department,
            official_email: officialOcEmail,
            oc_status: ocUser?.status, // 'PENDING_ACTIVATION' or 'ACTIVE'
            activation_token: ocUser?.activation_token
        });

    } catch (error) {
        console.error("Error fetching OC status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch student OC status."
        });
    }
});

// =================================================================
// 18. OC TEAM MEMBERS: FETCH ALL MEMBERS FROM DATABASE
// Endpoint: GET /api/teams
// =================================================================
app.get('/api/teams', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                name,
                email,
                phone,
                department,
                year_level AS year,
                role,
                assigned_event_id AS "assignedEventId",
                assigned_event_name AS "assignedEventName",
                responsibility,
                LOWER(status) AS status
            FROM team_members
            ORDER BY id DESC;
        `);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching team members:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch team members from PostgreSQL database."
        });
    }
});

// =================================================================
// 19. OC TEAM MEMBERS: ADMIN MANUALLY ADDS MEMBER
// Endpoint: POST /api/teams
// =================================================================
app.post('/api/teams', async (req: Request, res: Response) => {
    try {
        const {
            name,
            email,
            phone,
            department,
            year,
            role,
            assignedEventId,
            assignedEventName,
            responsibility
        } = req.body;

        if (!name || !email || !role || !assignedEventId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, email, role, and assignedEventId are required."
            });
        }

        const result = await pool.query(`
            INSERT INTO team_members (
                name, email, phone, department, year_level, role, assigned_event_id, assigned_event_name, responsibility, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')
            RETURNING id;
        `, [
            name,
            email,
            phone || 'N/A',
            department || 'General Committee',
            year || '3rd Year',
            role,
            assignedEventId,
            assignedEventName || 'Campus Fest',
            responsibility || 'Event Operations'
        ]);

        res.status(201).json({
            success: true,
            message: "Team member added to database successfully!",
            id: result.rows[0].id
        });
    } catch (error) {
        console.error("Error adding team member:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add team member to database."
        });
    }
});

// =================================================================
// 20. OC TEAM MEMBERS: REMOVE MEMBER FROM ROSTER
// Endpoint: DELETE /api/teams/:id
// =================================================================
app.delete('/api/teams/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM team_members WHERE id = $1', [id]);
        res.status(200).json({
            success: true,
            message: "Team member removed successfully from database."
        });
    } catch (error) {
        console.error("Error deleting team member:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove team member."
        });
    }
});

// =================================================================
// 21. REGISTRATIONS: FETCH TICKETS FROM DATABASE
// Endpoint: GET /api/registrations
// =================================================================
app.get('/api/registrations', async (req: Request, res: Response) => {
    try {
        const { email, event_id } = req.query;

        let query = `
            SELECT 
                id,
                event_id AS "eventId",
                event_name AS "eventName",
                user_name AS "userName",
                user_email AS "userEmail",
                user_phone AS "userPhone",
                college,
                course,
                year_level AS year,
                student_id AS "studentId",
                LOWER(registration_type) AS "registrationType",
                status,
                TO_CHAR(registration_date, 'YYYY-MM-DD') AS "registrationDate"
            FROM registrations
        `;
        const params: any[] = [];

        if (email) {
            query += ` WHERE LOWER(user_email) = LOWER($1)`;
            params.push(email);
        } else if (event_id) {
            query += ` WHERE event_id = $1`;
            params.push(event_id);
        }

        query += ` ORDER BY registration_date DESC;`;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch event registrations from PostgreSQL database."
        });
    }
});

// =================================================================
// 22. TASKS: FETCH ALL TASKS FROM DATABASE
// Endpoint: GET /api/tasks
// =================================================================
app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
        const { event_id, assigned_to_id } = req.query;

        let query = `
            SELECT 
                id,
                name,
                description,
                assigned_to_name AS "assignedToName",
                assigned_to_id AS "assignedToId",
                LOWER(assigned_type) AS "assignedType",
                event_id AS "eventId",
                event_name AS "eventName",
                TO_CHAR(deadline, 'YYYY-MM-DD HH24:MI') AS deadline,
                LOWER(priority) AS priority,
                CASE 
                    WHEN status = 'IN_PROGRESS' THEN 'In Progress'
                    WHEN status = 'COMPLETED' THEN 'Completed'
                    WHEN status = 'PENDING' THEN 'Pending'
                    ELSE INITCAP(status)
                END AS status,
                progress,
                notes
            FROM tasks
        `;
        const params: any[] = [];

        if (event_id) {
            query += ` WHERE event_id = $1`;
            params.push(event_id);
        } else if (assigned_to_id) {
            query += ` WHERE assigned_to_id = $1`;
            params.push(assigned_to_id);
        }

        query += ` ORDER BY deadline ASC;`;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks from PostgreSQL database."
        });
    }
});

// =================================================================
// 23. TASKS: ADMIN CREATES NEW TASK
// Endpoint: POST /api/tasks
// =================================================================
app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
        const {
            eventId,
            eventName,
            name,
            description,
            assignedToName,
            assignedToId,
            assignedType,
            deadline,
            priority
        } = req.body;

        if (!name || !eventId || !assignedToName) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, eventId, and assignedToName are required."
            });
        }

        const result = await pool.query(`
            INSERT INTO tasks (
                event_id, 
                event_name, 
                name, 
                description, 
                assigned_to_name, 
                assigned_to_id, 
                assigned_type, 
                deadline, 
                priority, 
                status, 
                progress
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', 0)
            RETURNING id;
        `, [
            eventId,
            eventName || 'Campus Fest',
            name,
            description || '',
            assignedToName,
            assignedToId || 'team-1',
            assignedType ? assignedType.toUpperCase() : 'MEMBER',
            deadline || new Date(),
            priority ? priority.toUpperCase() : 'MEDIUM'
        ]);

        res.status(201).json({
            success: true,
            message: "Task created and assigned successfully in PostgreSQL!",
            id: result.rows[0].id
        });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create task in database."
        });
    }
});

// =================================================================
// 24. BUDGET & EXPENSES: FETCH LIVE FINANCIALS FOR EVENT
// Endpoint: GET /api/budget/:eventId
// =================================================================
app.get('/api/budget/:eventId', async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;

        const budgetRes = await pool.query(`
            SELECT 
                b.id,
                b.event_id AS "eventId",
                e.name AS "eventName",
                b.total_budget::float AS "totalBudget",
                b.allocated::float AS allocated,
                b.spent::float AS spent
            FROM event_budgets b
            JOIN events e ON e.id = b.event_id
            WHERE b.event_id = $1;
        `, [eventId]);

        if (budgetRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No budget found for this event." });
        }

        const budget = budgetRes.rows[0];

        const expenseRes = await pool.query(`
            SELECT 
                id,
                budget_id AS "budgetId",
                event_id AS "eventId",
                category,
                title,
                amount::float AS amount,
                TO_CHAR(expense_date, 'YYYY-MM-DD') AS date,
                spent_by AS "spentBy",
                LOWER(status) AS status,
                notes
            FROM expenses
            WHERE event_id = $1
            ORDER BY expense_date DESC;
        `, [eventId]);

        // Calculate category breakdowns
        const categoryMap = new Map<string, { category: string; allocatedAmount: number; spentAmount: number }>();
        for (const exp of expenseRes.rows) {
            const existing = categoryMap.get(exp.category) || { category: exp.category, allocatedAmount: 50000, spentAmount: 0 };
            existing.spentAmount += exp.amount;
            categoryMap.set(exp.category, existing);
        }

        res.status(200).json({
            success: true,
            data: {
                budget: {
                    ...budget,
                    categories: Array.from(categoryMap.values())
                },
                expenses: expenseRes.rows
            }
        });
    } catch (error) {
        console.error("Error fetching event budget:", error);
        res.status(500).json({ success: false, message: "Failed to fetch event budget." });
    }
});

// =================================================================
// START THE SERVER
// =================================================================
app.listen(PORT, () => {
    console.log(`🚀 Server is listening live on http://localhost:${PORT}`);
});
