'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { SESSION_COOKIE_NAME } from '@/lib/auth'
import { getUserById } from '@/lib/db'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export async function loginAs (formData: FormData) {
  const rawUserId = formData.get('userId')
  const userId = Number(rawUserId)

  if (!Number.isInteger(userId) || !getUserById(userId)) {
    redirect('/')
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, String(userId), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'strict',
  })

  redirect('/')
}

export async function logout () {
  const cookieStore = await cookies()

  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect('/')
}
