import Image from 'next/image'
import Link from 'next/link'

import { getAssignments, getLectureInfo, getLmsLectures, listLmsNoticesByCourse } from '@/lib/db'
import type { LmsLectureSummary, LmsNoticeSummary } from '@/lib/db'
import { Sidebar } from '@/app/_components/Sidebar'
import { AddAssignmentForm } from './AddAssignmentForm'
import { AddLectureForm } from './AddLectureForm'
import { AddNoticeForm } from './AddNoticeForm'
import { LectureError } from './LectureError'

type WeekItem =
  | { kind: 'lecture'; date: string | null; data: LmsLectureSummary }
  | { kind: 'assignment'; date: string | null; data: ReturnType<typeof getAssignments>[number] }

type WeekGroup = {
  weekNumber: number | null
  items: WeekItem[]
}

function groupItemsByWeek (
  lectures: LmsLectureSummary[],
  assignments: ReturnType<typeof getAssignments>
): WeekGroup[] {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000

  const datedLectures = lectures.filter((l) => l.openedAt !== null)
  const minTime = datedLectures.length > 0
    ? Math.min(...datedLectures.map((l) => new Date(l.openedAt!).getTime()))
    : null

  const getWeek = (dateStr: string | null): number | null => {
    if (dateStr === null || minTime === null) return null
    return Math.floor((new Date(dateStr).getTime() - minTime) / WEEK_MS) + 1
  }

  const groups = new Map<number | null, WeekItem[]>()
  const add = (week: number | null, item: WeekItem) => {
    if (!groups.has(week)) groups.set(week, [])
    groups.get(week)!.push(item)
  }

  for (const l of lectures) {
    add(getWeek(l.openedAt), { kind: 'lecture', date: l.openedAt, data: l })
  }
  for (const a of assignments) {
    add(getWeek(a.dueAt), { kind: 'assignment', date: a.dueAt, data: a })
  }

  for (const items of groups.values()) {
    items.sort((a, b) => {
      if (a.date === null && b.date === null) return 0
      if (a.date === null) return 1
      if (b.date === null) return -1
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }

  const numbered = [...groups.entries()]
    .filter(([k]) => k !== null)
    .sort(([a], [b]) => (a as number) - (b as number))
    .map(([weekNumber, items]) => ({ weekNumber, items }))

  const undated = groups.has(null) ? [{ weekNumber: null, items: groups.get(null)! }] : []
  return [...numbered, ...undated]
}

const ROW_CLASS = 'flex cursor-pointer gap-4 py-4 hover:bg-gray-100 transition-colors rounded-2xl px-2'

function WeekItemRow ({ item, lectureId }: { item: WeekItem; lectureId: number }) {
  if (item.kind === 'lecture') {
    const { title, content, deadline, linkUrl } = item.data
    const inner = (
      <div className={ROW_CLASS}>
        <Image
          src='/icons/lecture.svg'
          width={40}
          height={40}
          alt='Lecture icon'
          className='w-auto h-auto'
          unoptimized
        />
        <div className='flex flex-col'>
          <h3 className='font-semibold'>{title}</h3>
          <span className='max-w-80 text-sm truncate text-zinc-500'>{content ?? ''}</span>
        </div>
        {deadline && (
          <span className='text-sm text-red-500 self-center ml-5'>(~ {deadline})</span>
        )}
      </div>
    )
    return linkUrl
      ? <a href={linkUrl} target='_blank' rel='noreferrer'>{inner}</a>
      : <div>{inner}</div>
  }

  const { title, description, dueAt, id } = item.data
  return (
    <Link href={`/lecture/${lectureId}/assignment/${id}`}>
      <div className={ROW_CLASS}>
        <Image
          src='/icons/assignment.svg'
          width={40}
          height={40}
          alt='Assignment icon'
          className='w-auto h-auto'
          unoptimized
        />
        <div className='flex flex-col'>
          <h3 className='font-semibold'>{title}</h3>
          <span className='max-w-80 text-sm truncate text-zinc-500'>{description ?? ''}</span>
        </div>
        <span className='text-sm text-red-500 self-center ml-5'>(~ {dueAt})</span>
      </div>
    </Link>
  )
}

function WeekSection ({ group, lectureId }: { group: WeekGroup; lectureId: number }) {
  const label = group.weekNumber !== null ? `${group.weekNumber}주차` : '날짜 미정'
  return (
    <div className='flex flex-col'>
      <h2 className='font-bold mt-4'>{label}</h2>
      <div className='flex flex-col my-2 ml-1'>
        {group.items.map((item) => (
          <WeekItemRow
            key={item.kind === 'lecture' ? `lecture-${item.data.lmsLectureId}` : `assignment-${item.data.id}`}
            item={item}
            lectureId={lectureId}
          />
        ))}
      </div>
    </div>
  )
}

function NoticeRow ({ notice }: { notice: LmsNoticeSummary }) {
  const inner = (
    <div className='flex flex-col gap-1 rounded-2xl px-3 py-4 transition-colors hover:bg-gray-100'>
      <div className='flex items-center justify-between gap-4'>
        <h3 className='font-semibold text-zinc-900'>{notice.title}</h3>
        <span className='shrink-0 text-sm text-zinc-500'>{notice.postedAt}</span>
      </div>
      <p className='line-clamp-2 text-sm leading-6 text-zinc-600'>
        {notice.content ?? '내용이 없습니다.'}
      </p>
    </div>
  )

  return notice.linkUrl
    ? <a href={notice.linkUrl} target='_blank' rel='noreferrer'>{inner}</a>
    : inner
}

export function LectureDetails ({ id, isProf }: { id: number; isProf: boolean }) {
  const lecture = getLectureInfo(id)

  if (lecture === null) {
    return <LectureError message='알 수 없는 강좌 ID입니다.' />
  }

  const {
    title: lectureTitle,
    code: lectureCode,
    instructorName,
    description,
  } = lecture

  const lmsLectures = getLmsLectures(id)
  const assignments = getAssignments(id)
  const notices = listLmsNoticesByCourse(String(id))
  const weekGroups = groupItemsByWeek(lmsLectures, assignments)

  return (
    <>
      <Sidebar />
      <section className='flex-1'>
        <div className='flex items-center px-5 py-6 text-sm text-zinc-500'>
          {lectureTitle} ({lectureCode}) [{instructorName}]
        </div>
        <header className='h-50 bg-[url(/images/lxp_skin_sky.svg)]
                           flex flex-col gap-3 justify-center items-baseline
                            px-10 py-30'
        >
          <h1 className='text-3xl font-bold'>
            {lectureTitle} ({lectureCode})
            에 오신 것을 환영합니다.
          </h1>
          <div className='flex gap-3 items-center'>
            <Image
              src='/images/f1.png'
              alt='프로필 이미지'
              width={40}
              height={40}
              className='rounded-full object-cover'
            />
            <div className='flex flex-col gap-1 text-sm text-zinc-700'>
              <span>{instructorName} 교수</span>
            </div>
          </div>
        </header>

        <main className='py-10 px-10 flex flex-col gap-6'>
          <div className='mb-6 rounded-2xl border border-gray-300 bg-white px-10 py-8'>
            <h2 className='mb-3 text-2xl font-bold'>강의 소개</h2>
            <p className='text-sm leading-7 text-zinc-600'>
              {description ?? '등록된 강의 설명이 없습니다.'}
            </p>
          </div>

          <div className='rounded-2xl border border-gray-300 bg-white px-10 py-8'>
            <div className='mb-3 flex items-center justify-between gap-4'>
              <h2 className='text-2xl font-bold'>공지사항</h2>
              {isProf && <AddNoticeForm lectureId={lecture.id} />}
            </div>
            <div className='divide-y divide-zinc-200'>
              {notices.length === 0
                ? <p className='text-sm text-zinc-500'>등록된 공지가 없습니다.</p>
                : notices.map((notice) => (
                  <NoticeRow key={notice.noticeId} notice={notice} />
                ))}
            </div>
          </div>

          <div className='border border-gray-300 rounded-2xl bg-white py-10 px-10 flex flex-col'>
            <div className='flex items-center justify-between mb-2'>
              <h1 className='text-2xl font-bold'>주차 별 학습 활동</h1>
              {isProf && (
                <div className='flex gap-2'>
                  <AddLectureForm lectureId={lecture.id} />
                  <AddAssignmentForm lectureId={lecture.id} />
                </div>
              )}
            </div>
            <div className='divide-y divide-zinc-200'>
              {weekGroups.length === 0
                ? <p className='text-sm text-zinc-500 mt-4'>등록된 콘텐츠가 없습니다.</p>
                : weekGroups.map((group) => (
                  <WeekSection key={group.weekNumber ?? 'undated'} group={group} lectureId={lecture.id} />
                ))}
            </div>
          </div>
        </main>
      </section>
    </>
  )
}
