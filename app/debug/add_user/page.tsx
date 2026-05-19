import { redirect } from 'next/navigation'

import { addUser, listUsers, type UserRole } from '@/lib/db'

const roleOptions: UserRole[] = ['학생', '교수']

export default async function AddUserDebugPage () {
  const users = await listUsers()

  async function createUser (formData: FormData) {
    'use server'

    const usernameValue = formData.get('username')
    const displayNameValue = formData.get('displayName')
    const roleValue = formData.get('role')

    if (
      typeof usernameValue !== 'string' ||
      typeof displayNameValue !== 'string' ||
      typeof roleValue !== 'string' ||
      !roleOptions.includes(roleValue as UserRole)
    ) {
      throw new Error('invalid form data')
    }

    await addUser({
      username: usernameValue,
      displayName: displayNameValue,
      role: roleValue as UserRole,
    })

    redirect('/debug/add_user')
  }

  return (
    <section className='mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-10'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-3xl font-black text-zinc-950'>유저 추가</h1>
      </header>

      <div className='grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]'>
        <form
          action={createUser}
          className='flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm'
        >
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-semibold text-zinc-700' htmlFor='username'>
              username
            </label>
            <input
              className='rounded-2xl border border-zinc-300 px-4 py-3 outline-none transition-colors focus:border-gachon-blue'
              id='username'
              name='username'
              placeholder='유저 이름'
              required
              type='text'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-semibold text-zinc-700' htmlFor='displayName'>
              display_name
            </label>
            <input
              className='rounded-2xl border border-zinc-300 px-4 py-3 outline-none transition-colors focus:border-gachon-blue'
              id='displayName'
              name='displayName'
              placeholder='사용자 표시 이름'
              required
              type='text'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-semibold text-zinc-700' htmlFor='role'>
              role
            </label>
            <select
              className='rounded-2xl border border-zinc-300 px-4 py-3 outline-none transition-colors focus:border-gachon-blue'
              defaultValue='학생'
              id='role'
              name='role'
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <button
            className='mt-2 cursor-pointer rounded-2xl bg-gachon-blue px-4 py-3 font-semibold text-white transition-colors hover:opacity-90'
            type='submit'
          >
            사용자 추가
          </button>
        </form>

        <div className='rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-bold text-zinc-900'>Current Users</h2>
            <span className='rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-600'>
              {users.length}명
            </span>
          </div>

          <ul className='flex flex-col divide-y divide-zinc-200'>
            {users.map((user) => (
              <li key={user.id} className='flex items-center justify-between gap-4 py-4'>
                <div className='min-w-0'>
                  <p className='truncate font-semibold text-zinc-900'>
                    {user.displayName}
                  </p>
                  <p className='truncate text-sm text-zinc-500'>
                    @{user.username} · #{user.id}
                  </p>
                </div>
                <span className='shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700'>
                  {user.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
