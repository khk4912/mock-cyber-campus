'use client'
import { useRouter } from 'next/navigation'

export function LectureError ({ message }: { message: string }) {
  const router = useRouter()

  return (
    <section className='flex flex-col w-screen h-60 items-center justify-center gap-3'>
      <h1 className='font-semibold text-3xl'>{message}</h1>
      <button
        className='bg-white border-gray-200 border
                     py-2 px-2 rounded-xl cursor-pointer'
        onClick={() => { router.back() }}
      >
        돌아가기
      </button>
    </section>
  )
}
