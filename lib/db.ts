import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export type MockUser = {
  id: number
  username: string
  displayName: string
  role: string
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

type UserRow = {
  id: number
  username: string
  display_name: string
  role: string
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

type GlobalWithDb = typeof globalThis & {
  __mockCampusDb?: DatabaseSync
}

const DATABASE_PATH = path.join(process.cwd(), 'data', 'mock-cyber-campus.sqlite')
const SCHEMA_PATH = path.join(process.cwd(), 'db', 'schema.sql')
const SEED_PATH = path.join(process.cwd(), 'db', 'seed.sql')
const DAY_OF_WEEK_LABELS = ['', '월', '화', '수', '목', '금', '토', '일']
const DB_SCHEMA_VERSION = 2

function mapUserRow (row: UserRow): MockUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
  }
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
