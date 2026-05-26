import { syncCampusAssignment, syncCampusNotice, syncCampusVod } from '@/lib/campus'

export type UserRole = '학생' | '교수'

export type AlarmSettings = {
  assignmentReminders: boolean
  teamAlerts: boolean
  noticeAlerts: boolean
}

export type MockUser = {
  id: number
  uid: string
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
  createdAt: string | null
  updatedAt: string | null
}

export type Assignment = {
  id: number
  lectureId: number
  title: string
  description: string | null
  dueAt: string
  createdAt: string | null
  updatedAt: string | null
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

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

const DEFAULT_ALARM_SETTINGS: AlarmSettings = {
  assignmentReminders: true,
  teamAlerts: true,
  noticeAlerts: true,
}

function normalizeDateInput (value: string) {
  return value.includes('T') ? value : value.replace(' ', 'T')
}

function getWebConfig () {
  const baseUrl = process.env.FIREBASE_FUNCTIONS_BASE_URL ?? 'https://asia-northeast3-appserver-e547b.cloudfunctions.net'
  const secret = process.env.FIREBASE_CAMPUS_SECRET

  if (!secret) {
    throw new Error('FIREBASE_CAMPUS_SECRET is required to read Firebase web Function data')
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    secret,
  }
}

async function webRequest<T> (path: string, init?: { method?: 'GET' | 'POST'; body?: unknown }) {
  const { baseUrl, secret } = getWebConfig()
  const response = await fetch(`${baseUrl}/web/${path.replace(/^\//, '')}`, {
    method: init?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Campus-Secret': secret,
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  })
  const body = await response.json().catch(() => null) as ApiResponse<T> | null

  if (!response.ok || body === null || body.ok === false) {
    throw new Error(body?.ok === false ? body.error : `Firebase web request failed with ${response.status}`)
  }

  return body.data
}

function requireNumericId (value: number | null, label: string) {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be a numeric Firebase document id for the current Next.js routes`)
  }

  return value as number
}

function mapUser (user: MockUser): MockUser {
  return {
    ...user,
    id: requireNumericId(user.id, 'user.id'),
    uid: user.uid ?? user.userId,
    studentId: user.studentId ?? null,
    fcmToken: user.fcmToken ?? null,
    alarmSettings: user.alarmSettings ?? DEFAULT_ALARM_SETTINGS,
  }
}

function mapLecture (lecture: LectureInfo): LectureInfo {
  return {
    ...lecture,
    id: requireNumericId(lecture.id, 'lecture.id'),
    instructorUserId: lecture.instructorUserId ?? null,
    room: lecture.room ?? null,
    description: lecture.description ?? null,
    createdAt: lecture.createdAt ?? null,
    updatedAt: lecture.updatedAt ?? null,
  }
}

function mapAssignment (assignment: Assignment): Assignment {
  return {
    ...assignment,
    id: requireNumericId(assignment.id, 'assignment.id'),
    lectureId: requireNumericId(assignment.lectureId, 'assignment.lectureId'),
    description: assignment.description ?? null,
    dueAt: assignment.dueAt,
    createdAt: assignment.createdAt ?? null,
    updatedAt: assignment.updatedAt ?? null,
    linkUrl: assignment.linkUrl ?? null,
  }
}

function hasNumericId<T extends { id: number | null }> (value: T): value is T & { id: number } {
  return Number.isInteger(value.id)
}

export async function listUsers () {
  const users = await webRequest<MockUser[]>('users')
  return users.filter(hasNumericId).map(mapUser)
}

export async function getUserById (id: number) {
  try {
    const user = await webRequest<MockUser>(`users/${id}`)
    return mapUser(user)
  } catch {
    return null
  }
}

export async function addUser (input: {
  username: string
  displayName: string
  role: UserRole
}) {
  const users = await listUsers()
  const nextId = String(Math.max(0, ...users.map((user) => user.id)) + 1)
  const user = await webRequest<MockUser>('users', {
    method: 'POST',
    body: {
      userId: nextId,
      username: input.username,
      displayName: input.displayName,
      role: input.role,
      studentId: input.role === '학생' ? `2026${nextId.padStart(4, '0')}` : null,
    },
  })

  return mapUser(user)
}

export async function listCurrentTeachings (userId: number) {
  const lectures = await webRequest<LectureInfo[]>(`users/${userId}/teachings`)
  return lectures.filter(hasNumericId).map(mapLecture)
}

export async function listLecturesForUser (userId: number) {
  const lectures = await webRequest<LectureInfo[]>(`users/${userId}/lectures`)
  return lectures.filter(hasNumericId).map(mapLecture)
}

export async function getLectureInfo (lectureId: number) {
  try {
    const lecture = await webRequest<LectureInfo>(`lectures/${lectureId}`)
    return mapLecture(lecture)
  } catch {
    return null
  }
}

export async function getAssignments (lectureId: number) {
  const assignments = await webRequest<Assignment[]>(`lectures/${lectureId}/assignments`)
  return assignments.filter(hasNumericId).map(mapAssignment)
}

export async function getAssignmentInfo (lectureId: number, assignmentId: number) {
  try {
    const assignment = mapAssignment(
      await webRequest<Assignment>(`lectures/${lectureId}/assignments/${assignmentId}`)
    )
    const lecture = await getLectureInfo(lectureId)

    if (!lecture) {
      return null
    }

    return {
      ...assignment,
      lectureTitle: lecture.title,
      lectureCode: lecture.code,
    }
  } catch {
    return null
  }
}

export async function listCoursesForUserId (userId: string) {
  const lectures = await listLecturesForUser(Number(userId))

  return lectures.map((lecture): CourseSummary => ({
    courseId: lecture.code,
    courseName: lecture.title,
    professor: lecture.instructorName,
    description: lecture.description,
    room: lecture.room,
    semester: lecture.semester,
    credits: lecture.credits,
  }))
}

export async function listLmsAssignmentsByCourse (courseId: string) {
  const assignments = await getAssignments(Number(courseId))

  return assignments.map((assignment): LmsAssignmentSummary => ({
    lmsAssignmentId: String(assignment.id),
    courseId,
    title: assignment.title,
    description: assignment.description,
    deadline: assignment.dueAt,
    linkUrl: assignment.linkUrl,
  }))
}

export async function getLmsLectures (lectureId: number): Promise<LmsLectureSummary[]> {
  return listLmsLecturesByCourse(String(lectureId))
}

export async function listLmsLecturesByCourse (courseId: string) {
  return webRequest<LmsLectureSummary[]>(`lectures/${courseId}/vods`)
}

export async function listLmsNoticesByCourse (courseId: string) {
  return webRequest<LmsNoticeSummary[]>(`lectures/${courseId}/notices`)
}

export function listUserAssignments (_userId: string): Promise<UserAssignmentStatus[]> {
  return Promise.resolve([])
}

export function listUserLectureProgress (_userId: string): Promise<UserLectureProgressSummary[]> {
  return Promise.resolve([])
}

export function listTeamsForUserId (_userId: string): Promise<TeamSummary[]> {
  return Promise.resolve([])
}

export function listTeamTasks (_teamId: string): Promise<TeamTaskSummary[]> {
  return Promise.resolve([])
}

export function listFollowedTasks (_userId: string): Promise<TeamTaskSummary[]> {
  return Promise.resolve([])
}

export function listTeamVotes (_teamId: string): Promise<TeamVoteSummary[]> {
  return Promise.resolve([])
}

export function getFreeTime (_userId: string): Promise<FreeTime | null> {
  return Promise.resolve(null)
}

export async function createLmsLecture (
  actorUid: string,
  courseId: number,
  data: { title: string; content?: string; openedAt: string; deadline: string; linkUrl?: string }
): Promise<LmsLectureSummary> {
  const lectures = await listLmsLecturesByCourse(String(courseId))
  const nextId = String(Math.max(2000, ...lectures.map((lecture) => Number(lecture.lmsLectureId)).filter(Number.isFinite)) + 1)
  const lecture = {
    lmsLectureId: nextId,
    courseId: String(courseId),
    title: data.title,
    content: data.content ?? null,
    openedAt: data.openedAt,
    deadline: data.deadline,
    linkUrl: data.linkUrl ?? null,
  }

  await syncCampusVod({
    actorUid,
    courseId: lecture.courseId,
    vodId: lecture.lmsLectureId,
    title: lecture.title,
    content: lecture.content ?? undefined,
    openedAt: normalizeDateInput(lecture.openedAt),
    dueAt: normalizeDateInput(lecture.deadline),
    linkUrl: lecture.linkUrl ?? undefined,
  })

  return lecture
}

export async function createAssignment (
  actorUid: string,
  courseId: number,
  data: { title: string; description?: string; deadline: string; linkUrl?: string }
): Promise<Assignment> {
  const assignments = await getAssignments(courseId)
  const nextId = Math.max(1000, ...assignments.map((assignment) => assignment.id)) + 1

  await syncCampusAssignment({
    actorUid,
    courseId: String(courseId),
    assignmentId: String(nextId),
    title: data.title,
    description: data.description,
    dueAt: normalizeDateInput(data.deadline),
    linkUrl: data.linkUrl,
  })

  return {
    id: nextId,
    lectureId: courseId,
    title: data.title,
    description: data.description ?? null,
    dueAt: data.deadline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkUrl: data.linkUrl ?? null,
  }
}

export async function createNotice (
  actorUid: string,
  courseId: number,
  data: { title: string; content: string; postedAt?: string; linkUrl?: string; type?: 'urgent' | 'exam' | 'makeup' | 'etc' }
): Promise<LmsNoticeSummary> {
  const notices = await listLmsNoticesByCourse(String(courseId))
  const nextId = String(Math.max(3000, ...notices.map((notice) => Number(notice.noticeId)).filter(Number.isFinite)) + 1)
  const postedAt = data.postedAt ?? new Date().toISOString()

  await syncCampusNotice({
    actorUid,
    courseId: String(courseId),
    noticeId: nextId,
    title: data.title,
    content: data.content,
    type: data.type ?? 'etc',
    postedAt: normalizeDateInput(postedAt),
    linkUrl: data.linkUrl,
  })

  return {
    noticeId: nextId,
    courseId: String(courseId),
    title: data.title,
    content: data.content,
    postedAt,
    linkUrl: data.linkUrl ?? null,
  }
}
