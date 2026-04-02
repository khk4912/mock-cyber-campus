import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { getCurrentUser } from '@/lib/auth'
import { NavBar } from '@/components/layout/Header'
import './globals.css'

const Pretendard = localFont({
  src: '../fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cyber Campus',
  description: '가상 사이버 캠퍼스입니다.',
}

export default async function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser()

  return (
    <html
      lang='ko'
      className={`${Pretendard.variable} h-full antialiased`}
    >
      <body className='min-h-screen flex flex-col'>
        {currentUser ? <NavBar user={currentUser} /> : null}
        <main className='flex flex-1 bg-zinc-50'>
          {children}
        </main>
      </body>
    </html>
  )
}
