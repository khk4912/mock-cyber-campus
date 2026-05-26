'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/auth'
import { createAssignment, createLmsLecture, createNotice } from '@/lib/db'

const NOTICE_TYPES = ['urgent', 'exam', 'makeup', 'etc'] as const
type NoticeType = typeof NOTICE_TYPES[number]

async function assertProfessor () {
  const user = await getCurrentUser()
  if (user?.role !== '교수') {
    throw new Error('교수만 이 작업을 수행할 수 있습니다.')
  }

  return user
}

export async function addLmsLecture (lectureId: number, formData: FormData) {
  const user = await assertProfessor()

  const title = formData.get('title')
  const openedAt = formData.get('openedAt')
  const deadline = formData.get('deadline')
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('제목을 입력해 주세요.')
  }
  if (typeof openedAt !== 'string' || openedAt.trim() === '') {
    throw new Error('공개일을 입력해 주세요.')
  }
  if (typeof deadline !== 'string' || deadline.trim() === '') {
    throw new Error('마감일을 입력해 주세요.')
  }

  const getStr = (key: string) => {
    const v = formData.get(key)
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
  }

  await createLmsLecture(user.uid, lectureId, {
    title: title.trim(),
    content: getStr('content'),
    openedAt: openedAt.trim(),
    deadline: deadline.trim(),
    linkUrl: getStr('linkUrl'),
  })

  revalidatePath(`/lecture/${lectureId}`)
}

export async function addAssignment (lectureId: number, formData: FormData) {
  const user = await assertProfessor()

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

  await createAssignment(user.uid, lectureId, {
    title: title.trim(),
    description: getStr('description'),
    deadline: deadline.trim(),
    linkUrl: getStr('linkUrl'),
  })

  revalidatePath(`/lecture/${lectureId}`)
}

export async function addNotice (lectureId: number, formData: FormData) {
  const user = await assertProfessor()

  const title = formData.get('title')
  const content = formData.get('content')
  const type = formData.get('type')

  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('제목을 입력해 주세요.')
  }
  if (typeof content !== 'string' || content.trim() === '') {
    throw new Error('내용을 입력해 주세요.')
  }
  if (typeof type !== 'string' || !NOTICE_TYPES.includes(type as NoticeType)) {
    throw new Error('공지 유형이 올바르지 않습니다.')
  }

  const getStr = (key: string) => {
    const v = formData.get(key)
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
  }

  await createNotice(user.uid, lectureId, {
    title: title.trim(),
    content: content.trim(),
    postedAt: getStr('postedAt'),
    linkUrl: getStr('linkUrl'),
    type: type as NoticeType,
  })

  revalidatePath(`/lecture/${lectureId}`)
}
