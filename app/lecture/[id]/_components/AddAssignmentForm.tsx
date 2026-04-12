'use client'

import { useRef, useState } from 'react'

import { addAssignment } from '../actions'

const INPUT_CLASS = 'rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 w-full'
const LABEL_CLASS = 'text-sm font-semibold text-zinc-700'

export function AddAssignmentForm ({ lectureId }: { lectureId: number }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit (formData: FormData) {
    setPending(true)
    try {
      await addAssignment(lectureId, formData)
      formRef.current?.reset()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button
        className='rounded-xl border border-orange-400 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors'
        onClick={() => setOpen((v) => !v)}
        type='button'
      >
        {open ? '취소' : '+ 과제 추가'}
      </button>

      {open && (
        <form
          action={handleSubmit}
          className='mt-3 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4'
          ref={formRef}
        >
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='as-title'>제목 *</label>
            <input className={INPUT_CLASS} id='as-title' name='title' placeholder='과제 제목' required type='text' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='as-description'>설명</label>
            <input className={INPUT_CLASS} id='as-description' name='description' placeholder='과제 설명' type='text' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='as-deadline'>마감일 *</label>
            <input className={INPUT_CLASS} id='as-deadline' name='deadline' required type='datetime-local' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='as-linkUrl'>외부 링크</label>
            <input className={INPUT_CLASS} id='as-linkUrl' name='linkUrl' placeholder='https://...' type='url' />
          </div>
          <button
            className='mt-1 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50'
            disabled={pending}
            type='submit'
          >
            {pending ? '저장 중...' : '과제 추가'}
          </button>
        </form>
      )}
    </div>
  )
}
