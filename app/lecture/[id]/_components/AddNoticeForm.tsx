'use client'

import { useRef, useState } from 'react'

import { addNotice } from '../actions'

const INPUT_CLASS = 'rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 w-full'
const LABEL_CLASS = 'text-sm font-semibold text-zinc-700'

export function AddNoticeForm ({ lectureId }: { lectureId: number }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit (formData: FormData) {
    setPending(true)
    try {
      await addNotice(lectureId, formData)
      formRef.current?.reset()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button
        className='rounded-xl border border-emerald-500 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50'
        onClick={() => setOpen((v) => !v)}
        type='button'
      >
        {open ? '취소' : '+ 공지 추가'}
      </button>

      {open && (
        <form
          action={handleSubmit}
          className='mt-3 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4'
          ref={formRef}
        >
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='notice-title'>제목 *</label>
            <input className={INPUT_CLASS} id='notice-title' name='title' placeholder='공지 제목' required type='text' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='notice-content'>내용 *</label>
            <textarea className={`${INPUT_CLASS} min-h-24 resize-y`} id='notice-content' name='content' placeholder='공지 내용' required />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1'>
              <label className={LABEL_CLASS} htmlFor='notice-type'>유형</label>
              <select className={INPUT_CLASS} defaultValue='etc' id='notice-type' name='type'>
                <option value='etc'>일반</option>
                <option value='urgent'>긴급</option>
                <option value='exam'>시험</option>
                <option value='makeup'>보강</option>
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <label className={LABEL_CLASS} htmlFor='notice-postedAt'>작성일</label>
              <input className={INPUT_CLASS} id='notice-postedAt' name='postedAt' type='datetime-local' />
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <label className={LABEL_CLASS} htmlFor='notice-linkUrl'>외부 링크</label>
            <input className={INPUT_CLASS} id='notice-linkUrl' name='linkUrl' placeholder='https://...' type='url' />
          </div>
          <button
            className='mt-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50'
            disabled={pending}
            type='submit'
          >
            {pending ? '저장 중...' : '공지 추가'}
          </button>
        </form>
      )}
    </div>
  )
}
