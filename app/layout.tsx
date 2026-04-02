import type { Metadata } from 'next'
import localFont from 'next/font/local'

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

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='ko'
      className={`${Pretendard.variable} h-full antialiased`}
    >
      <body className='min-h-full flex-col'>
        <NavBar />
        <main className='flex bg-zinc-50'>
          {children}
        </main>
      </body>
    </html>
  )
}
