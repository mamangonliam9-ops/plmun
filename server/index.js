import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(rootDir, 'data')

fs.mkdirSync(dataDir, { recursive: true })

const databasePath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(dataDir, 'plmun.db')

const db = new Database(databasePath)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    student_number TEXT NOT NULL UNIQUE,
    program TEXT,
    year_level TEXT,
    campus TEXT,
    phone TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS concerns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    updated TEXT NOT NULL,
    description TEXT NOT NULL,
    attachment TEXT,
    student_email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`)

const demoConcerns = [
  { code: 'CN-2026-001284', title: 'Student portal keeps logging me out', category: 'Technical', status: 'In Progress', updated: 'Today, 9:15 AM', description: 'The student portal signs me out after a few minutes, even while I am actively using it.', student_email: 'student1@plmun.edu.ph' },
  { code: 'CN-2026-001276', title: 'Scholarship disbursement follow-up', category: 'Financial', status: 'Under Review', updated: 'Yesterday, 2:40 PM', description: 'I would like to follow up on the scholarship disbursement reflected in my student account.', student_email: 'student2@plmun.edu.ph' },
  { code: 'CN-2026-001241', title: 'Air conditioning in room 304', category: 'Facilities', status: 'Resolved', updated: 'Oct 24, 4:20 PM', description: 'The air conditioning unit in room 304 was not cooling the room.', student_email: 'student3@plmun.edu.ph' },
  { code: 'CN-2026-001310', title: 'Refund for lab fee duplicate payment', category: 'Financial', status: 'Submitted', updated: 'Today, 7:40 AM', description: 'I paid the same lab fee twice due to a duplicate payment prompt during enrollment.', student_email: 'student4@plmun.edu.ph' },
  { code: 'CN-2026-001305', title: 'Class schedule conflict with elective', category: 'Academic', status: 'Under Review', updated: 'Yesterday, 8:10 AM', description: 'My requested elective overlaps with my major subject schedule, and I need assistance adjusting it.', student_email: 'student5@plmun.edu.ph' },
  { code: 'CN-2026-001298', title: 'Broken projector in lecture room 21', category: 'Facilities', status: 'In Progress', updated: 'Nov 3, 1:20 PM', description: 'The projector in room 21 has a flickering display and makes it hard to view presentation slides.', student_email: 'student6@plmun.edu.ph' },
  { code: 'CN-2026-001292', title: 'Error in academic records update', category: 'Registrar', status: 'Under Review', updated: 'Nov 2, 9:45 AM', description: 'My student record is still showing the old section assignment despite my request for revision.', student_email: 'student7@plmun.edu.ph' },
  { code: 'CN-2026-001287', title: 'Wi-Fi access issues in library basement', category: 'Technical', status: 'Resolved', updated: 'Oct 30, 5:10 PM', description: 'The Wi-Fi signal weakens significantly in the basement area of the library and disconnects often.', student_email: 'student8@plmun.edu.ph' },
  { code: 'CN-2026-001279', title: 'Safety concern at parking area gate', category: 'Student life', status: 'Submitted', updated: 'Oct 28, 12:15 PM', description: 'The parking gate area is not properly lit at night and creates a safety concern for students.', student_email: 'student9@plmun.edu.ph' },
  { code: 'CN-2026-001268', title: 'Request for transcript issuance delay', category: 'Registrar', status: 'In Progress', updated: 'Oct 27, 10:05 AM', description: 'I submitted my transcript request more than two weeks ago and still have not received an update.', student_email: 'student10@plmun.edu.ph' },
  { code: 'CN-2026-001259', title: 'Cafeteria food quality complaint', category: 'Student life', status: 'Under Review', updated: 'Oct 25, 2:50 PM', description: 'The cafeteria menu has inconsistent quality and students are concerned about food safety and freshness.', student_email: 'student11@plmun.edu.ph' },
  { code: 'CN-2026-001245', title: 'Broken sink in dormitory room 201', category: 'Facilities', status: 'Resolved', updated: 'Oct 22, 4:35 PM', description: 'The sink in room 201 was leaking and has already been fixed, but I would like confirmation.', student_email: 'student12@plmun.edu.ph' },
  { code: 'CN-2026-001236', title: 'Issue with online enrollment confirmation', category: 'Technical', status: 'Submitted', updated: 'Oct 21, 11:20 AM', description: 'After enrolling, the confirmation page does not appear and the system shows no transaction record.', student_email: 'student13@plmun.edu.ph' },
  { code: 'CN-2026-001226', title: 'Need to update my emergency contact', category: 'Registrar', status: 'Resolved', updated: 'Oct 18, 9:00 AM', description: 'My emergency contact information was updated but the system still shows the old record.', student_email: 'student14@plmun.edu.ph' },
  { code: 'CN-2026-001219', title: 'Scholarship application status inquiry', category: 'Financial', status: 'Under Review', updated: 'Oct 17, 3:25 PM', description: 'I want to clarify whether my scholarship application has been evaluated and when I can expect the result.', student_email: 'student15@plmun.edu.ph' },
  { code: 'CN-2026-001214', title: 'Unstable elevator in main building', category: 'Facilities', status: 'In Progress', updated: 'Oct 15, 8:30 AM', description: 'The elevator repeatedly stops between floors and causes delays for students during class hours.', student_email: 'student16@plmun.edu.ph' },
  { code: 'CN-2026-001205', title: 'Request for extension due to medical leave', category: 'Academic', status: 'Under Review', updated: 'Oct 12, 11:40 AM', description: 'I have a medical certification and would like to request an extension for my class assignment.', student_email: 'student17@plmun.edu.ph' },
  { code: 'CN-2026-001197', title: 'Lost library book not recorded in account', category: 'Student life', status: 'Resolved', updated: 'Oct 10, 1:50 PM', description: 'I returned a library book earlier this month but my account still reflects an outstanding penalty.', student_email: 'student18@plmun.edu.ph' },
  { code: 'CN-2026-001184', title: 'Need earlier course advising schedule', category: 'Academic', status: 'Submitted', updated: 'Oct 9, 2:25 PM', description: 'I would like to request an earlier advising schedule before the next semester enrollment period.', student_email: 'student19@plmun.edu.ph' },
  { code: 'CN-2026-001171', title: 'Printer malfunction in computer lab 3', category: 'Technical', status: 'In Progress', updated: 'Oct 7, 6:05 PM', description: 'The printer in the computer lab is repeatedly jamming and is not processing print jobs correctly.', student_email: 'student20@plmun.edu.ph' },
]

const passwordSalt = process.env.PASSWORD_SALT || 'plmun-ai-student-voice'

const existingConcernCount = db.prepare('SELECT COUNT(*) AS count FROM concerns').get().count
if (existingConcernCount === 0) {
  const insertConcern = db.prepare(
    'INSERT INTO concerns (code, title, category, status, updated, description, attachment, student_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const insertMany = db.transaction((rows) => {
    rows.forEach((row) => insertConcern.run(row.code, row.title, row.category, row.status, row.updated, row.description, null, row.student_email))
  })
  insertMany(demoConcerns)
}

const userColumns = db.prepare("PRAGMA table_info(users)").all()
const hasRoleColumn = userColumns.some((column) => column.name === 'role')
if (!hasRoleColumn) {
  db.exec('ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT \"student\"')
}

const existingUserCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count
if (existingUserCount === 0) {
  const demoUser = {
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@plmun.edu.ph',
    password: 'password',
    role: 'student',
    studentNumber: '2023-10482',
    program: 'BS Information Technology',
    yearLevel: '3rd year',
    campus: 'Main Campus',
    phone: '+63 917 555 0182',
  }

  const userId = db.prepare(
    'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(demoUser.firstName, demoUser.lastName, demoUser.email, hashPassword(demoUser.password), demoUser.role).lastInsertRowid

  db.prepare(
    'INSERT INTO students (user_id, student_number, program, year_level, campus, phone) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, demoUser.studentNumber, demoUser.program, demoUser.yearLevel, demoUser.campus, demoUser.phone)
}

const defaultStaffUsers = [
  { firstName: 'Maria', lastName: 'Santos', email: 'staff@plmun.edu.ph', password: 'staff123', role: 'staff' },
  { firstName: 'Ricardo', lastName: 'Dela Cruz', email: 'admin@plmun.edu.ph', password: 'admin123', role: 'admin' },
]

for (const staffUser of defaultStaffUsers) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(staffUser.email)
  if (!existing) {
    const userId = db.prepare(
      'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(staffUser.firstName, staffUser.lastName, staffUser.email, hashPassword(staffUser.password), staffUser.role).lastInsertRowid

    if (staffUser.role === 'staff') {
      db.prepare(
        'INSERT INTO students (user_id, student_number, program, year_level, campus, phone) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(userId, '2024-STAFF01', 'Office of Student Services', 'Staff', 'Main Campus', '+63 917 000 0001')
    } else {
      db.prepare(
        'INSERT INTO students (user_id, student_number, program, year_level, campus, phone) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(userId, '2024-ADMIN01', 'Administration Office', 'Admin', 'Main Campus', '+63 917 000 0002')
    }
  }
}

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, passwordSalt, 100000, 64, 'sha512').toString('hex')
}

function formatUser(user) {
  if (!user) return null
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role || 'student',
  }
}

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '5mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'PLMUN student voice API is running.' })
})

app.get('/api/users', (_req, res) => {
  const users = db.prepare('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY id DESC').all()
  res.json(users)
})

app.get('/api/concerns', (_req, res) => {
  const concerns = db.prepare(
    'SELECT code, title, category, status, updated, description, attachment, student_email FROM concerns ORDER BY id DESC'
  ).all()

  res.json(concerns)
})

app.patch('/api/concerns/:code', (req, res) => {
  const { code } = req.params
  const { status, updated } = req.body || {}
  const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved']

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'A valid status is required.' })
  }

  const hasCode = db.prepare('SELECT id FROM concerns WHERE code = ?').get(code)
  if (!hasCode) {
    return res.status(404).json({ error: 'Concern not found.' })
  }

  const nextUpdated = typeof updated === 'string' && updated.trim() ? updated.trim() : 'Just now'
  const result = db.prepare('UPDATE concerns SET status = ?, updated = ? WHERE code = ?').run(status, nextUpdated, code)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Concern not found.' })
  }

  const concern = db.prepare(
    'SELECT code, title, category, status, updated, description, attachment, student_email FROM concerns WHERE code = ?'
  ).get(code)

  return res.json(concern)
})

app.post('/api/concerns', (req, res) => {
  const { title, category, status, updated, description, attachment } = req.body || {}

  if (!title || !category || !status || !description) {
    return res.status(400).json({ error: 'Title, category, status, and description are required.' })
  }

  const code = `CN-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(6, '0')}`
  const current = updated || 'Just now'

  const result = db.prepare(
    'INSERT INTO concerns (code, title, category, status, updated, description, attachment, student_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(code, String(title).trim(), String(category).trim(), String(status), current, String(description).trim(), attachment || null, 'demo@student.plmun.edu.ph')

  const concern = db.prepare('SELECT code, title, category, status, updated, description, attachment, student_email FROM concerns WHERE id = ?').get(result.lastInsertRowid)
  return res.status(201).json(concern)
})

app.post('/api/signup', (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    studentNumber,
    program,
    yearLevel,
    campus,
    phone,
  } = req.body || {}

  if (!firstName || !lastName || !password || !studentNumber) {
    return res.status(400).json({ error: 'Please complete all required fields.' })
  }

  const normalizedStudentNumber = String(studentNumber).trim()
  const generatedEmail = `${normalizedStudentNumber.toLowerCase()}@plmun.edu.ph`
  const normalizedEmail = String(email || generatedEmail).trim().toLowerCase()
  if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' })
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail)
  if (existingUser) {
    return res.status(409).json({ error: 'This email is already registered.' })
  }

  const existingStudent = db.prepare('SELECT id FROM students WHERE student_number = ?').get(String(studentNumber).trim())
  if (existingStudent) {
    return res.status(409).json({ error: 'This student number is already registered.' })
  }

  try {
    const insertUser = db.transaction(() => {
      const user = db.prepare(
        'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
      ).run(
        String(firstName).trim(),
        String(lastName).trim(),
        normalizedEmail,
        hashPassword(String(password)),
        'student'
      )

      db.prepare(
        'INSERT INTO students (user_id, student_number, program, year_level, campus, phone) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(
        user.lastInsertRowid,
        String(studentNumber).trim(),
        String(program || '').trim(),
        String(yearLevel || '').trim(),
        String(campus || '').trim(),
        String(phone || '').trim()
      )

      return user.lastInsertRowid
    })()

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(insertUser)
    const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(insertUser)

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role || 'student',
        studentNumber: student?.student_number,
        program: student?.program,
        yearLevel: student?.year_level,
        campus: student?.campus,
        phone: student?.phone,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Account could not be created.' })
  }
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const expectedHash = hashPassword(String(password))
  if (user.password_hash !== expectedHash) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id)
  return res.json({
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role || 'student',
      studentNumber: student?.student_number,
      program: student?.program,
      yearLevel: student?.year_level,
      campus: student?.campus,
      phone: student?.phone,
    },
  })
})

const distPath = path.join(rootDir, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

const port = Number(process.env.PORT || 3005)
app.listen(port, '0.0.0.0', () => {
  console.log(`PLMUN API server running on http://localhost:${port}`)
})
