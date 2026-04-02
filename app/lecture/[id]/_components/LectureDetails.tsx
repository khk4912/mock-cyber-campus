import Image from 'next/image'

import { getAssignments, getLectureInfo } from '@/lib/db'
import { LectureError } from './LectureError'
import { Sidebar } from '@/app/_components/Sidebar'

type AssignmentProp = { title: string, description: string, dueAt: string }
function Assignment ({ title, description, dueAt }: AssignmentProp) {
  return (
    <div className='flex gap-4 py-8 cursor-pointer'>
      <Image
        src='/icons/assignment.svg'
        width={40} height={40} alt='Assignment icon'
        unoptimized
      />
      <div className='flex flex-col'>
        <h3 className='font-semibold text-lg'>{title}</h3>
        <span className='max-w-80 overflow-hidden text-ellipsis'>{description}</span>
      </div>
      <span
        className='text-sm text-red-500 self-center ml-5'
      >(~ {dueAt})
      </span>
    </div>
  )
}

export function LectureDetails ({ id }: { id: number }) {
  const lecture = getLectureInfo(id)

  if (lecture === null) {
    return <LectureError message='알 수 없는 강좌 ID입니다.' />
  }

  const { title: lectureTitle, code: lectureCode, instructorName } = lecture
  const assignments = getAssignments(id)

  return (
    <>
      <Sidebar />
      <section className='flex-1'>
        <div className='h-15 flex items-center px-5 py-6'>
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
              width={40} height={40}
              className='rounded-full object-cover'
            />
            <span>{instructorName} 교수 </span>
          </div>
        </header>

        <main className='h-full py-10 px-10'>
          <div className='
          border border-gray-300 rounded-2xl bg-white
          py-10 px-10
          flex flex-col'
          >
            <h1 className='text-2xl font-bold'>
              주차 별 학습 활동 (과제)
            </h1>
            <div className='flex flex-col divide-y divide-gray-300'>
              {assignments.map((val) => {
                const { title, description, dueAt, id } = val
                return <Assignment key={id} title={title} description={description ?? ''} dueAt={dueAt} />
              })}
            </div>
          </div>
        </main>
      </section>
    </>
  )
}
