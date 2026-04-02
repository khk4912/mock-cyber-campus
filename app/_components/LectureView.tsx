import Image from 'next/image'

type LectureItemProps = {
  title: string
  professor: string
  lectureID?: number
  semester?: string
}

function LectureItem (props: LectureItemProps) {
  const { title, professor, semester, lectureID } = props

  return (
    <li className='px-6 py-6 flex gap-4 cursor-pointer items-center'>
      <div className='flex gap-2 text-sm'>
        <span className='bg-blue-200 px-2 py-1 rounded'>교과 과정</span>
        <span className='bg-gray-300 px-2 py-1 rounded'>{semester ?? '2026-1'}</span>
      </div>
      <span className='text-lg'>{title} {lectureID ? `(${lectureID})` : ''}</span>
      <span className='text-gray-400 ml-2 text-sm'>{professor}</span>
    </li>
  )
}

export function LectureView () {
  return (

    <section
      className='flex flex-col flex-1
                bg-zinc-50 h-screen
                  px-10 py-12 gap-6'
    >
      <div className='flex gap-3'>
        <Image src='/icons/tv.svg' alt='강좌 아이콘' width={28} height={28} unoptimized />
        <h1 className='font-extrabold text-3xl'>강좌 전체보기</h1>
      </div>
      <div className='rounded-2xl border border-gray-300 bg-white
                      w-full h-fit'
      >
        <ul className='flex flex-col divide-y divide-zinc-300 justify-center'>
          <LectureItem title='고급웹프로그래밍' professor='홍길동' lectureID={12345} />
          <LectureItem title='모바일프로그래밍' professor='홍길동' lectureID={23456} />
        </ul>
      </div>
    </section>
  )
}
