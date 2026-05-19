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

  const body = await response.json().catch(() => null) as { error?: string } | null

  if (!response.ok) {
    throw new Error(body?.error ?? `Firebase campus sync failed with ${response.status}`)
  }
}

export async function syncCampusAssignment (payload: {
  lectureId: string
  assignmentId: string
  title: string
  description?: string
  dueAt: string
  link?: string
}) {
  await postCampus('assignments', payload)
}

export async function syncCampusVod (payload: {
  lectureId: string
  vodId: string
  title: string
  content?: string
  uploadAt: string
  dueAt: string
  url?: string
}) {
  await postCampus('vods', {
    lectureId: payload.lectureId,
    vodId: payload.vodId,
    title: payload.title,
    url: payload.url,
    uploadAt: payload.uploadAt,
    dueAt: payload.dueAt,
  })
}

export async function syncCampusNotice (payload: {
  lectureId: string
  noticeId: string
  title: string
  content: string
  type: 'urgent' | 'exam' | 'makeup' | 'etc'
  createdAt?: string
}) {
  await postCampus('notices', payload)
}
