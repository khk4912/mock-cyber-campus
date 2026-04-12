import Image from 'next/image'
import Link from 'next/link'

import type { UserLecture } from '@/lib/db'

type LectureItemProps = {
  lecture: UserLecture
}

function LectureItem ({ lecture }: LectureItemProps) {
  const {
    title,
    instructorName,
    semester,
  } = lecture

  return (
    <Link href={`/lecture/${lecture.id}`}>
      <li className='flex cursor-pointer items-center gap-4 px-6 py-6 hover:bg-gray-50 transition-colors'>
        <div className='flex gap-2 text-sm'>
          <span className='bg-blue-200 px-2 py-1 shrink-0 rounded'>교과 과정</span>
          <span className='bg-gray-300 px-2 py-1 shrink-0 rounded'>{semester}</span>
        </div>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className='text-lg text-zinc-900'>
              {title}
            </span>
            <span className='text-sm text-zinc-400'>{instructorName}</span>
          </div>
        </div>
      </li>
    </Link>
  )
}

type TeachingViewProps = { lectures: UserLecture[] }
export function TeachingView ({ lectures }: TeachingViewProps) {
  return (
    <section
      className='flex flex-col flex-1
                bg-zinc-50 h-screen
                  px-10 py-12 gap-6'
    >
      <div className='flex gap-3'>
        <Image src='/icons/tv.svg' alt='강좌 아이콘' width={20} height={20} className='w-8 h-auto' unoptimized />
        <h1 className='font-extrabold text-3xl'>강좌 전체보기</h1>
      </div>
      <div className='rounded-2xl border border-gray-300 bg-white
                      w-full h-fit'
      >
        {lectures.length > 0
          ? (
            <ul className='flex flex-col divide-y divide-zinc-300 justify-center'>
              {lectures.map((lecture) => (
                <LectureItem key={lecture.id} lecture={lecture} />
              ))}
            </ul>
            )
          : (
            <div className='px-6 py-10 text-sm text-zinc-500'>
              강의 중인 강의가 없습니다.
            </div>
            )}
      </div>
    </section>
  )
}
