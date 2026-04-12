'use client'

import { useRef, useState } from 'react'

import { addLmsLecture } from '../actions'

const INPUT_CLASS = 'rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 w-full'
const LABEL_CLASS = 'text-sm font-semibold text-zinc-700'

export function AddLectureForm ({ lectureId }: { lectureId: number }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit (formData: FormData) {
    setPending(true)
    try {
      await addLmsLecture(lectureId, formData)
      formRef.current?.reset()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button
        className='rounded-xl border border-blue-400 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors
                   cursor-pointer'
        onClick={() => setOpen((v) => !v)}
        type='button'
      >
        {open ? '취소' : '+ 강의 추가'}
      </button>

      {open && (
        <form
          action={handleSubmit}
          className='mt-3 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4'
          ref={formRef}
        >
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='lec-title'>제목 *</label>
            <input className={INPUT_CLASS} id='lec-title' name='title' placeholder='강의 제목' required type='text' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='lec-content'>설명</label>
            <input className={INPUT_CLASS} id='lec-content' name='content' placeholder='강의 설명' type='text' />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1'>
              <label className={LABEL_CLASS} htmlFor='lec-openedAt'>공개일</label>
              <input className={INPUT_CLASS} id='lec-openedAt' name='openedAt' type='datetime-local' />
            </div>
            <div className='flex flex-col gap-1'>
              <label className={LABEL_CLASS} htmlFor='lec-deadline'>마감일</label>
              <input className={INPUT_CLASS} id='lec-deadline' name='deadline' type='datetime-local' />
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='lec-linkUrl'>외부 링크</label>
            <input className={INPUT_CLASS} id='lec-linkUrl' name='linkUrl' placeholder='https://...' type='url' />
          </div>
          <button
            className='mt-1 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50'
            disabled={pending}
            type='submit'
          >
            {pending ? '저장 중...' : '강의 추가'}
          </button>
        </form>
      )}
    </div>
  )
}
