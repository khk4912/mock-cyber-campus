import Image from 'next/image'

import { getAssignmentInfo, getLectureInfo } from '@/lib/db'
import { LectureError } from '../../_components/LectureError'
import { Sidebar } from '@/app/_components/Sidebar'

type AssignmentPageProps = {
  params: Promise<{
    id: string
    assign_id: string
  }>
}

function SubStatItem ({ title, text } : { title: string, text: string }) {
  return (
    <>
      <span className='text-gray-500 font-bold'>{title}</span>
      <span className=''>{text}</span>
    </>
  )
}
export default async function AssignmentPage ({ params }: AssignmentPageProps) {
  const { id, assign_id: assignId } = await params
  const lectureId = Number(id)
  const assignmentId = Number(assignId)

  if (!Number.isInteger(lectureId)) {
    return <LectureError message='잘못된 강좌 ID입니다.' />
  }

  if (!Number.isInteger(assignmentId)) {
    return <LectureError message='잘못된 과제 ID입니다.' />
  }

  const lecture = await getLectureInfo(lectureId)

  if (!lecture) {
    return <LectureError message='존재하지 않는 강좌입니다.' />
  }

  const assignment = await getAssignmentInfo(lectureId, assignmentId)

  if (!assignment) {
    return <LectureError message='존재하지 않는 과제입니다.' />
  }

  return (
    <>
      <Sidebar />
      <section className='flex flex-1 flex-col gap-4 px-10 py-10'>
        <h1 className='text-3xl font-bold text-zinc-900'>
          {assignment.title}
        </h1>
        <div className='mb-4 rounded-2xl border border-gray-300 bg-white px-10 py-8'>
          <h2 className='mb-3 text-2xl font-bold'>설명</h2>
          <p className='leading-7 text-zinc-600'>
            {assignment.description ?? '등록된 강의 설명이 없습니다.'}
          </p>
        </div>

        <div className='rounded-2xl border border-gray-300 bg-white px-10 py-8
                        flex flex-col'
        >
          <h2 className='mb-3 text-2xl font-bold'>제출 현황</h2>
          <div className='flex py-4 gap-10'>
            <Image
              src='/icons/assign_status.svg'
              alt='status icon'
              width={150}
              height={150}
              unoptimized
            />
            <div className='list-disc grid grid-cols-2 gap-x-10'>
              <SubStatItem title='Attempt number' text='This is attempt 1' />
              <SubStatItem title='Submission status' text='No attempt' />
              <SubStatItem title='Grading status' text='Not graded' />
              <SubStatItem title='Due Date' text={assignment.dueAt} />
            </div>
          </div>

          <button
            className='border border-gray-400
                     bg-white rounded-2xl w-fit py-2 px-4 self-center
                      cursor-pointer hover:bg-gray-200 transition-colors'
          > 제출하기
          </button>
        </div>
      </section>
    </>
  )
}
