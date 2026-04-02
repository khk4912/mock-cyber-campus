import Link from 'next/link'
import Image from 'next/image'

type ItemProps = {
  title: string
  iconSrc: string
}
function Item (props: ItemProps) {
  const { title, iconSrc } = props
  return (
    <li className='side-item flex gap-3 h-10 items-center py-7 px-4
                   hover:bg-zinc-300 cursor-pointer transition-colors'
    >
      <Image
        src={iconSrc}
        alt={title} width={20} height={20}
        unoptimized
      />
      <h2 className='font-bold'>{title}</h2>
    </li>
  )
}

export function Sidebar () {
  return (
    <aside
      className='w-50 pt-1 border-r border-zinc-300
                bg-zinc-200 not-md:hidden'
    >
      <ul className='flex flex-col sidebar
                    divide-y divide-zinc-300'
      >
        <Link href='/'><Item title='My Page' iconSrc='/icons/side_pfp.svg' /></Link>
        <Link href='/'><Item title='교과과정' iconSrc='/icons/side_hat.svg' /></Link>
        <Link href='/'><Item title='비교과 과정' iconSrc='/icons/side_pfp.svg' /></Link>
        <Link href='/'><Item title='온라인 수료과정' iconSrc='/icons/side_hat.svg' /></Link>

      </ul>
    </aside>
  )
}
