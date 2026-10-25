-- =================================================================
-- SMART COLLEGE EVENT MANAGEMENT SYSTEM - DATABASE SEED DATA
-- Version: 1.0
-- =================================================================

-- 1. Insert Core Users
INSERT INTO users (id, name, email, password_hash, role, phone, department, college) VALUES
('user-admin-1', 'Dr. Rajesh Sharma', 'Rajesh.Admin@stu.upes.ac.in', 'Admin@12345678', 'ADMIN', '+91 98765 43210', 'Event Operations & Student Affairs', 'UPES Dehradun'),
('user-team-1', 'Priya Patel', 'priya.oc@stu.upes.ac.in', 'OCMemeber@12345678', 'TEAM', '+91 97654 32109', 'Computer Science (3rd Year)', 'UPES Dehradun'),
('user-team-2', 'Aarav Verma', 'aarav.oc@stu.upes.ac.in', 'OCMemeber@12345678', 'TEAM', '+91 98123 45678', 'Electronics & Sound (4th Year)', 'UPES Dehradun'),
('user-student-1', 'Rohan Mehta', 'rohan.mehta@stu.upes.ac.in', 'Student@12345678', 'USER', '+91 99887 76655', 'B.Tech CSE - Data Science', 'UPES Dehradun');

-- 2. Insert Events
INSERT INTO events (id, name, description, event_date, start_time, end_time, venue, registration_deadline, capacity, registration_count, status, category, budget, budget_used, organizer) VALUES
('evt-101', 'TechFest UPES 2026', 'The annual flagship technology festival featuring hackathons, robotics competitions, AI keynotes, and project exhibitions.', '2026-10-20', '09:00 AM', '06:00 PM', 'Main MAC Auditorium & APG Block', '2026-10-15', 500, 427, 'UPCOMING', 'Technology', 200000.00, 144000.00, 'School of Computer Science & OC'),
('evt-102', 'Urja Cultural Gala 2026', 'A vibrant celebration of music, dance, theatrical performances, and celebrity band performances.', '2026-11-05', '05:00 PM', '10:00 PM', 'Open Air Amphitheatre', '2026-11-01', 1200, 890, 'UPCOMING', 'Cultural', 350000.00, 195000.00, 'Cultural Board'),
('evt-103', 'AI & Future Tech Hackathon', 'A 24-hour intensive hackathon focused on Generative AI solutions for smart campus operations.', '2026-09-28', '10:00 AM', '10:00 AM', 'R&D Innovation Lab - Block 3', '2026-09-25', 150, 150, 'ONGOING', 'Hackathon', 75000.00, 62000.00, 'ACM Student Chapter'),
('evt-104', 'Spandan Sports Meet', 'Track and field events, football, basketball, and badminton tournaments across colleges.', '2026-08-14', '08:00 AM', '05:00 PM', 'Sports Complex & Football Field', '2026-08-10', 800, 760, 'COMPLETED', 'Sports', 15000.00, 14850.00, 'Sports Council');

-- 3. Insert Registrations
INSERT INTO registrations (id, event_id, event_name, user_name, user_email, user_phone, college, course, year_level, student_id, registration_type, oc_department, status) VALUES
('reg-501', 'evt-101', 'TechFest UPES 2026', 'Rohan Mehta', 'rohan.mehta@stu.upes.ac.in', '+91 99887 76655', 'UPES Dehradun', 'B.Tech CSE', '3rd Year', 'SAP-50009123', 'PARTICIPANT', NULL, 'CONFIRMED'),
('reg-502', 'evt-101', 'TechFest UPES 2026', 'Ananya Sharma', 'ananya.s@stu.upes.ac.in', '+91 98765 12345', 'UPES Dehradun', 'B.Tech AI & ML', '2nd Year', 'SAP-50009456', 'PARTICIPANT', NULL, 'CONFIRMED'),
('reg-503', 'evt-101', 'TechFest UPES 2026', 'Priya Patel', 'priya.oc@stu.upes.ac.in', '+91 97654 32109', 'UPES Dehradun', 'Computer Science', '3rd Year', 'SAP-50008800', 'OC_TEAM', 'Stage & Technical OC', 'CONFIRMED');

-- 4. Insert Team Members
INSERT INTO team_members (id, user_id, name, email, phone, department, year_level, role, assigned_event_id, assigned_event_name, responsibility, status) VALUES
('team-201', 'user-team-1', 'Priya Patel', 'priya.oc@stu.upes.ac.in', '+91 97654 32109', 'Computer Science', '3rd Year', 'Lead', 'evt-101', 'TechFest UPES 2026', 'Overall Event Operations & Stage Setup', 'ACTIVE'),
('team-202', 'user-team-2', 'Aarav Verma', 'aarav.oc@stu.upes.ac.in', '+91 98123 45678', 'Electronics & Sound', '4th Year', 'Lead', 'evt-101', 'TechFest UPES 2026', 'Sound & JBL Line Array Setup', 'ACTIVE');

-- 5. Insert Tasks
INSERT INTO tasks (id, event_id, event_name, name, description, assigned_to_name, assigned_to_id, assigned_type, deadline, priority, status, progress, notes) VALUES
('tsk-401', 'evt-101', 'TechFest UPES 2026', 'Main Stage JBL Sound & LED Rigging', 'Mount 12-box line array speakers and configure 20x10ft P3 outdoor LED screen in MAC auditorium.', 'Sound & Audio OC Team (Aarav Verma)', 'user-team-2', 'MEMBER', '2026-10-19 18:00:00+05:30', 'HIGH', 'IN_PROGRESS', 75, 'Sound check scheduled for 7:00 PM on 19th Oct.'),
('tsk-402', 'evt-101', 'TechFest UPES 2026', 'Printed Flex Backdrops & ID Badges Delivery', 'Deliver 500 participant lanyards, 50 OC badges, and 4 high-res vinyl flex banners.', 'Printing & Graphics OC Team', 'team-201', 'MEMBER', '2026-10-16 12:00:00+05:30', 'MEDIUM', 'COMPLETED', 100, 'Delivered and verified by OC Lead Priya Patel.');

-- 6. Insert Event Budgets & Expenses
INSERT INTO event_budgets (id, event_id, total_budget, allocated, spent) VALUES
('bgt-101', 'evt-101', 200000.00, 180000.00, 144000.00),
('bgt-104', 'evt-104', 15000.00, 15000.00, 14850.00);

INSERT INTO expenses (id, budget_id, event_id, category, title, amount, expense_date, spent_by, status, notes) VALUES
('exp-601', 'bgt-101', 'evt-101', 'Sound', 'Advance payment to Sound OC Team for equipment', 45000.00, '2026-09-15', 'Dr. Rajesh Sharma', 'PAID', '50% advance per signed agreement'),
('exp-602', 'bgt-101', 'evt-101', 'Printing', 'Flex banners and participant ID badges', 18000.00, '2026-09-17', 'Vikramaditya Singh', 'PAID', 'Receipt uploaded');

-- 7. Insert Submissions
INSERT INTO submissions (id, task_id, task_name, event_id, event_name, submitted_by_id, submitted_by_name, description, type, image_url, status, feedback) VALUES
('sub-701', 'tsk-401', 'Main Stage JBL Sound & LED Rigging', 'evt-101', 'TechFest UPES 2026', 'user-team-2', 'Aarav Verma (Sound OC Lead)', 'Completed truss rigging and mounted LED panels with OC team volunteers. Sound test passed.', 'IMAGE', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600', 'UNDER_REVIEW', 'Pending final noise level clearance from venue director.');
