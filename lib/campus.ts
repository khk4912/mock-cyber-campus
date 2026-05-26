type CampusPayload = Record<string, unknown>

const DEFAULT_FUNCTIONS_BASE_URL = 'https://asia-northeast3-appserver-e547b.cloudfunctions.net'

function getCampusConfig () {
  const baseUrl = process.env.FIREBASE_FUNCTIONS_BASE_URL ?? DEFAULT_FUNCTIONS_BASE_URL
  const secret = process.env.FIREBASE_CAMPUS_SECRET

  if (!secret) {
    throw new Error('FIREBASE_CAMPUS_SECRET is required to sync with Firebase campus Function')
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    secret,
  }
}

type CampusErrorBody = {
  error?: string | { message?: string }
}

function campusErrorMessage (body: CampusErrorBody | null, fallback: string) {
  if (typeof body?.error === 'string') {
    return body.error
  }

  return body?.error?.message ?? fallback
}

async function postCampus (path: string, payload: CampusPayload) {
  const { baseUrl, secret } = getCampusConfig()
  const response = await fetch(`${baseUrl}/campus/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Campus-Secret': secret,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const body = await response.json().catch(() => null) as CampusErrorBody | null

  if (!response.ok) {
    throw new Error(campusErrorMessage(body, `Firebase campus sync failed with ${response.status}`))
  }
}

function campusContentPath (actorUid: string, courseId: string, collection: string) {
  return `users/${encodeURIComponent(actorUid)}/courses/${encodeURIComponent(courseId)}/${collection}`
}

export async function syncCampusAssignment (payload: {
  actorUid: string
  courseId: string
  assignmentId: string
  title: string
  description?: string
  dueAt: string
  linkUrl?: string
}) {
  await postCampus(campusContentPath(payload.actorUid, payload.courseId, 'assignments'), {
    assignment_id: payload.assignmentId,
    course_id: payload.courseId,
    title: payload.title,
    description: payload.description,
    due_at: payload.dueAt,
    link_url: payload.linkUrl,
  })
}

export async function syncCampusVod (payload: {
  actorUid: string
  courseId: string
  vodId: string
  title: string
  content?: string
  openedAt: string
  dueAt: string
  linkUrl?: string
}) {
  await postCampus(campusContentPath(payload.actorUid, payload.courseId, 'vods'), {
    vod_id: payload.vodId,
    course_id: payload.courseId,
    title: payload.title,
    content: payload.content,
    opened_at: payload.openedAt,
    due_at: payload.dueAt,
    link_url: payload.linkUrl,
  })
}

export async function syncCampusNotice (payload: {
  actorUid: string
  courseId: string
  noticeId: string
  title: string
  content: string
  type: 'urgent' | 'exam' | 'makeup' | 'etc'
  postedAt?: string
  linkUrl?: string
}) {
  await postCampus(campusContentPath(payload.actorUid, payload.courseId, 'notices'), {
    notice_id: payload.noticeId,
    course_id: payload.courseId,
    title: payload.title,
    content: payload.content,
    type: payload.type,
    posted_at: payload.postedAt,
    link_url: payload.linkUrl,
  })
}
