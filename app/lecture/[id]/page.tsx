import { LectureError } from './_components/LectureError'

type LecturePageProps = { params: Promise<{ id: string }> }

export default async function LecturePage ({ params }: LecturePageProps) {
  const { id } = await params
  const nID = Number(id)

  if (Number.isNaN(nID)) {
    return <LectureError message='잘못된 강좌 ID입니다.' />
  }
}
