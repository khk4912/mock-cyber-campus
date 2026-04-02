import { cookies } from 'next/headers'
import { cache } from 'react'

import { getUserById, type MockUser } from '@/lib/db'

export const SESSION_COOKIE_NAME = 'mock-campus-user-id'

export const getCurrentUser = cache(async (): Promise<MockUser | null> => {
  const cookieStore = await cookies()
  const rawUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!rawUserId) {
    return null
  }

  const userId = Number(rawUserId)

  if (!Number.isInteger(userId)) {
    return null
  }

  return getUserById(userId)
})
