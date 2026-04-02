import Image from 'next/image'

type ItemProps = {
  title: string
  iconSrc?: string
}
function Item (props: ItemProps) {
  const { title, iconSrc } = props
  return (
    <li className='flex gap-4 h-10 items-center'>
      <Image
        src={iconSrc ?? ''}
        alt={title} width={20} height={20}
      />
      <h2 className='font-semibold'>{title}</h2>
    </li>
  )
}

export function Sidebar () {
  return (
    <aside
      className='w-50 px-4 pt-3
                bg-zinc-200'
    >
      <ul className='flex flex-col gap-1'>
        <Item title='My Page' iconSrc='/images/side_pfp.svg' />
        <Item title='교과과정' iconSrc='/images/side_hat.svg' />
        <Item title='비교과 과정' iconSrc='/images/side_pfp.svg' />
        <Item title='온라인 수료과정' iconSrc='/images/side_hat.svg' />
      </ul>
    </aside>
  )
}
