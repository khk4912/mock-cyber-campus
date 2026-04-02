import { getCurrentUser } from '@/lib/auth'
import { listCurrentTeachings, listLecturesForUser } from '@/lib/db'
import { Sidebar } from './_components/Sidebar'
import { LectureView } from './_components/LectureView'
import { LoginPicker } from './_components/LoginPicker'
import { TeachingView } from './_components/TeachingView'

export default async function Home () {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <LoginPicker />
  }

  if (currentUser.role === '교수') {
    const teachings = listCurrentTeachings(currentUser.id)

    return (
      <>
        <Sidebar />
        <TeachingView lectures={teachings} />
      </>
    )
  }

  const lectures = listLecturesForUser(currentUser.id)
  return (
    <>
      <Sidebar />
      <LectureView lectures={lectures} />
    </>
  )
}
