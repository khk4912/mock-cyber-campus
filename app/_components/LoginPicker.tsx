import { loginAs } from '@/app/actions'
import { listUsers } from '@/lib/db'
import Link from 'next/link'

export function LoginPicker () {
  const users = listUsers()

  return (
    <section className='flex flex-1 flex-col items-center justify-center px-6 py-10 gap-10'>
      <div
        className='w-full max-w-3xl rounded-3xl border border-zinc-200
                  bg-white p-8 shadow-sm'
      >
        <div className='mb-8 flex items-center gap-5'>
          <div>
            <h1 className='text-3xl font-extrabold text-zinc-900'>
              로그인할 계정을 선택해주세요
            </h1>
          </div>
        </div>

        <ul className='grid gap-3 md:grid-cols-2'>
          {users.map((user) => (
            <li key={user.id}>
              <form action={loginAs}>
                <input name='userId' type='hidden' value={user.id} />
                <button
                  className='flex w-full cursor-pointer items-center
                            justify-between rounded-2xl border border-zinc-200
                            px-5 py-4 text-left transition-colors
                            hover:border-gachon-blue hover:bg-sky-50'
                  type='submit'
                >
                  <div>
                    <p className='text-lg font-bold text-zinc-900'>
                      {user.displayName}
                    </p>
                    <p className='text-sm text-zinc-500'>
                      {user.username} · {user.role}
                    </p>
                  </div>
                  <span
                    className='rounded-full bg-gachon-blue px-3 py-1
                              text-sm font-semibold text-white'
                  >
                    로그인
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>

      <Link href='/debug/add_user'>
        <button className='cursor-pointer'>
          유저 추가하기
        </button>
      </Link>
    </section>
  )
}
