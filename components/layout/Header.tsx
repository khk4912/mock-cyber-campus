import Image from 'next/image'

import { logout } from '@/app/actions'
import type { MockUser } from '@/lib/db'

type NavBarProps = {
  user: MockUser
}

export function NavBar ({ user }: NavBarProps) {
  return (
    <nav
      className='sticky top-0 z-10 flex w-full justify-between
                bg-gachon-blue px-8 py-3 text-white
                not-md:justify-center'
    >
      <div className='self-center not-md:hidden'>
        <Image
          src='/logo.svg'
          alt='가천대학교 로고'
          width={140} height={40}
          className='w-auto h-auto'
          unoptimized
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
          <div className='flex flex-col leading-tight'>
            <span className='text-xs font-semibold'>{user.displayName}</span>
            <span className='text-[11px] text-blue-100'>{user.role}</span>
          </div>
        </div>
        <form action={logout}>
          <button
            className='cursor-pointer rounded  bg-gray-400
                      px-4 py-2 text-xs text-white transition-colors
                      hover:bg-gray-400'
            type='submit'
          >
            로그아웃
          </button>
        </form>
      </div>
    </nav>
  )
}
