import Image from 'next/image'

export function NavBar () {
  return (
    <nav
      className='sticky top-0 w-full h-10 flex justify-between
                bg-gachon-blue text-white
                px-15 py-8
                not-md:justify-center'
    >
      <div className='self-center not-md:hidden'>
        <Image
          src='/logo.svg'
          alt='가천대학교 로고'
          width={140} height={40}
        />
      </div>
      <div className='flex gap-4 self-center '>
        <div className='flex gap-2 items-center'>
          <Image
            src='/images/f2.png'
            alt='프로필 이미지'
            width={30} height={30}
            className='rounded-full object-cover'
          />
          <span className='text-xs'>학생 모드 </span>
        </div>
        <button
          className='bg-gray-500 text-white p-3 y-fit
                      text-xs rounded-2xl
                      cursor-pointer
                      hover:bg-gray-400 transition-colors'
        >
          전환하기
        </button>
      </div>
    </nav>
  )
}
