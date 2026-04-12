'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/auth'
import { createAssignment, createLmsLecture } from '@/lib/db'

async function assertProfessor () {
  const user = await getCurrentUser()
  if (user?.role !== '교수') {
    throw new Error('교수만 이 작업을 수행할 수 있습니다.')
  }
}

export async function addLmsLecture (lectureId: number, formData: FormData) {
  await assertProfessor()

  const title = formData.get('title')
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('제목을 입력해 주세요.')
  }

  const getStr = (key: string) => {
    const v = formData.get(key)
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
  }

  createLmsLecture(lectureId, {
    title: title.trim(),
    content: getStr('content'),
    openedAt: getStr('openedAt'),
    deadline: getStr('deadline'),
    linkUrl: getStr('linkUrl'),
  })

  revalidatePath(`/lecture/${lectureId}`)
}

export async function addAssignment (lectureId: number, formData: FormData) {
  await assertProfessor()

  const title = formData.get('title')
  const deadline = formData.get('deadline')
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('제목을 입력해 주세요.')
  }
  if (typeof deadline !== 'string' || deadline.trim() === '') {
    throw new Error('마감일을 입력해 주세요.')
  }

  const getStr = (key: string) => {
    const v = formData.get(key)
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
  }

  createAssignment(lectureId, {
    title: title.trim(),
    description: getStr('description'),
    deadline: deadline.trim(),
    linkUrl: getStr('linkUrl'),
  })

  revalidatePath(`/lecture/${lectureId}`)
}
