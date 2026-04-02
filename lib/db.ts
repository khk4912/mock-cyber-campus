import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export type UserRole = '학생' | '교수'

export type MockUser = {
  id: number
  username: string
  displayName: string
  role: UserRole
}

export type LectureMeeting = {
  dayOfWeek: number
  startPeriod: number
  endPeriod: number
}

export type UserLecture = {
  id: number
  code: string
  title: string
  instructorUserId: number
  instructorName: string
  room: string | null
  semester: string
  credits: number
  meetings: LectureMeeting[]
  meetingLabel: string
}

export type LectureInfo = UserLecture & {
  description: string | null
  instructorUsername: string
  createdAt: string
  updatedAt: string
}

export type Assignment = {
  id: number
  lectureId: number
  title: string
  description: string | null
  dueAt: string
  createdAt: string
  updatedAt: string
}

type UserRow = {
  id: number
  username: string
  display_name: string
  role: UserRole
}

type LectureRow = {
  id: number
  code: string
  title: string
  instructor_user_id: number
  instructor_name: string
  room: string | null
  semester: string
  credits: number
  day_of_week: number | null
  start_period: number | null
  end_period: number | null
}

type LectureInfoRow = LectureRow & {
  description: string | null
  instructor_username: string
  created_at: string
  updated_at: string
}

type AssignmentRow = {
  id: number
  lecture_id: number
  title: string
  description: string | null
  due_at: string
  created_at: string
  updated_at: string
}

type GlobalWithDb = typeof globalThis & {
  __mockCampusDb?: DatabaseSync
}

const DATABASE_PATH = path.join(process.cwd(), 'data', 'mock-cyber-campus.sqlite')
const SCHEMA_PATH = path.join(process.cwd(), 'db', 'schema.sql')
const SEED_PATH = path.join(process.cwd(), 'db', 'seed.sql')
const DAY_OF_WEEK_LABELS = ['', '월', '화', '수', '목', '금', '토', '일']
const DB_SCHEMA_VERSION = 2
const USER_ROLES: UserRole[] = ['학생', '교수']

function mapUserRow (row: UserRow): MockUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
  }
}

function isUserRole (value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole)
}

function formatMeetingLabel (meetings: LectureMeeting[]) {
  return meetings.map((meeting) => {
    const dayLabel = DAY_OF_WEEK_LABELS[meeting.dayOfWeek] ?? '?'

    if (meeting.startPeriod === meeting.endPeriod) {
      return `${dayLabel} ${meeting.startPeriod}교시`
    }

    return `${dayLabel} ${meeting.startPeriod}-${meeting.endPeriod}교시`
  }).join(', ')
}

function initializeDatabase () {
  mkdirSync(path.dirname(DATABASE_PATH), { recursive: true })

  const db = new DatabaseSync(DATABASE_PATH)
  const schemaSql = readFileSync(SCHEMA_PATH, 'utf8')
  const seedSql = readFileSync(SEED_PATH, 'utf8')

  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
  `)

  db.exec('BEGIN IMMEDIATE')

  try {
    const versionRow = db.prepare('PRAGMA user_version').get() as { user_version: number }

    if (versionRow.user_version !== DB_SCHEMA_VERSION) {
      db.exec(`
        DROP TABLE IF EXISTS lecture_enrollments;
        DROP TABLE IF EXISTS assignments;
        DROP TABLE IF EXISTS lecture_meetings;
        DROP TABLE IF EXISTS lectures;
        DROP TABLE IF EXISTS class_periods;
        DROP TABLE IF EXISTS users;
      `)

      db.exec(schemaSql)
      db.exec(seedSql)
      db.exec(`PRAGMA user_version = ${DB_SCHEMA_VERSION}`)
    }

    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }

  return db
}

function getDatabase () {
  const globalWithDb = globalThis as GlobalWithDb

  if (!globalWithDb.__mockCampusDb) {
    globalWithDb.__mockCampusDb = initializeDatabase()
  }

  return globalWithDb.__mockCampusDb
}

const db = getDatabase()

export function listUsers () {
  const rows = db.prepare(`
    SELECT id, username, display_name, role
    FROM users
    ORDER BY id
  `).all() as UserRow[]

  return rows.map(mapUserRow)
}

export function getUserById (id: number) {
  const row = db.prepare(`
    SELECT id, username, display_name, role
    FROM users
    WHERE id = ?
  `).get(id) as UserRow | undefined

  return row ? mapUserRow(row) : null
}

export function addUser (input: {
  username: string
  displayName: string
  role: UserRole
}) {
  const username = input.username.trim()
  const displayName = input.displayName.trim()

  if (!username || !displayName) {
    throw new Error('username and displayName are required')
  }

  if (!isUserRole(input.role)) {
    throw new Error('invalid role')
  }

  db.prepare(`
    INSERT INTO users (username, display_name, role)
    VALUES (?, ?, ?)
  `).run(username, displayName, input.role)

  const row = db.prepare(`
    SELECT id, username, display_name, role
    FROM users
    WHERE username = ?
  `).get(username) as UserRow | undefined

  if (!row) {
    throw new Error('failed to create user')
  }

  return mapUserRow(row)
}

export function listCurrentTeachings (userID: number) {
  return listLecturesByQuery(`
    SELECT
      l.id,
      l.code,
      l.title,
      l.instructor_user_id,
      instructor.display_name AS instructor_name,
      l.room,
      l.semester,
      l.credits,
      lm.day_of_week,
      lm.start_period,
      lm.end_period
    FROM lectures AS l
    JOIN users AS instructor
      ON instructor.id = l.instructor_user_id
    LEFT JOIN lecture_meetings AS lm
      ON lm.lecture_id = l.id
    WHERE l.instructor_user_id = ?
    ORDER BY l.id, lm.day_of_week, lm.start_period
  `, userID)
}

export function listLecturesForUser (userId: number) {
  return listLecturesByQuery(`
    SELECT
      l.id,
      l.code,
      l.title,
      l.instructor_user_id,
      instructor.display_name AS instructor_name,
      l.room,
      l.semester,
      l.credits,
      lm.day_of_week,
      lm.start_period,
      lm.end_period
    FROM lecture_enrollments AS le
    JOIN lectures AS l
      ON l.id = le.lecture_id
    JOIN users AS instructor
      ON instructor.id = l.instructor_user_id
    LEFT JOIN lecture_meetings AS lm
      ON lm.lecture_id = l.id
    WHERE le.user_id = ?
    ORDER BY l.id, lm.day_of_week, lm.start_period
  `, userId)
}

function listLecturesByQuery (query: string, userId: number) {
  const rows = db.prepare(query).all(userId) as LectureRow[]

  const lectureMap = new Map<number, UserLecture>()

  for (const row of rows) {
    const existingLecture = lectureMap.get(row.id)

    if (!existingLecture) {
      lectureMap.set(row.id, {
        id: row.id,
        code: row.code,
        title: row.title,
        instructorUserId: row.instructor_user_id,
        instructorName: row.instructor_name,
        room: row.room,
        semester: row.semester,
        credits: row.credits,
        meetings: [],
        meetingLabel: '',
      })
    }

    if (
      row.day_of_week !== null &&
      row.start_period !== null &&
      row.end_period !== null
    ) {
      lectureMap.get(row.id)?.meetings.push({
        dayOfWeek: row.day_of_week,
        startPeriod: row.start_period,
        endPeriod: row.end_period,
      })
    }
  }

  return Array.from(lectureMap.values()).map((lecture) => ({
    ...lecture,
    meetingLabel: formatMeetingLabel(lecture.meetings),
  }))
}

export function getLectureInfo (lectureId: number) {
  const rows = db.prepare(`
    SELECT
      l.id,
      l.code,
      l.title,
      l.description,
      l.instructor_user_id,
      instructor.username AS instructor_username,
      instructor.display_name AS instructor_name,
      l.room,
      l.semester,
      l.credits,
      l.created_at,
      l.updated_at,
      lm.day_of_week,
      lm.start_period,
      lm.end_period
    FROM lectures AS l
    JOIN users AS instructor
      ON instructor.id = l.instructor_user_id
    LEFT JOIN lecture_meetings AS lm
      ON lm.lecture_id = l.id
    WHERE l.id = ?
    ORDER BY lm.day_of_week, lm.start_period
  `).all(lectureId) as LectureInfoRow[]

  const firstRow = rows[0]

  if (!firstRow) {
    return null
  }

  const meetings: LectureMeeting[] = []

  for (const row of rows) {
    if (
      row.day_of_week !== null &&
      row.start_period !== null &&
      row.end_period !== null
    ) {
      meetings.push({
        dayOfWeek: row.day_of_week,
        startPeriod: row.start_period,
        endPeriod: row.end_period,
      })
    }
  }

  return {
    id: firstRow.id,
    code: firstRow.code,
    title: firstRow.title,
    description: firstRow.description,
    instructorUserId: firstRow.instructor_user_id,
    instructorUsername: firstRow.instructor_username,
    instructorName: firstRow.instructor_name,
    room: firstRow.room,
    semester: firstRow.semester,
    credits: firstRow.credits,
    createdAt: firstRow.created_at,
    updatedAt: firstRow.updated_at,
    meetings,
    meetingLabel: formatMeetingLabel(meetings),
  }
}

export function getAssignments (lectureId: number) {
  const rows = db.prepare(`
    SELECT
      id,
      lecture_id,
      title,
      description,
      due_at,
      created_at,
      updated_at
    FROM assignments
    WHERE lecture_id = ?
    ORDER BY due_at ASC, id ASC
  `).all(lectureId) as AssignmentRow[]

  return rows.map((row) => ({
    id: row.id,
    lectureId: row.lecture_id,
    title: row.title,
    description: row.description,
    dueAt: row.due_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}
