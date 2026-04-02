import Image from 'next/image'
import Link from 'next/link'

import { getAssignments, getLectureInfo } from '@/lib/db'
import { LectureError } from './LectureError'
import { Sidebar } from '@/app/_components/Sidebar'

type AssignmentProp = {
  lectureId: number
  title: string
  description: string
  dueAt: string
  id: number
}

function Assignment ({ lectureId, title, description, dueAt, id }: AssignmentProp) {
  return (
    <Link href={`/lecture/${lectureId}/assignment/${id}`}>
      <div className='flex cursor-pointer gap-4 py-8'>
        <Image
          src='/icons/assignment.svg'
          width={40}
          height={40}
          alt='Assignment icon'
          className='w-auto h-auto'
          unoptimized
        />
        <div className='flex flex-col'>
          <h3 className='font-semibold text-lg'>{title}</h3>
          <span className='max-w-80 truncate text-zinc-500'>{description}</span>
        </div>
        <span
          className='text-sm text-red-500 self-center ml-5'
        >(~ {dueAt})
        </span>
      </div>
    </Link>
  )
}

export function LectureDetails ({ id }: { id: number }) {
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
  const assignments = getAssignments(id)

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

        <main className='py-10 px-10'>
          <div className='mb-6 rounded-2xl border border-gray-300 bg-white px-10 py-8'>
            <h2 className='mb-3 text-2xl font-bold'>강의 소개</h2>
            <p className='text-sm leading-7 text-zinc-600'>
              {description ?? '등록된 강의 설명이 없습니다.'}
            </p>
          </div>

          <div className='border border-gray-300 rounded-2xl bg-white py-10 px-10 flex flex-col'>
            <h1 className='text-2xl font-bold'>
              주차 별 학습 활동 (과제)
            </h1>
            <div className='flex flex-col divide-y divide-gray-300'>
              {assignments.map((val) => {
                const { title, description, dueAt, id } = val
                return (
                  <Assignment
                    key={id}
                    lectureId={lecture.id}
                    title={title}
                    description={description ?? ''}
                    dueAt={dueAt}
                    id={id}
                  />
                )
              })}
            </div>
          </div>
        </main>
      </section>
    </>
  )
}
