'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/auth'
import { syncCampusAssignment, syncCampusNotice, syncCampusVod } from '@/lib/campus'
import { createAssignment, createLmsLecture, createNotice } from '@/lib/db'

const NOTICE_TYPES = ['urgent', 'exam', 'makeup', 'etc'] as const
type NoticeType = typeof NOTICE_TYPES[number]

async function assertProfessor () {
  const user = await getCurrentUser()
  if (user?.role !== '교수') {
    throw new Error('교수만 이 작업을 수행할 수 있습니다.')
  }
}

export async function addLmsLecture (lectureId: number, formData: FormData) {
  await assertProfessor()

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

  const lecture = createLmsLecture(lectureId, {
    title: title.trim(),
    content: getStr('content'),
    openedAt: openedAt.trim(),
    deadline: deadline.trim(),
    linkUrl: getStr('linkUrl'),
  })

  await syncCampusVod({
    lectureId: lecture.courseId,
    vodId: lecture.lmsLectureId,
    title: lecture.title,
    content: lecture.content ?? undefined,
    uploadAt: lecture.openedAt ?? openedAt.trim(),
    dueAt: lecture.deadline ?? deadline.trim(),
    url: lecture.linkUrl ?? undefined,
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

  const assignment = createAssignment(lectureId, {
    title: title.trim(),
    description: getStr('description'),
    deadline: deadline.trim(),
    linkUrl: getStr('linkUrl'),
  })

  await syncCampusAssignment({
    lectureId: String(lectureId),
    assignmentId: String(assignment.id),
    title: assignment.title,
    description: assignment.description ?? undefined,
    dueAt: assignment.dueAt,
    link: assignment.linkUrl ?? undefined,
  })

  revalidatePath(`/lecture/${lectureId}`)
}

export async function addNotice (lectureId: number, formData: FormData) {
  await assertProfessor()

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

  const notice = createNotice(lectureId, {
    title: title.trim(),
    content: content.trim(),
    postedAt: getStr('postedAt'),
    linkUrl: getStr('linkUrl'),
  })

  await syncCampusNotice({
    lectureId: notice.courseId,
    noticeId: notice.noticeId,
    title: notice.title,
    content: notice.content ?? '',
    type: type as NoticeType,
    createdAt: notice.postedAt,
  })

  revalidatePath(`/lecture/${lectureId}`)
}
