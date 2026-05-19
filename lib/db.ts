import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export type UserRole = '학생' | '교수'

export type AlarmSettings = {
  assignmentReminders: boolean
  teamAlerts: boolean
  noticeAlerts: boolean
}

export type MockUser = {
  id: number
  userId: string
  username: string
  displayName: string
  role: UserRole
  studentId: string | null
  fcmToken: string | null
  alarmSettings: AlarmSettings
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
  instructorUserId: number | null
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
  linkUrl: string | null
}

export type AssignmentInfo = Assignment & {
  lectureTitle: string
  lectureCode: string
}

export type CourseSummary = {
  courseId: string
  courseName: string
  professor: string
  description: string | null
  room: string | null
  semester: string
  credits: number
}

export type LmsAssignmentSummary = {
  lmsAssignmentId: string
  courseId: string
  title: string
  description: string | null
  deadline: string
  linkUrl: string | null
}

export type LmsLectureSummary = {
  lmsLectureId: string
  courseId: string
  title: string
  content: string | null
  openedAt: string | null
  deadline: string | null
  linkUrl: string | null
}

export type LmsNoticeSummary = {
  noticeId: string
  courseId: string
  title: string
  content: string | null
  postedAt: string
  linkUrl: string | null
}

export type UserAssignmentStatus = {
  userAssignmentId: string
  userId: string
  lmsAssignmentId: string
  courseId: string
  courseName: string
  title: string
  deadline: string
  isCompleted: boolean
  customRemindTime: string | null
  remindInterval: number | null
}

export type UserLectureProgressSummary = {
  userLectureProgressId: string
  userId: string
  lmsLectureId: string
  courseId: string
  courseName: string
  title: string
  progressRate: number
  isCompleted: boolean
  customRemindTime: string | null
  remindInterval: number | null
}

export type TeamSummary = {
  teamId: string
  teamName: string
  creatorId: string
  roleName: string
  isAdmin: boolean
}

export type TeamTaskSummary = {
  taskId: string
  teamId: string
  teamName: string
  creatorId: string
  creatorName: string
  title: string
  content: string | null
  fileUrl: string | null
  linkUrl: string | null
  deadline: string | null
  isFollowing: boolean
}

export type TeamVoteSummary = {
  voteId: string
  teamId: string
  suggestedTime: string
  participantResponses: string[]
}

export type FreeTime = {
  userId: string
  weeklyBits: Uint8Array
  isPublic: boolean
}

type UserRow = {
  user_id: string
  student_id: string | null
  username: string
  name: string
  role: UserRole
  fcm_token: string | null
  alarm_settings: string
}

type LegacyLectureRow = {
  course_id: string
  course_name: string
  professor_user_id: string | null
  professor_name: string
  professor_username: string | null
  description: string | null
  room: string | null
  semester: string
  credits: number
  created_at: string
  updated_at: string
  day_of_week: number | null
  start_period: number | null
  end_period: number | null
}

type AssignmentRow = {
  lms_as_id: string
  course_id: string
  title: string
  description: string | null
  deadline: string
  link_url: string | null
  created_at: string
  updated_at: string
}

type CourseRow = {
  course_id: string
  course_name: string
  professor: string
  description: string | null
  room: string | null
  semester: string
  credits: number
}

type LmsLectureRow = {
  lms_lec_id: string
  course_id: string
  title: string
  content: string | null
  opened_at: string | null
  deadline: string | null
  link_url: string | null
}

type LmsNoticeRow = {
  notice_id: string
  course_id: string
  title: string
  content: string | null
  posted_at: string
  link_url: string | null
}

type UserAssignmentStatusRow = {
  user_as_id: string
  user_id: string
  lms_as_id: string
  course_id: string
  course_name: string
  title: string
  deadline: string
  is_completed: number
  custom_remind_time: string | null
  remind_interval: number | null
}

type UserLectureProgressRow = {
  user_lec_progress_id: string
  user_id: string
  lms_lec_id: string
  course_id: string
  course_name: string
  title: string
  progress_rate: number
  is_completed: number
  custom_remind_time: string | null
  remind_interval: number | null
}

type TeamSummaryRow = {
  team_id: string
  team_name: string
  creator_id: string
  role_name: string
  is_admin: number
}

type TeamTaskRow = {
  task_id: string
  team_id: string
  team_name: string
  creator_id: string
  creator_name: string
  title: string
  content: string | null
  file_url: string | null
  link_url: string | null
  deadline: string | null
  is_following: number
}

type TeamVoteRow = {
  vote_id: string
  team_id: string
  suggested_time: string
  participant_responses: string
}

type FreeTimeRow = {
  user_id: string
  weekly_bits: Uint8Array
  is_public: number
}

type GlobalWithDb = typeof globalThis & {
  __mockCampusDb?: DatabaseSync
}

const DATABASE_PATH = path.join(process.cwd(), 'data', 'mock-cyber-campus.sqlite')
const SCHEMA_PATH = path.join(process.cwd(), 'db', 'schema.sql')
const SEED_PATH = path.join(process.cwd(), 'db', 'seed.sql')
const DAY_OF_WEEK_LABELS = ['', '월', '화', '수', '목', '금', '토', '일']
const DB_SCHEMA_VERSION = 3
const USER_ROLES: UserRole[] = ['학생', '교수']
const DEFAULT_ALARM_SETTINGS: AlarmSettings = {
  assignmentReminders: true,
  teamAlerts: true,
  noticeAlerts: true,
}

function parseJson<T> (value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function toLegacyId (textId: string) {
  const numericId = Number(textId)

  if (!Number.isInteger(numericId)) {
    throw new Error(`Expected numeric text id, received "${textId}"`)
  }

  return numericId
}

function parseDbBoolean (value: number) {
  return value === 1
}

function mapUserRow (row: UserRow): MockUser {
  return {
    id: toLegacyId(row.user_id),
    userId: row.user_id,
    username: row.username,
    displayName: row.name,
    role: row.role,
    studentId: row.student_id,
    fcmToken: row.fcm_token,
    alarmSettings: parseJson(row.alarm_settings, DEFAULT_ALARM_SETTINGS),
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
        DROP TABLE IF EXISTS team_task_followers;
        DROP TABLE IF EXISTS team_votes;
        DROP TABLE IF EXISTS team_tasks;
        DROP TABLE IF EXISTS team_members;
        DROP TABLE IF EXISTS teams;
        DROP TABLE IF EXISTS user_lecture_progress;
        DROP TABLE IF EXISTS user_assignments;
        DROP TABLE IF EXISTS lms_notices;
        DROP TABLE IF EXISTS lms_lectures;
        DROP TABLE IF EXISTS lms_assignments;
        DROP TABLE IF EXISTS course_enrollments;
        DROP TABLE IF EXISTS course_meetings;
        DROP TABLE IF EXISTS courses;
        DROP TABLE IF EXISTS free_times;
        DROP TABLE IF EXISTS class_periods;
        DROP TABLE IF EXISTS lecture_enrollments;
        DROP TABLE IF EXISTS assignments;
        DROP TABLE IF EXISTS lecture_meetings;
        DROP TABLE IF EXISTS lectures;
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

function getNextNumericTextId (tableName: string, columnName: string) {
  const row = db.prepare(`
    SELECT COALESCE(MAX(CAST(${columnName} AS INTEGER)), 0) + 1 AS next_id
    FROM ${tableName}
  `).get() as { next_id: number }

  return String(row.next_id)
}

function buildLectureList (rows: LegacyLectureRow[]) {
  const lectureMap = new Map<string, UserLecture>()

  for (const row of rows) {
    const existingLecture = lectureMap.get(row.course_id)

    if (!existingLecture) {
      lectureMap.set(row.course_id, {
        id: toLegacyId(row.course_id),
        code: row.course_id,
        title: row.course_name,
        instructorUserId: row.professor_user_id ? toLegacyId(row.professor_user_id) : null,
        instructorName: row.professor_name,
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
      lectureMap.get(row.course_id)?.meetings.push({
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

export function listUsers () {
  const rows = db.prepare(`
    SELECT
      user_id,
      student_id,
      username,
      name,
      role,
      fcm_token,
      alarm_settings
    FROM users
    ORDER BY CAST(user_id AS INTEGER), user_id
  `).all() as UserRow[]

  return rows.map(mapUserRow)
}

export function getUserById (id: number) {
  const row = db.prepare(`
    SELECT
      user_id,
      student_id,
      username,
      name,
      role,
      fcm_token,
      alarm_settings
    FROM users
    WHERE user_id = ?
  `).get(String(id)) as UserRow | undefined

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

  const userId = getNextNumericTextId('users', 'user_id')
  const studentId = input.role === '학생'
    ? `2026${userId.padStart(4, '0')}`
    : null

  db.prepare(`
    INSERT INTO users (
      user_id,
      student_id,
      username,
      name,
      role,
      alarm_settings
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    studentId,
    username,
    displayName,
    input.role,
    JSON.stringify(DEFAULT_ALARM_SETTINGS)
  )

  const row = db.prepare(`
    SELECT
      user_id,
      student_id,
      username,
      name,
      role,
      fcm_token,
      alarm_settings
    FROM users
    WHERE user_id = ?
  `).get(userId) as UserRow | undefined

  if (!row) {
    throw new Error('failed to create user')
  }

  return mapUserRow(row)
}

export function listCurrentTeachings (userId: number) {
  const user = getUserById(userId)

  if (!user || user.role !== '교수') {
    return []
  }

  const rows = db.prepare(`
    SELECT
      c.course_id,
      c.course_name,
      instructor.user_id AS professor_user_id,
      COALESCE(instructor.name, c.professor) AS professor_name,
      instructor.username AS professor_username,
      c.description,
      c.room,
      c.semester,
      c.credits,
      c.created_at,
      c.updated_at,
      cm.day_of_week,
      cm.start_period,
      cm.end_period
    FROM courses AS c
    LEFT JOIN users AS instructor
      ON instructor.name = c.professor
      AND instructor.role = '교수'
    LEFT JOIN course_meetings AS cm
      ON cm.course_id = c.course_id
    WHERE c.professor = ?
    ORDER BY CAST(c.course_id AS INTEGER), cm.day_of_week, cm.start_period
  `).all(user.displayName) as LegacyLectureRow[]

  return buildLectureList(rows)
}

export function listLecturesForUser (userId: number) {
  const rows = db.prepare(`
    SELECT
      c.course_id,
      c.course_name,
      instructor.user_id AS professor_user_id,
      COALESCE(instructor.name, c.professor) AS professor_name,
      instructor.username AS professor_username,
      c.description,
      c.room,
      c.semester,
      c.credits,
      c.created_at,
      c.updated_at,
      cm.day_of_week,
      cm.start_period,
      cm.end_period
    FROM course_enrollments AS ce
    JOIN courses AS c
      ON c.course_id = ce.course_id
    LEFT JOIN users AS instructor
      ON instructor.name = c.professor
      AND instructor.role = '교수'
    LEFT JOIN course_meetings AS cm
      ON cm.course_id = c.course_id
    WHERE ce.user_id = ?
    ORDER BY CAST(c.course_id AS INTEGER), cm.day_of_week, cm.start_period
  `).all(String(userId)) as LegacyLectureRow[]

  return buildLectureList(rows)
}

export function getLectureInfo (lectureId: number) {
  const rows = db.prepare(`
    SELECT
      c.course_id,
      c.course_name,
      instructor.user_id AS professor_user_id,
      COALESCE(instructor.name, c.professor) AS professor_name,
      instructor.username AS professor_username,
      c.description,
      c.room,
      c.semester,
      c.credits,
      c.created_at,
      c.updated_at,
      cm.day_of_week,
      cm.start_period,
      cm.end_period
    FROM courses AS c
    LEFT JOIN users AS instructor
      ON instructor.name = c.professor
      AND instructor.role = '교수'
    LEFT JOIN course_meetings AS cm
      ON cm.course_id = c.course_id
    WHERE c.course_id = ?
    ORDER BY cm.day_of_week, cm.start_period
  `).all(String(lectureId)) as LegacyLectureRow[]

  const firstRow = rows[0]

  if (!firstRow) {
    return null
  }

  const lectures = buildLectureList(rows)
  const lecture = lectures[0]

  if (!lecture) {
    return null
  }

  return {
    ...lecture,
    description: firstRow.description,
    instructorUsername: firstRow.professor_username ?? '',
    createdAt: firstRow.created_at,
    updatedAt: firstRow.updated_at,
  }
}

export function getAssignments (lectureId: number) {
  const rows = db.prepare(`
    SELECT
      lms_as_id,
      course_id,
      title,
      description,
      deadline,
      link_url,
      created_at,
      updated_at
    FROM lms_assignments
    WHERE course_id = ?
    ORDER BY deadline ASC, CAST(lms_as_id AS INTEGER), lms_as_id
  `).all(String(lectureId)) as AssignmentRow[]

  return rows.map((row) => ({
    id: toLegacyId(row.lms_as_id),
    lectureId: toLegacyId(row.course_id),
    title: row.title,
    description: row.description,
    dueAt: row.deadline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    linkUrl: row.link_url,
  }))
}

export function getAssignmentInfo (lectureId: number, assignmentId: number) {
  const row = db.prepare(`
    SELECT
      a.lms_as_id,
      a.course_id,
      a.title,
      a.description,
      a.deadline,
      a.link_url,
      a.created_at,
      a.updated_at,
      c.course_name
    FROM lms_assignments AS a
    JOIN courses AS c
      ON c.course_id = a.course_id
    WHERE a.course_id = ? AND a.lms_as_id = ?
  `).get(String(lectureId), String(assignmentId)) as (AssignmentRow & {
    course_name: string
  }) | undefined

  if (!row) {
    return null
  }

  return {
    id: toLegacyId(row.lms_as_id),
    lectureId: toLegacyId(row.course_id),
    title: row.title,
    description: row.description,
    dueAt: row.deadline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    linkUrl: row.link_url,
    lectureTitle: row.course_name,
    lectureCode: row.course_id,
  }
}

export function listCoursesForUserId (userId: string) {
  const rows = db.prepare(`
    SELECT
      c.course_id,
      c.course_name,
      c.professor,
      c.description,
      c.room,
      c.semester,
      c.credits
    FROM course_enrollments AS ce
    JOIN courses AS c
      ON c.course_id = ce.course_id
    WHERE ce.user_id = ?
    ORDER BY CAST(c.course_id AS INTEGER), c.course_id
  `).all(userId) as CourseRow[]

  return rows.map((row) => ({
    courseId: row.course_id,
    courseName: row.course_name,
    professor: row.professor,
    description: row.description,
    room: row.room,
    semester: row.semester,
    credits: row.credits,
  }))
}

export function listLmsAssignmentsByCourse (courseId: string) {
  const rows = db.prepare(`
    SELECT
      lms_as_id,
      course_id,
      title,
      description,
      deadline,
      link_url,
      created_at,
      updated_at
    FROM lms_assignments
    WHERE course_id = ?
    ORDER BY deadline ASC, CAST(lms_as_id AS INTEGER), lms_as_id
  `).all(courseId) as AssignmentRow[]

  return rows.map((row) => ({
    lmsAssignmentId: row.lms_as_id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    deadline: row.deadline,
    linkUrl: row.link_url,
  }))
}

export function getLmsLectures (lectureId: number): LmsLectureSummary[] {
  return listLmsLecturesByCourse(String(lectureId))
}

export function listLmsLecturesByCourse (courseId: string) {
  const rows = db.prepare(`
    SELECT
      lms_lec_id,
      course_id,
      title,
      content,
      opened_at,
      deadline,
      link_url
    FROM lms_lectures
    WHERE course_id = ?
    ORDER BY opened_at ASC, CAST(lms_lec_id AS INTEGER), lms_lec_id
  `).all(courseId) as LmsLectureRow[]

  return rows.map((row) => ({
    lmsLectureId: row.lms_lec_id,
    courseId: row.course_id,
    title: row.title,
    content: row.content,
    openedAt: row.opened_at,
    deadline: row.deadline,
    linkUrl: row.link_url,
  }))
}

export function listLmsNoticesByCourse (courseId: string) {
  const rows = db.prepare(`
    SELECT
      notice_id,
      course_id,
      title,
      content,
      posted_at,
      link_url
    FROM lms_notices
    WHERE course_id = ?
    ORDER BY posted_at DESC, CAST(notice_id AS INTEGER), notice_id
  `).all(courseId) as LmsNoticeRow[]

  return rows.map((row) => ({
    noticeId: row.notice_id,
    courseId: row.course_id,
    title: row.title,
    content: row.content,
    postedAt: row.posted_at,
    linkUrl: row.link_url,
  }))
}

export function listUserAssignments (userId: string) {
  const rows = db.prepare(`
    SELECT
      ua.user_as_id,
      ua.user_id,
      ua.lms_as_id,
      a.course_id,
      c.course_name,
      a.title,
      a.deadline,
      ua.is_completed,
      ua.custom_remind_time,
      ua.remind_interval
    FROM user_assignments AS ua
    JOIN lms_assignments AS a
      ON a.lms_as_id = ua.lms_as_id
    JOIN courses AS c
      ON c.course_id = a.course_id
    WHERE ua.user_id = ?
    ORDER BY a.deadline ASC, CAST(ua.user_as_id AS INTEGER), ua.user_as_id
  `).all(userId) as UserAssignmentStatusRow[]

  return rows.map((row) => ({
    userAssignmentId: row.user_as_id,
    userId: row.user_id,
    lmsAssignmentId: row.lms_as_id,
    courseId: row.course_id,
    courseName: row.course_name,
    title: row.title,
    deadline: row.deadline,
    isCompleted: parseDbBoolean(row.is_completed),
    customRemindTime: row.custom_remind_time,
    remindInterval: row.remind_interval,
  }))
}

export function listUserLectureProgress (userId: string) {
  const rows = db.prepare(`
    SELECT
      ulp.user_lec_progress_id,
      ulp.user_id,
      ulp.lms_lec_id,
      l.course_id,
      c.course_name,
      l.title,
      ulp.progress_rate,
      ulp.is_completed,
      ulp.custom_remind_time,
      ulp.remind_interval
    FROM user_lecture_progress AS ulp
    JOIN lms_lectures AS l
      ON l.lms_lec_id = ulp.lms_lec_id
    JOIN courses AS c
      ON c.course_id = l.course_id
    WHERE ulp.user_id = ?
    ORDER BY c.course_id, CAST(ulp.user_lec_progress_id AS INTEGER), ulp.user_lec_progress_id
  `).all(userId) as UserLectureProgressRow[]

  return rows.map((row) => ({
    userLectureProgressId: row.user_lec_progress_id,
    userId: row.user_id,
    lmsLectureId: row.lms_lec_id,
    courseId: row.course_id,
    courseName: row.course_name,
    title: row.title,
    progressRate: row.progress_rate,
    isCompleted: parseDbBoolean(row.is_completed),
    customRemindTime: row.custom_remind_time,
    remindInterval: row.remind_interval,
  }))
}

export function listTeamsForUserId (userId: string) {
  const rows = db.prepare(`
    SELECT
      tm.team_id,
      t.team_name,
      t.creator_id,
      tm.role_name,
      tm.is_admin
    FROM team_members AS tm
    JOIN teams AS t
      ON t.team_id = tm.team_id
    WHERE tm.user_id = ?
    ORDER BY CAST(tm.team_id AS INTEGER), tm.team_id
  `).all(userId) as TeamSummaryRow[]

  return rows.map((row) => ({
    teamId: row.team_id,
    teamName: row.team_name,
    creatorId: row.creator_id,
    roleName: row.role_name,
    isAdmin: parseDbBoolean(row.is_admin),
  }))
}

export function listTeamTasks (teamId: string) {
  const rows = db.prepare(`
    SELECT
      tt.task_id,
      tt.team_id,
      t.team_name,
      tt.creator_id,
      creator.name AS creator_name,
      tt.title,
      tt.content,
      tt.file_url,
      tt.link_url,
      tt.deadline,
      0 AS is_following
    FROM team_tasks AS tt
    JOIN teams AS t
      ON t.team_id = tt.team_id
    JOIN users AS creator
      ON creator.user_id = tt.creator_id
    WHERE tt.team_id = ?
    ORDER BY tt.deadline ASC, CAST(tt.task_id AS INTEGER), tt.task_id
  `).all(teamId) as TeamTaskRow[]

  return rows.map((row) => ({
    taskId: row.task_id,
    teamId: row.team_id,
    teamName: row.team_name,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    title: row.title,
    content: row.content,
    fileUrl: row.file_url,
    linkUrl: row.link_url,
    deadline: row.deadline,
    isFollowing: parseDbBoolean(row.is_following),
  }))
}

export function listFollowedTasks (userId: string) {
  const rows = db.prepare(`
    SELECT
      tt.task_id,
      tt.team_id,
      t.team_name,
      tt.creator_id,
      creator.name AS creator_name,
      tt.title,
      tt.content,
      tt.file_url,
      tt.link_url,
      tt.deadline,
      1 AS is_following
    FROM team_task_followers AS ttf
    JOIN team_tasks AS tt
      ON tt.task_id = ttf.task_id
    JOIN teams AS t
      ON t.team_id = tt.team_id
    JOIN users AS creator
      ON creator.user_id = tt.creator_id
    WHERE ttf.user_id = ?
    ORDER BY tt.deadline ASC, CAST(tt.task_id AS INTEGER), tt.task_id
  `).all(userId) as TeamTaskRow[]

  return rows.map((row) => ({
    taskId: row.task_id,
    teamId: row.team_id,
    teamName: row.team_name,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    title: row.title,
    content: row.content,
    fileUrl: row.file_url,
    linkUrl: row.link_url,
    deadline: row.deadline,
    isFollowing: parseDbBoolean(row.is_following),
  }))
}

export function listTeamVotes (teamId: string) {
  const rows = db.prepare(`
    SELECT
      vote_id,
      team_id,
      suggested_time,
      participant_responses
    FROM team_votes
    WHERE team_id = ?
    ORDER BY suggested_time ASC, CAST(vote_id AS INTEGER), vote_id
  `).all(teamId) as TeamVoteRow[]

  return rows.map((row) => ({
    voteId: row.vote_id,
    teamId: row.team_id,
    suggestedTime: row.suggested_time,
    participantResponses: parseJson(row.participant_responses, [] as string[]),
  }))
}

export function getFreeTime (userId: string) {
  const row = db.prepare(`
    SELECT
      user_id,
      weekly_bits,
      is_public
    FROM free_times
    WHERE user_id = ?
  `).get(userId) as FreeTimeRow | undefined

  if (!row) {
    return null
  }

  return {
    userId: row.user_id,
    weeklyBits: row.weekly_bits,
    isPublic: parseDbBoolean(row.is_public),
  }
}

export function createLmsLecture (
  courseId: number,
  data: { title: string; content?: string; openedAt?: string; deadline?: string; linkUrl?: string }
): LmsLectureSummary {
  const { max } = db.prepare(
    'SELECT MAX(CAST(lms_lec_id AS INTEGER)) AS max FROM lms_lectures'
  ).get() as { max: number | null }
  const nextId = String((max ?? 0) + 1)
  db.prepare(`
    INSERT INTO lms_lectures (lms_lec_id, course_id, title, content, opened_at, deadline, link_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(nextId, String(courseId), data.title, data.content ?? null, data.openedAt ?? null, data.deadline ?? null, data.linkUrl ?? null)

  return {
    lmsLectureId: nextId,
    courseId: String(courseId),
    title: data.title,
    content: data.content ?? null,
    openedAt: data.openedAt ?? null,
    deadline: data.deadline ?? null,
    linkUrl: data.linkUrl ?? null,
  }
}

export function createAssignment (
  courseId: number,
  data: { title: string; description?: string; deadline: string; linkUrl?: string }
): Assignment {
  const { max } = db.prepare(
    'SELECT MAX(CAST(lms_as_id AS INTEGER)) AS max FROM lms_assignments'
  ).get() as { max: number | null }
  const nextId = String((max ?? 0) + 1)
  db.prepare(`
    INSERT INTO lms_assignments (lms_as_id, course_id, title, description, deadline, link_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(nextId, String(courseId), data.title, data.description ?? null, data.deadline, data.linkUrl ?? null)

  return {
    id: toLegacyId(nextId),
    lectureId: courseId,
    title: data.title,
    description: data.description ?? null,
    dueAt: data.deadline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkUrl: data.linkUrl ?? null,
  }
}

export function createNotice (
  courseId: number,
  data: { title: string; content: string; postedAt?: string; linkUrl?: string }
): LmsNoticeSummary {
  const { max } = db.prepare(
    'SELECT MAX(CAST(notice_id AS INTEGER)) AS max FROM lms_notices'
  ).get() as { max: number | null }
  const nextId = String((max ?? 0) + 1)
  const postedAt = data.postedAt ?? new Date().toISOString()

  db.prepare(`
    INSERT INTO lms_notices (notice_id, course_id, title, content, posted_at, link_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(nextId, String(courseId), data.title, data.content, postedAt, data.linkUrl ?? null)

  return {
    noticeId: nextId,
    courseId: String(courseId),
    title: data.title,
    content: data.content,
    postedAt,
    linkUrl: data.linkUrl ?? null,
  }
}
